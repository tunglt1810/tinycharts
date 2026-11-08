/* Tinycharts kit: marks. Red floor arrows, the "now" tag, the ring round the
   lit state and the legend. Arrows take world points; the rest sheet points. */

function arrow(pts, o = {}) {
  const z = p => p[2] || 0;
  line(pts.map(p => P(p[0], p[1], z(p))), { w: 1.8, col: RED, amp: 0.55, over: 0, ...o });
  const [a, b] = pts.slice(-2), l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const u = [(b[0] - a[0]) / l, (b[1] - a[1]) / l], v = [-u[1], u[0]], L = 15, W = 6.5;
  const head = [P(b[0], b[1], z(b)),
    P(b[0] - u[0] * L + v[0] * W, b[1] - u[1] * L + v[1] * W, z(b)),
    P(b[0] - u[0] * L - v[0] * W, b[1] - u[1] * L - v[1] * W, z(b))];
  out.push(`<path class="head" d="${pathOf(head, true)}" fill="${RED}"/>`);
}

function route(a, b, horizontalFirst = true) {
  const mid = horizontalFirst ? [b[0], a[1]] : [a[0], b[1]];
  arrow([a, mid, b]);
}

// The same red arrow on sheet points, for a chain of tags drawn flat on the
// paper. dashed is for a way back.
function flowArrow(pts, { dashed = false, col = RED, w = 1.8 } = {}) {
  if (dashed) out.push(`<path d="${pathOf(pts)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-dasharray="7 6" stroke-linecap="round" stroke-linejoin="round"/>`);
  else line(pts, { w, col, amp: 0.55, over: 0 });
  const [a, b] = pts.slice(-2), l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const u = [(b[0] - a[0]) / l, (b[1] - a[1]) / l], v = [-u[1], u[0]], L = 14, W = 6.5;
  out.push(`<path class="head" d="${pathOf([b, [b[0] - u[0] * L + v[0] * W, b[1] - u[1] * L + v[1] * W], [b[0] - u[0] * L - v[0] * W, b[1] - u[1] * L - v[1] * W]], true)}" fill="${col}"/>`);
}

function nowTag(sx, sy) {
  const w = 46, h = 22;
  out.push(`<g class="now"><path d="${pathOf([[sx - w / 2, sy - h], [sx + w / 2, sy - h], [sx + w / 2, sy], [sx + 5, sy], [sx, sy + 7], [sx - 5, sy], [sx - w / 2, sy]], true)}" fill="${RED}"/>` +
    `<text class="cap" x="${n1(sx)}" y="${n1(sy - 6)}" font-size="14" fill="${PAPER}" text-anchor="middle">now</text></g>`);
}

function litRing(pts) {
  out.push('<g class="lit">');
  line([...pts, pts[0], pts[1]], { w: 2.4, col: RED, amp: 0.6, over: 0 });
  out.push('</g>');
}

function legend(items, sx, sy) {
  let x = sx;
  for (const { col, text } of items) {
    const sw = [[x, sy - 13], [x + 18, sy - 13], [x + 18, sy + 3], [x, sy + 3]];
    fill(sw, col, { amp: 0.3 });
    rim(sw, 1);
    out.push(`<text class="it" x="${n1(x + 26)}" y="${n1(sy)}" font-size="16" fill="${INK}">${_attr(text)}</text>`);
    x += 26 + textW(text, 16) + 28;
  }
}

// A tape on the floor along world x, from x0 at world y, len long. Each span
// gets a stretch to scale with its sec. Returns [{a, b, m}] in world x.
function tape(x0, y, len, spans, { w = 36, z = 0 } = {}) {
  const sum = spans.reduce((t, s) => t + s.sec, 0);
  let a = x0;
  return spans.map(s => {
    const b = a + len * s.sec / sum, r = { a, b, m: (a + b) / 2 };
    box(a, y - w / 2, z, b - a, w, 4, { top: s.col, left: shadeOf(s.col), ink: 1, marks: false });
    a = b;
    return r;
  });
}

// A clock face at a sheet point, its hands at min minutes after midnight.
// Each hand sits in its own group, so sweep can turn it.
function dial(sx, sy, r, min) {
  out.push(`<g class="dial" data-cx="${n1(sx)}" data-cy="${n1(sy)}">`);
  const o = oval(sx, sy, r, r, 30);
  fill(o, '#fffdf6', { amp: 0.2 }); rim(o, 1.4);
  for (let k = 0; k < 12; k++) {
    const a = k * Math.PI / 6, i = k % 3 ? r - 6 : r - 10;
    line([[sx + Math.sin(a) * i, sy - Math.cos(a) * i], [sx + Math.sin(a) * (r - 3), sy - Math.cos(a) * (r - 3)]], { w: k % 3 ? 0.8 : 1.4, over: 0 });
  }
  for (const [per, len, w, col] of [[720, 0.55, 2.8, INK], [60, 0.8, 1.6, RED]]) {
    out.push(`<g transform="rotate(${n1((min % per) / per * 360)} ${n1(sx)} ${n1(sy)})"><g class="hand" data-per="${per}">`);
    line([[sx, sy + 4], [sx, sy - r * len]], { w, col, over: 0, amp: 0.2 });
    out.push('</g></g>');
  }
  out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="2.6" fill="${INK}"/></g>`);
}

// An hourglass standing on world point (x, y, z). left is the share of the
// sand still in the top bulb, from 1 to 0. For a step with no fixed time.
function hourglass(x, y, z = 0, { h = 64, left = 1, col = PAL.wood } = {}) {
  castDisc(x, y, 18, h, z);
  cyl(x, y, z, 20, 5, col, { cap: litOf(col) });
  const [cx, base] = P(x, y, z + 5), top = base - (h - 10), mid = (base + top) / 2, R = 15;
  const bulb = s => spline([[cx - 2, mid], [cx - R, mid + s * (h - 10) * 0.28], [cx - R + 3, mid + s * (h - 10) * 0.46], [cx + R - 3, mid + s * (h - 10) * 0.46], [cx + R, mid + s * (h - 10) * 0.28], [cx + 2, mid]], true, 1.5);
  const up = bulb(-1), down = bulb(1);
  flat(up, '#eef3f5'); flat(down, '#eef3f5');
  const sand = PAL.mustard, k = Math.max(0, Math.min(1, left));
  if (k > 0) group('class="sand top"', () => blot(spline([[cx - 2, mid - 2], [cx - R * 0.85 * Math.sqrt(k), mid - (h - 10) * 0.3 * k], [cx + R * 0.85 * Math.sqrt(k), mid - (h - 10) * 0.3 * k]], true, 1.5), sand));
  group('class="sand bottom"', () => {
    const p = (1 - k) * (h - 10) * 0.32 + 2;
    blot(spline([[cx - R + 3, base - 1], [cx, base - 1 - p], [cx + R - 3, base - 1]], true, 1.5), sand);
  });
  if (k > 0 && k < 1) out.push(`<path class="stream" d="M${n1(cx)} ${n1(mid)}V${n1(base - 3)}" stroke="${shadeOf(sand)}" stroke-width="1.2" stroke-dasharray="2 3"/>`);
  rim(up, 1); rim(down, 1);
  for (const dx of [-R - 3, R + 3]) line([[cx + dx, base], [cx + dx, top]], { w: 2.2, col: shadeOf(col), over: 0 });
  cyl(x, y, z + h - 5, 20, 5, col, { cap: litOf(col) });
}
