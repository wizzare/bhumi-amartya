import { copyFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, resolve, sep } from "node:path";

async function filesBelow(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesBelow(path));
    else if (entry.isFile() && entry.name.endsWith(".txt")) files.push(path);
  }
  return files;
}

export async function createNextStaticRscAliases(outDir) {
  let aliases = 0;

  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;

      const path = join(directory, entry.name);
      if (!entry.name.startsWith("__next.")) {
        await visit(path);
        continue;
      }

      for (const source of await filesBelow(path)) {
        const suffix = relative(path, source).split(sep);
        const target = join(directory, [entry.name, ...suffix].join("."));
        await copyFile(source, target);
        aliases += 1;
      }
    }
  }

  await visit(outDir);
  return aliases;
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === currentFile) {
  if (process.env.VERCEL) {
    console.log("Building on Vercel - skipping next static RSC aliases fix");
    process.exit(0);
  }
  const rootDir = resolve(dirname(currentFile), "..");
  const aliases = await createNextStaticRscAliases(resolve(rootDir, "out"));
  console.log(`Next static RSC aliases created: ${aliases}`);
}
