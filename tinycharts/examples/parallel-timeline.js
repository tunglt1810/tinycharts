// Three children and a dad, one bathroom, one door at eight: a lane for each
// of them on one clock. A red line sweeps the morning, and the children walk on it.
const ABOUT = 'jobs that run at once, and meet on time';
const VERB = { asleep: 'sleeps', bath: 'washes', dress: 'dresses', eat: 'eats', shoes: 'finds shoes', wait: 'waits', out: 'is out' };
const PLURAL = { asleep: 'sleep', bath: 'wash', dress: 'dress', eat: 'eat', shoes: 'find shoes', wait: 'wait', out: 'are out' };
const KIND = {
  asleep: [PAL.lilac, 'asleep'], bath: [PAL.sky, 'in the bathroom'], dress: [PAL.mustard, 'getting dressed'],
  eat: [PAL.sage, 'breakfast'], shoes: [PAL.rose, 'shoes and coat'], wait: [PAL.sand, 'ready, waiting'], out: [PAL.stone, 'gone'],
};
const KIDS = [
  ['Dad', -150, { shirt: PAL.sage, hair: 'short', kid: false }],
  ['Mia', -70, { shirt: PAL.rose, hair: 'bun' }], ['Leo', 10, { shirt: PAL.sky, hair: 'short' }], ['Sam', 90, { shirt: PAL.mustard, hair: 'cap' }],
];
const NAMES = { alarm: 'the alarm', mia_wash: 'Mia in the bathroom', leo_wash: 'Leo in the bathroom', sam_wash: 'Sam in the bathroom', breakfast: 'breakfast', shoes: 'shoes and coats', out: 'out of the door' };
const STORY = ['alarm', 'mia_wash', 'leo_wash', 'sam_wash', 'breakfast', 'shoes', 'out'];
const AXIS = 70, X = m => -420 + m * 12;
let AT = 'alarm', T = 0;
let V = { late: false, shoes: false };

const end = () => (V.late ? 66 : 60);
const timeOf = id => ({ alarm: 0, mia_wash: 5, leo_wash: 15, sam_wash: V.late ? 33 : 25, breakfast: 35, shoes: 50, out: end() }[id]);
const clock = m => `${7 + Math.floor(m / 60)}:${String(Math.round(m) % 60).padStart(2, '0')}`;
// each child's morning: [kind, from, to] in minutes after seven
function plan() {
  const E = end(), s = V.late
    ? [['asleep', 0, 33], ['bath', 33, 43], ['dress', 43, 50], ['eat', 50, 58], ['shoes', 58, 66]]
    : [['asleep', 0, 25], ['bath', 25, 35], ['dress', 35, 42], ['eat', 42, 50], ['shoes', 50, 58], ['wait', 58, 60]];
  return [
    [['dress', 0, 15], ['eat', 15, 50], ['shoes', 50, 55], ['wait', 55, E], ['out', E, AXIS]],
    [['asleep', 0, 5], ['bath', 5, 15], ['dress', 15, 25], ['wait', 25, 35], ['eat', 35, 50], ['shoes', 50, 55], ['wait', 55, E], ['out', E, AXIS]],
    [['asleep', 0, 15], ['bath', 15, 25], ['dress', 25, 35], ['eat', 35, 50], ['shoes', 50, 56], ['wait', 56, E], ['out', E, AXIS]],
    [...s, ['out', E, AXIS]],
  ];
}
const doing = (k, m) => (plan()[k].find(([, a, b]) => m >= a && m < b) || ['out'])[0];

function lanes() {
  plan().forEach((segs, k) => {
    const y = KIDS[k][1];
    tape(X(0), y, X(AXIS) - X(0), segs.map(([kind, a, b]) => ({ sec: b - a, col: KIND[kind][0] })), { w: 64 });
    // a small prop in the middle of each stretch
    for (const [kind, a, b] of segs) {
      const m = X((a + b) / 2);
      if (b - a < 5) continue;
      if (kind === 'asleep') { box(X(0) + 6, y - 22, 4, 40, 44, 12, { left: PAL.wood, top: '#fffdf6', marks: false }); box(X(0) + 8, y - 18, 16, 12, 36, 6, { left: PAL.lilac, top: '#f6f1fb', marks: false }); }
      else if (kind === 'bath') cyl(m, y + 18, 4, 6, 14, PAL.blue, { cap: '#dfeaf3' });
      else if (kind === 'dress') { box(m - 8, y + 12, 4, 16, 16, 18, { left: PAL.wood, marks: false }); box(m - 8, y + 12, 22, 16, 4, 16, { left: PAL.wood, marks: false }); }
      else if (kind === 'eat') turn(m, y + 18, 4, [[6, 0], [10, 7]], PAL.cream, { wall: 1.2, sink: 2, cap: '#e7cf9c' });
      else if (kind === 'shoes') for (const d of [0, 12]) box(m - 6 + d, y + 14, 4, 8, 14, 6, { left: PAL.brick, marks: false });
      else if (kind === 'wait') box(m - 8, y + 14, 4, 16, 12, 4, { left: PAL.navy, top: PAL.sky, marks: false });
    }
  });
}

