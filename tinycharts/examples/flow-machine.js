// A recycling sorting line, drawn as the machine it is. One load of mixed
// recycling rides the belt; each station takes one kind out. A camera at the
// end sends a dirty load round the picking line and back to the hopper.
const ABOUT = 'a process built as a machine';
const BALES = 3;
const IDS = ['tipped', 'magnet', 'jet', 'screen', 'check', 'picking', 'baled', 'lorry'];
const NAMES = { tipped: 'the hopper', magnet: 'the magnet', jet: 'the air jets', screen: 'the glass screen', check: 'the camera check', picking: 'the picking line', baled: 'the baler', lorry: 'the lorry' };
const SAYS = {
  tipped: 'A bin lorry tips its load into the hopper.', magnet: 'The magnet lifts the steel cans.', jet: 'Air jets blow the plastic bottles off.',
  screen: 'The glass drops through the screen.', check: 'The camera looks at what is left.', picking: 'Round the picking line. Hands take the bad thing out.',
  baled: 'Only paper left. Pressed into a bale.', lorry: 'Three bales. The lorry is full.',
};
// where each station sits on the line, as a world point on the belt top
const SPOT = { tipped: [10, 30, 54], magnet: [160, 30, 40], jet: [290, 30, 40], screen: [420, 30, 40], check: [550, 30, 40], picking: [430, 235, 30], baled: [660, 30, 82], lorry: [850, 50, 60] };
// what is still in the load after each station
const LEFT = { tipped: 'csgp', magnet: 'sgp', jet: 'gp', screen: 'p', check: 'p', picking: 'p', baled: '', lorry: '' };
let AT = 'tipped';
let V = { dirty: false, bales: 0 };

const quad = (x0, x1, y0, y1, z = 0) => [P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)];

// the slats sit in a clip of the belt top; the page slides them one slat
// pitch along the run (dx, dy world units) and starts over, so the belt runs
const PITCH = 26;
function belt(x, y, w, d, h, along = 'x', dir = 1) {
  box(x, y, 0, w, d, h, { left: '#6b6f78', top: '#4d5058', marks: false });
  const n = Math.floor((along === 'x' ? w : d) / PITCH) + 2;
  const [ax, ay] = P(x, y, h), [bx, by] = P(x + (along === 'x' ? PITCH * dir : 0), y + (along === 'x' ? 0 : PITCH * dir), h);
  clipped(quad(x, x + w, y, y + d, h), () => {
    out.push(`<g class="slats" data-dx="${n1(bx - ax)}" data-dy="${n1(by - ay)}">`);
    rule(Array.from({ length: n }, (_, k) => along === 'x' ? [P(x - 13 + k * PITCH, y, h), P(x - 13 + k * PITCH, y + d, h)] : [P(x, y - 13 + k * PITCH, h), P(x + w, y - 13 + k * PITCH, h)]), '#2f3137', 0.8);
    out.push('</g>');
  });
}

function can(sx, sy, s = 1) { shape([[sx - 4 * s, sy], [sx + 4 * s, sy], [sx + 4 * s, sy - 9 * s], [sx - 4 * s, sy - 9 * s]], '#c9cdd3', { w: 0.8 }); line([[sx - 4 * s, sy - 6 * s], [sx + 4 * s, sy - 6 * s]], { w: 1.4, col: PAL.brick, over: 0 }); }
function bottle(sx, sy, s = 1) { shape([[sx - 3.5 * s, sy], [sx + 3.5 * s, sy], [sx + 3.5 * s, sy - 9 * s], [sx + 1.5 * s, sy - 12 * s], [sx + 1.5 * s, sy - 15 * s], [sx - 1.5 * s, sy - 15 * s], [sx - 1.5 * s, sy - 12 * s], [sx - 3.5 * s, sy - 9 * s]], '#bcdbe6', { w: 0.8 }); }
function jar(sx, sy, s = 1) { shape([[sx - 4 * s, sy], [sx + 4 * s, sy], [sx + 4 * s, sy - 10 * s], [sx - 4 * s, sy - 10 * s]], '#9fc39a', { w: 0.8 }); }
function paper(sx, sy, s = 1) { shape([[sx - 7 * s, sy], [sx + 6 * s, sy - 2 * s], [sx + 7 * s, sy - 7 * s], [sx - 6 * s, sy - 6 * s]], '#f3ead8', { w: 0.8 }); line([[sx - 4 * s, sy - 4 * s], [sx + 3 * s, sy - 5 * s]], { w: 0.5, over: 0 }); }
function pizza(sx, sy, s = 1) { shape([[sx - 8 * s, sy], [sx + 8 * s, sy - 3 * s], [sx + 8 * s, sy - 7 * s], [sx - 8 * s, sy - 4 * s]], '#d7b98a', { w: 0.8 }); out.push(`<circle cx="${n1(sx + 2 * s)}" cy="${n1(sy - 3.5 * s)}" r="${n1(2 * s)}" fill="#a8743f" opacity=".7"/>`); }

