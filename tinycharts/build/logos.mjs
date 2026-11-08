// Fetch a technology logo once, from the first source that has it, and keep
// a sanitized copy in tinycharts/icons/logos/ with a line in SOURCES.md.
// bun tinycharts/build/logos.mjs <key...> | --all
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sanitizeSvg } from './logo-lib.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const LOGO_DIR = path.join(ROOT, 'icons', 'logos');
const RAW = 'https://raw.githubusercontent.com';
const HEAD = '# Logo sources\n\nEach logo is a sanitized copy. Logos are trademarks of their owners.\n\n| key | source | url | license |\n|---|---|---|---|\n';

export function sourcesFor(entry) {
  const s = [];
  if (entry.cncf) s.push({ source: 'cncf', url: `${RAW}/cncf/artwork/main/projects/${entry.cncf}/icon/color/${entry.cncf}-icon-color.svg`, license: 'CNCF trademark policy (cncf/artwork LICENSE.md)' });
  if (entry.simple) s.push({ source: 'simple-icons', url: `${RAW}/simple-icons/simple-icons/develop/icons/${entry.simple}.svg`, license: 'CC0-1.0' });
  if (entry.devicon) s.push({ source: 'devicon', url: `${RAW}/devicons/devicon/master/icons/${entry.devicon}/${entry.devicon}-original.svg`, license: 'MIT' });
  return s;
}

function note(dir, key, s) {
  const file = path.join(dir, 'SOURCES.md');
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : HEAD;
  if (text.split('\n').some(l => l.startsWith(`| ${key} |`))) return;
  fs.writeFileSync(file, text + `| ${key} | ${s.source} | ${s.url} | ${s.license} |\n`);
}

export async function fetchLogo(key, entry, { fetch = globalThis.fetch, dir = LOGO_DIR } = {}) {
  const file = path.join(dir, key + '.svg');
  if (fs.existsSync(file)) return { file, source: 'cached' };
  for (const s of sourcesFor(entry)) {
    let svg;
    try {
      const r = await fetch(s.url, { signal: AbortSignal.timeout(10000) });
      if (!r.ok) continue;
      svg = sanitizeSvg(await r.text(), key);
    } catch { continue; }
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, svg + '\n');
    note(dir, key, s);
    return { file, source: s.source };
  }
  return null;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { loadTech } = await import('./tech.mjs');
  const table = loadTech(), args = process.argv.slice(2);
  const keys = args.includes('--all') ? Object.keys(table) : args;
  for (const key of keys) {
    const e = table[key];
    if (!e) { console.error(`${key}: not in tech.json`); process.exitCode = 1; continue; }
    if (e.logo === false) { console.log(`${key}: no logo on purpose`); continue; }
    const r = await fetchLogo(key, e);
    console.log(r ? `${key}: ${r.source}` : `${key}: not found, text fallback`);
  }
}
