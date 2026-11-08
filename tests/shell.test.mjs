import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { dumpDom } from '../tinycharts/build/chrome.mjs';

const OUT = path.resolve('.tmp/test');
const page = (name, hash) => pathToFileURL(path.join(OUT, name + '.html')).href + hash;
const build = (src, name) => execFileSync(process.execPath, ['tinycharts/build/build.mjs', src, '-o', path.join(OUT, name + '.html')]);
const pre = (dom, id) => (dom.match(new RegExp(`<pre id="${id}"[^>]*>([^<]*)</pre>`)) || [])[1];
const lit = (dom, id) => {
  const tag = dom.match(new RegExp(`<g[^>]*data-state="${id}"[^>]*>`));
  return !!tag && /class="[^"]*\blit\b/.test(tag[0]);
};

before(() => { build('tests/fixtures/door.js', 'door'); build('tests/fixtures/door5.js', 'door5'); });

test('hash opens a state and lights it', async () => {
  const dom = await dumpDom(page('door', '#state=open'));
  assert.ok(lit(dom, 'open'), 'open is lit');
  assert.ok(!lit(dom, 'shut'), 'shut is not lit');
  assert.match(dom, /<body[^>]*data-ready="1"/);
});

test('fonts load from file://', async () => {
  const dom = await dumpDom(page('door', '#state=open'));
  assert.equal(pre(dom, 'fonts'), 'true true');
});

test('unknown state opens at the start and says so', async () => {
  const dom = await dumpDom(page('door', '#state=nope'));
  assert.match(dom, /Unknown state: nope/);
  assert.ok(lit(dom, 'shut'));
});

test('a press during an animation never stacks', async () => {
  const dom = await dumpDom(page('door', '#selftest=stack'));
  assert.equal(pre(dom, 'selftest'), '1');
});

test('a fifth button throws', async () => {
  const dom = await dumpDom(page('door5', ''));
  assert.match(dom, /At most 4 event buttons/);
});

test('audit lists text off the sheet', async () => {
  const dom = await dumpDom(page('door', '#selftest=overflow&audit=1'));
  assert.match(pre(dom, 'audit') || '', /off sheet/);
});

test('a clean sheet passes the audit', async () => {
  const dom = await dumpDom(page('door', '#audit=1'));
  assert.equal(pre(dom, 'audit'), '');
});

test('audit lists text on top of other text', async () => {
  const dom = await dumpDom(page('door', '#selftest=overlap&audit=1'));
  assert.match(pre(dom, 'audit') || '', /overlap: "one note" and "another"/);
});

test('a lit state passes the audit (its overlay covers its own text)', async () => {
  const dom = await dumpDom(page('door', '#state=open&audit=1'));
  assert.equal(pre(dom, 'audit'), '');
});

test('bare pages keep the whole sheet in view, even when the sheet follows', async () => {
  const dom = await dumpDom(page('door', '#bare=1&selftest=follow&state=open'));
  assert.match(dom, /<svg id="sheet"[^>]*viewBox="0 0 1400 1400"/);
});

test('a refused press shakes its button and says why', async () => {
  const dom = await dumpDom(page('door', '#selftest=no'));
  assert.equal(pre(dom, 'selftest'), '1 It is already shut.');
});

test('Play all asks the sheet to animate each step', async () => {
  const dom = await dumpDom(page('door', '#selftest=play'));
  assert.equal(pre(dom, 'selftest'), 'shut:true');
});

test('a still page never ticks, a live page does', async () => {
  assert.equal(pre(await dumpDom(page('door', '#selftest=tick&bare=1')), 'selftest'), 'none');
  assert.equal(pre(await dumpDom(page('door', '#selftest=tick')), 'selftest'), 'ticks');
});

test('Play all waits for a step to end its move before the next step', async () => {
  assert.equal(pre(await dumpDom(page('door', '#selftest=playwait')), 'selftest'), '1 2');
});

test('the Reset button stays when a sheet clears its buttons', async () => {
  assert.equal(pre(await dumpDom(page('door', '#selftest=reset')), 'selftest'), 'kept');
});

test('a press during Play all stops the play and never stacks', async () => {
  const dom = await dumpDom(page('door', '#selftest=playpress'));
  assert.equal(pre(dom, 'selftest'), '1 shut:true');
});

// Headless Chrome's virtual time does not run the camera's frames, so these
// read where the camera is going (the % shown), not the view box mid-move.
test('the zoom buttons zoom the sheet in, and Fit shows it whole', async () => {
  const dom = await dumpDom(page('door', '#selftest=zoom'));
  assert.equal(pre(dom, 'selftest'), '156% 100%');
});

test('a zoom the reader chose stays when the state changes', async () => {
  const dom = await dumpDom(page('door', '#selftest=zoomfollow'));
  assert.equal(pre(dom, 'selftest'), '195%');
});

test('a sheet focus with a hold does not undo the reader zoom', async () => {
  assert.equal(pre(await dumpDom(page('door', '#selftest=zoomhold')), 'selftest'), '156%');
});

test('a click that shakes a little is not a drag, a real drag is', async () => {
  assert.equal(pre(await dumpDom(page('door', '#selftest=jitter')), 'selftest'), '250%');
  assert.equal(pre(await dumpDom(page('door', '#selftest=pan')), 'selftest'), '170%');
});

test('audit=all audits every state, each line named by its state', async () => {
  assert.equal(pre(await dumpDom(page('door', '#audit=all')), 'audit'), '');
  const lines = pre(await dumpDom(page('door', '#audit=all&selftest=overlap')), 'audit');
  assert.match(lines, /^shut: overlap/m);
  assert.match(lines, /^open: overlap/m);
});

test('the paper grid fades out near the edges, in the page and the export', async () => {
  const dom = await dumpDom(page('door', '#state=open&export=1&bare=1'));
  assert.match(dom, /<rect id="grid"[^>]*mask="url\(#gridFade\)"/);
  assert.match(dom, /<mask id="gridFade"/);
  const svg = dom.match(/<textarea id="svgout"[^>]*>([\s\S]*?)<\/textarea>/)[1];
  assert.match(svg, /mask id=&quot;gridFade&quot;|mask id="gridFade"/);
});

test('a tap on a person with a say line shows it in a bubble', async () => {
  assert.equal(pre(await dumpDom(page('door', '#selftest=say')), 'selftest'), 'mind the step');
});