// the load: what is left of it, and the pizza box if it is in there
function load(left, dirty, s = 1) {
  out.push(`<ellipse cx="0" cy="2" rx="${n1(16 * s)}" ry="${n1(5 * s)}" fill="${SHADOW}" opacity=".5"/>`);
  if (left.includes('p')) { paper(-6 * s, 0, s); paper(6 * s, -3 * s, s); paper(0, -6 * s, s); }
  if (left.includes('g')) jar(-10 * s, -2 * s, s);
  if (left.includes('s')) bottle(10 * s, -2 * s, s);
  if (left.includes('c')) can(2 * s, -9 * s, s);
  if (dirty) pizza(4 * s, -10 * s, s);
  if (!left) { box_(s); }
}
function box_(s) { shape([[-14 * s, 0], [0, 6 * s], [14 * s, 0], [14 * s, -16 * s], [0, -10 * s], [-14 * s, -16 * s]], PAL.butter, { w: 0.9 }); rule([[[0, 6 * s], [0, -10 * s]], [[-14 * s, -8 * s], [14 * s, -8 * s]]], '#a8743f', 1.4); }

function bin(x, y, col, what, key) {
  put(key, 0, () => {
    box(x, y, 0, 40, 40, 30, { left: col, marks: false });
    const [sx, sy] = P(x + 20, y + 20, 30);
    for (let k = 0; k < 3; k++) {
      const dx = (k - 1) * 9, dy = (k % 2) * 3;
      if (what === 'c') can(sx + dx, sy + dy); else if (what === 's') bottle(sx + dx, sy + dy); else if (what === 'g') jar(sx + dx, sy + dy); else pizza(sx + dx, sy + dy, 0.8);
    }
  });
}

// a station's name on a tag above it
function tag2(id, x, y, z) {
  const [sx, sy] = P(x, y, z), w = textW(NAMES[id], 15) + 20;
  line([[sx, sy], [sx, sy - 22]], { w: 1, over: 0 });
  out.push(`<rect x="${n1(sx - w / 2)}" y="${n1(sy - 48)}" width="${n1(w)}" height="26" rx="4" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>`);
  _text(sx, sy - 30, NAMES[id], { size: 15, anchor: 'middle' });
}

function lit(pts, tx, ty) {
  out.push('<g class="on">');
  litRing(pts);
  nowTag(tx, ty);
  out.push('</g>');
}

