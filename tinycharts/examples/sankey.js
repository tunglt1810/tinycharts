// Where a household's water goes in a day: bands to scale, from the mains and
// the rain barrel, through five uses, out to the sewer and the soil. One
// litre at a time follows its band; the house below shows each place.
const ABOUT = 'where it all goes, and how much';
const S = 0.95, TOP = 336, GAP = 18;
// the house is drawn small, at HS, with its world origin at HT
const HS = 0.82, HT = [554, 862];
const hp = (x, y, z) => { const [a, b] = P(x, y, z); return [HT[0] + HS * a, HT[1] + HS * b]; };
const XS = [180, 640, 1110], BW = 20;
const USES = ['shower', 'toilet', 'washer', 'kitchen', 'garden'];
const LABEL = { meter: 'the meter', mains: 'mains', barrel: 'rain barrel', shower: 'shower', toilet: 'toilet', washer: 'washing machine', kitchen: 'kitchen tap', garden: 'garden hose', sewer: 'sewer', soil: 'soil' };
const COL = { shower: PAL.sky, toilet: PAL.lilac, washer: PAL.mint, kitchen: PAL.butter, garden: PAL.sage, mains: '#7f9bb8', barrel: '#7fae6a', sewer: PAL.slate, soil: PAL.bark };
const SAYS = {
  meter: 'At the meter. Pick the next litre.', mains: 'This litre comes from the mains.', barrel: 'This litre comes from the rain barrel.',
  shower: 'Into the shower.', toilet: 'Flushed in the toilet.', washer: 'Into the washing machine.', kitchen: 'Out of the kitchen tap.', garden: 'Out of the garden hose.',
  sewer: 'Down the drain to the sewer.', soil: 'Into the soil, for the roots.',
};
let AT = 'meter';
let V = { k: 7, saver: false, barrel: false };

function flows(v) {
  const use = { shower: v.saver ? 54 : 90, toilet: 70, washer: 40, kitchen: 50, garden: 50 };
  const barrel = v.barrel ? 40 : 0, into = Object.values(use).reduce((a, b) => a + b, 0);
  return { use, src: { mains: into - barrel, barrel }, out: { sewer: into - use.garden, soil: use.garden }, total: into };
}
function pick(v) {
  const f = flows(v), p = (v.k + 0.5) / 10 * f.total;
  let acc = 0;
  for (const u of USES) { acc += f.use[u]; if (p < acc) return { use: u, barrel: p >= f.total - f.src.barrel, p }; }
}

// where each node's bar starts, top to bottom in its column
function layout(v) {
  const f = flows(v), y = {};
  y.mains = TOP; y.barrel = TOP + f.src.mains * S + 40;
  let t = TOP; for (const u of USES) { y[u] = t; t += f.use[u] * S + GAP; }
  const outH = f.total * S + 40, uH = t - GAP - TOP;
  y.sewer = TOP + (uH - outH) / 2; y.soil = y.sewer + f.out.sewer * S + 40;
  return { f, y };
}
const ease = t => t * t * (3 - 2 * t);
function ribbon(x0, a0, b0, x1, a1, b1, col) {
  const n = 24, top = [], bot = [];
  for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, e = ease(t); top.push([x, a0 + (a1 - a0) * e]); bot.push([x, b0 + (b1 - b0) * e]); }
  const pts = [...top, ...bot.reverse()];
  fill(pts, col, { amp: 0.5 });
  out.push(`<path d="${pathOf(pts, true)}" fill="none" stroke="${shadeOf(col)}" stroke-width=".8"/>`);
}

