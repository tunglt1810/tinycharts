// A level crossing, second by second: four signal lanes on one seconds axis,
// and the crossing itself beside them, drawn from the time now.
const ABOUT = 'each signal, second by second';
const STORY = ['open', 'warning', 'lowering', 'down', 'train', 'clear', 'raising', 'open'];
const ORDER = ['open', 'warning', 'lowering', 'down', 'train', 'clear', 'raising'];
const CANON = { open: 0, warning: 2, lowering: 11, down: 14, train: 20, clear: 26, raising: 31 };
const NAMES = { open: 'road open', warning: 'lights on', lowering: 'barrier lowering', down: 'barrier down', train: 'train passing', clear: 'train gone', raising: 'barrier rising' };
const LIST = { open: 'road open', warning: 'train detected', lowering: 'barrier coming down', down: 'barrier down', train: 'train on the crossing', clear: 'train gone', raising: 'barrier going up' };
const SAY = {
  open: 'The road is open. Lights dark, barrier up.',
  warning: 'A train trips the detector. Lights flash, the bell rings.',
  lowering: 'Six seconds of lights. Now the barrier comes down.',
  down: 'Barrier down. The bell stops; the lights keep flashing.',
  train: 'The train crosses the road.',
  clear: 'The last coach clears the road.',
  raising: 'Nothing on the line. The barrier goes up.',
};
const SPAN = 45, X0 = 272, X1 = 740, AX = 950, SEED = 12;
const xs = t => X0 + t / SPAN * (X1 - X0);
const fresh = () => ({ flashed: false, due: 0, on: false, extra: false, t2: 0 });
let AT = 'open', T = 0, V = fresh();

// the plan of one run: when the barrier starts up depends on a second train
const upAt = () => (V.extra ? 38 : 28);
const barAt = t => { const r = upAt(); return t < 8 ? 0 : t < 14 ? (t - 8) / 3 : t < r ? 2 : t < r + 6 ? 2 - (t - r) / 3 : 0; };
const lightsAt = t => t >= 2 && t < upAt() + 6;
const bellAt = t => t >= 2 && t < 14;
const trainAt = t => {
  const on = (t >= 20 && t < 26) || (V.extra && t >= 30 && t < 36);
  const near = (t >= 2 && t < 20) || (V.extra && t >= V.t2 && t < 30);
  return on ? 0 : near ? 1 : 2;
};
// a car's place along its lane: it pulls up, waits for the barrier, and
// drives on once the barrier is up again
const carAt = (t, from, wait, gone) => {
  const end = Math.min(SPAN, upAt() + 8), k = t < 2 ? 0 : t < 6 ? easeInOut((t - 2) / 4) : 1;
  if (t < end - 4) return from + (wait - from) * k;
  return wait + (gone - wait) * easeInOut(Math.min(1, (t - end + 4) / 4));
};
// the front of each train, in world x; it reaches the road at its second of arrival
const fronts = t => [40 + 29.7 * (t - 20), ...(V.extra ? [40 + 29.7 * (t - 30)] : [])];

const LANES = [
  { name: 'LIGHTS', note: 'two lamps, in turn', rows: ['flashing', 'off'], v: t => (lightsAt(t) ? 0 : 1), wig: t => (lightsAt(t) ? (Math.floor(t * 2) % 2 ? -6 : 6) : 0) },
  { name: 'BELL', note: 'stops once down', rows: ['ringing', 'silent'], v: t => (bellAt(t) ? 0 : 1), wig: t => (bellAt(t) ? Math.sin(t * 18) * 5 : 0) },
  { name: 'BARRIER', note: 'six seconds a move', rows: ['up', 'moving', 'down'], v: barAt, wig: () => 0 },
  { name: 'TRAIN', note: 'from the detector', rows: ['on crossing', 'near', 'away'], v: trainAt, wig: () => 0 },
];
let y = 300;
for (const L of LANES) { const top = y; L.top = top; L.rowY = i => top + 70 + i * 40; y += 70 + (L.rows.length - 1) * 40 + 24; L.bot = y; }
const BOARD_BOT = y;

