// A layer cake, pulled apart along z on its stand. Each layer drops into its
// slot; a layer that is not on yet is a dashed ghost. Click a layer to lift it.
const ABOUT = 'what is inside, layer by layer';
const G = 90, FZ = -40, TZ = -110;
// layer: state, margin title, note, height, radius, side, top, minutes to set
const LAYERS = [
  ['board', 'the board', '28 cm card, gold foil', 6, 104, '#d8bf7a', '#efdca4', 0],
  ['base', 'bottom sponge', 'vanilla, 4 cm, cool 1 h', 30, 86, '#e2b874', '#f1d699', 60],
  ['jam', 'raspberry jam', 'a thin coat, sets in 20 min', 6, 82, '#b4404f', '#cf5a68', 20],
  ['middle', 'middle sponge', 'chocolate, 4 cm, cool 1 h', 30, 86, '#8a5a3c', '#a5714d', 60],
  ['cream', 'whipped cream', '2 cm, firm after 30 min cold', 14, 84, '#efe6d2', '#fffaf0', 30],
  ['top', 'top sponge', 'vanilla, flat side up', 30, 86, '#e2b874', '#f1d699', 60],
  ['iced', 'the icing', 'last of all, on a cold cake', 10, 89, '#e9b3c4', '#f6d3de', 0],
];
const IDS = LAYERS.map(l => l[0]);
const Z0 = []; { let z = 0; for (const l of LAYERS) { Z0.push(z); z += l[3] + G; } }
const NAMES = { board: 'the board', base: 'the bottom sponge', jam: 'the jam', middle: 'the middle sponge', cream: 'the cream', top: 'the top sponge', iced: 'iced' };
const START = 600;
let AT = 'board', V = { on: 0, soft: false }, MIN = START, LIFT = -1;
const RISE = 14;

const K = 1.2247449, Q = 0.7071068;
const zOf = i => Z0[i] + (IDS[i] === AT && i > 0 ? RISE : 0);
// the minutes since the start when state i is entered, every layer before it set
const cap = t => t[0].toUpperCase() + t.slice(1);
const minAt = i => START + LAYERS.slice(0, i).reduce((m, l) => m + l[7] + 10, 0);

function ellipse(cx, cy, r, attrs) { out.push(`<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(r * K)}" ry="${n1(r * Q)}" ${attrs}/>`); }

// a layer not on yet: a dashed outline in its slot
function ghost(i) {
  const [, , , h, r] = LAYERS[i], [cx, cy] = P(0, 0, Z0[i]), top = cy - h, dsh = 'fill="none" stroke="#a89f92" stroke-width="1.2" stroke-dasharray="6 5"';
  ellipse(cx, top, r, `fill="#fffdf6" fill-opacity=".5" ${dsh}`);
  out.push(`<path d="M${n1(cx - r * K)} ${n1(top)}V${n1(cy)}A${n1(r * K)} ${n1(r * Q)} 0 0 0 ${n1(cx + r * K)} ${n1(cy)}V${n1(top)}" ${dsh}/>`);
}

