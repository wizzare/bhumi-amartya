const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

try {
  console.log("Running Full Flow Verification...");
  execSync('npx tsx test-full-flow.ts', {
    stdio: 'inherit',
    env: { ...process.env, ...env }
  });
} catch (e) {
  process.exit(1);
}
