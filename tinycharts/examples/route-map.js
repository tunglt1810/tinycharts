// A dog's walk round the park: one park drawn in full, a sandy path through
// eight stops, a numbered pin at each, and the trail listed in order at the foot.
const ABOUT = 'where it went, stop by stop';
const IDS = ['gate', 'lamp', 'oak', 'field', 'squirrel', 'pond', 'fountain', 'bench', 'kiosk', 'home'];
const STOPS = ['gate', 'lamp', 'oak', 'field', 'pond', 'fountain', 'bench', 'kiosk'];
const TIME = { gate: '9:00', lamp: '9:05', oak: '9:12', field: '9:20', squirrel: '9:26', pond: '9:35', fountain: '9:42', bench: '9:50', kiosk: '10:00', home: '10:10' };
const NAMES = { gate: 'at the gate', lamp: 'the lamp post', oak: 'the old oak', field: 'the big field', squirrel: 'a squirrel!', pond: 'the duck pond', fountain: 'the fountain', bench: 'the bench', kiosk: 'the kiosk', home: 'home' };
const LIST = {
  gate: 'the gate · lead on, by the road', lamp: 'lamp post · a long sniff', oak: 'the old oak · squirrels above',
  field: 'big field · off the lead, the ball', pond: 'duck pond · on the lead past the ducks', fountain: 'fountain · a drink at dog height',
  bench: 'bench · lead back on', kiosk: 'kiosk · by the road, a biscuit', home: 'out of the gate · home', squirrel: 'a squirrel · off the trail, a chase',
};
const SAY = {
  gate: 'Nine o\'clock. Through the gate, lead on: the road is right behind.',
  lamp: 'The lamp post by the railings. A long, long sniff.',
  oak: 'The old oak. Something rustles high up in it.',
  field: 'The big field, away from the road. Off the lead, and the ball goes far.',
  squirrel: 'A squirrel! The dog is off across the grass to the trees.',
  pond: 'Past the duck pond on the lead. The ducks do not even look up.',
  fountain: 'A drink from the low bowl of the fountain.',
  bench: 'A rest on the bench by the bandstand. The lead goes back on.',
  kiosk: 'The kiosk by the road: a coffee, and a biscuit for the dog.',
  home: 'Back through the gate the walk started at, and home for breakfast.',
};
const SEED = 4;
let AT = 'gate', V = { lead: true, back: false };
const OFF = ['field', 'squirrel', 'fountain'];
const canon = id => ({ lead: !OFF.includes(id), back: id === 'home' });
const mins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const pin = (n, fn) => () => { _seed = n; fn(); };

// the footpath, as a loop of world points; STOP_I is where each stop sits on it
const PATH = [[-45, 205], [-120, 196], [-190, 172], [-214, 80], [-196, -36], [-150, -128], [-60, -152], [20, -112], [84, -66], [140, -18], [158, 32], [120, 92], [70, 116], [120, 168], [172, 182], [62, 206], [-45, 205]];
const STOP_I = { gate: 0, lamp: 2, oak: 4, field: 6, pond: 8, fountain: 10, bench: 12, kiosk: 14 };
// home is along the pavement outside the gate, not out on the road
const HOME = [-100, 241], OUT = [-45, 241];
const OAK = [-232, -62], CHASE = [-150, -232], BALL = [-20, -200];
const POND = [[110, -262], [262, -262], [262, -110], [220, -78], [160, -84], [118, -110], [100, -160], [96, -220]];
const KIOSK = [196, 144], BAND = [-44, 34], FOUNT = [205, 22], PLAY = [-150, 70];
const TREES = [[-262, -262, 50], [-200, -268, 44], [-140, -266, 48], [-80, -268, 42], [-20, -266, 46], [40, -268, 44], [-266, -200, 46], [-268, -140, 42], [-266, 0, 44], [-266, 140, 40], [262, -40, 42], [266, 30, 46], [80, -2, 38], [80, -250, 40], [-262, 70, 38], [-236, -112, 40]];
const WALKER = { shirt: PAL.brick, pants: PAL.navy, hair: 'short' };
// where the walker and the dog stand at each stop: walker [x, y], dog [x, y], walker extra
const POSE = {
  gate: [[-45, 205], [-28, 196], { look: -1 }],
  lamp: [[-190, 172], [-176, 160], {}],
  oak: [[-196, -36], [-212, -54], { arm: 'up' }],
  field: [[-60, -152], [-10, -196], { arm: 'up' }],
  squirrel: [[-60, -152], [-150, -226], { arm: 'wave' }],
  pond: [[84, -66], [96, -80], { look: -1 }],
  fountain: [[158, 32], [150, 62], {}],
  bench: [[70, 116], [82, 100], { sit: 1 }],
  kiosk: [[172, 182], [154, 190], { arm: 'hold', look: -1 }],
  home: [HOME, [-118, 240], { arm: 'wave', look: -1 }],
};

