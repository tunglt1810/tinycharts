// Which house plant suits the room, as a decision tree: three questions on
// cards, a yes and a no under each, eight plants on one shelf at the foot.
const ABOUT = 'every answer, and every outcome in view';
// card: centre, width, question, small line
const CARDS = {
  light: [700, 300, 300, 'bright window?', 'question 1 of 3'],
  pets_b: [370, 480, 250, 'pets?', 'bright · question 2'], pets_s: [1030, 480, 250, 'pets?', 'shade · question 2'],
  water_bp: [215, 650, 260, 'water weekly?', 'bright, pets'], water_bn: [525, 650, 260, 'water weekly?', 'bright, no pets'],
  water_sp: [875, 650, 260, 'water weekly?', 'shade, pets'], water_sn: [1185, 650, 260, 'water weekly?', 'shade, no pets'],
};
const CH = 76;
const KIDS = { light: ['pets_b', 'pets_s'], pets_b: ['water_bp', 'water_bn'], pets_s: ['water_sp', 'water_sn'] };
// the eight plants, left to right on the shelf: answers, name, kind, pet-safe
const PLANTS = [
  ['yyy', 'spider plant', 'spider', true], ['yyn', 'haworthia', 'haworthia', true],
  ['yny', 'fiddle-leaf fig', 'fig', false], ['ynn', 'aloe', 'aloe', false],
  ['nyy', 'Boston fern', 'fern', true], ['nyn', 'cast-iron plant', 'castiron', true],
  ['nny', 'peace lily', 'lily', false], ['nnn', 'snake plant', 'snake', false],
];
const WATER = { yy: 'water_bp', yn: 'water_bn', ny: 'water_sp', nn: 'water_sn' };
const SHELF = 880, END = { potted: [640, 1100, 230], high_shelf: [1120, 1100, 220], done: [250, 1100, 200] };
const END_TEXT = { potted: ['potted', 'in the room'], high_shelf: ['high shelf', 'out of reach'], done: ['all done', 'three rooms'] };
const BACK = 1368;
let AT = 'light';
let V = { path: '', plant: '', pets: false, rooms: 0, kitten: false, trail: [] };

const plantX = i => [145, 285, 455, 595, 805, 945, 1115, 1255][i];
const plantOf = path => PLANTS.findIndex(p => p[0] === path);
const top = id => CARDS[id] ? [CARDS[id][0], CARDS[id][1] - CH / 2] : [END[id][0], END[id][1] - 32];
const bot = id => [CARDS[id][0], CARDS[id][1] + CH / 2];
const left = id => [END[id][0] - END[id][2] / 2, END[id][1]];
const right = id => [END[id][0] + END[id][2] / 2, END[id][1]];
const tok = id => (CARDS[id] ? [CARDS[id][0] + CARDS[id][2] / 2 + 16, CARDS[id][1] - 20] : [END[id][0] + END[id][2] / 2 + 16, END[id][1] - 18]);
const words = (x, y, s, o = {}) => _text(x, y, s, { size: 15, col: LEAD, ...o });

function card(cx, cy, w, h, big, small) {
  const c = [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]];
  out.push(`<rect x="${n1(cx - w / 2 + 4)}" y="${n1(cy - h / 2 + 5)}" width="${w}" height="${h}" rx="9" fill="${SHADOW}"/>`);
  out.push(`<rect x="${n1(cx - w / 2)}" y="${n1(cy - h / 2)}" width="${w}" height="${h}" rx="9" fill="#fffdf6"/>`);
  rim(c, 1.2);
  _text(cx + w / 2 - 16, cy + (small ? -2 : 7), big, { size: 23, anchor: 'end' });
  if (small) _text(cx + w / 2 - 16, cy + 22, small, { size: 13, col: MUTE, anchor: 'end' });
}

// a leaf from base (bx, by), pointing at angle a (0 = up), len long, wid wide
function leaf(bx, by, a, len, wid, col, w = 0.9) {
  const ux = Math.sin(a), uy = -Math.cos(a), pts = [];
  for (let k = 0; k <= 8; k++) { const t = k / 8, s = Math.sin(Math.PI * t) * wid; pts.push([bx + ux * len * t - uy * s, by + uy * len * t + ux * s]); }
  for (let k = 7; k > 0; k--) { const t = k / 8, s = Math.sin(Math.PI * t) * wid; pts.push([bx + ux * len * t + uy * s, by + uy * len * t - ux * s]); }
  shape(pts, col, { w });
}