function sweepLine() {
  const x = X(T);
  group('id="sweep"', () => {
    line([P(x, -190, 2), P(x, 110, 2)], { w: 2.4, col: RED, over: 0 });
    const [sx, sy] = P(x, -190, 2); line([[sx, sy], [sx, sy - 40]], { w: 2, col: RED, over: 0 });
    shape([[sx, sy - 40], [sx + 18, sy - 34], [sx, sy - 28]], RED, { w: 0.9 });
    KIDS.forEach(([name, y, look], k) => {
      const d = doing(k, T);
      if (d === 'asleep' || d === 'out') return;
      who(x + 10, y, { pants: PAL.navy, kid: true, ...look, arm: d === 'eat' ? 'hold' : d === 'shoes' ? 'down' : d === 'wait' ? 'wave' : 'out', look: 1 });
    });
  });
}

function marks() {
  STORY.forEach((id, i) => {
    const [sx, sy] = P(X(timeOf(id)), 214);
    group(`data-state="${id}"`, () => {
      out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="10" fill="#fffdf6" stroke="${INK}" stroke-width="1.1"/>`);
      _text(sx, sy + 5, String(i + 1), { size: 13, anchor: 'middle' });
      const ly = 1046 + i * 26;
      _text(916, ly, `${i + 1}`, { size: 15, col: MUTE });
      _text(940, ly, `${clock(timeOf(id))}  ${NAMES[id]}`, { size: 17, col: LEAD });
      out.push('<g class="on">');
      out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="10" fill="${RED}"/>`);
      _text(sx, sy + 5, String(i + 1), { size: 13, col: PAPER, anchor: 'middle' });
      nowTag(sx, sy - 16);
      _text(916, ly, `${i + 1}`, { size: 15, col: RED });
      _text(940, ly, `${clock(timeOf(id))}  ${NAMES[id]}`, { size: 17 });
      out.push('</g>');
    });
  });
  _text(916, 1016, 'the morning, in order', { cls: 'cap', size: 16 });
}

