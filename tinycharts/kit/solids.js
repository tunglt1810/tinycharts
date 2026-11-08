/* Tinycharts kit: solids and buildings. All take world coordinates.
   The viewer sees the top, the +x face (down-right on the sheet) and the
   +y face (down-left). Following the Free kit's naming, `left` colours the
   +x face and the +y face gets its shade. */

const _f3 = v => String(Math.round(v * 1000) / 1000);
const MARK = '#8a8277';

function faceM(face, x, y, z, s = 1) {
  const [e, f] = P(x, y, z);
  const m = face === 'top' ? [C, S, -C, S] : face === 'right' ? [C, -S, 0, 1] : [C, S, 0, 1];
  return `matrix(${m.map(v => _f3(v * s)).join(' ')} ${n1(e)} ${n1(f)})`;
}

// Construction lines that run on a little past a corner, as in a drafted plate.
function _marks(corners) {
  const pairs = [];
  for (const [p, q] of corners) {
    const dx = p[0] - q[0], dy = p[1] - q[1], d = Math.hypot(dx, dy) || 1;
    pairs.push([p, [p[0] + dx / d * 7, p[1] + dy / d * 7]]);
  }
  rule(pairs, MARK, 0.45);
}

function box(x, y, z, w, d, h, { top, left = PAL.shade, ink = 2, marks = true } = {}) {
  const x1 = x + w, y1 = y + d, z1 = z + h;
  const A = P(x, y, z1), B = P(x1, y, z1), Cc = P(x1, y1, z1), D = P(x, y1, z1);
  const E = P(x1, y, z), F = P(x1, y1, z), G = P(x, y1, z);
  fill([G, F, Cc, D], shadeOf(left));
  fill([E, F, Cc, B], left);
  fill([A, B, Cc, D], top || litOf(left));
  rim([A, B, E, F, G, D], ink * 0.8);
  rule([[Cc, B], [Cc, D], [Cc, F]], INK, ink * 0.55);
  if (marks) _marks([[F, E], [F, G], [D, A], [B, A]]);
}

function _ring(cx, cy, cz, r, n = 36) {
  const pts = [];
  for (let i = 0; i < n; i++) { const t = i / n * 2 * Math.PI; pts.push(P(cx + Math.cos(t) * r, cy + Math.sin(t) * r, cz)); }
  return pts;
}

// Front half of a horizontal circle, from its left extreme round the bottom to its right extreme.
// The sheet's left extreme is the world direction (-1, 1), the lowest point (1, 1), the right extreme (1, -1).
function _front(cx, cy, cz, r, n = 24) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = (0.75 - i / n) * Math.PI; pts.push(P(cx + Math.cos(t) * r, cy + Math.sin(t) * r, cz)); }
  return pts;
}

function turn(x, y, z, prof, col, { cap = null, ink = 0.9, seam = true, wall = 0, sink = 4 } = {}) {
  const k = 1.2247449, [cx, cy] = P(x, y, z);
  const L = prof.map(([r, h]) => [cx - r * k, cy - h]), R = prof.map(([r, h]) => [cx + r * k, cy - h]);
  const [r0, h0] = prof[0], [rt, ht] = prof[prof.length - 1];
  const bottom = _front(x, y, z + h0, r0), topBack = _front(x, y, z + ht, rt).map(([a, b]) => [a, 2 * (cy - ht) - b]).reverse();
  const body = [...L.slice().reverse(), ...bottom, ...R, ...topBack];
  fill(body, col);
  // a band of shade down the right side gives the body its roundness
  flat([...R.map(([a, b], i) => [a - prof[i][0] * k * 0.28, b]), ...R.slice().reverse()], 'rgba(58,52,48,.10)');
  const top = _ring(x, y, z + ht, rt);
  fill(top, wall ? shadeOf(col) : (cap || litOf(col)));
  if (wall) fill(_ring(x, y, z + ht - sink, Math.max(1, rt - wall)), cap || shadeOf(shadeOf(col)));
  line([...L.slice().reverse(), ...bottom, ...R], { w: ink * 1.6, over: 0 });
  rim(top, ink * 1.2);
  if (seam) for (let i = 1; i < prof.length - 1; i++) line(_front(x, y, z + prof[i][1], prof[i][0]), { w: ink * 0.6, over: 0 });
}

