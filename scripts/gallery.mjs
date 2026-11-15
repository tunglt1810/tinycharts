// Build every example sheet into one page with the gallery and the logic panels.
// bun scripts/gallery.mjs [-o .tmp/all.html]
import { spawnSync } from 'node:child_process';
import { build } from '../tinycharts/build/build.mjs';
import { GALLERY } from '../tinycharts/build/types.mjs';

const i = process.argv.indexOf('-o'), out = i > 0 ? process.argv[i + 1] : '.tmp/all.html';
const files = GALLERY.map(e => `tinycharts/examples/${e.key}.js`);
// git ignores the .json each check writes, so the checks run first
for (const f of files) {
  const r = spawnSync(process.execPath, [f.replace(/\.js$/, '.check.mjs')], { encoding: 'utf8' });
  if (r.status !== 0) { console.error(`${f}: check failed\n${r.stderr}`); process.exit(1); }
}
await build({ files, out, logic: true, gallery: GALLERY });
console.log(out);
