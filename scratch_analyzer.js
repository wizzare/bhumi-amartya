const fs = require('fs');
const path = require('path');

const libDir = path.join(__dirname, 'lib');

function scanTypes(dir, systems) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const typesPath = path.join(fullPath, 'types.ts');
      if (fs.existsSync(typesPath)) {
        systems[file] = fs.readFileSync(typesPath, 'utf-8');
      }
    }
  }
}

const systems = {};
scanTypes(libDir, systems);
fs.writeFileSync('scratch_types_dump.json', JSON.stringify(systems, null, 2));

const appBlueprintDir = path.join(__dirname, 'app', 'blueprint');
const pages = {};
if (fs.existsSync(appBlueprintDir)) {
  const dirs = fs.readdirSync(appBlueprintDir);
  for (const d of dirs) {
    const pagePath = path.join(appBlueprintDir, d, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      pages[d] = fs.readFileSync(pagePath, 'utf-8');
    }
  }
}
fs.writeFileSync('scratch_pages_dump.json', JSON.stringify(pages, null, 2));
