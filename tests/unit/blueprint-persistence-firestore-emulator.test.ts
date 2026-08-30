import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { once } from "node:events";
import path from "node:path";
import { deleteApp, type FirebaseApp } from "firebase/app";
import { signInAnonymously, signOut, type Auth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const PROJECT_ID = "demo-blueprint-persistence";

type JsonRecord = Record<string, unknown>;

function assertLocalEmulators(): void {
  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || "";
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || "";
  const localEndpoint = /^(127\.0\.0\.1|localhost):\d+$/;

  assert.match(firestoreHost, localEndpoint, "local Firestore emulator is required");
  assert.match(authHost, localEndpoint, "local Auth emulator is required");
  assert.equal(process.env.GOOGLE_APPLICATION_CREDENTIALS, undefined, "service-account credentials must not be used");
}

function directNestedArrayPaths(value: unknown, currentPath = "$", found: string[] = []): string[] {
  if (Array.isArray(value)) {
    if (value.some((item) => Array.isArray(item))) found.push(currentPath);
    value.forEach((item, index) => directNestedArrayPaths(item, `${currentPath}[${index}]`, found));
    return found;
  }

  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value as JsonRecord)) {
      directNestedArrayPaths(item, `${currentPath}.${key}`, found);
    }
  }

  return found;
}

