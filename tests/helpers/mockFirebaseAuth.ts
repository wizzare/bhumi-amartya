import { FirebaseApp, getApp } from "./mockFirebaseApp";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  providerData: Array<{
    providerId: string;
    uid: string;
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
  }>;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
  getIdTokenResult: (forceRefresh?: boolean) => Promise<{ token: string; claims: Record<string, unknown> }>;
  delete?: () => Promise<void>;
  reload?: () => Promise<void>;
}

export const SYNTHETIC_USERS: Record<string, User> = {
  "baru@build110.test": {
    uid: "hd-new-a",
    email: "baru@build110.test",
    displayName: "Synthetic New User A",
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date(Date.now() - 86400000).toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [
      {
        providerId: "password",
        uid: "hd-new-a",
        displayName: "Synthetic New User A",
        email: "baru@build110.test",
        phoneNumber: null,
        photoURL: null,
      },
    ],
    getIdToken: async () => "valid_id_token_12345",
    getIdTokenResult: async () => ({ token: "valid_id_token_12345", claims: {} }),
    delete: async () => {},
    reload: async () => {},
  },
  "lama@build110.test": {
    uid: "hd-browser-test-a",
    email: "lama@build110.test",
    displayName: "Synthetic Existing User A",
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date(Date.now() - 86400000).toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [
      {
        providerId: "password",
        uid: "hd-browser-test-a",
        displayName: "Synthetic Existing User A",
        email: "lama@build110.test",
        phoneNumber: null,
        photoURL: null,
      },
    ],
    getIdToken: async () => "valid_id_token_12345",
    getIdTokenResult: async () => ({ token: "valid_id_token_12345", claims: {} }),
    delete: async () => {},
    reload: async () => {},
  },
  "synthetic@example.com": {
    uid: "synthetic-user-123",
    email: "synthetic@example.com",
    displayName: "Synthetic User",
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date(Date.now() - 86400000).toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [
      {
        providerId: "password",
        uid: "synthetic@example.com",
        displayName: "Synthetic User",
        email: "synthetic@example.com",
        phoneNumber: null,
        photoURL: null,
      },
    ],
    getIdToken: async () => "valid_id_token_12345",
    getIdTokenResult: async () => ({ token: "valid_id_token_12345", claims: {} }),
    delete: async () => {},
    reload: async () => {},
  },
  "user-c@example.test": {
    uid: "hd-browser-test-c",
    email: "user-c@example.test",
    displayName: "Synthetic User C",
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date(Date.now() - 86400000).toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [
      {
        providerId: "password",
        uid: "hd-browser-test-c",
        displayName: "Synthetic User C",
        email: "user-c@example.test",
        phoneNumber: null,
        photoURL: null,
      },
    ],
    getIdToken: async () => "valid_id_token_12345",
    getIdTokenResult: async () => ({ token: "valid_id_token_12345", claims: {} }),
    delete: async () => {},
    reload: async () => {},
  },
  "user-b@example.test": {
    uid: "hd-browser-test-b",
    email: "user-b@example.test",
    displayName: "Synthetic User B",
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date(Date.now() - 86400000).toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [
      {
        providerId: "password",
        uid: "hd-browser-test-b",
        displayName: "Synthetic User B",
        email: "user-b@example.test",
        phoneNumber: null,
        photoURL: null,
      },
    ],
    getIdToken: async () => "valid_id_token_12345",
    getIdTokenResult: async () => ({ token: "valid_id_token_12345", claims: {} }),
    delete: async () => {},
    reload: async () => {},
  },
};

export function getSyntheticUser(email: string): User {
  return SYNTHETIC_USERS[email] || SYNTHETIC_USERS["synthetic@example.com"];
}

export type Auth = MockAuth;

const STORAGE_KEY = "__BHUMI_MOCK_AUTH_USER__";

export class MockAuth {
  app: FirebaseApp;
  private _currentUser: User | null = null;
  private _lastStoredRaw: string | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  constructor(app: FirebaseApp) {
    this.app = app;
  }

