import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
if (process.env.NODE_ENV === 'production' || process.env.BHUMI_LOCAL_QA !== '1') throw new Error('BUILD110_LOCAL_QA_DISABLED');
const fixture = readFileSync(new URL('../../tests/fixtures/build110-hd-local.json', import.meta.url));
const ALLOWED_ORIGINS = new Set([
  'http://127.0.0.1:3001',
  'http://localhost:3001',
  'https://localhost',
  'http://localhost',
  'capacitor://localhost',
]);
let requests = 0;
createServer((req, res) => {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) { res.writeHead(403).end(); return; }
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-dev-secret, X-Firebase-AppCheck');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }
  if (req.url === '/health' && req.method === 'GET') { res.end(JSON.stringify({ mode: 'synthetic-local-fixture', requests, externalCalls: 0 })); return; }
  if (req.method !== 'POST' || req.url !== '/api/humandesign/calculate') { res.writeHead(404).end(); return; }
  let body = ''; req.on('data', chunk => { body += chunk; if (body.length > 16000) req.destroy(); });
  req.on('end', async () => {
    try {
      const input = JSON.parse(body);
      if (!input.birthDate || !input.birthTime || !input.timezone) { res.writeHead(400).end(); return; }
      requests++;
      let chartData = JSON.parse(fixture);
      try {
        const { calculateHumanDesignTypeFromBirthData, calculateHumanDesignProfileFromBirthData } = await import('../../lib/humandesign/calculateHumanDesignType.ts');
        const tsResult = calculateHumanDesignTypeFromBirthData(input.birthDate, input.birthTime, input.timezone, input.longitude ?? 106.8);
        const tsProfile = calculateHumanDesignProfileFromBirthData(input.birthDate, input.birthTime, input.timezone, input.longitude ?? 106.8);
        if (tsResult) {
          chartData.type = tsResult.type;
          chartData.definition = tsResult.definition;
          chartData.channels = tsResult.channels;
        }
        if (tsProfile) {
          chartData.profile = tsProfile;
        }
      } catch {}
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Bhumi-Fixture': 'synthetic' });
      res.end(JSON.stringify(chartData));
    } catch { res.writeHead(400).end(); }
  });
}).listen(18765, '127.0.0.1', () => console.log('BUILD110_HD_FIXTURE_READY=127.0.0.1:18765'));
