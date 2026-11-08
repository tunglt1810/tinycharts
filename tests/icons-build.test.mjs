import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { PALETTE } from '../tinycharts/build/logo-lib.mjs';

const OUT = path.resolve('.tmp/test/icons.html');
const run = () => execFileSync(process.execPath, ['tinycharts/build/build.mjs', 'tests/fixtures/icons/sheet.js', '--icons', 'tests/fixtures/icons/logos', '-o', OUT], { encoding: 'utf8' });

test('a sheet that names a technology carries its logo, recoloured', () => {
  run();
  const html = fs.readFileSync(OUT, 'utf8'), logos = html.match(/const LOGOS = (\{.*\});/)[1];
  assert.match(logos, /kafka-probe/);
  assert.match(html, /const TECH = \{/);
  assert.match(logos, /"tint":"#[0-9a-f]{6}"/, 'kafka is one-colour, so it carries its tint');
  const pal = new Set(Object.values(PALETTE));
  for (const c of logos.match(/#[0-9a-f]{6}/gi) || []) assert.ok(pal.has(c), `${c} is in the palette`);
});

test('logos the sheet does not name stay out', () => {
  run();
  assert.doesNotMatch(fs.readFileSync(OUT, 'utf8'), /pg-probe/);
});

test('a technology with no logo builds with a note and prints its name', async () => {
  const stdout = run();
  assert.match(stdout, /note: redis: no logo, text fallback/);
  const { dumpDom } = await import('../tinycharts/build/chrome.mjs');
  const dom = await dumpDom('file://' + OUT);
  assert.match(dom, /data-ready="1"/);
  assert.match(dom, />Redis<\/text>/);
  assert.match(dom, /kafka-probe/);
});
