// A greenhouse through one day: the picture on top, the statechart strip in
// the middle, and the temperature in its three bands at the foot.
const ABOUT = 'which band a changing level is in';
const STORY = ['fine', 'cold', 'heating', 'fine', 'hot', 'venting', 'fine', 'fine'];
const ROW = ['cold', 'heating', 'fine', 'venting', 'hot'];
const NAMES = { cold: 'too cold', heating: 'heating', fine: 'fine', venting: 'venting', hot: 'too hot' };
const NOTES = { cold: 'under 10 °C, 1 h max', heating: 'heater on', fine: '10 to 30 °C', venting: 'vent open', hot: 'over 30 °C, 1 h max' };
const TINT = { cold: '#dfe8f1', heating: '#f6e3d9', fine: '#e3eedf', venting: '#e3ecf3', hot: '#f4ddd6' };
// the weather's push on the temperature in each hour, before heater or vent
const DRIFT = [-1.5, -2.5, -1, -1, -1, 2, 3, 2, 2, 2, 2.5, 1, 0.5, 0, -0.5, -0.5, -1, -1, -1, -0.5, -0.5, -0.5, -0.5, -0.5];
const HEAT = 4, AIR = 5, SEED = 9;
// the day as Play all tells it: each stop and the presses that reach it
const SCRIPT = [
  ['fine', [], 'Midnight, 13 °C and falling. Heater off, vent shut.'],
  ['cold', ['w', 'w'], 'Two in the morning: 9 °C. Too cold for the seedlings.'],
  ['heating', ['heater'], 'The heater goes on. The vent stays shut.'],
  ['fine', ['w', 'w', 'w', 'heater'], 'Five: 18 °C, warm enough. The heater goes off.'],
  ['hot', ['w', 'w', 'w', 'w', 'w', 'w'], 'Eleven: the sun pushes it over 30 °C.'],
  ['venting', ['vent'], 'The vent opens. The heater is off, so no heat is wasted.'],
  ['fine', ['w', 'w', 'w', 'vent'], 'Two in the afternoon: 18 °C. The vent shuts.'],
  ['fine', ['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w'], 'Midnight again: 11.5 °C. A whole day, never two hours out of the band.'],
];

const fresh = () => ({ at: 'fine', h: 0, t: 13, heater: false, vent: false, red: 0, hist: [{ h: 0, t: 13, heater: false, vent: false }] });
let S = fresh(), TV = 0, POS = 0, GHOST = null, TW = null;

const clock = h => `${String(Math.floor(h) % 25).padStart(2, '0')}:${h % 1 ? '30' : '00'}`;
const deg = t => `${n1(t)} °C`;
const band = t => (t < 10 ? 'cold' : t > 30 ? 'hot' : 'fine');
const push = (s, e) => ({ ...s, ...e, hist: [...s.hist, { h: e.h ?? s.h, t: e.t ?? s.t, heater: e.heater ?? s.heater, vent: e.vent ?? s.vent }] });
// the temperature and what is on, at any time of the day drawn so far
function sample(s, tv) {
  const H = s.hist;
  let a = H[0];
  for (const e of H) if (e.h <= tv + 1e-6) a = e;
  const b = H.find(e => e.h > tv + 1e-6);
  const t = b ? a.t + (b.t - a.t) * (tv - a.h) / (b.h - a.h) : a.t;
  return { t, heater: a.heater, vent: a.vent };
}

// one press, as the statechart has it: a new day-state, or { no }
function hour(s) {
  if ((s.at === 'cold' || s.at === 'hot') && s.red >= 1) {
    if (s.at === 'cold') return { no: `A second hour under 10 °C would harm the seedlings. ${s.vent ? 'Shut the vent, then switch the heater on.' : 'Switch the heater on.'}` };
    return { no: `A second hour over 30 °C would scorch the seedlings. ${s.heater ? 'Switch the heater off, then open the vent.' : 'Open the vent.'}` };
  }
  if (s.h + 1 > 24.01) s = { ...s, h: 0, hist: [{ h: 0, t: s.t, heater: s.heater, vent: s.vent }] };
  let n = s.t + DRIFT[Math.floor(s.h) % 24] + (s.heater ? HEAT : 0) - (s.vent ? AIR : 0), nextAt = s.at, red = 0;
  if (nextAt === 'fine') nextAt = band(n);
  else if (nextAt === 'cold') { n = Math.min(n, 9.5); red = s.red + 1; }
  else if (nextAt === 'hot') { n = Math.max(n, 30.5); red = s.red + 1; }
  else if (nextAt === 'heating' && n > 30) nextAt = 'hot';
  else if (nextAt === 'venting' && n < 10) nextAt = 'cold';
  n = Math.round(Math.max(1, Math.min(39, n)) * 2) / 2;
  const say = nextAt === s.at ? `${clock(s.h + 1)}: ${deg(n)}.`
    : nextAt === 'cold' ? `${clock(s.h + 1)}: ${deg(n)}. Night falls: too cold.` : `${clock(s.h + 1)}: ${deg(n)}. The sun comes out: too hot${s.heater ? ', with the heater still on' : ''}.`;
  return { s: push(s, { h: s.h + 1, t: n, at: nextAt, red }), say };
}
function heater(s) {
  switch (s.at) {
    case 'cold': return s.vent ? { no: 'Shut the vent first: the heat would go straight out.' }
      : { s: push(s, { at: 'heating', heater: true, red: 0 }), say: 'The heater goes on. The vent stays shut.' };
    case 'heating': return s.t < 10 ? { no: `Still ${deg(s.t)}. Leave the heater on until it is over 10 °C.` }
      : { s: push(s, { at: 'fine', heater: false }), say: `${deg(s.t)}, warm enough. The heater goes off.` };
    case 'hot': return s.heater ? { s: push(s, { heater: false }), say: 'The heater goes off. Now the vent can open.' } : { no: 'The heater is off already. Open the vent.' };
    case 'venting': return { no: 'The vent is open: the heater and the vent are never on together.' };
    default: return { no: `It is ${deg(s.t)}. The heater is for nights under 10 °C.` };
  }
}
function vent(s) {
  switch (s.at) {
    case 'hot': return s.heater ? { no: 'Switch the heater off first: the heater and the vent are never on together.' }
      : { s: push(s, { at: 'venting', vent: true, red: 0 }), say: 'The vent opens. The hot air goes out.' };
    case 'venting': return s.t > 30 ? { no: `Still ${deg(s.t)}. Keep the vent open until it is under 30 °C.` }
      : { s: push(s, { at: 'fine', vent: false }), say: `${deg(s.t)}. The vent shuts.` };
    case 'cold': return s.vent ? { s: push(s, { vent: false }), say: 'The vent shuts. Now the heater can go on.' } : { no: 'The vent is shut already. Switch the heater on.' };
    case 'heating': return { no: 'The heater is on: the heater and the vent are never on together.' };
    default: return { no: `It is ${deg(s.t)}, fine. The vent opens over 30 °C.` };
  }
}
function wind(s) {
  if (s.at !== 'venting') return { no: s.vent ? 'The cold wind is blowing in already.' : 'The vent is shut, so the cold wind stays outside.' };
  const h = Math.min(24, s.h + 0.5), t = Math.min(s.t - 12, 8);
  return { s: push(s, { h, t, at: 'cold', red: 0 }), say: `A cold wind through the open vent: ${deg(t)} in half an hour.` };
}
const ACT = { w: hour, heater, vent };

