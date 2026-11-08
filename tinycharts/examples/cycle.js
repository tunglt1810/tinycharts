// A bee's trips to the flowers, round and round, until the hive is full.
// Five stations on a ring; a diamond before the meadow is the one way off.
const ABOUT = 'a loop, and the one way off it';
const FULL = 5;
const C0 = [700, 800], R = 326, RD = 92;
const ANG = { hive: -90, meadow: -18, clover: 54, pond: 126, homeward: 198 };
const RING = ['hive', 'meadow', 'clover', 'pond', 'homeward'];
const WINTER = [1176, 470], DIAMOND = -54;
const NAMES = { hive: 'the hive', meadow: 'the meadow', clover: 'the clover', pond: 'the pond', homeward: 'the way home', winter: 'winter cluster' };
const NOTES = { hive: 'nectar unloaded', meadow: 'looking about', clover: 'sipping nectar', pond: 'a drink of water', homeward: 'heavy, flying low', winter: 'clustered, warm' };
const TINT = { hive: '#f3e6c4', meadow: '#dfe9cf', clover: '#ece0e4', pond: '#d8e5ec', homeward: '#e8e0cc', winter: '#e3e9f0' };
let AT = 'hive', LAP = 1;
let V = { stores: 0, load: false };

const rad = a => a * Math.PI / 180;
const onRing = (a, r = R) => [C0[0] + r * Math.cos(rad(a)), C0[1] + r * Math.sin(rad(a))];
const centre = id => id === 'winter' ? WINTER : onRing(ANG[id]);
const disc = (id, grow = 0) => { const [x, y] = centre(id); return oval(x, y, (id === 'winter' ? 82 : RD) + grow, (id === 'winter' ? 82 : RD) + grow, 48); };
const arc = (a0, a1, r = R, n = 18) => Array.from({ length: n + 1 }, (_, k) => onRing(a0 + (a1 - a0) * k / n, r));

function flower(x, y, col, h = 16) {
  const [sx, sy] = P(x, y), [tx, ty] = P(x, y, h);
  line([[sx, sy], [tx, ty]], { w: 1, col: '#6f8f5a', over: 0 });
  for (let k = 0; k < 5; k++) shape(oval(tx + 4 * Math.cos(k * 1.26), ty + 3 * Math.sin(k * 1.26), 3.2, 2.6, 10), col, { w: 0.6 });
  out.push(`<circle cx="${n1(tx)}" cy="${n1(ty)}" r="1.8" fill="${PAL.mustard}"/>`);
}

function bee(sx, sy, s = 1) {
  out.push(`<g transform="translate(${n1(sx)} ${n1(sy)}) scale(${s})">`);
  out.push(`<ellipse cx="-3" cy="-8" rx="6" ry="8" fill="#fffdf6" stroke="${INK}" stroke-width=".8" opacity=".9" transform="rotate(-25 -3 -8)"/>`);
  out.push(`<ellipse cx="5" cy="-8" rx="6" ry="8" fill="#fffdf6" stroke="${INK}" stroke-width=".8" opacity=".9" transform="rotate(25 5 -8)"/>`);
  shape(oval(0, 0, 11, 7, 18), PAL.mustard, { w: 1 });
  rule([[[-3, -6.5], [-3, 6.5]], [[3, -6], [3, 6]]], INK, 2);
  out.push(`<circle cx="12" cy="-1" r="4.5" fill="${INK}"/>`);
  out.push('</g>');
}

const hex = (cx, cy, r) => Array.from({ length: 6 }, (_, k) => [cx + r * Math.cos(rad(60 * k + 30)), cy + r * Math.sin(rad(60 * k + 30))]);