// a potted plant standing on sheet point (sx, sy)
function plant(kind, sx, sy, s = 1) {
  const [x, y] = at(sx, sy), potCol = { spider: PAL.brick, haworthia: PAL.stone, fig: PAL.sand, aloe: PAL.brick, fern: PAL.sky, castiron: PAL.slate || PAL.grey, lily: PAL.butter, snake: PAL.sand }[kind];
  out.push(`<g transform="translate(${n1(sx)} ${n1(sy)}) scale(${s}) translate(${n1(-sx)} ${n1(-sy)})">`);
  pot(x, y, 0, false, potCol);
  const bx = sx, by = sy - 17;
  if (kind === 'spider') for (let k = -3; k <= 3; k++) line(spline([[bx, by], [bx + k * 7, by - 22 + Math.abs(k) * 3], [bx + k * 13, by - 14 + Math.abs(k) * 6]], false, 2), { w: 2.4, col: k % 2 ? PAL.leaf : PAL.mint, over: 0 });
  if (kind === 'haworthia') for (let k = -3; k <= 3; k++) leaf(bx + k * 2, by + 2, k * 0.38, 18 - Math.abs(k) * 2, 3.4, k % 2 ? PAL.leaf : PAL.sage);
  if (kind === 'fig') {
    line([[bx, by], [bx + 2, by - 62]], { w: 2.2, col: PAL.bark, over: 0 });
    for (const [dy, a] of [[-16, -0.9], [-28, 0.9], [-40, -0.7], [-50, 0.7], [-62, 0]]) leaf(bx + 1, by + dy, a, 22, 9, PAL.leaf);
  }
  if (kind === 'aloe') for (let k = -3; k <= 3; k++) leaf(bx + k * 2, by + 2, k * 0.32, 32 - Math.abs(k) * 4, 4.4, PAL.sage);
  if (kind === 'fern') for (let k = -4; k <= 4; k++) leaf(bx, by - 4, k * 0.42, 26, 6, k % 2 ? PAL.leaf : PAL.mint, 0.7);
  if (kind === 'castiron') for (let k = -2; k <= 2; k++) leaf(bx + k * 3, by, k * 0.28, 44 - Math.abs(k) * 6, 7, k % 2 ? PAL.leaf : '#5c7f5a');
  if (kind === 'lily') {
    for (let k = -3; k <= 3; k++) leaf(bx + k * 2, by, k * 0.4, 28, 7, '#4f7a4e');
    for (const [dx, h] of [[-4, 40], [6, 34]]) { line([[bx + dx, by], [bx + dx, by - h]], { w: 1.2, col: '#4f7a4e', over: 0 }); leaf(bx + dx, by - h + 2, 0, 14, 5, '#fffdf6', 0.8); }
  }
  if (kind === 'snake') for (let k = -2; k <= 2; k++) leaf(bx + k * 5, by + 2, k * 0.08, 52 - Math.abs(k) * 8, 5.2, k % 2 ? '#5c7f5a' : PAL.leaf);
  out.push('</g>');
}

function windowIcon(cx, cy) {
  const c = [[cx - 18, cy - 20], [cx + 18, cy - 20], [cx + 18, cy + 20], [cx - 18, cy + 20]];
  fill(c, '#dfeef2', { amp: 0.2 }); rim(c, 1.1);
  line([[cx, cy - 20], [cx, cy + 20]], { w: 1, over: 0 }); line([[cx - 18, cy], [cx + 18, cy]], { w: 1, over: 0 });
  out.push(`<circle cx="${n1(cx + 26)}" cy="${n1(cy - 18)}" r="6" fill="${PAL.mustard}"/>`);
}
function canIcon(cx, cy) {
  shape([[cx - 12, cy - 10], [cx + 10, cy - 10], [cx + 12, cy + 14], [cx - 14, cy + 14]], PAL.sage, { w: 1 });
  line([[cx + 10, cy - 2], [cx + 19, cy - 11]], { w: 2.2, over: 0 });
  for (const d of [0, 5, 10]) out.push(`<circle cx="${n1(cx + 21 + d / 3)}" cy="${n1(cy - 6 + d)}" r="1.5" fill="${PAL.sky}"/>`);
}

