import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { build } from '../tinycharts/build/build.mjs';
import { PAL } from '../tinycharts/build/logo-lib.mjs';

const OUT = path.resolve('.tmp/test/theme');
fs.mkdirSync(OUT, { recursive: true });
const theme = (name, obj) => { const f = path.join(OUT, name + '.json'); fs.writeFileSync(f, JSON.stringify(obj)); return f; };

test('a theme swaps each named colour on the whole page, once', async () => {
  // red becomes ink and ink becomes red: one pass must not swap them back.
  const f = theme('swap', { red: PAL.ink, ink: PAL.red });
  const plain = fs.readFileSync(await build({ files: ['tests/fixtures/door.js'], out: path.join(OUT, 'plain.html') }), 'utf8');
  const html = fs.readFileSync(await build({ files: ['tests/fixtures/door.js'], out: path.join(OUT, 'door.html'), theme: f }), 'utf8');
  const count = (s, c) => s.split(new RegExp(c, 'i')).length - 1;
  assert.ok(count(plain, PAL.red) > 0 && count(plain, PAL.ink) > 0);
  assert.equal(count(html, PAL.red), count(plain, PAL.ink));
  assert.equal(count(html, PAL.ink), count(plain, PAL.red));
});

test('the sample themes name only PAL colours', async () => {
  const dir = 'tinycharts/themes';
  for (const f of fs.readdirSync(dir)) await build({ files: ['tests/fixtures/door.js'], out: path.join(OUT, f + '.html'), theme: path.join(dir, f) });
});

test('a theme with an unknown name or a bad colour is refused', async () => {
  const out = path.join(OUT, 'bad.html');
  await assert.rejects(build({ files: ['tests/fixtures/door.js'], out, theme: theme('name', { purple: '#800080' }) }), /"purple" is not a PAL colour/);
  await assert.rejects(build({ files: ['tests/fixtures/door.js'], out, theme: theme('hex', { red: 'red' }) }), /"red" must be a colour like #b5483b/);
});
