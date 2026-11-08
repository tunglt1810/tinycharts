/* Tinycharts kit: people, animals and plants. They stay round and friendly,
   however exact the buildings around them are. The doll's proportions,
   poses, limbs and hair are ported from statechart-art's tools/lib/people.js
   (MIT, Kevin T. Ngo). */

const SKIN = '#f2dcc5', HAIR = '#3b3330', PAPERW = '#fffdf8';

function oval(cx, cy, rx, ry = rx, n = 20) {
  const pts = [];
  for (let i = 0; i < n; i++) { const t = i / n * 2 * Math.PI; pts.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]); }
  return pts;
}

// Smooth outline through a few points (closed by default).
function spline(pts, closed = true, step = 1.4) {
  if (!closed) return _catmull(pts, step);
  const n = pts.length, res = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const m = Math.max(1, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = 0; k < m; k++) {
      const t = k / m, t2 = t * t, t3 = t2 * t;
      res.push([0, 1].map(c => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  return res;
}

// A soft round shape; bump > 0 makes it lumpy like a bush.
function blob(cx, cy, rx, ry, bump = 0, k = 7) {
  const ph = rnd() * 6.28, pts = [];
  for (let i = 0; i < 40; i++) {
    const t = i / 40 * 2 * Math.PI, r = 1 + bump * (0.5 + 0.5 * Math.cos(t * k + ph)) + (rnd() - 0.5) * 0.03;
    pts.push([cx + Math.cos(t) * rx * r, cy + Math.sin(t) * ry * r]);
  }
  return pts;
}

function capsule(a, b, ra, rb = ra, n = 12) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), res = [];
  for (let i = 0; i <= n; i++) { const t = ang + Math.PI / 2 + (i / n) * Math.PI; res.push([a[0] + Math.cos(t) * ra, a[1] + Math.sin(t) * ra]); }
  for (let i = 0; i <= n; i++) { const t = ang - Math.PI / 2 + (i / n) * Math.PI; res.push([b[0] + Math.cos(t) * rb, b[1] + Math.sin(t) * rb]); }
  return res;
}

function limbOf(pts, r) {
  const Lf = [], Rt = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / d * r, ny = (b[0] - a[0]) / d * r;
    Lf.push([p[0] + nx, p[1] + ny]); Rt.push([p[0] - nx, p[1] - ny]);
  });
  const end = (c, from, to) => { const res = []; for (let k = 1; k < 8; k++) { const t = from + (to - from) * k / 8; res.push([c[0] + Math.cos(t) * r, c[1] + Math.sin(t) * r]); } return res; };
  const m = pts.length - 1, a0 = Math.atan2(pts[1][1] - pts[0][1], pts[1][0] - pts[0][0]), a1 = Math.atan2(pts[m][1] - pts[m - 1][1], pts[m][0] - pts[m - 1][0]);
  return [...Lf, ...end(pts[m], a1 + Math.PI / 2, a1 - Math.PI / 2), ...Rt.reverse(), ...end(pts[0], a0 - Math.PI / 2, a0 - Math.PI * 1.5)];
}

// A filled shape with an ink outline. col: a colour, 'paper' or 'black'.
function shape(pts, col, { w = 1.2 } = {}) {
  if (col === 'paper') flat(pts, PAPERW);
  else if (col === 'black') flat(pts, HAIR);
  else fill(pts, col, { dx: 0.5, dy: 0.4, amp: 0.3 });
  line([...pts, pts[0], pts[1]], { w, over: 0, amp: 0.25 });
}
function blot(pts, col) { flat(pts, col); }

const _HEAD = { c: [0, -30.6], r: 6.4 }, _SH = 4.9, _SHY = -23.2, _HIPY = -11.6;
const _POSES = {
  down: { l: [[-6.6, -17.4], [-6.8, -11.6]], r: [[6.6, -17.4], [6.8, -11.6]] },
  wave: { l: [[-6.6, -17.4], [-6.8, -11.6]], r: [[9.2, -26.4], [10.6, -32.6]] },
  up: { l: [[-9.2, -26.4], [-10.6, -32.6]], r: [[9.2, -26.4], [10.6, -32.6]] },
  out: { l: [[-6.6, -17.4], [-6.8, -11.6]], r: [[9.6, -20.6], [14.2, -17.6]] },
  hold: { l: [[-6.4, -17.8], [-2.4, -16.4]], r: [[6.4, -17.8], [2.4, -16.4]] },
};

function _attr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

