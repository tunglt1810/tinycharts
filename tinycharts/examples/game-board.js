// A picnic walk on a 3 x 3 board, decided by a weather die. Each square is a
// place on the way and a state; rain sends everyone to the bandstand.
const ABOUT = 'what chance decides';
const RUG = 8, T = 165;
const IDS = ['home', 'gate', 'lane', 'bridge', 'pond', 'meadow', 'oak', 'hill', 'picnic'];
const NAMES = ['home', 'the garden gate', 'the lane', 'the bridge', 'the duck pond', 'the meadow', 'the big oak', 'the kite hill', 'the picnic rug'];
const STEPS = [1, 2, 3, 1, 0, 0];
const FACES = ['sun · 1 step', 'sun · 2 steps', 'sun · 3 steps', 'cloud · 1 step', 'wind · stay', 'rain · shelter'];
// the snake: row by row, back and forth
const GRID = [[0, 0], [1, 0], [2, 0], [2, 1], [1, 1], [0, 1], [0, 2], [1, 2], [2, 2]];
const SHELTER = [650, 210], DIE = [190, 1020];
let V = { pos: 0, rain: false }, FACE = 0, ROLLS = [];

const mid = n => [GRID[n][0] * T + T / 2, GRID[n][1] * T + T / 2];
const tileQ = (n, z = 10) => { const [gx, gy] = GRID[n]; return [P(gx * T + 8, gy * T + 8, z), P(gx * T + T - 8, gy * T + 8, z), P(gx * T + T - 8, gy * T + T - 8, z), P(gx * T + 8, gy * T + T - 8, z)]; };
const atNow = () => V.rain ? 'shelter' : IDS[V.pos];

function flowerAt(x, y, col) {
  const [a, b] = [P(x, y, 10), P(x, y, 22)];
  line([a, b], { w: 1, col: '#6f8f5a', over: 0 });
  shape(oval(b[0], b[1], 3.5, 3, 10), col, { w: 0.6 });
}

const SCENE = [
  (x, y) => { put(x + y - 20, 0, () => gable(x - 40, y - 46, 60, 50, 46, 24, { wall: PAL.sand, roof: PAL.brick })); put(x + y + 40, 0, () => who(x + 40, y + 30, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'wave', look: 1 }, 10)); },
  (x, y) => { put(x + y, 0, () => { box(x - 60, y - 6, 10, 46, 6, 26, { left: '#f3ead8', marks: false }); box(x + 14, y - 6, 10, 46, 6, 26, { left: '#f3ead8', marks: false }); box(x - 14, y - 40, 10, 28, 6, 26, { left: PAL.leaf, marks: false }); }); put(x + y + 30, 0, () => { for (const [dx, dy, c] of [[-40, 30, PAL.rose], [-20, 44, PAL.lilac], [30, 34, PAL.mustard], [44, 50, PAL.rose]]) flowerAt(x + dx, y + dy, c); }); },
  (x, y) => { put(x + y - 50, 0, () => box(x - 64, y - 64, 10, 128, 26, 30, { left: PAL.leaf, top: '#a9c48f', marks: false })); put(x + y + 50, 0, () => box(x - 64, y + 38, 10, 128, 26, 30, { left: PAL.leaf, top: '#a9c48f', marks: false })); put(x + y, 0, () => bird(x + 10, y, 10, PAL.bark)); },
  (x, y) => { put(x + y - 70, 0, () => flat([P(x - 70, y - 22, 11), P(x + 70, y - 22, 11), P(x + 70, y + 22, 11), P(x - 70, y + 22, 11)], '#a9c4d6')); put(x + y, 0, () => box(x - 18, y - 34, 10, 36, 68, 12, { left: PAL.wood, top: PAL.tan, marks: false })); },
  (x, y) => { put(x + y - 70, 0, () => { const [sx, sy] = P(x, y, 11); shape(blob(sx, sy, 58, 26, 0.1), '#a9c4d6', { w: 1 }); }); put(x + y, 0, () => { bird(x - 20, y, 11, '#fffdf6'); bird(x + 16, y + 10, 11, PAL.mustard); }); put(x + y + 60, 0, () => who(x + 50, y + 46, { shirt: PAL.sage, pants: PAL.bark, hair: 'short', arm: 'out', look: -1, kid: true }, 10)); },
  (x, y) => { put(x + y, 0, () => { const c = [PAL.rose, PAL.lilac, PAL.mustard, '#fffdf6', PAL.brick]; for (let k = 0; k < 16; k++) flowerAt(x - 56 + (k * 37) % 112, y - 56 + (k * 53) % 112, c[k % 5]); }); },
  (x, y) => { put(x + y, 0, () => tree(x, y, 46, 10, PAL.leaf)); put(x + y + 50, 0, () => who(x + 40, y + 40, { shirt: PAL.lilac, pants: PAL.slate, hair: 'bun', arm: 'down', look: 1 }, 10)); },
  (x, y) => { put(x + y - 10, 0, () => { const [sx, sy] = P(x, y, 10); shape(blob(sx, sy - 6, 54, 26, 0.05), '#b9d09c', { w: 1 }); }); put(x + y + 30, 0, () => who(x + 10, y + 10, { shirt: PAL.rose, pants: PAL.navy, hair: 'long', arm: 'up', look: 1, kid: true }, 18)); },
  (x, y) => {
    put(x + y - 30, 0, () => { const q = [P(x - 44, y - 34, 11), P(x + 44, y - 34, 11), P(x + 44, y + 34, 11), P(x - 44, y + 34, 11)]; flat(q, '#f3ead8'); for (let k = 0; k < 4; k++) flat([P(x - 44 + k * 22, y - 34, 11.5), P(x - 33 + k * 22, y - 34, 11.5), P(x - 33 + k * 22, y + 34, 11.5), P(x - 44 + k * 22, y + 34, 11.5)], '#e7a598'); rim(q, 1); });
    put(x + y + 10, 0, () => box(x + 4, y - 10, 11, 26, 18, 16, { left: PAL.wood, top: PAL.tan, marks: false }));
  },
];