function tree() {
  // the two halves: bright and shade
  for (const [x0, x1, cap, col] of [[60, 680, 'bright, by a window', '#f6eedc'], [720, 1340, 'shade, away from it', '#e8edf0']]) {
    out.push(`<rect x="${x0}" y="396" width="${x1 - x0}" height="574" rx="16" fill="${col}" stroke="#a89c8a" stroke-width="1.2" stroke-dasharray="6 6"/>`);
    _text(x0 + 18, 420, cap, { cls: 'cap', size: 14, col: LEAD });
  }
  // start dot
  out.push(`<circle cx="700" cy="230" r="6" fill="${INK}"/>`);
  flowArrow([[700, 236], top('light')], { col: INK, w: 1.4 });
  // branches with their answers
  for (const [id, [a, b]] of Object.entries(KIDS)) {
    const [x, y] = bot(id), my = y + 30;
    for (const [k, kid] of [[0, a], [1, b]]) {
      const [tx, ty] = top(kid), sx = x + (k ? 24 : -24);
      flowArrow([[sx, y], [sx, my], [tx, my], [tx, ty - 2]], { col: INK, w: 1.3 });
      PILLS.push([(sx + tx) / 2, my, k ? 'no' : 'yes']);
    }
  }
  for (const [ab, id] of Object.entries(WATER)) {
    const [x, y] = bot(id);
    for (const [k, ans] of [[0, 'y'], [1, 'n']]) {
      const i = plantOf(ab[0] + ab[1] + ans), px = plantX(i);
      flowArrow([[x + (k ? 18 : -18), y], [x + (k ? 18 : -18), y + 30], [px, y + 30], [px, SHELF - 86]], { col: INK, w: 1.3 });
      PILLS.push([(x + px) / 2 + (k ? 14 : -14), y + 30, k ? 'no' : 'yes']);
    }
  }
}

function shelf() {
  const plank = [[66, SHELF], [1334, SHELF], [1334, SHELF + 16], [66, SHELF + 16]];
  fill([[70, SHELF + 18], [1338, SHELF + 18], [1338, SHELF + 24], [70, SHELF + 24]], SHADOW, { amp: 0.2 });
  fill(plank, PAL.wood, { amp: 0.3 }); rim(plank, 1.1);
  PLANTS.forEach(([path, name, kind, safe], i) => {
    const x = plantX(i), picked = V.plant === path && AT !== 'light' && !CARDS[AT];
    if (!picked) plant(kind, x, SHELF + 2, 1.35);
    else out.push(`<ellipse cx="${x}" cy="${SHELF + 1}" rx="13" ry="4" fill="${SHADOW}"/>`);
    _text(x, SHELF + 42, name, { size: 15, anchor: 'middle' });
    _text(x, SHELF + 62, safe ? 'pet-safe' : 'bad for pets', { size: 13, col: safe ? MUTE : RED, anchor: 'middle' });
  });
  // all eight join to the pot
  const y = 1000;
  out.push(`<path d="${pathOf([[plantX(0), SHELF + 72], [plantX(0), y], [plantX(7), y], [plantX(7), SHELF + 72]])}" fill="none" stroke="#a89c8a" stroke-width="1.2"/>`);
  for (let i = 1; i < 7; i++) out.push(`<path d="M${plantX(i)} ${SHELF + 72}V${y}" fill="none" stroke="#a89c8a" stroke-width="1.2"/>`);
  flowArrow([[END.potted[0], y], top('potted')], { col: INK, w: 1.3 });
}