function layer(i) {
  const [id, , , h, r, side, topc] = LAYERS[i], z = zOf(i), [cx, cy] = P(0, 0, z), top = cy - h;
  cyl(0, 0, z, r, h, side, { cap: topc });
  const front = (n, k0 = 0.15, k1 = 0.85) => Array.from({ length: n }, (_, j) => { const t = Math.PI * (k0 + (k1 - k0) * (j + rnd() * 0.6) / n); return [cx - Math.cos(t) * r * K, Math.sin(t) * r * Q]; });
  if (id === 'board') rule(front(26, 0.02, 0.98).map(([x, d]) => [[x, cy + d - 1], [x, cy + d - h + 1]]), '#a8894a', 0.8);
  if (['base', 'middle', 'top'].includes(id)) {
    const dot = id === 'middle' ? '#5f3a24' : '#c5965a';
    for (const [x, d] of front(30)) out.push(`<circle cx="${n1(x)}" cy="${n1(cy + d - 6 - rnd() * (h - 12))}" r="${n1(1 + rnd() * 1.2)}" fill="${dot}"/>`);
    for (let j = 0; j < 14; j++) { const a = rnd() * 6.28, d = rnd() * r * 0.8; out.push(`<circle cx="${n1(cx + Math.cos(a) * d * K)}" cy="${n1(top + Math.sin(a) * d * Q)}" r="1.3" fill="${dot}" opacity=".6"/>`); }
  }
  if (id === 'jam') {
    for (const [x, d] of front(6, 0.2, 0.8)) { const y = cy + d, L = 8 + rnd() * 12; shape([[x - 4, y - 2], [x + 4, y - 2], [x + 3, y + L - 4], [x, y + L], [x - 3, y + L - 4]], '#b4404f', { w: 0.8 }); }
    for (let j = 0; j < 22; j++) { const a = rnd() * 6.28, d = rnd() * r * 0.85; out.push(`<circle cx="${n1(cx + Math.cos(a) * d * K)}" cy="${n1(top + Math.sin(a) * d * Q)}" r="1.1" fill="#f3d7a0"/>`); }
  }
  if (id === 'cream') for (let j = 0; j < 14; j++) { const t = j / 14 * 2 * Math.PI; if (Math.sin(t) < -0.2) continue; shape(blob(cx + Math.cos(t) * r * 0.86 * K, top + Math.sin(t) * r * 0.86 * Q - 3, 7, 5, 0.25, 5), '#f4ead6', { w: 0.7 }); }
  if (id === 'iced') {
    const SPR = ['#7fa7d4', '#e3c77a', '#8fae84', '#c8836b', '#cfd0e6'];
    for (let j = 0; j < 40; j++) { const a = rnd() * 6.28, d = rnd() * r * 0.88, x = cx + Math.cos(a) * d * K, y = top + Math.sin(a) * d * Q, b = rnd() * 3.14; line([[x, y], [x + Math.cos(b) * 5, y + Math.sin(b) * 3]], { w: 1.6, col: SPR[j % 5], over: 0, amp: 0 }); }
    for (const [x, d] of front(7, 0.1, 0.9)) { const y = top + d, L = h + 4 + rnd() * 8; shape([[x - 5, y + 1], [x + 5, y + 1], [x + 4, y + L - 4], [x, y + L], [x - 4, y + L - 4]], '#f6d3de', { w: 0.7 }); }
    for (let j = 0; j < 6; j++) { const t = (j / 6) * 2 * Math.PI + 0.3; shape(blob(cx + Math.cos(t) * r * 0.62 * K, top + Math.sin(t) * r * 0.62 * Q - 6, 8, 9, 0.1, 3), '#c23b45', { w: 0.9 }); }
    cyl(0, 0, z + h, 4, 34, '#f6efe0', { cap: '#fffaf0' });
    group('id="flame"', () => shape(blob(cx, top - 42, 4, 7, 0, 3), '#f2b84b', { w: 0.7 }));
  }
}

// the lit look: a red ring round the front of the layer, and the now tag
function lit(i) {
  const [id, , , h, r] = LAYERS[i], [cx, cy] = P(0, 0, zOf(i)), top = cy - h, a = r * K + 6, b = r * Q + 5;
  group(`data-state="${id}"`, () => {
    out.push('<g class="on">');
    out.push(`<path d="M${n1(cx - a)} ${n1(top)}A${n1(a)} ${n1(b)} 0 0 1 ${n1(cx + a)} ${n1(top)}V${n1(cy)}A${n1(a)} ${n1(b)} 0 0 1 ${n1(cx - a)} ${n1(cy)}Z" fill="none" stroke="${RED}" stroke-width="2.4"/>`);
    // on the side away from the layer's own label, so the tag misses its leader
    nowTag(cx + (i % 2 ? -1 : 1) * (a + 34), cy - h / 2 + 8);
    out.push('</g>');
  });
}