function hiveBox(x, y, snow = false) {
  box(x, y, 0, 46, 46, 26, { left: PAL.butter, top: PAL.mustard, marks: false });
  box(x, y, 26, 46, 46, 26, { left: PAL.butter, top: PAL.mustard, marks: false });
  box(x - 4, y - 4, 52, 54, 54, 6, { left: PAL.wood, top: snow ? '#fbfbf7' : PAL.tan, marks: false });
  const [dx, dy] = P(x + 46, y + 23, 4);
  out.push(`<rect x="${n1(dx - 7)}" y="${n1(dy - 4)}" width="14" height="4" fill="${INK}"/>`);
}

const SCENES = {
  hive() {
    flat([P(-80, -80), P(80, -80), P(80, 80), P(-80, 80)], '#d9e2c4');
    put(10, 0, () => { for (const [x, y, c] of [[50, -60, PAL.rose], [60, -40, PAL.lilac], [-60, 40, PAL.rose], [-40, 60, '#fffdf6']]) flower(x, y, c); });
    put(100, 0, () => hiveBox(-36, -24));
    put(150, 0, () => who(40, 34, { shirt: '#fffdf6', pants: PAL.slate, hair: 'cap', arm: 'out', look: -1 }));
    flush();
    group('id="buzz"', () => { const [x, y] = P(-10, 0, 76); bee(x + 26, y, 0.5); bee(x - 30, y + 10, 0.45); bee(x + 4, y - 18, 0.4); });
  },
  meadow() {
    flat([P(-80, -80), P(80, -80), P(80, 80), P(-80, 80)], '#cfdfb7');
    put(10, 0, () => {
      const cols = [PAL.rose, PAL.lilac, PAL.mustard, '#fffdf6', PAL.brick, PAL.blue];
      for (let i = 0; i < 26; i++) flower(-70 + (i * 37) % 140, -70 + (i * 53) % 140, cols[i % 6], 12 + (i % 3) * 5);
    });
    put(140, 0, () => who(20, 30, { shirt: PAL.rose, pants: PAL.navy, hair: 'long', arm: 'wave', look: 1, kid: true }));
    put(60, 0, () => tree(-46, -40, 22));
    flush();
  },
  clover() {
    flat([P(-80, -80), P(80, -80), P(80, 80), P(-80, 80)], '#c6dbb2');
    put(10, 0, () => {
      for (let i = 0; i < 22; i++) { const x = -66 + (i * 41) % 132, y = -66 + (i * 29) % 132, [sx, sy] = P(x, y, 6); shape(blob(sx, sy, 5, 4), i % 3 ? '#e9c7d3' : '#fffdf6'); }
      flat([P(-10, 10), P(46, 10), P(46, 56), P(-10, 56)], PAL.brick);
      rule([0, 1, 2, 3].map(k => [P(-10 + k * 14, 10), P(-10 + k * 14, 56)]), '#f3ead8', 1.2);
    });
    put(130, 0, () => who(10, 30, { shirt: PAL.sage, pants: PAL.bark, hair: 'bun', sit: 1, arm: 'hold', look: -1 }));
    put(150, 0, () => who(50, -10, { shirt: PAL.sky, pants: PAL.slate, hair: 'short', sit: 1, arm: 'out', look: -1 }));
    put(140, 1, () => box(28, 14, 0, 14, 10, 10, { left: PAL.wood, top: PAL.tan, marks: false }));
    flush();
  },
  pond() {
    flat([P(-80, -80), P(80, -80), P(80, 80), P(-80, 80)], '#cfdfb7');
    put(5, 0, () => { const [sx, sy] = P(0, 0); shape(blob(sx, sy + 6, 70, 30, 0.1), '#a9c4d6', { w: 1 }); });
    put(20, 0, () => { for (const [x, y] of [[-60, 10], [-54, 22], [-62, 34], [40, -50], [48, -42]]) { const [a, b] = [P(x, y), P(x, y, 24)]; line([a, b], { w: 1.2, col: '#6f8f5a', over: 0 }); shape(oval(b[0], b[1], 2, 5, 8), PAL.bark, { w: 0.5 }); } });
    put(40, 0, () => { const [sx, sy] = P(20, 10); shape(oval(sx, sy, 6, 4, 10), '#7fae6a', { w: 0.8 }); });
    put(30, 0, () => bird(-10, 20, 0, '#fffdf6'));
    put(150, 0, () => who(56, 40, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'down', look: -1, kid: true }));
    flush();
  },
  homeward() {
    flat([P(-80, -80), P(80, -80), P(80, 80), P(-80, 80)], '#d6dcbd');
    put(60, 0, () => tree(-40, -30, 26, 0, '#9cb680'));
    put(90, 0, () => tree(20, -50, 22, 0, PAL.leaf));
    put(80, 0, () => gable(-60, 20, 40, 34, 30, 16, { wall: PAL.rose, roof: PAL.brick }));
    put(150, 0, () => who(40, 40, { shirt: PAL.lilac, pants: PAL.slate, hair: 'short', arm: 'hold', look: -1 }));
    flush();
    for (const [x, y] of [[-30, -40, 42], [12, -50, 40]]) { const [sx, sy] = P(x, y, 40); out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="3" fill="${PAL.brick}"/>`); }
  },
  winter() {
    flat([P(-80, -80), P(80, -80), P(80, 80), P(-80, 80)], '#f4f5f2');
    put(100, 0, () => hiveBox(-22, -22, true));
    put(60, 0, () => tree(-50, 30, 18, 0, '#c9d3d9'));
    flush();
    for (let k = 0; k < 26; k++) { const [x, y] = [WINTER[0] - 70 + (k * 47) % 140, WINTER[1] - 70 + (k * 31) % 140]; out.push(`<circle cx="${x}" cy="${y}" r="1.6" fill="#fffdf6" stroke="#9fb2c4" stroke-width=".6"/>`); }
  },
};

function station(id) {
  const [cx, cy] = centre(id), r = id === 'winter' ? 82 : RD;
  group(`data-state="${id}"`, () => {
    fill(disc(id), TINT[id], { amp: 0.3 });
    clipped(disc(id), () => { OX = cx; OY = cy + 14; SCENES[id](); OX = 700; OY = 0; });
    rim(disc(id), 1.4);
    out.push('<g class="on">');
    litRing(disc(id, 6));
    nowTag(cx + r * 0.62, cy - r * 0.78);
    out.push('</g>');
    const w = Math.max(textW(NAMES[id], 18), textW(NOTES[id], 13)) + 30;
    out.push(`<rect x="${n1(cx - w / 2)}" y="${n1(cy + r - 18)}" width="${n1(w)}" height="46" rx="6" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>`);
    _text(cx, cy + r + 3, NAMES[id], { size: 18, anchor: 'middle' });
    _text(cx, cy + r + 21, NOTES[id], { size: 13, col: LEAD, anchor: 'middle' });
  });
}

// the event pill sits on the ring, between two stations
function legArrow(a0, a1, text) {
  flowArrow(arc(a0, a1, R - 2), { w: 1.6, col: INK });
  pill(...onRing((a0 + a1) / 2, R + 2), text);
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 0;
  out.push(`<circle cx="${C0[0]}" cy="${C0[1]}" r="${R}" fill="none" stroke="#e4d9c4" stroke-width="40"/>`);
  out.push(`<circle cx="${C0[0]}" cy="${C0[1]}" r="${R + 20}" fill="none" stroke="#cdbfa7" stroke-width=".8"/>`);
  out.push(`<circle cx="${C0[0]}" cy="${C0[1]}" r="${R - 20}" fill="none" stroke="#cdbfa7" stroke-width=".8"/>`);

  // the centre: the lap, the comb, the basket
  out.push(`<circle cx="${C0[0]}" cy="${C0[1]}" r="128" fill="${PAPER}" stroke="${INK}" stroke-width=".9" stroke-dasharray="4 5"/>`);
  _text(C0[0], C0[1] - 70, 'trip this summer', { size: 15, col: LEAD, anchor: 'middle' });
  _text(C0[0], C0[1] - 30, String(LAP), { size: 40, anchor: 'middle' });
  for (let k = 0; k < FULL; k++) {
    const hx = C0[0] - 64 + k * 32, hy = C0[1] + 14 + (k % 2) * 16;
    shape(hex(hx, hy, 16), k < V.stores ? PAL.mustard : '#fffdf6', { w: 1 });
  }
  _text(C0[0], C0[1] + 70, `combs ${V.stores} of ${FULL}`, { size: 16, anchor: 'middle' });
  _text(C0[0], C0[1] + 92, V.load ? 'basket: nectar' : 'basket: empty', { size: 14, col: V.load ? RED : LEAD, anchor: 'middle' });

  // the ring, clockwise; the diamond before the meadow
  const gap = 17;
  flowArrow(arc(ANG.hive + gap, DIAMOND - 6, R - 2, 8), { w: 1.6, col: INK });
  pill(...onRing(-64, R + 46), 'fly out');
  flowArrow(arc(DIAMOND + 6, ANG.meadow - gap, R - 2, 8), { w: 1.6, col: INK });
  pill(...onRing(-40, R + 30), '[hive not full]');
  legArrow(ANG.meadow + gap, ANG.clover - gap, 'fly on');
  legArrow(ANG.clover + gap, ANG.pond - gap, 'fly on [nectar]');
  legArrow(ANG.pond + gap, ANG.homeward - gap, 'fly on');
  legArrow(ANG.homeward + gap, 270 - gap, 'unload');
  const [dx, dy] = onRing(DIAMOND);
  group('class="diamond"', () => shape([[dx, dy - 15], [dx + 15, dy], [dx, dy + 15], [dx - 15, dy]], V.stores >= FULL ? '#f6e6e0' : '#fffdf6', { w: 1.3 }));

  // the one way off, and back in spring
  flowArrow([[dx + 12, dy - 10], [WINTER[0] - 120, WINTER[1] + 10], [WINTER[0] - 86, WINTER[1] + 4]], { w: 1.6 });
  pill(986, 470, '[else]');
  const sp = [];
  for (let k = 0; k <= 20; k++) { const t = k / 20, a = [WINTER[0] - 30, WINTER[1] - 80], c = [960, 290], b = [C0[0] + 52, C0[1] - R - 84]; sp.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]); }
  flowArrow(sp, { w: 1.6, col: INK });
  pill(968, 318, 'spring');

  // rain sends the bee home early, through the middle
  flowArrow(arc(ANG.meadow - 10, -160, 196, 30), { dashed: true, w: 1.5 });
  pill(...onRing(-120, 196), 'rain shower');
  flowArrow(arc(ANG.clover + 10, 160, 196, 30), { dashed: true, w: 1.5 });
  pill(...onRing(108, 196), 'rain shower');

  // start
  out.push(`<circle cx="520" cy="300" r="6" fill="${INK}"/>`);
  flowArrow([[524, 304], [C0[0] - 60, C0[1] - R - 72]], { w: 1.4, col: INK });

  for (const id of [...RING, 'winter']) station(id);
  group('id="bee"', () => { const [x, y] = beeAt(AT); bee(x, y, 1.1); });

  title('a cycle', 'One bee, one summer');
  subtitle('five stops round the ring, one way off it');
  status(NAMES[AT], `combs ${V.stores} of ${FULL} · ${V.load ? 'nectar' : 'empty'}`);
  footnote('Illustrative: a made-up hive of five combs. A real bee makes hundreds of trips for one spoon of honey.');
  finish();
}

function beeAt(id) { const [x, y] = centre(id), r = id === 'winter' ? 82 : RD; return [x - r * 0.8, y - r * 0.55]; }

// the bee's way between two stations, as sheet points
function wayOf(a, b) {
  const A = beeAt(a), B = beeAt(b);
  if (a === 'hive' && b === 'winter') return [A, onRing(DIAMOND), B];
  if (a === 'winter') return [A, [960, 300], B];
  if (b === 'homeward' && (a === 'meadow' || a === 'clover')) return [A, ...arc(a === 'meadow' ? ANG.meadow - 10 : ANG.clover + 10, a === 'meadow' ? -160 : 160, 196, 4), B];
  const a0 = ANG[a] - 34, a1 = (ANG[b] < ANG[a] ? ANG[b] + 360 : ANG[b]) - 34;
  return [A, ...arc(a0 + 12, a1 - 12, R, 3), B];
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(15); ctx.state(AT); };
  // the swarm holds still while the bee flies: two moving things each frame
  // cost two repaints of the whole sheet, and the flight stutters
  let flying = false;
  const go = (to, change = () => {}) => {
    flying = true;
    // one smooth flight on a curve, not a hop from point to point
    walk(ctx, $('bee'), spline(wayOf(AT, to), false, 6).map(p => [...at(...p), 0]), { bob: 4, then: () => { flying = false; change(); AT = to; redraw(); } });
  };
  ctx.button('fly on', () => {
    if (AT === 'winter') return ctx.no('Snow outside. The bees wait for spring.');
    if (AT === 'hive') {
      if (V.stores >= FULL) { ctx.say('Every comb is full. The bees cluster for the winter.'); return go('winter'); }
      ctx.say('Out of the hive, to the meadow.'); return go('meadow');
    }
    if (AT === 'clover' && !V.load) return ctx.no('The basket is empty. Sip nectar first.');
    if (AT === 'homeward') {
      ctx.say(V.load ? 'Nectar into the comb.' : 'Nothing to unload this time.');
      return go('hive', () => { V = { stores: V.stores + (V.load ? 1 : 0), load: false }; LAP++; });
    }
    const to = RING[RING.indexOf(AT) + 1];
    ctx.say({ clover: 'On to the clover.', pond: 'A drink at the pond.', homeward: 'Heavy now. Home.' }[to]);
    go(to);
  });
  ctx.button('sip nectar', () => {
    if (AT !== 'clover') return ctx.no('Nectar is in the clover.');
    if (V.load) return ctx.no('The basket is full already.');
    V.load = true; redraw(); ctx.say('Sip, sip. The basket is full.');
  });
  ctx.button('rain shower', () => {
    if (AT !== 'meadow' && AT !== 'clover') return ctx.no('Rain only matters out in the flowers.');
    ctx.say('Rain! Home at once, the basket washed empty.');
    go('homeward', () => { V.load = false; });
  });
  ctx.button('spring', () => {
    if (AT !== 'winter') return ctx.no('Spring comes after winter.');
    ctx.say('Spring. The combs are eaten. Start again.');
    go('hive', () => { V = { stores: 0, load: false }; LAP = 1; });
  });
  ctx.hint('Press Play all for one summer, or fly on.');
  redraw();

  // [state, combs, basket, trip]
  const STORY = [['hive', 4, false, 5], ['meadow', 4, false, 5], ['clover', 4, true, 5], ['pond', 4, true, 5], ['homeward', 4, true, 5], ['hive', 5, false, 6],
    ['winter', 5, false, 6], ['hive', 0, false, 1], ['meadow', 0, false, 1], ['homeward', 0, false, 1], ['hive', 0, false, 2]];
  let si = -1;
  return {
    goto(id, play) {
      let j = play ? STORY.findIndex((s, k) => k > si && s[0] === id) : -1;
      if (j < 0) j = STORY.findIndex(s => s[0] === id);
      si = j;
      const [, stores, load, lap] = STORY[j];
      const set = () => { V = { stores, load }; LAP = lap; };
      ctx.say(`${NAMES[id]}: ${NOTES[id]}.`);
      if (play && id !== AT) go(id, set);
      else { set(); AT = id; redraw(); }
    },
    tick(t) {
      if (flying) return;
      const b = $('buzz'), [x, y] = centre('hive');
      if (b) b.setAttribute('transform', `rotate(${n1(Math.sin(t * 0.9) * 14)} ${n1(x)} ${n1(y - 30)})`);
    },
    story: STORY.map(s => s[0]),
  };
}