async function clearFirestoreEmulator(): Promise<void> {
  const response = await fetch(
    `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: "DELETE" },
  );
  assert.equal(response.ok, true, `emulator clear failed with HTTP ${response.status}`);
}

async function closeServer(server: Server): Promise<void> {
  if (!server.listening) return;
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

async function main(): Promise<void> {
  assertLocalEmulators();
  await clearFirestoreEmulator();

  const humanDesignServer = createServer((request, response) => {
    request.resume();
    request.on("end", () => {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({
        status: "ready",
        type: "Generator",
        strategy: "To Respond",
        authority: "Sacral",
        profile: "4/6",
        definition: "Single Definition",
        incarnationCross: { name: "Synthetic Cross", gates: [1, 2, 3, 4] },
        centers: {},
        gates: [1, 2, 3, 4],
        channels: ["34-20"],
        personalityActivations: [],
        designActivations: [],
      }));
    });
  });

  humanDesignServer.listen(0, "127.0.0.1");
  await once(humanDesignServer, "listening");
  const address = humanDesignServer.address();
  assert.ok(address && typeof address !== "string", "Human Design fixture server did not start");

  Object.assign(process.env, {
    NEXT_PUBLIC_FIREBASE_API_KEY: "synthetic-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: `${PROJECT_ID}.firebaseapp.com`,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_EMULATOR_PROJECT_ID: PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: `${PROJECT_ID}.appspot.com`,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:synthetic",
    NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "false",
    NEXT_PUBLIC_USE_AUTH_EMULATOR: "true",
    NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: "true",
    NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: "false",
    NEXT_PUBLIC_HUMAN_DESIGN_API_URL: `http://127.0.0.1:${address.port}/calculate`,
  });

  let firebaseApp: FirebaseApp | undefined;
  let firebaseAuth: Auth | undefined;

  try {
    const [firebaseConfig, blueprintModule, userModule, generatorModule, astroModule] = await Promise.all([
      import("../../lib/firebase/config"),
      import("../../lib/repositories/blueprintRepository"),
      import("../../lib/repositories/userRepository"),
      import("../../lib/engines/generateBlueprint"),
      import("../../lib/astrocartography/calculateAstrocartography"),
    ]);

    firebaseApp = firebaseConfig.app;
    firebaseAuth = firebaseConfig.auth;
    const credential = await signInAnonymously(firebaseAuth);
    const uid = credential.user.uid;
    assert.equal(firebaseAuth.currentUser?.uid, uid, "authenticated emulator uid must match setup uid");

    const birthInput = {
      birthDate: "1990-06-15",
      birthTime: "08:30",
      birthCity: "Sidoarjo, East Java, Indonesia",
      birthCountry: "Indonesia",
      latitude: -7.4478,
      longitude: 112.7183,
      timezone: "+07:00",
    };
    const recoveryProfile = {
      uid,
      fullName: "Synthetic Recovery User",
      displayName: "Synthetic Recovery User",
      ...birthInput,
      birthPlace: birthInput.birthCity,
      setupCompleted: false,
      blueprintStatus: "recovery_required",
      language: "id" as const,
    };

    await userModule.userRepository.upsertUserProfile(uid, recoveryProfile as never);
    const profileBefore = await userModule.userRepository.getUserProfile(uid);
    assert.equal(profileBefore?.blueprintStatus, "recovery_required", "fixture must start in recovery_required");
    const landingSource = await readFile(path.join(process.cwd(), "app/page.tsx"), "utf8");
    assert.match(landingSource, /else if \(auth\?\.userProfile\?\.setupCompleted\)[\s\S]*?router\.push\("\/dashboard"\)[\s\S]*?else[\s\S]*?router\.push\("\/setup"\)/, "incomplete recovery profile must return to existing setup UI");
    const setupSource = await readFile(path.join(process.cwd(), "app/setup/page.tsx"), "utf8");
    assert.match(setupSource, /blueprintStatus:\s*"recovery_required"/, "setup UI must preserve recovery_required on failed blueprint write");
    assert.match(setupSource, /blueprintStatus:\s*bpSaved\s*\?\s*\("ready"/, "setup UI must set ready after a successful normal resubmit");

    const originalLog = console.log;
    const originalInfo = console.info;
    let generated;
    try {
      console.log = () => undefined;
      console.info = () => undefined;
      generated = await generatorModule.generateBlueprint({
        uid,
        fullName: recoveryProfile.fullName,
        email: null,
        ...birthInput,
      });
    } finally {
      console.log = originalLog;
      console.info = originalInfo;
    }

    for (const requiredSystem of ["numerology", "natalChart", "astrology", "humanDesign", "destinyMatrix", "weton", "bazi", "vedic", "tzolkin", "astrocartography"] as const) {
      assert.ok(generated[requiredSystem], `full generated blueprint must contain ${requiredSystem}`);
    }
    assert.ok(generated.astrocartography?.lines.length, "generated astrocartography must contain lines");
    const generatedNestedPaths = directNestedArrayPaths(generated);
    assert.ok(
      generatedNestedPaths.some((nestedPath) => nestedPath.includes("astrocartography.lines") && nestedPath.includes("coordinates")),
      "fixture must exercise the original astrocartography nested-array failure",
    );

    await blueprintModule.blueprintRepository.saveUserBlueprint(uid, generated);
    const storedSnapshot = await getDoc(doc(firebaseConfig.db, "blueprints", uid));
    assert.equal(storedSnapshot.exists(), true, "full blueprint must be written through the Firestore SDK");
    const storedBlueprint = storedSnapshot.data() as JsonRecord;
    assert.equal(Object.prototype.hasOwnProperty.call(storedBlueprint, "astrocartography"), false, "astrocartography must not be persisted");
    const storedNestedPaths = directNestedArrayPaths(storedBlueprint);
    assert.deepEqual(storedNestedPaths, [], "persisted payload must contain no directly nested arrays anywhere");

    await userModule.userRepository.upsertUserProfile(uid, {
      ...recoveryProfile,
      setupCompleted: true,
      blueprintStatus: "ready",
    } as never);
    const profileAfter = await userModule.userRepository.getUserProfile(uid);
    const normalizedStoredBlueprint = await blueprintModule.blueprintRepository.getUserBlueprint(uid);
    assert.equal(profileAfter?.setupCompleted, true, "normal resubmit must complete setup");
    assert.equal(profileAfter?.blueprintStatus, "ready", "normal resubmit must clear recovery_required");
    assert.equal(normalizedStoredBlueprint?.status, "ready", "saved blueprint must be readable as ready");

    const storedInput = storedBlueprint.input as typeof birthInput;
    const storedNatal = (storedBlueprint.astrology || storedBlueprint.natalChart) as never;
    const recalculatedFirst = astroModule.calculateAstrocartography(storedInput, storedNatal);
    const recalculatedSecond = astroModule.calculateAstrocartography(storedInput, storedNatal);
    assert.deepEqual(recalculatedFirst, recalculatedSecond, "astrocartography recomputation must be deterministic");
    assert.ok(recalculatedFirst.lines.length, "stored birth and natal data must be sufficient to recompute lines");

    const pageSource = await readFile(path.join(process.cwd(), "app/blueprint/astrocartography/page.tsx"), "utf8");
    assert.match(pageSource, /calculateAstrocartography\(birthData,\s*\(stored\?\.astrology \|\| stored\?\.natalChart\)/, "page must recompute from stored birth and natal data");
    assert.doesNotMatch(pageSource, /stored\?\.astrocartography/, "page must not depend on stored astrocartography");

    console.log(
      `P0_BLUEPRINT_FIRESTORE_PERSISTENCE_PASS project=${PROJECT_ID} generatedSystems=10 generatedDirectNestedArrays=${generatedNestedPaths.length} storedDirectNestedArrays=${storedNestedPaths.length} storedAstrocartography=false recoveryBefore=recovery_required recoveryAfter=${profileAfter?.blueprintStatus} routeAfter=dashboard deterministicRecompute=true`,
    );
  } finally {
    if (firebaseAuth) {
      await signOut(firebaseAuth).catch(() => undefined);
    }
    if (firebaseApp) {
      await deleteApp(firebaseApp).catch(() => undefined);
    }
    await closeServer(humanDesignServer);
  }
}

main().catch((error) => {
  console.error("P0_BLUEPRINT_FIRESTORE_PERSISTENCE_FAIL", error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
