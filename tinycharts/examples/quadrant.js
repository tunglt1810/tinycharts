// Sorting the fruit bowl: each fruit goes to one of four places by how ripe and how big it is.
const ABOUT = 'where each one falls on two measures';
// name, ripeness %, size across in cm, colour
const FRUIT = [
  ['peach', 80, 7.5, '#f0a35e'], ['pear', 35, 8.5, '#b9c46a'], ['plum', 75, 4.5, '#7d3b5c'], ['apple', 65, 7.8, '#c8414b'],
  ['kiwi', 20, 5.5, '#8a6a4f'], ['mango', 50, 9.4, '#e8b04a'], ['apricot', 85, 5.0, '#e39a3b'], ['nectarine', 40, 6.2, '#e07a4f'],
  ['yellow pear', 90, 8.0, '#d8cf6a'], ['green plum', 15, 4.8, '#9fbf6a'], ['avocado', 70, 9.0, '#55703f'], ['fig', 55, 5.8, '#7d5a6e'],
];
const RIPE = 60, BIG = 7;
// the four places, by (ripe ? 1 : 0) + (big ? 2 : 0)
const PLACES = [
  { cap: 'THE SILL', note: 'to ripen in the sun', col: '#e3e6dc' },
  { cap: 'LUNCH BOX', note: 'for school', col: '#efe2dc' },
  { cap: 'THE BOWL', note: 'wait a few days', col: '#e6e8ea' },
  { cap: 'THE TABLE', note: 'eat today', col: '#f1e5cf' },
];
const NAMES = { waiting: 'a full bowl, none sorted', sorting: 'sorting the fruit', sorted: 'every fruit has its place' };
let N = 0, AT = 'waiting', GATE = [0, 0];

const X = r => 180 + r * 7.2, Y = s => 1150 - (s - 4) * 130;
const place = ([, r, s]) => (r >= RIPE ? 1 : 0) + (s >= BIG ? 2 : 0);
const BOWL = [1150, 470];
const inBowl = k => [BOWL[0] - 66 + (k % 6) * 26 + (Math.floor(k / 6) ? 13 : 0), BOWL[1] - 10 - Math.floor(k / 6) * 18];

function quads() {
  const cells = [[X(0), X(RIPE), Y(BIG), Y(4)], [X(RIPE), X(100), Y(BIG), Y(4)], [X(0), X(RIPE), Y(10), Y(BIG)], [X(RIPE), X(100), Y(10), Y(BIG)]];
  cells.forEach(([x0, x1, y0, y1], q) => {
    const p = PLACES[q], n = FRUIT.slice(0, N).filter(f => place(f) === q).length, last = N && place(FRUIT[N - 1]) === q;
    group(`id="q${q}"`, () => {
      out.push(`<rect x="${n1(x0 + 6)}" y="${n1(y0 + 6)}" width="${n1(x1 - x0 - 12)}" height="${n1(y1 - y0 - 12)}" rx="10" fill="${p.col}" stroke="${last ? RED : INK}" stroke-width="${last ? 2 : 1.1}"/>`);
      const ty = q < 2 ? y1 - 22 : y0 + 34;
      _text(x0 + 22, ty, p.cap, { size: 16, cls: 'cap' });
      _text(x0 + 24 + textW(p.cap, 16, 'cap') + 12, ty, p.note, { size: 13, col: LEAD });
      _text(x1 - 22, ty, String(n), { size: 18, anchor: 'end' });
    });
  });
}

