// A bath as a stock: the tap is the inflow, the plug and the overflow are the
// outflows. The diagram on top, the bathroom it stands for below.
const ABOUT = 'what fills it, and what drains it';
const MAX = 160, STEP = 40;
const BX = [560, 820], BY = [404, 644], PXL = (BY[1] - BY[0]) / MAX;
const NAMES = { empty: 'empty', part: 'partly full', full: 'full to the overflow' };
let AT = 'empty', L = 0, SPILT = 0, LAST = '', FLOWING = false;

const stateOf = l => l === 0 ? 'empty' : l === MAX ? 'full' : 'part';

function cloudAt(cx, cy, label) {
  shape(blob(cx, cy, 46, 26, 0.18, 9), '#e7eaee', { w: 1.1 });
  _text(cx, cy + 50, label, { size: 15, col: LEAD, anchor: 'middle' });
}
function flowPipe(pts, on) {
  out.push(`<path d="${pathOf(pts)}" fill="none" stroke="${INK}" stroke-width="11" stroke-linejoin="round"/>`);
  out.push(`<path d="${pathOf(pts)}" fill="none" stroke="${on ? '#a9c4d6' : PAPER}" stroke-width="7" stroke-linejoin="round"/>`);
  if (on && FLOWING) out.push(`<path class="stream" d="${pathOf(pts)}" fill="none" stroke="#4f86b3" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 12"/>`);
}
function valve(x, y, open) {
  shape([[x - 13, y - 10], [x + 13, y + 10], [x + 13, y - 10], [x - 13, y + 10]], open ? '#f6e6e0' : '#fffdf6', { w: 1.2 });
  line([[x, y], [x, y - 24]], { w: 1.1, over: 0 });
  out.push(`<circle cx="${x}" cy="${y - 29}" r="5" fill="#fffdf6" stroke="${INK}" stroke-width="1"/>`);
}

function diagram() {
  const lv = BY[1] - L * PXL;
  // inflow: the water main, through the tap, into the bath
  cloudAt(150, 360, 'the water main');
  flowPipe([[196, 360], [690, 360], [690, BY[0] - 14]], LAST === 'tap');
  flowArrow([[690, BY[0] - 24], [690, BY[0] - 2]], { w: 2, col: INK });
  valve(420, 360, LAST === 'tap');
  _text(440, 322, 'tap in', { size: 17 });
  _text(440, 342, `+${STEP} L a turn`, { size: 14, col: LEAD });
  // outflows: the overflow near the top, the plug at the bottom
  flowPipe([[BX[1], BY[0] + 6], [1120, BY[0] + 6]], LAST === 'spill');
  flowArrow([[1100, BY[0] + 6], [1128, BY[0] + 6]], { w: 2, col: INK });
  valve(960, BY[0] + 6, LAST === 'spill');
  _text(960, BY[0] - 40, 'overflow', { size: 17, anchor: 'middle' });
  _text(960, BY[0] + 40, 'what the tap adds when full', { size: 13, col: LEAD, anchor: 'middle' });
  cloudAt(1190, BY[0] + 6, 'the drain');
  flowPipe([[BX[1], BY[1] - 6], [1120, BY[1] - 6]], LAST === 'plug');
  flowArrow([[1100, BY[1] - 6], [1128, BY[1] - 6]], { w: 2, col: INK });
  valve(960, BY[1] - 6, LAST === 'plug');
  _text(960, BY[1] + 26, 'plug', { size: 17, anchor: 'middle' });
  _text(960, BY[1] + 46, `−${STEP} L a pull, if not empty`, { size: 13, col: LEAD, anchor: 'middle' });
  cloudAt(1190, BY[1] - 6, 'the sewer');

  // the stock
  out.push(`<rect x="${BX[0]}" y="${BY[0]}" width="${BX[1] - BX[0]}" height="${BY[1] - BY[0]}" fill="#fffdf6" stroke="${INK}" stroke-width="1.6"/>`);
  if (L) fill([[BX[0] + 2, lv], [BX[1] - 2, lv], [BX[1] - 2, BY[1] - 2], [BX[0] + 2, BY[1] - 2]], '#bcd4e4', { amp: 0.4 });
  _text(BX[0] + 14, BY[0] + 28, 'water in the bath', { size: 17 });
  _text((BX[0] + BX[1]) / 2 - 10, (BY[0] + BY[1]) / 2 + 22, `${Math.round(L)} L`, { size: 34, anchor: 'middle' });
  _text((BX[0] + BX[1]) / 2 - 10, (BY[0] + BY[1]) / 2 + 48, `of ${MAX} L`, { size: 14, col: LEAD, anchor: 'middle' });
  for (let v = 0; v <= MAX; v += 40) {
    const y = BY[1] - v * PXL;
    line([[BX[1] - 12, y], [BX[1], y]], { w: 1, over: 0 });
    _text(BX[1] - 16, y + (v === MAX ? 16 : v ? 5 : -4), String(v), { size: 12, col: LEAD, anchor: 'end' });
  }
}

