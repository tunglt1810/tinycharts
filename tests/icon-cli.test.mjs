import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('.tmp/test/iconout');
const icon = (...a) => spawnSync(process.execPath, ['tinycharts/build/icon.mjs', ...a, '--offline', '--icons', 'tests/fixtures/icons/logos', '-o', OUT], { encoding: 'utf8' });

before(() => fs.rmSync(OUT, { recursive: true, force: true }));

test('writes an SVG and a PNG for one technology', () => {
  const r = icon('Kafka');
  assert.equal(r.status, 0, r.stderr);
  const png = fs.readFileSync(path.join(OUT, 'kafka.png'));
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [320, 320]);
  const svg = fs.readFileSync(path.join(OUT, 'kafka.svg'), 'utf8');
  assert.match(svg, /kafka-probe/);
  assert.doesNotMatch(svg, /id="paper"|id="grid"/, 'the SVG has no paper behind it');
  assert.match(svg, /scale\(1\.55\)/, 'the object is drawn large, to fill the icon');
});

test('keeps a file that exists', () => {
  const before = fs.statSync(path.join(OUT, 'kafka.svg')).mtimeMs;
  const r = icon('kafka');
  assert.match(r.stdout, /kafka: kept/);
  assert.equal(fs.statSync(path.join(OUT, 'kafka.svg')).mtimeMs, before);
});

test('an unknown name fails with the closest names', () => {
  const r = icon('kafak');
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /Unknown technology "kafak"\. Closest: kafka/);
});
