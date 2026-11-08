import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { dumpDom } from '../tinycharts/build/chrome.mjs';

const OUT = path.resolve('.tmp/test');
const page = (name, hash) => pathToFileURL(path.join(OUT, name + '.html')).href + hash;
const build = (name, env = {}) => execFileSync(process.execPath, ['tinycharts/build/build.mjs', 'tests/fixtures/door.js', '--logic', '-o', path.join(OUT, name + '.html')],
  { env: { ...process.env, ...env }, encoding: 'utf8' });
let noPeleOut = '';

before(() => {
  execFileSync(process.execPath, ['tests/fixtures/door.check.mjs']);
  build('logic');
  noPeleOut = build('logic-nopele', { TINYCHARTS_NO_PELE: '1' });
});

test('the logic panel shows the rules and the flow chart', async () => {
  const dom = await dumpDom(page('logic', '#state=open'));
  assert.match(dom, /class="pele-node pele-state"/);
  assert.match(dom, /Never open while locked/);
  assert.match(dom, /breaks: Take away the unlocked guard and it breaks in 2 steps: lock, open\./);
});

test('the current state is marked in the flow chart', async () => {
  const dom = await dumpDom(page('logic', '#state=open'));
  const tag = dom.match(/<g[^>]*class="[^"]*pele-state[^"]*"[^>]*data-id="open"[^>]*>/);
  assert.ok(tag && /\bnow\b/.test(tag[0]), tag && tag[0]);
});

test('a state clicked in the flow chart lights up on the sheet', async () => {
  const dom = await dumpDom(page('logic', '#selftest=peek'));
  assert.match(dom, /<pre id="selftest">peek<\/pre>/);
});

test('without pele the build still works and keeps the rules', async () => {
  assert.match(noPeleOut, /note: door\.mmd: flow chart not drawn/);
  const dom = await dumpDom(page('logic-nopele', ''));
  assert.match(dom, /Never open while locked/);
  assert.doesNotMatch(dom, /class="pele-node pele-state"/);
});
