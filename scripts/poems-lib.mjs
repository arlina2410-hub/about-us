// Turns plain-text poem files (content/poems/*.txt) into the poem data the app uses.
// Kept separate from the command-line script so it can be tested.
import fs from 'node:fs';
import path from 'node:path';

export const ALLOWED_KEYS = ['title', 'date', 'category', 'tags', 'featured'];
const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isRealDate(text) {
  const m = DATE_PATTERN.exec(text);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

function parseYesNo(value) {
  const v = value.trim().toLowerCase();
  if (['yes', 'true', 'y', '1'].includes(v)) return true;
  if (['no', 'false', 'n', '0', ''].includes(v)) return false;
  return null;
}

/**
 * Reads one poem file.
 * @returns {{ poem?: object, errors: string[], warnings: string[] }}
 */
export function parsePoemFile(fileName, rawText, today = new Date()) {
  const errors = [];
  const warnings = [];
  const fail = (line, message) => errors.push(`${fileName}${line ? ` (line ${line})` : ''}: ${message}`);

  const id = fileName.replace(/\.txt$/i, '');
  if (!ID_PATTERN.test(id)) {
    fail(0, `The file name "${fileName}" is not allowed. Use only lowercase letters, numbers and hyphens, for example "rain-on-the-window.txt".`);
  }

  const text = rawText.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ');
  const lines = text.split('\n');

  const dividerIndex = lines.findIndex((l) => /^-{3,}\s*$/.test(l));
  if (dividerIndex === -1) {
    fail(0, 'There is no line with three dashes (---) between the settings at the top and the poem. Copy it from _TEMPLATE.txt.');
    return { errors, warnings };
  }

  // ---- settings (above the dashes)
  const settings = {};
  for (let i = 0; i < dividerIndex; i++) {
    const line = lines[i];
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    const colon = line.indexOf(':');
    if (colon === -1) {
      fail(i + 1, `"${line.trim()}" is not a setting. Settings look like  title: My Poem`);
      continue;
    }
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (!ALLOWED_KEYS.includes(key)) {
      fail(i + 1, `Unknown setting "${key}". Allowed settings: ${ALLOWED_KEYS.join(', ')}.`);
      continue;
    }
    if (key in settings) fail(i + 1, `The setting "${key}" appears twice.`);
    settings[key] = value;
  }

  const title = (settings.title ?? '').trim();
  if (!title) fail(0, 'Missing "title:" above the dashes.');

  const date = (settings.date ?? '').trim();
  if (!date) fail(0, 'Missing "date:" above the dashes. Write it like  date: 2026-11-02');
  else if (!isRealDate(date)) fail(0, `The date "${date}" is not valid. Use the form YEAR-MONTH-DAY, for example 2026-11-02.`);
  else if (new Date(`${date}T00:00:00Z`) > new Date(today.getTime() + 2 * 86400000)) {
    warnings.push(`${fileName}: the date ${date} is in the future.`);
  }

  let featured = false;
  if ('featured' in settings) {
    const parsed = parseYesNo(settings.featured);
    if (parsed === null) fail(0, `"featured:" must be yes or no, not "${settings.featured}".`);
    else featured = parsed;
  }

  const category = (settings.category ?? '').trim();
  const tags = [
    ...new Set(
      (settings.tags ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  ];
  if (tags.length > 8) warnings.push(`${fileName}: ${tags.length} tags; fewer than 8 works best.`);
  if (title.length > 80) warnings.push(`${fileName}: the title is very long (${title.length} characters).`);

  // ---- poem text (below the dashes): blank lines separate stanzas
  const stanzas = [];
  let current = [];
  for (const raw of lines.slice(dividerIndex + 1)) {
    const line = raw.trim();
    if (line === '') {
      if (current.length) stanzas.push(current);
      current = [];
    } else {
      current.push(line);
      if (line.length > 200) warnings.push(`${fileName}: one line is ${line.length} characters long. Is a line break missing?`);
    }
  }
  if (current.length) stanzas.push(current);
  if (stanzas.length === 0) fail(0, 'The poem has no text below the dashes.');

  if (errors.length) return { errors, warnings };

  const poem = { id, title, date };
  if (category) poem.category = category;
  if (tags.length) poem.tags = tags;
  if (featured) poem.featured = true;
  poem.stanzas = stanzas;
  return { poem, errors, warnings };
}

/** Reads every poem file in a folder. Files starting with _ or . are ignored (templates, notes). */
export function loadPoems(dir, today = new Date()) {
  const errors = [];
  const warnings = [];
  const poems = [];

  if (!fs.existsSync(dir)) {
    errors.push(`The poems folder "${dir}" does not exist.`);
    return { poems, errors, warnings };
  }

  for (const name of fs.readdirSync(dir).sort()) {
    if (name.startsWith('_') || name.startsWith('.')) continue;
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) continue;
    if (!/\.txt$/i.test(name)) {
      if (!/\.md$/i.test(name)) warnings.push(`${name}: ignored, because only .txt files are read.`);
      continue;
    }
    if (!/\.txt$/.test(name)) {
      errors.push(`${name}: the file ending must be a lowercase ".txt".`);
      continue;
    }
    const result = parsePoemFile(name, fs.readFileSync(full, 'utf8'), today);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    if (result.poem) poems.push(result.poem);
  }

  // Book order: oldest first, so new poems are added at the end of the book.
  poems.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  return { poems, errors, warnings };
}
