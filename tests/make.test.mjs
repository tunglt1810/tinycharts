import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const make = (...a) => spawnSync(process.execPath, ['tinycharts/build/make.mjs', ...a], { encoding: 'utf8' });

test('make checks, builds and audits a clean sheet', () => {
  const r = make('tests/fixtures/door.js', '-o', '.tmp/test/make.html');
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('make fails on text on top of other text, in any state', () => {
  const r = make('tests/fixtures/crowd.js', '-o', '.tmp/test/crowd.html');
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /open: overlap: "one note" and "another"/);
});

test('make fails when a state of the statechart has no mark on the sheet', () => {
  const r = make('tests/fixtures/crowd.js', '-o', '.tmp/test/crowd.html');
  assert.match(r.stdout, /no mark for state "bolted"/);
});