// A person standing at a sheet point.
function person(bx, by, { shirt = PAL.sky, pants = 'black', hair = 'short', arm = 'down', look = 1, kid = false, size = 1, sit = 0, hold = null, say = '' } = {}) {
  const s = 2.1 * size * (kid ? 0.78 : 1), fx = look < 0 ? -1 : 1, pose = _POSES[arm] || _POSES.down;
  const L = pts => pts.map(([px, py]) => [bx + px * s * fx, by + (py + (sit ? 6 * sit : 0)) * s]);
  const T = (x, y) => L([[x, y]])[0];
  const attrs = 'class="person"' + (say ? ` data-say="${_attr(say)}"` : '');
  group(attrs, () => {
    out.push(`<ellipse cx="${n1(bx)}" cy="${n1(by + 1)}" rx="${n1(7 * s)}" ry="${n1(2.2 * s)}" fill="${SHADOW}" fill-opacity=".7"/>`);
    if (!sit) for (const side of [-1, 1]) {
      const hip = [side * 2.4, _HIPY], f = [side * 2.7, -0.9], knee = [(hip[0] + f[0]) / 2, (_HIPY + f[1]) / 2];
      shape(L(limbOf(_catmull([hip, knee, [f[0], f[1] - 1.6]], 0.8), 1.85)), pants);
      shape(L(oval(f[0] + side * 0.7, f[1] - 0.2, 2.5, 1.35, 12)), 'paper', { w: 1 });
    }
    const armOf = (side, key) => {
      const sh = [side * _SH, _SHY + 0.6], [el, hd] = pose[key];
      shape(L(limbOf(_catmull([sh, el, hd], 0.6), 1.35)), SKIN, { w: 1 });
      const sl = [sh[0] + (el[0] - sh[0]) * 0.62, sh[1] + (el[1] - sh[1]) * 0.62];
      shape(L(capsule(sh, sl, 2.15, 2.0)), shirt, { w: 1 });
    };
    armOf(-1, 'l'); armOf(1, 'r');
    const torso = spline([[-5.7, _SHY - 0.8], [-6.2, -18.4], [-5.6, _HIPY - 0.8], [-4.6, _HIPY + 1.2], [4.6, _HIPY + 1.2], [5.6, _HIPY - 0.8], [6.2, -18.4], [5.7, _SHY - 0.8], [2.4, _SHY - 2.1], [0, _SHY - 1.7], [-2.4, _SHY - 2.1]], true, 0.5);
    shape(L(torso), shirt);
    const hc = _HEAD.c, hr = _HEAD.r, H = pts => L(pts.map(([px, py]) => [px + hc[0], py + hc[1]]));
    shape(L(capsule([0, _SHY - 1.4], [hc[0], hc[1] + hr - 1], 1.6)), SKIN, { w: 0.9 });
    if (hair === 'bob' || hair === 'long') {
      const dn = hair === 'long' ? 9.6 : 4.2;
      shape(H(spline([[-hr - 0.9, dn], [-hr - 1.2, -1], [-hr * 0.7, -hr - 0.6], [0, -hr - 1.3], [hr * 0.7, -hr - 0.6], [hr + 1.2, -1], [hr + 0.9, dn], [hr - 1.6, dn + 0.6], [-hr + 1.6, dn + 0.6]], true, 0.5)), 'black');
    }
    shape(H(oval(0, 0, hr, hr * 0.97, 28)), SKIN);
    for (const sd of [-1, 1]) blot(H(oval(sd * 3.6 + 0.6, 2.1, 1.25, 0.8, 12)), '#f2a3b3');
    for (const sd of [-1, 1]) blot(H(oval(sd * 2.1 + 0.6, 0.4, 0.62, 0.66, 10)), HAIR);
    const arc = [];
    for (let i = 0; i <= 30; i++) { const t = Math.PI + 0.2 + (Math.PI - 0.4) * i / 30; arc.push([Math.cos(t) * (hr + 0.75), Math.sin(t) * (hr + 0.75)]); }
    const fringe = _catmull([[hr + 0.2, -0.4], [hr - 1.6, -2.9], [2, -3.9], [-1.6, -3.6], [-hr + 1.4, -2.6], [-hr - 0.2, -0.2]], 0.4);
    if (hair !== 'cap') shape(H([...arc, ...fringe]), 'black');
    if (hair === 'bun') shape(H(oval(0.4, -hr - 2.4, 2.9, 2.6, 16)), 'black');
    if (hair === 'cap') {
      shape(H(spline([[-hr - 0.6, -1.4], [-hr + 0.4, -5.6], [0, -hr - 1.6], [hr - 0.4, -5.6], [hr + 0.6, -1.4]], true, 0.4)), PAL.red);
      shape(H(spline([[hr * 0.1, -1.6], [hr + 4.6, -1.2], [hr + 4.8, 0.2], [hr * 0.1, -0.2]], true, 0.4)), PAL.red, { w: 0.9 });
    }
    for (const key of ['l', 'r']) {
      const h = T(...pose[key][1]);
      if (hold && key === 'r') hold(h);
      shape(oval(h[0], h[1], 1.55 * s, 1.5 * s, 12), SKIN, { w: 0.95 });
    }
  });
}

function who(x, y, o = {}, z = 0) { const [sx, sy] = P(x, y, z); person(sx, sy, o); }