// ---- things drawn only on this sheet ----
function smallDog(x, y, col) {
  const [bx, by] = P(x, y);
  group(`transform="translate(${n1(bx)} ${n1(by)}) scale(.62) translate(${n1(-bx)} ${n1(-by)})"`, () => dog(x, y, 0, col));
}
function lamppost(x, y) {
  cyl(x, y, 0, 3, 64, INK, { cap: INK });
  const [sx, sy] = P(x, y, 64);
  shape([[sx - 7, sy - 2], [sx + 7, sy - 2], [sx + 4, sy - 14], [sx - 4, sy - 14]], PAL.butter, { w: 1 });
  shape([[sx - 8, sy - 14], [sx + 8, sy - 14], [sx, sy - 22]], INK, { w: 0.8 });
}
function bin(x, y, col) {
  cyl(x, y, 0, 7, 20, col, { cap: shadeOf(col) });
}
function bench(x, y, alongX) {
  if (alongX) { box(x - 18, y - 4, 8, 36, 10, 3, { left: PAL.wood, top: PAL.tan, marks: false }); box(x - 18, y - 5, 11, 36, 2, 12, { left: PAL.wood, top: PAL.tan, marks: false }); for (const d of [-16, 14]) box(x + d, y - 3, 0, 2, 8, 8, { left: INK, marks: false }); }
  else { box(x - 4, y - 18, 8, 10, 36, 3, { left: PAL.wood, top: PAL.tan, marks: false }); box(x - 5, y - 18, 11, 2, 36, 12, { left: PAL.wood, top: PAL.tan, marks: false }); for (const d of [-16, 14]) box(x - 3, y + d, 0, 8, 2, 8, { left: INK, marks: false }); }
}
function bandstand() {
  const [x, y] = BAND;
  castDisc(x, y, 40, 50);
  turn(x, y, 0, [[44, 0], [44, 8]], PAL.stone, { cap: '#e8e0d0' });
  for (let i = 0; i < 6; i++) { const t = i / 6 * 2 * Math.PI + 0.3; cyl(x + Math.cos(t) * 36, y + Math.sin(t) * 36, 8, 1.6, 40, '#fffdf6'); }
  const [cx, cy] = P(x, y, 48);
  shape([[cx - 58, cy + 4], [cx, cy - 34], [cx + 58, cy + 4], [cx, cy + 22]], PAL.brick, { w: 1.2 });
  shape([[cx - 58, cy + 4], [cx, cy + 22], [cx + 58, cy + 4], [cx + 58, cy + 10], [cx, cy + 28], [cx - 58, cy + 10]], shadeOf(PAL.brick), { w: 1 });
  line([[cx, cy - 34], [cx, cy - 44]], { w: 1.4, over: 0 });
}
function kiosk() {
  const [x, y] = KIOSK;
  cast(x - 24, y - 20, 48, 40, 50);
  box(x - 24, y - 20, 0, 48, 40, 46, { left: PAL.mint, top: PAL.sage, marks: false });
  const win = [P(x + 24, y - 12, 18), P(x + 24, y + 12, 18), P(x + 24, y + 12, 36), P(x + 24, y - 12, 36)];
  fill(win, '#5a524a'); rim(win, 1);
  for (let i = 0; i < 4; i++) { const a = -20 + i * 10, q = [P(x + 24, y + a, 40), P(x + 24, y + a + 10, 40), P(x + 38, y + a + 10, 30), P(x + 38, y + a, 30)]; fill(q, i % 2 ? '#fffdf6' : PAL.rose); rim(q, 0.8); }
  faceText('left', x, y + 20, 30, 'KIOSK', { size: 11, cls: 'cap', col: '#fffdf6' });
  box(x + 26, y - 14, 0, 6, 20, 16, { left: PAL.tan, top: PAL.wood, marks: false });
}
function fountain() {
  const [x, y] = FOUNT;
  castDisc(x, y, 22, 14);
  turn(x, y, 0, [[26, 0], [26, 10], [22, 10]], PAL.stone, { cap: '#b9cfd9' });
  turn(x, y, 10, [[5, 0], [5, 22], [13, 26], [13, 30]], PAL.stone, { cap: '#b9cfd9' });
  cyl(x - 30, y + 6, 0, 6, 6, PAL.stone, { cap: '#b9cfd9' });
  const [sx, sy] = P(x, y, 40);
  for (let k = 0; k < 4; k++) out.push(`<circle class="spray" data-x="${n1(sx)}" data-y="${n1(sy)}" cx="${n1(sx)}" cy="${n1(sy)}" r="3" fill="#cfe1ea" opacity=".9"/>`);
}
function swings(x, y) {
  for (const d of [-26, 26]) { line([P(x - 6, y + d), P(x, y + d, 44), P(x + 6, y + d)], { w: 1.6, col: PAL.navy, over: 0 }); }
  line([P(x, y - 26, 44), P(x, y + 26, 44)], { w: 1.8, col: PAL.navy, over: 0 });
  [-10, 12].forEach((d, i) => group(`class="swing" data-i="${i}" data-x="${n1(P(x, y + d, 44)[0])}" data-y="${n1(P(x, y + d, 44)[1])}"`, () => {
    line([P(x, y + d - 4, 44), P(x, y + d - 4, 14)], { w: 0.7, over: 0 }); line([P(x, y + d + 4, 44), P(x, y + d + 4, 14)], { w: 0.7, over: 0 });
    box(x - 3, y + d - 5, 12, 6, 10, 2, { left: PAL.brick, top: PAL.rose, marks: false });
  }));
}
function slide(x, y) {
  box(x, y, 0, 14, 14, 30, { left: PAL.mustard, top: PAL.butter, marks: false });
  const s = [P(x + 14, y, 30), P(x + 14, y + 14, 30), P(x + 60, y + 14, 2), P(x + 60, y, 2)];
  fill(s, PAL.sky); rim(s, 1);
}
function sandpit(x, y) {
  box(x, y, 0, 46, 36, 5, { left: PAL.wood, top: '#ecd9a6', marks: false });
  const [sx, sy] = P(x + 20, y + 18, 5); turn(...at(sx, sy + 5), 5, [[5, 0], [6, 7]], PAL.brick, { ink: 0.6 });
}
function bed(x, y, w, d, cols) {
  box(x, y, 0, w, d, 6, { left: PAL.bark, top: '#a07c5c', marks: false });
  _seed = 33 + x;
  for (let i = 0; i < 18; i++) { const [sx, sy] = P(x + 6 + rnd() * (w - 12), y + 6 + rnd() * (d - 12), 8); shape(oval(sx, sy - 3, 3.4, 3, 8), cols[i % cols.length], { w: 0.6 }); }
}
function car(x, col, look) {
  // one lane each side of the white line, so the two cars pass, not meet
  const y = look > 0 ? 256 : 272;
  group(`class="car" data-i="${look > 0 ? 0 : 1}"`, () => {
    box(x, y - 7, 2, 58, 14, 12, { left: col, top: litOf(col), marks: false });
    box(x + 12, y - 5, 14, 30, 10, 11, { left: '#dfe7ef', top: col, marks: false });
    for (const dx of [10, 46]) { const [sx, sy] = P(x + dx, y + 7, 4); shape(oval(sx, sy, 5, 5, 12), INK, { w: 0.6 }); }
  });
}
function duck(sx, sy, col = '#9a8a6c') {
  shape(blob(sx, sy - 4, 9, 4.5, 0.05, 4), col, { w: 0.9 });
  shape(oval(sx + 8, sy - 10, 3.6, 3.6, 12), '#5f7f5c', { w: 0.8 });
  shape([[sx + 11, sy - 11], [sx + 15, sy - 10], [sx + 11, sy - 9]], PAL.mustard, { w: 0.6 });
}
function squirrelAt(sx, sy) {
  shape(spline([[sx - 4, sy - 6], [sx - 14, sy - 14], [sx - 12, sy - 26], [sx - 4, sy - 22], [sx - 6, sy - 12]], true, 0.6), '#b8754a', { w: 0.8 });
  shape(blob(sx + 2, sy - 7, 6, 5, 0.05, 4), '#c9875a', { w: 0.9 });
  shape(oval(sx + 7, sy - 13, 3.6, 3.4, 10), '#c9875a', { w: 0.8 });
  blot(oval(sx + 8, sy - 14, 0.8, 0.8, 6), INK);
}
function oak() {
  const [x, y] = OAK;
  tree(x, y, 74, 0, '#6f8f5c');
  const [sx, sy] = P(x, y);
  shape(blob(sx + 26, sy - 92, 30, 22, 0.1, 5), '#7f9d6c', { w: 1 });
  shape(blob(sx - 28, sy - 84, 28, 20, 0.1, 5), '#6a8a58', { w: 1 });
}
// one stretch of the park's railing along the road, from x a to x b
function railings(a, b) {
  const ps = [];
  for (let k = a; k <= b; k += 9) ps.push([P(k, 234, 0), P(k, 234, 22)]);
  rule(ps, INK, 0.9);
  line([P(a, 234, 20), P(b, 234, 20)], { w: 1.4, over: 0 }); line([P(a, 234, 6), P(b, 234, 6)], { w: 1, over: 0 });
}
function road() {
  flat([P(-280, 248), P(280, 248), P(280, 280), P(-280, 280)], '#b8b2a8');
  flat([P(-280, 234), P(280, 234), P(280, 248), P(-280, 248)], '#ded6c6');
  for (let k = -270; k < 280; k += 40) line([P(k, 264), P(k + 20, 264)], { w: 1.6, col: '#fffdf6', over: 0 });
  // a zebra crossing outside the gate
  for (let k = 0; k < 5; k++) flat([P(-62 + k * 8, 250), P(-58 + k * 8, 250), P(-58 + k * 8, 278), P(-62 + k * 8, 278)], '#fffdf6');
}
// footsteps along sheet points, left and right in turn, from distance d0 to d1
const STEP = 13;
function stepsOn(sp, d0 = 0, d1 = Infinity) {
  const pts = resample(sp, STEP), out2 = [];
  pts.forEach((p, i) => {
    const d = i * STEP;
    if (d < d0 || d > d1) return;
    const q = pts[Math.min(pts.length - 1, i + 1)], r = pts[Math.max(0, i - 1)], ax = q[0] - r[0], ay = q[1] - r[1], L = Math.hypot(ax, ay) || 1, s2 = i % 2 ? 3 : -3;
    out2.push(`<ellipse cx="${n1(p[0] - ay / L * s2)}" cy="${n1(p[1] + ax / L * s2)}" rx="2.6" ry="1.5" transform="rotate(${n1(Math.atan2(ay, ax) * 180 / Math.PI)} ${n1(p[0] - ay / L * s2)} ${n1(p[1] + ax / L * s2)})" fill="${LEAD}" opacity=".75"/>`);
  });
  return out2.join('');
}
const hit = (say, x, y, z, fn) => { const [sx, sy] = P(x, y, z); group(`class="hit" data-say="${say}" data-x="${n1(sx)}" data-y="${n1(sy - 30)}"`, fn); };