function ends() {
  for (const id of ['potted', 'high_shelf', 'done']) {
    const [x, y, w] = END[id];
    group(`data-state="${id}"`, () => {
      card(x, y, w, 64, ...END_TEXT[id]);
      out.push('<g class="on">');
      litRing([[x - w / 2 - 7, y - 39], [x + w / 2 + 7, y - 39], [x + w / 2 + 7, y + 39], [x - w / 2 - 7, y + 39]]);
      nowTag(x + w / 2 - 34, y - 42);
      out.push('</g>');
    });
  }
  // the picked plant, in its new place
  const i = plantOf(V.plant);
  if (i >= 0 && !CARDS[AT] && AT !== 'light') group('id="picked"', () => {
    const [x, y] = AT === 'high_shelf' ? [END.high_shelf[0] - 70, END.high_shelf[1] + 22] : [END.potted[0] - 82, END.potted[1] + 22];
    plant(PLANTS[i][2], x, y, 0.9);
  });
  // a kitten? the choice, and the high shelf
  const [px, py] = right('potted'), [hx] = left('high_shelf'), dx = (px + hx) / 2, dia = [[dx, py - 16], [dx + 20, py], [dx, py + 16], [dx - 20, py]];
  line([[px, py], [dx - 20, py]], { w: 1.3, over: 0 });
  fill(dia, PAL.butter, { amp: 0.3 }); rim(dia, 1.1);
  flowArrow([[dx + 20, py], [hx - 2, py]], { col: INK, w: 1.3 });
  words(dx, py - 26, 'a kitten?', { anchor: 'middle' });
  words(dx, py + 36, '[bad for pets]', { anchor: 'middle', col: RED });
  // next room: the way back up the right edge, and start again up the left
  const [rx, ry] = right('high_shelf');
  flowArrow([[rx, ry], [BACK, ry], [BACK, CARDS.light[1]], [CARDS.light[0] + CARDS.light[2] / 2 + 4, CARDS.light[1]]], { dashed: true });
  flowArrow([[END.potted[0], END.potted[1] + 32], [END.potted[0], 1160], [BACK, 1160], [BACK, ry + 8]], { dashed: true });
  out.push(`<text class="it" x="${BACK - 8}" y="760" font-size="15" fill="${LEAD}" transform="rotate(-90 ${BACK - 8} 760)" text-anchor="middle">next room [a room is left]</text>`);
  const [lx, ly] = left('potted'), [dr] = right('done');
  flowArrow([[lx, ly], [dr + 2, ly]], { col: INK, w: 1.3 });
  words((lx + dr) / 2, ly - 10, 'no room left', { anchor: 'middle' });
  const [sx, sy] = left('done');
  flowArrow([[sx, sy], [36, sy], [36, CARDS.light[1]], [CARDS.light[0] - CARDS.light[2] / 2 - 4, CARDS.light[1]]], { dashed: true });
  out.push(`<text class="it" x="28" y="760" font-size="15" fill="${LEAD}" transform="rotate(-90 28 760)" text-anchor="middle">start again</text>`);
}

function cards() {
  for (const [id, [x, y, w, big, small]] of Object.entries(CARDS)) group(`data-state="${id}"`, () => {
    card(x, y, w, CH, big, small);
    out.push('<g class="on">');
    litRing([[x - w / 2 - 7, y - CH / 2 - 7], [x + w / 2 + 7, y - CH / 2 - 7], [x + w / 2 + 7, y + CH / 2 + 7], [x - w / 2 - 7, y + CH / 2 + 7]]);
    nowTag(x + w / 2 - 34, y - CH / 2 - 10);
    out.push('</g>');
  });
  // icons on the cards
  windowIcon(CARDS.light[0] - 112, CARDS.light[1]);
  for (const id of ['pets_b', 'pets_s']) cat(...at(CARDS[id][0] - 90, CARDS[id][1] + 26), 0, id === 'pets_b' ? '#e3c77a' : '#c9c2b8');
  for (const id of Object.values(WATER)) canIcon(CARDS[id][0] - CARDS[id][2] / 2 + 24, CARDS[id][1] + 4);
}