function pills() {
  const P3 = { full: BY[0] + 10, part: (BY[0] + BY[1]) / 2, empty: BY[1] - 10 };
  out.push(`<path d="M500 ${BY[0] + 40}h-8V${BY[1] - 40}h8" fill="none" stroke="${MUTE}" stroke-width="1"/>`);
  out.push(`<circle cx="300" cy="${P3.empty}" r="6" fill="${INK}"/>`);
  flowArrow([[306, P3.empty], [370, P3.empty]], { w: 1.3, col: INK });
  for (const id of ['full', 'part', 'empty']) {
    const t = NAMES[id], x = 470 - textW(t, 15) / 2 - 13;
    group(`data-state="${id}"`, () => {
      pill(x, P3[id], t);
      out.push('<g class="on">');
      pill(x, P3[id], t, { lit: true });
      nowTag(x + textW(t, 15) / 2 - 8, P3[id] - 16);
      out.push('</g>');
    });
  }
}

function bathroom() {
  OX = 640; OY = 850;
  const W = 400, D = 250, H = 130;
  box(-16, -16, -20, W + 32, D + 32, 20, { left: PAL.wood, top: '#e9e3d6', marks: false });
  flat([P(0, 0), P(W, 0), P(W, D), P(0, D)], '#e9e3d6');
  for (let i = 0; i <= W; i += 40) rule([[P(i, 0), P(i, D)]], '#d6cfc0', 0.6);
  for (let j = 0; j <= D; j += 50) rule([[P(0, j), P(W, j)]], '#d6cfc0', 0.6);
  flat([P(0, 0, 0), P(W, 0, 0), P(W, 0, H), P(0, 0, H)], '#dfeaf0');
  flat([P(0, 0, 0), P(0, D, 0), P(0, D, H), P(0, 0, H)], '#d3e2ea');
  for (let i = 40; i < W; i += 40) rule([[P(i, 0, 0), P(i, 0, H)]], '#c2d4de', 0.6);
  rule([[P(0, 0, 0), P(0, 0, H)], [P(0, 0, H), P(W, 0, H)], [P(0, 0, H), P(0, D, H)]], INK, 0.9);

  const T0 = [40, 8], T1 = [300, 108], TH = 56, d = 6;
  const ring = z => [P(T0[0] + d, T0[1] + d, z), P(T1[0] - d, T0[1] + d, z), P(T1[0] - d, T1[1] - d, z), P(T0[0] + d, T1[1] - d, z)];
  put(100, 0, () => {
    box(T0[0], T0[1], 0, T1[0] - T0[0], T1[1] - T0[1], TH, { left: '#fffdf6', top: '#f3f1ea', marks: false });
    flat(ring(TH), '#cfd3d6');
    // the water sits below the rim; the clip hides what the tub's own front walls would hide
    const z = 6 + (L / MAX) * (TH - 14);
    clipped(ring(TH), () => {
      flat([P(T0[0] + d, T0[1] + d, TH), P(T1[0] - d, T0[1] + d, TH), P(T1[0] - d, T0[1] + d, 6), P(T0[0] + d, T0[1] + d, 6)], '#e6e8e9');
      if (L) flat(ring(z), '#a9c4d6');
      if (L >= 80) { const [dx, dy] = P(190, 60, z); shape(oval(dx, dy - 4, 9, 6, 12), PAL.mustard, { w: 0.8 }); out.push(`<circle cx="${n1(dx + 6)}" cy="${n1(dy - 13)}" r="5" fill="${PAL.mustard}" stroke="${INK}" stroke-width=".8"/>`); }
    });
    rim(ring(TH), 1);
    const [ox, oy] = P(T1[0] - d - 1, 40, TH - 10);
    out.push(`<circle cx="${n1(ox)}" cy="${n1(oy)}" r="3.5" fill="#9aa1a8" stroke="${INK}" stroke-width=".8"/>`);
    const [tx, ty] = P(270, 0, TH + 30);
    shape([[tx - 4, ty - 6], [tx + 4, ty - 6], [tx + 4, ty + 2], [tx - 4, ty + 2]], '#c9cdd3', { w: 0.8 });
    line([[tx, ty + 2], [tx + 8, ty + 12]], { w: 3, col: '#a9aeb5', over: 0 });
    if (LAST === 'tap') for (let k = 0; k < 4; k++) out.push(`<circle cx="${n1(tx + 9)}" cy="${n1(ty + 18 + k * 9)}" r="1.8" fill="#7fb0d8"/>`);
    const [cx, cy] = P(T1[0] + 4, 70, TH);
    line([[cx, cy], [cx + 6, cy + 14], [cx + 2, cy + 26]], { w: 0.8, col: '#9aa1a8', over: 0 });
    out.push(`<circle cx="${n1(cx + 2)}" cy="${n1(cy + 30)}" r="4.5" fill="${LAST === 'plug' ? '#3b3a3c' : '#9aa1a8'}" stroke="${INK}" stroke-width=".8"/>`);
  });
  put(200, 0, () => { box(330, 2, 80, 50, 4, 5, { left: '#c9cdd3', marks: false }); flat([P(336, 4, 82), P(374, 4, 82), P(374, 4, 34), P(336, 4, 34)], PAL.rose); });
  put(260, 0, () => flat([P(120, 150, 1), P(260, 150, 1), P(260, 210, 1), P(120, 210, 1)], PAL.sage));
  put(300, 0, () => who(320, 140, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: LAST === 'plug' ? 'out' : LAST === 'tap' ? 'wave' : 'down', look: -1, kid: true }));
  put(320, 0, () => who(90, 200, { shirt: PAL.sage, pants: PAL.slate, hair: 'bun', arm: 'hold', look: 1 }));
  flush();
  const lab = (wx, wy, wz, sx, sy, text, anchor) => {
    const [ax, ay] = P(wx, wy, wz);
    out.push(`<path d="M${n1(ax)} ${n1(ay)}L${sx} ${sy}" stroke="${MUTE}" stroke-width=".8" stroke-dasharray="2 4" fill="none"/>`);
    _text(sx + (anchor === 'end' ? -6 : 6), sy + 5, text, { size: 15, anchor });
  };
  lab(270, 0, TH + 30, 1080, 760, 'tap: the inflow', 'start');
  lab(80, 60, TH, 330, 880, 'bath: the stock', 'end');
  lab(T1[0] + 4, 70, TH - 20, 1080, 960, 'plug: an outflow', 'start');
  lab(T1[0] - d - 1, 40, TH - 10, 1080, 860, 'overflow: an outflow', 'start');
  OX = 700; OY = 0;
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 0;
  diagram();
  pills();
  bathroom();
  // while the level moves the drop has landed, so it is not drawn back at the main
  group('id="drop"', () => FLOWING !== 'level' && out.push(`<path transform="translate(150 360)" d="M0 -10C5 -3 7 1 7 4A7 7 0 0 1 -7 4C-7 1 -5 -3 0 -10Z" fill="#7fb0d8" stroke="${INK}" stroke-width="1"/>`));
  title('a stock and flow', 'Bath time');
  subtitle('the tap fills it, the plug drains it, the overflow saves the floor');
  status(NAMES[AT], `${Math.round(L)} of ${MAX} L${SPILT ? ` · ${SPILT} L down the overflow` : ''}`);
  footnote(`Illustrative: a ${MAX} L bath. Each turn of the tap or pull of the plug moves ${STEP} L.`);
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(21); ctx.state(AT); };
  const TAP = [[150, 360], [420, 360], [690, 360], [690, BY[0] + 10]];
  const WAY = { tap: TAP, spill: [...TAP, [BX[1], BY[0] + 6], [1120, BY[0] + 6]], plug: [[150, 360], [(BX[0] + BX[1]) / 2, BY[1] - 20], [BX[1], BY[1] - 6], [960, BY[1] - 6], [1120, BY[1] - 6]] };
  // the pipe runs and the drop rides it; then the level rises or falls to its
  // new mark, redrawn at most 30 times a second
  const flow = (kind, to, spilt, then = () => {}) => {
    LAST = kind; FLOWING = true; redraw();
    walk(ctx, $('drop'), WAY[kind].map(p => [...at(...p), 0]), { bob: 0, ms: 1300, then: () => {
      const from = L; let last = 0;
      FLOWING = 'level';
      tween(ctx, to === from ? 500 : 1500, k => {
        const now = performance.now();
        if (now - last < 30 && k < 1) return;
        // ctx.state also rewrites the URL, too often for a browser at this rate
        last = now; L = from + (to - from) * k; draw(21);
        document.querySelectorAll('#art [data-state]').forEach(el => el.classList.toggle('lit', el.dataset.state === AT));
      }, () => { L = to; SPILT = spilt; FLOWING = false; AT = stateOf(L); redraw(); then(); });
    } });
  };
  ctx.button('turn the tap', () => {
    const full = L === MAX;
    ctx.say(full ? `Full already: ${STEP} L run out of the overflow.` : `The tap runs: +${STEP} L.`);
    flow(full ? 'spill' : 'tap', Math.min(L + STEP, MAX), SPILT + (full ? STEP : 0));
  });
  ctx.button('pull the plug', () => {
    if (L === 0) return ctx.no('The bath is empty. Nothing to drain.');
    ctx.say(`Glug: −${STEP} L down the plug.`);
    flow('plug', L - STEP, SPILT);
  });
  ctx.hint('Press Play all, or turn the tap. Keep turning when it is full.');
  redraw();

  // [state, litres, spilt, last]
  const STORY = [['empty', 0, 0, ''], ['part', 40, 0, 'tap'], ['part', 80, 0, 'tap'], ['part', 120, 0, 'tap'], ['full', 160, 0, 'tap'], ['full', 160, 40, 'spill'],
    ['part', 120, 40, 'plug'], ['part', 80, 40, 'plug'], ['part', 40, 40, 'plug'], ['empty', 0, 40, 'plug']];
  let si = -1;
  return {
    goto(id, play) {
      let j = play ? STORY.findIndex((s, k) => k > si && s[0] === id) : -1;
      if (j < 0) j = STORY.findIndex(s => s[0] === id);
      si = j;
      const [, l, spilt, last] = STORY[j];
      ctx.say(`${NAMES[id]}: ${l} L.`);
      if (play && last && j > 0) return flow(last, l, spilt);
      L = l; SPILT = spilt; LAST = last; AT = id; redraw();
    },
    tick(t) {
      for (const p of document.querySelectorAll('#art .stream')) p.setAttribute('stroke-dashoffset', n1(-t * 70));
    },
    story: STORY.map(s => s[0]),
  };
}