function lanes() {
  out.push(`<rect x="72" y="286" width="690" height="${BOARD_BOT - 286}" rx="14" fill="#fffdf6" fill-opacity=".5" stroke="${LEAD}" stroke-width="1.1" stroke-dasharray="6 5"/>`);
  // the grid: a line every 5 s
  for (let s = 0; s <= SPAN; s += 5) out.push(`<line x1="${n1(xs(s))}" y1="300" x2="${n1(xs(s))}" y2="${BOARD_BOT - 10}" stroke="#e2dbcd" stroke-width="1"/>`);
  LANES.forEach((L, k) => {
    if (k) dash([84, L.top], [750, L.top], MUTE, 5, 5, 0.9);
    _text(92, L.top + 30, L.name, { cls: 'cap', size: 16, extra: 'letter-spacing="1.5"' });
    _text(92, L.top + 48, L.note, { size: 14, col: LEAD });
    const now = Math.round(L.v(T));
    L.rows.forEach((name, i) => {
      out.push(`<line x1="${X0}" y1="${L.rowY(i)}" x2="${X1}" y2="${L.rowY(i)}" stroke="#d8d0c2" stroke-width="1" stroke-dasharray="2 4"/>`);
      const w = textW(name, 15) + 26;
      pill(X0 - 14 - w / 2, L.rowY(i), name, { lit: i === now });
    });
    // the trace, from 0 to the time now
    const pts = [];
    for (let t = 0; t <= T + 1e-6; t += 0.05) {
      const v = L.v(t), i = Math.floor(v), f = v - i, ry = L.rowY(i) + (i + 1 < L.rows.length ? f * 40 : 0);
      pts.push([xs(t), ry + L.wig(t)]);
    }
    { const v = L.v(T), i = Math.floor(v), f = v - i; pts.push([xs(T), L.rowY(i) + (i + 1 < L.rows.length ? f * 40 : 0) + L.wig(T)]); }
    if (pts.length > 1) out.push(`<path d="${pathOf(pts)}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`);
  });
}

function axis() {
  line([[X0, AX], [X1 + 16, AX]], { w: 1.2, col: LEAD, over: 0 });
  shape([[X1 + 22, AX], [X1 + 10, AX - 5], [X1 + 10, AX + 5]], LEAD, { w: 0.8 });
  rule(Array.from({ length: SPAN + 1 }, (_, s) => [[xs(s), AX], [xs(s), AX + (s % 5 ? 4 : 8)]]), LEAD, 0.9);
  for (let s = 0; s <= SPAN; s += 5) _text(xs(s), AX + 26, String(s), { size: 15, col: LEAD, anchor: 'middle' });
  _text(X1 + 10, AX + 80, 'seconds', { size: 15, col: LEAD, anchor: 'end' });
  // the time now: a red line through every lane, and its pill under the numbers
  group('id="nowline"', () => {
    const x = xs(T), lbl = `${Math.round(T)} s`, w = textW(lbl, 15) + 22;
    out.push(`<line x1="${n1(x)}" y1="296" x2="${n1(x)}" y2="${AX}" stroke="${RED}" stroke-width="2.2"/>`);
    out.push(`<rect x="${n1(x - w / 2)}" y="${AX + 40}" width="${n1(w)}" height="26" rx="13" fill="${RED}"/>`);
    _text(x, AX + 58, lbl, { size: 15, col: PAPER, anchor: 'middle' });
  });
}

