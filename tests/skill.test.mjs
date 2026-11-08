import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const SKILL = 'tinycharts/SKILL.md', REF = 'tinycharts/references/';
const read = f => fs.readFileSync(f, 'utf8');

test('SKILL.md has its front matter and stays short', () => {
  const s = read(SKILL);
  assert.match(s, /^---\nname: tinycharts\ndescription: .+\n---\n/);
  assert.ok(s.split('\n').length <= 220, `${s.split('\n').length} lines`);
});

test('every gallery sheet has a router row and a reference', () => {
  const s = read(SKILL), gallery = JSON.parse(read('tinycharts/examples/gallery.json'));
  for (const { key } of gallery) {
    assert.match(s, new RegExp(`\\| [^|]+ \\| [^|]+ \\| \`examples/${key}\\.js\` \\| \`references/${key}\\.md\` \\|`), `router row for ${key}`);
    assert.ok(fs.existsSync(`${REF}${key}.md`), `references/${key}.md`);
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
