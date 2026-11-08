import test from 'node:test';
import assert from 'node:assert/strict';
import { loadKit } from './load-kit.mjs';

test('P and at are inverse on the floor', () => {
  const k = loadKit();
  k.OX = 700; k.OY = 560;
  const [x, y] = k.at(...k.P(120, -40, 0));
  assert.ok(Math.abs(x - 120) < 1e-6, `x = ${x}`);
  assert.ok(Math.abs(y + 40) < 1e-6, `y = ${y}`);
});

test('P lifts by z on the sheet', () => {
  const k = loadKit();
  k.OX = 0; k.OY = 0;
  assert.deepEqual([...k.P(0, 0, 30)], [0, -30]);
});

test('rnd repeats for one seed', () => {
  const k = loadKit();
  k.begin(7); const a = [k.rnd(), k.rnd()];
  k.begin(7); const b = [k.rnd(), k.rnd()];
  assert.deepEqual(b, a);
  assert.notEqual(a[0], a[1]);
});

test('flush draws by key, then sub, then call order', () => {
  const k = loadKit();
  k.begin(1);
  k.put(5, 0, () => k.out.push('c'));
  k.put(1, 1, () => k.out.push('b'));
  k.put(1, 0, () => k.out.push('a'));
  k.flush();
  assert.equal(k.out.join(''), 'abc');
});

test('group wraps its drawing', () => {
  const k = loadKit();
  k.begin(1);
  k.group('data-state="x"', () => k.out.push('<path/>'));
  assert.equal(k.out.join(''), '<g data-state="x"><path/></g>');
});

test('finish writes the svg body into #art', () => {
  const k = loadKit();
  k.begin(1);
  k.put(0, 0, () => k.out.push('<path d="M0 0"/>'));
  k.finish();
  assert.match(k.__art.innerHTML, /<path d="M0 0"\/>/);
});

test('soften moves a colour toward the palette', () => {
  const k = loadKit();
  assert.notEqual(k.soften('#ff0000'), '#ff0000');
  assert.match(k.soften('#ff0000'), /^#[0-9a-f]{6}$/);
});

test('litOf is lighter and shadeOf is darker', () => {
  const k = loadKit();
  const lum = h => { const n = parseInt(h.slice(1), 16); return (n >> 16) + ((n >> 8) & 255) + (n & 255); };
  assert.ok(lum(k.litOf('#8899aa')) > lum('#8899aa'));
  assert.ok(lum(k.shadeOf('#8899aa')) < lum('#8899aa'));
});

test('pathOf writes rounded path data', () => {
  const k = loadKit();
  assert.equal(k.pathOf([[0, 0], [10.04, 5.06]]), 'M0 0L10 5.1');
  assert.equal(k.pathOf([[0, 0], [1, 1]], true), 'M0 0L1 1Z');
});
