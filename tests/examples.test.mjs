// Every sheet in the gallery: its files, its rules, and a clean make (which
// audits every state and finds states with no mark on the sheet).
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const EX = 'tinycharts/examples/', REF = 'tinycharts/references/';
const gallery = JSON.parse(fs.readFileSync(EX + 'gallery.json', 'utf8'));

// flowchart-tech is a second flowchart template, for a long technical flow.
for (const key of [...gallery.map(g => g.key), 'flowchart-tech']) {
  test(`${key}: files, rules, make, a mark for every state`, () => {
    for (const ext of ['js', 'mmd', 'check.mjs', 'json']) assert.ok(fs.existsSync(`${EX}${key}.${ext}`), `${key}.${ext}`);
    const ref = key.replace(/-tech$/, '');
    assert.ok(fs.existsSync(`${REF}${ref}.md`), `references/${ref}.md`);
    const r = spawnSync(process.execPath, ['tinycharts/build/make.mjs', `${EX}${key}.js`, '-o', `.tmp/test/examples/${key}.html`], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const json = JSON.parse(fs.readFileSync(`${EX}${key}.json`, 'utf8'));
    assert.match(json.checked, /All \d+ rules hold\./);
  });
}
