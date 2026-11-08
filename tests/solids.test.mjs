import test from 'node:test';
import assert from 'node:assert/strict';
import { loadKit } from './load-kit.mjs';

// colour washes carry a stroke attribute; the texture overlay does not
const washes = html => [...html.matchAll(/fill="(#[0-9a-f]{6})" stroke=/g)].map(m => m[1]);

test('box fills its three faces in order: +y, +x, top', () => {
  const k = loadKit();
  k.begin(1);
  k.box(0, 0, 0, 100, 60, 40, { top: '#e9dcc2', left: '#c9d6e6' });
  assert.deepEqual(washes(k.out.join('')), [k.soften(k.shadeOf('#c9d6e6')), k.soften('#c9d6e6'), k.soften('#e9dcc2')]);
});

test('box top defaults to a lighter left', () => {
  const k = loadKit();
  k.begin(1);
  k.box(0, 0, 0, 10, 10, 10, { left: '#c9d6e6' });
  assert.equal(washes(k.out.join(''))[2], k.soften(k.litOf('#c9d6e6')));
});

test('faceM maps flat art onto the +x face', () => {
  const k = loadKit();
  assert.match(k.faceM('right', 0, 0, 0), /^matrix\(0\.866 -0\.5 0 1 /);
  assert.match(k.faceM('left', 0, 0, 0), /^matrix\(0\.866 0\.5 0 1 /);
  assert.match(k.faceM('top', 0, 0, 0), /^matrix\(0\.866 0\.5 -0\.866 0\.5 /);
});

test('faceM places the origin at the world point', () => {
  const k = loadKit();
  k.OX = 700; k.OY = 560;
  const [sx, sy] = k.P(20, 30, 40);
  assert.ok(k.faceM('right', 20, 30, 40, 2).endsWith(` ${k.n1(sx)} ${k.n1(sy)})`));
});

test('a nearer box queued with put is drawn later', () => {
  const k = loadKit();
  k.begin(1);
  k.put(200, 0, () => k.group('id="near"', () => k.box(100, 100, 0, 40, 40, 40, {})));
  k.put(0, 0, () => k.group('id="far"', () => k.box(0, 0, 0, 40, 40, 40, {})));
  k.flush();
  const h = k.out.join('');
  assert.ok(h.indexOf('id="far"') < h.indexOf('id="near"'));
});

test('turn draws a body and its outline', () => {
  const k = loadKit();
  k.begin(1);
  k.turn(0, 0, 0, [[30, 0], [34, 40], [16, 62]], '#a6c2d0');
  const h = k.out.join('');
  assert.ok(washes(h).length >= 2, 'body and top washes');
  assert.match(h, /fill="#2b2a28"/);
});

test('block sinks its deck behind a parapet', () => {
  const k = loadKit();
  k.begin(1);
  k.block(0, 0, 0, 120, 80, 50, { wall: '#cdb68e', deck: '#cfc6b8' });
  const h = k.out.join('');
  assert.match(h, /<clipPath id="c\d+">/);
  assert.ok(washes(h).includes(k.soften('#cfc6b8')));
});

test('gable draws walls, a gable end and two roof planes', () => {
  const k = loadKit();
  k.begin(1);
  k.gable(0, 0, 120, 80, 50, 40, { wall: '#e9dcc2', roof: '#8e96a3' });
  const w = washes(k.out.join(''));
  assert.ok(w.filter(c => c === k.soften('#8e96a3') || c === k.soften(k.shadeOf('#8e96a3'))).length >= 2);
});

test('flight draws one solid per step', () => {
  const k = loadKit();
  k.begin(1);
  k.flight(0, 0, 0, 4, 12, 8, 30);
  assert.equal(washes(k.out.join('')).length, 12);
});

test('windows and doors sit on their face', () => {
  const k = loadKit();
  k.begin(1);
  k.windowR(100, 50, 20, 30, 24);
  k.doorL(20, 60, 0, 20, 40, '#c8836b');
  assert.ok(k.out.length > 0);
  assert.ok(washes(k.out.join('')).includes(k.soften('#c8836b')));
});

test('board, cyl, fence and pipe draw ink', () => {
  const k = loadKit();
  k.begin(1);
  k.board(-50, -50, 300, 200, 20, '#dfe8d6', '#b1bea5');
  k.cyl(0, 0, 0, 20, 40, '#c9d6e6');
  k.fence([[0, 0], [100, 0], [100, 80]]);
  k.pipe([[0, 0], [80, 0], [80, 60]], 8, '#a6a4a4');
  assert.ok((k.out.join('').match(/fill="#2b2a28"/g) || []).length >= 8);
});

test('a cylinder bottom bulges toward the viewer', () => {
  const k = loadKit();
  k.OX = 0; k.OY = 0;
  k.begin(1);
  k.cyl(0, 0, 0, 20, 40, '#c9d6e6');
  const ys = [...k.out[0].matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(m => +m[2]);
  // the circle's lowest sheet point is r*sqrt(2)*S below its centre
  assert.ok(Math.max(...ys) > 12, `lowest body point ${Math.max(...ys)}`);
});

test('a flight along -x climbs away from the viewer and stays behind its foot', () => {
  const k = loadKit();
  k.OX = 0; k.OY = 0;
  k.begin(1);
  k.flight(0, 0, 0, 4, 12, 8, 30, '-x');
  const h = k.out.join('');
  assert.equal(washes(h).length, 12);
  const xs = [...h.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(m => +m[1]);
  assert.ok(Math.max(...xs) < 5, `max sheet x ${Math.max(...xs)}`);
});
