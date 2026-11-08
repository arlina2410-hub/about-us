import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

export interface PrecacheFile {
  /** URL path, for example "/assets/index-abc123.js". */
  url: string;
  /** File contents, used only to compute the version so that any change makes a new version. */
  content: string | Uint8Array;
}

/** Fills the service worker template. The version changes whenever any precached file changes. */
export function renderServiceWorker(template: string, files: PrecacheFile[]): string {
  const sorted = [...files].sort((a, b) => a.url.localeCompare(b.url));
  const hash = createHash('sha256');
  for (const f of sorted) {
    hash.update(f.url);
    hash.update(typeof f.content === 'string' ? f.content : Buffer.from(f.content));
  }
  const version = hash.digest('hex').slice(0, 12);
  return template
    .replaceAll('__VERSION__', version)
    .replaceAll('__PRECACHE__', JSON.stringify(sorted.map((f) => f.url), null, 2));
}

function listFiles(dir: string, base = ''): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...listFiles(path.join(dir, entry.name), rel));
    else out.push(rel);
  }
  return out;
}

/** Adds sw.js to the build: a list of every file the app needs to work offline. */
export function serviceWorkerPlugin(): Plugin {
  let root = process.cwd();
  let publicDir = path.resolve(root, 'public');

  return {
    name: 'about-us-service-worker',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      root = config.root;
      publicDir = config.publicDir ? config.publicDir : path.resolve(root, 'public');
    },
    generateBundle(_options, bundle) {
      const files: PrecacheFile[] = [];

      for (const [name, item] of Object.entries(bundle)) {
        if (name.endsWith('.map')) continue;
        const content = item.type === 'asset' ? item.source : item.code;
        files.push({ url: `/${name}`, content });
      }

      // Files copied as-is from public/ (icons, manifest, favicon). sw.js itself is never cached.
      for (const rel of listFiles(publicDir)) {
        if (rel === 'sw.js' || rel.startsWith('_') || rel === 'robots.txt') continue;
        files.push({ url: `/${rel}`, content: fs.readFileSync(path.join(publicDir, rel)) });
      }

      const template = fs.readFileSync(path.resolve(root, 'src/pwa/sw.template.js'), 'utf8');
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: renderServiceWorker(template, files) });
    },
  };
}
