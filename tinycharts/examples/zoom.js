// A library on its town block: building ⊃ floor 2 ⊃ shelf C ⊃ one book.
// Each level is a state inside the state round it; the camera zooms into the
// red box. A still page cannot zoom, so a loupe shows the deep levels closer.
const ABOUT = 'where it is, from the big picture down';
const IDS = ['building', 'stacks', 'row', 'book'];
const W = 480, D = 300, F2 = 110, FH = 110;
const WALL = '#d9b58c', FLOOR = '#e3cfa8';
// shelf units on floor 2: [x, y]; each 100 long, 22 deep, 72 high. C is front middle.
const UW = 100, UD = 22, UH = 72, LEVELS = [3, 26, 49];
const UNITS = [[30, 50, 'G'], [150, 50, 'H'], [270, 50, 'I'], [30, 140, 'D'], [150, 140, 'E'], [270, 140, 'F'], [30, 230, 'A'], [150, 230, 'C'], [270, 230, 'B']];
const C_UNIT = 7;
// the book: on the middle board of shelf C
const BK = { x: 150 + 44, y: 230 + UD, z: F2 + LEVELS[1], w: 7, h: 19 };
const BOOK_C = [BK.x + BK.w / 2, BK.y, BK.z + BK.h / 2];
const HAND = [136, 288, F2 + 34];
const SHELF_C = [200, 252, F2 + 36];
const ZOOM = { building: 1, stacks: 1.6, row: 2.8, book: 4 };
const AIM = { building: [700, 700], stacks: [240, 150, F2 + 50], row: SHELF_C, book: BOOK_C };
const STATUS = {
  building: ['the library', 'on Elm Street'],
  stacks: ['floor 2', 'in the library'],
  row: ['shelf C', 'on floor 2'],
  book: ['Ships of the North', 'on shelf C'],
};
const NEXT = { building: 'floor 2', stacks: 'shelf C', row: 'the book' };
const LOUPE = [215, 1045, 130];
const BOOKCOL = [PAL.navy, PAL.brick, PAL.sage, PAL.mustard, PAL.rose, PAL.lilac, PAL.sky, PAL.tan, PAL.leaf, '#8a6a8f', '#6f8f9a'];
let AT = 'building', LENT = false, BOOKS = null;

const depthOf = id => IDS.indexOf(id);
const cap = t => t[0].toUpperCase() + t.slice(1);

// The books of every unit, made once so the loupe shows the same spines.
function makeBooks() {
  const s = _seed; _seed = 31;
  BOOKS = UNITS.map((u, i) => LEVELS.map((lz, l) => {
    const row = [];
    for (let x = 3; x < UW - 4;) {
      const w = 3.5 + rnd() * 3.5, h = 12 + rnd() * 7;
      // keep the slot of the book free, and a little gap beside it
      if (i === C_UNIT && l === 1 && x + w > 42 && x < 53) { x = 53; continue; }
      if (x + w > UW - 3) break;
      if (rnd() < 0.06) { x += 5; continue; }
      row.push([x, w, h, BOOKCOL[Math.floor(rnd() * BOOKCOL.length)]]);
      x += w + 0.4;
    }
    return row;
  }));
  _seed = s;
}

function face(x0, x1, y, z0, z1) { return [P(x0, y, z0), P(x1, y, z0), P(x1, y, z1), P(x0, y, z1)]; }
function poly(pts, col, w = 0.5) { out.push(`<path d="${pathOf(pts, true)}" fill="${col}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"/>`); }

function unit(i) {
  const [x, y] = UNITS[i], z = F2, yf = y + UD;
  box(x, y, z, UW, UD, UH, { left: PAL.wood, top: '#d8c09a', marks: false, ink: 1.6 });
  // the back of the shelf, then the books, then the boards in front
  poly(face(x + 2, x + UW - 2, yf, z + 2, z + UH - 3), '#7d6048', 0.4);
  LEVELS.forEach((lz, l) => {
    for (const [bx, bw, bh, col] of BOOKS[i][l]) poly(face(x + bx, x + bx + bw, yf, z + lz, z + lz + bh), col, 0.45);
    rule([[P(x + 1, yf, z + lz), P(x + UW - 1, yf, z + lz)]], INK, 1);
  });
  if (i === C_UNIT && LENT) poly(face(BK.x, BK.x + BK.w, BK.y, BK.z, BK.z + BK.h), '#4a3a2c', 0.4);
}