function marks() {
  _text(72, 1068, 'the crossing, in order', { cls: 'cap', size: 16 });
  ORDER.forEach((id, i) => {
    const t = id === AT ? T : CANON[id], sx = xs(t), sy = AX;
    const lx = i < 4 ? 72 : 470, ly = 1098 + (i % 4) * 26;
    group(`data-state="${id}"`, () => {
      out.push(`<circle cx="${n1(sx)}" cy="${sy}" r="9" fill="#fffdf6" stroke="${INK}" stroke-width="1.1"/>`);
      _text(sx, sy + 4.5, String(i + 1), { size: 12, anchor: 'middle' });
      _text(lx, ly, String(i + 1), { size: 15, col: MUTE });
      _text(lx + 22, ly, `${CANON[id]} s  ${LIST[id]}`, { size: 17, col: LEAD });
      out.push('<g class="on">');
      out.push(`<circle cx="${n1(sx)}" cy="${sy}" r="9" fill="${RED}"/>`);
      _text(sx, sy + 4.5, String(i + 1), { size: 12, col: PAPER, anchor: 'middle' });
      _text(lx, ly, String(i + 1), { size: 15, col: RED });
      _text(lx + 22, ly, `${CANON[id]} s  ${LIST[id]}`, { size: 17 });
      out.push('</g>');
    });
  });
}

function events() {
  const r = upAt();
  const all = [
    [2, 'train detected', AT === 'warning'], [8, 'lights flashed six seconds', V.flashed], [8, 'barrier starts down', AT === 'lowering'],
    [14, 'barrier down, bell stops', AT === 'down'], [20, 'train on the crossing', AT === 'train'],
    ...(V.extra ? [[V.t2, 'a second train detected', true]] : []),
    [26, 'train clear of the road', AT === 'clear'],
    ...(V.extra ? [[30, 'second train on', AT === 'train'], [36, 'second train clear', AT === 'clear']] : []),
    [r, 'barrier starts up', AT === 'raising'], [r + 6, 'barrier up, lights off', AT === 'open'],
  ].map((e, i) => [...e, i]).sort((a, b) => a[0] - b[0] || a[3] - b[3]);
  const seen = all.filter(([t, , here]) => t < T - 1e-6 || (Math.abs(t - T) < 1e-6 && here));
  const evBox = [[800, 800], [1328, 800], [1328, 1190], [800, 1190]];
  out.push(`<rect x="803" y="803" width="528" height="390" rx="8" fill="#c9bfae"/>`);
  out.push(`<rect x="800" y="800" width="528" height="390" rx="8" fill="#fffdf6"/>`);
  rim(evBox, 1.2);
  _text(822, 834, 'EVENTS', { cls: 'cap', size: 15, col: LEAD, extra: 'letter-spacing="1.5"' });
  if (!seen.length) _text(822, 872, 'nothing yet', { size: 17, col: LEAD });
  seen.forEach(([t, s], i) => {
    const last = i === seen.length - 1;
    _text(856, 872 + i * 27, `${t} s`, { size: 16, col: last ? RED : MUTE, anchor: 'end' });
    _text(872, 872 + i * 27, s, { size: 17, col: last ? INK : LEAD });
  });
}

// the picture: the crossing drawn from the time now
function car(x, y, col, z = 0) {
  box(x - 10, y, z, 20, 40, 9, { left: col, marks: false, ink: 1.2 });
  box(x - 9, y + 10, z + 9, 18, 18, 8, { left: PAL.sky, top: col, marks: false, ink: 1 });
}
function arm(px, py, dir, a) {
  const L = 66, r = a * Math.PI / 180, pts = [];
  for (let k = 0; k <= 6; k++) pts.push(P(px + dir * L * Math.cos(r) * k / 6, py, 19 + L * Math.sin(r) * k / 6));
  line([pts[0], pts[6]], { w: 6, col: INK, over: 0, amp: 0.2 });
  for (let k = 0; k < 6; k++) line([pts[k], pts[k + 1]], { w: 3.6, col: k % 2 ? '#fffdf6' : RED, over: 0, amp: 0 });
}
function post(x, y, lit, face) {
  cyl(x, y, 0, 2.2, 56, PAL.slate, { cap: PAL.slate });
  box(x - 11, y - 2, 44, 22, 4, 12, { left: INK, top: PAL.slate, marks: false, ink: 1 });
  for (const [k, cls] of [[-5.5, 'lampA'], [5.5, 'lampB']]) {
    const [sx, sy] = P(x + k, y + 2 * face, 50);
    if (lit) out.push(`<circle class="${cls}" cx="${n1(sx)}" cy="${n1(sy)}" r="11" fill="#f2a493" opacity=".45"/>`);
    out.push(`<circle class="${lit ? cls : ''}" cx="${n1(sx)}" cy="${n1(sy)}" r="4.2" fill="${lit ? RED : '#5a5550'}" stroke="${INK}" stroke-width=".8"/>`);
  }
}

