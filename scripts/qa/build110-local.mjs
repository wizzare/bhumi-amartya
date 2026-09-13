// Founder preview: synthetic Firebase project, loopback only, no .env file.
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
if (process.env.NODE_ENV === 'production' || process.env.BHUMI_LOCAL_QA !== '1') {
  throw new Error('BUILD110_LOCAL_QA_DISABLED');
}
for (const file of ['.env', '.env.local', '.env.development', '.env.development.local']) {
  if (existsSync(file)) throw new Error('LOCAL_QA_REQUIRES_ENV_FILE_FREE_WORKSPACE');
}
const env = { ...process.env };
for (const key of Object.keys(env)) {
  if (/^(NEXT_PUBLIC_|FIREBASE_|FIRESTORE_|GOOGLE_|GCLOUD_|VERCEL|OPENAI_|GEMINI_|ANTHROPIC_)/.test(key)) delete env[key];
}
Object.assign(env, {
  NODE_ENV: 'development', BHUMI_LOCAL_QA: '1', NEXT_TELEMETRY_DISABLED: '1',
  NEXT_PUBLIC_FIREBASE_API_KEY: 'synthetic-build110-key',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: '127.0.0.1',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'demo-build110-local',
  NEXT_PUBLIC_FIREBASE_EMULATOR_PROJECT_ID: 'demo-build110-local',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'demo-build110-local.appspot.com',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456789',
  NEXT_PUBLIC_FIREBASE_APP_ID: '1:123456789:web:synthetic-build110',
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: 'true',
  NEXT_PUBLIC_USE_AUTH_EMULATOR: 'true', NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: 'true',
  NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: 'true',
  NEXT_PUBLIC_HUMAN_DESIGN_API_URL: 'http://127.0.0.1:18765/api/humandesign/calculate',
  NEXT_PUBLIC_BILLING_VERIFIER_URL: 'http://127.0.0.1:5001',
  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080', FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
  NODE_OPTIONS: `--import=${pathToFileURL(resolve('scripts/qa/build110-local-network.mjs')).href}`,
});
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--webpack', '-H', '127.0.0.1', '-p', '3001'], {
  cwd: process.cwd(), env, stdio: 'inherit', windowsHide: true,
});
child.on('exit', code => process.exit(code ?? 1));