function theBook(lp) {
  const at = LENT ? null : BK;
  if (!at) return;
  const f = face(at.x, at.x + at.w, at.y, at.z, at.z + at.h);
  group(lp ? '' : 'id="book" class="box" data-lvl="3"', () => {
    poly(f, '#2f4f86', 0.6);
    rule([[P(at.x, at.y, at.z + 4), P(at.x + at.w, at.y, at.z + 4)], [P(at.x, at.y, at.z + 15), P(at.x + at.w, at.y, at.z + 15)]], '#e3c77a', 1);
  });
}

// the book in the reader's hands, when it is lent
function lentBook() {
  const [x, y, z] = HAND;
  poly([P(x, y, z), P(x + 9, y, z), P(x + 9, y, z + 12), P(x, y, z + 12)], '#2f4f86', 0.6);
}

// the inside of floor 2, open at the top: walls, shelves, people, the table
function stacks(lp) {
  const z = F2;
  box(0, 0, z, W, 8, FH, { left: WALL, top: '#efe2cc', marks: false });
  box(0, 0, z, 8, D, FH, { left: WALL, top: '#efe2cc', marks: false });
  for (const x of [50, 170, 290, 400]) windowL(x, 8, z + 34, 44, 50);
  for (const y of [120, 250]) windowR(8, y, z + 34, 44, 50);
  // the lamp over the reading table hangs from the back wall
  const items = [];
  UNITS.forEach((u, i) => items.push([u[0] + u[1] + UW / 2, () => (i === C_UNIT ? group(lp ? '' : 'class="box" data-lvl="2"', () => { unit(i); theBook(lp); }) : unit(i))]));
  items.push([20 + 110, () => group(lp ? '' : 'id="librarian"', () => { box(26, 98, z, 26, 16, 18, { left: PAL.grey, marks: false, ink: 1 }); who(58, 110, { shirt: PAL.rose, pants: PAL.navy, hair: 'bun', arm: 'hold', look: 1 }, z); })]);
  items.push([330 + 110, () => who(330, 112, { shirt: PAL.lilac, pants: PAL.bark, hair: 'short', arm: 'up', look: -1 }, z)]);
  items.push([60 + 200, () => who(60, 200, { shirt: PAL.mustard, pants: PAL.blue, hair: 'short', arm: 'up', look: 1, kid: true }, z)]);
  items.push([400 + 120, () => box(400, 120, z, 60, 90, 26, { left: PAL.bark, top: PAL.wood, marks: false, ink: 1.4 })]);
  items.push([395 + 175, () => who(392, 175, { shirt: PAL.sage, pants: PAL.slate, hair: 'bob', arm: 'hold', look: 1, sit: 1 }, z)]);
  items.push([440 + 200, () => { cyl(440, 140, z + 26, 6, 18, PAL.mustard, { cap: '#fff4c8' }); box(470, 150, z, 8, 30, 40, { left: PAL.bark, marks: false, ink: 1 }); }]);
  items.push([128 + 282, () => group(lp ? '' : 'id="reader"', () => { who(128, 282, { shirt: PAL.brick, pants: PAL.navy, hair: 'cap', arm: LENT ? 'hold' : 'out', look: 1 }, z); if (LENT) lentBook(); })]);
  items.sort((a, b) => a[0] - b[0]).forEach(([, f]) => f());
  // the low front walls
  box(0, D - 8, z, W, 8, 22, { left: WALL, top: '#efe2cc', marks: false });
  box(W - 8, 0, z, 8, D, 22, { left: WALL, top: '#efe2cc', marks: false });
}

