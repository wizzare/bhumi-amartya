import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
let checks = 0;

function check(desc: string, fn: () => void) {
  try {
    fn();
    checks++;
  } catch (err) {
    console.error(`FAIL: ${desc}`);
    throw err;
  }
}

console.log("Running self-check: dashboard Design1 revised invariant test...");

const clientSrc = fs.readFileSync(path.join(ROOT, "components/dashboard/DashboardClient.tsx"), "utf8");
const headerSrc = fs.readFileSync(path.join(ROOT, "components/dashboard/DashboardHeader.tsx"), "utf8");
const soulSrc = fs.readFileSync(path.join(ROOT, "components/dashboard/SoulReflectionCard.tsx"), "utf8");
const cssSrc = fs.readFileSync(path.join(ROOT, "components/dashboard/DashboardClient.module.css"), "utf8");

check("DashboardClient preserves recovery and safety banners", () => {
  assert.ok(clientSrc.includes("<PendingHdRecoveryBanner"), "PendingHdRecoveryBanner preserved");
  assert.ok(clientSrc.includes("<AccuracyUpgradeBanner"), "AccuracyUpgradeBanner preserved");
  assert.ok(clientSrc.includes("<SafetyActionCard"), "SafetyActionCard preserved");
  assert.ok(clientSrc.includes("<AppNav"), "AppNav preserved");
});

check("DashboardClient does NOT render 'KONDISI HARI INI' section or its metrics/CTA", () => {
  assert.ok(!clientSrc.includes("KONDISI HARI INI"), "'KONDISI HARI INI' heading removed");
  assert.ok(!clientSrc.includes("Buka check-in di Wellness"), "'Buka check-in di Wellness' hero link removed");
  assert.ok(!clientSrc.includes("Check-in hari ini belum tersedia"), "'Check-in hari ini belum tersedia' hero copy removed");
  assert.ok(!cssSrc.includes(".hero"), "Hero CSS removed from module");
  assert.ok(!cssSrc.includes(".metrics"), "Metrics CSS removed from module");
});

check("DashboardClient renders Pengakuan Bhumi directly without details/summary disclosure", () => {
  assert.ok(clientSrc.includes("<GuardianIdentityCard"), "GuardianIdentityCard rendered");
  const recognitionMatch = clientSrc.match(/<details[^>]*class=\{styles\.recognition\}/);
  assert.ok(!recognitionMatch, "Pengakuan Bhumi not wrapped in <details>");
  assert.ok(!clientSrc.includes("<summary>Pengakuan Bhumi</summary>"), "Summary for Pengakuan Bhumi removed");
});

check("DashboardClient renders Identitas Inti directly without details/summary disclosure", () => {
  assert.ok(clientSrc.includes("<CoreIdentity"), "CoreIdentity rendered");
  const identityDetailsMatch = clientSrc.match(/<details[^>]*class=\{styles\.identity\}/);
  assert.ok(!identityDetailsMatch, "Identitas Inti not wrapped in <details>");
  assert.ok(!clientSrc.includes("<summary>Lihat identitas inti</summary>"), "Summary for Identitas Inti removed");
});

check("DashboardClient renders revised hierarchy in exact order", () => {
  const headerIndex = clientSrc.indexOf("<DashboardHeader");
  const recognitionIndex = clientSrc.indexOf("<GuardianIdentityCard");
  const identityIndex = clientSrc.indexOf("<CoreIdentity");
  const soulIndex = clientSrc.indexOf("<SoulReflectionCard");
  const actionIndex = clientSrc.indexOf('id="action-title"');
  const astroIndex = clientSrc.indexOf("<AstroTodayCard");
  const envIndex = clientSrc.indexOf("<EnvironmentContextCard");
  const weeklyIndex = clientSrc.indexOf('id="recent-title"');

  assert.ok(headerIndex !== -1, "DashboardHeader present");
  assert.ok(recognitionIndex !== -1, "GuardianIdentityCard present");
  assert.ok(identityIndex !== -1, "CoreIdentity present");
  assert.ok(soulIndex !== -1, "SoulReflectionCard present");
  assert.ok(actionIndex !== -1, "SATU TINDAKAN present");
  assert.ok(astroIndex !== -1, "AstroTodayCard present");
  assert.ok(envIndex !== -1, "EnvironmentContextCard present");
  assert.ok(weeklyIndex !== -1, "MINGGU INI present");

  assert.ok(headerIndex < recognitionIndex, "Header precedes Pengakuan Bhumi");
  assert.ok(recognitionIndex < identityIndex, "Pengakuan Bhumi precedes Identitas Inti");
  assert.ok(identityIndex < soulIndex, "Identitas Inti precedes SoulReflection");
  assert.ok(soulIndex < actionIndex, "SoulReflection precedes SATU TINDAKAN");
  assert.ok(actionIndex < astroIndex, "SATU TINDAKAN precedes Astro");
  assert.ok(astroIndex < envIndex, "Astro precedes Environment");
  assert.ok(envIndex < weeklyIndex, "Environment precedes MINGGU INI");
});

check("Dashboard CSS applies Design0 tokens and controls >= 44px", () => {
  assert.ok(cssSrc.includes("#F7F4EE"), "Cream canvas token used");
  assert.ok(cssSrc.includes("#2D352E"), "Text primary token used");
  assert.ok(cssSrc.includes("#4A5849"), "Deep sage token used");
  assert.ok(cssSrc.includes("#5F6B5E"), "Secondary muted token used");
  assert.ok(cssSrc.includes("44px"), "Interactive targets enforce minimum 44px");
  assert.ok(cssSrc.includes("safe-area-inset-bottom"), "Safe area padding applied");
});

console.log(`PASS: All ${checks} dashboard Design1 revised invariant checks succeeded.`);