// the last ten minutes, four times wider: one bar row for each child
function inset() {
  const E = end(), x0 = 160, w = 380, y0 = 1036, at = m => x0 + (m - (E - 10)) / 10 * w;
  _text(72, 1006, `the last ten minutes, ${Math.round(w / 10 / (12 * C))}× wider`, { size: 17, col: RED });
  plan().forEach((segs, k) => {
    const y = y0 + k * 28;
    _text(72, y + 15, KIDS[k][0], { size: 16 });
    for (const [kind, a, b] of segs) {
      const p = Math.max(a, E - 10), q = Math.min(b, E);
      if (q <= p) continue;
      const r = [[at(p), y], [at(q), y], [at(q), y + 20], [at(p), y + 20]];
      flat(r, KIND[kind][0]); rim(r, 0.8);
    }
  });
  line([[at(E), y0 - 8], [at(E), y0 + 116]], { w: 2, col: RED, over: 0 });
  for (const m of [E - 10, E - 5, E]) _text(at(m), y0 + 140, clock(m), { size: 14, col: LEAD, anchor: 'middle' });
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 640;
  board(-480, -240, 960, 430, 16, '#efe9da', PAL.tan);
  // the axis along the front edge
  line([P(X(0), 196), P(X(AXIS), 196)], { w: 1.2, col: LEAD, over: 0 });
  for (let m = 0; m <= AXIS; m += 10) { const [sx, sy] = P(X(m), 196); line([[sx, sy], [sx, sy + 7]], { w: 1, col: LEAD, over: 0 }); _text(sx - 14, sy + 30, clock(m), { size: 14, col: LEAD, anchor: 'end' }); }
  // behind the lanes: the one bathroom, and dashed lines to each turn in it
  put(-600, 0, () => {
    box(-330, -236, 0, 210, 44, 78, { left: PAL.cream, top: PAL.stone, marks: false });
    doorL(-250, -192, 0, 30, 56, PAL.sky);
    faceText('left', -290, -192, 60, 'BATHROOM', { size: 11 });
  });
  put(-500, 0, () => lanes());
  for (const [k, segs] of plan().entries()) for (const [kind, a, b] of segs) if (kind === 'bath') dash(P(-235, -192, 0), P(X((a + b) / 2), KIDS[k][1] - 32, 0), '#7f9db3', 4, 5, 1);
  // the table, the door, and who waits at it
  put(150, 0, () => {
    box(X(35), 126, 0, X(50) - X(35), 54, 26, { left: PAL.wood, top: PAL.tan, marks: false });
    for (const d of [30, 90, 150]) turn(X(35) + d, 153, 26, [[7, 0], [11, 7]], PAL.cream, { wall: 1.2, sink: 2, cap: '#e7cf9c' });
  });
  put(400, 0, () => {
    box(436, -200, 0, 14, 300, 132, { left: PAL.wood, top: PAL.bark, marks: false });
    doorR(450, -120, 0, 60, 110, PAL.red);
    faceText('right', 450, 50, 100, 'OUT BY 8:00', { size: 12 });
  });
  put(560, 0, () => { who(410, 150, { shirt: PAL.sage, pants: PAL.bark, hair: 'long', arm: 'wave', look: -1, say: 'Shoes! Coats! Bags!' }); dog(360, 170, 0); });
  put(-700, 0, () => cat(-150, -250, 78));
  flush();
  sweepLine();
  marks();
  inset();
  group('id="clock"', () => dial(1250, 300, 44, 7 * 60 + T));

  title('a parallel timeline', 'Out of the door by eight');
  subtitle('three children and a dad, one bathroom, one door');
  // children doing the same thing share one verb, so the line stays short
  const by = {};
  KIDS.slice(1).forEach(([n], j) => (by[doing(j + 1, T)] ||= []).push(n));
  const who3 = Object.entries(by).map(([d, ns]) => ns.length > 1 ? `${ns.join(' and ').replace(/ and (?=.* and )/, ', ')} ${PLURAL[d]}` : `${ns[0]} ${VERB[d]}`).join(' · ');
  status(`${clock(T)}${V.late ? ', running late' : ''}`, who3);
  label(72, 252, 'Dad', 'washed before seven', [X(0), -150, 10]);
  label(72, 312, 'Mia', 'first child in', [X(0), -70, 10]);
  label(72, 372, 'Leo', 'second call', [X(0), 10, 10]);
  label(72, 432, 'Sam', 'asleep till 7:25', [X(0), 90, 10]);
  label(1328, 430, 'the bathroom', 'one at a time, ten minutes each', [-225, -214, 78], 'end');
  label(1328, 900, 'the door', 'all four, or nobody', [443, 60, 120], 'end');
  legend(Object.entries(KIND).filter(([k]) => k !== 'out').map(([, [col, text]]) => ({ col, text })), 72, 1240);
  footnote('Illustrative: one made-up family. Each turn in the bathroom takes ten minutes. A snooze costs eight.');
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(9); ctx.state(AT); };
  const go = (to, t, change = () => {}) => {
    const from = T;
    glide(ctx, $('sweep'), [X(from), 0, 0], [X(t), 0, 0], { arc: 0, ms: Math.max(1400, Math.abs(t - from) * 140), clock: [$('clock'), 7 * 60 + from, 7 * 60 + t], then: () => { change(); AT = to; T = t; redraw(); } });
  };
  const NEXT = { alarm: 'mia_wash', mia_wash: 'leo_wash', leo_wash: 'sam_wash', sam_wash: 'breakfast', breakfast: 'shoes' };
  const SAY = {
    mia_wash: 'Mia is up first and takes the bathroom.', leo_wash: 'Mia out, Leo in.', sam_wash: 'Leo out, Sam in at last.',
    breakfast: 'Breakfast for whoever is dressed.', shoes: 'Shoes, coats and bags by the door.',
  };

  ctx.button('next step', () => {
    if (AT === 'out') return ctx.no('They are gone. Play all starts the morning again.');
    if (AT === 'shoes') {
      if (V.shoes) return ctx.no('Everyone is ready. Press leave.');
      ctx.say('Sam is still looking for one shoe. Everyone waits.');
      return go('shoes', 58, () => { V.shoes = true; });
    }
    const to = NEXT[AT];
    ctx.say(SAY[to]);
    go(to, timeOf(to), () => { if (to === 'shoes') V.shoes = !V.late; });
  });
  ctx.button('snooze', () => {
    if (AT !== 'alarm') return ctx.no('Too late for that. Sam is up.');
    if (V.late) return ctx.no('One snooze only. The next alarm is a parent.');
    V.late = true; redraw();
    ctx.say('Sam hits snooze. Everything Sam does now comes eight minutes later.');
  });
  ctx.button('Sam goes in now', () => {
    if (['mia_wash', 'leo_wash'].includes(AT)) return ctx.no(`${AT === 'mia_wash' ? 'Mia' : 'Leo'} is in the bathroom. One at a time.`);
    return ctx.no(AT === 'alarm' ? 'Mia has the first turn. Sam is asleep.' : 'Sam has had his turn.');
  });
  ctx.button('leave', () => {
    if (AT === 'out') return ctx.no('They are already gone.');
    if (AT !== 'shoes') return ctx.no('Not yet. Nobody has shoes on.');
    if (!V.shoes) return ctx.no('Sam has no shoes on. Nobody goes without the others.');
    ctx.say(V.late ? 'Out at last, six minutes late. Run!' : 'Out of the door at eight. On time.');
    go('out', end());
  });
  ctx.hint('Press Play all, or next step. Try snooze first.');
  redraw();

  return {
    goto(id, play) {
      if (id === 'alarm') V = { late: false, shoes: false };
      if (id === 'out') V.shoes = true;
      if (id === 'shoes') V.shoes = !V.late;
      ctx.say(NAMES[id] + '.');
      if (play && id !== AT) go(id, timeOf(id));
      else { AT = id; T = timeOf(id); redraw(); }
    },
    story: STORY,
  };
}