function people() {
  // the shop: a counter with a till, a seller, and two who came to choose
  box(...at(1000, 300), 0, 70, 40, 36, { left: PAL.wood, top: PAL.sand, marks: false });
  box(...at(1012, 288), 36, 20, 16, 14, { left: PAL.slate || PAL.grey, top: PAL.grey, marks: false });
  person(1110, 340, { shirt: PAL.sage, pants: PAL.bark, hair: 'bun', arm: 'out', look: -1, say: 'Light first. Always light first.' });
  person(440, 350, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'hold', look: 1, say: 'Something that will not die on me.' });
  person(400, 356, { shirt: PAL.rose, pants: PAL.slate || PAL.grey, hair: 'long', kid: true, arm: 'up', look: 1, say: 'The spiky one!' });
  group('id="owner"', () => person(470, 1215, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'hold', look: -1 }));
  group('id="kitten"', () => { if (V.kitten) cat(...at(1150, 1200), 0, '#e3c77a'); });
}

// the answers not taken, under a paper mist: each sibling of the path so far,
// from its own yes or no pill down
const EDGE = [60, 215, 370, 525, 700, 875, 1030, 1185, 1340], FOG_TOP = [0, 352, 532, 702];
function fog() {
  if (!CARDS[AT] && AT !== 'potted' && AT !== 'high_shelf') return;
  for (let k = 1; k <= V.path.length; k++) {
    const sib = V.path.slice(0, k - 1) + (V.path[k - 1] === 'y' ? 'n' : 'y');
    const idx = PLANTS.map((p, i) => (p[0].startsWith(sib) ? i : -1)).filter(i => i >= 0);
    const x0 = EDGE[idx[0]] + 4, x1 = EDGE[idx[idx.length - 1] + 1] - 4, y0 = FOG_TOP[k];
    out.push(`<rect class="fog" data-depth="${k}" x="${x0}" y="${y0}" width="${x1 - x0}" height="${958 - y0}" rx="16" fill="${PAPER}" opacity=".68"/>`);
  }
}

// the tree's own lines from one place to the next, as sheet polylines
function route(from, to, path = V.path) {
  if (CARDS[from] && CARDS[to]) {
    const [x, y] = bot(from), [tx, ty] = top(to), sx = x + (KIDS[from].indexOf(to) ? 24 : -24);
    return [[[sx, y], [sx, y + 30], [tx, y + 30], [tx, ty - 2]]];
  }
  if (CARDS[from] && to === 'potted') {
    const [x, y] = bot(from), px = plantX(plantOf(path)), sx = x + (path[2] === 'n' ? 18 : -18);
    return [[[sx, y], [sx, y + 30], [px, y + 30], [px, SHELF - 86]], [[px, SHELF + 72], [px, 1000], [END.potted[0], 1000], top('potted')]];
  }
  if (from === 'potted' && to === 'high_shelf') return [[right('potted'), left('high_shelf')]];
  if (from === 'potted' && to === 'done') return [[left('potted'), right('done')]];
  return [];
}
// every line from the first question down to place id
function routeTo(id, path) {
  const stops = ['light'];
  if (path.length >= 1) stops.push(path[0] === 'y' ? 'pets_b' : 'pets_s');
  if (path.length >= 2) stops.push(WATER[path.slice(0, 2)]);
  if (!CARDS[id]) stops.push('potted');
  if (id === 'high_shelf') stops.push('high_shelf');
  return stops.slice(1).flatMap((s, i) => route(stops[i], s, path));
}

// the yes and no on each branch, drawn over the red trail so it never hides them
let PILLS = [];
function draw(seed) {
  begin(seed);
  OX = 700; OY = 0;
  PILLS = [];
  tree();
  shelf();
  cards();
  group('id="trail"', () => {
    for (const leg of V.trail) out.push(`<path d="${pathOf(leg)}" fill="none" stroke="${RED}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`);
  });
  for (const p of PILLS) pill(...p);
  fog();
  ends();
  people();
  group('id="token"', () => {
    const [tx, ty] = tok(AT), o = oval(tx, ty, 10, 10, 16);
    shape(o, RED, { w: 1.2 }); out.push(`<circle cx="${n1(tx)}" cy="${n1(ty)}" r="3.4" fill="${PAPER}"/>`);
  });
  title('a decision tree', 'Which house plant?');
  subtitle('three questions, eight plants, one shelf');
  const left8 = PLANTS.filter(([p]) => p.startsWith(V.path)).length;
  const big = CARDS[AT] ? CARDS[AT][3] : AT === 'done' ? 'a plant in every room' : PLANTS[plantOf(V.plant)]?.[1] || 'potted';
  status(big, `room ${Math.min(3, V.rooms + (CARDS[AT] || AT === 'light' ? 1 : 0))} of 3 · ${CARDS[AT] ? `${left8} of 8 plants possible` : AT === 'high_shelf' ? 'up, out of reach' : V.pets ? 'pets in the room' : 'no pets'}`);
  legend([{ col: '#f6eedc', text: 'bright half' }, { col: '#e8edf0', text: 'shade half' }], 72, 1262);
  _text(470, 1262, 'red word: bad for cats and dogs', { size: 16, col: RED });
  footnote('Illustrative: a made-up shop and flat. Which plants are bad for cats and dogs is from common lists; check one before you buy.');
  finish();
}

