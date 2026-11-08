// One command from sheet to checked page: run each sheet's rule check, build
// the page with its logic panel, then audit every state in headless Chrome.
// bun tinycharts/build/make.mjs a.js [b.js ...] -o out.html [--png dir]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from './build.mjs';
import { dumpDom } from './chrome.mjs';
import { parseMmd } from './mmd.mjs';
import { exportSheet } from './export.mjs';

function parse(argv) {
  const o = { files: [], out: null, png: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '-o') o.out = argv[++i];
    else if (argv[i] === '--png') o.png = argv[++i];
    else if (argv[i].startsWith('-')) throw new Error(`Unknown option: ${argv[i]}`);
    else o.files.push(argv[i]);
  }
  if (!o.files.length || !o.out) throw new Error('Usage: make.mjs a.js [b.js ...] -o out.html [--png dir]');
  return o;
}

const unescape = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

// The problems with each sheet, as lines to print; none means the page is good.
export async function make({ files, out, png = null }) {
  const lines = [];
  for (const f of files) {
    const base = f.replace(/\.js$/, ''), key = path.basename(base);
    const r = spawnSync(process.execPath, [base + '.check.mjs'], { encoding: 'utf8' });
    if (r.status !== 0) { lines.push(`${key}: check failed: ${(r.stderr || r.stdout).trim().split('\n').pop()}`); continue; }
    const res = JSON.parse(fs.readFileSync(base + '.json', 'utf8'));
    if (!/All \d+ rules hold\./.test(res.checked)) for (const x of res.rules.filter(x => /^Breaks/.test(x.path))) lines.push(`${key}: rule "${x.rule}": ${x.path}`);
  }
  if (lines.length) return lines;
  await build({ files, out, logic: true });
  const url = pathToFileURL(path.resolve(out)).href;
  for (const f of files) {
    const base = f.replace(/\.js$/, ''), key = path.basename(base);
    const dom = await dumpDom(`${url}#sheet=${encodeURIComponent(key)}&audit=all`, { wait: 8000 });
    const err = (dom.match(/<pre id="error"[^>]*>([^<]*)<\/pre>/) || [])[1];
    if (err) { lines.push(`${key}: error: ${unescape(err)}`); continue; }
    if (!/<body[^>]*data-ready="1"/.test(dom)) { lines.push(`${key}: page not ready`); continue; }
    const audit = unescape((dom.match(/<pre id="audit"[^>]*>([^<]*)<\/pre>/) || [, ''])[1]);
    lines.push(...audit.split('\n').filter(Boolean).map(l => `${key}: ${l}`));
    const marked = new Set([...dom.matchAll(/data-state="([^"]+)"/g)].map(m => unescape(m[1])));
    const { states } = parseMmd(fs.readFileSync(base + '.mmd', 'utf8'), path.basename(base + '.mmd'));
    const parents = new Set(states.map(s => s.parent).filter(Boolean));
    for (const s of states) if (s.kind !== 'choice' && !parents.has(s.id) && !marked.has(s.id)) lines.push(`${key}: no mark for state "${s.id}"`);
  }
  if (!lines.length && png) for (const f of files) await exportSheet({ html: out, sheet: path.basename(f, '.js'), state: null, story: true, svg: false, png: true, out: png });
  return lines;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  make(parse(process.argv.slice(2))).then(lines => {
    for (const l of lines) console.log(l);
    if (lines.length) process.exit(1);
    console.log('ok');
  }, e => { console.error(e.message); process.exit(2); });
}