function cyl(x, y, z, r, h, col, { ink = 1.4, cap = null } = {}) { turn(x, y, z, [[r, 0], [r, h]], col, { cap, ink: ink * 0.7, seam: false }); }

// The ground: a cut slab with square corners, as in an architect's site model.
function board(x, y, w, d, h, top, side) { box(x, y, -h, w, d, h, { top, left: side, ink: 1.8, marks: false }); }

let _clipN = 0;
function clipped(pts, fn) {
  const id = 'c' + (++_clipN);
  out.push(`<clipPath id="${id}"><path d="${pathOf(pts, true)}"/></clipPath><g clip-path="url(#${id})">`);
  fn();
  out.push('</g>');
}

// A block with real walls: the roof deck is sunk behind a parapet you can see over.
function block(x, y, z, w, d, h, { wall = PAL.tan, deck = '#cfc6b8', t = 7, sink = 9, ink = 2 } = {}) {
  box(x, y, z, w, d, h, { left: wall, top: litOf(wall), ink });
  const zt = z + h, zd = zt - sink, xi = x + t, yi = y + t, xo = x + w - t, yo = y + d - t;
  const hole = [P(xi, yi, zt), P(xo, yi, zt), P(xo, yo, zt), P(xi, yo, zt)];
  clipped(hole, () => {
    fill([P(xi, yi, zd), P(xi, yo, zd), P(xi, yo, zt), P(xi, yi, zt)], shadeOf(wall));
    fill([P(xi, yi, zd), P(xo, yi, zd), P(xo, yi, zt), P(xi, yi, zt)], shadeOf(shadeOf(wall)));
    fill([P(xi, yi, zd), P(xo, yi, zd), P(xo, yo, zd), P(xi, yo, zd)], deck);
    rule([[P(xi, yi, zd), P(xo, yi, zd)], [P(xi, yi, zd), P(xi, yo, zd)]], INK, 0.7);
  });
  rim(hole, ink * 0.5);
}

function gable(x, y, w, d, h, rise, { wall = PAL.sand, roof = PAL.slate, eave = 8 } = {}) {
  const x1 = x + w, y1 = y + d, ym = y + d / 2, zr = h + rise;
  box(x, y, 0, w, d, h, { left: wall, top: wall });
  const end = [P(x1, y, h), P(x1, y1, h), P(x1, ym, zr)];
  fill(end, wall);
  rim(end, 1.6);
  // eaves stand off the walls a little on every side
  const back = [P(x - eave, y - eave * 0.6, h - eave * 0.6), P(x1 + eave, y - eave * 0.6, h - eave * 0.6), P(x1 + eave, ym, zr), P(x - eave, ym, zr)];
  const front = [P(x - eave, ym, zr), P(x1 + eave, ym, zr), P(x1 + eave, y1 + eave * 0.6, h - eave * 0.6), P(x - eave, y1 + eave * 0.6, h - eave * 0.6)];
  fill(back, shadeOf(roof)); rim(back, 1.4);
  fill(front, roof);
  const courses = [];
  for (let t = 0.12; t < 1; t += 0.12) {
    const a = [front[0][0] + (front[3][0] - front[0][0]) * t, front[0][1] + (front[3][1] - front[0][1]) * t];
    const b = [front[1][0] + (front[2][0] - front[1][0]) * t, front[1][1] + (front[2][1] - front[1][1]) * t];
    courses.push([a, b]);
  }
  rule(courses, INK, 0.5);
  rim(front, 1.7);
  line([front[0], front[1]], { w: 3.2 });
  line([front[3], front[2]], { w: 2.4 });
}

function _faceRect(face, x, y, z, w, h) {
  return face === 'R' ? [P(x, y, z), P(x, y - w, z), P(x, y - w, z + h), P(x, y, z + h)]
    : [P(x, y, z), P(x + w, y, z), P(x + w, y, z + h), P(x, y, z + h)];
}
function _inset(q, t) {
  const cx = q.reduce((s, p) => s + p[0], 0) / 4, cy = q.reduce((s, p) => s + p[1], 0) / 4;
  return q.map(([a, b]) => [a + (cx - a) * t, b + (cy - b) * t]);
}

