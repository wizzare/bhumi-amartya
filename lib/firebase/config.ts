import { FirebaseOptions, initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { shouldUseFirebaseEmulators, connectEmulators } from './emulatorConfig';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredFirebaseEnv = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
] as const;

const missingFirebaseEnv = requiredFirebaseEnv.filter((key) => !firebaseConfig[key]);

if (missingFirebaseEnv.length > 0) {
  throw new Error(
    `Missing Firebase public environment variables: ${missingFirebaseEnv.join(', ')}. Check .env.local and restart the Next.js dev server.`,
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

if (shouldUseFirebaseEmulators()) {
  connectEmulators(auth, db, functions);
}

export { app, auth, db, functions };
