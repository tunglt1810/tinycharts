// Why the bread did not rise: six bones, each checked and ruled in or out.
const ABOUT = 'which causes are ruled in or out';
const SPINE = 760, ROOTS = [420, 670, 920], RISE = 290, LEAN = 170;
const BONES = [
  { cap: 'YEAST', q: 'yeast too old?', ev: ['use-by: next May', 'it foamed in sugar water'] },
  { cap: 'FLOUR', q: 'wrong flour?', ev: ['strong white, 12% protein', 'the dough stretched thin'] },
  { cap: 'SALT', q: 'salt on the yeast?', ev: ['salt mixed into the flour', 'the yeast went in last'] },
  { cap: 'PROVING', q: 'too short a rise?', ev: ['left for 90 min', 'no bigger at all'] },
  { cap: 'WATER', q: 'water too hot?', ev: ['kettle water, 70 °C', 'yeast dies past 50 °C'] },
  { cap: 'KITCHEN', q: 'kitchen too cold?', ev: ['20 °C by the stove', 'last week’s loaf rose'] },
];
const CULPRIT = 4;
const NAMES = { unchecked: 'nothing checked yet', checking: 'checking the bones', explained: 'the cause is found' };
let AT = 'unchecked', N = 0;

const tip = i => { const top = i < 3, x = ROOTS[i % 3]; return [x - LEAN, top ? SPINE - RISE : SPINE + RISE]; };
const along = (i, f) => { const [tx, ty] = tip(i), x = ROOTS[i % 3]; return [x + (tx - x) * f, SPINE + (ty - SPINE) * f]; };

function picture(i, sx, sy) {
  OX = sx; OY = sy;
  if (i === 0) { box(-14, -10, 0, 28, 20, 26, { left: PAL.mustard, top: '#f3e3a8', marks: false }); cyl(26, 14, 0, 8, 14, '#f3f1ea'); }
  if (i === 1) { shape(blob(...P(0, 0, 18), 22, 26, 0.12, 7), '#efe6d2', { w: 1.1 }); _text(...P(0, 0, 14), 'FLOUR', { size: 9, anchor: 'middle', cls: 'cap' }); }
  if (i === 2) { cyl(0, 0, 0, 9, 30, '#f3f1ea', { cap: '#c9cdd3' }); for (let k = 0; k < 5; k++) out.push(`<circle cx="${n1(P(0, 0, 30)[0] - 4 + k * 2)}" cy="${n1(P(0, 0, 33)[1] - (k % 2) * 2)}" r=".9" fill="${INK}"/>`); }
  if (i === 3) { turn(0, 0, 0, [[12, 0], [20, 10], [22, 18]], PAL.sky, { wall: 1.5, cap: '#efe6d2', seam: false }); shape([[...P(-18, 0, 20)], [...P(0, -18, 24)], [...P(18, 0, 20)], [...P(0, 18, 14)]], PAL.rose, { w: 0.8 }); }
  if (i === 4) { turn(0, 0, 0, [[12, 0], [12, 28], [10, 32]], '#c9cdd3', { cap: '#e6e8e9', seam: false }); const [kx, ky] = P(0, 0, 40); for (let k = 0; k < 3; k++) out.push(`<path d="M${n1(kx - 6 + k * 6)} ${n1(ky)}q-4 -6 0 -12q4 -6 0 -12" fill="none" stroke="${MUTE}" stroke-width="1"/>`); }
  if (i === 5) { box(-30, -4, 0, 44, 4, 40, { left: '#e9e3d6', marks: false }); windowL(-26, -4, 12, 30, 22); who(18, 16, { shirt: PAL.sage, pants: PAL.slate, hair: 'short', arm: 'hold', look: -1 }); }
  OX = 700; OY = 0;
}