function bands(L) {
  const { f, y } = L;
  // sources to uses: the mains carries every use in order, the barrel only the garden's last part
  let at = y.mains;
  for (const u of USES) {
    const fromMains = u === 'garden' ? f.use.garden - f.src.barrel : f.use[u];
    if (fromMains > 0) ribbon(XS[0] + BW, at, at + fromMains * S, XS[1], y[u], y[u] + fromMains * S, COL[u]);
    at += fromMains * S;
  }
  if (f.src.barrel) { const g0 = y.garden + (f.use.garden - f.src.barrel) * S; ribbon(XS[0] + BW, y.barrel, y.barrel + f.src.barrel * S, XS[1], g0, g0 + f.src.barrel * S, '#a9c79a'); }
  // uses to sinks
  at = y.sewer;
  for (const u of USES.slice(0, 4)) { ribbon(XS[1] + BW, y[u], y[u] + f.use[u] * S, XS[2], at, at + f.use[u] * S, COL[u]); at += f.use[u] * S; }
  ribbon(XS[1] + BW, y.garden, y.garden + f.use.garden * S, XS[2], y.soil, y.soil + f.use.garden * S, COL.garden);
  // where the water splits into the uses, and where the used water joins again
  for (const [x, yy, t, a] of [[XS[0] + BW + 6, y.mains - 10, 'splits five ways', 'start'], [XS[2] - 6, y.sewer - 10, 'four join', 'end']]) {
    out.push(`<circle cx="${n1(a === 'start' ? x - 6 : x + 6)}" cy="${n1(yy + 10)}" r="4" fill="${INK}"/>`);
    _text(x, yy, t, { size: 13, col: LEAD, anchor: a });
  }
}

// the litre's height at each column
function litreY(L, v) {
  const { f, y } = L, k = pick(v), p = k.p;
  let start = 0; for (const u of USES) { if (u === k.use) break; start += f.use[u]; }
  const src = k.barrel ? y.barrel + (p - (f.total - f.src.barrel)) * S : y.mains + p * S;
  const use = y[k.use] + (p - start) * S;
  const sink = k.use === 'garden' ? y.soil + (p - start) * S : y.sewer + p * S;
  return { src, use, sink, k };
}