// the walker and the dog, together in one group so they travel as one
function pair(id) {
  const [w, d, o] = POSE[id], lead = V.lead;
  group('id="pair"', () => {
    who(w[0], w[1], { size: 0.62, ...WALKER, ...o, arm: lead ? 'hold' : (o.arm || 'down') }, o.sit ? 8 : 0);
    if (!lead && (id === 'field' || id === 'squirrel')) { const [bx, by] = P(...BALL); out.push(`<circle cx="${n1(bx)}" cy="${n1(by - 4)}" r="4" fill="${PAL.mustard}" stroke="${INK}" stroke-width=".8"/>`); }
    group('id="dog"', () => smallDog(d[0], d[1], '#c9a06a'));
    if (lead) {
      const [hx, hy] = P(w[0], w[1], o.sit ? 8 : 0), [cx, cy] = P(d[0], d[1]);
      line([[hx + 9, hy - 15], [(hx + cx) / 2 + 4, Math.max(hy - 10, cy - 8) + 6], [cx + 8, cy - 14]], { w: 1, col: PAL.brick, curve: true, over: 0 });
    }
  });
}

function scene(id) {
  _seed = 1;
  board(-280, -280, 560, 560, 30, '#bccb9e', PAL.wood);
  rule(Array.from({ length: 320 }, () => { const [sx, sy] = P(-270 + rnd() * 540, -270 + rnd() * 500), s = rnd() < 0.5 ? -1 : 1; return [[sx, sy], [sx + s * 2, sy - 5]]; }), '#8fa87a', 0.6);
  road();
  // mown stripes on the big field
  for (let k = 0; k < 5; k++) flat([P(-170 + k * 40, -250), P(-150 + k * 40, -250), P(-150 + k * 40, -170), P(-170 + k * 40, -170)], '#c7d4a8');
  // the pond, its rim, reeds and lily pads
  const pk = POND.map(p => P(...p));
  flat(pk, '#b9cfd9'); line([...pk, pk[0]], { w: 1.4, col: '#7f9fb0', over: 0, curve: true });
  group('id="waves"', () => rule(Array.from({ length: 12 }, (_, i) => { const [a, b] = P(130 + (i * 47) % 120, -240 + (i * 31) % 140); return [[a - 9, b], [a + 9, b]]; }), '#8fb3c8', 0.8));
  for (const [x, y] of [[230, -100], [140, -100], [200, -240]]) { const [sx, sy] = P(x, y); out.push(`<ellipse cx="${n1(sx)}" cy="${n1(sy)}" rx="9" ry="4" fill="#8fae84" stroke="${INK}" stroke-width=".6"/>`); }
  // the footpath, then the part walked so far
  line(PATH.map(p => P(...p)), { w: 15, col: '#e6d7b4', over: 0, curve: true });
  const upto = id === 'home' ? PATH.length - 1 : id === 'squirrel' ? STOP_I.field : STOP_I[id];
  out.push('<g id="steps">');
  if (upto > 0) out.push(stepsOn(PATH.slice(0, upto + 1).map(p => P(...p))));
  if (id === 'home') out.push(stepsOn([P(-45, 205), P(...HOME)]));
  out.push('</g>');
  // the red ring of each stop lies on the ground, under what stands there
  for (const sid of IDS) group(`data-state="${sid}"`, () => {
    const [x, y, , rx, ry] = RING[sid], [sx, sy] = P(x, y, 0);
    out.push('<g class="on">'); litRing(oval(sx, sy, rx, ry * 0.6, 22)); out.push('</g>');
  });
  // a dashed line for the chase, off the trail
  if (id === 'squirrel') out.push(`<path d="${pathOf([P(-60, -152), P(...CHASE)])}" fill="none" stroke="${RED}" stroke-width="1.6" stroke-dasharray="4 5"/>`);

  _seed = 2;
  for (const [x, y, r] of TREES) if (r) put(x + y, 0, pin(10 + x * 3 + y, () => tree(x, y, r, 0, (x + y) % 3 ? PAL.leaf : '#7f9d6c')));
  put(OAK[0] + OAK[1], 0, pin(20, oak));
  put(-382, 1, pin(21, () => hit(id === 'squirrel' ? 'chk chk chk!' : 'chk', ...CHASE, 0, () => { const [sx, sy] = P(-140, -262); group('id="squirrel" class="animal"', () => squirrelAt(sx + 4, sy - (id === 'squirrel' ? 62 : 6))); })));
  for (const [x, y, w] of [[-250, 40, 16], [-240, 210, 15], [250, -150, 14], [240, 200, 16], [100, -200, 0], [-100, 120, 14], [30, 160, 13]]) if (w) put(x + y, 0, pin(36 + x, () => puff(x, y, 0, { hw: w, h: w * 1.3, col: '#8fae84' })));
  // reeds
  for (const [x, y] of [[255, -120], [250, -100], [105, -230], [100, -210]]) put(x + y, 0, pin(40 + x + y, () => { const [sx, sy] = P(x, y); for (let k = 0; k < 5; k++) line([[sx - 6 + k * 3, sy], [sx - 8 + k * 4, sy - 16 - (k % 2) * 6]], { w: 0.9, col: '#6f8f6c', over: 0 }); }));
  put(BAND[0] + BAND[1], 0, pin(50, bandstand));
  put(KIOSK[0] + KIOSK[1], 0, pin(51, kiosk));
  put(FOUNT[0] + FOUNT[1], 0, pin(52, fountain));
  put(PLAY[0] + PLAY[1] - 30, 0, pin(53, () => swings(PLAY[0], PLAY[1] - 30)));
  put(PLAY[0] + PLAY[1] + 40, 0, pin(54, () => slide(PLAY[0] - 10, PLAY[1] + 30)));
  put(PLAY[0] + PLAY[1] + 10, 0, pin(55, () => sandpit(PLAY[0] + 40, PLAY[1] - 10)));
  put(-70, 0, pin(56, () => bed(-30, -60, 70, 30, [PAL.rose, PAL.butter, PAL.lilac])));
  put(150, 0, pin(57, () => bed(10, 150, 60, 22, [PAL.brick, PAL.butter, '#fffdf6'])));
  for (const [x, y] of [[-190, 196], [-120, -60], [-150, 150], [104, 30]]) put(x + y, 1, pin(60 + x, () => lamppost(x, y)));
  for (const [x, y, c] of [[-80, 194, PAL.slate], [126, 4, PAL.leaf], [194, 196, PAL.brick]]) put(x + y, 1, pin(65 + x, () => bin(x, y, c)));
  put(184, 1, pin(68, () => bench(70, 114, true)));
  put(-120, 1, pin(69, () => bench(-130, 10, false)));
  put(-50, 1, pin(70, () => bench(60, -110, true)));
  put(-10, 1, pin(71, () => { // a sign post by the gate
    const [x, y] = [-20, 210]; cyl(x, y, 0, 2, 40, PAL.bark);
    const q = [P(x, y - 14, 30), P(x, y + 14, 30), P(x, y + 14, 40), P(x, y - 14, 40)]; fill(q, PAL.leaf); rim(q, 0.8);
  }));
  // the gate gap is at x -64 .. -26
  const RAIL = [-280, -240, -200, -160, -120, -64, null, -26, 0, 40, 80, 120, 160, 200, 240, 280];
  RAIL.forEach((a, i) => { const b = RAIL[i + 1]; if (a !== null && b != null) put(a + 234, 0, pin(72, () => railings(a, b))); });
  for (const k of [-66, -24]) put(k + 234, 1, pin(74, () => box(k - 3, 231, 0, 6, 6, 30, { left: PAL.stone, top: '#e8e0d0', marks: false })));
  put(600, 0, pin(73, () => { car(-250, PAL.blue, 1); car(110, PAL.mustard, -1); }));

  // people about the park
  put(KIOSK[0] + KIOSK[1] + 1, 2, pin(80, () => hit('morning!', KIOSK[0] + 6, KIOSK[1], 18, () => who(KIOSK[0] + 6, KIOSK[1], { size: 0.5, shirt: PAL.rose, hair: 'bun', look: -1 }, 18))));
  put(-40, 2, pin(81, () => group('id="jogger"', () => who(0, -40, { size: 0.58, shirt: PAL.mustard, pants: PAL.navy, hair: 'cap', arm: 'out' }))));
  put(-82, 2, pin(82, () => hit('...', -128, 10, 8, () => who(-128, 10, { size: 0.58, shirt: PAL.lilac, hair: 'bob', sit: 1, arm: 'hold' }, 8))));
  put(-60, 2, pin(83, () => who(PLAY[0], PLAY[1] - 20, { size: 0.58, kid: true, shirt: PAL.sky, hair: 'short', arm: 'up' })));
  put(-40, 2, pin(84, () => who(PLAY[0] + 50, PLAY[1] + 20, { size: 0.58, kid: true, shirt: PAL.rose, hair: 'bun', arm: 'wave', look: -1 })));
  put(-10, 2, pin(85, () => who(PLAY[0] + 20, PLAY[1] + 60, { size: 0.6, shirt: PAL.navy, pants: PAL.slate, hair: 'long', arm: 'hold' })));
  put(-20, 2, pin(86, () => hit('here, ducks', 112, -100, 0, () => who(112, -100, { size: 0.58, shirt: PAL.sage, hair: 'short', arm: 'out', look: -1 }))));
  put(560, 3, pin(87, () => group('id="cyclist"', () => { who(-230, 248, { size: 0.55, shirt: PAL.brick, hair: 'cap', sit: 1 }, 10); const [sx, sy] = P(-230, 248); for (const dx of [-12, 12]) out.push(`<circle cx="${n1(sx + dx)}" cy="${n1(sy - 6)}" r="8" fill="none" stroke="${INK}" stroke-width="1.2"/>`); })));
  // animals
  [[170, -200], [200, -170], [150, -150], [220, -220], [230, -150]].forEach(([x, y], i) => put(x + y, 3, pin(90 + i, () => hit('quack', x, y, 0, () => group(`class="duck animal" data-i="${i}"`, () => duck(...P(x, y), i === 2 ? '#7f6f58' : '#9a8a6c'))))));
  [[20, -60], [36, -52], [-10, 100]].forEach(([x, y], i) => put(x + y, 3, pin(96 + i, () => hit('coo', x, y, 0, () => group(`class="peck" data-i="${i}"`, () => bird(x, y, 0, '#b9bec6'))))));
  put(-46, 3, pin(99, () => group('id="jogdog"', () => smallDog(-26, -20, '#6e5a4a'))));
  // the walker and the dog
  const w = POSE[id][0];
  put(w[0] + w[1] + 4, 4, pin(100, () => pair(id)));
}