function tower() {
  const x = -70, y = 40, s = 70, h = 300;
  box(x, y, 0, s, s, h, { left: PAL.brick, top: '#d99a82', marks: false });
  for (const zz of [40, 120, 200]) windowL(x + 22, y + s, zz, 26, 40);
  const ap = P(x + s / 2, y + s / 2, h + 60);
  poly([P(x, y + s, h), P(x + s, y + s, h), ap], PAL.slate, 1.2);
  poly([P(x + s, y, h), P(x + s, y + s, h), ap], shadeOf(PAL.slate), 1.2);
  line([ap, [ap[0], ap[1] - 30]], { w: 1.4, over: 0 });
  poly([[ap[0], ap[1] - 30], [ap[0] + 18, ap[1] - 25], [ap[0], ap[1] - 20]], RED, 0.8);
  // the clock, flat on the front face
  out.push(`<g transform="${faceM('left', x + s / 2, y + s, h - 34)}"><circle r="17" fill="#fffdf6" stroke="${INK}" stroke-width="1.6"/><path d="M0 0V-11M0 0H8" stroke="${INK}" stroke-width="1.6" fill="none"/></g>`);
}

function building() {
  box(0, 0, 0, W, D, F2, { left: WALL, top: FLOOR });
  for (const x of [30, 110, 190, 270, 350, 410]) windowL(x, D, 34, 40, 52);
  for (const y of [80, 290]) windowR(W, y, 34, 40, 52);
  doorR(W, 178, 21, 50, 62, PAL.navy);
  faceText('right', W, 150, 90, 'PUBLIC LIBRARY', { size: 11, cls: 'cap', col: INK });
}

function outside() {
  board(-90, -150, 730, 640, 26, '#cdd6b0', PAL.bark);
  // the town round the library: a row of houses behind it, and one across the road
  flat([P(-90, 400), P(640, 400), P(640, 414), P(-90, 414)], '#e2dccd');
  for (let k = 0; k < 8; k++) gable(366 + k * 34, -140, 31, 50, 34, 14, { wall: [PAL.sand, PAL.cream, '#e6d3c8', PAL.sky][k % 4], roof: [PAL.slate, PAL.brick][k % 2] });
  // the pavement and the road in front, the square to the side
  flat([P(-90, 300), P(640, 300), P(640, 335), P(-90, 335)], '#e2dccd');
  flat([P(-90, 335), P(640, 335), P(640, 400), P(-90, 400)], '#9aa0a6');
  dash(P(-90, 368), P(640, 368), '#f3ead8', 14, 12, 2);
  flat([P(480, -60), P(640, -60), P(640, 300), P(480, 300)], '#e8e0cc');
  // behind the building
  for (const [x, y] of [[-40, -30], [120, -40], [260, -35], [400, -40]]) puff(x, y, 0, { hw: 20, h: 26 });
  for (const y of [30, 110, 200, 290]) tree(-60, y, y === 200 ? 34 : 26, 0, '#7f9d6c');
  tree(460, -50, 30, 0, PAL.leaf);
  tower();
}

