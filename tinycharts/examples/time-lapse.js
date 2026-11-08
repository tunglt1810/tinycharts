// A beach from dawn to night: one slab, eight spots, an hour slider. Each
// spot reads its state from the hour; the slider fires the statechart.
const ABOUT = 'one place, changing through the day';
// stop: state, hour, the word on its pill
const STOPS = [['dawn', 6, 'dawn'], ['morning', 9, 'morning'], ['noon', 12, 'noon'], ['afternoon', 15, 'afternoon'], ['sunset', 18, 'sunset'], ['dusk', 20.5, 'dusk'], ['night', 23, 'night']];
const HOUR = { dawn: 6, morning: 9, noon: 12, rip: 13.5, afternoon: 15, sunset: 18, dusk: 20.5, night: 23 };
const ORD = { dawn: 0, morning: 1, noon: 2, rip: 2.5, afternoon: 3, sunset: 4, dusk: 5, night: 6 };
const NAMES = { dawn: 'dawn', morning: 'morning', noon: 'noon', rip: 'rip current', afternoon: 'afternoon', sunset: 'sunset', dusk: 'dusk', night: 'night' };
const SAY = {
  dawn: 'Six. The fishing boat comes in. A jogger and a dog have the sand.',
  morning: 'Nine. The lifeguard climbs the tower. Sunbeds out, surf lessons on.',
  noon: 'Noon. The busiest hour: a queue for ices, every sunbed taken.',
  rip: 'Half past one. A rip current: whistles, everyone out, red flag up.',
  afternoon: 'Three. The tide comes up the sand. Volleyball, castles, more ices.',
  sunset: 'Six. The lifeguard goes off duty. The sun goes down over the sea.',
  dusk: 'Half past eight. High tide. The lamps come on, the bar fills up.',
  night: 'Eleven. The bar, the lamps, and the boat going out.',
};
const TX0 = 330, TX1 = 1090, TY = 1240, SEED = 5;
let AT = 'dawn', H = 6, PREVIEW = false;
let V = { red: false, swim: false, beds: false };

const hx = h => TX0 + (Math.max(5, Math.min(24, h)) - 5) / 19 * (TX1 - TX0);
const clock = h => { h = ((h % 24) + 24) % 24; return `${Math.floor(h)}:${String(Math.round(h % 1 * 60)).padStart(2, '0')}`; };
const within = (h, ...r) => { for (let i = 0; i < r.length; i += 2) if (h >= r[i] && h < r[i + 1]) return true; return false; };
const ramp = (h, a, b) => Math.max(0, Math.min(1, (h - a) / (b - a)));
// how dark, and how warm, the light is at an hour
const dark = h => (h < 5.5 ? 0.9 : h < 7 ? 0.9 * (1 - ramp(h, 5.5, 7)) : h < 19 ? 0 : 0.9 * ramp(h, 19, 21.5));
const warm = h => Math.max(0, 1 - Math.abs(h - 18.4) / 1.8) + Math.max(0, 0.5 - Math.abs(h - 6.2) / 1.6);
// one slow rise a day, for the picture: low at nine, high by half past eight
const tide = h => (h < 9 ? 0.7 * (1 - ramp(h, 5, 9)) : ramp(h, 9, 20.5) ** 2);
const shore = h => 50 - 70 * tide(h);
const boatIn = h => (h < 5 ? 0 : h < 6 ? h - 5 : h < 22 ? 1 : h < 23 ? 23 - h : 0);
const lampsOn = h => h < 6.5 || h >= 20;
const SPOTS = h => ({
  surf: within(h, 8, 12.5), ices: within(h, 10, 19), bar: within(h, 17, 25) || h < 1, guard: within(h, 9, 18),
});
// a spot drawn with a fixed seed keeps its hand-drawn wobble whatever else the hour adds
const pin = (n, fn) => () => { _seed = n; fn(); };