function crossing() {
  const t = T, a = 90 - barAt(t) * 45, lit = lightsAt(t), down = barAt(t) > 0;
  OX = 1064; OY = 520;
  out.push(`<g transform="translate(${OX} ${OY}) scale(1.22) translate(${-OX} ${-OY})">`);
  board(-150, -100, 300, 200, 14, '#e4dccb', PAL.tan);
  // footpaths, road, ballast, sleepers, rails
  for (const [x0, x1] of [[-52, -30], [30, 52]]) { const q = [P(x0, -100), P(x1, -100), P(x1, 100), P(x0, 100)]; fill(q, PAL.cream); rim(q, 0.6); }
  const road = [P(-30, -100), P(30, -100), P(30, 100), P(-30, 100)];
  fill(road, '#a9a8a6'); rim(road, 1);
  for (let yy = -96; yy < 100; yy += 22) if (Math.abs(yy) > 24) line([P(0, yy), P(0, yy + 10)], { w: 1.6, col: '#fffdf6', over: 0, amp: 0 });
  for (const yy of [-40, 40]) line([P(-30, yy), P(30, yy)], { w: 2.4, col: '#fffdf6', over: 0, amp: 0.2 });
  const bal = [P(-150, -18), P(150, -18), P(150, 18), P(-150, 18)];
  fill(bal, PAL.stone); rim(bal, 0.8);
  rule(Array.from({ length: 25 }, (_, k) => [P(-144 + k * 12, -14), P(-144 + k * 12, 14)]), PAL.bark, 2.2);
  const plate = [P(-30, -18), P(30, -18), P(30, 18), P(-30, 18)];
  fill(plate, '#8e8a84'); rim(plate, 0.8);
  for (const yy of [-8, 8]) line([P(-150, yy), P(150, yy)], { w: 1.8, col: PAL.slate, over: 0, amp: 0 });
  // around it
  put(-195, 0, () => tree(-118, -78, 24));
  put(-200, 1, () => tree(-128, 62, 18, 0, PAL.sage));
  put(-40, 0, () => {
    gable(78, -98, 48, 34, 30, 16, { wall: PAL.butter, roof: PAL.brick });
    faceText('left', 102, -64, 18, 'SIGNAL BOX', { size: 8, cls: 'cap' });
  });
  put(-110, 0, () => fence([[-150, -26], [-56, -26]], { post: 12, gap: 18 }));
  put(-100, 0, () => fence([[56, -26], [150, -26]], { post: 12, gap: 18 }));
  put(60, 0, () => fence([[-150, 26], [-56, 26]], { post: 12, gap: 18 }));
  put(170, 0, () => fence([[56, 26], [150, 26]], { post: 12, gap: 18 }));
  put(-40, 2, () => car(110, -50, PAL.navy));
  // the queue: cars wait at the line while the barrier is not up
  const yb = carAt(t, 60, 46, -100), ym = carAt(t, -100, -86, 60);
  put(yb + 14, 2, () => car(16, yb, PAL.brick));
  put(ym - 2, 2, () => car(-16, ym, PAL.mustard));
  put(30, 3, () => who(-41, down ? 54 : 70, { shirt: PAL.sage, pants: PAL.navy, hair: 'bun', size: 0.5, look: -1, arm: trainAt(t) === 0 ? 'wave' : 'down' }));
  put(32, 3, () => who(-44, 76, { shirt: PAL.mustard, pants: PAL.bark, hair: 'short', kid: true, size: 0.5, look: -1 }));
  put(-10, 3, () => who(42, -58, { shirt: PAL.rose, pants: PAL.slate, hair: 'cap', size: 0.5 }));
  put(-14, 3, () => dog(46, -44, 0, PAL.tan));
  // the barriers and their lamps; the far side first
  put(-80, 4, () => { box(-44, -36, 0, 10, 8, 20, { left: '#fffdf6', marks: false, ink: 1 }); arm(-39, -32, 1, a); post(-48, -40, lit, 1); });
  put(80, 4, () => {
    box(34, 28, 0, 10, 8, 20, { left: '#fffdf6', marks: false, ink: 1 }); arm(39, 32, -1, a); post(48, 40, lit, 1);
    group('id="bell"', () => { turn(48, 40, 56, [[5, 0], [1.5, 6]], PAL.mustard, { cap: PAL.mustard, ink: 0.8 });
      if (bellAt(t)) { const [bx, by] = P(48, 40, 60); group('id="ring"', () => { for (const r of [9, 14]) line([[bx + r, by - r * 0.6], [bx + r * 1.15, by], [bx + r, by + r * 0.6]], { w: 1.1, col: INK, over: 0, amp: 0.2 }); }); } });
  });
  // the trains, cut at the ends of the slab
  const [cl, cr] = [P(-150, 0)[0], P(150, 0)[0]];
  fronts(t).forEach((xf, k) => {
    if (xf < -150 || xf - 190 > 150) return;
    put(xf - 60, 1, () => clipped([[cl, 0], [cr, 0], [cr, 1400], [cl, 1400]], () => {
      const col = k ? PAL.leaf : PAL.navy;
      for (let c = 2; c >= 0; c--) {
        const x = xf - 62 - c * 64;
        box(x, -11, 4, 60, 22, 26, { left: c ? PAL.cream : col, top: c ? PAL.stone : shadeOf(col), marks: false, ink: 1.2 });
        for (let w = 0; w < 4; w++) { const q = [P(x + 6 + w * 14, 11, 14), P(x + 15 + w * 14, 11, 14), P(x + 15 + w * 14, 11, 23), P(x + 6 + w * 14, 11, 23)]; fill(q, PAL.sky); rim(q, 0.7); }
        line([P(x, 11, 9), P(x + 60, 11, 9)], { w: 2.4, col: col, over: 0, amp: 0 });
      }
    }));
  });
  flush();
  group('id="bird"', () => bird(-90, 40, 130, '#fffdf6'));
  out.push('</g>');
}

