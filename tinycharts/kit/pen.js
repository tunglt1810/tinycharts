/* Tinycharts kit: the pen. The hand model is ported from statechart-art's
   tools/kit/hand.js (MIT, Kevin T. Ngo): a damped spring chases the aimed
   points, a slow bow and a fine tremor push it sideways, and the width
   follows a pressure profile. statechart-art stamps discs on a canvas; here
   the same nodes become one filled outline per stroke, so the wobble lives
   in the path data and the SVG looks the same in every app. */

const _clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const _smooth = (e0, e1, x) => { const t = _clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
const _ramp = (x, len) => (len <= 0 ? 1 : _smooth(0, len, x));

// A few incommensurate sines: f(s) in about [-1, 1].
function wander(lamMin, lamMax, n = 3) {
  const A = [], L = [], Ph = [];
  let norm = 0;
  for (let i = 0; i < n; i++) {
    const lam = lamMin * Math.pow(lamMax / lamMin, (i + rnd() * 0.8) / n);
    const amp = Math.pow(lam / lamMax, 0.35) * (0.6 + 0.8 * rnd());
    A.push(amp); L.push(2 * Math.PI / lam); Ph.push(rnd() * 2 * Math.PI); norm += amp * amp;
  }
  norm = 1 / Math.sqrt(norm / 2);
  return s => { let v = 0; for (let i = 0; i < n; i++) v += A[i] * Math.sin(s * L[i] + Ph[i]); return v * norm * 0.5; };
}

function _catmull(pts, step) {
  const n = pts.length;
  if (n < 2) return pts.map(p => p.slice());
  const Q = [pts[0].map((v, i) => 2 * v - pts[1][i]), ...pts, pts[n - 1].map((v, i) => 2 * v - pts[n - 2][i])];
  const res = [];
  for (let i = 1; i < Q.length - 2; i++) {
    const p0 = Q[i - 1], p1 = Q[i], p2 = Q[i + 1], p3 = Q[i + 2];
    const m = Math.max(1, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = 0; k < m; k++) {
      const t = k / m, t2 = t * t, t3 = t2 * t;
      res.push([0, 1].map(c => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  res.push(pts[n - 1].slice());
  return res;
}

function resample(pts, ds) {
  if (pts.length < 2) return pts;
  const res = [pts[0].slice()];
  let need = ds;
  for (let i = 1; i < pts.length; i++) {
    let x0 = pts[i - 1][0], y0 = pts[i - 1][1];
    const x1 = pts[i][0], y1 = pts[i][1];
    let d = Math.hypot(x1 - x0, y1 - y0);
    while (d >= need && d > 0) {
      const t = need / d; x0 += (x1 - x0) * t; y0 += (y1 - y0) * t;
      res.push([x0, y0]); d = Math.hypot(x1 - x0, y1 - y0); need = ds;
    }
    need -= d;
  }
  const l = pts[pts.length - 1], e = res[res.length - 1];
  if (Math.hypot(l[0] - e[0], l[1] - e[1]) > ds * 0.3) res.push(l.slice());
  return res;
}

function _follow(tgt, L, ds, zeta) {
  const m = tgt.length;
  if (m < 3 || L <= 0) return tgt;
  const w = Math.min(0.5, ds / L), k = w * w, c = 2 * zeta * w, lag = Math.max(0, Math.round(2 * zeta / w));
  let x = tgt[0][0], y = tgt[0][1], vx = tgt[1][0] - x, vy = tgt[1][1] - y;
  const res = [[x, y]];
  const total = m - 1 + lag + Math.round(0.35 / w);
  for (let i = 1; i <= total; i++) {
    const tar = tgt[Math.min(m - 1, i + lag - 1)];
    vx += k * (tar[0] - x) - c * vx; vy += k * (tar[1] - y) - c * vy;
    x += vx; y += vy; res.push([x, y]);
  }
  return res;
}

function _extend(pts, over) {
  if (!over || pts.length < 2) return pts;
  const u = (a, b) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; };
  const a = u(pts[1], pts[0]), b = u(pts[pts.length - 2], pts[pts.length - 1]);
  return [[pts[0][0] + a[0] * over, pts[0][1] + a[1] * over], ...pts,
    [pts[pts.length - 1][0] + b[0] * over, pts[pts.length - 1][1] + b[1] * over]];
}

const _DS = 1.6, _LAG = 7;

// The path a hand makes when it aims at pts (sheet points).
function hand(pts, amp = 0.7, over = 2.2, curve = false) {
  if (pts.length < 2) return pts.map(p => p.slice());
  const ext = _extend(pts, over);
  const tgt = _follow(resample(curve ? _catmull(ext, _DS) : ext, _DS), curve ? _LAG : 2.5, _DS, 0.72);
  const cum = [0];
  for (let i = 1; i < tgt.length; i++) cum.push(cum[i - 1] + Math.hypot(tgt[i][0] - tgt[i - 1][0], tgt[i][1] - tgt[i - 1][1]));
  const L = cum[cum.length - 1] || 1;
  const wB = wander(Math.max(25, L * 0.9), Math.max(80, L * 3.5), 2), wM = wander(10, 55, 3), wH = wander(2, 10, 3);
  const bow = Math.min(2.2, L * 0.006) * amp, mid = 0.25 * amp, hi = 0.08 * amp;
  return tgt.map((p, i) => {
    const a = tgt[Math.max(0, i - 1)], b = tgt[Math.min(tgt.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    const s = cum[i], off = bow * wB(s) + mid * wM(s) + hi * wH(s);
    return [p[0] - dy * off, p[1] + dx * off];
  });
}

// Outline of one stroke as path data: nodes offset by the pressure radius on both sides.
function _strokeD(pts, w, amp, over, curve = false) {
  const h = hand(pts, amp, over, curve);
  if (h.length < 2) return '';
  const cum = [0];
  for (let i = 1; i < h.length; i++) cum.push(cum[i - 1] + Math.hypot(h[i][0] - h[i - 1][0], h[i][1] - h[i - 1][1]));
  const L = cum[cum.length - 1] || 1, wP = wander(12, 90, 3), wR = wander(4, 30, 3);
  const left = [], right = [];
  for (let i = 0; i < h.length; i++) {
    const s = cum[i];
    const p = _clamp((0.55 + 0.45 * Math.min(_ramp(s, 1.5), _ramp(L - s, 2.5))) * (1 + 0.16 * wP(s)), 0.05, 1.2);
    const r = Math.max(0.18, (w / 2) * p * (1 + 0.045 * wR(s)));
    const a = h[Math.max(0, i - 1)], b = h[Math.min(h.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    left.push([h[i][0] - dy * r, h[i][1] + dx * r]);
    right.push([h[i][0] + dy * r, h[i][1] - dx * r]);
  }
  return pathOf(left.concat(right.reverse()), true);
}

function line(pts, { w = 1.5, col = INK, amp = 0.7, over = 2.2, curve = false } = {}) {
  const d = _strokeD(pts, w, amp, over, curve);
  if (d) out.push(`<path d="${d}" fill="${col}"/>`);
}

// One stroke per edge, like a drafter: corners stay sharp and cross a little.
function rim(pts, w = 1.4, col = INK) {
  const d = pts.map((p, i) => _strokeD([p, pts[(i + 1) % pts.length]], w, 0.7, 1.2)).join('');
  if (d) out.push(`<path d="${d}" fill="${col}"/>`);
}
function pen(pts, w = 1) { line(pts, { w, over: 0, amp: 0.5 }); }
function edge(a, b, w = 0.9, over = 1.6) { line([a, b], { w, over }); }

function rule(pairs, col = INK, w = 0.6) {
  const d = pairs.map(([a, b]) => _strokeD([a, b], w, 0.5, 0.8)).join('');
  if (d) out.push(`<path d="${d}" fill="${col}"/>`);
}

function dash(a, b, col = '#7f9db3', on = 6, off = 5, w = 1.1) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), pairs = [];
  for (let s = 0; s < L; s += on + off) {
    const t0 = s / L, t1 = Math.min(1, (s + on) / L);
    pairs.push([[a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0], [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1]]);
  }
  rule(pairs, col, w);
}