// the token's way from one place to the next, as sheet points
function way(from, to, path = V.path) {
  if (CARDS[from] && CARDS[to]) { const [x, y] = bot(from); return [tok(from), [x, y + 30], top(to), tok(to)]; }
  if (CARDS[from] && to === 'potted') { const px = plantX(plantOf(path)); return [tok(from), [px, bot(from)[1] + 30], [px, 1000], [END.potted[0], 1000], tok(to)]; }
  if (from === 'potted' && to === 'high_shelf') return [tok(from), [(right('potted')[0] + left('high_shelf')[0]) / 2, END.potted[1]], tok(to)];
  if (to === 'light' && from !== 'done') return [tok(from), [BACK, END[from][1]], [BACK, CARDS.light[1]], tok(to)];
  if (to === 'light') return [tok(from), [36, END.done[1]], [36, CARDS.light[1]], tok(to)];
  if (to === 'done') return [tok(from), [END.done[0], END.done[1] - 40], tok(to)];
  return [tok(from), tok(to)];
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(13); ctx.state(AT); };
  const go = (to, change = () => {}, path = V.path) => {
    const legs = route(AT, to, path), pts = legs.length ? [tok(AT), ...legs.flat(), tok(to)] : way(AT, to, path);
    // the red line grows along the tree's lines just behind the token
    const grow = legs.map(leg => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      el.setAttribute('d', pathOf(leg)); el.setAttribute('fill', 'none'); el.setAttribute('stroke', RED);
      el.setAttribute('stroke-width', '4'); el.setAttribute('stroke-linecap', 'round'); el.setAttribute('stroke-linejoin', 'round'); el.setAttribute('opacity', '.85');
      $('trail').append(el);
      const L = el.getTotalLength ? el.getTotalLength() : 0;
      el.setAttribute('stroke-dasharray', `${n1(L)} ${n1(L)}`); el.setAttribute('stroke-dashoffset', n1(L));
      return [el, L];
    });
    const total = grow.reduce((a, [, L]) => a + L, 0);
    walk(ctx, $('token'), pts.map(p => [...at(...p), 0]), { ms: Math.max(1600, total * 4.5), follow: 900, onStep: k => {
      let d = k * total;
      for (const [el, L] of grow) { el.setAttribute('stroke-dashoffset', n1(Math.max(0, L - d))); d -= L; }
    }, then: () => {
      V.trail.push(...legs); change(); const was = AT; AT = to; redraw();
      if (CARDS[was]) for (const f of document.querySelectorAll(`#art .fog[data-depth="${V.path.length}"]`)) tween(ctx, 700, k => f.setAttribute('opacity', (0.68 * k).toFixed(3)));
      if (to === 'potted' && CARDS[was]) { const i = plantOf(V.plant); arrive(ctx, $('picked'), at(plantX(i), SHELF), at(END.potted[0] - 82, END.potted[1] + 22)); }
      if (to === 'high_shelf') arrive(ctx, $('picked'), at(END.potted[0] - 82, END.potted[1] + 22), at(END.high_shelf[0] - 70, END.high_shelf[1] + 22));
    } });
  };
  const answer = a => {
    if (!CARDS[AT]) return ctx.no(AT === 'done' ? 'Every room has a plant. Start again.' : 'This room has its plant. Press next room.');
    const path = V.path + a;
    if (path.length < 3) {
      const to = KIDS[AT][a === 'y' ? 0 : 1];
      ctx.say(AT === 'light' ? (a === 'y' ? 'A bright window. Sun lovers only.' : 'Shade. Leaves that cope with little light.') : (a === 'y' ? 'Pets in the room: only pet-safe plants.' : 'No pets: every plant of this half is fine.'));
      return go(to, () => { V.path = path; });
    }
    const p = PLANTS[plantOf(path)];
    ctx.say(`A ${p[1]}. ${p[3] ? 'Safe with pets.' : 'Fine here, but bad for cats and dogs.'}`);
    go('potted', () => { V.path = path; V.plant = path; V.pets = path[1] === 'y'; V.rooms++; }, path);
  };
  ctx.button('yes', () => answer('y'));
  ctx.button('no', () => answer('n'));
  ctx.button('a kitten comes', () => {
    if (AT !== 'potted') return ctx.no(CARDS[AT] ? 'Pick a plant for this room first.' : 'The kitten is here already.');
    V.kitten = true; V.pets = true;
    const safe = PLANTS[plantOf(V.plant)][3];
    if (safe) { ctx.say('A kitten moves in. The plant is pet-safe: it stays.'); redraw(); return ctx.hop($('kitten')); }
    ctx.say('A kitten moves in, and this plant is bad for cats. Up on the high shelf.');
    go('high_shelf');
  });
  ctx.button('next room', () => {
    if (AT === 'done') { ctx.say('A new flat, three empty rooms.'); return go('light', () => { V = { path: '', plant: '', pets: false, rooms: 0, kitten: false, trail: [] }; }); }
    if (CARDS[AT]) return ctx.no('Answer the question first. This room has no plant yet.');
    if (V.rooms >= 3) { ctx.say('Three rooms, three plants. Done.'); return go('done'); }
    ctx.say(`On to room ${V.rooms + 1}.`);
    go('light', () => { V.path = ''; V.plant = ''; V.pets = false; V.kitten = false; V.trail = []; });
  });
  ctx.hint('Press Play all, or answer yes or no.');
  redraw();

  // Play all: one new flat, three rooms, then a fourth answer path in the next
  const STORY = ['light', 'pets_b', 'water_bn', 'potted', 'high_shelf', 'light', 'pets_b', 'water_bp', 'potted', 'light', 'pets_s', 'water_sn', 'potted', 'done', 'light', 'pets_s', 'water_sp', 'potted'];
  const PICK = { 3: 'yny', 8: 'yyy', 12: 'nnn', 17: 'nyy' };
  const ROOMS = { 3: 1, 4: 1, 8: 2, 12: 3, 13: 3, 17: 1 };
  let si = 0;
  return {
    goto(id, play) {
      let j = play ? STORY.indexOf(id, si + 1) : -1;
      if (j < 0) j = STORY.indexOf(id);
      si = j;
      const pick = PICK[j] || (id === 'high_shelf' ? PICK[j - 1] : '');
      const path = { light: '', pets_b: 'y', pets_s: 'n' }[id] ?? (CARDS[id] ? Object.keys(WATER).find(k => WATER[k] === id) : pick);
      const data = { path, plant: pick, pets: !!pick && (pick[1] === 'y' || id === 'high_shelf'), rooms: id === 'done' ? 3 : ROOMS[j] ?? (j < 5 ? 0 : j < 9 ? 1 : j < 14 ? 2 : 0), kitten: id === 'high_shelf' };
      ctx.say(CARDS[id] ? CARDS[id][3] : END_TEXT[id].join(', ') + '.');
      if (play && id !== AT) go(id, () => { V = { ...data, trail: id === 'light' ? [] : V.trail }; }, pick);
      else { V = { ...data, trail: id === 'done' ? [] : routeTo(id, data.path) }; AT = id; redraw(); }
    },
    tick(t) {
      const o = $('owner'); if (o) o.setAttribute('transform', `translate(${n1(Math.sin(t * 0.8) * 10)} 0)`);
    },
    story: STORY,
  };
}
