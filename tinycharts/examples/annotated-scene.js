// A campsite at dusk: one clearing drawn in full, ten things on margin labels.
// One shared clock of stops runs the evening; each label reads its word from it.
const ABOUT = 'everything happening in one place';
const IDS = ['pitch', 'cooking', 'supper', 'lake', 'stories', 'bedtime', 'night', 'bear'];
const HOUR = { pitch: 17.5, cooking: 18.5, supper: 19.25, lake: 20, stories: 20.75, bedtime: 22, night: 23.5, bear: 25 };
const PILL = { pitch: 'tents up', cooking: 'fire lit', supper: 'supper', lake: 'the lake', stories: 'stories', bedtime: 'bedtime', night: 'night', bear: 'a bear' };
const NAMES = { pitch: 'tents up', cooking: 'cooking', supper: 'supper', lake: 'at the lake', stories: 'stories', bedtime: 'bedtime', night: 'night', bear: 'a bear' };
const DARK = { pitch: 0, cooking: 0.12, supper: 0.3, lake: 0.45, stories: 0.62, bedtime: 0.74, night: 0.88, bear: 0.9 };
const WARM = { pitch: 0.2, cooking: 0.5, supper: 0.9, lake: 0.7, stories: 0.2, bedtime: 0, night: 0, bear: 0 };
const SAY = {
  pitch: 'Half past five. Three tents go up; the car is unpacked.',
  cooking: 'Half past six. The fire is lit, the pot is on, the food is out.',
  supper: 'Quarter past seven. Supper at the table. The owl wakes up.',
  lake: 'Eight. Everyone down at the lake; the fire was doused first.',
  stories: 'Quarter to nine. The fire again: stories and marshmallows.',
  bedtime: 'Ten. Teeth, torches, tents. The food is still on the table.',
  night: 'Half past eleven. All zipped in. Owls and fireflies.',
  bear: 'One in the morning. A bear sniffs the bear box, and finds it locked.',
};
const SEED = 7;
let AT = 'pitch', V = { fire: false, food: false, away: false };
const canon = id => ({
  fire: ['cooking', 'supper', 'stories'].includes(id),
  food: ['cooking', 'supper', 'lake', 'stories', 'bedtime'].includes(id),
  away: ['lake', 'night', 'bear'].includes(id),
});
const clock = h => { h = ((h % 24) + 24) % 24; return `${Math.floor(h)}:${String(Math.round(h % 1 * 60)).padStart(2, '0')}`; };
const pin = (n, fn) => () => { _seed = n; fn(); };

// world spots
const FIRE = [20, 30], TABLE = [-90, -96], BOX = [-205, -120], CANOE_SHORE = [8, -125], CANOE_LAKE = [190, -185], LANTERN = [-95, 95], CAR = [130, 195], OWL_TREE = [-110, -250];
const TENTS = [[-180, 40, '#d9905a'], [-150, 150, PAL.navy], [-60, 210, PAL.mustard]];
const LAKE = [[30, -280], [280, -280], [280, -10], [230, 8], [170, 0], [120, -40], [70, -80], [35, -150], [25, -220]];
const PINES = [[-262, -262, 96], [-205, -266, 84], [-150, -262, 90], [-40, -268, 80], [10, -266, 70], [-266, -200, 92], [-262, -130, 80], [-266, -40, 96], [-262, 60, 84], [-266, 150, 90], [-262, 236, 78]];
const CAMPERS = [
  { shirt: PAL.navy, pants: PAL.slate, hair: 'short' },
  { shirt: PAL.rose, pants: PAL.navy, hair: 'bun' },
  { shirt: PAL.lilac, pants: PAL.bark, hair: 'bob' },
  { shirt: PAL.mustard, pants: PAL.navy, hair: 'short', kid: true },
  { shirt: PAL.mint, pants: PAL.slate, hair: 'long', kid: true },
  { shirt: PAL.brick, pants: PAL.slate, hair: 'cap' },
];
// where each camper is at each stop: [x, y, z, extra]; none at night, they are in the tents
const SPOT = {
  pitch: [[-150, 72, 0, { arm: 'hold', look: -1 }], [-118, 178, 0, { arm: 'out' }], [112, 182, 0, { arm: 'hold' }], [-10, 100, 0, { arm: 'up' }], [20, 128, 0, { arm: 'wave', look: -1 }], [-30, 236, 0, { arm: 'hold', look: -1 }]],
  cooking: [[48, 8, 0, { arm: 'hold', look: -1 }], [-66, -62, 0, { arm: 'hold' }], [-104, -58, 0, {}], [62, 100, 0, { arm: 'hold' }], [100, 150, 0, { arm: 'out', look: -1 }], [-30, -92, 0, { look: -1 }]],
  supper: [[-112, -128, 12, { sit: 1 }], [-86, -128, 12, { sit: 1 }], [-60, -128, 12, { sit: 1, look: -1 }], [-110, -70, 12, { sit: 1 }], [-84, -70, 12, { sit: 1, look: -1 }], [-58, -70, 12, { sit: 1, look: -1 }]],
  lake: [[110, -128, 6, { arm: 'out' }], [140, -122, 6, { look: -1 }], [48, -62, 0, { arm: 'wave' }], [182, -190, 2, { sit: 1, arm: 'hold' }], [200, -180, 2, { sit: 1, look: -1 }], [72, -30, 0, { arm: 'up', look: -1 }]],
  stories: [[-24, 8, 9, { sit: 1 }], [-24, 52, 9, { sit: 1, arm: 'hold' }], [22, -16, 9, { sit: 1, arm: 'out' }], [66, 14, 9, { sit: 1, arm: 'hold', look: -1 }], [66, 52, 9, { sit: 1, look: -1 }], [22, 78, 9, { sit: 1, arm: 'wave', look: -1 }]],
  bedtime: [[-100, 40, 0, { arm: 'hold' }], [-95, 130, 0, { arm: 'hold' }], [-10, 175, 0, {}], [-55, 95, 0, { arm: 'wave' }], [-35, 140, 0, { look: -1 }], [-150, -80, 0, { arm: 'hold', look: -1 }]],
};
const TENT_OF = [0, 1, 2, 0, 1, 2];
const doorOf = i => [TENTS[TENT_OF[i]][0] + 30, TENTS[TENT_OF[i]][1], 0];
const spotOf = (id, i) => (SPOT[id] ? SPOT[id][i] : null);
const DOG = { pitch: [-60, 50], cooking: [70, -40], supper: [-30, -40], lake: [60, -70], stories: [-40, 110], bedtime: [-100, 120], night: [-110, 130], bear: [-110, 130] };

