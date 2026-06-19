const fs = require('fs');
const types = JSON.parse(fs.readFileSync('scratch_types_dump.json', 'utf-8'));
const pages = JSON.parse(fs.readFileSync('scratch_pages_dump.json', 'utf-8'));

let md = `# IDENTITY LAYER FULL INVENTORY\n\n`;

const systemsList = [
  { id: 'numerology', name: 'Numerology' },
  { id: 'human-design', name: 'Human Design' },
  { id: 'astrology', name: 'Natal Chart' },
  { id: 'weton', name: 'Weton' },
  { id: 'bazi', name: 'BaZi' },
  { id: 'vedic', name: 'Vedic' },
  { id: 'destiny-matrix', name: 'Destiny Matrix' },
  { id: 'tzolkin', name: 'Tzolkin' }
];

md += `## SYSTEMS\n\n`;
systemsList.forEach((s, i) => md += `${i+1}. ${s.name}\n`);
md += `\n---\n\n`;

const extractInterfaces = (code) => {
  const interfaces = {};
  const regex = /export interface (\w+) (\{[^}]+\})/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    interfaces[match[1]] = match[2];
  }
  return interfaces;
};

const extractPageSections = (code) => {
  const sections = [];
  const regex = /<h2[^>]*>([^<]+)<\/h2>/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    sections.push(match[1]);
  }
  return sections;
};

const allFieldsMap = {};
const derivedFieldsMap = {};

systemsList.forEach(sys => {
  md += `# ${sys.name.toUpperCase()}\n\n`;
  
  const typeCode = types[sys.id] || types[sys.id.replace('natal-chart', 'astrology')] || '';
  const pageCode = pages[sys.id] || pages[sys.id.replace('astrology', 'natal')] || '';
  
  // Identity Layer
  md += `## Identity Layer\n`;
  let coreFields = [];
  let derivedFields = [];
  const lines = typeCode.split('\n');
  const blueprintRegex = new RegExp(`export interface ${sys.name.replace(/ /g,'')}Blueprint \\{`, 'i');
  let inBlueprint = false;
  lines.forEach(line => {
    if (blueprintRegex.test(line)) inBlueprint = true;
    else if (inBlueprint && line.includes('}')) inBlueprint = false;
    else if (inBlueprint) {
      const match = line.match(/^\s*([a-zA-Z0-9_]+)[\?:!]*\s*:/);
      if (match) {
        const field = match[1];
        if (['strengths', 'challenges', 'purpose', 'summary', 'growthStyle', 'careerStyle', 'relationshipStyle', 'lifeLesson'].includes(field)) {
          derivedFields.push(field);
        } else {
          coreFields.push(field);
        }
      }
    }
  });
  
  coreFields.forEach(f => md += `- ${f}\n`);
  md += `\n`;
  allFieldsMap[sys.id] = coreFields;
  derivedFieldsMap[sys.id] = derivedFields;
  
  // Core Sections
  md += `## Core Sections\n`;
  const sections = extractPageSections(pageCode);
  sections.forEach(s => md += `- ${s}\n`);
  md += `\n`;
  
  // Subsections
  md += `## Subsections\n`;
  md += `*(Sections mapped to fields)*\n`;
  sections.forEach(s => {
    md += `\n${s}\n`;
    md += `* [Fields rendered under this section]\n`;
  });
  md += `\n`;
  
  // Hidden Engine Data
  md += `## Hidden Engine Data\n`;
  md += `*(Calculated fields not directly mapped to UI sections)*\n`;
  md += `\n`;
  
  // Derived Intelligence
  md += `## Derived Intelligence\n`;
  derivedFields.forEach(f => md += `- ${f}\n`);
  md += `\n`;
  
  // Storage Mapping
  md += `## Storage Mapping\n`;
  md += `blueprint.${sys.id.replace('natal-chart', 'astrology')}.*\n\n`;
  
  // Consumption Mapping
  md += `## Consumption Mapping\n`;
  md += `- Profile (/blueprint/${sys.id})\n`;
  md += `- Gaia Themes (partially)\n\n`;
  
  // Gap Analysis
  md += `## Gap Analysis\n`;
  md += `- TBD\n\n`;
  
  md += `---\n\n`;
});

// Final Section
md += `# CANONICAL IDENTITY PROPOSAL\n\n`;
md += `IDENTITY\n\n`;
const canonicalCats = ['Purpose', 'Energy', 'Psychology', 'Archetype', 'Karma', 'Evolution', 'Patterns', 'Timing', 'Talents', 'Relationships', 'Career', 'Health', 'Spirituality', 'Shadow', 'Growth'];
canonicalCats.forEach(cat => {
  md += `${cat}\n* [Systems contributing to ${cat}]\n\n`;
});

fs.writeFileSync('IDENTITY_LAYER_FULL_INVENTORY.md', md);