  get currentUser(): User | null {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === this._lastStoredRaw) {
          return this._currentUser;
        }
        this._lastStoredRaw = stored;
        if (stored) {
          const parsed = JSON.parse(stored);
          this._currentUser = {
            ...parsed,
            getIdToken: async () => "valid_id_token_12345",
            getIdTokenResult: async () => ({ token: "valid_id_token_12345", claims: {} }),
          };
        } else {
          this._currentUser = null;
        }
      } catch {}
    }
    return this._currentUser;
  }

  set currentUser(user: User | null) {
    this._currentUser = user;
  }

  setCurrentUser(user: User | null) {
    this._currentUser = user;
    if (typeof window !== "undefined") {
      try {
        if (user) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } catch {}
    }
    for (const listener of Array.from(this.listeners)) {
      try {
        listener(this.currentUser);
      } catch (e) {
        console.error("[MockAuth] Listener error:", e);
      }
    }
  }

  addListener(callback: (user: User | null) => void): () => void {
    this.listeners.add(callback);
    setTimeout(() => {
      if (this.listeners.has(callback)) {
        callback(this.currentUser);
      }
    }, 0);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

const defaultAuth = new MockAuth(getApp());
export class GoogleAuthProvider {
  providerId = "google.com";
  static PROVIDER_ID = "google.com";
  addScope() { return this; }
  setCustomParameters() { return this; }
  static credential(idToken?: string, accessToken?: string) {
    return OAuthCredential.credential(idToken, accessToken);
  }
}

export class EmailAuthProvider { providerId = "password"; static PROVIDER_ID = "password"; }
export class FacebookAuthProvider { providerId = "facebook.com"; static PROVIDER_ID = "facebook.com"; }
export class GithubAuthProvider { providerId = "github.com"; static PROVIDER_ID = "github.com"; }
export class TwitterAuthProvider { providerId = "twitter.com"; static PROVIDER_ID = "twitter.com"; }
export class OAuthProvider {
  providerId: string;
  constructor(providerId: string) { this.providerId = providerId; }
}
export class RecaptchaVerifier {
  constructor() {}
  render() { return Promise.resolve(0); }
  clear() {}
}

export async function createUserWithEmailAndPassword(auth: any, email: string, password: string): Promise<{ user: User }> {
  const instance = auth || defaultAuth;
  const user = getSyntheticUser(email);
  instance.setCurrentUser(user);
  return { user };
}

export async function deleteUser(user: any): Promise<void> {}
export async function updateEmail(user: any, email: string): Promise<void> {}
export async function updatePassword(user: any, password: string): Promise<void> {}
export async function updateProfile(user: any, profile: any): Promise<void> {}
export async function verifyBeforeUpdateEmail(user: any, email: string): Promise<void> {}
export async function sendEmailVerification(user: any): Promise<void> {}
export async function sendPasswordResetEmail(auth: any, email: string): Promise<void> {}
export async function confirmPasswordReset(auth: any, oobCode: string, newPassword: string): Promise<void> {}
export async function applyActionCode(auth: any, oobCode: string): Promise<void> {}

export const browserSessionPersistence = {};
export const inMemoryPersistence = {};
export const indexedDBLocalPersistence = {};

export function connectAuthEmulator(): void {}
export async function fetchSignInMethodsForEmail(): Promise<string[]> { return ["google.com"]; }
export function getAdditionalUserInfo(): { isNewUser: boolean; profile?: Record<string, unknown> } { return { isNewUser: false }; }
export function isSignInWithEmailLink(): boolean { return false; }
export async function linkWithCredential(user: any): Promise<{ user: User }> { return { user: defaultAuth.currentUser || SYNTHETIC_USERS["synthetic@example.com"] }; }
export async function linkWithPhoneNumber(): Promise<any> { return {}; }
export async function linkWithPopup(): Promise<any> { return {}; }
export async function linkWithRedirect(): Promise<void> {}
export async function reload(): Promise<void> {}
export async function revokeAccessToken(): Promise<void> {}
export async function sendSignInLinkToEmail(): Promise<void> {}
export async function signInWithCustomToken(auth: any): Promise<{ user: User }> { return { user: SYNTHETIC_USERS["synthetic@example.com"] }; }
export async function signInWithEmailLink(auth: any): Promise<{ user: User }> { return { user: SYNTHETIC_USERS["synthetic@example.com"] }; }
export async function signInWithPhoneNumber(): Promise<any> { return {}; }
export async function unlink(user: any): Promise<User | null> { return defaultAuth.currentUser; }

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  const mount = () => {
    if (document.getElementById("hd05d-switch")) return;
    const button = document.createElement("button");
    button.id = "hd05d-switch";
    button.textContent = "Switch synthetic account";
    button.style.cssText = "position:fixed;top:0;right:0;z-index:99999;background:white;color:black";
    button.onclick = () => { void signInWithPopup(defaultAuth, new GoogleAuthProvider()); };
    document.body.append(button);
  };
  if (document.body) mount(); else window.addEventListener("DOMContentLoaded", mount, { once: true });
}