function bone(i) {
  const top = i < 3, done = i < N, inn = done && i === CULPRIT, b = BONES[i], [tx, ty] = tip(i), x = ROOTS[i % 3];
  line([[x, SPINE], [tx, ty]], { w: inn ? 2.6 : 1.5, col: inn ? RED : INK, over: 0 });
  // two ribs with the evidence, filled in once the bone is checked
  b.ev.forEach((ev, k) => {
    const [rx, ry] = along(i, k ? 0.68 : 0.38);
    out.push(`<path d="M${n1(rx)} ${n1(ry)}H${n1(rx - 120)}" stroke="${done ? INK : MUTE}" stroke-width=".9" fill="none"/>`);
    _text(rx - 16, ry - 7, done ? ev : '·  ·  ·', { size: 13, col: done ? INK : MUTE, anchor: 'end' });
  });
  const [qx, qy] = along(i, 0.14), qt = qy + (top ? -6 : 18);
  _text(qx - 14, qt, b.q, { size: 16, anchor: 'end', col: done && !inn ? MUTE : INK });
  if (done && !inn) out.push(`<path d="M${n1(qx - 18 - textW(b.q, 16))} ${n1(qt - 5)}H${n1(qx - 10)}" stroke="${MUTE}" stroke-width="1.2"/>`);
  const w = textW(b.cap, 15, 'cap') + 28, ly = top ? ty - 36 : ty + 8;
  out.push(`<rect x="${n1(tx - w / 2)}" y="${ly}" width="${n1(w)}" height="28" rx="6" fill="#fffdf6" stroke="${inn ? RED : INK}" stroke-width="${inn ? 1.8 : 1.1}"/>`);
  _text(tx, ly + 19, b.cap, { size: 15, anchor: 'middle', cls: 'cap' });
  if (done) {
    const t = inn ? 'ruled in' : 'ruled out', sw = textW(t, 13) + 16, sx = tx + w / 2 + 8;
    out.push(`<rect x="${n1(sx)}" y="${ly + 4}" width="${n1(sw)}" height="20" rx="10" fill="${inn ? RED : PAPER}" stroke="${inn ? RED : MUTE}" stroke-width="1"/>`);
    _text(sx + sw / 2, ly + 18, t, { size: 13, anchor: 'middle', col: inn ? PAPER : LEAD });
  }
  group(`id="pic${i}"`, () => picture(i, tx, top ? ly - 34 : ly + 96));
}

function head() {
  const hx = 1090;
  shape([[hx, SPINE - 170], [hx + 150, SPINE - 140], [hx + 240, SPINE - 40], [hx + 240, SPINE + 40], [hx + 150, SPINE + 140], [hx, SPINE + 170]], '#f1e8d6', { w: 1.4 });
  _text(hx + 105, SPINE - 104, 'the effect', { size: 13, col: LEAD, anchor: 'middle' });
  _text(hx + 105, SPINE - 80, 'the bread', { size: 16, anchor: 'middle' });
  _text(hx + 105, SPINE - 58, 'did not rise', { size: 16, anchor: 'middle' });
  OX = hx + 110; OY = SPINE - 10;
  box(-46, -30, 0, 92, 60, 6, { left: PAL.wood, top: '#d8b98e', marks: false });
  turn(0, 0, 6, [[34, 0], [34, 8], [26, 14], [0, 16]], '#c99a5c', { seam: false });
  OX = 700; OY = 0;
  _text(hx + 115, SPINE + 76, `${N} of 6 checked`, { size: 14, col: LEAD, anchor: 'middle' });
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 0;
  line([[150, SPINE], [1090, SPINE]], { w: 2.2, over: 0 });
  line([[150, SPINE], [104, SPINE - 46]], { w: 1.5, over: 0 });
  line([[150, SPINE], [104, SPINE + 46]], { w: 1.5, over: 0 });
  out.push(`<circle cx="170" cy="${SPINE - 70}" r="6" fill="${INK}"/>`);
  flowArrow([[170, SPINE - 64], [170, SPINE - 8]], { w: 1.2, col: INK });
  _text(84, SPINE + 10, 'why did it not rise?', { size: 13, col: LEAD, anchor: 'middle', extra: `transform="rotate(-90 84 ${SPINE + 10})"` });
  for (let i = 0; i < 6; i++) bone(i);
  head();
  const px = 1205;
  [['unchecked', 990], ['checking', 1050], ['explained', 1110]].forEach(([id, y]) => group(`data-state="${id}"`, () => {
    pill(px, y, NAMES[id]);
    out.push('<g class="on">'); pill(px, y, NAMES[id], { lit: true }); nowTag(px - textW(NAMES[id], 15) / 2 - 36, y + 8); out.push('</g>');
  }));
  title('a fishbone', 'Why the bread did not rise');
  subtitle('six causes, each ruled in or out');
  status(`${N} of 6 checked`, N < 6 ? (N ? `${BONES[N - 1].cap.toLowerCase()} checked last` : NAMES.unchecked) : 'the water was too hot');
  footnote('Illustrative: one made-up loaf. Yeast dies in water much past 50 °C.');
  finish();
}