function axes() {
  for (let r = 0; r <= 100; r += 20) { out.push(`<path d="M${X(r)} ${Y(4) + 4}v8" stroke="${INK}"/>`); _text(X(r), Y(4) + 32, r ? String(r) : '0 %', { size: 14, anchor: 'middle', col: r === RIPE ? RED : LEAD }); }
  for (let s = 4; s <= 10; s++) { out.push(`<path d="M${X(0) - 12} ${Y(s)}h8" stroke="${INK}"/>`); _text(X(0) - 18, Y(s) + 5, s === 10 ? '10 cm' : String(s), { size: 14, anchor: 'end', col: s === BIG ? RED : LEAD }); }
  flowArrow([[X(0) - 4, Y(4) + 4], [X(100) + 26, Y(4) + 4]], { w: 1.3, col: INK });
  flowArrow([[X(0) - 4, Y(4) + 4], [X(0) - 4, Y(10) - 26]], { w: 1.3, col: INK });
  _text((X(0) + X(100)) / 2, Y(4) + 64, 'how ripe, by a gentle squeeze  →  riper', { size: 16, anchor: 'middle' });
  _text(96, (Y(4) + Y(10)) / 2, 'size across  →  bigger', { size: 16, anchor: 'middle', extra: `transform="rotate(-90 96 ${(Y(4) + Y(10)) / 2})"` });
  // the two lines
  out.push(`<path d="M${X(RIPE)} ${Y(10) - 30}V${Y(4) + 4}M${X(0) - 4} ${Y(BIG)}H${X(100) + 14}" stroke="${RED}" stroke-width="1.8" stroke-dasharray="9 6"/>`);
  for (const [x, y, t] of [[X(RIPE), Y(10) - 40, `ripe ≥ ${RIPE} %`], [X(100) - 50, Y(BIG) - 22, `size ≥ ${BIG} cm`]]) {
    const w = textW(t, 14) + 24;
    out.push(`<rect x="${n1(x - w / 2)}" y="${y - 13}" width="${n1(w)}" height="26" rx="13" fill="${RED}"/>`);
    _text(x, y + 5, t, { size: 14, anchor: 'middle', col: PAPER });
  }
}