function cat(x, y, z = 0, col = '#e3c77a') {
  const [bx, by] = P(x, y, z);
  group('class="animal cat"', () => {
    out.push(`<ellipse cx="${n1(bx)}" cy="${n1(by + 1)}" rx="16" ry="4.5" fill="${SHADOW}" fill-opacity=".7"/>`);
    line([[bx + 9, by - 3], [bx + 19, by - 6], [bx + 20, by - 18], [bx + 15, by - 24]], { w: 3.2, col: shadeOf(col), curve: true, over: 0 });
    shape(blob(bx, by - 11, 12, 11), col);
    shape([[bx - 9, by - 27], [bx - 7, by - 37], [bx - 2, by - 30]], col, { w: 1 });
    shape([[bx + 2, by - 30], [bx + 7, by - 37], [bx + 9, by - 27]], col, { w: 1 });
    shape(oval(bx, by - 24, 9.5, 8, 24), col);
    for (const sd of [-1, 1]) blot(oval(bx + sd * 3.4, by - 24.5, 0.9, 1.1, 10), HAIR);
    blot(oval(bx, by - 21.8, 1.1, 0.7, 8), '#c8836b');
    for (const sd of [-1, 1]) blot(oval(bx + sd * 5.6, by - 21.5, 1.4, 0.8, 10), '#f2a3b3');
  });
}

function dog(x, y, z = 0, col = '#cdb68e') {
  const [bx, by] = P(x, y, z);
  group('class="animal dog"', () => {
    out.push(`<ellipse cx="${n1(bx)}" cy="${n1(by + 1)}" rx="22" ry="5" fill="${SHADOW}" fill-opacity=".7"/>`);
    for (const lx of [-12, -6, 8, 14]) shape(capsule([bx + lx, by - 10], [bx + lx, by - 1], 2.4), col, { w: 1 });
    line([[bx - 17, by - 16], [bx - 24, by - 24], [bx - 25, by - 30]], { w: 3, col: shadeOf(col), curve: true, over: 0 });
    shape(capsule([bx - 13, by - 15], [bx + 12, by - 15], 8, 8.5), col);
    shape(oval(bx + 18, by - 26, 9, 8.2, 24), col);
    shape(spline([[bx + 11, by - 31], [bx + 7, by - 22], [bx + 11, by - 18], [bx + 14, by - 27]], true, 0.6), shadeOf(col), { w: 1 });
    blot(oval(bx + 21, by - 27, 0.9, 1.1, 10), HAIR);
    blot(oval(bx + 27, by - 24.5, 1.8, 1.3, 10), HAIR);
  });
}

function bird(x, y, z = 0, col = '#c9d6e6') {
  const [bx, by] = P(x, y, z);
  group('class="animal bird"', () => {
    shape(spline([[bx - 9, by - 4], [bx - 2, by - 9], [bx + 6, by - 8], [bx + 7, by - 2], [bx, by + 1]], true, 0.5), col);
    shape([[bx + 6, by - 7.5], [bx + 10.5, by - 6], [bx + 6.5, by - 4.8]], PAL.mustard, { w: 0.8 });
    line([[bx - 5, by - 5], [bx + 1, by - 3], [bx + 3, by - 6]], { w: 0.9, curve: true, over: 0 });
    blot(oval(bx + 3.6, by - 6.4, 0.8, 0.9, 8), HAIR);
  });
}

function tree(x, y, r = 52, z = 0, col = PAL.leaf) {
  const [bx, by] = P(x, y, z);
  castDisc(x, y, r * 0.45, r * 0.5, z);
  group('class="plant tree"', () => {
    shape([[bx - 4, by], [bx - 3, by - r * 1.1], [bx + 3, by - r * 1.1], [bx + 4, by]], PAL.bark);
    const cy = by - r * 1.45;
    shape(blob(bx, cy, r * 0.62, r * 0.58, 0.07, 6), col);
    const arcs = [];
    for (let i = 0; i < 5; i++) {
      const a = rnd() * 6.28, rr = r * (0.15 + rnd() * 0.3), cx = bx + Math.cos(a) * rr, cyy = cy + Math.sin(a) * rr * 0.9;
      arcs.push([[cx - 5, cyy], [cx, cyy + 3], [cx + 5, cyy]]);
    }
    for (const a of arcs) line(a, { w: 0.8, col: shadeOf(shadeOf(col)), curve: true, over: 0 });
  });
}

// Plants stay round: a soft puff of leaf with one ink line.
function puff(x, y, z, { hw = 18, h = 27, col = PAL.leaf } = {}) {
  const [bx, by] = P(x, y, z);
  group('class="plant puff"', () => {
    shape(blob(bx, by - h * 0.5, hw, h * 0.5, 0.08, 5), col);
    line([[bx - hw * 0.4, by - h * 0.35], [bx, by - h * 0.2], [bx + hw * 0.35, by - h * 0.42]], { w: 0.8, col: shadeOf(shadeOf(col)), curve: true, over: 0 });
  });
}

function pot(x, y, z, plant = true, col = PAL.brick) {
  castDisc(x, y, 10, 22, z);
  turn(x, y, z, [[8, 0], [11, 14], [12, 16]], col, { wall: 1.5, cap: '#7d5a3c', seam: false });
  if (plant) puff(x, y, z + 14, { hw: 14, h: 22 });
}