function front() {
  const items = [];
  items.push([516 + 175, () => flight(516, 148, 0, 3, 12, 7, 60, '-x', '#e4dbcb')]);
  items.push([496 + 190, () => cat(500, 160, 21, '#e3c77a')]);
  for (const x of [-50, 10, 70, 190, 250, 310, 430, 490, 560]) items.push([x + 318, () => tree(x, 318, 28, 0, x % 120 ? PAL.leaf : '#7f9d6c')]);
  for (const y of [-30, 60, 250]) items.push([600 + y, () => tree(600, y, 32, 0, PAL.leaf)]);
  for (const [x, y] of [[560, -40], [635, 30], [635, 130], [505, 280], [636, 215], [600, 80], [530, 150], [610, -50], [620, 280]]) items.push([x + y, () => tree(x, y, 26, 0, '#7f9d6c')]);
  for (const x of [130, 250, 370]) items.push([x + 312, () => pot(x, 312, 0, true, PAL.brick)]);
  items.push([300 + 330, () => { bird(300, 326, 0, PAL.grey); bird(318, 334, 0, PAL.stone); }]);
  items.push([420 + 365, () => { box(396, 350, 0, 52, 30, 34, { left: PAL.blue, top: '#c9d6e6', marks: false }); box(448, 350, 0, 20, 30, 24, { left: '#aebfd2', top: '#dfe7f0', marks: false, ink: 1.2 }); for (const wx of [408, 456]) { const [sx, sy] = P(wx, 380, 0); out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="6" fill="${INK}"/>`); } }]);
  items.push([590 + 150, () => { box(585, 135, 0, 14, 60, 12, { left: PAL.wood, marks: false, ink: 1.2 }); box(597, 135, 12, 4, 60, 16, { left: PAL.wood, marks: false, ink: 1.2 }); }]);
  items.push([590 + 165, () => who(590, 168, { shirt: PAL.lilac, pants: PAL.slate, hair: 'bob', arm: 'hold', look: -1, sit: 1 }, 0)]);
  items.push([530 + 222, () => { box(528, 215, 0, 24, 24, 42, { left: PAL.navy, top: '#7f9ad0', marks: false }); rule([[P(552, 220, 32), P(552, 234, 32)]], INK, 2); }]);
  items.push([560 + 240, () => who(560, 240, { shirt: PAL.mustard, pants: PAL.bark, hair: 'short', arm: 'out', look: -1, kid: true }, 0)]);
  items.push([530 + 120, () => who(528, 118, { shirt: PAL.sky, pants: PAL.navy, hair: 'short', arm: 'wave', look: 1 }, 0)]);
  items.push([520 + 40, () => { for (const y of [20, 44, 68]) box(520, y, 0, 3, 3, 18, { left: PAL.grey, marks: false, ink: 0.8 }); line([P(521, 20, 18), P(521, 68, 18)], { w: 1.6, over: 0 }); }]);
  items.push([620 + 300, () => { who(620, 290, { shirt: PAL.leaf, pants: PAL.bark, hair: 'cap', arm: 'out', look: -1 }, 0); dog(626, 252, 0, '#cdb68e'); }]);
  for (const [x, y] of [[500, 310], [40, 310]]) items.push([x + y, () => { cyl(x, y, 0, 2.5, 70, INK, { cap: INK }); cyl(x, y, 70, 6, 8, '#fff4c8', { cap: '#fffdf6' }); }]);
  items.push([90 + 380, () => group('id="van"', () => { box(60, 345, 0, 92, 38, 42, { left: PAL.mustard, top: '#f1e3b6', marks: false }); box(152, 345, 0, 26, 38, 30, { left: PAL.mustard, top: '#f1e3b6', marks: false }); windowR(178, 380, 14, 30, 14); })]);
  items.push([-60 + 322, () => group('id="walker"', () => who(60, 322, { shirt: PAL.navy, pants: PAL.slate, hair: 'short', arm: 'down', look: 1 }, 0))]);
  for (let k = 0; k < 20; k++) { const x = -42 + k * 34; items.push([x + 460, () => gable(x, 418, 31, 46, 26, 12, { wall: [PAL.cream, '#e6d3c8', PAL.sand, PAL.sage][k % 4], roof: [PAL.brick, PAL.slate][k % 2] })]); }
  items.sort((a, b) => a[0] - b[0]).forEach(([, f]) => f());
}

// a hexagon round a box, as sheet points, pushed out by pad pixels
function hexOf(x, y, z, w, d, h, pad) {
  const pts = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z), P(x, y + d, z + h)];
  const cx = pts.reduce((s, p) => s + p[0], 0) / 6, cy = pts.reduce((s, p) => s + p[1], 0) / 6;
  return pts.map(([a, b]) => { const dx = a - cx, dy = b - cy, L = Math.hypot(dx, dy) || 1; return [a + dx / L * pad, b + dy / L * pad]; });
}
const RING = {
  building: () => hexOf(0, 0, 0, W, D, F2 + FH, 10),
  stacks: () => hexOf(0, 0, F2, W, D, FH, 6),
  row: () => hexOf(UNITS[C_UNIT][0], UNITS[C_UNIT][1], F2, UW, UD, UH, 4),
  book: () => { const f = face(BK.x - 2, BK.x + BK.w + 2, BK.y, BK.z - 2, BK.z + BK.h + 2); return f; },
};
const TAG = { building: [1150, 790], stacks: [1140, 600], row: [636, 590], book: [632, 636] };
function ring(id, w = 2.6) { const pts = RING[id](); line([...pts, pts[0], pts[1]], { w, col: RED, amp: 0.4, over: 0 }); }

function marks() {
  for (const id of IDS) group(`data-state="${id}"`, () => {
    out.push('<g class="on">');
    ring(id);
    nowTag(...TAG[id]);
    out.push('</g>');
  });
}

// the current deep box again, enlarged in a round frame, for a still page
function loupe() {
  if (AT !== 'row' && AT !== 'book') return;
  const k = AT === 'book' ? 3.4 : 2, T = P(...(AT === 'book' ? BOOK_C : SHELF_C)), [cx, cy, r] = LOUPE;
  const box0 = RING[AT](), xs = box0.map(p => p[0]), ys = box0.map(p => p[1]);
  dash([Math.min(...xs), Math.max(...ys)], [cx - r * 0.2, cy - r * 0.98], '#8f8578', 6, 5, 1.2);
  dash([Math.max(...xs), Math.max(...ys)], [cx + r * 0.75, cy - r * 0.66], '#8f8578', 6, 5, 1.2);
  out.push(`<clipPath id="loupeClip"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><circle cx="${cx}" cy="${cy}" r="${r}" fill="${PAPER}"/>`);
  out.push(`<g clip-path="url(#loupeClip)"><g transform="translate(${cx} ${cy}) scale(${k}) translate(${n1(-T[0])} ${n1(-T[1])})">`);
  stacks(true);
  ring(AT, 1.4);
  out.push('</g></g>');
  out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="2.2"/><circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="none" stroke="${INK}" stroke-width="0.8"/>`);
  out.push(`<text class="it" x="${cx}" y="${cy + r + 34}" font-size="17" fill="${LEAD}" text-anchor="middle">${AT === 'book' ? 'the book, closer' : 'shelf C, closer'}</text>`);
}

function draw(seed) {
  begin(seed);
  OX = 680; OY = 580;
  makeBooks();
  outside();
  group('class="box" data-lvl="0"', building);
  group('class="box" data-lvl="1"', () => stacks(false));
  front();
  marks();
  loupe();

  // the margin: left from the top of the tower down, right from the shelf down
  label(72, 286, 'THE CLOCK TOWER', 'stairs to both floors', [-35, 110, 230]);
  label(72, 396, 'FLOOR 2 · THE STACKS', 'nine shelves, A to I', [8, 200, F2 + 80]);
  label(72, 506, 'SHELF C · HISTORY', 'about 40 books a board', [UNITS[C_UNIT][0] + UW, UNITS[C_UNIT][1], F2 + UH]);
  label(72, 616, 'SHIPS OF THE NORTH', LENT ? 'lent, due in 3 weeks' : 'the middle board', [BK.x, BK.y, BK.z + BK.h - 4]);
  label(72, 694, 'THE STREET', 'books by van', [60, 383, 22]);
  label(1328, 300, 'READING ROOM', 'a table by the window', [460, 170, F2 + 26], 'end');
  label(1328, 420, 'THE LIBRARY', 'two floors on Elm Street', [W, 60, 92], 'end');
  label(1328, 990, 'THE SQUARE', 'a bench under the trees', [592, 160, 12], 'end');
  label(1328, 1110, 'BOOK RETURN', 'open all night', [540, 239, 30], 'end');

  title('a zoom', 'Finding a book');
  subtitle('boxes inside boxes, one level at a time');
  const [big, small] = STATUS[AT];
  status(big, AT === 'book' && LENT ? 'lent out, from shelf C' : small);
  footnote('Illustrative: a made-up library, shelf and book. Shelves and books are drawn larger than life, so each level can be seen.');
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const SAY = {
    building: 'The library on Elm Street. The book is somewhere inside.',
    stacks: 'Floor 2: the stacks. Nine shelves, A to I.',
    row: 'Shelf C, history. Three boards of books.',
    book: 'Ships of the North, on the middle board of shelf C.',
  };
  const look = () => {
    const a = AIM[AT], [sx, sy] = a.length === 2 ? a : P(...a);
    ctx.focus(sx, sy, ZOOM[AT]);
  };
  const redraw = () => { draw(5); ctx.state(AT); };
  // the box the camera goes into lifts out of its place and settles, so the
  // eye finds it while the camera moves
  const LIFT = [0, 10, 22, 30], GROW = [0, 0.02, 0.06, 0.12];
  const lift = () => {
    const i = depthOf(AT), el = document.querySelector(`#art [data-lvl="${i}"]`);
    if (!i || !el) return;
    el.style.transformBox = 'fill-box'; el.style.transformOrigin = '50% 100%';
    tween(ctx, 1100, u => { const k = Math.sin(Math.PI * u); el.style.transform = `translate(0px,${n1(-LIFT[i] * k)}px) scale(${(1 + GROW[i] * k).toFixed(3)})`; }, () => { el.style.transform = ''; });
  };
  const go = (id, say) => { AT = id; ctx.say(say || SAY[id]); redraw(); look(); lift(); };

  const zoomIn = () => {
    const i = depthOf(AT);
    if (AT === 'book') return ctx.no('This is the smallest box: one book.');
    go(IDS[i + 1]);
  };
  const zoomOut = () => {
    const i = depthOf(AT);
    if (AT === 'building') return ctx.no('This is the whole library. Nothing is round it.');
    go(IDS[i - 1], `Back out to ${STATUS[IDS[i - 1]][0]}.`);
  };
  const borrow = () => {
    if (AT !== 'book') return ctx.no('Zoom in to the book first.');
    if (LENT) return ctx.no('The book is out already. Wait until it comes back.');
    const el = $('book');
    glide(ctx, el, BOOK_C, HAND, { arc: 14, then: () => { LENT = true; redraw(); } });
    ctx.say('Borrowed: three weeks. The slot on shelf C is empty.');
  };
  const giveBack = () => {
    if (AT !== 'book') return ctx.no('Zoom in to the book first.');
    if (!LENT) return ctx.no('The book is on the shelf. Nothing to bring back.');
    LENT = false; redraw();
    arrive(ctx, $('book'), HAND, BOOK_C);
    ctx.say('Back on the middle board of shelf C.');
  };
  ctx.button('zoom in', zoomIn);
  ctx.button('zoom out', zoomOut);
  ctx.button('borrow it', borrow);
  ctx.button('bring it back', giveBack);
  ctx.hint('Press Play all, or zoom in. Click a box to zoom into it.');
  redraw();

  return {
    goto(id, play) { AT = id; ctx.say(SAY[id]); redraw(); look(); if (play) lift(); },
    tick(t) {
      const lib = $('librarian'); if (lib) stroll(lib, [[0, 0], [280, 0]], t, 22);
      const wk = $('walker'); if (wk) stroll(wk, [[60, 322], [470, 322]], t, 30, 5);
    },
    click(e) {
      const g = e.target.closest('[data-lvl]');
      if (!g) return;
      const lvl = +g.dataset.lvl, i = depthOf(AT);
      if (lvl === i + 1) return zoomIn();
      if (lvl > i + 1) return ctx.no(`One level at a time. Zoom into ${NEXT[AT]} first.`);
      if (lvl === 3) return ctx.say(LENT ? 'Lent out.' : 'Ships of the North. Press borrow it.');
    },
    story: IDS,
  };
}
