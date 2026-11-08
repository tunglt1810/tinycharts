// Record the README GIF of each example sheet: Play all, into docs/gifs/<slug>.gif.
// Not part of the skill. Needs ffmpeg.
// bun scripts/gifs.mjs [slug...]   (no slug: every sheet in the gallery)
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const gallery = JSON.parse(fs.readFileSync('tinycharts/examples/gallery.json', 'utf8')).map(e => e.key);
const args = process.argv.slice(2), slugs = args.length ? args : gallery;
const bad = slugs.filter(s => !gallery.includes(s));
if (bad.length) { console.error(`Not in the gallery: ${bad.join(', ')}`); process.exit(1); }

const run = (...a) => spawnSync(process.execPath, a, { encoding: 'utf8' });
fs.mkdirSync('docs/gifs', { recursive: true });
fs.mkdirSync('.tmp/gifsrc', { recursive: true });
let failed = 0;
for (const s of slugs) {
  const html = `.tmp/gifsrc/${s}.html`, t0 = Date.now();
  const r = run('tinycharts/build/build.mjs', `tinycharts/examples/${s}.js`, '-o', html);
  const g = r.status === 0 && run('tinycharts/build/gif.mjs', html, '-o', `docs/gifs/${s}.gif`);
  if (!g || g.status !== 0) { failed++; console.log(`${s}: failed\n${(g || r).stderr}`); continue; }
  console.log(`${s}: ${Math.round((Date.now() - t0) / 1000)} s, ${Math.round(fs.statSync(`docs/gifs/${s}.gif`).size / 1024)} KB`);
}
process.exit(failed ? 1 : 0);
