import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('.tmp/test/export');
const HTML = path.join(DIR, 'door.html');
const run = (...args) => execFileSync(process.execPath, ['tinycharts/build/export.mjs', HTML, '--sheet', 'door', ...args], { encoding: 'utf8' });

before(() => {
  fs.rmSync(DIR, { recursive: true, force: true });
  execFileSync(process.execPath, ['tinycharts/build/build.mjs', 'tests/fixtures/door.js', '-o', HTML]);
  run('--state', 'open', '-o', path.join(DIR, 'one'));
  run('--story', '--svg', '-o', path.join(DIR, 'story'));
});

test('the PNG is the sheet at 1400 by 1400', () => {
  const b = fs.readFileSync(path.join(DIR, 'one', 'door-open.png'));
  assert.equal(b.toString('latin1', 1, 4), 'PNG');
  assert.deepEqual([b.readUInt32BE(16), b.readUInt32BE(20)], [1400, 1400]);
});

test('the SVG carries its fonts and the state', () => {
  const s = fs.readFileSync(path.join(DIR, 'one', 'door-open.svg'), 'utf8');
  assert.match(s, /@font-face/);
  assert.match(s, /data-state="open"/);
  assert.match(s, /^<svg [^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.equal((s.match(/class="on"/g) || []).length, 1, 'only the lit state keeps its marks');
});

test('rsvg-convert reads the SVG', () => {
  execFileSync('rsvg-convert', ['-o', path.join(DIR, 'one', 'check.png'), path.join(DIR, 'one', 'door-open.svg')]);
});

test('--story writes one file per story step, numbered from 01', () => {
  assert.deepEqual(fs.readdirSync(path.join(DIR, 'story')).sort(), ['door-01-shut.svg', 'door-02-open.svg', 'door-03-shut.svg']);
});

test('a sheet that never gets ready fails after 10 s', () => {
  const bad = path.join(DIR, 'door5.html');
  execFileSync(process.execPath, ['tinycharts/build/build.mjs', 'tests/fixtures/door5.js', '-o', bad]);
  assert.throws(() => execFileSync(process.execPath, ['tinycharts/build/export.mjs', bad, '-o', path.join(DIR, 'bad')], { stdio: 'pipe' }),
    e => /export: sheet not ready after 10 s/.test(e.stderr) && /At most 4 event buttons/.test(e.stderr));
});

test('an unknown state fails the export and writes nothing', () => {
  const out = path.join(DIR, 'nope');
  assert.throws(() => execFileSync(process.execPath, ['tinycharts/build/export.mjs', HTML, '--sheet', 'door', '--state', 'nope', '--svg', '-o', out], { encoding: 'utf8', stdio: 'pipe' }),
    e => /Unknown state: nope/.test(String(e.stderr)));
  assert.ok(!fs.existsSync(path.join(out, 'door-nope.svg')));
});