function fruitDot(sx, sy, col, r = 11) {
  out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="${r}" fill="${col}" stroke="${INK}" stroke-width="1.1"/><path d="M${n1(sx)} ${n1(sy - r)}l2 -6" stroke="${INK}" stroke-width="1.2"/>`);
}

function side() {
  // the bowl with the fruit still in it
  OX = BOWL[0]; OY = BOWL[1] + 30;
  castDisc(0, 0, 70, 30);
  turn(0, 0, 0, [[34, 0], [64, 26], [78, 44]], '#cfe0e8', { cap: '#e7eff3', seam: false });
  OX = 700; OY = 0;
  for (let k = FRUIT.length - 1; k >= N; k--) { const [bx, by] = inBowl(k); fruitDot(bx, by, FRUIT[k][3], 12); }
  _text(BOWL[0], BOWL[1] + 104, `the bowl: ${FRUIT.length - N} left`, { size: 14, anchor: 'middle', col: LEAD });
  person(1260, 640, { shirt: PAL.sky, pants: PAL.navy, hair: 'bun', arm: 'hold', look: -1 });
  person(1132, 1036, { shirt: PAL.rose, pants: PAL.slate, hair: 'short', kid: true, arm: 'down', look: -1 });
  // the scanner gate: each fruit passes through it to be measured
  const gx = 980, gy = 700, f = N ? FRUIT[N - 1] : null;
  OX = 1000; OY = 640;
  box(-44, -14, 0, 88, 28, 6, { left: PAL.stone, top: '#e6e1d6', marks: false });
  box(-44, -14, 6, 12, 28, 80, { left: PAL.sage, top: '#dfe6d6', marks: false });
  box(32, -14, 6, 12, 28, 80, { left: PAL.sage, top: '#dfe6d6', marks: false });
  box(-44, -14, 86, 88, 28, 12, { left: PAL.sage, top: '#dfe6d6', marks: false });
  GATE = P(0, 0, 46);
  const [b0, b1, c0] = [P(-32, 0, 46), P(32, 0, 46), P(44, 0, 3)];
  group('id="beam" opacity=".25"', () => out.push(`<path d="M${n1(b0[0])} ${n1(b0[1])}L${n1(b1[0])} ${n1(b1[1])}M${n1(b0[0])} ${n1(b0[1] - 16)}L${n1(b1[0])} ${n1(b1[1] - 16)}M${n1(b0[0])} ${n1(b0[1] + 16)}L${n1(b1[0])} ${n1(b1[1] + 16)}" stroke="${RED}" stroke-width="2" stroke-dasharray="6 4"/>`));
  out.push(`<path d="M${n1(c0[0])} ${n1(c0[1])}C${n1(c0[0] + 30)} ${n1(c0[1] + 10)} ${gx + 120} ${gy - 30} ${gx + 120} ${gy}" fill="none" stroke="${INK}" stroke-width="1.2" stroke-dasharray="3 3"/>`);
  OX = 700; OY = 0;
  _text(1056, 636, 'the scanner', { size: 13, col: LEAD });
  // the gauge: the readings of the fruit in the scanner
  out.push(`<rect x="${gx + 4}" y="${gy + 5}" width="340" height="190" rx="10" fill="#e4ddd0"/><rect x="${gx}" y="${gy}" width="340" height="190" rx="10" fill="#fffdf6" stroke="${INK}" stroke-width="1.2"/>`);
  _text(gx + 20, gy + 30, f ? `the ${f[0]} reads` : 'the gauge reads', { size: 15, col: LEAD });
  group('id="gauge"', () => {
    for (const [i, lab, v, max, line_] of [[0, 'ripe', f ? f[1] : 0, 100, RIPE], [1, 'size', f ? f[2] - 4 : 0, 6, BIG - 4]]) {
      const y = gy + 64 + i * 46, w = 190;
      _text(gx + 20, y + 6, lab, { size: 14 });
      out.push(`<rect x="${gx + 70}" y="${y - 8}" width="${w}" height="16" rx="8" fill="#efe9dc" stroke="${INK}" stroke-width=".8"/>`);
      out.push(`<rect class="bar" data-to="${n1(w * v / max)}" x="${gx + 70}" y="${y - 8}" width="${n1(w * v / max)}" height="16" rx="8" fill="${f ? f[3] : 'none'}"/>`);
      out.push(`<path d="M${n1(gx + 70 + w * line_ / max)} ${y - 13}v26" stroke="${RED}" stroke-width="1.6" stroke-dasharray="4 3"/>`);
      _text(gx + 320, y + 6, f ? (i ? `${f[2]} cm` : `${f[1]} %`) : '—', { size: 14, anchor: 'end' });
    }
  });
  _text(gx + 170, gy + 172, f ? `to ${PLACES[place(f)].cap.toLowerCase()}` : 'waiting for a fruit', { size: 17, anchor: 'middle' });
  // the lunch box and the windowsill pot at the bottom
  OX = 1040; OY = 1090;
  box(0, 0, 0, 70, 46, 30, { left: PAL.sky, top: '#dfe8f1', marks: false });
  OX = 1220; OY = 1090;
  box(-40, -20, 0, 110, 30, 12, { left: '#e9e3d6', top: '#f3efe6', marks: false });
  cyl(0, 0, 12, 18, 28, PAL.brick, { cap: '#7a5a40' });
  OX = 700; OY = 0;
  _text(1040, 1170, 'lunch box', { size: 13, anchor: 'middle', col: LEAD });
  _text(1220, 1170, 'the sill', { size: 13, anchor: 'middle', col: LEAD });
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 0;
  quads();
  axes();
  FRUIT.slice(0, N).forEach((f, k) => group(`id="f${k}"`, () => { fruitDot(X(f[1]), Y(f[2]), f[3], 13); _text(X(f[1]) + 20, Y(f[2]) + 5, f[0], { size: 13, col: LEAD }); }));
  side();
  let px = 960;
  for (const id of ['waiting', 'sorting', 'sorted']) {
    const t = { waiting: 'full bowl', sorting: 'sorting', sorted: 'all sorted' }[id], w = textW(t, 15) + 26, cx = px + w / 2;
    group(`data-state="${id}"`, () => { pill(cx, 1250, t); out.push('<g class="on">'); pill(cx, 1250, t, { lit: true }); nowTag(cx, 1228); out.push('</g>'); });
    px += w + 10;
  }
  title('a quadrant', 'Sorting the fruit bowl');
  subtitle('two measures, two lines, four places');
  status(`${N} of ${FRUIT.length} sorted`, N ? `the ${FRUIT[N - 1][0]}: to ${PLACES[place(FRUIT[N - 1])].cap.toLowerCase()}` : NAMES.waiting);
  footnote('Illustrative: made-up readings for twelve fruits. A fruit on a line counts as over it.');
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(28); ctx.state(AT); };
  const ns = 'http://www.w3.org/2000/svg';
  // the fruit flies from the bowl to its spot while the gauge bars fill
  const pick = then => {
    const k = N, f = FRUIT[k], [ax, ay] = inBowl(k), bx = X(f[1]), by = Y(f[2]), g = document.createElementNS(ns, 'circle');
    g.setAttribute('r', '11'); g.setAttribute('fill', f[3]); g.setAttribute('stroke', INK);
    N++; AT = N === FRUIT.length ? 'sorted' : 'sorting';
    const keep = N; N = k; redraw(); N = keep;
    $('art').append(g);
    const bars = [...document.querySelectorAll('#gauge .bar')], beam = $('beam'), [gx, gy] = GATE;
    // as in the original: the fruit stops in the gate, is scanned, and only then goes to its place
    const hop = (x0, y0, x1, y1, u, h) => [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u - Math.sin(Math.PI * u) * h];
    // Each leg eases on its own clock: one ease over the whole move would hit
    // the gate at full speed and leave it at full speed.
    const part = (k, a, b) => easeInOut(Math.min(1, Math.max(0, (k - a) / (b - a))));
    const step = k => {
      const [x, y] = k < 0.3 ? hop(ax, ay, gx, gy, part(k, 0, 0.3), 90) : k < 0.7 ? [gx, gy] : hop(gx, gy, bx, by, part(k, 0.7, 1), 90);
      g.setAttribute('cx', n1(x)); g.setAttribute('cy', n1(y));
      const m = part(k, 0.33, 0.62);
      beam.setAttribute('opacity', k > 0.3 && k < 0.7 ? n1(0.55 + 0.45 * Math.sin(k * 60) ** 2) : '.25');
      bars.forEach((b, i) => { b.setAttribute('fill', f[3]); b.setAttribute('width', n1(190 * m * (i ? (f[2] - 4) / 6 : f[1] / 100))); });
    };
    const done = () => { g.remove(); redraw(); ctx.hop($('q' + place(f))); then(f); };
    if (ctx.still) { step(1); done(); } else _job(ctx, [_raf(2200, step)], 2200, done);
  };
  const empty = then => {
    const dots = FRUIT.slice(0, N).map((f, k) => [$('f' + k), X(f[1]), Y(f[2]), ...inBowl(k)]);
    tween(ctx, 1000, t => dots.forEach(([el, ax, ay, bx, by]) => el && el.setAttribute('transform', `translate(${n1((bx - ax) * t)} ${n1((by - ay) * t - Math.sin(Math.PI * t) * 80)})`)), () => {
      N = 0; AT = 'waiting'; redraw(); then();
    });
  };
  ctx.button('next fruit', () => {
    if (AT === 'sorted') return ctx.no('The bowl is empty. Every fruit has its place.');
    pick(f => ctx.say(`The ${f[0]}: ${f[1]} % ripe, ${f[2]} cm across. To ${PLACES[place(f)].cap.toLowerCase()}, ${PLACES[place(f)].note}.`));
  });
  ctx.button('a new bowl', () => {
    if (AT !== 'sorted') return ctx.no(`Sort the bowl first: ${N} of ${FRUIT.length} so far.`);
    empty(() => ctx.say('A new bowl of twelve.'));
  });
  ctx.hint('Press Play all, or next fruit.');
  redraw();

  const STORY = [['waiting', 0], ['sorting', 1], ['sorting', 2], ['sorting', 3], ['sorting', 6], ['sorted', 12]];
  let si = -1;
  return {
    goto(id, play) {
      let j = play ? STORY.findIndex((s, k) => k > si && s[0] === id) : -1;
      if (j < 0) j = STORY.findIndex(s => s[0] === id);
      si = j;
      const n = STORY[j][1], say = () => ctx.say(n ? `${n} of ${FRUIT.length} sorted.` : NAMES.waiting + '.');
      if (play && n > 0) { N = n - 1; AT = N ? 'sorting' : 'waiting'; redraw(); return pick(say); }
      if (play && n === 0 && N > 0) return empty(say);
      N = n; AT = id; say();
      redraw();
    },
    story: STORY.map(s => s[0]),
  };
}
