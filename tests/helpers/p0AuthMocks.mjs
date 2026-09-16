/**
 * Mock preload for P0 auth skipNativeAuth tests.
 *
 * Loaded via `--import` before the test file. Sets up Firebase env vars
 * and module-level mocks so authActions.ts can be imported in Node.
 */

// ---------------------------------------------------------------------------
// 1. Set Firebase env vars BEFORE any module load
// ---------------------------------------------------------------------------
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test-project.firebaseapp.com";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "test-project.appspot.com";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "123456789";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "1:123456789:web:test";
process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS = "false";
process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR = "false";
process.env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR = "false";
process.env.NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR = "false";

// ---------------------------------------------------------------------------
// 2. Mock state (shared with test via globalThis)
// ---------------------------------------------------------------------------
const g = globalThis;

if (!g.__P0_AUTH_MOCKS__) {
  g.__P0_AUTH_MOCKS__ = {
    signInWithGoogleCalls: [],
    signInWithCredentialCalls: [],
    signInWithGoogleImpl: null,
  };
}

// ---------------------------------------------------------------------------
// 3. Module hook via CJS _load
// ---------------------------------------------------------------------------
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;

Module._load = function (request, parent, isMain, options) {
  // Mock @capacitor/core
  if (request === "@capacitor/core") {
    return {
      Capacitor: {
        isNativePlatform: function () { return true; },
        getPlatform: function () { return "android"; },
      },
      registerPlugin: function () { return {}; },
    };
  }

  // Mock @capacitor/app
  if (request === "@capacitor/app") {
    return {
      App: {
        getInfo: async function () { return { name: "Bhumi", version: "1.0.0", build: "112" }; },
        getState: async function () { return { isActive: true }; },
        addListener: function () { return { remove: function () {} }; },
      },
    };
  }

  // Mock @capacitor-firebase/authentication
  if (request === "@capacitor-firebase/authentication") {
    return {
      FirebaseAuthentication: {
        signInWithGoogle: async function (opts) {
          if (g.__P0_AUTH_MOCKS__.signInWithGoogleImpl) {
            return g.__P0_AUTH_MOCKS__.signInWithGoogleImpl(opts);
          }
          return { credential: { idToken: "mock-id-token", accessToken: "mock-access-token" } };
        },
        signOut: async function () {},
      },
    };
  }

  // Mock firebase/app — return a minimal fake app
  if (request === "firebase/app") {
    const fakeApp = { name: "[DEFAULT]", options: { projectId: "test-project" } };
    return {
      initializeApp: function () { return fakeApp; },
      getApps: function () { return [fakeApp]; },
      getApp: function () { return fakeApp; },
    };
  }

  // Mock firebase/auth
  if (request === "firebase/auth") {
    const fakeApp = { name: "[DEFAULT]", options: { projectId: "test-project" } };
    return {
      getAuth: function () { return { currentUser: null }; },
      signInWithCredential: async function () {
        g.__P0_AUTH_MOCKS__.signInWithCredentialCalls.push(Array.from(arguments));
        return { user: { uid: "mock-uid" } };
      },
      signInWithPopup: async function () { return {}; },
      signInWithRedirect: async function () { return {}; },
      getRedirectResult: async function () { return null; },
      signOut: async function () {},
      setPersistence: async function () {},
      browserLocalPersistence: {},
      onAuthStateChanged: function () { return function () {}; },
      GoogleAuthProvider: {
        credential: function (idToken, accessToken) {
          return { idToken, accessToken, providerId: "google.com", signInMethod: "google.com" };
        },
      },
    };
  }

  // Mock firebase/firestore
  if (request === "firebase/firestore") {
    const fakeDb = {};
    return {
      getFirestore: function () { return fakeDb; },
      Timestamp: { now: function () { return { seconds: 0, nanoseconds: 0 }; } },
      serverTimestamp: function () { return {}; },
      collection: function () { return {}; },
      doc: function () { return {}; },
      setDoc: async function () {},
      getDoc: async function () { return { exists: function () { return false; }, data: function () { return null; } }; },
      updateDoc: async function () {},
      deleteDoc: async function () {},
      onSnapshot: function () { return function () {}; },
      query: function () { return {}; },
      where: function () { return {}; },
      orderBy: function () { return {}; },
      limit: function () { return {}; },
      getDocs: async function () { return { docs: [], empty: true, size: 0 }; },
      writeBatch: function () { return { set: function () {}, update: function () {}, delete: function () {}, commit: async function () {} }; },
      runTransaction: async function (fn) { return fn({}); },
    };
  }

  // Mock firebase/functions
  if (request === "firebase/functions") {
    return {
      getFunctions: function () { return {}; },
      httpsCallable: function () { return async function () { return { data: {} }; }; },
      connectFunctionsEmulator: function () {},
    };
  }

  return originalLoad.call(this, request, parent, isMain, options);
};
