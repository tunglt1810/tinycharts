// Motion. Durations and curves follow the LottieFiles motion-design tables:
// on-screen moves ease in and out, a move takes longer the further it goes,
// and nothing moves in a still page (bare or export), so pictures match.

const easeInOut = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

// A puff of steam or smoke: rises by (dx, dy), grows from s0 to s1, fades in
// its last 30%. k runs 0..1. The puff sits at sheet point data-x, data-y.
function rise(el, k, dx, dy, s0, s1) {
  const x = +el.dataset.x, y = +el.dataset.y, s = s0 + (s1 - s0) * k;
  el.setAttribute('transform', `translate(${n1(x + dx * k)} ${n1(y + dy * k)}) scale(${s.toFixed(2)}) translate(${-x} ${-y})`);
  el.style.opacity = k < 0.7 ? '1' : ((1 - k) / 0.3).toFixed(2);
}

// Someone pacing: to the end of world path pts and back, at speed world
// units a second, with a small bob for each step.
function stroll(el, pts, t, speed, phase = 0) {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const L = seg.reduce((a, b) => a + b, 0) || 1, u = (((t * speed + phase) % (2 * L)) + 2 * L) % (2 * L);
  let r = u < L ? u : 2 * L - u, i = 0;
  while (i < seg.length - 1 && r > seg[i]) { r -= seg[i]; i++; }
  const f = r / (seg[i] || 1), x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
  const a = P(...pts[0]), b = P(x, y), bob = Math.abs(Math.sin(t * 7 + phase)) * 3;
  el.setAttribute('transform', `translate(${n1(b[0] - a[0])} ${n1(b[1] - a[1] - bob)})`);
}

// Page-move time scaled by distance, as in the tables, but at 650 ms for
// 100 px, not 450: the table time is for a page, and a reader follows a
// sheet's move as the story, so the table time read as a jump.
const _FAR = [[0, 0.8], [50, 0.8], [100, 1], [200, 1.3], [300, 1.5], [400, 1.6], [800, 2]];
function glideMs(d) {
  let i = 1;
  while (i < _FAR.length - 1 && d > _FAR[i][0]) i++;
  const [d0, s0] = _FAR[i - 1], [d1, s1] = _FAR[i], k = Math.min(1, Math.max(0, (d - d0) / (d1 - d0)));
  return Math.round(650 * (s0 + (s1 - s0) * k));
}