const PIN_D = { kiosk: [-34, -40], home: [40, 4] };
// the red ring round the place of each stop: world x, y, z, rx, ry
const RING = { gate: [-45, 222, 10, 46, 28], lamp: [-190, 186, 30, 40, 50], oak: [...OAK, 50, 70, 74], field: [-40, -180, 0, 90, 44], squirrel: [...CHASE, 30, 46, 48], pond: [170, -170, 0, 100, 56], fountain: [...FOUNT, 14, 42, 30], bench: [70, 114, 10, 40, 26], kiosk: [...KIOSK, 26, 50, 50], home: [HOME[0], HOME[1], 10, 46, 18] };

function draw(seed) {
  begin(seed);
  OX = 700; OY = 676;
  scene(AT);
  flush();
  // numbered pins on the map, and the trail in order at the foot
  const reached = id => (AT === 'home' ? true : STOPS.indexOf(id) <= STOPS.indexOf(AT === 'squirrel' ? 'field' : AT));
  const pinAt = id => { const p = id === 'home' ? HOME : id === 'squirrel' ? CHASE : PATH[STOP_I[id]]; const [sx, sy] = P(p[0], p[1]); const [dx, dy] = PIN_D[id] || [22, -60]; return [sx + dx, sy + dy, sx, sy]; };
  const num = id => (id === 'squirrel' ? '!' : id === 'home' ? '9' : String(STOPS.indexOf(id) + 1));
  const ROWS = [...STOPS, 'home', 'squirrel'];
  _text(72, 1124, 'the trail, in order', { cls: 'cap', size: 16 });
  for (const id of IDS) group(`data-state="${id}"`, () => {
    const [px, py, gx, gy] = pinAt(id), r = reached(id) || id === AT, i = ROWS.indexOf(id), lx = i < 5 ? 72 : 560, ly = 1156 + (i % 5) * 28;
    if (id !== 'squirrel' || AT === 'squirrel') {
      line([[px, py + 11], [gx + 6, gy - 4]], { w: 1, col: r ? INK : MUTE, over: 0 });
      out.push(`<circle cx="${n1(px)}" cy="${n1(py)}" r="11" fill="#fffdf6" stroke="${r ? INK : MUTE}" stroke-width="1.2"/>`);
      _text(px, py + 5, num(id), { size: 14, anchor: 'middle', col: r ? INK : MUTE });
    }
    _text(lx, ly, num(id), { size: 16, col: MUTE });
    _text(lx + 24, ly, LIST[id], { size: 17, col: r && id !== 'squirrel' ? LEAD : MUTE });
    out.push('<g class="on">');
    out.push(`<circle cx="${n1(px)}" cy="${n1(py)}" r="12" fill="${RED}"/>`);
    _text(px, py + 5, num(id), { size: 14, anchor: 'middle', col: PAPER });
    _text(lx, ly, num(id), { size: 16, col: RED });
    _text(lx + 24, ly, LIST[id], { size: 17, col: RED });
    out.push('</g>');
  });

  group('id="clock"', () => dial(1262, 215, 34, mins(TIME[AT])));
  title('a route map', 'A dog’s walk');
  subtitle('round the park, stop by stop, and back to the gate');
  const n = AT === 'home' ? 'loop done' : AT === 'squirrel' ? 'off the trail' : `stop ${STOPS.indexOf(AT) + 1} of 8`;
  status(`${TIME[AT]}, ${NAMES[AT]}`, `${V.lead ? 'on the lead' : 'off the lead'} · ${n}`);
  label(72, 290, 'OLD OAK', 'a squirrel lives up top', [OAK[0], OAK[1], 70]);
  label(72, 410, 'PLAYGROUND', 'swings, slide, sandpit', [PLAY[0], PLAY[1] - 30, 40]);
  label(72, 790, 'LAMP POST', 'the best sniff in the park', [-190, 196, 50]);
  label(72, 900, 'GATE', 'every walk starts and ends here', [-45, 232, 24]);
  label(72, 1010, 'ROAD', 'lead on whenever it is near', [-200, 264, 0]);
  label(1328, 290, 'BIG FIELD', 'far from the road: off the lead', [-40, -190, 0], 'end');
  label(1328, 410, 'DUCK POND', 'on the lead past the ducks', [200, -150, 0], 'end');
  label(1328, 790, 'FOUNTAIN', 'a low bowl for dogs', [FOUNT[0], FOUNT[1], 40], 'end');
  label(1328, 900, 'BANDSTAND', 'the bench beside it', [BAND[0] + 20, BAND[1], 40], 'end');
  label(1328, 1010, 'KIOSK', 'by the road: lead on', [KIOSK[0] + 24, KIOSK[1] + 10, 30], 'end');
  footnote('Illustrative: a made-up park, dog and times. Many town parks ask for dogs on a lead near roads and water birds.');
  finish();
}