function dieFace(face, cx, cy, s = 1) {
  out.push(`<g transform="translate(${n1(cx)} ${n1(cy)}) scale(${s})">`);
  if (face <= 3) {
    out.push(`<circle cx="0" cy="-4" r="9" fill="${PAL.mustard}" stroke="${INK}" stroke-width=".9"/>`);
    for (let k = 0; k < face; k++) out.push(`<circle cx="${(k - (face - 1) / 2) * 9}" cy="13" r="2.6" fill="${INK}"/>`);
  } else if (face === 4) shape(blob(0, 2, 15, 9), '#e7e9ec');
  else if (face === 5) for (const dy of [-6, 0, 6]) line(spline([[-14, dy], [0, dy - 3], [10, dy + 2], [14, dy - 2]], false, 2), { w: 1.2, over: 0 });
  else { shape(blob(0, -4, 14, 8), '#b9c2cc'); for (const dx of [-8, 0, 8]) line([[dx, 6], [dx - 3, 14]], { w: 1.3, col: '#5f7db5', over: 0 }); }
  out.push('</g>');
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 330;
  // the board: a grass plinth with nine tiles
  box(-24, -24, -34, 3 * T + 48, 3 * T + 48, 34, { left: PAL.bark, top: '#c6dbb2', marks: false });
  for (let n = 0; n <= RUG; n++) { const q = tileQ(n); flat(q, n % 2 ? '#dfe9cf' : '#ece5cf'); rim(q, 1); }
  // the lit rings lie on the tiles, under the scenery that stands on them
  for (let n = 0; n <= RUG; n++) group(`data-state="${IDS[n]}"`, () => { out.push('<g class="on">'); litRing(tileQ(n, 12)); out.push('</g>'); });
  group('data-state="shelter"', () => {
    out.push('<g class="on">');
    litRing(Array.from({ length: 30 }, (_, k) => P(SHELTER[0] + 70 * Math.cos(k / 30 * 2 * Math.PI), SHELTER[1] + 70 * Math.sin(k / 30 * 2 * Math.PI), -34)));
    out.push('</g>');
  });
  // the stepping stones, and the trail walked so far
  const path = GRID.map((_, n) => P(...mid(n), 10));
  out.push(`<path d="${pathOf(path)}" fill="none" stroke="#b7a98e" stroke-width="10" stroke-linecap="round" stroke-dasharray="1 16"/>`);
  if (V.pos > 0) out.push(`<path d="${pathOf(path.slice(0, V.pos + 1))}" fill="none" stroke="${RED}" stroke-width="2.4" stroke-dasharray="6 5"/>`);
  for (let n = 0; n <= RUG; n++) SCENE[n](...mid(n));
  // the bandstand, off the board
  put(800, 0, () => {
    turn(SHELTER[0], SHELTER[1], -34, [[58, 0], [58, 10]], '#e6dccb', { cap: '#efe7d8' });
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3, [px, py] = [SHELTER[0] + 48 * Math.cos(a), SHELTER[1] + 48 * Math.sin(a)]; line([P(px, py, -24), P(px, py, 50)], { w: 1.6, over: 0 }); }
    turn(SHELTER[0], SHELTER[1], 50, [[62, 0], [0, 34]], PAL.brick, { seam: false });
  });
  if (V.rain) put(801, 0, () => { who(SHELTER[0] - 10, SHELTER[1] + 10, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'hold', look: 1 }, -24); who(SHELTER[0] + 20, SHELTER[1] - 6, { shirt: PAL.rose, pants: PAL.navy, hair: 'long', arm: 'down', look: -1, kid: true }, -24); });
  flush();

  // the stones' numbers and each square's state
  for (let n = 0; n <= RUG; n++) {
    group(`data-state="${IDS[n]}"`, () => {
      const [x, y] = mid(n), [sx, sy] = P(x - 52, y + 52, 10);
      out.push(`<ellipse cx="${n1(sx)}" cy="${n1(sy)}" rx="15" ry="9" fill="#fffdf6" stroke="${INK}" stroke-width="1"/>`);
      _text(sx, sy + 5, String(n + 1), { size: 14, anchor: 'middle' });
      out.push('<g class="on">');
      const [tx, ty] = tileQ(n)[1];
      nowTag(tx - 6, ty - 34);
      out.push('</g>');
    });
  }
  group('data-state="shelter"', () => {
    const [sx, sy] = P(SHELTER[0], SHELTER[1], -34);
    _text(sx, sy + 70, 'the bandstand', { size: 16, anchor: 'middle' });
    out.push('<g class="on">');
    nowTag(sx + 50, sy - 140);
    out.push('</g>');
  });
  if (V.rain) {
    for (const [dx, dy] of [[-120, -40], [60, -10], [-260, 60], [220, 70]]) shape(blob(700 + dx, 380 + dy, 60, 22), '#c3c9cf', { w: 1 });
    rule(Array.from({ length: 90 }, (_, k) => { const x = 330 + (k * 97) % 760, y = 420 + (k * 53) % 380; return [[x, y], [x - 6, y + 16]]; }), '#7f9bb8', 1);
  }
  group('id="walker"', () => { const [sx, sy] = V.rain ? P(SHELTER[0] + 10, SHELTER[1] + 20, -24) : P(...mid(V.pos), 10); person(sx, sy, { shirt: RED, pants: PAL.navy, hair: 'cap', arm: 'wave', look: 1, kid: true }); });

  // the weather die and what its faces do
  const [dx, dy] = DIE;
  out.push('<g id="die">');
  const top = [[dx, dy - 70], [dx + 60, dy - 36], [dx, dy - 2], [dx - 60, dy - 36]];
  fill([[dx - 60, dy - 36], [dx, dy - 2], [dx, dy + 66], [dx - 60, dy + 32]], '#ece5d6');
  fill([[dx + 60, dy - 36], [dx, dy - 2], [dx, dy + 66], [dx + 60, dy + 32]], '#d9d0bf');
  fill(top, '#fffdf6');
  rim([...top.slice(0, 2), [dx + 60, dy + 32], [dx, dy + 66], [dx - 60, dy + 32], top[3]], 1.4);
  rule([[[dx, dy - 2], [dx, dy + 66]], [top[1], top[2]], [top[3], top[2]]], INK, 0.9);
  if (FACE) dieFace(FACE, dx, dy - 36, 1.2);
  out.push('</g>');
  _text(dx, dy + 100, FACE ? `rolled: ${FACES[FACE - 1]}` : 'not rolled yet', { size: 16, anchor: 'middle', col: FACE ? INK : LEAD });

  _text(380, 900, 'THE WEATHER DIE', { size: 14, cls: 'cap', col: LEAD });
  FACES.forEach((t, k) => {
    const x = 380 + (k % 2) * 300, y = 930 + Math.floor(k / 2) * 74, now = FACE === k + 1;
    out.push(`<rect x="${x}" y="${y}" width="56" height="56" rx="8" fill="#fffdf6" stroke="${now ? RED : INK}" stroke-width="${now ? 2 : 1}"/>`);
    dieFace(k + 1, x + 28, y + 28, 0.9);
    _text(x + 70, y + 34, t, { size: 16, col: now ? RED : INK });
  });
  _text(1000, 900, 'ROLLS SO FAR', { size: 14, cls: 'cap', col: LEAD });
  ROLLS.slice(-12).forEach((f, k) => {
    const x = 1000 + (k % 6) * 54, y = 930 + Math.floor(k / 6) * 54;
    out.push(`<rect x="${x}" y="${y}" width="44" height="44" rx="6" fill="#fffdf6" stroke="${INK}" stroke-width=".9"/>`);
    dieFace(f, x + 22, y + 22, 0.7);
  });
  if (!ROLLS.length) _text(1000, 960, 'none yet', { size: 15, col: MUTE });

  title('a game board', 'The picnic walk');
  subtitle('nine squares to the rug, and the weather rolls the die');
  status(V.rain ? 'the bandstand' : NAMES[V.pos], V.rain ? 'raining · waiting it out' : `square ${V.pos + 1} of 9 · ${FACE === 4 ? 'cloudy' : FACE === 5 ? 'windy' : 'sunny'}`);
  footnote('Illustrative: a made-up park and a made-up die. Real weather does not take turns.');
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(24); ctx.state(atNow()); };
  const spot = v => v.rain ? P(SHELTER[0] + 10, SHELTER[1] + 20, -24) : P(...mid(v.pos), 10);
  const move = (next, then = () => {}) => {
    let pts;
    if (next.rain || V.rain) pts = [spot(V), spot(next)];
    else { pts = []; for (let n = V.pos; n <= next.pos; n++) pts.push(P(...mid(n), 10)); }
    const done = () => { V = next; then(); redraw(); };
    if (pts.length < 2 || (pts[0][0] === pts[1][0] && pts[0][1] === pts[1][1])) { ctx.hop($('walker')); return done(); }
    hops(ctx, $('walker'), pts.map(p => at(...p)), { arc: 22, rest: 60, then: done });
  };
  // the die tumbles through a few faces and lands before anyone moves
  const roll = (f, then) => {
    let shown = -1;
    tween(ctx, 1100, k => {
      const n = Math.min(6, Math.floor(k * 7));
      if (n !== shown) { shown = n; FACE = n === 6 ? f : 1 + ((f + n * 5) % 6); redraw(); }
      const d = $('die');
      if (d) d.setAttribute('transform', `translate(0 ${n1(-70 * Math.sin(Math.PI * k))}) rotate(${n1(Math.sin(k * 5 * Math.PI) * 14 * (1 - k))} ${DIE[0]} ${DIE[1]})`);
    }, () => { FACE = f; redraw(); then(); });
  };
  const rollFace = f => roll(f, () => act(f));
  const act = f => {
    ROLLS.push(f);
    if (f === 6) { ctx.say('Rain! Everyone runs to the bandstand.'); return move({ ...V, rain: true }); }
    const to = V.pos + STEPS[f - 1];
    if (STEPS[f - 1] === 0) { ctx.say('Wind. Hold on to your hat, and stay put.'); return move(V); }
    if (to > RUG) { ctx.say(`Sun, ${STEPS[f - 1]}: too far past the rug. Stay put.`); return move(V); }
    ctx.say(`${FACES[f - 1].split(' · ')[0] === 'sun' ? 'Sun' : 'Cloud'}: on to ${NAMES[to]}.`);
    move({ ...V, pos: to }, () => { if (to === RUG) ctx.say('The rug! Open the basket.'); });
  };
  ctx.button('roll the die', () => {
    if (V.rain) return ctx.no('It is raining. Wait in the bandstand.');
    if (V.pos === RUG) return ctx.no('Lunch first. Then home again.');
    rollFace(1 + Math.floor(Math.random() * 6));
  });
  ctx.button('the rain stops', () => {
    if (!V.rain) return ctx.no('It is not raining.');
    ctx.say(`The sun is back. Out to ${NAMES[V.pos]}.`);
    move({ ...V, rain: false });
  });
  ctx.button('home again', () => {
    if (V.pos !== RUG || V.rain) return ctx.no('Not before the picnic.');
    ctx.say('Basket empty. Home again.');
    FACE = 0; ROLLS = [];
    V = { pos: 0, rain: false }; redraw();
  });
  ctx.hint('Press Play all, or roll the die.');
  redraw();

  // [state, pos, rain, face]
  const STORY = [['home', 0, false, 0], ['gate', 1, false, 1], ['lane', 2, false, 1], ['shelter', 2, true, 6], ['lane', 2, false, 0], ['bridge', 3, false, 1], ['bridge', 3, false, 5],
    ['pond', 4, false, 1], ['meadow', 5, false, 4], ['oak', 6, false, 1], ['oak', 6, false, 3], ['hill', 7, false, 1], ['picnic', 8, false, 1], ['home', 0, false, 0]];
  let si = -1;
  return {
    goto(id, play) {
      let j = play ? STORY.findIndex((s, k) => k > si && s[0] === id) : -1;
      if (j < 0) j = STORY.findIndex(s => s[0] === id);
      si = j;
      const [, pos, rain, face] = STORY[j];
      const rolls = STORY.slice(1, j + 1).map(s => s[3]).filter(Boolean);
      const last = STORY.slice(0, j + 1).map(s => s[3]).filter(Boolean).at(-1) || 0;
      const set = () => { FACE = j && id !== 'home' ? last : 0; ROLLS = id === 'home' ? [] : rolls; };
      ctx.say(face ? `Rolled ${FACES[face - 1]}.` : id === 'home' ? 'At home, basket packed.' : 'The rain stops.');
      if (play && j > 0 && id !== 'home') { if (face) roll(face, () => move({ pos, rain }, set)); else move({ pos, rain }, set); }
      else { V = { pos, rain }; set(); redraw(); }
    },
    story: STORY.map(s => s[0]),
  };
}