function _window(face, x, y, z, w, h) {
  const o = _faceRect(face, x, y, z, w, h);
  fill(o, '#efe8da'); rim(o, 1.2);
  const g = _inset(o, 0.16);
  fill(g, '#aebfd2'); rim(g, 0.8);
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  rule([[mid(g[0], g[1]), mid(g[3], g[2])], [mid(g[0], g[3]), mid(g[1], g[2])]], INK, 0.7);
  line([[o[0][0] - (o[1][0] - o[0][0]) * 0.08, o[0][1] + 2], [o[1][0] + (o[1][0] - o[0][0]) * 0.08, o[1][1] + 2]], { w: 2.4 });
}
function windowL(x, y, z, w, h) { _window('L', x, y, z, w, h); }
function windowR(x, y, z, w, h) { _window('R', x, y, z, w, h); }

function _door(face, x, y, z, w, h, col) {
  const o = _faceRect(face, x, y, z, w, h);
  fill(o, col); rim(o, 1.4);
  const lo = _inset(_faceRect(face, x, y, z + h * 0.08, w, h * 0.4), 0.22), hi = _inset(_faceRect(face, x, y, z + h * 0.52, w, h * 0.4), 0.22);
  rim(lo, 0.7); rim(hi, 0.7);
  const kx = face === 'R' ? P(x, y - w * 0.82, z + h * 0.48) : P(x + w * 0.82, y, z + h * 0.48);
  out.push(`<circle cx="${n1(kx[0])}" cy="${n1(kx[1])}" r="1.8" fill="${INK}"/>`);
}
function doorL(x, y, z, w, h, col) { _door('L', x, y, z, w, h, col); }
function doorR(x, y, z, w, h, col) { _door('R', x, y, z, w, h, col); }

// A flight of steps climbing along axis ('x', 'y', '-x' or '-y'): n steps
// of `go` by `up`, `wd` wide. x, y is the foot. Steps that climb away from
// the viewer ('-x', '-y') are drawn top step first, so nearer steps cover it.
function flight(x, y, z, n, go, up, wd, axis = 'x', col = '#e4dbcb') {
  const back = axis[0] === '-', ax = axis.slice(-1);
  for (let k = 0; k < n; k++) {
    const i = back ? n - 1 - k : k, at = back ? -(i + 1) * go : i * go, o = { left: col, marks: false, ink: 1.4 };
    if (ax === 'x') box(x + at, y, z, go, wd, up * (i + 1), o);
    else box(x, y + at, z, wd, go, up * (i + 1), o);
  }
}

function fence(pts, { col = PAL.wood, post = 26, gap = 22 } = {}) {
  const posts = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const [a, b] = [pts[i], pts[i + 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / gap));
    for (let j = 0; j < n; j++) posts.push([a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n]);
  }
  posts.push(pts[pts.length - 1]);
  for (const zr of [post * 0.38, post * 0.78]) line(pts.map(([px, py]) => P(px, py, zr)), { w: 2.2, col: shadeOf(col) });
  for (const [px, py] of posts.sort((p, q) => (p[0] + p[1]) - (q[0] + q[1]))) box(px - 1.5, py - 1.5, 0, 3, 3, post, { left: col, marks: false, ink: 0.9 });
}

function _offset(pts, o) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    return [p[0] - dy * o, p[1] + dx * o];
  });
}

// A pipe along sheet points.
function pipe(pts, w, col = '#a6a4a4') {
  out.push(`<path d="${pathOf(pts)}" fill="none" stroke="${soften(col)}" stroke-width="${n1(w)}" stroke-linejoin="round"/>`);
  out.push(`<path d="${pathOf(_offset(pts, -w * 0.18))}" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="${n1(w * 0.22)}" stroke-linejoin="round"/>`);
  line(_offset(pts, w / 2), { w: 1.2, over: 0 });
  line(_offset(pts, -w / 2), { w: 1.2, over: 0 });
}
