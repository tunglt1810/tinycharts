// The base objects for technical sheets: each technology is drawn as an
// object for its role, with its logo printed on the +x face (spec 6.1).
// Every object stands on its footprint centre (x, y, z) and returns its
// size {w, d, h} in world units, so a sheet can lay them out.

function _onFace(face, x, y, z, fn) { out.push(`<g transform="${faceM(face, x, y, z)}">`); fn(); out.push('</g>'); }
const _rectL = (u0, v0, u1, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];

// The logo, or the label in letters; nothing when the object has neither.
function _sign(face, x, y, z, w, h, o) {
  if (o.logo || o.label) logoOn(face, x, y, z, w, h, o.logo || '', { fallback: o.label });
}

function rack(x, y, z = 0, o = {}) {
  const W = 50, D = 50, U = 22, G = 3, H = 3 * U + 2 * G, x0 = x - W / 2, y0 = y - D / 2;
  cast(x0, y0, W, D, H, z);
  for (let u = 0; u < 3; u++) {
    const zu = z + u * (U + G);
    box(x0, y0, zu, W, D, U, { left: o.col || PAL.grey, marks: false });
    _onFace('left', x0, y0 + D, zu + U, () => {
      rule([6, 10, 14].map(v => [[5, v], [W - 16, v]]), INK, 0.5);
      flat(oval(W - 8, 8, 1.8, 1.8, 10), u === 1 ? PAL.leaf : PAL.mustard);
    });
  }
  _sign('right', x0 + W, y0 + D, z + H, D, H, o);
  return { w: W, d: D, h: H };
}

// A round body has no flat side, so its logo wraps round the near curve.
function _sticker(x, y, ztop, r, h, o) { if (o.logo || o.label) logoWrap(x, y, ztop, r, 1.4 * r, h, o.logo || '', { fallback: o.label }); }

function dbCyl(x, y, z = 0, o = {}) {
  const r = 26, H = 62;
  castDisc(x, y, r, H, z);
  cyl(x, y, z, r, H, o.col || PAL.sand);
  for (const k of [1 / 3, 2 / 3]) line(_front(x, y, z + H * k, r), { w: 1, over: 0 });
  _sticker(x, y, z + H * 0.86, r, H * 0.68, o);
  return { w: 2 * r, d: 2 * r, h: H };
}

function queue(x, y, z = 0, o = {}) {
  const W = 34, D = 96, H = 34, x0 = x - W / 2, y0 = y - D / 2;
  cast(x0, y0, W, D, H, z);
  box(x0, y0, z, W, D, H, { left: o.col || PAL.butter, marks: false });
  _onFace('top', x0, y0, z + H, () => rule([24, 48, 72].map(v => [[2, v], [W - 2, v]]), INK, 0.7));
  _sign('right', x0 + W, y0 + D, z + H, D, H, o);
  return { w: W, d: D, h: H };
}

function gateway(x, y, z = 0, o = {}) {
  const col = o.col || PAL.stone;
  cast(x - 9, y - 38, 18, 76, 108, z);
  box(x - 7, y - 36, z, 14, 14, 66, { left: col, marks: false });
  box(x - 7, y + 22, z, 14, 14, 66, { left: col, marks: false });
  box(x - 9, y - 38, z + 66, 18, 76, 14, { left: PAL.slate, marks: false });
  box(x - 3, y - 26, z + 80, 6, 52, 28, { left: PAL.cream, marks: false });
  _sign('right', x + 3, y + 26, z + 108, 52, 28, o);
  return { w: 18, d: 76, h: 108 };
}

function browser(x, y, z = 0, o = {}) {
  cast(x - 14, y - 42, 28, 84, 80, z);
  box(x - 14, y - 14, z, 28, 28, 4, { left: PAL.grey, marks: false });
  box(x - 3, y - 3, z + 4, 6, 6, 16, { left: PAL.grey, marks: false });
  box(x - 4, y - 42, z + 20, 8, 84, 60, { left: o.col || PAL.stone, marks: false });
  _onFace('right', x + 4, y + 42, z + 80, () => {
    fill(_rectL(3, 3, 81, 57), PAL.cream, { amp: 0.3 });
    fill(_rectL(3, 3, 81, 12), PAL.sky, { amp: 0.3 });
    [PAL.rose, PAL.mustard, PAL.sage].forEach((c, i) => flat(oval(8 + i * 5, 7.5, 1.6, 1.6, 10), c));
    flat(_rectL(24, 5, 70, 10), '#fbf8f1');
    rim(_rectL(3, 3, 81, 57), 0.8);
  });
  _sign('right', x + 4, y + 39, z + 66, 78, 44, o);
  return { w: 28, d: 84, h: 80 };
}

function phone(x, y, z = 0, o = {}) {
  cast(x - 4, y - 18, 8, 36, 66, z);
  box(x - 4, y - 18, z, 8, 36, 66, { left: o.col || PAL.navy, marks: false });
  _onFace('right', x + 4, y + 18, z + 66, () => {
    fill(_rectL(3, 7, 33, 58), PAL.sky, { amp: 0.3 });
    rule([[[14, 4], [22, 4]]], INK, 1.2);
    rim(oval(18, 62, 1.8, 1.8, 10), 0.7);
  });
  _sign('right', x + 4, y + 15, z + 56, 30, 44, o);
  return { w: 8, d: 36, h: 66 };
}

