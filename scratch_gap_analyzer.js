const fs = require('fs');

const inventoryText = fs.readFileSync('PROFILE_V4_FINAL_IDENTITY_WAREHOUSE.md', 'utf-8');
const presentationText = fs.readFileSync('lib/profile/gaia/presentation.ts', 'utf-8');
const typesText = fs.readFileSync('lib/profile/gaia/types.ts', 'utf-8');

// Parse Sections from Identity Warehouse
const sections = [];
const regex = /## SECTION \d+: ([^\(]+)/g;
let match;
while ((match = regex.exec(inventoryText)) !== null) {
  sections.push(match[1].trim());
}

// Check presentation.ts
const uiReady = [];
const presMatch = presentationText.match(/title:\s*"([^"]+)"/g);
if (presMatch) {
  presMatch.forEach(m => {
    const t = m.split('"')[1];
    uiReady.push(t);
  });
}

const md = `# GUDANG IDENTITAS IMPLEMENTATION GAP

| SECTION | EXPECTED (Inventory) | RUNTIME (GaiaProfile) | FRONTEND READY | MISSING | PRIORITY |
|---|---|---|---|---|---|
${sections.map(s => {
  const isFront = uiReady.some(u => s.includes(u) || u.includes(s)) ? '✅' : '❌';
  return `| ${s} | ✅ | ❓ | ${isFront} | ❓ | HIGH |`;
}).join('\n')}
`;

fs.writeFileSync('GUDANG_IDENTITAS_IMPLEMENTATION_GAP.md', md);
console.log('Done');