// ---- the picture
const dark = h => (h < 5.5 ? 0.85 : h < 7 ? 0.85 * (1 - (h - 5.5) / 1.5) : h < 19 ? 0 : 0.85 * Math.min(1, (h - 19) / 2.5));
const within = (h, a, b) => h >= a && h < b;
const pin = (n, fn) => () => { _seed = n; fn(); };
const CROWD = [
  [-80, -25, [6, 20], { shirt: PAL.sage, pants: PAL.navy, hair: 'bun', arm: 'hold' }],
  [45, -25, [7, 19], { shirt: PAL.mustard, pants: PAL.bark, hair: 'short', look: -1 }],
  [-20, 25, [6, 20], { shirt: PAL.rose, pants: PAL.slate, hair: 'bob', arm: 'out' }],
  [100, 25, [8, 18], { shirt: PAL.sky, pants: PAL.navy, hair: 'cap', look: -1 }],
  [-284, 92, [8, 18], { shirt: '#fffdf6', pants: PAL.navy, hair: 'short', arm: 'hold' }],
  [-284, 160, [9, 17], { shirt: PAL.lilac, pants: PAL.slate, hair: 'long', look: -1 }],
  [-256, 168, [9.5, 16], { shirt: PAL.brick, pants: PAL.navy, hair: 'short' }],
  [-228, 158, [10, 17], { shirt: PAL.butter, pants: PAL.bark, hair: 'bun', look: -1 }],
  [-214, 186, [10, 16], { shirt: PAL.mint, pants: PAL.slate, hair: 'short', kid: true, arm: 'wave' }],
  [-186, 192, [10, 16], { shirt: PAL.red, pants: PAL.navy, hair: 'bob', kid: true }],
  [288, -78, [7, 19], { shirt: PAL.leaf, pants: PAL.bark, hair: 'cap', arm: 'hold', look: -1 }],
  [326, -4, [8, 18], { shirt: PAL.navy, pants: PAL.slate, hair: 'bob' }],
  [262, 170, [8, 18], { shirt: PAL.mustard, pants: PAL.navy, hair: 'short', arm: 'hold' }],
  [-326, -8, [7, 19], { shirt: PAL.blue, pants: PAL.bark, hair: 'long', look: -1 }],
  [0, 130, [8, 18], { shirt: PAL.rose, pants: PAL.navy, hair: 'bun', look: -1 }],
];
const LAMPS = [[-34, 162], [34, 184], [-220, -48]];
const THERMO = [208, 112];
const tz = t => 20 + Math.max(0, Math.min(40, t)) * 1.6;

function lamp(x, y) {
  cyl(x, y, 0, 2.4, 48, PAL.slate, { cap: PAL.slate });
  box(x - 5, y - 5, 48, 10, 10, 7, { left: PAL.slate, top: '#f3ead8', marks: false });
}
function seedlings(x, y, z, col) {
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) {
    const [sx, sy] = P(x + 6 + i * 11, y + 5 + j * 9, z);
    out.push(`<path d="M${n1(sx)} ${n1(sy)}q-5 -6 -1 -9q4 3 1 9q5 -7 7 -4q-2 5 -7 4z" fill="${col}" stroke="${INK}" stroke-width=".6"/>`);
  }
}
function glass(q, op = 0.26) { out.push(`<path d="${pathOf(q, true)}" fill="#d6e6ee" fill-opacity="${op}"/>`); }

