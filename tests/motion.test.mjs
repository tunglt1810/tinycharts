import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { loadKit } from './load-kit.mjs';

const fakeEl = (data = {}) => {
  const el = { attrs: {}, style: {}, dataset: data, anims: [] };
  el.setAttribute = (k, v) => { el.attrs[k] = v; };
  el.animate = (frames, opts) => { const a = { frames, opts, cancelled: false, cancel() { a.cancelled = true; } }; el.anims.push(a); return a; };
  return el;
};
const fakeCtx = (still = false) => {
  const log = [];
  return { still, log, busy: j => log.push(['busy', j]), idle: () => log.push(['idle']) };
};
const nums = s => s.match(/-?\d+(\.\d+)?/g).map(Number);

test('easeInOut starts slow, ends slow and passes the middle at half', () => {
  const k = loadKit();
  assert.equal(k.easeInOut(0), 0);
  assert.equal(k.easeInOut(1), 1);
  assert.equal(k.easeInOut(0.5), 0.5);
  assert.ok(k.easeInOut(0.1) < 0.1 && k.easeInOut(0.9) > 0.9);
});

test('rise lifts, grows and fades a puff from its own point', () => {
  const k = loadKit(), el = fakeEl({ x: '100', y: '200' });
  k.rise(el, 0, 10, -60, 0.5, 1.5);
  assert.deepEqual(nums(el.attrs.transform), [100, 200, 0.5, -100, -200]);
  assert.equal(Number(el.style.opacity), 1);
  k.rise(el, 0.85, 10, -60, 0.5, 1.5);
  assert.ok(Number(el.style.opacity) > 0.45 && Number(el.style.opacity) < 0.55);
});

test('stroll walks to the end and back, with a small step bob', () => {
  const k = loadKit(), el = fakeEl();
  k.stroll(el, [[0, 0], [100, 0]], 0, 50);
  assert.deepEqual(nums(el.attrs.transform), [0, 0]);
  k.stroll(el, [[0, 0], [100, 0]], 2, 50);
  const [x, y] = nums(el.attrs.transform), [ex, ey] = [k.P(100, 0)[0] - k.P(0, 0)[0], k.P(100, 0)[1] - k.P(0, 0)[1]];
  assert.ok(Math.abs(x - ex) < 0.2 && y <= ey + 0.2 && y >= ey - 3.2, `at the end: ${x},${y}`);
  k.stroll(el, [[0, 0], [100, 0]], 4, 50);
  assert.ok(Math.abs(nums(el.attrs.transform)[0]) < 0.2, 'back at the start');
});

test('glideMs scales with distance and stays within the page-move range', () => {
  const k = loadKit();
  assert.equal(k.glideMs(100), 650);
  assert.equal(k.glideMs(300), 975);
  assert.ok(k.glideMs(10) >= 520);
  assert.ok(k.glideMs(5000) <= 1300);
});

test('glide in a still page jumps to the end at once', () => {
  const k = loadKit(), el = fakeEl(), ctx = fakeCtx(true);
  let done = 0;
  k.glide(ctx, el, [0, 0], [100, 0], { then: () => done++ });
  assert.equal(done, 1);
  assert.equal(el.anims.length, 0);
  assert.equal(ctx.log.length, 0);
});

test('glide moves along an arc, spins the wheels, and finishes once', () => {
  const k = loadKit(), el = fakeEl(), wheel = fakeEl(), ctx = fakeCtx();
  let done = 0;
  k.glide(ctx, el, [0, 0], [200, 0], { then: () => done++, arc: 30, spin: [wheel] });
  const [move] = el.anims, frames = move.frames.map(f => nums(f.transform));
  const [dx, dy] = [k.P(200, 0)[0] - k.P(0, 0)[0], k.P(200, 0)[1] - k.P(0, 0)[1]];
  assert.deepEqual(frames[0].slice(0, 2), [0, 0]);
  const end = frames[frames.length - 1];
  assert.ok(Math.abs(end[0] - dx) < 0.2 && Math.abs(end[1] - dy) < 0.2);
  const mid = frames[Math.floor(frames.length / 2)];
  assert.ok(mid[1] < dy / 2 - 20, 'lifted at the middle');
  assert.equal(move.opts.duration, k.glideMs(Math.hypot(dx, dy)));
  assert.equal(wheel.anims.length, 1);
  assert.equal(ctx.log[0][0], 'busy');
  const job = ctx.log[0][1];
  job.finish(); job.finish();
  assert.equal(done, 1);
  assert.ok(move.cancelled && wheel.anims[0].cancelled);
  assert.deepEqual(ctx.log.map(e => e[0]), ['busy', 'idle']);
});

