// A review page: the original type (a screenshot in .tmp/shots/) next to our
// example sheet, at the same width. Not part of the skill.
// bun scripts/compare.mjs <slug...> -o .tmp/review/compare.html
import fs from 'node:fs';
import path from 'node:path';
import { make } from '../tinycharts/build/make.mjs';
import { typeOf } from '../tinycharts/build/types.mjs';

const SHOTS = '.tmp/shots';
const args = process.argv.slice(2), oi = args.indexOf('-o'), out = oi >= 0 ? args[oi + 1] : null;
const slugs = args.filter((a, i) => i !== oi && i !== oi + 1);
if (!slugs.length || !out) { console.error('Usage: compare.mjs <slug...> -o out.html'); process.exit(1); }

const dir = path.dirname(path.resolve(out)), png = path.join(dir, 'compare-png');
// a shot is named after the type: 02-parallel.jpeg, flowchart.png, ...
const shotOf = slug => fs.readdirSync(SHOTS).find(f => /\.(jpe?g|png)$/.test(f) && (f.replace(/\.\w+$/, '') === slug ||
  new RegExp(`^\\d\\d-${slug.split('-')[0]}`).test(f)));
const rows = [];
for (const s of slugs) {
  const t = typeOf(s), lines = await make({ files: [`tinycharts/examples/${t.slug}.js`], out: path.join(dir, `compare-${t.slug}.html`), png });
  if (lines.length) console.log(lines.join('\n'));
  const ours = fs.readdirSync(png).filter(f => f.startsWith(`${t.slug}-01-`))[0], shot = shotOf(t.slug);
  rows.push(`<h2>${t.name} <small>${t.question}</small></h2><div class="row">` +
    `<figure>${shot ? `<img src="${path.relative(dir, path.resolve(SHOTS, shot))}">` : '<p>no original shot</p>'}<figcaption>original</figcaption></figure>` +
    `<figure>${ours ? `<img src="compare-png/${ours}">` : '<p>no picture</p>'}<figcaption>ours</figcaption></figure></div>`);
}
fs.writeFileSync(out, `<!doctype html><meta charset="utf-8"><title>compare</title><style>body{font:15px system-ui;margin:24px;background:#eee}` +
  `.row{display:grid;grid-template-columns:1fr 1fr;gap:16px}figure{margin:0}img{width:100%;display:block;background:#fff}h2 small{font-weight:400;color:#777}</style>${rows.join('')}`);
console.log(out);
