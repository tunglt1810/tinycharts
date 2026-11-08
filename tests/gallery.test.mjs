import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { dumpDom } from '../tinycharts/build/chrome.mjs';

const OUT = path.resolve('.tmp/test/gallery.html');
const G = 'tests/fixtures/gallery/';
const url = hash => pathToFileURL(OUT).href + hash;

before(() => {
  execFileSync(process.execPath, ['tinycharts/build/build.mjs', G + 'a.js', G + 'b.js', '--gallery', G + 'gallery.json', '-o', OUT]);
});

test('a sheet in the gallery shows its place and stops at the end', async () => {
  const dom = await dumpDom(url('#sheet=b'));
  assert.match(dom, /<span id="pos">2 \/ 2<\/span>/);
  assert.match(dom, /<button id="next"[^>]*disabled/);
  assert.doesNotMatch(dom, /<button id="prev"[^>]*disabled/);
  assert.match(dom, /<b id="kindName">Sequence<\/b>/);
  assert.match(dom, /<small id="kindAbout">who says what to whom, in order<\/small>/);
});

test('without a sheet in the hash the page is the grid, by group', async () => {
  const dom = await dumpDom(url(''));
  assert.match(dom, /<body[^>]*data-ready="1"/);
  assert.ok(dom.indexOf('>Time<') < dom.indexOf('>Who<'), 'groups in spec order');
  assert.match(dom, /<a class="card" href="#sheet=a"/);
  assert.match(dom, /Timeline/);
});

test('a gallery entry with no sheet fails the build', () => {
  assert.throws(() => execFileSync(process.execPath, ['tinycharts/build/build.mjs', G + 'a.js', '--gallery', G + 'gallery.json', '-o', OUT + '.bad.html'], { stdio: 'pipe' }),
    e => /gallery\.json: no sheet for "b"/.test(e.stderr));
});
