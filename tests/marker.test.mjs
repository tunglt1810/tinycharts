import test from 'node:test';
import assert from 'node:assert/strict';
import { loadKit } from './load-kit.mjs';

const SQ = [[0, 0], [100, 0], [100, 60], [0, 60]];

test('fill repeats for one seed', () => {
  const k = loadKit();
  k.begin(9); k.fill(SQ, '#c9d6e6'); const a = k.out.join('');
  k.begin(9); k.fill(SQ, '#c9d6e6');
  assert.equal(k.out.join(''), a);
});

test('fill uses the softened colour', () => {
  const k = loadKit();
  k.begin(1); k.fill(SQ, '#ff0000');
  assert.ok(k.out.join('').includes(`fill="${k.soften('#ff0000')}"`));
  assert.ok(!k.out.join('').includes('fill="#ff0000"'));
});

test('fill lays the paper texture over the colour', () => {
  const k = loadKit();
  k.begin(1); k.fill(SQ, PALE());
  assert.match(k.out.join(''), /fill="url\(#tex\)"/);
  function PALE() { return '#e9dcc2'; }
});

test('toothDefs is a vector pattern, not an image', () => {
  const k = loadKit();
  const d = k.toothDefs();
  assert.match(d, /<pattern id="tex"/);
  assert.doesNotMatch(d, /data:image|<image/);
});

test('toothDefs does not disturb the sheet seed', () => {
  const k = loadKit();
  k.begin(4); const a = k.rnd();
  k.begin(4); k.toothDefs(); const b = k.rnd();
  assert.equal(b, a);
});

test('shadows are drawn under everything queued with put', () => {
  const k = loadKit();
  k.begin(1);
  k.put(0, 0, () => k.out.push('<path id="solid"/>'));
  k.cast(0, 0, 40, 40, 30);
  k.finish();
  const html = k.__art.innerHTML;
  assert.ok(html.indexOf('class="shadow"') >= 0, 'has a shadow');
  assert.ok(html.indexOf('class="shadow"') < html.indexOf('id="solid"'));
});

test('hatch puts lines only inside the polygon', () => {
  const k = loadKit();
  k.begin(1); k.hatch(SQ, { dir: [0, 1], gap: 10, keep: 1 });
  const xs = [...k.out.join('').matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(m => +m[1]);
  assert.ok(xs.length > 0);
  assert.ok(Math.min(...xs) > -4 && Math.max(...xs) < 104, `x range ${Math.min(...xs)}..${Math.max(...xs)}`);
});
