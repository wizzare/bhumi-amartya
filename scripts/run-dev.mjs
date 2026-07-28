import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const mode = process.argv[2]; // 'prod' or 'emulator'

if (mode !== 'prod' && mode !== 'emulator') {
  console.error('Usage: node scripts/run-dev.mjs <prod|emulator>');
  process.exit(1);
}

const isProd = mode === 'prod';

const env = {
  ...process.env,
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: isProd ? 'false' : 'true',
  NEXT_PUBLIC_USE_AUTH_EMULATOR: isProd ? 'false' : 'true',
  NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: isProd ? 'false' : 'true',
  NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: isProd ? 'false' : 'true',
  NEXT_PUBLIC_ENABLE_EMULATOR_QA_LOGIN: isProd ? 'false' : 'true',
  NEXT_PUBLIC_ENABLE_ANDROID_EMULATOR_QA_LOGIN: isProd ? 'false' : 'true',
  NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA: isProd ? 'false' : 'true',
};

// Explicitly unset emulator host variables in prod mode to prevent inheritance
if (isProd) {
  delete env.FIREBASE_AUTH_EMULATOR_HOST;
  delete env.FIRESTORE_EMULATOR_HOST;
  delete env.FIREBASE_FUNCTIONS_EMULATOR_HOST;
}

console.log(`\n>>> RUNNING IN ${mode.toUpperCase()} MODE <<<`);
console.log(`USE_FIREBASE_EMULATORS: ${env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS}`);
console.log(`USE_AUTH_EMULATOR: ${env.NEXT_PUBLIC_USE_AUTH_EMULATOR}`);
console.log(`USE_FIRESTORE_EMULATOR: ${env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR}`);
console.log(`USE_FUNCTIONS_EMULATOR: ${env.NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR}`);
console.log(`ENABLE_QA_LOGIN: ${env.NEXT_PUBLIC_ENABLE_EMULATOR_QA_LOGIN}`);
console.log(`-------------------------------------------\n`);

const nextBin = resolve(rootDir, 'node_modules', '.bin', 'next.cmd');

const nextDev = spawn(nextBin, ['dev', '-p', '3001'], {
  stdio: 'inherit',
  env,
  shell: true,
  cwd: rootDir
});

nextDev.on('close', (code) => {
  process.exit(code);
});