test('arrive slides a redrawn thing in from where it was, a beat late', () => {
  const k = loadKit(), el = fakeEl();
  k.arrive({ still: false }, el, [0, 0], [100, 0], { delay: 80 });
  const [a] = el.anims, first = a.frames[0].transform.match(/-?\d+(\.\d+)?/g).map(Number);
  assert.ok(Math.abs(first[0] - (k.P(0, 0)[0] - k.P(100, 0)[0])) < 0.2);
  assert.match(a.frames[a.frames.length - 1].transform, /translate\(0px, ?0px\)/);
  assert.equal(a.opts.delay, 80);
  const still = fakeEl();
  k.arrive({ still: true }, still, [0, 0], [100, 0]);
  k.arrive({ still: false }, still, [5, 5], [5, 5]);
  assert.equal(still.anims.length, 0);
});

test('glide still finishes when a redraw takes its element away', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const k = loadKit(), el = fakeEl(), ctx = fakeCtx();
    let done = 0;
    k.glide(ctx, el, [0, 0], [100, 0], { then: () => done++ });
    mock.timers.tick(k.glideMs(Math.hypot(k.P(100, 0)[0] - k.P(0, 0)[0], k.P(100, 0)[1] - k.P(0, 0)[1])) + 100);
    assert.equal(done, 1);
    assert.deepEqual(ctx.log.map(e => e[0]), ['busy', 'idle']);
  } finally { mock.timers.reset(); }
});

test('hops in a still page jumps to the end at once', () => {
  const k = loadKit(), el = fakeEl(), ctx = fakeCtx(true);
  let done = 0;
  k.hops(ctx, el, [[0, 0], [100, 0], [200, 0]], { then: () => done++ });
  assert.equal(done, 1);
  assert.equal(el.anims.length, 0);
});

test('hops stops at every point, rests there, and finishes once', () => {
  const k = loadKit(), el = fakeEl(), ctx = fakeCtx();
  let done = 0;
  const pts = [[0, 0], [100, 0, 40], [200, 0]];
  k.hops(ctx, el, pts, { then: () => done++, rest: 100 });
  const [move] = el.anims, at = p => [k.P(...p)[0] - k.P(...pts[0])[0], k.P(...p)[1] - k.P(...pts[0])[1]];
  const legs = [1, 2].map(i => Math.hypot(...[0, 1].map(j => at(pts[i])[j] - at(pts[i - 1])[j])));
  assert.equal(move.opts.duration, k.glideMs(legs[0]) + 100 + k.glideMs(legs[1]));
  const frames = move.frames.map(f => [f.offset, ...nums(f.transform)]);
  const stop = frames.filter(f => Math.abs(f[1] - at(pts[1])[0]) < 0.2 && Math.abs(f[2] - at(pts[1])[1]) < 0.2);
  assert.ok(stop.length >= 2, 'stays at the middle point for its rest');
  const end = frames[frames.length - 1];
  assert.ok(Math.abs(end[1] - at(pts[2])[0]) < 0.2 && Math.abs(end[2] - at(pts[2])[1]) < 0.2);
  const job = ctx.log[0][1];
  job.finish(); job.finish();
  assert.equal(done, 1);
  assert.deepEqual(ctx.log.map(e => e[0]), ['busy', 'idle']);
});

test('dial points its hands at the time', () => {
  const k = loadKit();
  k.begin(1);
  k.dial(100, 100, 40, 9 * 60 + 30);
  const turns = [...k.out.join('').matchAll(/<g transform="rotate\((-?[\d.]+) 100 100\)"><g class="hand" data-per="(\d+)"/g)].map(m => [+m[2], +m[1]]);
  assert.deepEqual(turns, [[720, 285], [60, 180]]);
});

// A hand's turn at step k, read from its transform attribute: [deg, cx, cy].
const turnAt = (tw, h, k) => { tw.step(k); return nums(h.attrs.transform); };
const dialOf = (...hands) => ({ dataset: { cx: '100', cy: '100' }, querySelectorAll: () => hands });