// ---- things drawn only on this sheet ----
function pine(x, y, h) {
  const [bx, by] = P(x, y);
  castDisc(x, y, h * 0.16, h * 0.6);
  shape([[bx - 3, by], [bx - 3, by - h * 0.25], [bx + 3, by - h * 0.25], [bx + 3, by]], PAL.bark, { w: 1 });
  for (let k = 0; k < 3; k++) {
    const w = h * (0.3 - 0.07 * k), y0 = by - h * 0.18 - k * h * 0.24;
    shape([[bx - w, y0], [bx - w * 0.2, y0 - h * 0.42], [bx, y0 - h * 0.46], [bx + w * 0.2, y0 - h * 0.42], [bx + w, y0]], k % 2 ? '#7f9d7a' : '#6f8f6c', { w: 1 });
  }
}
function tentFaces(x, y) {
  return {
    back: [P(x - 25, y - 20), P(x + 25, y - 20), P(x + 25, y, 34), P(x - 25, y, 34)],
    front: [P(x - 25, y + 20), P(x + 25, y + 20), P(x + 25, y, 34), P(x - 25, y, 34)],
    end: [P(x + 25, y - 20), P(x + 25, y + 20), P(x + 25, y, 34)],
    door: [P(x + 25, y - 9), P(x + 25, y + 9), P(x + 25, y, 24)],
  };
}
function tent(x, y, col, open) {
  const f = tentFaces(x, y);
  cast(x - 25, y - 20, 50, 40, 26);
  fill(f.back, shadeOf(col)); rim(f.back, 1);
  fill(f.front, col); rim(f.front, 1.1);
  fill(f.end, shadeOf(col)); rim(f.end, 1.1);
  if (open) { fill(f.door, '#4a4038'); rim(f.door, 0.9); } else line([P(x + 25, y, 0), P(x + 25, y, 24)], { w: 0.8, over: 0 });
  for (const [a, b] of [[P(x + 25, y, 34), P(x + 40, y, 0)], [P(x - 25, y, 34), P(x - 40, y, 0)]]) line([a, b], { w: 0.6, col: LEAD, over: 0 });
}
function fireRing(on) {
  const [x, y] = FIRE;
  for (let i = 0; i < 11; i++) { const t = i / 11 * 2 * Math.PI, [sx, sy] = P(x + Math.cos(t) * 22, y + Math.sin(t) * 22); shape(oval(sx, sy - 2, 6, 4, 10), PAL.stone, { w: 0.9 }); }
  const [cx, cy] = P(x, y);
  line([[cx - 14, cy - 2], [cx + 12, cy - 8]], { w: 3.4, col: PAL.bark, over: 0 });
  line([[cx - 12, cy - 8], [cx + 14, cy - 1]], { w: 3.4, col: shadeOf(PAL.bark), over: 0 });
  if (on) group('id="flame"', () => {
    shape(blob(cx, cy - 16, 11, 16, 0.12, 5), '#e8955a', { w: 1 });
    shape(blob(cx + 1, cy - 12, 6, 10, 0.1, 4), '#f6d27a', { w: 0.7 });
  });
  else out.push(`<ellipse cx="${n1(cx)}" cy="${n1(cy - 4)}" rx="10" ry="4" fill="${PAL.grey}"/>`);
}
function logSeat(x, y, alongX) {
  if (alongX) box(x - 20, y - 5, 0, 40, 10, 9, { left: PAL.wood, top: PAL.tan, marks: false });
  else box(x - 5, y - 20, 0, 10, 40, 9, { left: PAL.wood, top: PAL.tan, marks: false });
}
function table(food) {
  const [x, y] = TABLE;
  cast(x - 30, y - 34, 60, 68, 22);
  box(x - 30, y - 34, 0, 60, 10, 12, { left: PAL.bark, top: PAL.wood, marks: false });
  for (const dx of [-24, 22]) box(x + dx, y - 10, 0, 3, 20, 22, { left: PAL.bark, marks: false });
  const top = [P(x - 32, y - 16, 22), P(x + 32, y - 16, 22), P(x + 32, y + 16, 22), P(x - 32, y + 16, 22)];
  fill(top, PAL.rose); rim(top, 1.1);
  rule([-20, -8, 4, 16, 28].map(k => [P(x + k, y - 16, 22), P(x + k, y + 16, 22)]), '#fffdf6', 1.4);
  const side = [P(x + 32, y - 16, 22), P(x + 32, y + 16, 22), P(x + 32, y + 16, 18), P(x + 32, y - 16, 18)];
  fill(side, shadeOf(PAL.rose)); rim(side, 0.9);
  if (food) {
    for (const [dx, dy] of [[-18, -8], [-2, -8], [14, -8], [-18, 8], [-2, 8], [14, 8]]) { const [sx, sy] = P(x + dx, y + dy, 22); shape(oval(sx, sy, 6, 3.2, 12), '#fffdf6', { w: 0.8 }); }
    turn(x + 26, y, 22, [[7, 0], [8, 9]], PAL.slate, { cap: PAL.grey, ink: 0.8 });
    const [bx, by] = P(x - 28, y + 2, 24); shape(blob(bx, by - 3, 9, 4, 0.1, 4), PAL.mustard, { w: 0.8 });
  }
  box(x - 30, y + 24, 0, 60, 10, 12, { left: PAL.bark, top: PAL.wood, marks: false });
}
function bearBox(open) {
  const [x, y] = BOX;
  cast(x, y, 44, 28, 30);
  box(x, y, 0, 44, 28, 30, { left: PAL.slate, top: '#a9b0ba', marks: false });
  faceText('left', x + 22, y + 28, 12, 'BEAR BOX', { size: 9, cls: 'cap', col: '#fffdf6' });
  if (open) { const lid = [P(x, y, 30), P(x + 44, y, 30), P(x + 44, y - 6, 56), P(x, y - 6, 56)]; fill(lid, '#a9b0ba'); rim(lid, 1); }
  else { const [lx, ly] = P(x + 22, y + 28, 24); out.push(`<rect x="${n1(lx - 3)}" y="${n1(ly - 2)}" width="6" height="7" fill="${PAL.mustard}" stroke="${INK}" stroke-width=".8"/>`); }
}
function car() {
  const [x, y] = CAR;
  cast(x, y, 72, 38, 30);
  box(x, y, 4, 72, 38, 16, { left: PAL.navy, top: PAL.blue, marks: false });
  box(x + 14, y + 4, 20, 38, 30, 14, { left: '#dfe7ef', top: PAL.blue, marks: false });
  for (const dx of [12, 58]) { const [sx, sy] = P(x + dx, y + 38, 6); shape(oval(sx, sy, 7, 7, 14), INK, { w: 0.8 }); out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="2.4" fill="${PAL.grey}"/>`); }
  box(x + 20, y + 6, 34, 26, 26, 6, { left: PAL.mustard, top: PAL.butter, marks: false });
}
function canoe(x, y, z) {
  const c = [P(x - 32, y, z + 4), P(x - 12, y - 9, z), P(x + 12, y - 9, z), P(x + 32, y, z + 4), P(x + 12, y + 9, z), P(x - 12, y + 9, z)];
  shape(c, PAL.brick, { w: 1.1 });
  line([P(x - 24, y, z + 3), P(x + 24, y, z + 3)], { w: 0.7, col: shadeOf(PAL.brick), over: 0 });
}
function jetty() {
  for (const px of [100, 130, 158]) for (const py of [-140, -118]) box(px, py, -16, 3, 3, 20, { left: PAL.bark, marks: false });
  box(78, -142, 4, 86, 26, 3, { left: PAL.wood, top: PAL.tan, marks: false });
  rule([88, 98, 108, 118, 128, 138, 148, 158].map(k => [P(k, -142, 7), P(k, -116, 7)]), PAL.bark, 0.6);
}
function lantern(on) {
  const [x, y] = LANTERN;
  line([P(x, y, 0), P(x, y, 66), P(x + 10, y, 66)], { w: 1.6, col: PAL.bark, over: 0 });
  box(x + 6, y - 4, 46, 8, 8, 12, { left: on ? '#f6d27a' : PAL.slate, top: INK, marks: false });
}
function woodpile() {
  box(70, 110, 0, 40, 24, 18, { left: '#c79b6c', top: PAL.bark, marks: false });
  for (const [dy, dz] of [[4, 4], [12, 4], [20, 4], [8, 11], [16, 11], [12, 17]]) { const [sx, sy] = P(110, 110 + dy, dz); shape(oval(sx, sy, 4.2, 4, 10), '#e7c99b', { w: 0.8 }); }
  cyl(120, 86, 0, 9, 11, PAL.wood, { cap: PAL.tan });
  const [ax, ay] = P(120, 86, 11); line([[ax - 2, ay], [ax + 14, ay - 16]], { w: 1.6, col: PAL.bark, over: 0 }); shape([[ax - 4, ay - 3], [ax + 3, ay - 3], [ax + 2, ay + 4]], PAL.slate, { w: 0.8 });
}
function washLine() {
  for (const y of [-34, 50]) line([P(-232, y, 0), P(-232, y, 44)], { w: 1.4, col: PAL.bark, over: 0 });
  line([P(-232, -34, 42), P(-232, 8, 36), P(-232, 50, 42)], { w: 0.7, over: 0, curve: true });
  [[-22, PAL.sky], [-4, PAL.butter], [18, PAL.rose], [34, PAL.mint]].forEach(([y, c]) => { const q = [P(-232, y - 6, 39), P(-232, y + 6, 39), P(-232, y + 6, 24), P(-232, y - 6, 24)]; fill(q, c); rim(q, 0.8); });
}
// animals: small, sheet-space shapes
function duck(sx, sy) {
  shape(blob(sx, sy - 4, 9, 4.5, 0.05, 4), '#9a8a6c', { w: 0.9 });
  shape(oval(sx + 8, sy - 10, 3.6, 3.6, 12), '#5f7f5c', { w: 0.8 });
  shape([[sx + 11, sy - 11], [sx + 15, sy - 10], [sx + 11, sy - 9]], PAL.mustard, { w: 0.6 });
}
function deer(sx, sy, look, antlers) {
  const f = look;
  for (const lx of [-8, -4, 6, 10]) line([[sx + lx * f, sy - 10], [sx + lx * f, sy]], { w: 1.6, col: '#8a6a4f', over: 0 });
  shape(capsule([sx - 10 * f, sy - 14], [sx + 10 * f, sy - 14], 6, 6.5), '#c9a173', { w: 1 });
  shape(capsule([sx + 10 * f, sy - 16], [sx + 15 * f, sy - 28], 2.6), '#c9a173', { w: 0.9 });
  shape(oval(sx + 17 * f, sy - 30, 4.4, 3.4, 12), '#c9a173', { w: 0.9 });
  if (antlers) for (const d of [-3, 3]) line([[sx + (15 + d) * f, sy - 33], [sx + (13 + d * 2) * f, sy - 42], [sx + (16 + d * 2) * f, sy - 46]], { w: 1, col: PAL.bark, over: 0 });
}
function owl(sx, sy, awake) {
  shape(blob(sx, sy - 10, 8, 10, 0.05, 4), '#a98a64', { w: 1 });
  shape([[sx - 7, sy - 18], [sx - 6, sy - 24], [sx - 3, sy - 19]], '#a98a64', { w: 0.7 });
  shape([[sx + 3, sy - 19], [sx + 6, sy - 24], [sx + 7, sy - 18]], '#a98a64', { w: 0.7 });
  for (const d of [-3.3, 3.3]) {
    if (awake) { shape(oval(sx + d, sy - 14, 2.8, 2.8, 10), '#f6d27a', { w: 0.7 }); blot(oval(sx + d, sy - 14, 1, 1, 8), INK); }
    else line([[sx + d - 2.4, sy - 14], [sx + d + 2.4, sy - 14]], { w: 0.9, over: 0 });
  }
}
function bat(sx, sy) {
  out.push(`<path d="M${n1(sx - 12)} ${n1(sy)}q4 -5 8 -1q2 -4 4 -1q2 -3 4 1q4 -4 8 1q-6 0 -8 4q-2 -2 -4 0q-2 -4 -12 -4z" fill="${INK}"/>`);
}
function fox(sx, sy) {
  shape(blob(sx - 16, sy - 9, 9, 4, 0.1, 4), '#d88a4e', { w: 0.9 });
  shape(capsule([sx - 8, sy - 10], [sx + 8, sy - 11], 5.5, 5), '#d88a4e', { w: 1 });
  for (const lx of [-6, 6]) line([[sx + lx, sy - 6], [sx + lx, sy]], { w: 1.4, over: 0 });
  shape([[sx + 9, sy - 20], [sx + 11, sy - 26], [sx + 13, sy - 19], [sx + 20, sy - 14], [sx + 9, sy - 12]], '#d88a4e', { w: 0.9 });
}
function rabbit(sx, sy) {
  shape(blob(sx, sy - 6, 7, 6, 0.05, 4), '#b9b2a6', { w: 0.9 });
  shape(oval(sx + 6, sy - 12, 4, 3.6, 12), '#b9b2a6', { w: 0.9 });
  for (const d of [4, 7]) shape(capsule([sx + d, sy - 15], [sx + d - 1, sy - 24], 1.4), '#b9b2a6', { w: 0.7 });
}
function frog(sx, sy) {
  out.push(`<ellipse cx="${n1(sx)}" cy="${n1(sy)}" rx="16" ry="7" fill="#7f9d6c" stroke="${INK}" stroke-width=".8"/>`);
  shape(blob(sx + 2, sy - 4, 5, 3.6, 0.05, 4), '#8fb873', { w: 0.8 });
  for (const d of [0, 4]) blot(oval(sx + d, sy - 8, 1.1, 1.1, 8), INK);
}
function heron(sx, sy) {
  for (const d of [-2, 2]) line([[sx + d, sy - 18], [sx + d, sy]], { w: 0.9, over: 0 });
  shape(blob(sx, sy - 22, 9, 5, 0.05, 4), '#c3c7cc', { w: 0.9 });
  line([[sx + 6, sy - 24], [sx + 8, sy - 34], [sx + 4, sy - 40]], { w: 2, col: '#c3c7cc', curve: true, over: 0 });
  shape([[sx + 4, sy - 42], [sx + 13, sy - 40], [sx + 4, sy - 38]], PAL.mustard, { w: 0.6 });
}
function raccoon(sx, sy) {
  shape(blob(sx - 14, sy - 8, 8, 3.6, 0.05, 4), '#8e96a3', { w: 0.8 });
  rule([-18, -14, -10].map(k => [[sx + k, sy - 11], [sx + k, sy - 5]]), INK, 1.4);
  shape(capsule([sx - 6, sy - 9], [sx + 6, sy - 10], 5.5, 5), '#8e96a3', { w: 1 });
  shape(oval(sx + 10, sy - 14, 5, 4.4, 12), '#8e96a3', { w: 0.9 });
  out.push(`<rect x="${n1(sx + 6)}" y="${n1(sy - 16)}" width="9" height="3" fill="${INK}"/>`);
}
function bearAt(sx, sy) {
  const b = '#7a5a40';
  for (const lx of [-14, -6, 8, 16]) shape(capsule([sx + lx, sy - 14], [sx + lx, sy - 1], 4), b, { w: 1 });
  shape(blob(sx, sy - 24, 24, 15, 0.08, 6), b, { w: 1.2 });
  shape(oval(sx + 24, sy - 30, 10, 9, 18), b, { w: 1.1 });
  for (const d of [-5, 5]) shape(oval(sx + 22 + d, sy - 39, 3.2, 3, 10), b, { w: 0.9 });
  shape(oval(sx + 32, sy - 28, 4, 3, 10), '#c9a173', { w: 0.8 });
  blot(oval(sx + 35, sy - 29, 1.3, 1, 8), INK); blot(oval(sx + 26, sy - 33, 1, 1.1, 8), INK);
}
function fish(sx, sy) { shape([[sx - 7, sy], [sx, sy - 4], [sx + 7, sy], [sx, sy + 3]], PAL.slate, { w: 0.8 }); shape([[sx - 7, sy], [sx - 12, sy - 4], [sx - 12, sy + 4]], PAL.slate, { w: 0.7 }); }
const hit = (say, x, y, z, fn, cls = 'hit') => { const [sx, sy] = P(x, y, z); group(`class="${cls}" data-say="${say}" data-x="${n1(sx)}" data-y="${n1(sy - 30)}"`, fn); };

function scene(id) {
  const lit = V.fire, food = V.food, dark = DARK[id], night = id === 'night' || id === 'bear';
  _seed = 1;
  board(-280, -280, 560, 560, 34, '#bccb9e', PAL.wood);
  rule(Array.from({ length: 300 }, () => { const [sx, sy] = P(-270 + rnd() * 540, -270 + rnd() * 540), s = rnd() < 0.5 ? -1 : 1; return [[sx, sy], [sx + s * 2, sy - 5]]; }), '#8fa87a', 0.6);
  // the lake, its reeds and lily pads
  const lk = LAKE.map(p => P(...p));
  flat(lk, '#b9cfd9'); line([...lk.slice(5), ...lk.slice(0, 1)].reverse(), { w: 1.4, col: '#7f9fb0', over: 0, curve: true });
  line(LAKE.slice(3).map(p => P(...p)), { w: 2, col: '#fffdf6', over: 0, curve: true, amp: 0.6 });
  group('id="waves"', () => rule(Array.from({ length: 14 }, (_, i) => { const [a, b] = P(90 + (i * 53) % 180, -260 + (i * 37) % 230); return [[a - 10, b], [a + 10, b]]; }), '#8fb3c8', 0.8));
  for (const [x, y] of [[255, -70], [230, -48], [262, -110]]) { const [sx, sy] = P(x, y); out.push(`<ellipse cx="${n1(sx)}" cy="${n1(sy)}" rx="9" ry="4" fill="#8fae84" stroke="${INK}" stroke-width=".6"/>`); }
  // a sandy path from the car to the fire
  const path = [P(140, 190), P(90, 80), P(40, 50)];
  line(path, { w: 16, col: '#e3d4b2', over: 0, curve: true });
  _seed = 2;
  for (const [x, y, h] of PINES) put(x + y, 0, pin(10 + x + y, () => group('class="plant tree"', () => pine(x, y, h))));
  put(OWL_TREE[0] + OWL_TREE[1], 0, pin(20, () => { tree(...OWL_TREE, 40, 0, '#7f9d6c'); const [sx, sy] = P(...OWL_TREE); hit(dark >= 0.3 ? 'hoo hoo' : 'zzz', ...OWL_TREE, 70, () => owl(sx + 16, sy - 54, dark >= 0.3), 'hit animal'); }));
  for (const [x, y] of [[250, -40], [270, -20], [50, -250], [62, -236]]) put(x + y, 0, pin(21 + x, () => { const [sx, sy] = P(x, y); for (let k = 0; k < 5; k++) line([[sx - 6 + k * 3, sy], [sx - 8 + k * 4, sy - 16 - (k % 2) * 6]], { w: 0.9, col: '#6f8f6c', over: 0 }); }));
  put(BOX[0] + BOX[1] + 60, 0, pin(30, () => group('class="hit" data-act="box"', () => bearBox(food))));
  put(TABLE[0] + TABLE[1], 0, pin(31, () => table(food && ['cooking', 'supper', 'lake', 'stories', 'bedtime'].includes(id))));
  put(-115, 1, pin(32, () => box(-62, -58, 0, 22, 14, 14, { left: PAL.sky, top: '#fffdf6', marks: false })));
  put(-195, 1, pin(33, () => cyl(-140, -55, 0, 7, 16, PAL.blue, { cap: PAL.sky })));
  put(-170, 0, pin(34, washLine));
  TENTS.forEach(([x, y, c], i) => put(x + y, 0, pin(40 + i, () => tent(x, y, c, !night && id !== 'bedtime'))));
  put(FIRE[0] + FIRE[1], 0, pin(50, () => group('class="hit" data-act="fire"', () => fireRing(lit))));
  put(FIRE[0] + FIRE[1] - 30, 1, pin(51, () => logSeat(20, -18, true)));
  put(FIRE[0] + FIRE[1] + 60, 1, pin(52, () => logSeat(20, 78, true)));
  put(FIRE[0] + FIRE[1] + 20, 1, pin(53, () => logSeat(-28, 30, false)));
  put(FIRE[0] + FIRE[1] + 40, 1, pin(54, () => logSeat(68, 30, false)));
  put(LANTERN[0] + LANTERN[1], 0, pin(55, () => lantern(['supper', 'lake', 'stories', 'bedtime'].includes(id))));
  put(200, 0, pin(56, woodpile));
  put(CAR[0] + CAR[1] + 40, 0, pin(57, car));
  put(-20, 0, pin(58, jetty));
  put(310, 0, pin(35, () => { gable(200, 100, 26, 26, 40, 12, { wall: PAL.wood, roof: PAL.bark }); doorL(206, 126, 0, 12, 26, PAL.tan); }));
  for (const [x, y, w] of [[150, 60, 14], [230, 160, 16], [-120, 250, 15], [-230, 110, 13], [60, 250, 12], [-40, -180, 13]]) put(x + y, 0, pin(36 + x, () => puff(x, y, 0, { hw: w, h: w * 1.4, col: '#8fae84' })));
  const cn = id === 'lake' ? CANOE_LAKE : CANOE_SHORE;
  put(cn[0] + cn[1], 0, pin(59, () => group('id="canoe"', () => canoe(cn[0], cn[1], id === 'lake' ? -2 : 0))));
  for (const [x, y, r] of [[110, 40, 9], [-20, -200, 11], [170, 140, 8], [-200, 210, 10]]) put(x + y, 0, pin(60 + x, () => { const [sx, sy] = P(x, y); shape(blob(sx, sy - r * 0.5, r * 1.3, r * 0.8, 0.12, 5), PAL.stone, { w: 1 }); }));
  // the campers, each at the spot of this stop
  CAMPERS.forEach((o, i) => { const s = spotOf(id, i); if (s) put(s[0] + s[1] + 2, 2, pin(70 + i, () => group(`id="cam${i}"`, () => who(s[0], s[1], { size: 0.62, ...o, ...s[3], hold: (id === 'stories' || id === 'bedtime') && s[3].arm === 'hold' ? h => line([h, [h[0] + 14, h[1] - 10]], { w: 1, col: PAL.bark, over: 0 }) : null }, s[2])))); });
  // the animals
  const d = DOG[id];
  put(d[0] + d[1] + 3, 2, pin(80, () => hit(night ? 'woof!' : 'woof', d[0], d[1], 0, () => group('id="dog"', () => dog(d[0], d[1], 0, '#cdb68e')), 'hit animal')));
  [[200, -230], [225, -214], [240, -244]].forEach(([x, y], i) => put(x + y, 3, pin(81 + i, () => hit('quack', x, y, 0, () => group(`class="duck animal" data-i="${i}"`, () => duck(...P(x, y)))))));
  put(-10, 3, pin(85, () => hit('ribbit', 255, -70, 0, () => frog(...P(255, -70)), 'hit animal')));
  put(-188, 3, pin(86, () => hit('...', 56, -244, 0, () => heron(...P(56, -244)), 'hit animal')));
  [[-36, -238, 1, true], [2, -250, -1, false]].forEach(([x, y, l, a], i) => put(x + y, 3, pin(87 + i, () => hit('', x, y, 0, () => deer(...P(x, y), l, a), 'hit animal'))));
  put(-90, 3, pin(89, () => { const [sx, sy] = P(150, -240); group('id="fish" class="animal"', () => fish(sx, sy - 10)); }));
  if (DARK[id] >= 0.45) [[1010, 560], [1090, 610], [940, 600]].forEach(([sx, sy], i) => put(-999, 3, () => group(`class="bat animal" data-i="${i}"`, () => bat(sx, sy))));
  if (DARK[id] < 0.7) put(170, 3, pin(90, () => hit('...', 10, 160, 0, () => rabbit(...P(10, 160)), 'hit animal')));
  if (DARK[id] >= 0.7) put(-290, 3, pin(91, () => hit('yip', -250, -40, 0, () => fox(...P(-250, -40)), 'hit animal')));
  if (night) put(-310, 3, pin(92, () => hit('chitter', -150, -160, 0, () => raccoon(...P(-150, -160)))));
  if (id === 'bear') put(-345, 3, pin(93, () => group('id="bear" class="hit animal" data-say="sniff, sniff"', () => bearAt(...P(-215, -150)))));
}

function glow(id) {
  const a = DARK[id];
  if (V.fire) { const [sx, sy] = P(...FIRE, 12); out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="80" fill="#f7c96a" opacity="${(0.06 + 0.16 * a).toFixed(2)}"/><circle cx="${n1(sx)}" cy="${n1(sy)}" r="30" fill="#f7d77a" opacity="${(0.1 + 0.22 * a).toFixed(2)}"/>`);
    // each puff starts part way up, so a still page shows a column, not a blob
    for (let k = 0; k < 4; k++) { const x = sx + 2, y = sy - 24, u = k / 4, sc = 0.6 + 1.6 * u; out.push(`<circle class="smoke" data-x="${n1(x)}" data-y="${n1(y)}" cx="${n1(x)}" cy="${n1(y)}" r="7" fill="#c9cdd2" opacity=".8" transform="translate(${n1(x + 40 * u)} ${n1(y - 70 * u)}) scale(${sc.toFixed(2)}) translate(${-x} ${-y})"/>`); }
    out.push(`<path d="${pathOf(blob(sx, sy - 16, 6, 10, 0.1, 4), true)}" fill="#f6d27a" opacity="${(0.5 * a).toFixed(2)}"/>`); }
  if (['supper', 'lake', 'stories', 'bedtime'].includes(id)) { const [sx, sy] = P(LANTERN[0] + 10, LANTERN[1], 52); out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="20" fill="#f7e3a0" opacity="${(0.25 + 0.45 * a).toFixed(2)}"/><circle cx="${n1(sx)}" cy="${n1(sy)}" r="4" fill="#fff4c8"/>`); }
  if (id === 'bedtime') for (const [x, y] of TENTS) out.push(`<path d="${pathOf(tentFaces(x, y).front, true)}" fill="#f7d77a" opacity=".4"/>`);
  if (a >= 0.25) group('id="flies"', () => {
    _seed = 9;
    for (let i = 0; i < 22; i++) { const [sx, sy] = P(-240 + rnd() * 420, -200 + rnd() * 440, 20 + rnd() * 40); out.push(`<circle class="fly" cx="${n1(sx)}" cy="${n1(sy)}" r="2.6" fill="#f3f08a"/>`); }
  });
  _seed = 11;
  for (const [x, y] of [[130, -200], [220, -120], [180, -60]]) { const [sx, sy] = P(x, y); out.push(`<ellipse class="ripple" data-x="${n1(sx)}" data-y="${n1(sy)}" cx="${n1(sx)}" cy="${n1(sy)}" rx="14" ry="6" fill="none" stroke="#fffdf6" stroke-width="1.2"/>`); }
}

// the red ring round what this stop is about
const FOCUS = { pitch: [-150, 100, 20, 120, 70], cooking: [...FIRE, 14, 46, 30], supper: [...TABLE, 18, 70, 46], lake: [150, -150, 0, 110, 60], stories: [...FIRE, 14, 76, 50], bedtime: [-120, 130, 20, 120, 80], night: [-183, -106, 20, 46, 34], bear: [-200, -130, 24, 70, 44] };

function draw(seed) {
  begin(seed);
  OX = 700; OY = 690;
  const a = DARK[AT], wm = WARM[AT];
  const rr = (1 - 0.62 * a).toFixed(3), gg = ((1 - 0.52 * a) * (1 - 0.1 * wm)).toFixed(3), bb = ((1 - 0.2 * a) * (1 - 0.28 * wm)).toFixed(3);
  out.push(`<defs><filter id="dusk" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${rr} 0 0 0 0 0 ${gg} 0 0 0 0 0 ${bb} 0 0 0 0 0 1 0"/></filter></defs>`);
  out.push('<g filter="url(#dusk)">');
  scene(AT);
  flush();
  out.push('</g>');
  glow(AT);
  // sun low in the west, then the moon
  { const h = HOUR[AT], day = h < 20.5, sx = 1290, sy = 236;
    if (day) { shape(oval(sx, sy, 12, 12, 24), wm > 0.5 ? PAL.brick : PAL.mustard); for (let r = 0; r < 8; r++) { const t = r / 8 * 2 * Math.PI; line([[sx + Math.cos(t) * 17, sy + Math.sin(t) * 17], [sx + Math.cos(t) * 23, sy + Math.sin(t) * 23]], { w: 1.2, over: 0 }); } }
    else { shape(oval(sx, sy, 12, 12, 24), PAL.butter); out.push(`<path d="${pathOf(oval(sx + 6, sy - 4, 10, 10, 24), true)}" fill="${PAPER}"/>`); } }

  // the evening, in order: each stop a pill; the bear sits off the chain
  const PX = id => (id === 'bear' ? 1228 : 182 + IDS.indexOf(id) * 140), PY = 1238;
  dash([PX('pitch') - 50, PY], [PX('night') + 50, PY], MUTE, 3, 5, 0.9);
  dash([PX('night') + 52, PY], [PX('bear') - 52, PY], RED, 2, 4, 0.9);
  for (const id of IDS) group(`data-state="${id}"`, () => {
    _text(PX(id), PY - 24, clock(HOUR[id]), { size: 14, col: MUTE, anchor: 'middle' });
    pill(PX(id), PY, PILL[id]);
    out.push('<g class="on">');
    pill(PX(id), PY, PILL[id], { lit: true });
    const [x, y, z, rx, ry] = FOCUS[id], [sx, sy] = P(x, y, z);
    litRing(oval(sx, sy, rx, ry, 22));
    out.push('</g>');
  });

  title('an annotated scene', 'A campsite at dusk');
  subtitle('ten things, one evening: who is where, what is lit');
  const who6 = !V.away ? '6 at camp' : AT === 'lake' ? 'nobody at camp' : 'all asleep';
  status(`${clock(HOUR[AT])}, ${NAMES[AT]}`, `fire ${V.fire ? 'lit' : 'out'} · food ${V.food ? 'out' : 'stowed'} · ${who6}`);
  const tentW = AT === 'pitch' ? 'GOING UP' : AT === 'bedtime' ? 'LIT' : ['night', 'bear'].includes(AT) ? 'ZIPPED' : 'PITCHED';
  const tableW = AT === 'cooking' ? 'SET' : ['supper', 'lake', 'stories', 'bedtime'].includes(AT) && V.food ? 'SUPPER' : 'CLEARED';
  const lamp = ['supper', 'lake', 'stories', 'bedtime'].includes(AT);
  const cn = AT === 'lake' ? CANOE_LAKE : CANOE_SHORE;
  label(72, 290, `BEAR BOX · ${V.food ? 'OPEN' : 'LOCKED'}`, 'all the food in by bed', [BOX[0] + 10, BOX[1] + 14, 40]);
  label(72, 410, `TENTS · ${tentW}`, 'three tents, six sleeping bags', [TENTS[0][0], TENTS[0][1] + 10, 28]);
  label(72, 870, `CAMPFIRE · ${V.fire ? 'LIT' : 'OUT'}`, 'never left alone', [FIRE[0], FIRE[1] + 10, 6]);
  label(72, 990, `LANTERN · ${lamp ? 'ON' : 'OFF'}`, 'from supper till lights out', [LANTERN[0] + 10, LANTERN[1], 52]);
  label(72, 1110, `CAR · ${AT === 'pitch' ? 'UNPACKING' : 'PARKED'}`, 'the cool box came in it', [CAR[0] + 36, CAR[1] + 30, 20]);
  label(1328, 290, `OWL · ${a >= 0.3 ? 'AWAKE' : 'ASLEEP'}`, 'hoots from the old oak', [OWL_TREE[0], OWL_TREE[1] - 20, 64], 'end');
  label(1328, 410, `PICNIC TABLE · ${tableW}`, 'two benches, one cloth', [TABLE[0] + 20, TABLE[1] - 10, 24], 'end');
  label(1328, 870, `THE LAKE · ${AT === 'lake' ? 'BUSY' : 'STILL'}`, 'ducks, a heron, a frog', [220, -150, 0], 'end');
  label(1328, 990, `CANOE · ${AT === 'lake' ? 'OUT' : 'BEACHED'}`, 'on the shore by dark', [cn[0] + 10, cn[1] + 4, 4], 'end');
  label(1328, 1110, `FIREFLIES · ${a >= 0.25 ? 'OUT' : 'NOT YET'}`, 'they come out at dusk', [110, 60, 40], 'end');
  footnote('Illustrative: a made-up campsite and evening. Bear boxes are the rule where black bears live; food left out teaches a bear to come back.');
  finish();
}

