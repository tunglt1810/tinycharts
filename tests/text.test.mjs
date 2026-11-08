import test from 'node:test';
import assert from 'node:assert/strict';
import { loadKit } from './load-kit.mjs';

test('label leads to its world point', () => {
  const k = loadKit();
  k.OX = 700; k.OY = 560;
  k.begin(1);
  k.label(72, 400, 'the shed', 'where the tools live', [120, 40, 30], 'start');
  const m = k.out.join('').match(/<circle class="tip" cx="(-?[\d.]+)" cy="(-?[\d.]+)"/);
  assert.ok(m, 'has a tip');
  const [px, py] = k.P(120, 40, 30);
  assert.ok(Math.hypot(+m[1] - px, +m[2] - py) < 1, `tip at ${m[1]},${m[2]} vs ${px},${py}`);
});

test('label text is escaped', () => {
  const k = loadKit();
  k.begin(1);
  k.label(72, 400, 'A & B', '<b>', [0, 0, 0]);
  assert.match(k.out.join(''), /A &amp; B/);
  assert.match(k.out.join(''), /&lt;b>/);
});

test('footnote wraps a long line inside maxW', () => {
  const k = loadKit();
  k.begin(1);
  const words = Array.from({ length: 60 }, (_, i) => 'word' + i).join(' ');
  k.footnote(words, 600);
  const lines = [...k.out.join('').matchAll(/<text class="it foot"[^>]*>([^<]*)<\/text>/g)].map(m => m[1]);
  assert.ok(lines.length > 1, `${lines.length} lines`);
  for (const l of lines) assert.ok(k.textW(l, 14.5) <= 600, `too long: ${l}`);
});

test('footnote stays on the sheet', () => {
  const k = loadKit();
  k.begin(1);
  k.footnote(Array.from({ length: 80 }, () => 'word').join(' '), 400);
  const ys = [...k.out.join('').matchAll(/<text class="it foot"[^>]*y="([\d.]+)"/g)].map(m => +m[1]);
  assert.ok(Math.max(...ys) <= k.SHEET_H - 40);
});

test('status writes the corner block the shell updates', () => {
  const k = loadKit();
  k.begin(1);
  k.status('0 of 7', 'nothing sent yet');
  const h = k.out.join('');
  assert.match(h, /id="sheetStatus"/);
  assert.match(h, /id="statusBig"[^>]*>0 of 7</);
  assert.match(h, /id="statusSmall"[^>]*>nothing sent yet</);
});

test('title writes the kicker and the big title', () => {
  const k = loadKit();
  k.begin(1);
  k.title('a sequence', 'Number 42, please');
  const h = k.out.join('');
  assert.match(h, /class="tt title"[^>]*>Number 42, please</);
  assert.match(h, /class="cap kicker"[^>]*>a sequence</);
});

test('pill grows with its text and lights in red', () => {
  const k = loadKit();
  const w = t => { k.begin(1); k.pill(0, 0, t); return +k.out.join('').match(/<rect[^>]*? width="([\d.]+)"/)[1]; };
  assert.ok(w('a much longer pill') > w('short'));
  k.begin(1); k.pill(0, 0, 'now', { lit: true });
  assert.match(k.out.join(''), new RegExp(`stroke="${k.RED}"`));
});

test('arrow ends in a head at its last world point', () => {
  const k = loadKit();
  k.OX = 0; k.OY = 0;
  k.begin(1);
  k.arrow([[0, 0], [100, 0]]);
  const head = k.out.join('').match(/<path class="head" d="M(-?[\d.]+) (-?[\d.]+)/);
  assert.ok(head);
  const [ex, ey] = k.P(100, 0, 0);
  assert.ok(Math.hypot(+head[1] - ex, +head[2] - ey) < 1);
});

test('route bends once between two world points', () => {
  const k = loadKit();
  k.begin(1);
  k.route([0, 0], [100, 60]);
  assert.match(k.out.join(''), /class="head"/);
});

test('legend, tag, nowTag, litRing, floorText and faceText draw', () => {
  const k = loadKit();
  k.begin(1);
  k.legend([{ col: '#e3c77a', text: 'knows' }, { col: '#c9d6e6', text: "hasn't heard" }], 72, 1300);
  k.tag(200, 200, 90, 'room 312');
  k.nowTag(300, 300);
  k.litRing([[0, 0], [40, 0], [40, 30], [0, 30]]);
  k.floorText(0, 0, 0, 'MARKET', { size: 20 });
  k.faceText('right', 0, 0, 20, 'BAKERY', { size: 14 });
  const h = k.out.join('');
  for (const s of ['knows', 'room 312', '>now<', 'MARKET', 'BAKERY']) assert.ok(h.includes(s), s);
  assert.match(h, /transform="matrix\(/);
});

test('flowArrow ends in a square head at its last sheet point', () => {
  const k = loadKit();
  k.begin(1);
  k.flowArrow([[100, 100], [100, 200]]);
  const head = k.out.join('').match(/<path class="head" d="M(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)/);
  assert.ok(head);
  assert.deepEqual([+head[1], +head[2]], [100, 200]);
  assert.equal(+head[4], +head[6], 'the base of the head is square to the line');
});

test('flowArrow can be dashed, for a way back', () => {
  const k = loadKit();
  k.begin(1);
  k.flowArrow([[0, 0], [0, 80]], { dashed: true });
  assert.match(k.out.join(''), /stroke-dasharray/);
});

test('tape gives each span a stretch to scale, end to end', () => {
  const k = loadKit();
  k.begin(1);
  const s = k.tape(-100, 0, 400, [{ sec: 60, col: k.PAL.sky }, { sec: 180, col: k.PAL.mustard }]);
  assert.deepEqual(s.map(x => [x.a, x.b]), [[-100, 0], [0, 300]]);
  assert.equal(s[1].m, 150);
  assert.ok(k.out.join('').length > 0, 'draws the stretches');
});
