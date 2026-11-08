/* Tinycharts kit: marker washes, the paper texture and shadows. */

const SHADOW = '#d9d1c2';

// The texture tile has its own fixed random stream, so registering it never
// changes the sheet's seeded drawing.
function toothDefs() {
  if (_texPng) return _texPng;
  let a = 20261106;
  const r = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const T = 340, parts = [], ops = [];
  // marker streaks: wide, faint, all leaning the same way like passes of one nib
  for (let i = 0; i < 26; i++) {
    const y = r() * T, x = r() * T - 60, L = 80 + r() * 140, o = (0.008 + r() * 0.014).toFixed(3), w = n1(12 + r() * 16), d = `M${n1(x)} ${n1(y)}l${n1(L)} ${n1(-L * 0.32)}`;
    parts.push(`<path d="${d}" stroke="#000" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round"/>`);
    ops.push(c => { c.globalAlpha = +o; c.lineWidth = +w; c.strokeStyle = '#000'; c.stroke(new Path2D(d)); });
  }
  // mottle: soft dark pools where the marker went over twice
  for (let i = 0; i < 70; i++) {
    const [cx, cy, rx, ry, o] = [n1(r() * T), n1(r() * T), n1(14 + r() * 30), n1(9 + r() * 18), (0.006 + r() * 0.012).toFixed(3)];
    parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" fill-opacity="${o}"/>`);
    ops.push(c => { c.globalAlpha = +o; c.fillStyle = '#000'; c.beginPath(); c.ellipse(+cx, +cy, +rx, +ry, 0, 0, 2 * Math.PI); c.fill(); });
  }
  // tooth: paper crests the nib skipped, and a few dark pits
  let light = '', dark = '';
  for (let i = 0; i < 1100; i++) light += `M${n1(r() * T)} ${n1(r() * T)}h${n1(0.6 + r() * 1.2)}v${n1(0.5 + r() * 0.7)}h${n1(-(0.6 + r() * 1.2))}Z`;
  for (let i = 0; i < 480; i++) dark += `M${n1(r() * T)} ${n1(r() * T)}h${n1(0.5 + r() * 0.8)}v${n1(0.5 + r() * 0.5)}h-0.8Z`;
  parts.push(`<path d="${light}" fill="#fffdf6" fill-opacity=".55"/>`, `<path d="${dark}" fill="#3a3430" fill-opacity=".12"/>`);
  ops.push(c => { c.globalAlpha = 0.55; c.fillStyle = '#fffdf6'; c.fill(new Path2D(light)); c.globalAlpha = 0.12; c.fillStyle = '#3a3430'; c.fill(new Path2D(dark)); });
  const vector = `<pattern id="tex" width="${T}" height="${T}" patternUnits="userSpaceOnUse">${parts.join('')}</pattern>`;
  // A live page fills hundreds of shapes with this tile and repaints them on
  // every frame that anything moves; the vector tile took most of each frame,
  // so a live page paints the same tile once into an image. A still page
  // (bare, export) keeps the vector tile, so exported SVG stays all vector.
  if (typeof document === 'undefined' || typeof Path2D === 'undefined' || /(^|[#&])(bare|export)=1/.test(location.hash)) return vector;
  const cv = document.createElement('canvas'), c = cv.getContext && cv.getContext('2d');
  if (!c) return vector;
  cv.width = cv.height = T * 2; c.scale(2, 2); c.lineCap = 'round';
  for (const op of ops) op(c);
  _texPng = `<pattern id="tex" width="${T}" height="${T}" patternUnits="userSpaceOnUse"><image href="${cv.toDataURL('image/png')}" width="${T}" height="${T}"/></pattern>`;
  return _texPng;
}
let _texPng = null;
DEFS.push(toothDefs);

// A marker wash: the colour lands a little off the ink line, pools at its edge, and shows the paper.
function fill(pts, col, { dx = 1.3, dy = 0.9, amp = 1 } = {}) {
  const c = soften(col);
  const poly = pts.map(p => [p[0] + dx + (rnd() - 0.5) * amp, p[1] + dy + (rnd() - 0.5) * amp]);
  const d = pathOf(poly, true);
  out.push(`<path d="${d}" fill="${c}" stroke="${shadeOf(c)}" stroke-opacity=".28" stroke-width="1.3" stroke-linejoin="round"/><path d="${d}" fill="url(#tex)"/>`);
}

function flat(pts, col) { out.push(`<path d="${pathOf(pts, true)}" fill="${col}"/>`); }

function hull(pts) {
  const p = pts.map(q => q.slice()).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}

// Parallel ink lines across a polygon (sheet points).
function hatch(poly, { dir = [0, 1], gap = 5.5, w = 0.7, col = INK, keep = 0.86, from = 0, to = 1 } = {}) {
  const dl = Math.hypot(dir[0], dir[1]) || 1, ux = dir[0] / dl, uy = dir[1] / dl, nx = -uy, ny = ux;
  const ns = poly.map(p => p[0] * nx + p[1] * ny), pairs = [];
  for (let c = Math.min(...ns) + gap / 2; c < Math.max(...ns); c += gap) {
    const hits = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], na = ns[i], nb = ns[(i + 1) % poly.length];
      if ((na - c) * (nb - c) < 0) { const t = (c - na) / (nb - na); hits.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    hits.sort((p, q) => (p[0] * ux + p[1] * uy) - (q[0] * ux + q[1] * uy));
    for (let i = 0; i + 1 < hits.length; i += 2) {
      if (rnd() > keep) continue;
      const a = hits[i], b = hits[i + 1], L = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      pairs.push([L(from), L(to)]);
    }
  }
  if (pairs.length) rule(pairs, col, w);
}

// A soft shadow laid on the ground before any solid is drawn.
function ground(pts) {
  const h = hull(pts);
  if (h.length < 3) return;
  const soft = hand([...h, h[0], h[1]], 0.4, 0, true);
  const d = pathOf(soft, true);
  under.push(`<path class="shadow" d="${d}" fill="${SHADOW}" fill-opacity=".62"/><path d="${d}" fill="url(#tex)" fill-opacity=".7"/>`);
}

// Light comes from the upper left, so a shadow runs toward +x and a little +y.
function cast(x, y, w, d, h, z = 0) {
  const f = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]], ox = 0.5 * h + 6, oy = 0.12 * h + 4;
  ground([...f, ...f.map(([a, b]) => [a + ox, b + oy])].map(([a, b]) => P(a, b, z)));
}

function castDisc(x, y, r, h, z = 0) {
  const ring = [];
  for (let i = 0; i < 16; i++) { const t = i / 16 * 2 * Math.PI; ring.push([x + Math.cos(t) * (r + 3), y + Math.sin(t) * (r + 3)]); }
  const ox = 0.5 * h + 4, oy = 0.12 * h + 3;
  ground([...ring, ...ring.map(([a, b]) => [a + ox, b + oy])].map(([a, b]) => P(a, b, z)));
}
