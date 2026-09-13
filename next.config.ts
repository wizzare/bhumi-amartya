import type { NextConfig } from "next";

const verifierUrl = process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL || (process.env.NODE_ENV === "production" ? "https://bhumi-billing-verifier.vercel.app" : "http://localhost:3000");

if (process.env.STRICT_BUILD_CHECK === "true" && !process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL) {
  throw new Error("[BUILD ERROR] NEXT_PUBLIC_BILLING_VERIFIER_URL is required for production build.");
}

const nextConfig: NextConfig = {
  // Explicitly opt-in development preview; no fixture switch can activate in production.
  ...(process.env.NODE_ENV !== 'production' && process.env.BHUMI_LOCAL_QA === '1' ? {
    async headers() {
      return [{ source: '/:path*', headers: [{ key: 'Content-Security-Policy', value:
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' http://127.0.0.1:8080 http://127.0.0.1:9099 http://127.0.0.1:5001 http://127.0.0.1:18765 ws://127.0.0.1:3001; form-action 'self'; frame-src 'self'; object-src 'none'"
      }] }];
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
  },
};

export default nextConfig;
