import { logBehaviorSyncFailure, BehaviorSyncContext } from "@/lib/firebase/behaviorSyncLogger";

export function runBehaviorSyncLoggerTests() {
  console.log("=== BEHAVIOR SYNC LOGGER PRIVACY & SAFETY TESTS ===");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✓ PASS: ${description}`);
    } else {
      console.error(`  ✗ FAIL: ${description}`);
      throw new Error(`Test failed: ${description}`);
    }
  }

  // Backup global state
  const originalEnv = process.env.NODE_ENV;
  const originalWarn = console.warn;
  let lastConsoleOutput: any = null;

  console.warn = (...args: any[]) => {
    lastConsoleOutput = args;
  };

  // Setup mock localStorage
  const mockStorage: Record<string, string> = {};
  let throwOnGet = false;
  let throwOnSet = false;

  const mockLocalStorage = {
    getItem: (key: string) => {
      if (throwOnGet) throw new Error("Storage get blocked");
      return mockStorage[key] ?? null;
    },
    setItem: (key: string, val: string) => {
      if (throwOnSet) throw new Error("Storage quota exceeded");
      mockStorage[key] = val;
    },
    clear: () => {
      for (const k in mockStorage) delete mockStorage[k];
    },
  };

  (globalThis as any).window = {
    localStorage: mockLocalStorage,
  };

  try {
    // 1. SSR Safety Test
    process.env.NODE_ENV = "development";
    const saveWindow = (globalThis as any).window;
    delete (globalThis as any).window;
    try {
      logBehaviorSyncFailure("loadMemory", "test-user", new Error("SSR test"));
      assert(true, "SSR execution when window is undefined does not throw");
    } finally {
      (globalThis as any).window = saveWindow;
    }

    // 2. UID Redaction Test
    mockLocalStorage.clear();
    lastConsoleOutput = null;
    logBehaviorSyncFailure("ensureExists", "test-user-secret-uid-999", new Error("UID check"));
    assert(
      lastConsoleOutput && !JSON.stringify(lastConsoleOutput).includes("test-user-secret-uid-999"),
      "UID is omitted from console log payload",
    );
    const storedAfterUid = JSON.parse(mockStorage["bhumi.behaviorSyncFailures"] || "[]");
    assert(
      storedAfterUid.length === 1 && !JSON.stringify(storedAfterUid[0]).includes("test-user-secret-uid-999"),
      "UID is omitted from localStorage stored record",
    );

    // 3. Production Error Message Redaction Test
    process.env.NODE_ENV = "production";
    lastConsoleOutput = null;
    logBehaviorSyncFailure("recordCompleted", "test-user", new Error("Sensitive error message detail"));
    assert(
      lastConsoleOutput && lastConsoleOutput[1].errorMessage === undefined,
      "Production console output excludes errorMessage",
    );

    // 4. Development PII & Path & Token Sanitization Test
    process.env.NODE_ENV = "development";
    mockLocalStorage.clear();
    const sensitiveError = new Error(
      "Failure at C:\\fake\\path\\file.ts with user test@example.invalid and token=fake-token-12345\n  at StackFrame1\n  at StackFrame2",
    );
    logBehaviorSyncFailure("recordRecommended", "test-user", sensitiveError);
    const storedDev = JSON.parse(mockStorage["bhumi.behaviorSyncFailures"] || "[]");
    const devMsg = storedDev[0]?.errorMessage || "";
    assert(!devMsg.includes("test@example.invalid"), "Email addresses are redacted");
    assert(!devMsg.includes("C:\\fake\\path\\file.ts"), "File paths are redacted");
    assert(!devMsg.includes("fake-token-12345"), "Tokens/secrets are redacted");
    assert(!devMsg.includes("StackFrame1"), "Stack trace lines are stripped");

    // 5. Bounded Storage Test (Max 20 records)
    mockLocalStorage.clear();
    for (let i = 1; i <= 25; i++) {
      logBehaviorSyncFailure("recordCompleted", "test-user", new Error(`Error number ${i}`));
    }
    const bounded = JSON.parse(mockStorage["bhumi.behaviorSyncFailures"] || "[]");
    assert(bounded.length === 20, "localStorage bounds stored failures to maximum 20 records");
    assert(bounded[19].errorMessage.includes("25"), "Latest record (25th) is preserved");

    // 6. Malformed JSON Recovery Test
    mockStorage["bhumi.behaviorSyncFailures"] = "CORRUPTED_NON_JSON_DATA{{{";
    logBehaviorSyncFailure("loadMemory", "test-user", new Error("After corrupt JSON"));
    const recovered = JSON.parse(mockStorage["bhumi.behaviorSyncFailures"] || "[]");
    assert(recovered.length === 1, "Corrupted JSON recovers safely to a clean single item array");

    // 7. LocalStorage Failure Isolation Test (getItem & setItem errors)
    throwOnGet = true;
    logBehaviorSyncFailure("loadMemory", "test-user", new Error("getItem throw test"));
    assert(true, "Logger does not throw when getItem fails");
    throwOnGet = false;

    throwOnSet = true;
    logBehaviorSyncFailure("loadMemory", "test-user", new Error("setItem throw test"));
    assert(true, "Logger does not throw when setItem fails");
    throwOnSet = false;

    // 8. Non-Error Input Handling Test
    logBehaviorSyncFailure("ensureExists", "test-user", "Raw string error");
    logBehaviorSyncFailure("ensureExists", "test-user", 500);
    logBehaviorSyncFailure("ensureExists", "test-user", null);
    assert(true, "Logger handles non-Error objects (string, number, null) without crashing");

    // 9. Consumer Signature Compatibility Test
    const testSignature: (ctx: BehaviorSyncContext, uid: string, err: unknown) => void = logBehaviorSyncFailure;
    testSignature("recordRecommended", "test-user", new Error("Signature check"));
    assert(true, "Logger function signature matches consumer expectations");

    console.log(`\n=== ALL ${passed}/${total} BEHAVIOR SYNC LOGGER TESTS PASSED ===\n`);
  } finally {
    process.env.NODE_ENV = originalEnv;
    console.warn = originalWarn;
    delete (globalThis as any).window;
  }

  return { passed, total };
}

if (require.main === module) {
  runBehaviorSyncLoggerTests();
}