function kitchen() {
  // the table and the stand
  put(-400, 0, () => { for (const [x, y] of [[-120, -120], [120, -120], [-120, 120], [120, 120]]) box(x - 7, y - 7, TZ, 14, 14, FZ - 16 - TZ, { left: PAL.bark, marks: false }); });
  put(-300, 0, () => box(-130, -130, FZ - 16, 260, 260, 16, { top: '#e6d3b0', left: PAL.wood, marks: false }));
  put(-200, 0, () => { castDisc(0, 0, 40, 40, FZ); turn(0, 0, FZ, [[38, 0], [42, 5], [13, 10], [10, 32], [40, 36], [118, 40]], '#eef0f2', { cap: '#f7f8f9' }); });
  // on the table: jam jar, cream bowl and whisk, strawberries, piping bag
  put(-10, 1, () => turn(-100, 90, FZ, [[11, 0], [12, 22], [9, 25]], '#c84d5c', { cap: '#e3c77a' }));
  put(-10, 2, () => { turn(90, -100, FZ, [[11, 0], [21, 15]], '#cfe0d2', { cap: '#fffaf0' }); line([P(94, -102, FZ + 15), P(106, -118, FZ + 44)], { w: 2, over: 0 }); });
  put(200, 1, () => turn(95, 95, FZ, [[8, 0], [18, 9]], '#f3ead8', { cap: '#c23b45' }));
  put(40, 1, () => { const [sx, sy] = P(-30, 105, FZ); shape([[sx - 24, sy - 5], [sx + 12, sy - 12], [sx + 20, sy - 3], [sx - 20, sy + 4]], '#e9b3c4', { w: 0.9 }); });
  // the oven, the fridge, and the wire rack with the next sponge cooling
  put(-220 + 300, 0, () => {
    box(-220, 300, TZ, 90, 80, 80, { top: '#4b4644', left: PAL.slate, marks: false });
    const a = P(-130, 316, TZ + 64), b = P(-130, 364, TZ + 18);
    out.push(`<path d="${pathOf([a, P(-130, 364, TZ + 64), b, P(-130, 316, TZ + 18)], true)}" fill="#2b2a28" opacity=".5"/>`);
  });
  put(230 - 300, 0, () => { box(230, -300, TZ, 90, 90, 130, { top: '#f3f5f6', left: '#dfe5ea', marks: false }); line([P(320, -230, TZ + 110), P(320, -230, TZ + 72)], { w: 2.4, over: 0 }); });
  put(92 - 242, 0, () => {
    for (const [x, y] of [[52, -282], [132, -282], [52, -202], [132, -202]]) box(x - 3, y - 3, TZ, 6, 6, 60, { left: PAL.grey, marks: false });
    box(49, -285, TZ + 60, 86, 86, 5, { top: '#c9ccd2', left: PAL.grey, marks: false });
    rule([0, 1, 2, 3, 4].map(k => [P(49 + k * 20, -285, TZ + 65), P(49 + k * 20, -199, TZ + 65)]), INK, 0.6);
    cyl(92, -242, TZ + 65, 34, 14, '#e2b874', { cap: '#f1d699' });
  });
}