// the crowd: where each one stands, and the hours they are there
const CROWD = [
  [355, 40, 6, [5, 8.5], { shirt: PAL.navy, pants: PAL.slate, hair: 'cap', look: 1 }],
  [375, 75, 6, [5, 8.5, 21.5, 24], { shirt: PAL.mustard, pants: PAL.bark, hair: 'short', arm: 'hold', look: -1 }],
  [-200, 0, 0, [5.5, 8.5], { shirt: PAL.red, pants: PAL.navy, hair: 'short', arm: 'out' }],
  [-110, -20, 0, [6, 9.5], { shirt: PAL.sage, pants: PAL.slate, hair: 'bun', look: -1 }],
  [-380, 40, 0, [8, 12.5], { shirt: PAL.red, pants: PAL.navy, hair: 'cap', arm: 'out' }],
  [-350, 52, 0, [8, 12.5], { shirt: PAL.sky, pants: PAL.navy, hair: 'bob', look: -1 }],
  [-322, 36, 0, [8, 12.5], { shirt: PAL.lilac, pants: PAL.slate, hair: 'short', kid: true }],
  [-228, -116, 0, [10, 19], { shirt: '#fffdf6', pants: PAL.navy, hair: 'bun', arm: 'hold', look: -1 }],
  [-215, -96, 0, [11, 18.5], { shirt: PAL.butter, pants: PAL.bark, hair: 'bob' }],
  [-200, -86, 0, [11, 18.5], { shirt: PAL.mint, pants: PAL.slate, hair: 'short', kid: true }],
  [-184, -78, 0, [11.5, 17], { shirt: PAL.rose, pants: PAL.navy, hair: 'long' }],
  [-290, -106, 0, [7, 22], { shirt: PAL.blue, pants: PAL.slate, hair: 'short', look: 1 }],
  [110, -104, 0, [8, 23], { shirt: PAL.rose, pants: PAL.bark, hair: 'bun', look: -1 }],
  [200, -5, 0, [10, 17], { shirt: PAL.mustard, pants: PAL.navy, hair: 'short', kid: true, arm: 'out' }],
  [234, 2, 0, [10, 17], { shirt: PAL.sky, pants: PAL.navy, hair: 'bob', kid: true, look: -1 }],
  [190, -38, 0, [13, 19.5], { shirt: PAL.red, pants: PAL.navy, hair: 'short', arm: 'up' }],
  [252, -40, 0, [13, 19.5], { shirt: PAL.navy, pants: PAL.slate, hair: 'bob', arm: 'up', look: -1 }],
  [110, -58, 0, [17.5, 21.5], { shirt: PAL.lilac, pants: PAL.navy, hair: 'long', look: -1 }],
  [128, -50, 0, [17.5, 21.5], { shirt: PAL.sage, pants: PAL.slate, hair: 'short', look: -1 }],
  [60, -112, 0, [17, 25], { shirt: '#fffdf6', pants: INK, hair: 'short', arm: 'hold' }],
  [-4, -98, 0, [18, 25], { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob' }],
  [16, -94, 0, [18, 25], { shirt: PAL.blue, pants: PAL.bark, hair: 'short', look: -1 }],
  [88, -98, 0, [18.5, 25], { shirt: PAL.rose, pants: PAL.slate, hair: 'long' }],
  [104, -92, 0, [18.5, 25], { shirt: PAL.navy, pants: PAL.bark, hair: 'cap', look: -1 }],
  [318, 2, 0, [12, 17], { shirt: PAL.sage, pants: PAL.navy, hair: 'bob', sit: 1 }],
  [338, 12, 0, [12, 17], { shirt: PAL.mustard, pants: PAL.slate, hair: 'short', sit: 1, look: -1 }],
  [-140, -102, 0, [20, 23.5], { shirt: PAL.sky, pants: PAL.navy, hair: 'bun' }],
  [-122, -96, 0, [20, 23.5], { shirt: PAL.brick, pants: PAL.slate, hair: 'short', look: -1 }],
];
const UMBRELLAS = [[-330, PAL.rose], [-240, PAL.butter], [-150, PAL.sky], [-60, PAL.mint], [30, PAL.rose], [120, PAL.butter]];
const SWIMMERS = [-270, -175, -95];

function lamp(x, y, z = 0) {
  cyl(x, y, z, 2.5, 46, PAL.slate, { cap: PAL.slate });
  box(x - 5, y - 5, z + 46, 10, 10, 7, { left: PAL.slate, top: '#f3ead8', marks: false });
}

function front(h) {
  const s = SPOTS(h);
  // the surf school, its boards out while lessons run
  put(-410 - 124, 0, pin(11, () => {
    gable(-410, -170, 64, 46, 36, 20, { wall: PAL.sky, roof: PAL.navy });
    faceText('left', -378, -124, 22, 'SURF', { size: 12, cls: 'cap' });
    doorL(-400, -124, 0, 14, 22, s.surf ? PAL.butter : PAL.slate);
    if (s.surf) for (const [k, c] of [[0, PAL.red], [1, PAL.mustard], [2, PAL.mint]]) { const [bx, by] = P(-356 + k * 9, -116); shape(blob(bx, by - 22, 4.5, 22, 0, 6), c, { w: 1 }); }
  }));
  // the ice cream kiosk: awning down when open, the shutter when shut
  put(-250 - 125, 0, pin(12, () => {
    box(-250, -165, 0, 46, 40, 36, { left: PAL.cream, top: PAL.rose, marks: false });
    const f = [P(-244, -125, 6), P(-210, -125, 6), P(-210, -125, 28), P(-244, -125, 28)];
    fill(f, s.ices ? '#fffdf6' : PAL.grey); rim(f, 1);
    if (!s.ices) rule([0, 1, 2, 3].map(k => [P(-244, -125, 10 + k * 5), P(-210, -125, 10 + k * 5)]), INK, 0.6);
    else { const aw = [P(-252, -125, 34), P(-204, -125, 34), P(-204, -112, 26), P(-252, -112, 26)]; fill(aw, PAL.rose); rim(aw, 1.1); rule([0, 1, 2, 3, 4].map(k => [P(-248 + k * 10, -125, 34), P(-248 + k * 10, -112, 26)]), '#fffdf6', 2.2); }
    faceText('left', -227, -125, 36 - 6, 'ICES', { size: 10, cls: 'cap' });
  }));
  // three beach huts
  [[PAL.mint, PAL.brick], [PAL.butter, PAL.navy], [PAL.rose, PAL.sage]].forEach(([w, r], i) => put(-170 + i * 42 - 132, 0, pin(13 + i, () => {
    gable(-170 + i * 42, -166, 32, 34, 30, 14, { wall: w, roof: r, eave: 5 });
    doorL(-162 + i * 42, -132, 0, 14, 22, h >= 9 && h < 18 && i !== 1 ? '#fffdf6' : shadeOf(w));
  })));
  // the beach bar: shutters by day, lit and full at night
  put(-20 - 122, 0, pin(16, () => {
    box(-20, -170, 0, 150, 48, 44, { left: PAL.butter, top: PAL.tan, marks: false });
    for (const k of [0, 1, 2]) {
      const q = _faceRect('L', 0 + k * 42, -122, 8, 28, 24);
      fill(q, s.bar ? '#aebfd2' : PAL.grey); rim(q, 1);
      if (!s.bar) rule([0, 1, 2, 3].map(j => [P(k * 42, -122, 12 + j * 5), P(28 + k * 42, -122, 12 + j * 5)]), INK, 0.6);
    }
    faceText('left', 55, -122, 36, 'BEACH BAR', { size: 11, cls: 'cap' });
    if (s.bar) { const aw = [P(-22, -122, 44), P(132, -122, 44), P(132, -106, 36), P(-22, -106, 36)]; fill(aw, PAL.navy); rim(aw, 1.1); rule(Array.from({ length: 15 }, (_, k) => [P(-18 + k * 10, -122, 44), P(-18 + k * 10, -106, 36)]), '#fffdf6', 2); }
    for (const tx of [5, 95]) { cyl(tx, -96, 0, 9, 14, PAL.wood, { cap: PAL.tan }); }
  }));
  put(170 - 145, 0, pin(17, () => tree(170, -148, 26)));
  put(245 - 150, 0, pin(18, () => tree(245, -150, 22, 0, PAL.sage)));
  for (const [i, x] of [-330, -150, 30, 200].entries()) put(x - 100, 1, pin(20 + i, () => lamp(x, -100)));
  // two cars parked at the far end of the promenade
  for (const [i, [x, col]] of [[300, PAL.red], [362, PAL.sky]].entries()) put(x - 160, 0, pin(14 + i, () => {
    box(x, -164, 0, 44, 22, 10, { left: col, marks: false, ink: 1.2 });
    box(x + 12, -162, 10, 20, 18, 8, { left: '#dfeaf3', top: col, marks: false, ink: 1 });
    for (const wx of [x + 9, x + 35]) { const [sx, sy] = P(wx, -142, 0); out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="5" fill="${INK}"/>`); }
  }));
}

function beach(h) {
  const s = SPOTS(h), wl = shore(h);
  // the lifeguard tower and its flag
  put(-45 - 60, 0, pin(30, () => {
    for (const [dx, dy] of [[0, 0], [30, 0], [0, 30], [30, 30]]) box(-62 + dx, -76 + dy, 0, 3, 3, 44, { left: PAL.wood, marks: false });
    box(-66, -80, 44, 40, 40, 3, { left: PAL.wood, top: PAL.tan, marks: false });
    box(-62, -78, 47, 24, 24, 22, { left: '#fffdf6', top: PAL.red, marks: false });
    line([P(-28, -80, 47), P(-28, -80, 100)], { w: 1.4, over: 0 });
    const [fx, fy] = P(-28, -80, 100);
    group('id="flag"', () => shape([[fx, fy], [fx + 20, fy + 5], [fx, fy + 11]], V.red && h >= 13.5 ? RED : '#7fae7a', { w: 0.9 }));
    if (s.guard) who(-40, -44, { shirt: PAL.red, pants: PAL.mustard, hair: 'cap', arm: V.red && h >= 13.5 ? 'up' : 'down', size: 0.62, look: -1 }, 47);
  }));
  // sunbeds under umbrellas, or stacked by the promenade
  for (const [x, c] of UMBRELLAS) put(x + 20, 0, pin(40 + x, () => {
    if (!V.beds || !within(h, 9, 20)) return;
    box(x - 16, -10, 0, 11, 26, 4, { left: '#fffdf6', marks: false });
    box(x + 4, -10, 0, 11, 26, 4, { left: '#fffdf6', marks: false });
    line([P(x, -8, 0), P(x, -8, 40)], { w: 1.4, over: 0 });
    turn(x, -8, 34, [[26, 0], [2, 10]], c, { cap: c, ink: 0.7 });
  }));
  put(-268 - 88, 0, pin(50, () => { if (!V.beds || !within(h, 9, 20)) for (let k = 0; k < 6; k++) box(-268, -88, k * 4, 12, 26, 4, { left: '#fffdf6', marks: false }); }));
  // the volleyball net and a castle
  put(220 - 60, 0, pin(51, () => { for (const x of [196, 246]) line([P(x, -60, 0), P(x, -60, 30)], { w: 1.4, over: 0 }); dash(P(196, -60, 28), P(246, -60, 28), INK, 2, 2, 1); dash(P(196, -60, 20), P(246, -60, 20), INK, 2, 2, 1); }));
  put(202, 0, pin(52, () => { if (within(h, 10, 18)) { cyl(216, -14, 0, 9, 10, PAL.tan, { cap: PAL.sand }); cyl(216, -14, 10, 5, 8, PAL.tan, { cap: PAL.sand }); } }));
  // the crowd, each in their hours
  CROWD.forEach(([x, y, z, hrs, o], i) => { if (within(h, ...hrs)) put(x + y + 2, 2, pin(60 + i, () => who(x, y, { size: 0.62, ...o }, z))); });
  for (const [i, [x]] of UMBRELLAS.entries()) {
    if (V.beds && within(h, 9.5, 17.5)) put(x + 40, 3, pin(90 + i, () => who(x - 10, 6, { shirt: [PAL.rose, PAL.sky, PAL.mint][i % 3], pants: PAL.navy, hair: ['bob', 'short', 'long'][i % 3], size: 0.62, sit: 1, look: -1 }, 4)));
    if (V.beds && i % 3 !== 2 && within(h, 11, 16)) put(x + 42, 3, pin(96 + i, () => who(x + 10, 6, { shirt: [PAL.butter, PAL.lilac][i % 2], pants: PAL.slate, hair: 'short', size: 0.62, sit: 1, look: 1 }, 4)));
  }
  // the swimmers, in the sea while the flag is green
  if (V.swim && within(h, 9, 18)) for (const [i, x] of SWIMMERS.entries()) put(x + wl + 40, 4, pin(110 + i, () => group('class="swim"', () => {
    who(x, wl + 28, { shirt: [PAL.red, PAL.mustard, PAL.navy][i], pants: PAL.navy, hair: ['short', 'bob', 'cap'][i], arm: 'wave', size: 0.56 }, -10);
    const [sx, sy] = P(x, wl + 28, -10); out.push(`<path d="${pathOf(oval(sx, sy - 4, 13, 5, 16), true)}" fill="#cfe0e8"/>`); line(oval(sx, sy - 4, 13, 5, 16).slice(4, 13), { w: 0.9, col: '#fffdf6', over: 0 });
  })));
  // a rowing boat turned over on the sand, a picnic rug, the beach shower
  put(300 - 45, 0, pin(53, () => { const [sx, sy] = P(290, -45); shape([[sx - 30, sy - 2], [sx - 22, sy - 12], [sx + 26, sy - 12], [sx + 32, sy - 2], [sx + 24, sy + 6], [sx - 24, sy + 6]], PAL.brick); line([[sx - 22, sy - 3], [sx + 24, sy - 3]], { w: 0.8, over: 0 }); }));
  put(325, 0, pin(54, () => { if (within(h, 12, 17)) { const r = [P(312, -6), P(350, -6), P(350, 22), P(312, 22)]; fill(r, PAL.rose); rim(r, 0.9); } }));
  put(320 - 92, 0, pin(55, () => { line([P(320, -96, 0), P(320, -96, 40), P(312, -96, 44)], { w: 1.6, col: PAL.slate, over: 0 }); }));
  // a dog with the dawn walker
  if (within(h, 6, 9.5)) put(-80, 3, pin(120, () => dog(-80, -10, 0, PAL.tan)));
}

function sea(h) {
  const wl = shore(h);
  const w = [P(-430, wl), P(430, wl), P(430, 130), P(-430, 130)];
  flat(w, '#cfe0e8');
  group('id="waves"', () => rule(Array.from({ length: 34 }, (_, i) => { const x = -410 + (i * 137) % 800, y = wl + 10 + ((i * 61) % 97) / 97 * (112 - wl); const [a, b] = P(x, y); return [[a - 12, b], [a + 12, b]]; }), '#8fb3c8', 0.8));
  line([P(-430, wl + 2), P(430, wl + 2)], { w: 2.2, col: '#fffdf6', over: 0, amp: 0.8 });
  const side = [P(-430, 130, 0), P(430, 130, 0), P(430, 130, -30), P(-430, 130, -30)];
  fill(side, '#a9c3d3'); rim(side, 1.4);
}

// the light of hour h, as the values of a colour matrix
function tint(h) {
  const a = dark(h), wm = Math.min(1, warm(h));
  const rr = (1 - 0.6 * a).toFixed(3), gg = ((1 - 0.5 * a) * (1 - 0.12 * wm)).toFixed(3), bb = ((1 - 0.22 * a) * (1 - 0.3 * wm)).toFixed(3);
  return `${rr} 0 0 0 0 0 ${gg} 0 0 0 0 0 ${bb} 0 0 0 0 0 1 0`;
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 700;
  const h = ((H % 24) + 24) % 24, s = SPOTS(h), a = dark(h), wm = Math.min(1, warm(h));
  out.push(`<defs><filter id="lapse" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${tint(h)}"/></filter></defs>`);
  out.push('<g filter="url(#lapse)">');
  // the slab: promenade at the back, sand, the sea in front
  _seed = 1;
  board(-430, -170, 860, 300, 30, PAL.sand, PAL.tan);
  const prom = [P(-430, -170), P(430, -170), P(430, -92), P(-430, -92)];
  fill(prom, '#dccaa6'); rule(Array.from({ length: 22 }, (_, k) => [P(-430 + k * 40, -170), P(-430 + k * 40, -92)]), '#b89a72', 0.6);
  line([P(-430, -92), P(430, -92)], { w: 1.4, over: 0 });
  sea(h);
  // the jetty, its lamp, and the boat
  _seed = 2;
  box(360, -92, 4, 30, 222, 4, { left: PAL.wood, top: PAL.tan, marks: false });
  for (let y = -60; y <= 120; y += 45) box(362, y, -26, 4, 4, 30, { left: PAL.bark, marks: false });
  put(375 + 120, 0, pin(3, () => lamp(375, 118, 8)));
  const k = boatIn(h), bxw = 250 * k + 100 * (1 - k), byw = 75 * k + 112 * (1 - k);
  put(bxw + byw, 0, pin(4, () => group('id="boat"', () => {
    const [bx, by] = P(bxw, byw, 0);
    shape([[bx - 34, by - 10], [bx + 34, by - 10], [bx + 24, by + 4], [bx - 26, by + 4]], PAL.blue);
    box(bxw - 8, byw - 10, 4, 16, 16, 14, { left: '#fffdf6', top: PAL.red, marks: false });
  })));
  front(h); beach(h);
  if (within(h, 10, 18)) put(-200 + 110, 5, pin(5, () => group('id="dinghy"', () => { const [sx, sy] = P(-200, 110); shape([[sx - 16, sy - 4], [sx + 16, sy - 4], [sx + 10, sy + 3], [sx - 12, sy + 3]], PAL.red, { w: 0.9 }); line([[sx, sy - 4], [sx, sy - 38]], { w: 1.1, over: 0 }); shape([[sx + 2, sy - 36], [sx + 18, sy - 8], [sx + 2, sy - 8]], '#fffdf6', { w: 0.8 }); })));
  flush();
  out.push('</g>');
  // what the dark cannot dim: lamps, the bar's windows, the boat's lantern
  if (lampsOn(h)) for (const [x, y, z] of [[-330, -100, 0], [-150, -100, 0], [30, -100, 0], [200, -100, 0], [375, 118, 8]]) {
    const [sx, sy] = P(x, y, z + 50); out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="16" fill="#f7e3a0" opacity="${(0.35 + 0.4 * a).toFixed(2)}"/><circle cx="${n1(sx)}" cy="${n1(sy)}" r="4" fill="#fff4c8"/>`);
  }
  if (s.bar && a > 0.2) for (const j of [0, 1, 2]) out.push(`<path d="${pathOf(_faceRect('L', j * 42, -122, 8, 28, 24), true)}" fill="#f7d77a" opacity="${(0.4 + 0.5 * a).toFixed(2)}"/>`);
  if (a > 0.3) { const [sx, sy] = P(bxw, byw, 22); out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="5" fill="#ffe9a8"/>`); }
  _seed = 6;
  group('id="gull"', () => bird(-260, -20, 150, '#fffdf6'));

  // the sky corner: the sun crosses by day, the moon by night
  { const day = h >= 6 && h < 20, u = day ? (h - 6) / 14 : (((h - 20) % 24 + 24) % 24) / 10, sx = 1140 + u * 180, sy = 290 - Math.sin(Math.PI * Math.min(1, u)) * 60;
    dash([1140, 290], [1320, 290], MUTE, 3, 5, 0.8);
    if (day) { for (let r = 0; r < 8; r++) { const t = r / 8 * 2 * Math.PI; line([[sx + Math.cos(t) * 17, sy + Math.sin(t) * 17], [sx + Math.cos(t) * 23, sy + Math.sin(t) * 23]], { w: 1.2, over: 0 }); } shape(oval(sx, sy, 12, 12, 24), wm > 0.3 ? PAL.brick : PAL.mustard); }
    else { shape(oval(sx, sy, 12, 12, 24), PAL.butter); out.push(`<path d="${pathOf(oval(sx + 6, sy - 4, 10, 10, 24), true)}" fill="${PAPER}"/>`); } }

  // the hour slider: every state but the surprise is a stop on it
  group('id="slider" style="cursor:pointer"', () => {
    out.push(`<rect x="${TX0 - 24}" y="${TY - 40}" width="${TX1 - TX0 + 48}" height="86" fill="${PAPER}" fill-opacity="0" pointer-events="all"/>`);
    const seg = (h0, h1, col) => { const q = [[hx(h0), TY - 5], [hx(h1), TY - 5], [hx(h1), TY + 5], [hx(h0), TY + 5]]; fill(q, col, { amp: 0.2 }); rim(q, 1); };
    seg(5, 6.5, PAL.navy); seg(6.5, 20, PAL.butter); seg(20, 24, PAL.navy);
    rule(Array.from({ length: 20 }, (_, i) => [[hx(5 + i), TY + 7], [hx(5 + i), TY + 13]]), LEAD, 0.9);
    [[6, '6 am'], [9, '9 am'], [12, 'noon'], [15, '3 pm'], [18, '6 pm'], [21, '9 pm'], [24, 'midnight']].forEach(([t, w]) => _text(hx(t), TY - 21, w, { size: 15, col: LEAD, anchor: 'middle' }));
    for (const [id, t, w] of STOPS) group(`data-state="${id}"`, () => {
      pill(hx(t), TY + 36, w);
      out.push('<g class="on">'); pill(hx(t), TY + 36, w, { lit: true }); out.push('</g>');
    });
    group('id="knob"', () => { const x = hx(h); out.push(`<circle cx="${n1(x)}" cy="${TY}" r="13" fill="${RED}" stroke="${INK}" stroke-width="1.4"/><circle cx="${n1(x)}" cy="${TY}" r="4" fill="${PAPER}"/>`); });
  });
  // the surprise sits off the stops: a red flag over half past one
  group('data-state="rip"', () => {
    const x = hx(HOUR.rip);
    line([[x, TY - 7], [x, TY - 34]], { w: 1.3, over: 0 });
    shape([[x, TY - 34], [x + 14, TY - 30], [x, TY - 25]], RED, { w: 0.8 });
    out.push('<g class="on">'); litRing([[x - 12, TY - 42], [x + 22, TY - 42], [x + 22, TY - 4], [x - 12, TY - 4]]);
    const [fx, fy] = P(-28, -80, 100); litRing([[fx - 10, fy - 10], [fx + 30, fy - 10], [fx + 30, fy + 20], [fx - 10, fy + 20]]); out.push('</g>');
  });

  title('a time-lapse', 'One beach, one day');
  subtitle('eight spots, one clock: drag the hour');
  const nOpen = [s.surf, s.ices, s.bar, s.guard].filter(Boolean).length;
  status(PREVIEW ? clock(h) : `${clock(h)}, ${NAMES[AT]}`, `${nOpen} of 4 open · lamps ${lampsOn(h) ? 'on' : 'off'}`);
  const tw = tide(h), tword = tw > 0.85 ? 'HIGH' : tw < 0.15 ? 'LOW' : h < 9 ? 'FALLING' : 'RISING';
  label(72, 290, `SURF SCHOOL · ${s.surf ? 'OPEN' : 'SHUT'}`, 'lessons from eight till noon', [-378, -124, 28]);
  label(72, 400, `ICE CREAM · ${s.ices ? 'OPEN' : 'SHUT'}`, 'ten till seven', [-227, -125, 26]);
  label(72, 960, `LIFEGUARD · ${s.guard ? 'ON DUTY' : 'OFF DUTY'}`, V.red && h >= 13.5 && h < 24 ? 'red flag: nobody swims' : 'nine till six, green flag', [-40, -60, 64]);
  label(72, 800, `SUNBEDS · ${V.beds && within(h, 9, 20) ? 'OUT' : 'STACKED'}`, 'stacked before high tide', V.beds && within(h, 9, 20) ? [-240, -2, 34] : [-262, -75, 20]);
  label(1328, 330, `BEACH BAR · ${s.bar ? 'OPEN' : 'SHUT'}`, 'opens at five', [55, -122, 30], 'end');
  label(1328, 470, `LAMPS · ${lampsOn(h) ? 'ON' : 'OFF'}`, 'on at eight, off at dawn', [200, -100, 50], 'end');
  label(1328, 1000, `THE TIDE · ${tword}`, 'high at half past eight', [250, Math.min(115, shore(h) + 45), 0], 'end');
  label(1328, 1120, `FISHING BOAT · ${k > 0.5 ? 'IN' : 'OUT'}`, 'out at ten, back at dawn', [bxw, byw, 10], 'end');
  footnote('Illustrative: a made-up beach and hours. The tide is drawn as one rise a day; a real one turns about every six hours.');
  finish();
}

// the next stop from a state, as the statechart has it; pure, so a drag can walk several
function plan(at, v) {
  switch (at) {
    case 'dawn': return { to: 'morning', v: { ...v, beds: true } };
    case 'morning': return { to: 'noon', v };
    case 'noon': return { to: 'afternoon', v };
    case 'rip': return { to: 'afternoon', v, say: 'The rip eases. The red flag stays up for the rest of the day.' };
    case 'afternoon': return { to: 'sunset', v: { ...v, swim: false } };
    case 'sunset': return v.beds ? { no: 'The sunbeds are still out, and the tide reaches them at dusk. Stack them first.' } : { to: 'dusk', v };
    case 'dusk': return { to: 'night', v };
    default: return { to: 'dawn', v: { ...v, red: false, swim: false } };
  }
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(SEED); ctx.state(AT); };
  // a frame of the lapse only relights the stop: ctx.state also rewrites the URL, too often for a browser at 60 a second
  const light = () => document.querySelectorAll('#art [data-state]').forEach(el => el.classList.toggle('lit', el.dataset.state === AT));
  // the time-lapse itself: the whole sheet redrawn hour by hour, from h0 to h1
  let job = null;
  const lapse = (h0, h1, then) => {
    if (job) job.finish();
    if (ctx.still || Math.abs(h1 - h0) < 0.01) { then(); return; }
    const ms = Math.min(4500, 900 + Math.abs(h1 - h0) * 450), t0 = performance.now();
    let raf = 0, drawn = 0;
    const j = { done: false, finish() { if (j.done) return; j.done = true; cancelAnimationFrame(raf); clearTimeout(safety); job = null; PREVIEW = false; then(); ctx.idle(j); } };
    // A whole redraw takes longer than a 60 Hz frame, so the sheet is redrawn
    // at most 30 times a second; between, only the light and the knob move.
    const step = now => {
      if (j.done) return;
      const k = Math.min(1, Math.max(0, (now - t0) / ms));
      H = h0 + (h1 - h0) * easeInOut(k); PREVIEW = true;
      if (now - drawn > 30) { draw(SEED); light(); drawn = now; }
      else {
        const hh = ((H % 24) + 24) % 24, m = document.querySelector('#lapse feColorMatrix');
        if (m) m.setAttribute('values', tint(hh));
        for (const c of document.querySelectorAll('#knob circle')) c.setAttribute('cx', n1(hx(hh)));
      }
      if (k < 1) raf = requestAnimationFrame(step); else j.finish();
    };
    const safety = setTimeout(j.finish, ms + 200);
    job = j; ctx.busy(j); raf = requestAnimationFrame(step);
  };
  const land = (to, v) => () => { AT = to; V = v; H = HOUR[to]; redraw(); };
  const upTo = (h0, to) => (HOUR[to] < h0 - 0.01 && to === 'dawn' ? HOUR[to] + 24 : HOUR[to]);
  // walk the statechart toward a stop, one next step at a time, until a guard says no
  const walk = (target, from = H) => {
    let at = AT, v = { ...V }, no = null, say = null;
    while (at !== target) { const p = plan(at, v); if (p.no) { no = p.no; break; } at = p.to; v = p.v; say = p.say || SAY[at]; }
    if (no) ctx.no(at === AT ? no : `${no} The day stops at ${NAMES[at]}.`); else ctx.say(say);
    lapse(from, upTo(from, at), land(at, v));
  };
  const canon = id => ({
    red: ORD[id] >= ORD.rip,
    beds: ['morning', 'noon', 'rip', 'afternoon'].includes(id),
    swim: id === 'noon',
  });

  ctx.button('next step', () => {
    const p = plan(AT, V);
    if (p.no) return ctx.no(p.no);
    walk(p.to);
  });
  ctx.button('rip current', () => {
    if (AT === 'rip') return ctx.no('The red flag is up already.');
    if (AT !== 'noon') return ctx.no('In this story the rip comes at half past one, after noon.');
    ctx.say(SAY.rip);
    lapse(H, HOUR.rip, land('rip', { ...V, red: true, swim: false }));
  });
  ctx.button('swim', () => {
    if (!['morning', 'noon', 'afternoon'].includes(AT)) return ctx.no(AT === 'rip' ? 'Red flag. Everyone out, nobody in.' : 'No lifeguard on duty. Nobody swims now.');
    if (V.red) return ctx.no('Red flag. Nobody goes back in today.');
    if (V.swim) return ctx.no('They are in the water already.');
    V.swim = true; redraw();
    document.querySelectorAll('#art .swim').forEach(el => ctx.hop(el));
    ctx.say('In they go, between the flags.');
  });
  ctx.button('stack sunbeds', () => {
    if (!V.beds) return ctx.no(ORD[AT] < 1 ? 'The sunbeds are not out yet.' : 'They are stacked already.');
    if (!['afternoon', 'sunset'].includes(AT)) return ctx.no('People are on them. The sunbeds stay out until the afternoon.');
    V.beds = false; redraw();
    ctx.say('Twelve sunbeds up on the promenade, above the tide.');
  });

  // the slider: a press or a drag on the track scrubs the light; letting go fires the statechart
  const art = $('art');
  let drag = null, raf = 0;
  const hourAt = e => {
    const m = art.getScreenCTM();
    if (!m) return H;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return Math.max(5, Math.min(24, 5 + (p.x - TX0) / (TX1 - TX0) * 19));
  };
  const preview = h => { H = h; PREVIEW = true; draw(SEED); light(); };
  const commit = h => {
    PREVIEW = false;
    const target = STOPS.reduce((b, s) => (Math.abs(s[1] - h) < Math.abs(b[1] - h) ? s : b))[0];
    if (target === AT) { ctx.no(`It is ${clock(HOUR[AT])} already. Drag further along.`); return lapse(h, HOUR[AT], land(AT, V)); }
    if (ORD[target] > ORD[AT]) return walk(target, h);
    // back in time is not a step of the day: it opens that stop afresh, as #state= does
    const v = canon(target);
    ctx.say(`Back to ${clock(HOUR[target])}. ${SAY[target]}`);
    lapse(h, HOUR[target], land(target, v));
  };
  art.addEventListener('pointerdown', e => {
    if (!e.target.closest || !e.target.closest('#slider')) return;
    e.stopPropagation(); e.preventDefault();
    if (job) job.finish();
    drag = { h: hourAt(e) };
    try { art.setPointerCapture(e.pointerId); } catch (err) { /* a synthetic event has no live pointer */ }
    preview(drag.h);
  });
  art.addEventListener('pointermove', e => {
    if (!drag) return;
    drag.h = hourAt(e);
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (drag) preview(drag.h); });
  });
  art.addEventListener('pointerup', e => { if (!drag) return; const h = hourAt(e); drag = null; commit(h); });
  art.addEventListener('pointercancel', () => { if (!drag) return; drag = null; H = HOUR[AT]; PREVIEW = false; redraw(); });

  ctx.hint('Press Play all, or drag the hour along the slider. Leave the sunbeds out and see.');
  redraw();

  const STORY = ['dawn', 'morning', 'noon', 'rip', 'afternoon', 'sunset', 'dusk', 'night'];
  return {
    goto(id, play) {
      const v = canon(id);
      ctx.say(SAY[id]);
      if (play && id !== AT) lapse(H, upTo(H, id), land(id, v));
      else land(id, v)();
    },
    tick(t) {
      const w = $('waves'), g = $('gull'), d = $('dinghy');
      if (w) w.setAttribute('transform', `translate(${n1(Math.sin(t * 0.9) * 7)} ${n1(Math.cos(t * 0.9) * 2)})`);
      if (g) g.setAttribute('transform', `translate(${n1(((t * 40) % 900) - 300)} ${n1(Math.sin(t * 2) * 8 + ((t * 40) % 900) * 0.2)})`);
      if (d) d.setAttribute('transform', `translate(${n1(Math.sin(t * 0.15) * 120)} ${n1(Math.sin(t * 0.15) * 60)})`);
    },
    story: STORY,
  };
}
