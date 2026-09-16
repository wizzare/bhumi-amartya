// Registers the test-only module resolver (see resolver.mjs).
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./resolver.mjs', pathToFileURL(import.meta.filename));