// the greenhouse, inside out: back walls, floor and benches, people, front glass, roof
function greenhouse(h, now) {
  const X0 = -180, X1 = 180, Y0 = -80, Y1 = 80, W = 56, R = 100, B = 12;
  const col = now.t < 10 ? '#a9c2d2' : now.t > 30 ? '#c9a85a' : now.t >= 18 && now.t <= 24 ? '#6f9a62' : PAL.leaf;
  const floor = [P(X0, Y0), P(X1, Y0), P(X1, Y1), P(X0, Y1)];
  fill(floor, '#e4dccb'); rim(floor, 1);
  // the back: dwarf walls, glass, the back roof slope
  for (const q of [[P(X0, Y0), P(X1, Y0), P(X1, Y0, B), P(X0, Y0, B)], [P(X0, Y0), P(X0, Y1), P(X0, Y1, B), P(X0, Y0, B)]]) { fill(q, PAL.brick); rim(q, 1); }
  glass([P(X0, Y0, B), P(X1, Y0, B), P(X1, Y0, W), P(X0, Y0, W)]);
  glass([P(X0, Y0, B), P(X0, Y1, B), P(X0, Y1, W), P(X0, 0, R), P(X0, Y0, W)]);
  glass([P(X0, Y0, W), P(X1, Y0, W), P(X1, 0, R), P(X0, 0, R)], 0.18);
  const gz = y => W + (R - W) * (1 - Math.abs(y) / Y1);
  rule([...Array.from({ length: 13 }, (_, k) => [P(X0 + k * 30, Y0, B), P(X0 + k * 30, Y0, W)]),
    ...Array.from({ length: 5 }, (_, k) => [P(X0, Y0 + k * 40, B), P(X0, Y0 + k * 40, gz(Y0 + k * 40))])], INK, 0.7);
  // the heater at the back end, its flue up through the ridge
  box(-176, -18, 0, 18, 36, 30, { left: PAL.slate, top: '#8e96a3', marks: false, ink: 1.2 });
  line([P(-167, 0, 30), P(-167, 0, R + 12)], { w: 4, col: PAL.slate, over: 0, amp: 0 });
  rule([0, 1, 2].map(k => [P(-158, -11 + k * 11, 6), P(-158, -11 + k * 11, 22)]), INK, 0.8);
  // three benches of seed trays, with the growers in the two aisles
  [-50, 0, 50].forEach((yb, b) => {
    box(-150, yb - 10, 0, 300, 20, 22, { left: PAL.wood, top: PAL.tan, marks: false, ink: 1.2 });
    for (let k = 0; k < 5; k++) { box(-147 + k * 59, yb - 9, 22, 56, 18, 3, { left: PAL.bark, top: '#7a5e46', marks: false, ink: 0.8 }); seedlings(-147 + k * 59, yb - 9, 25, col); }
    if (b < 2) CROWD.slice(0, 4).forEach(([x, y, hrs, o], i) => { if (Math.sign(y) === (b ? 1 : -1) && within(h, ...hrs)) pin(60 + i, () => who(x, y, { size: 0.62, ...o }))(); });
    if (b === 1 && !within(h, 6, 20)) pin(70, () => who(-96, 25, { size: 0.62, shirt: PAL.navy, pants: PAL.slate, hair: 'cap', look: -1, arm: now.heater ? 'hold' : 'down' }))();
  });
  // the front: dwarf walls, glass with the door, the gable, the roof and its vents
  const fx = [P(X1, Y0), P(X1, Y1), P(X1, Y1, B), P(X1, Y0, B)], fy = [P(X0, Y1), P(X1, Y1), P(X1, Y1, B), P(X0, Y1, B)];
  for (const q of [fx, fy]) { fill(q, PAL.brick); rim(q, 1.2); }
  glass([P(X1, Y0, B), P(X1, Y1, B), P(X1, Y1, W), P(X1, 0, R), P(X1, Y0, W)]);
  glass([P(X0, Y1, B), P(X1, Y1, B), P(X1, Y1, W), P(X0, Y1, W)]);
  const door = [P(-15, Y1, 0), P(15, Y1, 0), P(15, Y1, 44), P(-15, Y1, 44)];
  fill(door, '#d6e6ee'); rim(door, 1.2);
  rule([...Array.from({ length: 13 }, (_, k) => [P(X0 + k * 30, Y1, B), P(X0 + k * 30, Y1, W)]).filter((_, k) => k !== 6),
    ...Array.from({ length: 5 }, (_, k) => [P(X1, Y0 + k * 40, B), P(X1, Y0 + k * 40, gz(Y0 + k * 40))])], INK, 0.8);
  rim([P(X1, Y0, W), P(X1, 0, R), P(X1, Y1, W)], 1.3);
  const roof = [P(X0, 0, R), P(X1, 0, R), P(X1, Y1, W), P(X0, Y1, W)];
  glass(roof, 0.22);
  rule(Array.from({ length: 13 }, (_, k) => [P(X0 + k * 30, 0, R), P(X0 + k * 30, Y1, W)]), INK, 0.7);
  rim(roof, 1.4);
  line([P(X0, 0, R), P(X1, 0, R)], { w: 2.4, over: 0 });
  line([P(X0, Y1, W), P(X1, Y1, W)], { w: 2, over: 0 });
  // the roof vents: hinged at the ridge, the low edge lifts as they open
  const k = TW ? TW.vent : now.vent ? 1 : 0;
  const zc = R - 26 * (R - W) / Y1;
  for (const vx of [-150, -60, 30, 120]) {
    if (k > 0.05) { const hole = [P(vx, 0, R), P(vx + 30, 0, R), P(vx + 30, 26, zc), P(vx, 26, zc)]; out.push(`<path d="${pathOf(hole, true)}" fill="${LEAD}" fill-opacity="${(0.55 * k).toFixed(2)}"/>`); }
    const yo = 26 * (1 - 0.75 * k), zo = zc + 34 * k;
    const q = [P(vx, 0, R), P(vx + 30, 0, R), P(vx + 30, yo, zo), P(vx, yo, zo)];
    out.push(`<path d="${pathOf(q, true)}" fill="${k > 0.05 ? '#bcd3df' : '#d6e6ee'}" fill-opacity=".9"/>`);
    rim(q, 1.2);
  }
  // warm air out of the open vents
  if (k > 0.5) group('id="air"', () => { for (const vx of [-150, -60, 30, 120]) { const [ax, ay] = P(vx + 15, 14, R + 30); for (const d of [-6, 6]) line([[ax + d, ay], [ax + d + 4, ay - 8], [ax + d, ay - 16], [ax + d + 4, ay - 24]], { w: 1.2, col: PAL.brick, over: 0, curve: true }); } });
}

