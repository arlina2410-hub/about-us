#!/usr/bin/env node
// Reads content/poems/*.txt, checks every poem, and writes src/data/poems.json for the app.
// Runs automatically before `npm run dev` and `npm run build`. A mistake stops the build with a clear message,
// so the live website keeps showing the last good version.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPoems } from './poems-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const poemsDir = path.join(root, 'content', 'poems');
const outFile = path.join(root, 'src', 'data', 'poems.json');

const { poems, errors, warnings } = loadPoems(poemsDir);

if (warnings.length) {
  console.warn('\n⚠  Notes (the build continues):');
  warnings.forEach((w) => console.warn(`   - ${w}`));
}

if (errors.length) {
  console.error('\n❌ Some poems need fixing before the website can be built:\n');
  errors.forEach((e) => console.error(`   - ${e}`));
  console.error(`\n   ${errors.length} problem${errors.length === 1 ? '' : 's'}. Fix the file(s) in content/poems and save again.\n`);
  process.exit(1);
}

const json = JSON.stringify(poems, null, 2) + '\n';
fs.mkdirSync(path.dirname(outFile), { recursive: true });
if (!fs.existsSync(outFile) || fs.readFileSync(outFile, 'utf8') !== json) fs.writeFileSync(outFile, json);

console.log(`\n✓ ${poems.length} poem${poems.length === 1 ? '' : 's'} checked and ready.${poems.length === 0 ? ' (No poems yet: the home screen will say the first poem is on its way.)' : ''}\n`);