// the next stop from a state, as the statechart has it
function plan(at, v) {
  switch (at) {
    case 'pitch': return { to: 'cooking', v: { ...v, fire: true, food: true } };
    case 'cooking': return { to: 'supper', v };
    case 'supper': return v.fire ? { no: 'The fire is still burning. Douse it before everyone walks to the lake.' } : { to: 'lake', v: { ...v, away: true } };
    case 'lake': return { to: 'stories', v: { ...v, away: false, fire: true }, say: SAY.stories };
    case 'stories': return v.fire ? { no: 'The fire is still burning. Douse it before bed.' } : { to: 'bedtime', v };
    case 'bedtime': return v.food ? { no: 'The food is still out. Put it in the bear box first.' } : { to: 'night', v: { ...v, away: true } };
    case 'bear': return { to: 'night', v, say: 'The bear gives up on the locked box and goes back into the trees.' };
    default: return { to: 'pitch', v: { ...v, away: false }, say: 'Sunrise. A new day: the tents come down, and go up at the next site.' };
  }
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(SEED); ctx.state(AT); };
  // everyone walks from their spot at one stop to their spot at the next; the tents are the spot of a camper who is in bed
  const walkTo = (from, to, then) => {
    const moves = CAMPERS.map((_, i) => [i, spotOf(from, i), spotOf(to, i) || doorOf(i)]).filter(m => m[1]);
    if (ctx.still || !moves.length) { then(); return; }
    let far = moves[0], fd = -1;
    for (const m of moves) { const a = P(m[1][0], m[1][1]), b = P(m[2][0], m[2][1]), d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (d > fd) { fd = d; far = m; } }
    for (const m of moves) {
      if (m === far) continue;
      const el = $(`cam${m[0]}`); if (!el || !el.animate) continue;
      const a = P(m[1][0], m[1][1]), b = P(m[2][0], m[2][1]);
      el.animate([{ transform: 'translate(0px,0px)' }, { transform: `translate(${n1(b[0] - a[0])}px,${n1(b[1] - a[1])}px)` }], { duration: glideMs(Math.hypot(b[0] - a[0], b[1] - a[1])), easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
    }
    glide(ctx, $(`cam${far[0]}`), [far[1][0], far[1][1]], [far[2][0], far[2][1]], { arc: 10, then });
  };
  // a camper who was in a tent comes out of it
  const comeOut = (from, to) => CAMPERS.forEach((_, i) => { if (!spotOf(from, i) && spotOf(to, i)) arrive(ctx, $(`cam${i}`), doorOf(i), spotOf(to, i).slice(0, 2), { delay: i * 70 }); });
  const go = (to, v, say) => {
    const from = AT;
    ctx.say(say || SAY[to]);
    const land = () => {
      AT = to; V = v; crossfade(ctx, redraw); comeOut(from, to);
      const dg = $('dog'); if (dg && DOG[from] !== DOG[to]) arrive(ctx, dg, DOG[from], DOG[to]);
      if (to === 'bear') arrive(ctx, $('bear'), [-300, -150], [-215, -150]);
    };
    if (from === 'bear' && to === 'night' && $('bear')) glide(ctx, $('bear'), [-215, -150], [-320, -150], { then: land });
    else walkTo(from, to, land);
  };

  const douse = () => {
    if (!V.fire) return ctx.no(AT === 'pitch' ? 'There is no fire yet.' : 'The fire is out already.');
    if (AT === 'cooking') return ctx.no('Supper is still on the fire. Douse it after supper.');
    V.fire = false; crossfade(ctx, redraw);
    ctx.say('A bucket of lake water, a stir, another bucket. Cold ash.');
  };
  const stow = () => {
    if (!V.food) return ctx.no('The food is in the bear box already.');
    if (AT !== 'bedtime') return ctx.no(AT === 'lake' ? 'Everyone is at the lake. The food goes in at bedtime.' : 'People are still eating. The food goes in at bedtime.');
    V.food = false; crossfade(ctx, redraw); ctx.hop($('cam5'));
    ctx.say('The pot, the bread, the marshmallows, the cool box: all in. Lid latched.');
  };
  ctx.button('next step', () => {
    const p = plan(AT, V);
    if (p.no) return ctx.no(p.no);
    go(p.to, p.v, p.say);
  });
  ctx.button('douse the fire', douse);
  ctx.button('stow the food', stow);
  ctx.button('a bear comes', () => {
    if (AT === 'bear') return ctx.no('The bear is here already.');
    if (AT !== 'night') return ctx.no('Bears keep away while people are up. It comes in the night.');
    go('bear', V);
  });
  ctx.hint('Press Play all, or next step. Tap the fire or the bear box. Leave the fire burning and see.');
  redraw();

  return {
    goto(id, play) {
      const v = canon(id);
      if (play && id !== AT) go(id, v);
      else { AT = id; V = v; ctx.say(SAY[id]); redraw(); }
    },
    tick(t) {
      document.querySelectorAll('#art .smoke').forEach((p, i) => rise(p, (t * 0.25 + i / 4) % 1, 40, -70, 0.6, 2.2));
      document.querySelectorAll('#art .ripple').forEach((r, i) => rise(r, (t * 0.3 + i / 3) % 1, 0, 0, 0.3, 1.8));
      document.querySelectorAll('#art .fly').forEach((f, i) => { f.setAttribute('transform', `translate(${n1(Math.sin(t * 0.7 + i) * 10)} ${n1(Math.cos(t * 0.5 + i * 2) * 8)})`); f.style.opacity = (0.15 + 0.85 * Math.max(0, Math.sin(t * 2.4 + i * 1.7))).toFixed(2); });
      document.querySelectorAll('#art .duck').forEach((d, i) => { const k = t * 0.3 + i * 2.1; d.setAttribute('transform', `translate(${n1(Math.cos(k) * 22)} ${n1(Math.sin(k * 1.3) * 9)})`); });
      document.querySelectorAll('#art .bat').forEach((b, i) => b.setAttribute('transform', `translate(${n1(Math.sin(t * 0.8 + i * 2) * 60)} ${n1(Math.sin(t * 1.9 + i) * 18)})`));
      const w = $('waves'); if (w) w.setAttribute('transform', `translate(${n1(Math.sin(t * 0.8) * 6)} ${n1(Math.cos(t * 0.8) * 2)})`);
      const f = $('flame'); if (f) f.setAttribute('transform', `translate(0 ${n1(Math.sin(t * 9) * 1.4)})`);
      const fs = $('fish'); if (fs) { const k = (t * 0.4) % 1; fs.setAttribute('transform', `translate(${n1(k * 30)} ${n1(-Math.max(0, Math.sin(k * Math.PI * 4)) * 22)})`); fs.style.opacity = k < 0.5 ? '1' : '0'; }
      const dg = $('dog'); if (dg && ['pitch', 'cooking', 'lake'].includes(AT)) stroll(dg, [DOG[AT], [DOG[AT][0] + 40, DOG[AT][1] + 20]], t, 16);
    },
    click(e) {
      const g = e.target.closest && e.target.closest('.hit');
      if (!g) return;
      if (g.dataset.act === 'fire') {
        if (V.fire) return douse();
        return ctx.no(AT === 'pitch' ? 'Not lit yet. Next step lights it.' : 'The fire is out. Cold ash.');
      }
      if (g.dataset.act === 'box') return V.food ? stow() : ctx.no('Locked. Every crumb is in already.');
      if (g.dataset.say) { ctx.hop(g); ctx.bubble(+g.dataset.x, +g.dataset.y, g.dataset.say); }
    },
    story: IDS,
  };
}