// the thermometer by the door: the red column is the temperature now
function thermometer(now) {
  const [x, y] = THERMO;
  cyl(x, y, 0, 2, 20, PAL.wood, { cap: PAL.wood });
  const tube = [P(x - 5, y, 18), P(x + 5, y, 18), P(x + 5, y, tz(42)), P(x - 5, y, tz(42))];
  fill(tube, '#fffdf6'); rim(tube, 1);
  const [bx, by] = P(x, y, 16);
  out.push(`<circle cx="${n1(bx)}" cy="${n1(by)}" r="7" fill="${RED}" stroke="${INK}" stroke-width="1"/>`);
  line([P(x, y, 18), P(x, y, tz(now.t))], { w: 3.4, col: RED, over: 0, amp: 0 });
  for (const t of [10, 30]) line([P(x - 7, y, tz(t)), P(x + 7, y, tz(t))], { w: 1.6, col: RED, over: 0, amp: 0 });
}

function garden(h, now) {
  // the path to the door, the back fence, the shed and its corner
  const path = [P(-15, 80), P(15, 80), P(15, 205), P(-15, 205)];
  fill(path, PAL.stone); rim(path, 0.8);
  put(-600, 0, pin(10, () => fence([[-380, -202], [380, -202]], { post: 16, gap: 24 })));
  put(-450, 0, pin(11, () => { gable(-374, -84, 76, 56, 42, 18, { wall: PAL.wood, roof: PAL.slate }); doorL(-352, -28, 0, 16, 28, PAL.bark); faceText('left', -318, -28, 32, 'SHED', { size: 10, cls: 'cap' }); }));
  put(-370, 0, pin(12, () => { box(-284, -140, 0, 46, 18, 18, { left: PAL.wood, top: PAL.tan, marks: false }); for (const k of [0, 1, 2]) pot(-276 + k * 15, -132, 18, k !== 1); }));
  put(-420, 0, pin(13, () => { cyl(-252, -174, 0, 13, 30, PAL.navy, { cap: '#4c6595' }); cat(-252, -174, 30, PAL.mustard); }));
  put(-560, 1, pin(14, () => box(-372, -196, 0, 30, 30, 22, { left: PAL.bark, top: '#6f5440', marks: false })));
  put(-270, 0, pin(15, () => tree(-90, -180, 30)));
  put(-290, 0, pin(16, () => tree(-362, 66, 30, 0, PAL.sage)));
  // the water tower: the tall landmark of the garden
  put(-390, 0, pin(19, () => { for (const [lx, ly] of [[-210, -196], [-190, -196], [-210, -176], [-190, -176]]) line([P(lx, ly, 0), P(lx, ly, 64)], { w: 1.6, over: 0 }); cyl(-200, -186, 64, 16, 30, PAL.slate, { cap: '#c9d6e6' }); }));
  // the potting shed behind the greenhouse
  put(-140, 0, pin(18, () => { gable(60, -192, 70, 40, 34, 14, { wall: PAL.cream, roof: PAL.sage }); doorL(80, -152, 0, 14, 24, PAL.sky); }));
  // the cottage at the back corner
  put(-40, 0, pin(17, () => { gable(238, -200, 104, 54, 42, 22, { wall: PAL.butter, roof: PAL.brick }); windowL(254, -146, 14, 18, 16); doorL(292, -146, 0, 16, 28, PAL.sage); windowL(318, -146, 14, 18, 16); }));
  // the raised beds and the cold frame on the right
  [-122, -48, 26].forEach((yb, i) => put(220 + yb + 20, 0, pin(20 + i, () => {
    box(220, yb, 0, 134, 42, 14, { left: PAL.wood, top: PAL.bark, marks: false, ink: 1.2 });
    for (let k = 0; k < 4; k++) puff(237 + k * 33, yb + 21, 14, { hw: 11, h: 15, col: [PAL.leaf, PAL.sage, PAL.leaf, '#7fa874'][k] });
  })));
  put(400, 0, pin(23, () => { box(280, 112, 0, 62, 42, 14, { left: PAL.wood, top: PAL.bark, marks: false }); const g = [P(280, 112, 22), P(342, 112, 22), P(342, 154, 14), P(280, 154, 14)]; glass(g, 0.5); rim(g, 1.1); }));
  put(THERMO[0] + THERMO[1], 0, pin(27, () => thermometer(now)));
  // the plant stall by the gate, and the seed cabinet
  put(-200, 0, pin(24, () => {
    box(-314, 108, 0, 74, 30, 24, { left: PAL.cream, top: PAL.tan, marks: false });
    const aw = [P(-318, 108, 46), P(-236, 108, 46), P(-236, 122, 38), P(-318, 122, 38)];
    line([P(-316, 122, 0), P(-316, 122, 38)], { w: 1.4, over: 0 }); line([P(-238, 122, 0), P(-238, 122, 38)], { w: 1.4, over: 0 });
    fill(aw, PAL.sage); rim(aw, 1.1);
    rule(Array.from({ length: 8 }, (_, k) => [P(-314 + k * 10, 108, 46), P(-314 + k * 10, 122, 38)]), '#fffdf6', 2.2);
    faceText('left', -277, 138, 12, 'PLANTS', { size: 10, cls: 'cap' });
    for (const k of [0, 1, 2, 3]) pot(-306 + k * 18, 120, 24, true, [PAL.brick, PAL.mustard, PAL.brick, PAL.rose][k]);
  }));
  put(-190, 0, pin(25, () => { box(-376, 104, 0, 30, 60, 22, { left: '#fffdf6', top: '#f3ead8', marks: false }); box(-374, 164, 0, 26, 18, 14, { left: PAL.sky, top: '#fffdf6', marks: false }); }));
  // the van that brings the pots
  put(-150 + 150 + 30, 0, pin(28, () => {
    box(-160, 148, 0, 64, 32, 26, { left: '#fffdf6', top: '#f3ead8', marks: false, ink: 1.4 });
    box(-96, 150, 0, 22, 28, 18, { left: PAL.sage, top: PAL.sage, marks: false, ink: 1.4 });
    const ws = [P(-90, 178, 8), P(-78, 178, 8), P(-78, 178, 15), P(-90, 178, 15)]; fill(ws, PAL.sky); rim(ws, 0.8);
    faceText('left', -128, 180, 10, 'PLANTS', { size: 10, cls: 'cap' });
    for (const wx of [-146, -90]) { const [sx, sy] = P(wx, 180, 0); out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="6" fill="${INK}"/>`); }
  }));
  // the wheelbarrow and the lamps along the path
  put(455, 0, pin(26, () => { const [sx, sy] = P(292, 168); shape([[sx - 18, sy - 14], [sx + 14, sy - 14], [sx + 8, sy], [sx - 12, sy]], PAL.red); out.push(`<circle cx="${n1(sx + 14)}" cy="${n1(sy + 2)}" r="5" fill="${PAL.slate}" stroke="${INK}"/>`); }));
  for (const [i, [x, y]] of LAMPS.entries()) put(x + y, 1, pin(30 + i, () => lamp(x, y)));
  CROWD.slice(4).forEach(([x, y, hrs, o], i) => { if (within(h, ...hrs)) put(x + y + 2, 2, pin(40 + i, () => who(x, y, { size: 0.66, ...o }))); });
}

function picture() {
  const h = TV % 24, now = sample(S, TV), a = dark(h);
  OX = 700; OY = 485;
  // the slab is drawn at 0.8, so the strip and the chart fit under it on one square sheet
  out.push(`<g transform="translate(${OX} ${OY}) scale(.8) translate(${-OX} ${-OY})">`);
  const rr = (1 - 0.6 * a).toFixed(3), gg = (1 - 0.5 * a).toFixed(3), bb = (1 - 0.22 * a).toFixed(3);
  out.push(`<defs><filter id="night" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${rr} 0 0 0 0 0 ${gg} 0 0 0 0 0 ${bb} 0 0 0 0 0 1 0"/></filter></defs>`);
  out.push('<g filter="url(#night)">');
  _seed = 1;
  board(-380, -205, 760, 410, 26, '#dfe5c8', PAL.tan);
  garden(h, now);
  put(0, 0, pin(5, () => greenhouse(h, now)));
  flush();
  out.push('</g>');
  // the two red lines of the thermometer, named where the reader sees them
  for (const [t, w] of [[30, '30 °C: too hot'], [10, '10 °C: too cold']]) {
    const [lx, ly] = P(THERMO[0] + 7, THERMO[1], tz(t));
    _text(lx + 10, ly + 6, w, { size: 19, col: RED, extra: `stroke="${PAPER}" stroke-width="4" paint-order="stroke"` });
  }
  // what the dark cannot dim: the lamps, and the heater's glow
  if (a > 0.2) for (const [x, y] of LAMPS) { const [sx, sy] = P(x, y, 54); out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="15" fill="#f7e3a0" opacity="${(0.3 + 0.4 * a).toFixed(2)}"/><circle cx="${n1(sx)}" cy="${n1(sy)}" r="4" fill="#fff4c8"/>`); }
  const hk = TW ? TW.heater : now.heater ? 1 : 0;
  if (hk > 0.02) group(`id="glow" opacity="${hk.toFixed(2)}"`, () => {
    const [gx, gy] = P(-158, 0, 15);
    out.push(`<circle cx="${n1(gx)}" cy="${n1(gy)}" r="22" fill="#f2a493" opacity=".45"/><circle cx="${n1(gx)}" cy="${n1(gy)}" r="7" fill="${RED}"/>`);
    group('id="waves"', () => { for (const d of [-10, 0, 10]) line([[gx + d, gy - 16], [gx + d + 4, gy - 24], [gx + d, gy - 32], [gx + d + 4, gy - 40]], { w: 1.2, col: RED, over: 0, curve: true }); });
  });
  _seed = 6;
  for (const [i, [x, y, z]] of [[-200, -60, 170], [120, -150, 200], [-40, 120, 150]].entries()) group(`id="bird${i}"`, () => bird(x, y, z, '#fffdf6'));
  out.push('</g>');
  // the sky corner: the sun by day, the moon by night
  const day = h >= 6 && h < 20, u = day ? (h - 6) / 14 : (((h - 20) % 24) + 24) % 24 / 10, sx = 1140 + u * 180, sy = 300 - Math.sin(Math.PI * Math.min(1, u)) * 60;
  dash([1140, 300], [1320, 300], MUTE, 3, 5, 0.8);
  if (day) { for (let r = 0; r < 8; r++) { const q = r / 8 * 2 * Math.PI; line([[sx + Math.cos(q) * 17, sy + Math.sin(q) * 17], [sx + Math.cos(q) * 23, sy + Math.sin(q) * 23]], { w: 1.2, over: 0 }); } shape(oval(sx, sy, 12, 12, 24), PAL.mustard); }
  else { shape(oval(sx, sy, 12, 12, 24), PAL.butter); out.push(`<path d="${pathOf(oval(sx + 6, sy - 4, 10, 10, 24), true)}" fill="${PAPER}"/>`); }
}

// ---- the statechart strip
const BW = 170, BT = 830, BH = 56;
const BX = ROW.map((_, i) => 72 + BW / 2 + i * (BW + (1256 - 5 * BW) / 4));
const cx = id => BX[ROW.indexOf(id)];
function ring(x) { litRing([[x - BW / 2 - 6, BT - 6], [x + BW / 2 + 6, BT - 6], [x + BW / 2 + 6, BT + BH + 6], [x - BW / 2 - 6, BT + BH + 6]]); }
function strip() {
  _text(72, 772, 'THE GREENHOUSE', { cls: 'cap', size: 16, col: LEAD, extra: 'letter-spacing="2"' });
  const arr = (pts, lbl, lx, ly, guard, gy) => {
    flowArrow(pts, { col: INK, w: 1.2 });
    if (lbl) _text(lx, ly, lbl, { size: 15, anchor: 'middle' });
    if (guard) _text(lx, gy, guard, { size: 12, col: RED, anchor: 'middle' });
  };
  const gap = i => (BX[i] + BX[i + 1]) / 2, L = x => x - BW / 2, Rt = x => x + BW / 2;
  // next door: the heater and the vent, each with its guard in red
  arr([[Rt(BX[0]) + 4, BT + 30], [L(BX[1]) - 4, BT + 30]], 'heater on', gap(0), BT + 20, '[vent is shut]', BT - 12);
  arr([[Rt(BX[1]) + 4, BT + 30], [L(BX[2]) - 4, BT + 30]], 'heater off', gap(1), BT + 20);
  arr([[L(BX[3]) - 4, BT + 30], [Rt(BX[2]) + 4, BT + 30]], 'shut vent', gap(2), BT + 20);
  arr([[L(BX[4]) - 4, BT + 30], [Rt(BX[3]) + 4, BT + 30]], 'open vent', gap(3), BT + 20, '[heater is off]', BT - 12);
  // the long ways: the weather pushes it out of fine
  const B = BT + BH;
  arr([[BX[2] - 40, B + 2], [BX[2] - 40, B + 26], [BX[0] + 20, B + 26], [BX[0] + 20, B + 4]], 'night falls', BX[1], B + 44);
  arr([[BX[2] + 40, B + 2], [BX[2] + 40, B + 26], [BX[4] - 20, B + 26], [BX[4] - 20, B + 4]], 'sun comes out', (BX[3] + BX[4]) / 2 + 10, B + 44);
  arr([[BX[3] + 20, B + 2], [BX[3] + 20, B + 58], [BX[0] - 30, B + 58], [BX[0] - 30, B + 4]], 'night falls, or a cold wind (vent still open)', BX[2] - 60, B + 76);
  arr([[BX[1] + 40, BT - 2], [BX[1] + 40, BT - 40], [BX[4] - 40, BT - 40], [BX[4] - 40, BT - 4]], 'sun comes out, heater still on', (BX[1] + BX[4]) / 2, BT - 48);
  // the start
  out.push(`<circle cx="${BX[2] - 74}" cy="${BT - 22}" r="5" fill="${INK}"/>`);
  flowArrow([[BX[2] - 70, BT - 18], [BX[2] - 58, BT - 3]], { col: INK, w: 1.2 });
  ROW.forEach(id => group(`data-state="${id}"`, () => {
    const x = cx(id), q = [[x - BW / 2, BT], [x + BW / 2, BT], [x + BW / 2, BT + BH], [x - BW / 2, BT + BH]];
    out.push(`<rect x="${x - BW / 2 + 3}" y="${BT + 3}" width="${BW}" height="${BH}" rx="8" fill="#c9bfae"/>`);
    out.push(`<rect x="${x - BW / 2}" y="${BT}" width="${BW}" height="${BH}" rx="8" fill="${TINT[id]}"/>`);
    rim(q, 1.1);
    _text(x, BT + 25, NAMES[id], { size: 20, anchor: 'middle' });
    _text(x, BT + 45, NOTES[id], { size: 12, col: LEAD, anchor: 'middle' });
    out.push('<g class="on">'); ring(x); nowTag(x, BT - 8); out.push('</g>');
  }));
  if (GHOST) group('id="ghost"', () => ring(GHOST));
}

// ---- the band chart
const X0 = 170, X1 = 1290, CT = 985, CB = 1185;
const xh = h => X0 + h / 24 * (X1 - X0), yt = t => CB - t * (CB - CT) / 40;
function chart() {
  const now = sample(S, TV);
  const bandRect = (t0, t1, c) => out.push(`<rect x="${X0}" y="${n1(yt(t1))}" width="${X1 - X0}" height="${n1(yt(t0) - yt(t1))}" fill="${c}"/>`);
  bandRect(0, 10, '#dbe6f0'); bandRect(10, 30, '#e2eddc'); bandRect(30, 40, '#f3dcd4');
  for (const [a, b] of [[0, 6], [20, 24]]) out.push(`<rect x="${n1(xh(a))}" y="${CT}" width="${n1(xh(b) - xh(a))}" height="${CB - CT}" fill="#5f7db5" fill-opacity=".08"/>`);
  for (let h = 3; h < 24; h += 3) out.push(`<line x1="${n1(xh(h))}" y1="${CT}" x2="${n1(xh(h))}" y2="${CB}" stroke="#d8d0c2" stroke-width="1"/>`);
  // the lines between the bands, and the best range inside fine
  dash([X0, yt(10)], [X1, yt(10)], RED, 9, 6, 1.4);
  dash([X0, yt(30)], [X1, yt(30)], RED, 9, 6, 1.4);
  for (const t of [18, 24]) out.push(`<line x1="${X0}" y1="${n1(yt(t))}" x2="${X1}" y2="${n1(yt(t))}" stroke="${PAL.leaf}" stroke-width="1.4" stroke-dasharray="2 4"/>`);
  _text(X1 - 8, yt(30) - 7, 'too hot: over 30 °C', { size: 15, col: RED, anchor: 'end' });
  _text(X1 - 8, yt(10) + 19, 'too cold: under 10 °C', { size: 15, col: RED, anchor: 'end' });
  _text(X1 - 8, yt(24) - 7, 'best for seedlings: under 24 °C', { size: 14, col: '#5d7f52', anchor: 'end' });
  _text(X1 - 8, yt(18) + 17, 'and over 18 °C', { size: 14, col: '#5d7f52', anchor: 'end' });
  for (const [t, w] of [[34, 'TOO HOT'], [26, 'FINE'], [4, 'TOO COLD']]) _text(X0 + 12, yt(t) + 5, w, { cls: 'cap', size: 15, col: LEAD, extra: 'letter-spacing="1.5"' });
  for (const [h, w] of [[3, 'NIGHT'], [5, 'EARLY'], [6.8, 'DAWN'], [9.5, 'MORNING'], [12.5, 'MIDDAY'], [16, 'AFTERNOON'], [19.5, 'EVENING'], [22.5, 'NIGHT']]) _text(xh(h), CT + 20, w, { cls: 'cap', size: 13, col: MUTE, anchor: 'middle', extra: 'letter-spacing="1.5"' });
  // the axes
  line([[X0, CT - 14], [X0, CB]], { w: 1.2, col: LEAD, over: 0 });
  line([[X0, CB], [X1 + 14, CB]], { w: 1.2, col: LEAD, over: 0 });
  for (let t = 0; t <= 40; t += 5) _text(X0 - 12, yt(t) + 5, String(t), { size: 15, col: LEAD, anchor: 'end' });
  _text(X0 - 12, CT - 22, '°C', { size: 15, col: LEAD, anchor: 'end' });
  rule(Array.from({ length: 25 }, (_, h) => [[xh(h), CB], [xh(h), CB + (h % 3 ? 4 : 8)]]), LEAD, 0.9);
  for (let h = 0; h <= 24; h += 3) _text(xh(h), CB + 26, clock(h), { size: 15, col: LEAD, anchor: 'middle' });
  // the heater and the vent, one bar for each stretch they were on
  for (const [k, key, c, w] of [[0, 'heater', PAL.brick, 'heater'], [1, 'vent', PAL.navy, 'vent']]) {
    const y = CB + 80 + k * 24;
    _text(X0 - 12, y + 5, w, { size: 15, col: LEAD, anchor: 'end' });
    out.push(`<line x1="${X0}" y1="${y}" x2="${X1}" y2="${y}" stroke="#d8d0c2" stroke-width="1" stroke-dasharray="2 4"/>`);
    S.hist.forEach((e, i) => {
      const nx = S.hist[i + 1], end = Math.min(nx ? nx.h : e.h, TV);
      if (e[key] && end > e.h) out.push(`<rect x="${n1(xh(e.h))}" y="${y - 6}" width="${n1(xh(end) - xh(e.h))}" height="12" rx="4" fill="${c}"/>`);
    });
  }
  // the curve: what happened, solid; the next six hours if nobody acts, dotted
  const pts = S.hist.filter(e => e.h <= TV + 1e-6).map(e => [xh(e.h), yt(e.t)]);
  pts.push([xh(TV), yt(now.t)]);
  if (pts.length > 1) out.push(`<path d="${pathOf(pts)}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`);
  if (!GHOST && TV >= S.h - 1e-6) {
    const ahead = [[xh(S.h), yt(S.t)]];
    let t = S.t;
    for (let h = Math.floor(S.h); h < Math.min(24, Math.floor(S.h) + 6); h++) { t = Math.max(1, Math.min(39, t + DRIFT[h] + (S.heater ? HEAT : 0) - (S.vent ? AIR : 0))); ahead.push([xh(h + 1), yt(t)]); }
    if (ahead.length > 1) out.push(`<path d="${pathOf(ahead)}" fill="none" stroke="${MUTE}" stroke-width="1.8" stroke-dasharray="2 5" stroke-linecap="round"/>`);
  }
  // the time now
  group('id="nowline"', () => {
    const x = xh(TV), lbl = clock(Math.round(TV * 2) / 2), w = textW(lbl, 15) + 22;
    out.push(`<line x1="${n1(x)}" y1="${CT}" x2="${n1(x)}" y2="${CB}" stroke="${RED}" stroke-width="1.6"/>`);
    out.push(`<circle cx="${n1(x)}" cy="${n1(yt(now.t))}" r="8" fill="${RED}" stroke="${INK}" stroke-width="1.2"/>`);
    out.push(`<rect x="${n1(x - w / 2)}" y="${CB + 36}" width="${n1(w)}" height="24" rx="12" fill="${RED}"/>`);
    _text(x, CB + 53, lbl, { size: 15, col: PAPER, anchor: 'middle' });
  });
}

function draw(seed) {
  begin(seed);
  picture();
  strip();
  chart();
  title('a band chart', 'One greenhouse');
  subtitle('a day of temperature, in three bands');
  const now = sample(S, TV);
  status(NAMES[S.at], `${clock(Math.round(TV * 2) / 2)} · ${deg(now.t)}`);
  footnote('Illustrative: made-up temperatures. Seedlings differ; many growers keep them between 18 and 24 °C.');
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { GHOST = null; TW = null; TV = S.h; draw(SEED); ctx.state(S.at); };
  const dim = () => document.querySelectorAll('#art [data-state]').forEach(el => el.classList.remove('lit'));
  let job = null;
  // a move: time runs hour by hour, the red ring glides along the strip, the vent swings
  const move = (s2, say) => {
    if (job) job.finish();
    const s1 = S, h0 = TV, x0 = cx(s1.at), x1 = cx(s2.at), v0 = s1.vent ? 1 : 0, v1 = s2.vent ? 1 : 0, k0 = s1.heater ? 1 : 0, k1 = s2.heater ? 1 : 0;
    S = s2; ctx.say(say);
    const hrs = s2.h >= h0 ? s2.h - h0 : s2.h;
    if (ctx.still || (hrs < 0.01 && x0 === x1 && v0 === v1 && k0 === k1)) return redraw();
    const ms = Math.min(3200, 900 + hrs * 380);
    const from = s2.h >= h0 ? h0 : 0;
    let drawn = 0, gx = 0;
    // A whole redraw takes longer than a 60 Hz frame: the sheet is redrawn at
    // most 30 times a second, and the ring glides along the strip on every frame.
    job = tween(ctx, ms, e => {
      const now = performance.now();
      TV = from + (s2.h - from) * e;
      GHOST = x0 + (x1 - x0) * e;
      TW = { vent: v0 + (v1 - v0) * e, heater: k0 + (k1 - k0) * e };
      if (now - drawn > 30) { draw(SEED); dim(); drawn = now; gx = GHOST; }
      else { const g = $('ghost'); if (g) g.setAttribute('transform', `translate(${n1(GHOST - gx)} 0)`); }
    }, redraw);
  };
  const press = fn => () => { const r = fn(S); if (r.no) return ctx.no(r.no); POS = -1; move(r.s, r.say); };
  ctx.button('wait an hour', press(hour));
  ctx.button('heater on / off', press(heater));
  ctx.button('vent open / shut', press(vent));
  ctx.button('cold wind', press(wind));
  ctx.hint('Press Play all, or wait an hour. Try the vent with the heater on.');
  // the scripted day up to stop i, with no motion
  const replay = i => { let s = fresh(); for (let k = 1; k <= i; k++) for (const a of SCRIPT[k][1]) s = ACT[a](s).s; return s; };
  redraw();

  return {
    goto(id, play) {
      const next = POS >= 0 ? SCRIPT[POS + 1] : null;
      if (play && next && next[0] === id) {
        let s = S;
        for (const a of next[1]) s = ACT[a](s).s;
        POS++;
        return move(s, next[2]);
      }
      const i = SCRIPT.findIndex(([sid]) => sid === id);
      if (job) job.finish();
      S = replay(i); POS = i; redraw(); ctx.say(SCRIPT[i][2]);
    },
    tick(t) {
      [[-1, 34, 0], [1, 26, 2], [-1, 30, 4]].forEach(([dir, sp, ph], i) => {
        const b = $(`bird${i}`), u = ((t * sp + ph * 90) % 600);
        if (b) b.setAttribute('transform', `translate(${n1(dir * (u - 300))} ${n1(Math.sin(t * 2 + ph) * 6 - u * 0.08)})`);
      });
      const w = $('waves');
      if (w) w.setAttribute('transform', `translate(0 ${n1(-((t * 14) % 10))})`);
      const air = $('air');
      if (air) air.setAttribute('transform', `translate(0 ${n1(-((t * 12) % 10))})`);
      const g = $('glow');
      if (g && !TW) g.setAttribute('opacity', (0.75 + 0.25 * Math.sin(t * 5)).toFixed(2));
    },
    story: STORY,
  };
}