test('sweep turns each hand as far as the time that passes, about the dial centre', () => {
  const k = loadKit(), h = fakeEl({ per: '720' }), m = fakeEl({ per: '60' }), dial = dialOf(h, m);
  const [th, tm] = k.sweep(fakeCtx(), dial, 0, 90, 1000);
  assert.deepEqual(turnAt(th, h, 1), [45, 100, 100]);
  assert.deepEqual(turnAt(tm, m, 1), [540, 100, 100]);
  assert.equal(h.style.transform, undefined, 'no CSS transform: it would move with the camera');
  assert.equal(k.sweep(fakeCtx(true), dial, 0, 90, 1000).length, 0, 'nothing turns in a still page');
  const wrap = { dataset: {}, querySelector: q => (q === '.dial' ? dial : null) };
  const [tw] = k.sweep(fakeCtx(), wrap, 0, 90, 1000);
  assert.deepEqual(turnAt(tw, h, 1), [45, 100, 100], 'a group round the dial turns the dial inside it');
});

test('sweep eases the hands in and out, and turns them back when time goes back', () => {
  const k = loadKit(), m = fakeEl({ per: '60' }), dial = dialOf(m);
  const [t] = k.sweep(fakeCtx(), dial, 0, 60, 1000);
  assert.ok(turnAt(t, m, 0.05)[0] < 360 * 0.05, 'slow at the start');
  assert.ok(Math.abs(turnAt(t, m, 0.5)[0] - 180) < 1, 'half way at half time');
  const [b] = k.sweep(fakeCtx(), dial, 60, 0, 1000);
  assert.equal(turnAt(b, m, 1)[0], -360);
});

test('sweepIn turns hands already drawn at the new time in from the old one', () => {
  const k = loadKit(), m = fakeEl({ per: '60' }), dial = dialOf(m);
  const [t] = k.sweepIn(fakeCtx(), dial, 0, 15, 800);
  assert.equal(turnAt(t, m, 0)[0], -90);
  assert.equal(turnAt(t, m, 1)[0], 0);
});

test('glide and hops turn a dial with the move, under the same lock', () => {
  const k = loadKit(), m = fakeEl({ per: '60' }), dial = dialOf(m);
  const g = fakeEl(), ctx = fakeCtx();
  k.glide(ctx, g, [0, 0, 0], [200, 0, 0], { clock: [dial, 0, 30] });
  assert.equal(nums(m.attrs.transform)[0], 0, 'starts at the old time');
  ctx.log[0][1].finish();
  const h = fakeEl(), ctx2 = fakeCtx();
  k.hops(ctx2, h, [[0, 0, 0], [100, 0, 0], [200, 0, 0]], { clock: [dial, 0, 30] });
  assert.equal(k.hopsMs([[0, 0, 0], [100, 0, 0], [200, 0, 0]]), h.anims[0].opts.duration);
  assert.deepEqual(ctx2.log.map(e => e[0]), ['busy']);
});

test('crossfade in a still page only redraws', () => {
  const k = loadKit();
  let n = 0;
  k.crossfade(fakeCtx(true), () => n++);
  assert.equal(n, 1);
});

test('tween steps from 0 to 1 under the lock, and in a still page jumps to 1', () => {
  const k = loadKit(), seen = [], ctx = fakeCtx();
  let done = 0;
  k.tween(ctx, 500, v => seen.push(v), () => done++);
  assert.deepEqual(seen, [0]);
  ctx.log[0][1].finish();
  assert.equal(done, 1);
  assert.deepEqual(ctx.log.map(e => e[0]), ['busy', 'idle']);
  const still = [];
  k.tween(fakeCtx(true), 500, v => still.push(v), () => done++);
  assert.deepEqual(still, [1]);
  assert.equal(done, 2);
});

test('hourglass shows the sand still to run in the top bulb', () => {
  const k = loadKit();
  k.begin(1); k.hourglass(0, 0, 0, { left: 1 });
  assert.match(k.out.join(''), /class="sand top"/);
  k.begin(1); k.hourglass(0, 0, 0, { left: 0 });
  assert.doesNotMatch(k.out.join(''), /class="sand top"/);
  assert.match(k.out.join(''), /class="sand bottom"/);
});

test('tween returns its job: finish jumps to the end once', () => {
  const k = loadKit(), ctx = fakeCtx();
  let done = 0;
  const job = k.tween(ctx, 500, () => {}, () => done++);
  job.finish(); job.finish();
  assert.equal(done, 1);
  assert.deepEqual(ctx.log.map(l => l[0]), ['busy', 'idle']);
  assert.equal(k.tween(fakeCtx(true), 500, () => {}), null, 'a still page has no job');
});
