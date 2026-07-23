import type { NextConfig } from "next";

const verifierUrl = process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL || (process.env.NODE_ENV === "production" ? "https://bhumiamartya-fe85c.asia-southeast2.run.app" : "http://localhost:3000");

if (process.env.STRICT_BUILD_CHECK === "true" && !process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL) {
  throw new Error("[BUILD ERROR] NEXT_PUBLIC_BILLING_VERIFIER_URL is required for production build.");
}

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  trailingSlash: true,
  // @ts-ignore
  allowedDevOrigins: ['192.168.1.8', '192.168.1.11', 'localhost'],
  images: {
    unoptimized: true,
  },
  env: {
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