function machine() {
  // the floor of the shed
  flat(quad(-90, 960, -100, 290), '#e7dfcf');
  rule([[P(-90, -100), P(960, -100)], [P(-90, -100), P(-90, 290)]], INK, 0.7);

  // belts: the main line, down to the return line, back to the hopper
  put(250, 0, () => belt(40, 0, 560, 60, 40));
  put(450, 0, () => belt(560, 60, 50, 150, 30, 'y'));
  put(420, 0, () => belt(30, 210, 580, 50, 30, 'x', -1));
  put(120, 0, () => belt(-20, 60, 50, 200, 30, 'y', -1));

  // the hopper, with a wheelie bin tipping in
  put(30, 0, () => {
    box(-60, -10, 0, 90, 80, 54, { left: '#7d8a6a', top: '#5c6650', marks: false });
    const [sx, sy] = P(-15, 30, 54);
    shape(oval(sx, sy, 30, 12, 20), '#3c4038', { w: 1 });
  });
  put(31, 1, () => box(-56, -50, 54, 30, 34, 34, { left: '#5f8a5a', top: '#7fae6a', marks: false }));
  put(60, 0, () => who(-70, 90, { shirt: '#e3c77a', pants: PAL.slate, hair: 'cap', arm: 'up', look: 1 }));

  // the magnet on its gantry, with cans under it
  put(200, 1, () => {
    for (const y of [-20, 70]) box(150, y, 0, 10, 10, 110, { left: PAL.slate, marks: false });
    box(146, -24, 110, 18, 108, 10, { left: PAL.slate, marks: false });
    turn(156, 30, 76, [[24, 0], [24, 22]], PAL.brick, { cap: '#9e5a45' });
    const [sx, sy] = P(156, 30, 76); can(sx - 10, sy + 10); can(sx + 8, sy + 12);
  });
  bin(140, -80, PAL.grey, 'c', 80);

  // the air jets: a hood over the belt, bottles blown off the back
  put(320, 1, () => {
    box(270, -10, 40, 44, 80, 44, { left: PAL.sky, top: PAL.blue, marks: false });
    const [bx, by] = P(290, -36, 70); bottle(bx, by, 1); bottle(bx + 14, by - 10, 0.9);
  });
  bin(270, -84, PAL.sky, 's', 210);

  // the screen: rollers, glass falling through to a bin in front
  put(450, 1, () => {
    box(400, -6, 40, 50, 72, 8, { left: PAL.wood, marks: false });
    for (let k = 0; k < 4; k++) cyl(406 + k * 12, 30, 48, 4, 4, PAL.stone);
  });
  bin(400, 100, '#9fc39a', 'g', 520);

  // the camera arch and its inspector
  put(560, 1, () => {
    for (const y of [-14, 70]) box(540, y, 0, 8, 8, 96, { left: PAL.slate, marks: false });
    box(536, -18, 96, 16, 100, 10, { left: PAL.slate, marks: false });
    const [sx, sy] = P(544, 30, 92); out.push(`<rect x="${n1(sx - 8)}" y="${n1(sy - 2)}" width="16" height="10" fill="${INK}"/><circle cx="${n1(sx)}" cy="${n1(sy + 9)}" r="3" fill="${RED}"/>`);
  });
  put(540, 0, () => who(520, -54, { shirt: PAL.mint, pants: PAL.navy, hair: 'bun', arm: 'out', look: 1 }));

  // the picking line: two people take the bad things out
  put(560, 2, () => { who(260, 290, { shirt: '#e6a96b', pants: PAL.slate, hair: 'short', arm: 'out', look: -1 }); who(350, 290, { shirt: '#e6a96b', pants: PAL.navy, hair: 'bob', arm: 'out', look: -1 }); });
  bin(170, 276, PAL.rose, 'z', 470);

  // the baler and the lorry
  put(700, 0, () => {
    box(620, -10, 0, 80, 80, 60, { left: PAL.mustard, top: '#f1d98f', marks: false });
    box(632, 2, 60, 56, 56, 22, { left: PAL.slate, marks: false });
  });
  put(900, 0, () => {
    box(770, 0, 10, 140, 100, 20, { left: '#8e6b55', top: '#a8826a', marks: false });
    for (const x of [790, 880]) { const [sx, sy] = P(x, 100, 8); out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="9" fill="${INK}"/>`); }
    for (let k = 0; k < V.bales; k++) box(780 + k * 42, 20, 30, 36, 60, 30, { left: PAL.butter, top: '#f3ead8', marks: false });
  });
  put(900, 2, () => box(910, 6, 0, 46, 88, 64, { left: PAL.blue, top: PAL.sky, marks: false }));
  put(950, 0, () => who(860, 170, { shirt: PAL.navy, pants: PAL.slate, hair: 'cap', arm: 'wave', look: -1 }));
  flush();

  // arrows on the belts
  flowArrow([P(60, 30, 42), P(130, 30, 42)], { w: 2 });
  flowArrow([P(585, 70, 32), P(585, 200, 32)], { w: 2, dashed: true });
  flowArrow([P(560, 235, 32), P(60, 235, 32)], { w: 2, dashed: true });
  flowArrow([P(5, 200, 32), P(5, 80, 32)], { w: 2, dashed: true });
  flowArrow([P(570, 30, 42), P(630, 30, 64)], { w: 2 });
}

const PILLS = [
  ['start the belt', [90, 130, 0]], ['pull the cans', [200, 110, 0]], ['blow the bottles', [345, 150, 0]], ['shake out the glass', [478, 160, 0]],
  ['[only paper left]', [640, 120, 0]], ['[else] round again', [440, 300, 0]], ['pick it out', [-40, 230, 0]], ['next load', [740, 160, 0]],
];

function draw(seed) {
  begin(seed);
  OX = 420; OY = 400;
  machine();
  for (const [t, p] of PILLS) pill(...P(...p), t);

  // states: a lit ring on the surface the load stands on (belt, hopper top,
  // press top, bales), queued just after that surface, so what stands on
  // it is in front of the ring and the load rides over it.
  const FOOT = {
    tipped: [quad(-64, 34, -14, 74, 54), -30, 60, 90, 30], magnet: [quad(130, 192, -6, 66, 40), 150, -30, 130, 250], jet: [quad(262, 322, -6, 66, 40), 300, -60, 110, 250],
    screen: [quad(392, 458, -6, 66, 40), 430, -60, 110, 250], check: [quad(522, 570, -6, 66, 40), 544, -24, 116, 250], picking: [quad(230, 470, 206, 264, 30), 330, 300, 60, 420],
    baled: [quad(626, 694, -2, 62, 82), 770, 10, 110, 700], lorry: [quad(774, 904, 14, 86, 60), 860, 50, 94, 900],
  };
  for (const id of IDS) {
    const [pts, tx, ty, tz, key] = FOOT[id], [nx, ny] = P(tx, ty, tz);
    const ring = () => group(`data-state="${id}"`, () => lit(pts, nx + textW(NAMES[id], 15) / 2 + 2, ny - 56));
    put(key, 1, ring);
    put(990, 0, () => group(`data-state="${id}"`, () => tag2(id, tx, ty, tz)));
  }

  // the load on the belt
  // the load goes over the whole machine, so no hood hides it
  put(980, 0, () => group('id="load"', () => { const [sx, sy] = P(...SPOT[AT]); out.push(`<g transform="translate(${n1(sx)} ${n1(sy)})">`); load(LEFT[AT], V.dirty, 1.5); out.push('</g>'); }));

  // the side list of states, the current one filled
  const lx = 72, ly = 1040;
  _text(lx, ly, 'THE LINE', { size: 14, cls: 'cap', col: LEAD });
  IDS.forEach((id, k) => {
    const y = ly + 30 + k * 30, now = id === AT;
    out.push(`<circle cx="${lx + 8}" cy="${y - 5}" r="7" fill="${now ? RED : PAPER}" stroke="${now ? RED : INK}" stroke-width="1.1"/>`);
    _text(lx + 26, y, NAMES[id], { size: 16, col: now ? INK : LEAD });
  });

  // the gauge the guards read: what the camera sees, and the bales
  const gx = 960, gy = 1130;
  _text(gx, gy - 30, 'WHAT THE GUARDS READ', { size: 14, cls: 'cap', col: LEAD });
  out.push(`<rect x="${gx}" y="${gy - 14}" width="360" height="44" rx="6" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>`);
  out.push(`<g transform="translate(${gx + 30} ${gy + 20})">`); (V.dirty ? pizza : paper)(0, 0, 1.6); out.push('</g>');
  _text(gx + 62, gy + 14, V.dirty ? 'camera: a greasy pizza box' : 'camera: only paper', { size: 16, col: V.dirty ? RED : INK });
  out.push(`<rect x="${gx}" y="${gy + 44}" width="360" height="56" rx="6" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>`);
  for (let k = 0; k < BALES; k++) out.push(`<rect x="${gx + 18 + k * 40}" y="${gy + 56}" width="30" height="30" rx="3" fill="${k < V.bales ? PAL.butter : PAPER}" stroke="${INK}" stroke-width="1"/>`);
  _text(gx + 148, gy + 78, `on the lorry: ${V.bales} of ${BALES}`, { size: 16 });

  title('a flow machine', 'The sorting line');
  subtitle('one load of recycling, sorted by machine, baled for the paper mill');
  status(NAMES[AT], `${V.dirty ? 'a pizza box in it' : 'clean so far'} · bales ${V.bales} of ${BALES}`);
  footnote('Illustrative: a made-up sorting shed. Real lines run tonnes an hour, and people still pick by hand.');
  finish();
}

// the load's way between two stations, along the belts
function wayOf(a, b) {
  const pt = id => P(...SPOT[id]);
  if (a === 'check' && b === 'picking') return [pt(a), P(585, 30, 40), P(585, 235, 30), pt(b)];
  if (a === 'picking') return [pt(a), P(5, 235, 30), P(5, 30, 40), pt(b)];
  if (a === 'lorry' || (a === 'baled' && b === 'tipped')) return [pt(a), P(400, -80, 160), pt(b)];
  return [pt(a), pt(b)];
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(22); ctx.state(AT); };
  const go = (to, change = () => {}) => {
    // the station the load leaves lets go of its ring as the load sets off
    if (!ctx.still) for (const el of document.querySelectorAll('#art [data-state].lit .on')) el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' });
    walk(ctx, $('load'), wayOf(AT, to).map(p => [...at(...p), 0]), { bob: 1, then: () => { change(); AT = to; redraw(); } });
  };
  const NEXT = { tipped: 'magnet', magnet: 'jet', jet: 'screen', screen: 'check' };
  const next = () => {
    if (NEXT[AT]) { ctx.say(SAYS[NEXT[AT]]); return go(NEXT[AT]); }
    if (AT === 'check') {
      if (V.dirty) { ctx.say('The camera sees grease. ' + SAYS.picking); return go('picking'); }
      ctx.say(SAYS.baled); return go('baled');
    }
    if (AT === 'picking') { ctx.say('The pizza box is out. Back to the hopper.'); return go('tipped', () => { V.dirty = false; }); }
    if (AT === 'baled') {
      if (V.bales + 1 >= BALES) { ctx.say(SAYS.lorry); return go('lorry', () => { V.bales++; }); }
      ctx.say('The bale goes on the lorry. Next load.'); return go('tipped', () => { V.bales++; });
    }
    ctx.say('The lorry drives off to the paper mill.'); go('tipped', () => { V.bales = 0; });
  };
  ctx.button('next stop', next);
  ctx.button('a greasy pizza box', () => {
    if (AT !== 'tipped') return ctx.no('It can only come in with a load, at the hopper.');
    if (V.dirty) return ctx.no('One pizza box is in already.');
    V.dirty = true; redraw(); ctx.say('Someone put a greasy pizza box in the paper bin.');
  });
  ctx.hint('Press Play all, or next stop. Add a pizza box to see the loop.');
  redraw();

  // [state, dirty, bales]
  const STORY = [['tipped', true, 2], ['magnet', true, 2], ['jet', true, 2], ['screen', true, 2], ['check', true, 2], ['picking', true, 2], ['tipped', false, 2],
    ['magnet', false, 2], ['jet', false, 2], ['screen', false, 2], ['check', false, 2], ['baled', false, 2], ['lorry', false, 3], ['tipped', false, 0]];
  let si = -1;
  return {
    goto(id, play) {
      let j = play ? STORY.findIndex((s, k) => k > si && s[0] === id) : -1;
      if (j < 0) j = STORY.findIndex(s => s[0] === id);
      si = j;
      const set = () => { V = { dirty: STORY[j][1], bales: STORY[j][2] }; };
      ctx.say(SAYS[id]);
      if (play && id !== AT) go(id, set);
      else { set(); AT = id; redraw(); }
    },
    tick(t) {
      const u = (t * 1.6) % 1;
      for (const g of document.querySelectorAll('#art .slats')) g.setAttribute('transform', `translate(${n1(g.dataset.dx * u)} ${n1(g.dataset.dy * u)})`);
    },
    story: STORY.map(s => s[0]),
  };
}
