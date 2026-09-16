// Test-only module resolver.
//
// Maps the project's "@/*" path alias (declared in tsconfig.json and used by
// Next.js) onto real files, and appends the .ts extension that Node's ESM
// loader requires. This exists purely so the unit tests can import production
// modules unchanged; no production configuration is affected.

import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function withExtension(absolutePath) {
  if (existsSync(absolutePath)) return absolutePath;
  for (const ext of ['.ts', '.tsx']) {
    if (existsSync(absolutePath + ext)) return absolutePath + ext;
  }
  const indexed = path.join(absolutePath, 'index.ts');
  if (existsSync(indexed)) return indexed;
  return absolutePath;
}

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const target = withExtension(path.join(ROOT, specifier.slice(2)));
    return { url: pathToFileURL(target).href, shortCircuit: true };
  }

  if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    const candidate = path.resolve(parentDir, specifier);
    const resolved = withExtension(candidate);
    if (resolved !== candidate) {
      return { url: pathToFileURL(resolved).href, shortCircuit: true };
    }
  }

  return nextResolve(specifier, context);
}