// the house below: each place the water goes, with a pill that lights
const PICT = { meter: [10, 196, 70], shower: [40, 0, 150], toilet: [137, 0, 150], washer: [225, 0, 150], kitchen: [335, 0, 150], garden: [560, 120, 30], barrel: [450, 30, 90], sewer: [200, 250, -26], soil: [540, 250, -20], mains: [-20, 250, -12] };
function house() {
  OX = 0; OY = 0;
  out.push(`<g transform="matrix(${HS} 0 0 ${HS} ${HT[0]} ${HT[1]})">`);
  box(-30, -20, -40, 700, 270, 40, { left: '#9a7a5c', top: '#b9a383', marks: false });
  // the sewer pipe and the mains pipe, seen in the cut soil
  line([P(-30, 250, -26), P(400, 250, -26)], { w: 7, col: PAL.slate, over: 0 });
  line([P(-30, 250, -12), P(10, 250, -12), P(10, 200, -12)], { w: 4, col: '#7f9bb8', over: 0 });
  for (let k = 0; k < 4; k++) { const [a, b] = [P(480 + k * 40, 250, -6), P(480 + k * 40, 250, -34)]; flowArrow([a, b], { w: 1.2, col: '#e9e1cf' }); }
  // the house, cut open
  flat([P(0, 0), P(400, 0), P(400, 220), P(0, 220)], '#e9e1cf');
  flat([P(0, 0, 0), P(400, 0, 0), P(400, 0, 110), P(0, 0, 110)], '#efe3cf');
  flat([P(0, 0, 0), P(0, 220, 0), P(0, 220, 110), P(0, 0, 110)], '#e4d6bf');
  rule([[P(0, 0, 0), P(0, 0, 110)], [P(0, 0, 110), P(400, 0, 110)], [P(0, 0, 110), P(0, 220, 110)]], INK, 0.9);
  // the garden
  flat([P(420, 0), P(660, 0), P(660, 220), P(420, 220)], '#cfdfb7');
  put(30, 0, () => { box(20, 10, 0, 70, 70, 100, { left: '#d8e5ec', top: '#eef4f6', marks: false }); const [a, b] = [P(40, 30, 96), P(50, 40, 80)]; line([a, b], { w: 1.6, over: 0 }); });
  put(31, 1, () => who(60, 60, { shirt: PAL.sky, pants: PAL.sky, hair: 'bun', arm: 'up', look: 1 }));
  put(120, 0, () => { box(120, 10, 0, 34, 24, 40, { left: '#fffdf6', marks: false }); turn(137, 50, 0, [[12, 0], [14, 20]], '#fffdf6', { cap: '#e9e3d6' }); });
  put(200, 0, () => { box(200, 10, 0, 50, 50, 56, { left: '#fffdf6', top: '#f3f1ea', marks: false }); const [cx, cy] = P(225, 60, 28); out.push(`<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="12" ry="14" fill="#cfe0ea" stroke="${INK}" stroke-width="1"/>`); });
  put(300, 0, () => { box(280, 8, 0, 110, 44, 46, { left: PAL.wood, top: '#e5d3b3', marks: false }); const [a, b] = [P(330, 20, 46), P(330, 20, 62)]; line([a, b], { w: 1.6, over: 0 }); line([b, P(330, 30, 62)], { w: 1.6, over: 0 }); });
  put(340, 0, () => who(330, 90, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'out', look: -1 }));
  put(10, 0, () => box(0, 186, 50, 8, 26, 26, { left: PAL.slate, top: PAL.grey, marks: false }));
  // garden: barrel under the downpipe, a hose to the beds
  put(460, 0, () => { turn(450, 30, 0, [[22, 0], [24, 50]], PAL.wood, { cap: '#5f7a8c' }); });
  line([P(400, 2, 110), P(430, 2, 110), P(440, 20, 60)], { w: 2, col: PAL.slate, over: 0 });
  put(520, 0, () => { const [sx, sy] = P(620, 40); line([[sx, sy], [sx, sy - 30]], { w: 3, col: PAL.bark, over: 0 }); shape(blob(sx, sy - 44, 24, 20), PAL.leaf); });
  put(560, 0, () => { for (let k = 0; k < 10; k++) { const [a, b] = [P(480 + (k * 37) % 150, 120 + (k * 23) % 80), P(480 + (k * 37) % 150, 120 + (k * 23) % 80, 14)]; line([a, b], { w: 1, col: '#6f8f5a', over: 0 }); shape(oval(b[0], b[1], 3.4, 3, 10), [PAL.rose, PAL.mustard, PAL.lilac][k % 3], { w: 0.6 }); } });
  put(600, 0, () => who(560, 190, { shirt: PAL.rose, pants: PAL.slate, hair: 'long', arm: 'hold', look: -1, kid: true }));
  flush();
  line(spline([P(462, 46, 10), P(500, 100, 2), P(540, 170, 2), P(552, 186, 30)], false, 3), { w: 1.6, col: '#5f8a5a', over: 0 });
  out.push('</g>');
  OX = 700; OY = 0;
}

