import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createNextStaticRscAliases } from './fix-next-static-rsc-paths.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const env = {
  ...process.env,
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: 'false',
  NEXT_PUBLIC_USE_AUTH_EMULATOR: 'false',
  NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: 'false',
  NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: 'false',
  NEXT_PUBLIC_ENABLE_EMULATOR_QA_LOGIN: 'false',
  NEXT_PUBLIC_ENABLE_ANDROID_EMULATOR_QA_LOGIN: 'false',
  NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA: 'false',
  NEXT_PUBLIC_WEB_APP_URL: 'https://bhumi-amartya-clean.vercel.app',
  NEXT_PUBLIC_BILLING_VERIFIER_URL: process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL || 'https://bhumi-billing-verifier.vercel.app',
  NODE_ENV: 'production'
};

if (!env.NEXT_PUBLIC_BILLING_VERIFIER_URL) {
  console.error('\nERROR: NEXT_PUBLIC_BILLING_VERIFIER_URL is required for production build.\n');
  process.exit(1);
}

// Explicitly unset emulator host variables to prevent any inheritance
delete env.FIREBASE_AUTH_EMULATOR_HOST;
delete env.FIRESTORE_EMULATOR_HOST;
delete env.FIREBASE_FUNCTIONS_EMULATOR_HOST;

console.log(`\n>>> STARTING DETERMINISTIC PRODUCTION BUILD <<<`);
console.log(`USE_FIREBASE_EMULATORS: ${env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS}`);
console.log(`USE_AUTH_EMULATOR: ${env.NEXT_PUBLIC_USE_AUTH_EMULATOR}`);
console.log(`USE_FIRESTORE_EMULATOR: ${env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR}`);
console.log(`USE_FUNCTIONS_EMULATOR: ${env.NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR}`);
console.log(`ENABLE_QA_LOGIN: ${env.NEXT_PUBLIC_ENABLE_EMULATOR_QA_LOGIN}`);
console.log(`-----------------------------------------------\n`);

const nextBin = resolve(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'next.cmd' : 'next');

const nextBuild = spawn(nextBin, ['build'], {
  stdio: 'inherit',
  env,
  shell: true,
  cwd: rootDir
});

nextBuild.on('close', async (code) => {
  if (code === 0) {
    const aliases = await createNextStaticRscAliases(resolve(rootDir, 'out'));
    console.log(`Next static RSC aliases created: ${aliases}`);
    console.log('\nProduction build completed successfully.\n');
  } else {
    console.error(`\nProduction build failed with code ${code}.\n`);
  }
  process.exit(code);
});