function people() {
  const SIX = [
    ['dad', -130, 250, { shirt: PAL.sage, pants: PAL.bark, hair: 'cap', arm: 'out', look: 1 }],
    ['baker', 60, 200, { shirt: PAL.rose, pants: PAL.navy, hair: 'bun', arm: 'hold', look: 1 }],
    ['friend', 150, 160, { shirt: PAL.brick, pants: PAL.slate, hair: 'bob', arm: 'hold', look: -1 }],
    ['gran', 210, 60, { shirt: PAL.lilac, pants: PAL.slate, hair: 'bob', arm: 'down', look: -1, sit: 1 }],
    ['kid', 250, -60, { shirt: PAL.mustard, pants: PAL.blue, hair: 'short', arm: 'up', look: -1, kid: true }],
    ['teen', 340, -130, { shirt: PAL.sky, pants: PAL.navy, hair: 'short', arm: 'wave', look: -1 }],
  ];
  for (const [id, x, y, o] of SIX) put(x + y, 5, () => group(`id="${id}"`, () => who(x, y, o, TZ)));
  put(270, 4, () => box(200, 50, TZ, 26, 26, 20, { top: PAL.wood, left: PAL.bark, marks: false }));
  put(210, 5, () => dog(-40, 250, TZ, '#cdb68e'));
  put(166, 6, () => group('id="cat"', () => cat(-175, 340, TZ + 80, '#e3c77a')));
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 1010;
  kitchen(); people();
  flush();
  // the guides across each gap, then the layers from the board up
  group('id="guides"', () => { for (let i = 0; i < LAYERS.length - 1; i++) {
    const r = Math.min(LAYERS[i][4], LAYERS[i + 1][4]), [cx, cy] = P(0, 0, Z0[i] + LAYERS[i][3]), y1 = P(0, 0, Z0[i + 1])[1];
    for (const s of [-1, 1]) dash([cx + s * r * K, cy], [cx + s * r * K, y1], '#8f8578', 5, 4, 1.2);
  } });
  LAYERS.forEach((l, i) => group(`class="lay" data-i="${i}" data-state="${l[0]}"`, () => (i <= V.on ? layer(i) : ghost(i))));
  // steam over a warm sponge
  const cur = IDS.indexOf(AT);
  if (V.soft && LAYERS[cur][7] >= 60) {
    const [cx, cy] = P(0, 0, zOf(cur) + LAYERS[cur][3]);
    for (let k = 0; k < 3; k++) out.push(`<g class="wisp" data-x="${n1(cx - 60 + k * 60)}" data-y="${n1(cy - 10)}"><path d="M${n1(cx - 60 + k * 60)} ${n1(cy - 10)}c-6 -10 6 -16 0 -26" fill="none" stroke="#b9bfc9" stroke-width="2"/></g>`);
  }
  LAYERS.forEach((l, i) => group(`class="lay" data-i="${i}"`, () => lit(i)));

  LAYERS.forEach(([, ttl, note, h, r], i) => {
    const left = i % 2 === 0, ty = OY - Z0[i] - h / 2 - 40;
    label(left ? 72 : 1328, ty, ttl, note, [left ? -r * 0.72 : r * 0.72, left ? r * 0.72 : -r * 0.72, Z0[i] + h / 2], left ? 'start' : 'end');
  });
  group('id="clock"', () => dial(1250, 260, 40, MIN));
  // a little bay tree in a pot by the fridge
  { const ox = OX, oy = OY; OX = 1300; OY = 1236; cyl(0, 0, 0, 14, 22, PAL.brick, { cap: PAL.bark }); tree(0, 0, 26, 22, '#7f9d6c'); OX = ox; OY = oy; }
  title('an exploded view', 'A layer cake');
  subtitle('seven layers, one on another, each set first');
  const l = LAYERS[cur];
  status(NAMES[AT], AT === 'board' ? 'empty, ready' : AT === 'iced' ? 'done, ready to cut' : V.soft ? `soft, ${l[7]} min to set` : 'set, ready for the next');
  footnote('Illustrative: one home cake, 20 cm tins. A sponge cools for an hour, the jam sets in 20 minutes, the cream firms in 30. Layers drawn apart, not to scale.');
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const lays = () => [...document.querySelectorAll('#art .lay')];
  const lift = (i, anim) => {
    LIFT = i;
    for (const g of lays()) {
      const k = +g.dataset.i, up = LIFT >= 0 && k >= LIFT;
      g.style.transition = anim && !ctx.still ? 'transform .45s cubic-bezier(.4,0,.2,1)' : 'none';
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center';
      g.style.transform = up ? `translate(0px,-40px)${k === LIFT ? ' scale(1.06)' : ''}` : '';
    }
  };
  const redraw = () => { draw(5); ctx.state(AT); lift(-1, false); };
  const drop = i => { const el = document.querySelector(`#art .lay[data-i="${i}"]`); arrive(ctx, el, [0, 0, Z0[i] + 260], [0, 0, Z0[i]]); };
  const SAY = {
    base: 'The bottom sponge goes on the board. Warm from the oven.',
    jam: 'A thin coat of raspberry jam on the cold sponge.',
    middle: 'The chocolate sponge goes on the set jam.',
    cream: 'Whipped cream, two centimetres, on the cold sponge.',
    top: 'The top sponge, flat side up, on the firm cream.',
  };

  const add = () => {
    const i = IDS.indexOf(AT);
    if (AT === 'iced') return ctx.no('The icing goes on last. Nothing goes on top of it.');
    if (AT === 'top') return ctx.no('All five layers are on. Ice it now.');
    if (V.soft) return ctx.no(`${cap(NAMES[AT])} is still soft. Wait for it to set.`);
    AT = IDS[i + 1]; V = { on: i + 1, soft: true }; MIN += 10;
    ctx.say(SAY[AT]); redraw(); drop(i + 1); sweepIn(ctx, $('clock'), MIN - 10, MIN, 900); ctx.hop($('baker'));
  };
  const wait = () => {
    if (AT === 'board' || AT === 'iced') return ctx.no(AT === 'board' ? 'The board is ready. Nothing to wait for.' : 'Iced and set. Cut it.');
    if (!V.soft) return ctx.no(`${cap(NAMES[AT])} has set already.`);
    const m = LAYERS[IDS.indexOf(AT)][7];
    sweep(ctx, $('clock'), MIN, MIN + m, 1400);
    MIN += m; V.soft = false;
    ctx.say(`${m} minutes later: set. The next layer can go on.`);
    tween(ctx, 1400, () => {}, redraw);
  };
  const ice = () => {
    if (AT === 'iced') return ctx.no('It is iced already.');
    if (AT !== 'top') return ctx.no('The icing goes on last, on the top sponge.');
    if (V.soft) return ctx.no('The top sponge is warm. Icing on it would run.');
    AT = 'iced'; V = { on: 6, soft: false }; MIN += 10;
    ctx.say('The icing, the strawberries, one candle.'); redraw(); drop(6); sweepIn(ctx, $('clock'), MIN - 10, MIN, 900);
  };
  ctx.button('add a layer', add);
  ctx.button('wait to set', wait);
  ctx.button('ice it', ice);
  ctx.button('start again', () => {
    if (AT !== 'iced') return ctx.no('Finish this cake first.');
    const was = MIN;
    AT = 'board'; V = { on: 0, soft: false }; MIN = START;
    ctx.say('Eaten. A clean board for the next one.'); redraw(); drop(0); sweepIn(ctx, $('clock'), was, MIN, 1200);
  });
  ctx.hint('Press Play all, or add a layer. Click a layer to lift it.');
  redraw();
  // the opening: the camera starts close on the cake shut tight, and the
  // layers fly up into their slots while it pulls back. The page may redraw
  // the sheet for a #state= link meanwhile, so each frame finds the layers.
  if (!ctx.still) {
    const [cx, cy] = P(0, 0, 160), n = LAYERS.length;
    ctx.focus(cx, cy, 1.6);
    tween(ctx, 2200, k => {
      const guides = $('guides');
      for (const g of lays()) {
        const i = +g.dataset.i, u = Math.min(1, Math.max(0, (k - i * 0.05) / (1 - (n - 1) * 0.05)));
        g.setAttribute('transform', `translate(0 ${n1(i * G * (1 - u))})`);
      }
      if (guides) guides.style.opacity = Math.max(0, k * 2 - 1).toFixed(2);
      if (k > 0.35) ctx.focus(700, 700, 1);
    }, () => { for (const g of lays()) g.removeAttribute('transform'); const guides = $('guides'); if (guides) guides.style.opacity = ''; });
  }

  return {
    goto(id, play) {
      const i = IDS.indexOf(id), prev = IDS.indexOf(AT), was = MIN;
      AT = id; V = { on: i, soft: i > 0 && i < 6 }; MIN = minAt(i) + (i ? 10 : 0);
      ctx.say(id === 'board' ? 'An empty board.' : (SAY[id] || 'The icing, the strawberries, one candle.'));
      redraw();
      if (play && i !== prev) { drop(i); sweepIn(ctx, $('clock'), was, MIN, 900); }
    },
    tick(t) {
      document.querySelectorAll('#art .wisp').forEach((w, k) => rise(w, (t * 0.4 + k / 3) % 1, 0, -50, 0.8, 1.6));
      const f = $('flame'); if (f) f.setAttribute('transform', `translate(0 ${n1(Math.sin(t * 9) * 1.2)})`);
      const kid = $('kid'); if (kid) stroll(kid, [[250, -70], [250, 30]], t, 18);
    },
    click(e) {
      const g = e.target.closest('.lay');
      if (!g) { if (LIFT >= 0) lift(-1, true); return; }
      const i = +g.dataset.i;
      if (i > V.on) return ctx.no(`${cap(LAYERS[i][1])} is not on yet.`);
      if (i === LIFT) { lift(-1, true); return ctx.say('Back down.'); }
      lift(i, true);
      ctx.say(`${cap(LAYERS[i][1])}: ${LAYERS[i][2]}.`);
    },
    story: IDS,
  };
}