export function getAuth(app?: any): MockAuth {
  return defaultAuth;
}

export function onAuthStateChanged(auth: any, callback: (user: User | null) => void): () => void {
  const instance = auth || defaultAuth;
  return instance.addListener(callback);
}

export async function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<{ user: User }> {
  const instance = auth || defaultAuth;
  const user = getSyntheticUser(email);
  instance.setCurrentUser(user);
  return { user };
}

export async function signInAnonymously(auth: any): Promise<{ user: User }> {
  const instance = auth || defaultAuth;
  instance.setCurrentUser(SYNTHETIC_USERS["synthetic@example.com"]);
  return { user: SYNTHETIC_USERS["synthetic@example.com"] };
}

export async function signInWithCredential(auth: any, credential: any): Promise<{ user: User }> {
  const instance = auth || defaultAuth;
  instance.setCurrentUser(SYNTHETIC_USERS["synthetic@example.com"]);
  return { user: SYNTHETIC_USERS["synthetic@example.com"] };
}

export async function signInWithPopup(auth: any, provider: any): Promise<{ user: User }> {
  if (process.env.NODE_ENV === "production" || typeof document === "undefined") throw new Error("Mock browser only");
  const selected = await new Promise<string>(resolve => {
    const chooser = document.createElement("dialog");
    chooser.setAttribute("aria-label", "Synthetic account chooser");
    for (const account of ["a", "b", "c", "new-a", "new-a2"]) {
      const button = document.createElement("button");
      button.textContent = `Synthetic account ${account === "a" ? "A" : account === "b" ? "B" : account === "c" ? "C" : account.toUpperCase()}`;
      button.onclick = () => { chooser.remove(); resolve(account); };
      chooser.append(button);
    }
    document.body.append(chooser);
    chooser.showModal();
  });
  const uidByKey: Record<string, string> = { a: "hd-browser-test-a", b: "hd-browser-test-b", c: "hd-browser-test-c", "new-a": "hd-new-a", "new-a2": "hd-new-a2" };
  const uid = uidByKey[selected] ?? `hd-browser-test-${selected}`;
  const user = { ...SYNTHETIC_USERS["synthetic@example.com"], uid, email: `${selected}@example.invalid`, displayName: `Synthetic ${selected.toUpperCase()}`, getIdTokenResult: async () => ({ token: "mock-only", claims: {} }) };
  (auth || defaultAuth).setCurrentUser(user);
  return { user };
}

export async function signInWithRedirect(auth: any, provider: any): Promise<void> {
  const instance = auth || defaultAuth;
  instance.setCurrentUser(SYNTHETIC_USERS["synthetic@example.com"]);
}

export async function getRedirectResult(auth: any): Promise<null> {
  return null;
}

export async function signOut(auth: any): Promise<void> {
  const instance = auth || defaultAuth;
  instance.setCurrentUser(null);
}

export async function setPersistence(auth: any, persistence: any): Promise<void> {}

export const browserLocalPersistence = {}

export class OAuthCredential {
  providerId: string;
  signInMethod: string;
  idToken: string | null;
  accessToken: string | null;
  secret: string | null;

  constructor(providerId: string) {
    this.providerId = providerId;
    this.signInMethod = providerId;
    this.idToken = null;
    this.accessToken = null;
    this.secret = null;
  }

  static credential(idToken?: string, accessToken?: string) {
    const credential = new OAuthCredential("google.com");
    credential.idToken = idToken || "valid_id_token_12345";
    credential.accessToken = accessToken || "mock-access-token";
    return credential;
  }
}

