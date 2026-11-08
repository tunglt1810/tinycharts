import test from 'node:test';
import assert from 'node:assert/strict';
import { loadKit } from './load-kit.mjs';

const PTS = [[0, 0], [200, 0], [200, 120]];

test('line repeats for one seed and changes with another', () => {
  const k = loadKit();
  k.begin(3); k.line(PTS); const a = k.out.join('');
  k.begin(3); k.line(PTS); assert.equal(k.out.join(''), a);
  k.begin(4); k.line(PTS); assert.notEqual(k.out.join(''), a);
});

test('hand stays near the input path', () => {
  const k = loadKit();
  k.begin(1);
  const h = k.hand([[0, 0], [300, 0]], 0.7, 2.2);
  for (const [, y] of h) assert.ok(Math.abs(y) <= 3, `y = ${y}`);
  assert.ok(h[0][0] < 0, `start x = ${h[0][0]}`);
  assert.ok(h.at(-1)[0] > 300, `end x = ${h.at(-1)[0]}`);
});

test('line uses no SVG filter', () => {
  const k = loadKit();
  k.begin(1); k.line([[0, 0], [50, 50]]);
  assert.doesNotMatch(k.out.join(''), /filter/);
});

test('line is one filled outline in the given colour', () => {
  const k = loadKit();
  k.begin(1); k.line(PTS, { w: 2, col: '#123456' });
  assert.equal(k.out.length, 1);
  assert.match(k.out[0], /^<path d="M[^"]+Z" fill="#123456"\/>$/);
});

test('rule draws many strokes as one path', () => {
  const k = loadKit();
  k.begin(1); k.rule([[[0, 0], [10, 0]], [[0, 5], [10, 5]], [[0, 10], [10, 10]]]);
  assert.equal(k.out.length, 1);
  assert.equal((k.out[0].match(/M/g) || []).length, 3);
});

test('hand keeps corners sharp unless asked to curve', () => {
  const k = loadKit();
  k.begin(2);
  const h = k.hand([[0, 0], [100, 0], [100, 100]]);
  const near = Math.min(...h.map(([x, y]) => Math.hypot(x - 100, y)));
  assert.ok(near < 1.5, `closest to the corner: ${near}`);
});

test('rim of a rectangle stays a rectangle', () => {
  const k = loadKit();
  k.begin(5);
  k.rim([[0, 0], [260, 0], [260, 160], [0, 160]], 1.6);
  const pts = [...k.out.join('').matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(m => [+m[1], +m[2]]);
  const off = ([x, y]) => Math.min(
    Math.abs(y) + Math.max(0, -x, x - 260), Math.abs(y - 160) + Math.max(0, -x, x - 260),
    Math.abs(x) + Math.max(0, -y, y - 160), Math.abs(x - 260) + Math.max(0, -y, y - 160));
  const worst = Math.max(...pts.map(off));
  assert.ok(worst < 4, `furthest from the rectangle: ${worst}`);
});

test('a long polyline keeps its middle corner', () => {
  const k = loadKit();
  k.begin(5);
  const h = k.hand([[40, 100], [300, 140], [160, 220], [60, 160]]);
  const near = Math.min(...h.map(([x, y]) => Math.hypot(x - 300, y - 140)));
  assert.ok(near < 2, `closest to the corner: ${near}`);
});

test('curve: true smooths through the points', () => {
  const k = loadKit();
  k.begin(5);
  const sharp = k.hand([[0, 0], [100, 0], [100, 100]]);
  k.begin(5);
  const soft = k.hand([[0, 0], [100, 0], [100, 100]], 0.7, 2.2, true);
  // distance from the L-shaped polyline: a curve swings wide of it near the corner
  const off = h => Math.max(...h.map(([x, y]) => Math.min(Math.abs(y) + Math.max(0, x - 100), Math.abs(x - 100) + Math.max(0, -y))));
  assert.ok(off(soft) > off(sharp) + 1, `soft ${off(soft)} vs sharp ${off(sharp)}`);
});