function node(x, y, h, col) {
  out.push(`<rect x="${x}" y="${n1(y)}" width="${BW}" height="${n1(Math.max(h, 2))}" fill="${col}" stroke="${INK}" stroke-width="1"/>`);
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 0;
  const L = layout(V), { f, y } = L;
  bands(L);

  // the picture first, so the nodes and pills sit on top
  house();

  const ids = ['meter', 'mains', 'barrel', ...USES, 'sewer', 'soil'];
  for (const id of ids) group(`data-state="${id}"`, () => {
    let box_ = null;
    if (id === 'meter') {
      out.push(`<circle cx="100" cy="${TOP + 26}" r="20" fill="#fffdf6" stroke="${INK}" stroke-width="1.2"/>`);
      line([[100, TOP + 26], [110, TOP + 16]], { w: 1.4, col: RED, over: 0 });
      line([[120, TOP + 26], [XS[0], TOP + 26]], { w: 3, col: COL.mains, over: 0 });
      _text(100, TOP + 66, 'meter', { size: 14, anchor: 'middle', col: LEAD });
      box_ = [[74, TOP], [126, TOP], [126, TOP + 52], [74, TOP + 52]];
    } else {
      const col = id === 'mains' || id === 'barrel' ? 0 : id === 'sewer' || id === 'soil' ? 2 : 1;
      const h = (col === 0 ? f.src[id] : col === 2 ? f.out[id] : f.use[id]) * S;
      if (h) node(XS[col], y[id], h, COL[id]);
      const val = col === 0 ? f.src[id] : col === 2 ? f.out[id] : f.use[id];
      if (col === 0) { _text(XS[0] - 12, y[id] + Math.max(h, 10) / 2 + 2, LABEL[id], { size: 16, anchor: 'end' }); _text(XS[0] - 12, y[id] + Math.max(h, 10) / 2 + 22, `${val} L`, { size: 14, anchor: 'end', col: LEAD }); }
      if (col === 1) pill(XS[1] - 120, y[id] + h / 2, `${LABEL[id]} ${val} L`);
      if (col === 2) { _text(XS[2] + BW + 12, y[id] + h / 2, LABEL[id], { size: 16 }); _text(XS[2] + BW + 12, y[id] + h / 2 + 20, `${val} L`, { size: 14, col: LEAD }); }
      box_ = [[XS[col] - 4, y[id] - 4], [XS[col] + BW + 4, y[id] - 4], [XS[col] + BW + 4, y[id] + Math.max(h, 16) + 4], [XS[col] - 4, y[id] + Math.max(h, 16) + 4]];
    }
    // the matching pill in the house
    const [wx, wy, wz] = PICT[id];
    OX = 0; OY = 0; const [px, py] = hp(wx, wy, wz); OX = 700; OY = 0;
    const word = { mains: 'mains pipe', garden: 'hose' }[id] || LABEL[id];
    pill(px, py, word);
    out.push('<g class="on">');
    litRing(box_);
    nowTag(box_[1][0] - 8, box_[1][1] - 6);
    pill(px, py, word, { lit: true });
    out.push('</g>');
  });

  // the litre
  const ly = litreY(L, V);
  // a litre that reached the sewer or the soil is gone; the next one starts at the meter
  group('id="drop"', () => {
    if (AT === 'sewer' || AT === 'soil') return;
    const [x, yy] = dropAt(AT, ly);
    out.push(`<g transform="translate(${n1(x)} ${n1(yy)})"><path d="M0 -13C6 -4 9 1 9 5A9 9 0 0 1 -9 5C-9 1 -6 -4 0 -13Z" fill="#7fb0d8" stroke="${INK}" stroke-width="1.1"/></g>`);
  });

  // scale and key
  out.push(`<rect x="1110" y="300" width="${n1(50 * S)}" height="10" fill="${PAL.grey}" stroke="${INK}" stroke-width=".8"/>`);
  _text(1110 + 50 * S + 10, 311, 'band: 50 litres a day', { size: 14, col: LEAD });
  _text(XS[1] + BW / 2, 266, 'USES', { size: 13, cls: 'cap', col: LEAD, anchor: 'middle' });
  _text(XS[0] + BW / 2, 266, 'IN', { size: 13, cls: 'cap', col: LEAD, anchor: 'middle' });
  _text(XS[2] + BW / 2, 266, 'OUT', { size: 13, cls: 'cap', col: LEAD, anchor: 'middle' });

  title('a sankey', 'Where the water goes');
  subtitle('a house of three, one day, every band to scale');
  status(LABEL[AT], `${f.total} L in · ${f.out.sewer + f.out.soil} L out${V.saver ? ' · saver head' : ''}`);
  footnote('Illustrative: made-up litres for a house of three. A saver shower head cuts the shower by two fifths.');
  finish();
}