// A cloud is a flat sign in the +x plane with a little depth behind it. Its
// outline is the union of a few circles, traced from the middle outwards.
const _PUFFS = [[22, 30, 16], [44, 22, 21], [66, 28, 16], [80, 38, 11], [9, 40, 10]];
function _cloudLine() {
  const cu = 46, cv = 36, pts = [];
  for (let i = 0; i < 72; i++) {
    const t = i / 72 * 2 * Math.PI, du = Math.cos(t), dv = Math.sin(t);
    let far = 0;
    for (const [u, v, r] of _PUFFS) {
      const ou = cu - u, ov = cv - v, b = ou * du + ov * dv, c = ou * ou + ov * ov - r * r, q = b * b - c;
      if (q >= 0) far = Math.max(far, -b + Math.sqrt(q));
    }
    if (dv > 0) far = Math.min(far || 99, (50 - cv) / dv);
    pts.push([cu + du * far, cv + dv * far]);
  }
  return pts;
}
function cloud(x, y, z = 0, o = {}) {
  const top = z + 76, outline = _cloudLine(), col = o.col || PAL.cream;
  castDisc(x, y, 30, 20, z);
  _onFace('right', x - 10, y + 46, top, () => { fill(outline, shadeOf(col), { amp: 0.4 }); rim(outline, 1); });
  _onFace('right', x, y + 46, top, () => { fill(outline, col, { amp: 0.4 }); rim(outline, 1.4); });
  _sign('right', x, y + 24, top - 16, 48, 30, o);
  return { w: 20, d: 92, h: 76 };
}

function bucket(x, y, z = 0, o = {}) {
  castDisc(x, y, 26, 44, z);
  turn(x, y, z, [[20, 0], [26, 44]], o.col || PAL.sage, { wall: 2 });
  _sticker(x, y, z + 40, 24, 32, o);
  return { w: 52, d: 52, h: 44 };
}

function devbox(x, y, z = 0, o = {}) {
  cast(x - 24, y - 26, 48, 52, 40, z);
  box(x - 22, y - 26, z, 44, 52, 4, { left: PAL.grey, marks: false });
  _onFace('top', x - 18, y - 22, z + 4, () => rule([6, 12, 18, 24, 30].map(u => [[u + 14, 4], [u + 14, 40]]), INK, 0.4));
  box(x - 24, y - 26, z + 4, 4, 52, 36, { left: o.col || PAL.slate, marks: false });
  _onFace('right', x - 20, y + 26, z + 40, () => fill(_rectL(3, 3, 49, 33), PAL.sky, { amp: 0.3 }));
  _sign('right', x - 20, y + 23, z + 37, 46, 30, o);
  return { w: 48, d: 52, h: 40 };
}

function lock(x, y, z = 0, o = {}) {
  cast(x - 8, y - 22, 16, 44, 58, z);
  _onFace('right', x, y + 16, z + 58, () => {
    const u = [[6, 24], [6, 12], [10, 4], [16, 1], [22, 4], [26, 12], [26, 24]];
    line(u, { w: 6, col: INK, over: 0, curve: true });
    line(u, { w: 3.4, col: PAL.grey, over: 0, curve: true });
  });
  box(x - 8, y - 22, z, 16, 44, 36, { left: o.col || PAL.mustard, marks: false });
  _sign('right', x + 8, y + 22, z + 36, 44, 36, o);
  return { w: 16, d: 44, h: 58 };
}

function container(x, y, z = 0, o = {}) {
  const W = 40, D = 92, H = 40, x0 = x - W / 2, y0 = y - D / 2;
  cast(x0, y0, W, D, H, z);
  box(x0, y0, z, W, D, H, { left: o.col || PAL.brick, marks: false });
  _onFace('left', x0, y0 + D, z + H, () => rule([8, 16, 24, 32].map(u => [[u, 3], [u, H - 3]]), INK, 0.6));
  _onFace('right', x0 + W, y0 + D, z + H, () => {
    rule([6, 12, 80, 86].map(u => [[u, 3], [u, H - 3]]), INK, 0.6);
    fill(_rectL(18, 8, 74, 32), PAL.cream, { amp: 0.3 });
  });
  _sign('right', x0 + W, y0 + D - 18, z + H - 8, 56, 24, o);
  return { w: W, d: D, h: H };
}

// A message in flight: a flat envelope, flap up. It casts no shadow, so it
// can float above the objects it passes.
function message(x, y, z = 0, o = {}) {
  const W = 44, D = 64, H = 8, x0 = x - W / 2, y0 = y - D / 2;
  box(x0, y0, z, W, D, H, { left: o.col || PAL.cream, marks: false });
  _onFace('top', x0, y0, z + H, () => line([[1, 1], [W * 0.55, D / 2], [1, D - 1]], { w: 1, over: 0 }));
  return { w: W, d: D, h: H };
}

// ---- tech(): a technology by name, through the table the build embeds
const _norm = s => String(s).trim().toLowerCase().replace(/\s+/g, ' ');
function _lev(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

function tech(name, x, y, z = 0, o = {}) {
  const table = typeof TECH === 'undefined' ? {} : TECH, n = _norm(name), near = [];
  for (const [key, e] of Object.entries(table)) {
    const all = [key, e.name, ...(e.alias || [])].map(_norm);
    if (all.includes(n)) {
      const draw = { rack, dbCyl, queue, gateway, browser, phone, cloud, bucket, devbox, lock, container }[e.object];
      return draw(x, y, z, { logo: key, label: e.name, ...o });
    }
    near.push([key, Math.min(...all.map(a => _lev(n, a)))]);
  }
  const best = near.sort((p, q) => p[1] - q[1]).slice(0, 3).map(([k]) => k);
  throw new Error(`Unknown technology "${name}". Closest: ${best.join(', ')}.`);
}