function draw(seed) {
  begin(seed);
  crossing();
  lanes();
  axis();
  marks();
  events();
  title('a timing diagram', 'Train coming');
  subtitle('four signals, one train, second by second');
  const bw = ['up', 'moving', 'down'][Math.round(barAt(T))];
  status(`${Math.round(T)} s · ${NAMES[AT]}`, `lights ${lightsAt(T) ? 'flash' : 'off'} · barrier ${bw}`);
  footnote('Illustrative: made-up timings. Real crossings differ: some ring the bell until the barrier is up again.');
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(SEED); ctx.state(AT); };
  // a frame only relights the state: ctx.state also rewrites the URL, too often at 60 a second
  const light = () => document.querySelectorAll('#art [data-state]').forEach(el => el.classList.toggle('lit', el.dataset.state === AT));
  let job = null;
  // time passing: the whole sheet redrawn from t0 to t1 seconds
  const lapse = (t0, t1, then) => {
    if (job) job.finish();
    if (ctx.still || Math.abs(t1 - t0) < 0.01) { then(); return; }
    const ms = Math.min(4200, 600 + Math.abs(t1 - t0) * 260);
    job = tween(ctx, ms, e => { T = t0 + (t1 - t0) * e; draw(SEED); light(); }, then);
  };
  const go = (to, t1, v = V) => { V = v; lapse(T, t1, () => { AT = to; T = t1; redraw(); }); };
  const canon = id => ({ ...fresh(), due: ['warning', 'lowering', 'down'].includes(id) ? 1 : 0, on: id === 'train', flashed: !['open', 'warning'].includes(id) });

  ctx.button('next step', () => {
    switch (AT) {
      case 'open':
        if (T > 0) { V = fresh(); T = 0; }
        ctx.say(SAY.warning); return go('warning', 2, { ...V, due: 1 });
      case 'warning':
        if (!V.flashed) { ctx.say('The lights flash and the bell rings for six seconds.'); return go('warning', 8, { ...V, flashed: true }); }
        ctx.say(SAY.lowering); return go('lowering', 11);
      case 'lowering': ctx.say(SAY.down); return go('down', 14);
      case 'down': ctx.say(SAY.train); return go('train', 20, { ...V, due: V.due - 1, on: true });
      case 'train': ctx.say(SAY.clear + (V.due ? ' Another train is due.' : '')); return go('clear', T + 6, { ...V, on: false });
      case 'clear':
        if (V.due) { ctx.say('The second train comes through. The barrier stays down.'); return go('train', 30, { ...V, due: V.due - 1, on: true }); }
        ctx.say(SAY.raising); return go('raising', upAt() + 3);
      default: ctx.say(SAY.open); return go('open', Math.min(SPAN, upAt() + 8), { ...V, flashed: false });
    }
  });
  ctx.button('another train', () => {
    if (V.extra) return ctx.no('One more train is enough for this story.');
    if (!['down', 'train'].includes(AT)) return ctx.no(AT === 'clear' || AT === 'raising' ? 'Too late in this story. The line is clear.' : 'In this story the second train comes once the barrier is down.');
    V = { ...V, extra: true, t2: T, due: V.due + 1 }; redraw();
    ctx.say(`A second train trips the detector at ${T} s. It reaches the road at 30 s.`);
  });
  ctx.button('lower barrier', () => {
    if (AT === 'open') return ctx.no('No train is coming. The lights are dark.');
    if (AT === 'warning' && !V.flashed) return ctx.no(`The lights have flashed for ${Math.round(T - 2)} s. Six seconds first, so drivers can stop.`);
    if (AT === 'warning') { ctx.say(SAY.lowering); return go('lowering', 11); }
    return ctx.no(AT === 'raising' ? 'It is going up: the line is clear.' : 'The barrier is down, or coming down, already.');
  });
  ctx.button('raise barrier', () => {
    if (AT === 'clear' && V.due) return ctx.no('A second train is due. The barrier stays down.');
    if (AT === 'clear') { ctx.say(SAY.raising); return go('raising', upAt() + 3); }
    if (AT === 'train') return ctx.no('A train is on the crossing.');
    if (AT === 'lowering' || AT === 'down') return ctx.no('The train has not passed yet.');
    return ctx.no('The barrier is up, or going up, already.');
  });
  ctx.hint('Press Play all, or next step. Try lower barrier too soon, or another train.');
  redraw();

  return {
    goto(id, play) {
      ctx.say(SAY[id]);
      // the run ends where it started: road open, after the barrier is up
      if (play && id === 'open' && AT === 'raising') return go('open', Math.min(SPAN, upAt() + 8), { ...V, flashed: false });
      const v = canon(id), t = CANON[id];
      if (play && t > T && id !== AT) return go(id, t, v);
      V = v; AT = id; T = t; redraw();
    },
    tick(t) {
      const on = Math.floor(t * 2) % 2;
      document.querySelectorAll('#art .lampA').forEach(el => el.setAttribute('opacity', on ? (el.getAttribute('r') === '11' ? '.45' : '1') : '.15'));
      document.querySelectorAll('#art .lampB').forEach(el => el.setAttribute('opacity', on ? '.15' : (el.getAttribute('r') === '11' ? '.45' : '1')));
      const r = $('ring'), b = $('bird');
      if (r) r.setAttribute('opacity', (0.4 + 0.6 * Math.abs(Math.sin(t * 9))).toFixed(2));
      if (b) b.setAttribute('transform', `translate(${n1(((t * 30) % 500) - 200)} ${n1(Math.sin(t * 2) * 6 - ((t * 30) % 500) * 0.25)})`);
    },
    story: STORY,
  };
}
