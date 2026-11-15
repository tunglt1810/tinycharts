// Export a sheet as SVG and PNG files, for one state or the whole story.
// bun tinycharts/build/export.mjs out.html [--sheet <key>] [--state <id> | --story] [--svg] [--png] -o <dir>
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readPage, textOf, attrOf, shot } from './chrome.mjs';
import { FONTS, fontFace } from './build.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function parse(args) {
  const { values: v, positionals: [html] } = parseArgs({ args, allowPositionals: true, options: {
    sheet: { type: 'string' }, state: { type: 'string' }, story: { type: 'boolean' }, svg: { type: 'boolean' }, png: { type: 'boolean' }, o: { type: 'string', short: 'o' },
  } });
  if (!html || !v.o) throw new Error('Usage: export.mjs out.html [--sheet <key>] [--state <id> | --story] [--svg] [--png] -o <dir>');
  if (v.state && v.story) throw new Error('Use --state or --story, not both.');
  const both = !v.svg && !v.png;
  return { html, sheet: v.sheet || null, state: v.state || null, story: !!v.story, svg: both || !!v.svg, png: both || !!v.png, out: v.o };
}

async function ready(url) {
  try { return await readPage(url, 10000); } catch (e) { throw new Error(`export: sheet not ready after 10 s: ${e.message}`); }
}

// An SVG viewer has no page CSS, so the sheet lettering rules of
// shell/style.css go in, with its font variables filled in.
function withFonts(svg) {
  const css = fs.readFileSync(path.join(ROOT, 'shell', 'style.css'), 'utf8');
  const vars = Object.fromEntries([...css.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
  const text = css.match(/^text\.[^\n]*$/gm).join('').replace(/var\((--[\w-]+)\)/g, (_, k) => vars[k]);
  const faces = FONTS.filter(f => f.cls && new RegExp(`class="[^"]*\\b(${f.cls})\\b`).test(svg)).map(fontFace);
  return svg.replace(/^(<svg[^>]*>)/, `$1<style>${faces.join('')}${text}</style>`);
}

export async function exportSheet(o) {
  const base = pathToFileURL(path.resolve(o.html)).href;
  const hash = extra => '#' + [o.sheet && `sheet=${encodeURIComponent(o.sheet)}`, 'bare=1', ...extra].filter(Boolean).join('&');
  const first = await ready(base + hash(['export=1', o.state && `state=${encodeURIComponent(o.state)}`]));
  const key = o.sheet || attrOf(first, 'data-sheet');
  const story = JSON.parse(attrOf(first, 'data-story') || '[]');
  const jobs = o.story ? story.map((id, i) => [id, `${key}-${String(i + 1).padStart(2, '0')}-${id}`])
    : [[o.state, o.state ? `${key}-${o.state}` : key]];
  fs.mkdirSync(o.out, { recursive: true });
  const files = [];
  for (const [id, name] of jobs) {
    const state = id && `state=${encodeURIComponent(id)}`;
    const dom = o.story ? await ready(base + hash(['export=1', state])) : first;
    const svg = textOf(dom, 'textarea', 'svgout');
    if (o.svg) {
      fs.writeFileSync(path.join(o.out, name + '.svg'), withFonts(svg));
      files.push(name + '.svg');
    }
    if (o.png) {
      const size = [+svg.match(/ width="(\d+)"/)[1], +svg.match(/ height="(\d+)"/)[1]];
      await shot(base + hash([state]), path.join(o.out, name + '.png'), size);
      files.push(name + '.png');
    }
  }
  return files;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  exportSheet(parse(process.argv.slice(2))).then(f => f.forEach(x => console.log(x)), e => { console.error(e.message); process.exit(1); });
}
