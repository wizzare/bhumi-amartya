import type { NextConfig } from "next";
import path from "node:path";

const verifierUrl = process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL || (process.env.NODE_ENV === "production" ? "https://bhumi-billing-verifier.vercel.app" : "http://localhost:3000");

if (process.env.STRICT_BUILD_CHECK === "true" && !process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL) {
  throw new Error("[BUILD ERROR] NEXT_PUBLIC_BILLING_VERIFIER_URL is required for production build.");
}

const nextConfig: NextConfig = {
  // Explicitly opt-in development preview; no fixture switch can activate in production.
  ...(process.env.NODE_ENV !== 'production' && process.env.BHUMI_LOCAL_QA === '1' ? {
    async headers() {
      return [{ source: '/:path*', headers: [{ key: 'Content-Security-Policy', value:
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' http://127.0.0.1:3000 http://localhost:3000 http://127.0.0.1:8080 http://127.0.0.1:9099 http://127.0.0.1:5001 http://127.0.0.1:18765 ws://127.0.0.1:3001; form-action 'self'; frame-src 'self'; object-src 'none'"
      }] }];
    },
  } : {}),
  ...(process.env.NODE_ENV !== 'production' && process.env.BHUMI_HARNESS_MOCK === '1' ? {
    webpack: (config: any) => {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase/app': path.resolve(__dirname, 'tests/helpers/mockFirebaseApp.ts'),
        'firebase/auth': path.resolve(__dirname, 'tests/helpers/mockFirebaseAuth.ts'),
        'firebase/firestore': path.resolve(__dirname, 'tests/helpers/mockFirebaseFirestore.ts'),
        'firebase/functions': path.resolve(__dirname, 'tests/helpers/mockFirebaseFunctions.ts'),
      };
      return config;
    },
  } : {}),
  /* config options here */
  output: process.env.VERCEL ? undefined : 'export',
  trailingSlash: process.env.VERCEL ? false : true,
  // @ts-ignore
  allowedDevOrigins: ['192.168.1.8', '192.168.1.11', 'localhost'],
  images: {
    unoptimized: true,
  },
  env: {
    BHUMI_LOCAL_QA: process.env.NODE_ENV !== 'production' && process.env.BHUMI_LOCAL_QA === '1' ? '1' : '0',
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_BILLING_VERIFIER_URL: verifierUrl,
    NEXT_PUBLIC_USE_FIREBASE_EMULATORS: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS,
    NEXT_PUBLIC_USE_AUTH_EMULATOR: process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR,
    NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: process.env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR,
    NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: process.env.NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR,
    NEXT_PUBLIC_ENABLE_EMULATOR_QA_LOGIN: process.env.NEXT_PUBLIC_ENABLE_EMULATOR_QA_LOGIN,
    NEXT_PUBLIC_ENABLE_ANDROID_EMULATOR_QA_LOGIN: process.env.NEXT_PUBLIC_ENABLE_ANDROID_EMULATOR_QA_LOGIN,
    NEXT_PUBLIC_FIREBASE_EMULATOR_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_EMULATOR_HOST: process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST,
    NEXT_PUBLIC_QA_MODE: process.env.NEXT_PUBLIC_QA_MODE,
    BHUMI_QA_MODE: process.env.BHUMI_QA_MODE,
    NEXT_PUBLIC_QA_CANDIDATE: process.env.NEXT_PUBLIC_QA_CANDIDATE,
    NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA: process.env.NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA,
    NEXT_PUBLIC_APP_EDITION: process.env.NEXT_PUBLIC_APP_EDITION,
    NEXT_PUBLIC_QA_ANDROID_PACKAGE: process.env.NEXT_PUBLIC_QA_ANDROID_PACKAGE,
    NEXT_PUBLIC_QA_FIRESTORE_PROJECT_ID: process.env.NEXT_PUBLIC_QA_FIRESTORE_PROJECT_ID,
    NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID: process.env.NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID,
    NEXT_PUBLIC_HUMAN_DESIGN_API_URL: process.env.NEXT_PUBLIC_HUMAN_DESIGN_API_URL,
    NEXT_PUBLIC_ASTROLOGY_API_URL: process.env.NEXT_PUBLIC_ASTROLOGY_API_URL,
    NEXT_PUBLIC_WEB_APP_URL: process.env.NEXT_PUBLIC_WEB_APP_URL,
  },
};

export default nextConfig;
