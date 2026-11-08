/* Tinycharts kit: core. World coordinates are isometric: x runs down-right,
   y down-left, z up. P() turns a world point into a sheet point. */

const C = 0.8660254, S = 0.5;
let OX = 700, OY = 560;

const INK = '#2b2a28', RED = '#b5483b', PAPER = '#faf6ee';
const PAL = {
  paper: PAPER, cream: '#f3ead8', sand: '#e9dcc2', tan: '#cdb68e', wood: '#b89a72',
  bark: '#8a6a4f', sage: '#b9cba8', leaf: '#8fae84', mint: '#cfe0d2', sky: '#c9d6e6',
  blue: '#8ea6c8', navy: '#5f7db5', lilac: '#cfd0e6', rose: '#e6c3bb', brick: '#c8836b',
  red: RED, mustard: '#e3c77a', butter: '#f1e3b6', stone: '#d8d2c6', grey: '#b9bfc9',
  slate: '#8e96a3', shade: '#cfc6b8', ink: INK,
};

function P(x, y, z = 0) { return [OX + (x - y) * C, OY + (x + y) * S - z]; }
function at(sx, sy) {
  const u = (sx - OX) / C, v = (sy - OY) / S;
  return [(u + v) / 2, (v - u) / 2];
}

let _seed = 1;
function rnd() {
  _seed = (_seed + 0x6D2B79F5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

let out = [], under = [], _queue = [], _qn = 0;
// Functions that return <defs> content. Later kit files register here.
const DEFS = [];

function begin(seed) { _seed = seed | 0; out = []; under = []; _queue = []; _qn = 0; }

function put(key, sub, fn) { _queue.push({ key, sub, n: _qn++, fn }); }
function flush() {
  while (_queue.length) {
    const q = _queue.sort((a, b) => a.key - b.key || a.sub - b.sub || a.n - b.n);
    _queue = [];
    for (const it of q) it.fn();
  }
}

function group(attrs, fn) { out.push(`<g ${attrs}>`); fn(); out.push('</g>'); }

function finish() {
  flush();
  const defs = DEFS.map(f => f()).join('');
  const el = document.getElementById('art');
  if (el) el.innerHTML = (defs ? `<defs>${defs}</defs>` : '') + under.join('') + out.join('');
}

function n1(v) { return String(Math.round(v * 10) / 10); }
function pathOf(pts, closed = false) {
  return pts.map((p, i) => (i ? 'L' : 'M') + n1(p[0]) + ' ' + n1(p[1])).join('') + (closed ? 'Z' : '');
}

function _rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function _hex(r) { return '#' + r.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function mixC(a, b, t) { const x = _rgb(a), y = _rgb(b); return _hex(x.map((v, i) => v + (y[i] - v) * t)); }
function litOf(c) { return mixC(c, '#ffffff', 0.35); }
function shadeOf(c) { return mixC(c, '#3a3430', 0.22); }

const _palList = Object.values(PAL);
// Markers only come in muted tones: pull any colour part way to its nearest marker.
function soften(c) {
  if (_palList.includes(c)) return c;
  const x = _rgb(c);
  let best = _palList[0], bd = Infinity;
  for (const p of _palList) {
    const y = _rgb(p), d = (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
    if (d < bd) { bd = d; best = p; }
  }
  return mixC(c, best, 0.45);
}
