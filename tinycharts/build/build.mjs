// Build sheets into one self-contained HTML page.
// bun tinycharts/build/build.mjs a.js [b.js ...] -o out.html [--names "A,B"] [--logic] [--gallery gallery.json] [--icons dir]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTech } from './tech.mjs';
import { sanitizeSvg, recolor, toLogo, PALETTE } from './logo-lib.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const KIT_ORDER = ['core', 'pen', 'marker', 'solids', 'life', 'text', 'marks', 'logo', 'objects', 'motion'];
// Chrome blocks @font-face by relative path on file:// pages, and
// document.fonts.ready still resolves, so the fonts go in as data URIs.
const FONTS = [['Young Serif', 'young-serif-400.woff2', 400], ['Gaegu', 'gaegu-400.woff2', 400], ['DM Sans', 'dm-sans.woff2', '400 500']];

function parse(argv) {
  const o = { files: [], out: null, names: null, logic: false, gallery: null, icons: undefined };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-o') o.out = argv[++i];
    else if (a === '--names') o.names = argv[++i].split(',').map(s => s.trim());
    else if (a === '--logic') o.logic = true;
    else if (a === '--gallery') o.gallery = argv[++i];
    else if (a === '--icons') o.icons = argv[++i];
    else if (a.startsWith('--')) throw new Error(`Unknown option: ${a}`);
    else o.files.push(a);
  }
  if (!o.files.length || !o.out) throw new Error('Usage: build.mjs a.js [b.js ...] -o out.html [--names "A,B"] [--logic] [--gallery gallery.json] [--icons dir]');
  return o;
}

const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const script = s => s.replace(/<\/script/gi, '<\\/script');

// The flow chart is drawn here, at build time, so the page carries only SVG.
async function loadPele() {
  if (process.env.TINYCHARTS_NO_PELE === '1') return null;
  try { return (await import('pele')).render; } catch { return null; }
}

async function logicOf(files, keys) {
  const render = await loadPele(), data = {}, svg = {};
  files.forEach((f, i) => {
    const base = f.replace(/\.js$/, ''), mmd = base + '.mmd', json = base + '.json', name = path.basename(mmd);
    if (!fs.existsSync(json)) throw new Error(`${path.basename(json)} not found. Run: bun ${path.basename(base)}.check.mjs`);
    data[keys[i]] = JSON.parse(fs.readFileSync(json, 'utf8'));
    if (!render) { console.log(`note: ${name}: flow chart not drawn (pele not found)`); return; }
    try {
      // The sheet already shows the title; the panel chart goes without it.
      const src = fs.readFileSync(mmd, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '');
      svg[keys[i]] = render(src, { idPrefix: `${keys[i]}-`, fontFamily: 'DM Sans' }).svg;
    } catch (e) { console.log(`note: ${name}: flow chart not drawn (${e.message})`); }
  });
  return `const LOGICDATA = ${JSON.stringify(data)};\nconst PELE = ${JSON.stringify(svg)};\n`;
}

const GROUPS = ['Time', 'Space', 'Order', 'Flow', 'Who', 'Compare'];
function galleryOf(file, keys) {
  const name = path.basename(file), list = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const e of list) {
    if (!keys.includes(e.key)) throw new Error(`${name}: no sheet for "${e.key}"`);
    if (!GROUPS.includes(e.group)) throw new Error(`${name}: "${e.key}" has group "${e.group}", not one of ${GROUPS.join(', ')}`);
  }
  return `const GALLERY = ${JSON.stringify(list)};\n`;
}

// The technology table, and the logos of the technologies a sheet names in
// quotes (by key, name or alias), recoloured to the marker palette.
function iconsOf(sources, dir = path.join(ROOT, 'icons', 'logos')) {
  const table = loadTech(), norm = s => s.trim().toLowerCase().replace(/\s+/g, ' ');
  const quoted = new Set([...sources.join('\n').matchAll(/(['"])([\w .+#-]{1,40})\1/g)].map(m => norm(m[2])));
  const logos = {};
  for (const [key, e] of Object.entries(table)) {
    if (e.logo === false || ![key, e.name, ...(e.alias || [])].some(n => quoted.has(norm(n)))) continue;
    const file = path.join(dir, key + '.svg');
    if (!fs.existsSync(file)) { console.log(`note: ${key}: no logo, text fallback`); continue; }
    const lg = toLogo(recolor(sanitizeSvg(fs.readFileSync(file, 'utf8'), key), PALETTE), key);
    logos[key] = e.tint ? { ...lg, tint: PALETTE[e.tint] } : lg;
  }
  return `const TECH = ${JSON.stringify(table)};\nconst LOGOS = ${JSON.stringify(logos)};\n`;
}

export async function build({ files, out, names, logic = false, gallery = null, icons }) {
  const fonts = FONTS.map(([fam, file, w]) =>
    `@font-face{font-family:"${fam}";font-weight:${w};font-display:block;src:url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'fonts', file)).toString('base64')}) format("woff2")}`).join('');
  const keys = files.map(f => path.basename(f, '.js'));
  const sheets = files.map((f, i) => `SHEETS[${JSON.stringify(keys[i])}] = (() => {\n${fs.readFileSync(f, 'utf8')}\n;return {draw, init, size: typeof SIZE === 'undefined' ? [1400, 1400] : SIZE, about: typeof ABOUT === 'undefined' ? '' : ABOUT};\n})();`).join('\n');
  const meta = keys.map((k, i) => ({ key: k, name: (names && names[i]) || k }));
  const logicJs = (logic ? await logicOf(files, keys) : '') + (gallery ? galleryOf(gallery, keys) : '');
  const html = read('shell/page.html')
    .replace('/*FONTS*/', () => fonts)
    .replace('/*CSS*/', () => read('shell/style.css'))
    .replace('/*KIT*/', () => script(iconsOf(files.map(f => fs.readFileSync(f, 'utf8')), icons) + KIT_ORDER.map(n => read(`kit/${n}.js`)).join('\n')))
    .replace('/*SHEETS*/', () => script(`const SHEETS = {};\nconst META = ${JSON.stringify(meta)};\n${logicJs}${sheets}`))
    .replace('/*APP*/', () => script((logic ? read('shell/logic.js') + '\n' : '') + read('shell/app.js')))
    .replace('<!--TITLE-->', () => meta[0].name);
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, html);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build(parse(process.argv.slice(2))).then(f => console.log(f), e => { console.error(e.message); process.exit(1); });
}
