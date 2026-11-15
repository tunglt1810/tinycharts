import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TYPES } from '../tinycharts/build/types.mjs';

const SKILL = 'tinycharts/SKILL.md', REF = 'tinycharts/references/';
const read = f => fs.readFileSync(f, 'utf8');

test('SKILL.md has its front matter and stays short', () => {
  const s = read(SKILL);
  assert.match(s, /^---\nname: tinycharts\ndescription: .+\n---\n/);
  assert.ok(s.split('\n').length <= 220, `${s.split('\n').length} lines`);
});

test('every type has the same name and question in SKILL.md, README.md and its sheet', () => {
  const s = read(SKILL), readme = read('README.md');
  for (const { slug, name, question } of TYPES) {
    assert.ok(s.includes(`| ${name} | ${question} | \`examples/${slug}.js\` | \`references/${slug}.md\` |`), `router row for ${slug}`);
    assert.ok(readme.includes(`<b>${name}</b>: ${question}<br>`), `README caption for ${slug}`);
    assert.ok(read(`tinycharts/examples/${slug}.js`).includes(`const ABOUT = '${question}';`), `ABOUT of ${slug}`);
    assert.ok(fs.existsSync(`${REF}${slug}.md`), `references/${slug}.md`);
  }
});

test('kit.md names every kit function', () => {
  const kit = read(`${REF}kit.md`);
  for (const f of fs.readdirSync('tinycharts/kit')) {
    for (const [, name] of read(`tinycharts/kit/${f}`).matchAll(/^function ([a-zA-Z]\w*)/gm)) assert.match(kit, new RegExp(`\\b${name}\\(`), `${f}: ${name}`);
  }
});

test('sheet.md names the commands', () => {
  const s = read(`${REF}sheet.md`);
  for (const c of ['new.mjs', 'make.mjs', 'export.mjs', 'logos.mjs', 'icon.mjs']) assert.ok(s.includes(c), c);
});

// A template that reuses a kit name hides the kit function from every sheet
// copied from it, and a sheet that forgets its own helper gets the kit's.
test('no example declares a name of the kit', () => {
  const kit = fs.readdirSync('tinycharts/kit').map(f => read(`tinycharts/kit/${f}`)).join('\n');
  const names = new Set([...kit.matchAll(/^(?:function|const|let)\s+([A-Za-z_$][\w$]*)/gm)].map(m => m[1]));
  for (const f of fs.readdirSync('tinycharts/examples').filter(f => f.endsWith('.js'))) {
    const js = read(`tinycharts/examples/${f}`);
    const used = [...js.matchAll(/(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/g), ...js.matchAll(/,\s*([A-Za-z_$][\w$]*)\s*=(?!=)/g)]
      .map(m => m[1]).filter(n => names.has(n));
    assert.deepEqual([...new Set(used)], [], f);
  }
});
