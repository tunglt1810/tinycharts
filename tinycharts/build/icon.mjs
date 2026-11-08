// Export the icon of each named technology as <key>.svg and <key>.png.
// bun tinycharts/build/icon.mjs <name...> [--force] [--offline] [--icons dir] [-o tinycharts/icons/out]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTech, lookup } from './tech.mjs';
import { fetchLogo, LOGO_DIR } from './logos.mjs';
import { build } from './build.mjs';
import { exportSheet } from './export.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = path.resolve('.tmp/icons');

function parse(argv) {
  const o = { names: [], force: false, offline: false, icons: LOGO_DIR, out: path.join(ROOT, 'icons', 'out') };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--force') o.force = true;
    else if (a === '--offline') o.offline = true;
    else if (a === '--icons') o.icons = argv[++i];
    else if (a === '-o') o.out = argv[++i];
    else if (a.startsWith('-')) throw new Error(`Unknown option: ${a}`);
    else o.names.push(a);
  }
  if (!o.names.length) throw new Error('Usage: icon.mjs <name...> [--force] [--offline] [--icons dir] [-o dir]');
  return o;
}

// Objects are drawn at sheet scale, which is small in a 320 px icon; the
// icon draws them larger so the logo reads.
const sheet = name => `const SIZE = [320, 320];
function draw(seed) {
  begin(seed); OX = 160; OY = 195;
  out.push('<g transform="translate(160 160) scale(1.55) translate(-160 -160)">'); tech(${JSON.stringify(name)}, 0, 0); out.push('</g>');
  finish();
}
function init(ctx) { document.getElementById('grid').remove(); return { goto() {}, story: [] }; }
`;

export async function icons(o) {
  const table = loadTech(), lines = [];
  for (const name of o.names) {
    const e = lookup(table, name), svg = path.join(o.out, e.key + '.svg');
    if (!o.force && fs.existsSync(svg) && fs.existsSync(path.join(o.out, e.key + '.png'))) { lines.push(`${e.key}: kept`); continue; }
    if (!o.offline && e.logo !== false) await fetchLogo(e.key, e, { dir: o.icons });
    fs.mkdirSync(TMP, { recursive: true });
    const js = path.join(TMP, e.key + '.js'), html = path.join(TMP, e.key + '.html');
    fs.writeFileSync(js, sheet(e.name));
    await build({ files: [js], out: html, icons: o.icons });
    await exportSheet({ html, sheet: null, state: null, story: false, svg: true, png: true, out: o.out });
    // an icon goes on other pictures, so its SVG has no paper behind it
    fs.writeFileSync(svg, fs.readFileSync(svg, 'utf8').replace(/<rect id="(paper|grid)"[^>]*\/>/g, ''));
    lines.push(`${e.key}: ${path.relative(process.cwd(), svg)}`);
  }
  return lines;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  icons(parse(process.argv.slice(2))).then(l => l.forEach(x => console.log(x)), e => { console.error(e.message); process.exit(1); });
}
