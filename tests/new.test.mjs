import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('.tmp/test/new');
const env = { ...process.env, TINYCHARTS_EXAMPLES: path.resolve('tests/fixtures/types') };
const run = (...a) => spawnSync(process.execPath, ['tinycharts/build/new.mjs', ...a], { encoding: 'utf8', env });

before(() => fs.rmSync(OUT, { recursive: true, force: true }));

test('new copies the template of a type under a new name', () => {
  const r = run('flowchart', path.join(OUT, 'tyre'));
  assert.equal(r.status, 0, r.stderr);
  for (const ext of ['js', 'mmd', 'check.mjs']) assert.ok(fs.existsSync(path.join(OUT, `tyre.${ext}`)), ext);
  const chk = fs.readFileSync(path.join(OUT, 'tyre.check.mjs'), 'utf8');
  assert.match(chk, /'tyre\.mmd'/);
  assert.match(chk, /'tyre\.json'/);
  assert.doesNotMatch(chk, /flowchart\.(mmd|json)/);
});

test('new by the type name works too', () => {
  assert.equal(run('Flowchart', path.join(OUT, 'byname')).status, 0);
});

test('a wrong type name lists the closest and writes nothing', () => {
  const r = run('flowchrt', path.join(OUT, 'x'));
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /Unknown type "flowchrt"\. Closest: flowchart/);
  assert.ok(!fs.existsSync(path.join(OUT, 'x.js')));
});

test('new will not overwrite a sheet without --force', () => {
  const r = run('flowchart', path.join(OUT, 'tyre'));
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /already exists/);
  assert.equal(run('flowchart', path.join(OUT, 'tyre'), '--force').status, 0);
});

test('the copied check runs from any folder', () => {
  const at = path.join(OUT, 'a', 'b', 'c', 'tyre');
  assert.equal(run('flowchart', at).status, 0);
  const r = spawnSync(process.execPath, [at + '.check.mjs'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
});

test('new takes a second template of a type by its file name', () => {
  const r = run('flowchart-tech', path.join(OUT, 'shop'));
  assert.equal(r.status, 0, r.stderr);
  assert.match(fs.readFileSync(path.join(OUT, 'shop.check.mjs'), 'utf8'), /'shop\.mmd'/);
});