function dropAt(id, ly) {
  if (id === 'meter') return [100, TOP + 26];
  if (id === 'mains' || id === 'barrel') return [XS[0] + BW / 2, ly.src];
  if (USES.includes(id)) return [XS[1] + BW / 2, ly.use];
  return [XS[2] + BW / 2, ly.sink];
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(19); ctx.state(AT); };
  const leg = (a, b, n = 28) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * ease(t)]; });
  const go = (to, v = V) => {
    const L = layout(v), ly = litreY(L, v), A = dropAt(AT, ly), B = dropAt(to, ly);
    const land = () => { V = v; AT = to; redraw(); grow(1); };
    if (to === 'meter') return land();
    const pts = AT === 'meter' ? [A, [(A[0] + B[0]) / 2, Math.min(A[1], B[1]) - 30], B] : leg(A, B);
    // one drop runs its whole band, sinks away at the end, and a new one rises there for the next band
    walk(ctx, $('drop'), pts.map(p => [...at(...p), 0]), { bob: 0, ms: AT === 'meter' ? 900 : 2200, then: () => grow(-1, land) });
  };
  const grow = (dir, then = () => {}) => {
    const d = document.querySelector('#drop path');
    if (!d) return then();
    d.style.transformBox = 'fill-box'; d.style.transformOrigin = '50% 100%';
    tween(ctx, 420, k => { const u = dir > 0 ? k : 1 - k; d.style.transform = `scale(${u.toFixed(3)})`; d.style.opacity = u.toFixed(3); }, then);
  };
  ctx.button('follow the litre', () => {
    if (AT === 'meter') { const v = { ...V, k: (V.k + 3) % 10 }, k = pick(v); ctx.say(`Litre ${v.k + 1} of ten. ` + SAYS[k.barrel ? 'barrel' : 'mains']); return go(k.barrel ? 'barrel' : 'mains', v); }
    if (AT === 'mains' || AT === 'barrel') { const u = pick(V).use; ctx.say(SAYS[u]); return go(u); }
    if (USES.includes(AT)) { const to = AT === 'garden' ? 'soil' : 'sewer'; ctx.say(SAYS[to]); return go(to); }
    ctx.say(SAYS.meter); go('meter');
  });
  ctx.button('fit a saver shower head', () => {
    if (AT !== 'meter') return ctx.no('Change the house between litres, at the meter.');
    V.saver = !V.saver; redraw();
    ctx.say(V.saver ? 'Saver head on. The shower band shrinks from 90 to 54 L.' : 'Old head back on. 90 L in the shower.');
  });
  ctx.button('connect the rain barrel', () => {
    if (AT !== 'meter') return ctx.no('Change the house between litres, at the meter.');
    V.barrel = !V.barrel; redraw();
    ctx.say(V.barrel ? 'Barrel on. 40 L of the garden water now comes from the roof.' : 'Barrel off. The garden takes mains water again.');
  });
  ctx.hint('Press Play all, or follow the litre. Try the saver head and the barrel.');
  redraw();

  // [state, litre, saver, barrel]
  const STORY = [['meter', 7, false, false], ['mains', 0, false, false], ['shower', 0, false, false], ['sewer', 0, false, false], ['meter', 0, false, false],
    ['mains', 3, false, false], ['toilet', 3, false, false], ['sewer', 3, false, false], ['meter', 3, false, true],
    ['mains', 6, false, true], ['washer', 6, false, true], ['sewer', 6, false, true], ['meter', 6, true, true],
    ['barrel', 9, true, true], ['garden', 9, true, true], ['soil', 9, true, true], ['meter', 9, true, true],
    ['mains', 7, true, true], ['kitchen', 7, true, true], ['sewer', 7, true, true], ['meter', 7, true, true]];
  let si = -1;
  return {
    goto(id, play) {
      let j = play ? STORY.findIndex((s, k) => k > si && s[0] === id) : -1;
      if (j < 0) j = STORY.findIndex(s => s[0] === id);
      si = j;
      const [, k, saver, barrel] = STORY[j], v = { k, saver, barrel };
      ctx.say(SAYS[id]);
      if (play && id !== AT) go(id, v);
      else { V = v; AT = id; redraw(); }
    },
    story: STORY.map(s => s[0]),
  };
}