// Moves a drawn thing from world point a to b on a low arc, with a small
// step back first. Wheels in spin turn as far as they would roll. then()
// runs once at the end, or at once in a still page; redraw there.
function glide(ctx, el, a, b, { then = () => {}, arc = 36, spin = [], radius = 18, clock = null, follow = 0, ms = 0 } = {}) {
  if (ctx.still || !el || !el.animate) { then(); return; }
  const [ax, ay] = P(...a), [bx, by] = P(...b), dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy);
  const N = 24, frames = [];
  ms = ms || glideMs(d);
  for (let j = 0; j <= N; j++) {
    const k = j / N, back = k < 0.2 ? -0.04 * Math.sin(Math.PI * k / 0.2) : 0, u = easeInOut(k) + back;
    frames.push({ offset: k, transform: `translate(${n1(dx * u)}px,${n1(dy * u - arc * Math.sin(Math.PI * easeInOut(k)))}px)` });
  }
  const anims = [el.animate(frames, { duration: ms, fill: 'forwards' })];
  const turn = Math.sign(dx || 1) * (d / radius) * 180 / Math.PI;
  for (const w of spin) {
    w.style.transformBox = 'fill-box'; w.style.transformOrigin = 'center';
    anims.push(w.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${n1(turn)}deg)` }], { duration: ms, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }));
  }
  if (clock) anims.push(..._turn(clock[0], clock[1], clock[2], 0, ms));
  _camFollow(ctx, el, follow);
  _job(ctx, anims, ms, () => { if (follow && ctx.track) ctx.track(null); then(); });
}

// follow: the camera keeps el in view while it moves, follow sheet pixels wide.
function _camFollow(ctx, el, follow) {
  if (follow && ctx.track) ctx.track(el, follow === true ? undefined : follow);
}

// A redraw can replace el before its animation ends, so a timer ends the job too.
function _job(ctx, anims, ms, then) {
  const job = { done: false, finish() {
    if (job.done) return;
    job.done = true;
    clearTimeout(safety);
    for (const x of anims) x.cancel();
    then(); ctx.idle(job);
  } };
  const safety = setTimeout(job.finish, ms + 50);
  anims[0].onfinish = job.finish;
  ctx.busy(job);
}

// Moves a drawn thing along world points pts, one low hop per leg, with a
// short rest at each point between: a message going from hop to hop.
function hops(ctx, el, pts, { then = () => {}, arc = 24, rest = 140, clock = null, follow = 0 } = {}) {
  if (ctx.still || !el || !el.animate || pts.length < 2) { then(); return; }
  const s = pts.map(p => P(...p)), d = s.map(([x, y]) => [x - s[0][0], y - s[0][1]]);
  const legs = d.slice(1).map((p, i) => [d[i], p, glideMs(Math.hypot(p[0] - d[i][0], p[1] - d[i][1]))]);
  const ms = hopsMs(pts, { rest }), N = 12, frames = [];
  let t = 0;
  legs.forEach(([a, b, lm], i) => {
    for (let j = i ? 1 : 0; j <= N; j++) {
      const k = j / N, u = easeInOut(k);
      frames.push({ offset: (t + lm * k) / ms, transform: `translate(${n1(a[0] + (b[0] - a[0]) * u)}px,${n1(a[1] + (b[1] - a[1]) * u - arc * Math.sin(Math.PI * k))}px)` });
    }
    t += lm;
    if (i < legs.length - 1) { t += rest; frames.push({ offset: t / ms, transform: frames[frames.length - 1].transform }); }
  });
  const anims = [el.animate(frames, { duration: ms, fill: 'forwards' })];
  if (clock) anims.push(..._turn(clock[0], clock[1], clock[2], 0, ms));
  _camFollow(ctx, el, follow);
  _job(ctx, anims, ms, () => { if (follow && ctx.track) ctx.track(null); then(); });
}

// How long hops takes over world points pts, so a sheet can time other
// motion (a floor hand, a dial) to end with it.
function hopsMs(pts, { rest = 140 } = {}) {
  const s = pts.map(p => P(...p));
  return s.slice(1).reduce((t, p, i) => t + glideMs(Math.hypot(p[0] - s[i][0], p[1] - s[i][1])), 0) + rest * Math.max(0, pts.length - 2);
}

// For a thing that a redraw moved from world point a to b: slides it in
// from a, so it follows the main move a beat behind instead of jumping.
function arrive(ctx, el, a, b, { delay = 0 } = {}) {
  if (ctx.still || !el || !el.animate || (a[0] === b[0] && a[1] === b[1])) return;
  const [ax, ay] = P(...a), [bx, by] = P(...b);
  el.animate([{ transform: `translate(${n1(ax - bx)}px,${n1(ay - by)}px)` }, { transform: 'translate(0px,0px)' }],
    { duration: glideMs(Math.hypot(ax - bx, ay - by)), delay, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'backwards' });
}

// Turns the hands of a dial (drawn by dial) on from m0 to m1 minutes in ms,
// easing in and out like the move it rides with; back if m1 < m0. The
// redraw after the move puts the hands at the new time for good.
function sweep(ctx, el, m0, m1, ms) {
  return ctx.still ? [] : _turn(el, m0, m1, 0, ms);
}

// For a dial that a redraw already drew at m1: turns its hands in from m0.
function sweepIn(ctx, el, m0, m1, ms) {
  return ctx.still ? [] : _turn(el, m0, m1, m0 - m1, ms);
}

// The hands turn through their transform attribute, about the dial centre in
// their own units. A CSS transform-origin in view-box units moves with the
// camera's view box, which sent the hands off the dial on a zoomed sheet.
// el may be the dial or a group round it: sheets pass either.
function _turn(el, m0, m1, base, ms) {
  const d = el && (el.dataset && el.dataset.cx ? el : el.querySelector && el.querySelector('.dial'));
  if (!d) return [];
  const { cx, cy } = d.dataset;
  return [...d.querySelectorAll('.hand')].map(h => _raf(ms, k => {
    h.setAttribute('transform', `rotate(${n1((base + (m1 - m0) * easeInOut(k)) / +h.dataset.per * 360)} ${cx} ${cy})`);
  }));
}

// A frame loop with the face of an Animation: step(k) gets k from 0 to 1,
// cancel() stops it, onfinish runs after the last step.
function _raf(ms, step) {
  const a = { step, onfinish: null, done: false, cancel() { a.done = true; } };
  step(0);
  if (typeof requestAnimationFrame !== 'function') return a;
  const t0 = performance.now();
  const f = now => {
    if (a.done) return;
    const k = Math.min(1, Math.max(0, (now - t0) / ms));
    step(k);
    if (k < 1) requestAnimationFrame(f);
    else { a.done = true; if (a.onfinish) a.onfinish(); }
  };
  requestAnimationFrame(f);
  return a;
}

// Walks a drawn thing along world points pts at a steady pace, with a small
// step bob: one smooth move, no stops. onStep(k, d, [sx, sy]) runs each frame
// with the distance d walked in sheet pixels, to leave a trail behind.
function walk(ctx, el, pts, { then = () => {}, ms = 0, bob = 2.5, follow = 0, clock = null, onStep = null } = {}) {
  const sp = pts.map(p => P(...p));
  const seg = sp.slice(1).map((p, i) => Math.hypot(p[0] - sp[i][0], p[1] - sp[i][1])), L = seg.reduce((a, b) => a + b, 0);
  ms = ms || Math.min(4200, Math.max(1200, L * 8));
  if (ctx.still || !el || sp.length < 2) { then(); return; }
  if (clock) sweep(ctx, clock[0], clock[1], clock[2], ms);
  _camFollow(ctx, el, follow);
  tween(ctx, ms, k => {
    let r = k * L, i = 0;
    while (i < seg.length - 1 && r > seg[i]) { r -= seg[i]; i++; }
    const f = seg[i] ? r / seg[i] : 0, x = sp[i][0] + (sp[i + 1][0] - sp[i][0]) * f, y = sp[i][1] + (sp[i + 1][1] - sp[i][1]) * f;
    el.style.transform = `translate(${n1(x - sp[0][0])}px,${n1(y - sp[0][1] - Math.abs(Math.sin(k * L / 9)) * bob)}px)`;
    if (onStep) onStep(k, k * L, [x, y]);
  }, () => { if (follow && ctx.track) ctx.track(null); then(); });
}

// Redraws the sheet, then fades the old picture out over the new one, so
// what a redraw changes (a light, a fire, a sign) changes softly.
function crossfade(ctx, redraw, ms = 650) {
  const art = typeof document !== 'undefined' && document.getElementById('art');
  if (ctx.still || !art || !art.cloneNode) { redraw(); return; }
  const old = art.cloneNode(true);
  // the copy keeps no ids, so lookups and url(#…) find the new picture
  old.removeAttribute('id');
  for (const el of old.querySelectorAll('[id]')) el.removeAttribute('id');
  old.setAttribute('pointer-events', 'none');
  redraw();
  art.after(old);
  tween(ctx, ms, k => { old.setAttribute('opacity', (1 - k).toFixed(3)); }, () => old.remove());
}

// Runs step(k), k from 0 to 1 eased, on each frame for ms, under the
// animation lock like glide; then() once at the end. For a move the kit has
// no helper for: a level that rises, a hand on a big dial, a belt.
function tween(ctx, ms, step, then = () => {}) {
  if (ctx.still) { step(1); then(); return; }
  _job(ctx, [_raf(ms, k => step(easeInOut(k)))], ms, then);
}