// the next step from a state, as the statechart has it
function plan(at, v) {
  switch (at) {
    case 'gate': return v.back ? { to: 'home', v } : { to: 'lamp', v: { ...v, back: false } };
    case 'field': return v.lead ? { to: 'pond', v } : { no: 'The duck pond is next. Put the lead on first: the dog never goes in the pond.' };
    case 'squirrel': return { to: 'field', v, say: 'A whistle. He trots back to the field, very pleased with himself.' };
    case 'bench': return v.lead ? { to: 'kiosk', v } : { no: 'The kiosk is by the road. Put the lead on first.' };
    case 'kiosk': return { to: 'gate', v: { ...v, back: true }, say: 'Back at the gate the walk started at. The loop is done.' };
    case 'home': return { to: 'gate', v: { lead: true, back: false }, say: 'Next morning. Lead on, and through the gate again.' };
    default: return { to: STOPS[STOPS.indexOf(at) + 1], v };
  }
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(SEED); ctx.state(AT); };
  // the path from one stop to the next, through its bends
  const legOf = (from, to) => {
    const a = from === 'home' ? null : from === 'squirrel' ? STOP_I.field : STOP_I[from];
    if (to === 'home') return from === 'gate' ? [PATH[0], OUT, HOME] : [...PATH.slice(a), OUT, HOME];
    if (from === 'home') return [HOME, OUT, PATH[0]];
    if (to === 'squirrel' || from === 'squirrel') return [POSE[from][0], POSE[to][0]];
    const b = to === 'gate' ? PATH.length - 1 : STOP_I[to];
    return PATH.slice(a, b + 1);
  };
  // one walk along the path: the camera keeps the pair in view, footsteps are
  // left behind them, and the clock runs on
  const walkLeg = (pts, m0, m1, then) => {
    const steps = $('steps'), sp = pts.map(p => P(...p));
    let left = 0;
    walk(ctx, $('pair'), pts, { follow: 820, clock: [$('clock'), m0, m1], then, onStep: (k, d) => {
      if (steps && d - left >= STEP) { steps.insertAdjacentHTML('beforeend', stepsOn(sp, left + 0.01, d)); left = Math.floor(d / STEP) * STEP; }
    } });
  };
  const go = (to, v, say) => {
    const from = AT;
    ctx.say(say || SAY[to]);
    const land = () => { AT = to; V = v; redraw(); };
    const m0 = mins(TIME[from]), m1 = mins(TIME[to]) + (mins(TIME[to]) < m0 ? 24 * 60 : 0);
    if (to === 'squirrel') { sweep(ctx, $('clock'), m0, m1, 1300); glide(ctx, $('dog'), POSE.field[1], POSE.squirrel[1], { arc: 20, ms: 1300, follow: 900, then: land }); }
    else if (from === 'squirrel') glide(ctx, $('dog'), POSE.squirrel[1], POSE.field[1], { arc: 20, ms: 1300, follow: 900, then: () => { AT = 'field'; V = v; redraw(); if (to !== 'field') go(to, v, say); } });
    else walkLeg(legOf(from, to).map(p => [p[0], p[1], 0]), m0, m1, land);
  };

  const toggle = () => {
    if (AT === 'squirrel') return ctx.no('The dog is up at the trees. Whistle him back first.');
    if (!OFF.includes(AT) && AT !== 'bench') return ctx.no(AT === 'home' ? 'The walk is over.' : `Not here: ${NAMES[AT]} is too near the road or the water. The lead stays on.`);
    if (AT === 'bench' && V.lead) return ctx.no('The kiosk and the road are next. The lead stays on now.');
    V = { ...V, lead: !V.lead }; redraw(); ctx.hop($('dog'));
    ctx.say(V.lead ? 'Click. The lead is on again.' : 'Off the lead. Away he goes.');
  };
  ctx.button('next step', () => {
    const p = plan(AT, V);
    if (p.no) return ctx.no(p.no);
    go(p.to, p.v, p.say);
  });
  ctx.button('lead on / off', toggle);
  ctx.button('a squirrel!', () => {
    if (AT === 'squirrel') return ctx.no('He is chasing one already.');
    if (AT !== 'field') return ctx.no('No squirrels here. They come down only in the big field.');
    if (V.lead) return ctx.no('On the lead, the dog only looks. Let him off first.');
    go('squirrel', V);
  });
  ctx.button('go home', () => {
    if (AT === 'home') return ctx.no('Home already.');
    if (AT !== 'gate' || !V.back) return ctx.no(AT === 'gate' ? 'The walk has only begun. It goes round the whole loop first.' : 'Not from here. Every walk ends back at the gate.');
    go('home', V);
  });
  ctx.hint('Press Play all, or next step. Let him off in the big field, then try next step.');
  redraw();

  return {
    goto(id, play) {
      const v = canon(id);
      if (play && id !== AT) go(id, v);
      else { AT = id; V = v; ctx.say(SAY[id]); redraw(); }
    },
    tick(t) {
      // each car drives the length of the road only, and fades in and out at its ends
      document.querySelectorAll('#art .car').forEach((c, i) => { const k = (t * 0.08 + i * 0.5) % 1, x = i ? 212 - k * 482 : -270 + k * 482, d = x - (i ? 110 : -250); c.setAttribute('transform', `translate(${n1(d * C)} ${n1(d * S)})`); c.setAttribute('opacity', n1(Math.min(1, k / 0.06, (1 - k) / 0.06))); });
      document.querySelectorAll('#art .duck').forEach((d, i) => { const k = t * 0.3 + i * 1.7; d.setAttribute('transform', `translate(${n1(Math.cos(k) * 14)} ${n1(Math.sin(k * 1.3) * 6)})`); });
      document.querySelectorAll('#art .peck').forEach((b, i) => b.setAttribute('transform', `translate(0 ${n1(-Math.max(0, Math.sin(t * 5 + i * 2)) * 4)})`));
      document.querySelectorAll('#art .spray').forEach((p, i) => rise(p, (t * 0.6 + i / 4) % 1, (i % 2 ? 10 : -10), 14, 0.6, 1.4));
      document.querySelectorAll('#art .swing').forEach((s, i) => s.setAttribute('transform', `rotate(${n1(Math.sin(t * 2.2 + i * 1.4) * 18)} ${s.dataset.x} ${s.dataset.y})`));
      const w = $('waves'); if (w) w.setAttribute('transform', `translate(${n1(Math.sin(t * 0.8) * 5)} 0)`);
      const j = $('jogger'); if (j) stroll(j, [[0, -40], [60, 60]], t, 22);
      const jd = $('jogdog'); if (jd) stroll(jd, [[-26, -20], [34, 80]], t, 22);
      const cy = $('cyclist'); if (cy) { const k = (t * 0.06) % 1; cy.setAttribute('transform', `translate(${n1(k * 400 * C)} ${n1(k * 400 * S)})`); }
    },
    click(e) {
      const g = e.target.closest && e.target.closest('.hit');
      if (g && g.dataset.say) { ctx.hop(g); ctx.bubble(+g.dataset.x, +g.dataset.y, g.dataset.say); }
    },
    story: IDS,
  };
}