function init(ctx) {
  const redraw = () => { draw(24); ctx.state(AT); };
  // a lens runs from the spine up the bone to its label; the verdict lands when it gets there
  const look = (i, then) => {
    const [tx, ty] = tip(i), x = ROOTS[i % 3], g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = `<line x1="7" y1="7" x2="15" y2="15" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle r="10" fill="#fffdf6" fill-opacity=".7" stroke="${INK}" stroke-width="1.8"/>`;
    document.getElementById('art').append(g);
    tween(ctx, 1100, k => g.setAttribute('transform', `translate(${n1(x + (tx - x) * k * 0.9)} ${n1(SPINE + (ty - SPINE) * k * 0.9)})`), () => { g.remove(); then(); });
  };
  const land = i => {
    redraw();
    ctx.hop(document.getElementById('pic' + i));
  };
  ctx.button('check next bone', () => {
    if (AT === 'explained') return ctx.no('All six are checked. Bake again.');
    const i = N;
    look(i, () => {
      N++;
      AT = N === 6 ? 'explained' : 'checking';
      land(i);
      ctx.say(i === CULPRIT ? `${BONES[i].cap}: ruled in. ${BONES[i].ev.join('; ')}.` : `${BONES[i].cap}: ruled out. ${BONES[i].ev[0]}.`);
    });
  });
  ctx.button('explain the bread', () => {
    if (AT !== 'explained') return ctx.no(`Check all six bones first: ${N} of 6 so far.`);
    ctx.say('The kettle water was 70 °C. It killed the yeast, so nothing made the gas to lift the dough.');
  });
  ctx.button('bake again', () => {
    if (AT !== 'explained') return ctx.no('Finish the checks first.');
    N = 0; AT = 'unchecked'; ctx.say('A new loaf, with hand-warm water this time.'); redraw();
  });
  ctx.hint('Press Play all, or check next bone.');
  redraw();

  const STORY = [['unchecked', 0], ['checking', 1], ['checking', 2], ['checking', 3], ['checking', 4], ['checking', 5], ['explained', 6]];
  let si = -1;
  return {
    goto(id, play) {
      let j = play ? STORY.findIndex((s, k) => k > si && s[0] === id) : -1;
      if (j < 0) j = STORY.findIndex(s => s[0] === id);
      si = j;
      const n = STORY[j][1], say = () => ctx.say(n ? `${BONES[n - 1].cap}: ruled ${n - 1 === CULPRIT ? 'in' : 'out'}.` : NAMES.unchecked + '.');
      if (play && n) { N = n - 1; AT = N ? 'checking' : 'unchecked'; redraw(); return look(n - 1, () => { N = n; AT = id; land(n - 1); say(); }); }
      N = n; AT = id; say();
      redraw();
    },
    story: STORY.map(s => s[0]),
  };
}
