import { assertQaStagingAllowed } from '../lib/config/qaConfig.mjs';
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createNextStaticRscAliases } from "./fix-next-static-rsc-paths.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, "..");
const APPROVED_TEMP_BASE = "C:\\Users\\shein\\AppData\\Local\\Temp\\opencode";
const CONFIG_PATH = path.join(WORKSPACE_ROOT, "config", "platform-scope.json");

// 1 & 2. Parse & validate config/platform-scope.json (Fail-closed)
function loadAndValidateScopeConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`[FAIL-CLOSED] Scope config missing at ${CONFIG_PATH}`);
  }

  let raw;
  try {
    raw = fs.readFileSync(CONFIG_PATH, "utf8");
  } catch (err) {
    throw new Error(`[FAIL-CLOSED] Cannot read scope config: ${err.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`[FAIL-CLOSED] Invalid JSON in scope config: ${err.message}`);
  }

  const routes = [...(parsed.pages || []), ...(parsed.apiRoutes || [])];
  if (!routes.length) {
    throw new Error(`[FAIL-CLOSED] No pages or apiRoutes defined in ${CONFIG_PATH}`);
  }

  const explicitExcludes = new Set();
  const explicitIncludes = new Set();

  for (const item of routes) {
    const classification = item.classification || item.platform_classification;
    const policy = item.mobileBuildInclusion || item.mobile_build_policy;

    if (!classification) {
      throw new Error(`[FAIL-CLOSED] Missing platform classification for route: ${item.path}`);
    }
    if (!policy || !["INCLUDE", "EXCLUDE"].includes(policy)) {
      throw new Error(`[FAIL-CLOSED] Missing or invalid mobile build policy for route: ${item.path}`);
    }

    const normalizedPath = item.path.replace(/\\/g, "/");
    if (policy === "EXCLUDE") {
      explicitExcludes.add(normalizedPath);
    } else {
      explicitIncludes.add(normalizedPath);
    }
  }

  return { explicitExcludes, explicitIncludes, parsed };
}

// 3. Setup disposable staging directory
function createStagingDirectory() {
  if (!fs.existsSync(APPROVED_TEMP_BASE)) {
    fs.mkdirSync(APPROVED_TEMP_BASE, { recursive: true });
  }
  const timestamp = Date.now();
  const stagingDir = path.join(APPROVED_TEMP_BASE, `mobile-staging-${timestamp}`);
  fs.mkdirSync(stagingDir, { recursive: true });
  return stagingDir;
}

// 4. File filtering and copy logic
const BASE_DENY = [
  /^\.git/,
  /^\.env/,
  /^\.next/,
  /^out[\\\/]?/,
  /^build[\\\/]?/,
  /^dist[\\\/]?/,
  /^node_modules/,
  /^android[\\\/]app[\\\/]build/,
  /^android[\\\/]\.gradle/,
  /^android[\\\/]keystore\.properties/,
  /^android[\\\/].*\.jks$/,
  /^android[\\\/].*\.keystore$/,
  /^android[\\\/]app[\\\/]google-services\.json/,
  /.*service-account.*\.json$/,
  /.*private-key.*/,
  /.*credentials.*/,
  /.*secret.*/
];

function shouldDeny(relPath, explicitExcludes) {
  const normalized = relPath.replace(/\\/g, "/");

  // Rule 4: Exclude ALL app/api/** route handlers
  if (normalized === "app/api" || normalized.startsWith("app/api/")) {
    return true;
  }

  // Base denies (git, secrets, build outputs)
  for (const pat of BASE_DENY) {
    if (pat.test(normalized)) return true;
  }

  // Check explicit excludes from manifest
  for (const excluded of explicitExcludes) {
    if (normalized === excluded) return true;
    const dirPrefix = excluded.replace(/\/[^/]+$/, "");
    if (dirPrefix.startsWith("app/") && (normalized === dirPrefix || normalized.startsWith(dirPrefix + "/"))) {
      return true;
    }
  }

  return false;
}

const TOP_LEVEL_WHITELIST = [
  "app",
  "components",
  "context",
  "lib",
  "src",
  "public",
  "styles",
  "types",
  "config",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "next.config.ts",
  "next-env.d.ts",
  "postcss.config.mjs",
  "tailwind.config.ts",
  "capacitor.config.ts",
  "scripts"
];

function copyFilteredWorkspace(srcDir, dstDir, explicitExcludes) {
  let copiedCount = 0;

  function copyRecur(src, dst, rel) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      if (shouldDeny(rel, explicitExcludes)) return;
      if (!fs.existsSync(dst)) {
        fs.mkdirSync(dst, { recursive: true });
      }
      for (const entry of fs.readdirSync(src)) {
        const childRel = rel ? `${rel}/${entry}` : entry;
        copyRecur(path.join(src, entry), path.join(dst, entry), childRel);
      }
    } else if (stat.isFile()) {
      if (shouldDeny(rel, explicitExcludes)) return;
      const parentDir = path.dirname(dst);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.copyFileSync(src, dst);
      copiedCount++;
    }
  }

  for (const item of TOP_LEVEL_WHITELIST) {
    const srcPath = path.join(srcDir, item);
    if (fs.existsSync(srcPath)) {
      copyRecur(srcPath, path.join(dstDir, item), item);
    }
  }

  return copiedCount;
}

function linkNodeModules(srcDir, dstDir) {
  const src = path.join(srcDir, "node_modules");
  const dst = path.join(dstDir, "node_modules");
  execSync(`cmd /c mklink /J "${dst}" "${src}"`, { stdio: "pipe" });
}

// 7. Audit output helper
function auditOutputDir(outDir) {
  const results = {
    totalFiles: 0,
    totalHtmlRoutes: 0,
    totalBytes: 0,
    leakedSecrets: [],
    excludedFound: []
  };

  const forbiddenRoutes = ["kenali-diri/aura", "admin", "api", "test-3d-poc"];
  const secretPatterns = [
    /FIREBASE_PRIVATE_KEY/i,
    /GOOGLE_PLAY_PRIVATE_KEY/i,
    /PLAY_REPORTS_PRIVATE_KEY/i,
    /CRON_SECRET/i,
    /BEGIN (RSA )?PRIVATE KEY/i
  ];

  function walk(current) {
    if (!fs.existsSync(current)) return;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(current, ent.name);
      const rel = path.relative(outDir, full).replace(/\\/g, "/");

      if (ent.isDirectory()) {
        for (const fr of forbiddenRoutes) {
          if (rel === fr || rel.startsWith(fr + "/")) {
            results.excludedFound.push(rel);
          }
        }
        walk(full);
      } else if (ent.isFile()) {
        results.totalFiles++;
        const stat = fs.statSync(full);
        results.totalBytes += stat.size;

        if (ent.name.endsWith(".html")) {
          results.totalHtmlRoutes++;
        }

        for (const fr of forbiddenRoutes) {
          if (rel.startsWith(fr + "/") || rel === `${fr}.html`) {
            results.excludedFound.push(rel);
          }
        }

        if (ent.name.endsWith(".js") || ent.name.endsWith(".json")) {
          const content = fs.readFileSync(full, "utf8");
          for (const pattern of secretPatterns) {
            if (pattern.test(content)) {
              results.leakedSecrets.push({ file: rel, pattern: pattern.source });
            }
          }
        }
      }
    }
  }

  walk(outDir);
  return results;
}

async function main() {
  const qaConfig = assertQaStagingAllowed(process.env);
  const isRealQa = qaConfig.mode === "realQA";
  console.log("=================================================");
  console.log("  BHUMI MOBILE DISPOSABLE STAGING BUILD RUNNER   ");
  console.log("=================================================\n");

  console.log("[1/7] Membaca dan memvalidasi config/platform-scope.json...");
  const { explicitExcludes, explicitIncludes } = loadAndValidateScopeConfig();
  console.log(` -> Config valid: ${explicitIncludes.size} included, ${explicitExcludes.size} excluded.`);

  console.log("\n[2/7] Menyiapkan staging directory sekali pakai...");
  const stagingDir = createStagingDirectory();
  console.log(` -> Staging dir: ${stagingDir}`);

  console.log("\n[3/7] Menyalin workspace filtered dan linking node_modules...");
  const copiedCount = copyFilteredWorkspace(WORKSPACE_ROOT, stagingDir, explicitExcludes);
  console.log(` -> Berhasil menyalin ${copiedCount} files ke staging.`);
  if (isRealQa) {
    fs.writeFileSync(path.join(stagingDir, "public", "firebase-messaging-sw.js"), "self.addEventListener('install', () => self.skipWaiting());\nself.addEventListener('activate', event => event.waitUntil(self.registration.unregister()));\n");
  }
  linkNodeModules(WORKSPACE_ROOT, stagingDir);
  console.log(` -> Directory junction node_modules berhasil ditautkan.`);

  console.log("\n[4/7] Menjalankan next build (static export) di staging...");
  const qaBuildEnv = isRealQa ? {
    NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "false",
    NEXT_PUBLIC_USE_AUTH_EMULATOR: "false",
    NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: "true",
    NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: "false",
    NEXT_PUBLIC_ENABLE_ADMIN_UI: "false",
    ENABLE_QA_LOGIN: "false",
    NEXT_PUBLIC_ENABLE_EMULATOR_QA_LOGIN: "false",
    NEXT_PUBLIC_ENABLE_ANDROID_EMULATOR_QA_LOGIN: "false",
    NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA: "false",
    NEXT_PUBLIC_WEB_APP_URL: qaConfig.origins.bootstrap,
    NEXT_PUBLIC_BILLING_VERIFIER_URL: qaConfig.origins.bootstrap,
    NEXT_PUBLIC_APP_EDITION: "standard",
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: qaConfig.projectId,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_EMULATOR_HOST: "127.0.0.1",
    NEXT_PUBLIC_QA_MODE: "realQA",
    BHUMI_QA_MODE: "realQA",
    NEXT_PUBLIC_QA_ANDROID_PACKAGE: qaConfig.packageName,
    NEXT_PUBLIC_QA_FIRESTORE_PROJECT_ID: qaConfig.firestoreProjectId,
    NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID: process.env.NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID,
    NEXT_PUBLIC_HUMAN_DESIGN_API_URL: process.env.NEXT_PUBLIC_HUMAN_DESIGN_API_URL,
    NEXT_PUBLIC_ASTROLOGY_API_URL: process.env.NEXT_PUBLIC_ASTROLOGY_API_URL,
    QA_MODE_ACTIVE: true,
    QA_PROJECT_ID: qaConfig.projectId,
  } : {
    NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "false",
    NEXT_PUBLIC_USE_AUTH_EMULATOR: "false",
    NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: "false",
    NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: "false",
    NEXT_PUBLIC_ENABLE_ADMIN_UI: "false",
    ENABLE_QA_LOGIN: "false",
    NEXT_PUBLIC_ENABLE_EMULATOR_QA_LOGIN: "false",
    NEXT_PUBLIC_ENABLE_ANDROID_EMULATOR_QA_LOGIN: "false",
    NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA: "false",
    NEXT_PUBLIC_WEB_APP_URL: "https://bhumi-amartya-clean.vercel.app",
    NEXT_PUBLIC_BILLING_VERIFIER_URL: process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL || "https://bhumi-billing-verifier.vercel.app",
    NEXT_PUBLIC_APP_EDITION: "standard",
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "synthetic-build-key-non-production",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "synthetic-app.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "synthetic-project-id",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "synthetic-project.appspot.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
    QA_MODE_ACTIVE: false,
    QA_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "synthetic-project-id"
  };
  const env = {
    ...process.env,
    ...qaBuildEnv,
    NEXT_TELEMETRY_DISABLED: "1",
    NODE_ENV: "production",
  };

  delete env.FIREBASE_AUTH_EMULATOR_HOST;
  delete env.FIRESTORE_EMULATOR_HOST;
  delete env.FIREBASE_FUNCTIONS_EMULATOR_HOST;

  const nextBin = path.resolve(stagingDir, "node_modules", "next", "dist", "bin", "next");
  const buildExitCode = await new Promise((res) => {
    const proc = spawn(process.execPath, [nextBin, "build", "--webpack"], {
      stdio: "inherit",
      env,
      cwd: stagingDir
    });
    proc.on("close", (code) => res(code));
  });

  console.log(`\n -> Next build selesai dengan exit code: ${buildExitCode}`);
  if (buildExitCode !== 0) {
    console.error(`[BUILD FAILED] Exit code ${buildExitCode}`);
    process.exit(buildExitCode);
  }

  const outDir = path.join(stagingDir, "out");

  console.log("\n[5/7] Menjalankan createNextStaticRscAliases pada out/...");
  const aliasesCount = await createNextStaticRscAliases(outDir);
  console.log(` -> RSC Aliases dibuat: ${aliasesCount}`);

  console.log("\n[6/7] Menjalankan audit output directory out/...");
  const audit = auditOutputDir(outDir);
  const sizeMb = (audit.totalBytes / (1024 * 1024)).toFixed(2);

  console.log(` -> Total files di out/: ${audit.totalFiles}`);
  console.log(` -> Total exported HTML routes: ${audit.totalHtmlRoutes}`);
  console.log(` -> Total bundle size: ${audit.totalBytes} bytes (${sizeMb} MB)`);

  if (audit.excludedFound.length > 0) {
    console.error(`[AUDIT FAIL] Ditemukan file rute terlarang di out/:`, audit.excludedFound);
    process.exit(1);
  } else {
    console.log(` -> Verifikasi rute terlarang: PASS (0 forbidden routes).`);
  }

  if (audit.leakedSecrets.length > 0) {
    console.error(`[AUDIT FAIL] Terdeteksi bocoran rahasia di client bundle:`, audit.leakedSecrets);
    process.exit(1);
  } else {
    console.log(` -> Pemindaian rahasia/private key: PASS (0 secrets found).`);
  }

  console.log("\n[7/7] BUILD & AUDIT SUMMARY SUCCEEDED");
  console.log(` -> Artifact path: ${outDir}`);
}

main().catch((err) => {
  console.error(`\n[FATAL ERROR] ${err.message}`);
  process.exit(1);
});
