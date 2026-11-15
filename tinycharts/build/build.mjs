// Build sheets into one self-contained HTML page.
// bun tinycharts/build/build.mjs a.js [b.js ...] -o out.html [--logic] [--gallery gallery.json] [--icons dir] [--theme theme.json]
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { loadTech, find } from './tech.mjs';
import { sanitizeSvg, recolor, toLogo, PALETTE, PAL } from './logo-lib.mjs';
import { TYPES } from './types.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const KIT_ORDER = ['core', 'pen', 'marker', 'solids', 'life', 'text', 'marks', 'logo', 'objects', 'motion'];
// cls: the sheet lettering classes that use the font, for an exported SVG.
export const FONTS = [
  { fam: 'Young Serif', file: 'young-serif-400.woff2', weight: 400, cls: 'tt' },
  { fam: 'Gaegu', file: 'gaegu-400.woff2', weight: 400, cls: 'it|cap' },
  { fam: 'DM Sans', file: 'dm-sans.woff2', weight: '400 500' },
];
// Chrome blocks @font-face by relative path on file:// pages, and
// document.fonts.ready still resolves, so the fonts go in as data URIs.
export const fontFace = f => `@font-face{font-family:"${f.fam}";font-weight:${f.weight};font-display:block;src:url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'fonts', f.file)).toString('base64')}) format("woff2")}`;

function parse(args) {
  const { values: v, positionals: files } = parseArgs({ args, allowPositionals: true, options: {
    o: { type: 'string', short: 'o' }, logic: { type: 'boolean' }, gallery: { type: 'string' }, icons: { type: 'string' }, theme: { type: 'string' },
  } });
  if (!files.length || !v.o) throw new Error('Usage: build.mjs a.js [b.js ...] -o out.html [--logic] [--gallery gallery.json] [--icons dir] [--theme theme.json]');
  return { files, out: v.o, logic: !!v.logic, gallery: v.gallery || null, icons: v.icons, theme: v.theme || null };
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

const GROUPS = [...new Set(TYPES.map(t => t.group))];
// gallery: a JSON file of {group, key, type, question}, or that list itself.
function galleryOf(gallery, keys) {
  const name = Array.isArray(gallery) ? 'gallery' : path.basename(gallery);
  const list = Array.isArray(gallery) ? gallery : JSON.parse(fs.readFileSync(gallery, 'utf8'));
  for (const e of list) {
    if (!keys.includes(e.key)) throw new Error(`${name}: no sheet for "${e.key}"`);
    if (!GROUPS.includes(e.group)) throw new Error(`${name}: "${e.key}" has group "${e.group}", not one of ${GROUPS.join(', ')}`);
  }
  return `const GALLERY = ${JSON.stringify(list)};\n`;
}

// The technology table, and the logos of the technologies a sheet names in
// quotes (by key, name or alias), recoloured to the marker palette.
function iconsOf(sources, dir = path.join(ROOT, 'icons', 'logos')) {
  const table = loadTech(), logos = {};
  const named = new Set([...sources.join('\n').matchAll(/(['"])([\w .+#-]{1,40})\1/g)].map(m => find(table, m[2])?.key).filter(Boolean));
  for (const key of named) {
    const e = table[key];
    if (e.logo === false) continue;
    const file = path.join(dir, key + '.svg');
    if (!fs.existsSync(file)) { console.log(`note: ${key}: no logo, text fallback`); continue; }
    const lg = toLogo(recolor(sanitizeSvg(fs.readFileSync(file, 'utf8'), key), PALETTE), key);
    logos[key] = e.tint ? { ...lg, tint: PALETTE[e.tint] } : lg;
  }
  return `const TECH = ${JSON.stringify(table)};\nconst LOGOS = ${JSON.stringify(logos)};\n`;
}

// A theme names PAL colours. The kit, the shell CSS, the logos and the sheets
// all write these colours as hex, so the swap is on the hex of the whole page.
// One pass, so that a new colour is never swapped again.
export function themeOf(file) {
  const theme = JSON.parse(fs.readFileSync(file, 'utf8')), name = path.basename(file), swap = {};
  for (const [k, v] of Object.entries(theme)) {
    if (!(k in PAL)) throw new Error(`${name}: "${k}" is not a PAL colour. Use one of: ${Object.keys(PAL).join(' ')}`);
    if (!/^#[0-9a-f]{6}$/i.test(v)) throw new Error(`${name}: "${k}" must be a colour like #b5483b, not "${v}"`);
    swap[PAL[k].toLowerCase()] = v.toLowerCase();
  }
  return html => html.replace(/#[0-9a-f]{6}(?![0-9a-f])/gi, c => swap[c.toLowerCase()] ?? c);
}

export async function build({ files, out, logic = false, gallery = null, icons, theme = null }) {
  const fonts = FONTS.map(fontFace).join('');
  const keys = files.map(f => path.basename(f, '.js'));
  const sheets = files.map((f, i) => `SHEETS[${JSON.stringify(keys[i])}] = (() => {\n${fs.readFileSync(f, 'utf8')}\n;return {draw, init, size: typeof SIZE === 'undefined' ? [1400, 1400] : SIZE, about: typeof ABOUT === 'undefined' ? '' : ABOUT};\n})();`).join('\n');
  const meta = keys.map(k => ({ key: k, name: k }));
  const logicJs = (logic ? await logicOf(files, keys) : '') + (gallery ? galleryOf(gallery, keys) : '');
  const html = read('shell/page.html')
    .replace('/*FONTS*/', () => fonts)
    .replace('/*CSS*/', () => read('shell/style.css'))
    .replace('/*KIT*/', () => script(iconsOf(files.map(f => fs.readFileSync(f, 'utf8')), icons) + KIT_ORDER.map(n => read(`kit/${n}.js`)).join('\n')))
    .replace('/*SHEETS*/', () => script(`const SHEETS = {};\nconst META = ${JSON.stringify(meta)};\n${logicJs}${sheets}`))
    .replace('/*APP*/', () => script((logic ? read('shell/logic.js') + '\n' : '') + read('shell/app.js')))
    .replace('<!--TITLE-->', () => meta[0].name);
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, theme ? themeOf(theme)(html) : html);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build(parse(process.argv.slice(2))).then(f => console.log(f), e => { console.error(e.message); process.exit(1); });
}
