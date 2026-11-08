// Export a sheet as SVG and PNG files, for one state or the whole story.
// bun tinycharts/build/export.mjs out.html [--sheet <key>] [--state <id> | --story] [--svg] [--png] -o <dir>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dumpDom, shot } from './chrome.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONTS = [['tt', 'Young Serif', 'young-serif-400.woff2'], ['it|cap', 'Gaegu', 'gaegu-400.woff2']];
// The sheet lettering rules from shell/style.css, for viewers without the page.
const TEXT_CSS = 'text.tt{font-family:"Young Serif",Georgia,serif}' +
  'text.it{font-family:Gaegu,sans-serif;font-size-adjust:.5;letter-spacing:.5px}' +
  'text.cap{font-family:Gaegu,sans-serif;font-size-adjust:.5;letter-spacing:1.4px;text-transform:uppercase}' +
  'text.kicker{letter-spacing:2.4px}';

function parse(argv) {
  const o = { html: null, sheet: null, state: null, story: false, svg: false, png: false, out: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--sheet') o.sheet = argv[++i];
    else if (a === '--state') o.state = argv[++i];
    else if (a === '--story') o.story = true;
    else if (a === '--svg') o.svg = true;
    else if (a === '--png') o.png = true;
    else if (a === '-o') o.out = argv[++i];
    else if (a.startsWith('-')) throw new Error(`Unknown option: ${a}`);
    else o.html = a;
  }
  if (!o.html || !o.out) throw new Error('Usage: export.mjs out.html [--sheet <key>] [--state <id> | --story] [--svg] [--png] -o <dir>');
  if (o.state && o.story) throw new Error('Use --state or --story, not both.');
  if (!o.svg && !o.png) o.svg = o.png = true;
  return o;
}

const unescape = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

async function ready(url) {
  const dom = await dumpDom(url, { wait: 10000 });
  if (!/<body[^>]*data-ready="1"/.test(dom)) {
    const err = (dom.match(/<pre id="error"[^>]*>([^<]*)<\/pre>/) || [])[1];
    throw new Error('export: sheet not ready after 10 s' + (err ? `: ${unescape(err)}` : ''));
  }
  return dom;
}

function withFonts(svg) {
  const faces = FONTS.filter(([cls]) => new RegExp(`class="[^"]*\\b(${cls})\\b`).test(svg)).map(([, fam, file]) =>
    `@font-face{font-family:"${fam}";src:url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'fonts', file)).toString('base64')}) format("woff2")}`);
  return svg.replace(/^(<svg[^>]*>)/, `$1<style>${faces.join('')}${TEXT_CSS}</style>`);
}

export async function exportSheet(o) {
  const base = pathToFileURL(path.resolve(o.html)).href;
  const hash = extra => '#' + [o.sheet && `sheet=${encodeURIComponent(o.sheet)}`, 'bare=1', ...extra].filter(Boolean).join('&');
  const first = await ready(base + hash(['export=1', o.state && `state=${encodeURIComponent(o.state)}`]));
  const key = o.sheet || (first.match(/<body[^>]*data-sheet="([^"]*)"/) || [])[1];
  const story = JSON.parse(unescape((first.match(/<body[^>]*data-story="([^"]*)"/) || [, '[]'])[1]));
  const jobs = o.story ? story.map((id, i) => [id, `${key}-${String(i + 1).padStart(2, '0')}-${id}`])
    : [[o.state, o.state ? `${key}-${o.state}` : key]];
  fs.mkdirSync(o.out, { recursive: true });
  const files = [];
  for (const [id, name] of jobs) {
    const state = id && `state=${encodeURIComponent(id)}`;
    const dom = o.story ? await ready(base + hash(['export=1', state])) : first;
    const svg = unescape(dom.match(/<textarea id="svgout"[^>]*>([\s\S]*?)<\/textarea>/)[1]);
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
