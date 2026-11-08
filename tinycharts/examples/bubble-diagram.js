// A small café as a bubble diagram: one bubble per zone, its area in
// proportion to its m², a door mark on each link, and the real floor plan
// beside it. An inspector walks the round, door by door.
const ABOUT = 'which spaces connect, and how big';
const IDS = ['street', 'terrace', 'seating', 'toilet', 'counter', 'kitchen', 'store', 'report'];
const SEATS = 20;
const NAMES = { street: 'at the door', terrace: 'the terrace', seating: 'the seating', toilet: 'the toilet', counter: 'the counter', kitchen: 'the kitchen', store: 'the store', report: 'the report' };
const SAY = {
  street: 'Nine o\'clock. The inspector stands on the pavement with her clipboard.',
  terrace: 'Through the gate to the terrace: 18 m² of tables in the sun.',
  seating: 'Through the glass door into the seating: 40 m² and 20 seats.',
  toilet: 'The toilet, 4 m². Soap, towels, a lock that works.',
  counter: 'Back through the seating to the counter. Behind it, staff only.',
  kitchen: 'Hairnet on, through the staff door. The kitchen, 16 m².',
  store: 'The store, 6 m²: dry goods off the floor, milk in date.',
  report: 'Back out through the front door. She writes the report on the pavement.',
};
const SEED = 7;
const LIST = {
  street: 'pavement · the way in', terrace: 'terrace · through the gate', seating: 'seating · 20 seats, 40 m²', toilet: 'toilet · and back out',
  counter: 'counter · hairnet on', kitchen: 'kitchen · only past the counter', store: 'store · then back out front', report: 'the report, on the pavement',
};
const K = 22; // bubble radius per √m²
// zones: sheet centre, m² (0: outside), colour, plate above (1) or below (-1)
const Z = {
  street: { c: [150, 470], m2: 0, col: PAL.stone, name: 'PAVEMENT', up: 1, sc: 1.4 },
  terrace: { c: [230, 760], m2: 18, col: PAL.butter, name: 'TERRACE', up: -1, sc: 1.3 },
  seating: { c: [530, 610], m2: 40, col: PAL.butter, name: 'SEATING', up: 1, sc: 1.3 },
  toilet: { c: [560, 950], m2: 4, col: PAL.sky, name: 'TOILET', up: -1, sc: 1.5 },
  counter: { c: [830, 470], m2: 10, col: PAL.sage, name: 'COUNTER', up: 1, sc: 1.3 },
  kitchen: { c: [1080, 380], m2: 16, col: PAL.sage, name: 'KITCHEN', up: 1, sc: 1.25 },
  store: { c: [1200, 640], m2: 6, col: PAL.sage, name: 'STORE', up: -1, sc: 1.1 },
};
const R = id => (Z[id].m2 ? K * Math.sqrt(Z[id].m2) : 46);
// links: the doors, with an optional note plate and the side it sits on
const LINKS = [
  ['street', 'terrace', 'gate', 1], ['street', 'seating', 'front door', -1], ['terrace', 'seating', 'glass door', 1],
  ['seating', 'toilet', '', 0], ['seating', 'counter', 'counter flap', -1], ['counter', 'kitchen', 'staff door', 1], ['kitchen', 'store', '', 0],
];
// where the inspector stands in each zone, from the bubble centre
const SPOT = { street: [8, 28], terrace: [34, 52], seating: [-6, 108], toilet: [14, 26], counter: [-22, 46], kitchen: [-34, 58], store: [-8, 34] };
const zoneOf = id => (id === 'report' ? 'street' : id);
let AT = 'street', V = { guests: 16, hairnet: false, toilet: false, kitchen: false };
const canon = id => ({
  guests: 16,
  hairnet: id === 'kitchen' || id === 'store',
  toilet: !['street', 'terrace', 'seating', 'toilet'].includes(id),
  kitchen: ['kitchen', 'store', 'report'].includes(id),
});
const timeOf = (id, v) => ({ street: '9:00', terrace: '9:04', seating: v.kitchen ? '9:46' : v.toilet ? '9:20' : '9:10', toilet: '9:16', counter: '9:22', kitchen: '9:30', store: '9:40', report: '9:50' })[id];
const BX = 700, BY = 700; // the base frame, for the walker and the motion
const pin = (n, fn) => () => { _seed = n; fn(); };

function linkGeo([a, b]) {
  const [ax, ay] = Z[a].c, [bx, by] = Z[b].c, l = Math.hypot(bx - ax, by - ay), u = [(bx - ax) / l, (by - ay) / l];
  const p0 = [ax + u[0] * R(a), ay + u[1] * R(a)], p1 = [bx - u[0] * R(b), by - u[1] * R(b)];
  return { p0, p1, m: [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], u, v: [-u[1], u[0]] };
}
const linkOf = (a, b) => LINKS.find(L => (L[0] === a && L[1] === b) || (L[0] === b && L[1] === a));
// the shortest chain of zones from a to b, through the links
function chain(a, b) {
  const prev = { [a]: null }, q = [a];
  while (q.length) { const z = q.shift(); if (z === b) break; for (const L of LINKS) { const n = L[0] === z ? L[1] : L[1] === z ? L[0] : null; if (n && !(n in prev)) { prev[n] = z; q.push(n); } } }
  const c = []; for (let z = b; z; z = prev[z]) c.unshift(z);
  return c;
}
const spotS = z => [Z[z].c[0] + SPOT[z][0], Z[z].c[1] + SPOT[z][1]];

// ---- things drawn only on this sheet ----
function plate(cx, cy, name, note, col = INK) {
  const w = textW(name, 16, 'cap') + (note ? textW(note, 15) + 18 : 0) + 24, h = 28, x = cx - w / 2, y = cy - h / 2;
  const c = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  out.push(`<path d="${pathOf(c, true)}" fill="#fffdf6"/>`); rim(c, 1.1);
  _text(x + 12, cy + 6, name, { cls: 'cap', size: 16, col });
  if (note) _text(x + w - 12, cy + 5, note, { size: 15, col: col === INK ? LEAD : col, anchor: 'end' });
}
function doorMark(g) {
  const { m, u, v } = g, a = [m[0] + v[0] * 11, m[1] + v[1] * 11], b = [m[0] - v[0] * 11, m[1] - v[1] * 11], t = [a[0] + u[0] * 15, a[1] + u[1] * 15];
  out.push(`<path d="M${n1(b[0] - v[0] * 3)} ${n1(b[1] - v[1] * 3)}L${n1(a[0] + v[0] * 3)} ${n1(a[1] + v[1] * 3)}" stroke="${PAPER}" stroke-width="7"/>`);
  line([b, a], { w: 2, over: 0 });
  line([a, t], { w: 1.3, over: 0 });
  out.push(`<path d="M${n1(t[0])} ${n1(t[1])}Q${n1(b[0] + u[0] * 15)} ${n1(b[1] + u[1] * 15)} ${n1(b[0])} ${n1(b[1])}" fill="none" stroke="${LEAD}" stroke-width="1" stroke-dasharray="3 3"/>`);
}
function table(x, y, top = '#fffdf6') {
  castDisc(x, y, 9, 15);
  cyl(x, y, 0, 1.6, 14, INK, { cap: INK });
  cyl(x, y, 14, 10, 2, PAL.wood, { cap: top });
}
function chair(x, y, col) { box(x - 4, y - 4, 0, 8, 8, 8, { left: col, top: litOf(col), marks: false }); }
function cup(x, y, z, i) {
  cyl(x, y, z, 2.6, 3.4, '#fffdf6', { cap: PAL.bark });
  const [sx, sy] = P(x, y, z + 4);
  if (i != null) out.push(`<circle class="steam" data-x="${n1(sx)}" data-y="${n1(sy)}" data-i="${i}" cx="${n1(sx)}" cy="${n1(sy)}" r="2.6" fill="#ffffff" stroke="${MUTE}" stroke-width=".5" opacity=".9"/>`);
}
const SEAT_D = [[15, 0], [0, 15], [-15, 0], [0, -15]];
// a sheet offset from the bubble centre as a world point in the bubble frame
const w = (sx, sy) => [(sy / S + sx / C) / 2, (sy / S - sx / C) / 2];
const TABLES = [[-56, -34], [30, -50], [-68, 30], [10, 10], [76, -6]].map(p => w(...p));

// one bubble: the wash, the rim, and its furniture drawn round its centre
function bubble(id, inside) {
  const z = Z[id], [cx, cy] = z.c, r = R(id);
  _seed = 5 + cx;
  fill(oval(cx, cy, r, r, 40), z.col, { amp: 0.6 });
  if (id === 'street') out.push(`<circle cx="${cx}" cy="${cy}" r="${n1(r)}" fill="none" stroke="${INK}" stroke-width="1.4" stroke-dasharray="6 5"/>`);
  else { line([...oval(cx, cy, r, r, 40), oval(cx, cy, r, r, 40)[1]], { w: 1.5, amp: 0.5, over: 0 }); out.push(`<circle cx="${cx}" cy="${cy}" r="${n1(r * 0.86)}" fill="none" stroke="#ffffff" stroke-width="${n1(r * 0.12)}" opacity=".35"/>`); }
  // furniture is drawn at a larger scale round the centre, ground a little low
  OX = cx; OY = cy + 10;
  group(`transform="translate(${cx} ${cy}) scale(${z.sc}) translate(${-cx} ${-cy})"`, () => { inside(); flush(); });
  OX = BX; OY = BY;
}

function seatingIn() {
  let k = 0;
  TABLES.forEach(([x, y], t) => {
    put(x + y, 0, pin(30 + t, () => table(x, y)));
    SEAT_D.forEach(([dx, dy], s) => {
      const i = k++, sx = x + dx, sy = y + dy;
      put(sx + sy - 0.5, 0, pin(40 + i, () => chair(sx, sy, [PAL.brick, PAL.navy, PAL.leaf][t % 3])));
      if (i < V.guests) put(sx + sy, 1, pin(60 + i, () => group(`id="g${i}"`, () => who(sx, sy, { size: 0.42, sit: 1, look: dx + dy > 0 ? -1 : 1, shirt: [PAL.rose, PAL.sky, PAL.mustard, PAL.lilac, PAL.leaf, PAL.brick][i % 6], hair: ['bob', 'short', 'bun', 'cap', 'long'][i % 5], arm: i % 3 ? 'down' : 'hold' }, 8))));
    });
    put(x + y + 0.1, 2, pin(90 + t, () => { cup(x - 3, y + 2, 16, t < 3 ? t : null); cup(x + 4, y - 3, 16); }));
  });
  const p1 = w(58, 52), p2 = w(-44, 62), p3 = w(-14, -80), wt = w(-22, -6);
  put(p1[0] + p1[1], 0, pin(99, () => pot(...p1, 0)));
  put(p2[0] + p2[1], 0, pin(100, () => pot(...p2, 0, true, PAL.mustard)));
  put(p3[0] + p3[1], 0, pin(97, () => { box(p3[0] - 7, p3[1] - 24, 0, 14, 48, 34, { left: PAL.wood, top: PAL.tan, marks: false }); for (let j = 0; j < 3; j++) cyl(p3[0], p3[1] - 16 + j * 16, 34, 4, 9, [PAL.mustard, PAL.rose, PAL.sage][j], { cap: '#fffdf6' }); }));
  put(wt[0] + wt[1], 3, pin(101, () => group('id="waiter"', () => who(...wt, { size: 0.5, shirt: '#fffdf6', pants: INK, hair: 'short', arm: 'hold' }))));
}
function terraceIn() {
  put(-40, 0, pin(110, () => { table(-20, -20); for (const [dx, dy] of SEAT_D) chair(-20 + dx, -20 + dy, PAL.navy); }));
  put(-38, 1, pin(111, () => { who(-35, -20, { size: 0.42, sit: 1, shirt: PAL.leaf, hair: 'cap' }, 8); who(-5, -20, { size: 0.42, sit: 1, shirt: PAL.rose, hair: 'bob', look: -1 }, 8); cup(-20, -20, 16, 3); }));
  put(40, 0, pin(112, () => { table(22, 18); for (const [dx, dy] of SEAT_D) chair(22 + dx, 18 + dy, PAL.navy); }));
  put(42, 1, pin(113, () => { who(22, 33, { size: 0.42, sit: 1, shirt: PAL.sky, hair: 'long', look: -1 }, 8); cup(22, 18, 16); }));
  put(-2, 2, pin(114, () => { // a parasol over the far table
    cyl(-20, -20, 16, 1.2, 26, INK, { cap: INK });
    const [sx, sy] = P(-20, -20, 44);
    shape([[sx - 32, sy + 10], [sx, sy - 9], [sx + 32, sy + 10], [sx, sy + 19]], PAL.brick, { w: 1.1 });
    line([[sx - 32, sy + 10], [sx, sy + 19], [sx + 32, sy + 10]], { w: 0.8, col: '#fffdf6', over: 0 });
  }));
  put(80, 0, pin(115, () => fence([[-20, 44], [44, 44]], { col: PAL.wood, post: 16, gap: 14 })));
  put(-16, 0, pin(116, () => pot(20, -36, 0, true, PAL.brick)));
  put(70, 0, pin(117, () => pot(56, 10, 0, true, PAL.stone)));
}
function counterIn() {
  put(-38, 0, pin(120, () => who(-8, -32, { size: 0.5, shirt: PAL.sage, pants: INK, hair: 'bun', arm: 'out', look: -1 })));
  put(-10, 1, pin(121, () => {
    cast(-36, -14, 70, 16, 24);
    box(-36, -14, 0, 70, 16, 24, { left: PAL.wood, top: '#efe6d4', marks: false });
    box(-28, -12, 24, 18, 12, 16, { left: PAL.slate, top: PAL.grey, marks: false }); // the espresso machine
    cup(-18, -2, 24, 4);
    box(12, -10, 24, 10, 9, 8, { left: PAL.navy, top: PAL.blue, marks: false }); // the till
    turn(26, -4, 24, [[9, 0], [9, 3], [7, 8], [3, 12], [0, 13]], '#e6eef2', { cap: '#e6eef2' }); // the cake dome
    for (let j = 0; j < 3; j++) cyl(-4, -8, 24 + j * 3, 3, 3, '#fffdf6', { cap: '#fffdf6' });
  }));
  put(30, 0, pin(122, () => box(18, 26, 0, 12, 12, 16, { left: PAL.bark, top: PAL.tan, marks: false }))); // a crate of milk
}
function kitchenIn() {
  put(-70, 0, pin(130, () => { cast(-46, -34, 34, 24, 24); box(-46, -34, 0, 34, 24, 24, { left: PAL.slate, top: '#6d6a66', marks: false });
    for (const [dx, dy] of [[-38, -26], [-22, -26], [-38, -16], [-22, -16]]) { const [sx, sy] = P(dx, dy, 24); out.push(`<ellipse cx="${n1(sx)}" cy="${n1(sy)}" rx="6" ry="3" fill="none" stroke="#c9c2b6" stroke-width="1"/>`); }
    cyl(-24, -26, 24, 6, 9, PAL.grey, { cap: '#9aa0a8' });
    const [sx, sy] = P(-24, -26, 36);
    for (let i = 5; i < 8; i++) out.push(`<circle class="steam" data-x="${n1(sx)}" data-y="${n1(sy)}" data-i="${i}" cx="${n1(sx)}" cy="${n1(sy)}" r="3" fill="#ffffff" stroke="${MUTE}" stroke-width=".5" opacity=".9"/>`);
  }));
  put(-36, 0, pin(131, () => { cast(10, -40, 16, 16, 40); box(10, -40, 0, 16, 16, 40, { left: '#e8ecef', top: '#f6f7f8', marks: false }); }));
  put(-14, 1, pin(132, () => who(-10, -4, { size: 0.5, shirt: '#fffdf6', pants: PAL.slate, hair: 'cap', arm: 'out' })));
  put(20, 0, pin(133, () => { box(-6, 14, 0, 40, 16, 20, { left: PAL.stone, top: '#eef0f0', marks: false }); box(4, 18, 20, 14, 9, 2, { left: PAL.wood, top: PAL.tan, marks: false }); cyl(26, 22, 20, 4, 4, '#fffdf6'); }));
  put(50, 0, pin(135, () => cyl(36, -4, 0, 6, 16, PAL.leaf, { cap: shadeOf(PAL.leaf) }))); // the bin
}
function storeIn() {
  put(-40, 0, pin(140, () => { box(-30, -24, 0, 12, 40, 30, { left: PAL.wood, top: PAL.tan, marks: false });
    for (const z of [10, 20]) box(-30, -24, z, 12, 40, 1.5, { left: PAL.bark, top: PAL.bark, marks: false });
    for (let j = 0; j < 3; j++) box(-26, -18 + j * 12, 21.5, 7, 8, 8, { left: [PAL.brick, PAL.mustard, PAL.sky][j], top: '#fffdf6', marks: false });
  }));
  put(0, 0, pin(141, () => { for (const [x, y] of [[0, -14], [6, -2]]) { const [sx, sy] = P(x, y); shape(blob(sx, sy - 9, 10, 10, 0.08, 5), '#e6d7b4'); } }));
  put(20, 1, pin(142, () => { box(10, 8, 0, 14, 12, 10, { left: PAL.navy, top: PAL.blue, marks: false }); box(10, 8, 10, 14, 12, 10, { left: PAL.navy, top: PAL.blue, marks: false }); }));
}
function toiletIn() {
  put(-20, 0, pin(150, () => { box(-14, -16, 0, 12, 6, 24, { left: '#fffdf6', top: '#f2f2f0', marks: false }); turn(-8, -6, 0, [[5, 0], [6, 9], [8, 10]], '#fffdf6', { cap: '#d9e4ec' }); }));
  put(-4, 0, pin(151, () => { cyl(12, -18, 0, 2, 18, PAL.grey); cyl(12, -18, 18, 7, 3, '#fffdf6', { cap: '#d9e4ec' }); }));
}
function streetIn() {
  put(-10, 0, pin(160, () => { cyl(-10, 4, 0, 6, 10, PAL.brick, { cap: '#7d5a3c' }); puff(-10, 4, 10, { hw: 9, h: 13 }); }));
  put(-6, 0, pin(161, () => { // the A-board
    const a = [P(10, -14, 0), P(-2, -14, 0), P(4, -14, 20)]; shape(a, PAL.bark, { w: 1 });
  }));
  put(30, 1, pin(162, () => group('id="pigeon"', () => bird(18, 14, 0, '#b9bec6'))));
}

// the floor plan, to scale: rooms in metres
const PM = 21, PX = 1024, PY = 935;
const PS = (x, y) => [PX + x * PM, PY + y * PM];
const ROOMS = {
  street: [-4.5, -1.2, 14, 0, PAL.stone, 'pavement'], terrace: [-4.5, 0, 0, 4, PAL.butter, 'terrace'], seating: [0, 0, 8, 5, PAL.butter, 'seating'],
  toilet: [0, 5, 2, 7, PAL.sky, 'wc'], counter: [8, 0, 12, 2.5, PAL.sage, 'counter'], kitchen: [8, 2.5, 12, 6.5, PAL.sage, 'kitchen'], store: [12, 4, 14.4, 6.5, PAL.sage, 'store'],
};
const rectM = ([x0, y0, x1, y1]) => [PS(x0, y0), PS(x1, y0), PS(x1, y1), PS(x0, y1)];
// door swings: hinge, leaf end, and the wall it opens off
const SWINGS = [[[-3, 0], [-2, 0], 1], [[5, 0], [6, 0], 1], [[0, 1.5], [0, 2.5], -1], [[0.4, 5], [1.3, 5], -1], [[8, 0.7], [8, 1.7], -1], [[9.2, 2.5], [10.2, 2.5], 1], [[12, 4.8], [12, 5.8], 1]];
function floorPlan() {
  _text(PX - 4.5 * PM, PY - 1.2 * PM - 16, 'the café itself, to scale', { size: 16, col: LEAD });
  for (const id of Object.keys(ROOMS)) { const r = ROOMS[id], c = rectM(r); fill(c, r[4], { amp: 0.3 }); }
  for (const id of Object.keys(ROOMS)) if (id !== 'street' && id !== 'terrace') rim(rectM(ROOMS[id]), 1.8);
  rim(rectM(ROOMS.terrace), 1);
  for (const [h, e, s] of SWINGS) {
    const a = PS(...h), b = PS(...e), d = [b[0] - a[0], b[1] - a[1]], n = [-d[1] * s, d[0] * s], tip = [a[0] + n[0], a[1] + n[1]];
    out.push(`<path d="M${n1(a[0])} ${n1(a[1])}L${n1(b[0])} ${n1(b[1])}" stroke="${mixC(PAL.butter, '#ffffff', 0.4)}" stroke-width="3.4"/>`);
    out.push(`<path d="M${n1(a[0])} ${n1(a[1])}L${n1(tip[0])} ${n1(tip[1])}A${n1(Math.hypot(...d))} ${n1(Math.hypot(...d))} 0 0 ${s > 0 ? 1 : 0} ${n1(b[0])} ${n1(b[1])}" fill="none" stroke="${INK}" stroke-width=".9"/>`);
  }
  for (const id of Object.keys(ROOMS)) { const [x0, y0, x1, y1, , name] = ROOMS[id], [sx, sy] = PS((x0 + x1) / 2, id === 'kitchen' ? 3.7 : (y0 + y1) / 2); _text(sx, sy + 5, name, { size: id === 'store' ? 12 : 14, anchor: 'middle' }); }
  const [nx, ny] = PS(7.85, 3.9); _text(nx, ny + 4, 'no door', { size: 12, col: LEAD, anchor: 'end' });
  const [wx0, wy0] = PS(8, 2.6), [wx1, wy1] = PS(8, 4.9); line([[wx0 + 4, wy0], [wx1 + 4, wy1]], { w: 0.8, col: LEAD, over: 0 });
  const [bx, by] = PS(-4.5, 7.8);
  line([[bx, by], [bx + 5 * PM, by]], { w: 1.6, over: 0 });
  for (let k = 0; k <= 5; k++) line([[bx + k * PM, by - (k % 5 ? 3 : 6)], [bx + k * PM, by]], { w: 1, over: 0 });
  _text(bx + 5 * PM + 10, by + 5, '5 m', { size: 14, col: LEAD });
}

function scene() {
  OX = BX; OY = BY;
  // a start dot and an arrow into the pavement
  out.push(`<circle cx="76" cy="566" r="5" fill="${INK}"/>`);
  arrowS([[76, 566], [112, 506]]);
  for (const L of LINKS) { const g = linkGeo(L); line([g.p0, g.p1], { w: 1.4, over: 0 }); doorMark(g); }
  bubble('street', streetIn);
  bubble('terrace', terraceIn);
  bubble('seating', seatingIn);
  bubble('toilet', toiletIn);
  bubble('counter', counterIn);
  bubble('kitchen', kitchenIn);
  bubble('store', storeIn);
  // the inspector, in the base frame so that hops moves her from bubble to bubble
  const s = spotS(zoneOf(AT));
  group('id="insp"', () => {
    who(...at(...s), { size: 0.55, shirt: PAL.navy, pants: INK, hair: 'bun', arm: AT === 'report' ? 'up' : 'hold', look: 1 });
    if (V.hairnet) out.push(`<ellipse cx="${n1(s[0])}" cy="${n1(s[1] - 52)}" rx="7" ry="4" fill="#fffdf6" stroke="${LEAD}" stroke-width=".8" stroke-dasharray="1.5 1.5"/>`);
    const q = [[s[0] + 10, s[1] - 34], [s[0] + 22, s[1] - 34], [s[0] + 22, s[1] - 18], [s[0] + 10, s[1] - 18]];
    shape(q, '#fffdf6', { w: 0.9 }); rule([0, 1, 2].map(j => [[q[0][0] + 3, q[0][1] + 4 + j * 4], [q[1][0] - 3, q[0][1] + 4 + j * 4]]), MUTE, 0.7);
  });
  for (const id of Object.keys(Z)) { const z = Z[id], r = R(id); plate(z.c[0], z.c[1] - z.up * (r + 20), z.name, z.m2 ? `${z.m2} m²` : 'outside'); }
  for (const L of LINKS) if (L[2]) { const g = linkGeo(L), cx = g.m[0] + g.v[0] * 34 * L[3], cy = g.m[1] + g.v[1] * 34 * L[3] + 4; linkNote(cx, cy, L[2]); }
}
function arrowS(pts) { line(pts, { w: 1.3, over: 0 }); const [a, b] = pts, l = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; shape([b, [b[0] - u[0] * 10 - u[1] * 5, b[1] - u[1] * 10 + u[0] * 5], [b[0] - u[0] * 10 + u[1] * 5, b[1] - u[1] * 10 - u[0] * 5]], INK, { w: 0.6 }); }
function linkNote(cx, cy, text) {
  const w = textW(text, 14) + 18, h = 24, c = [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]];
  out.push(`<path d="${pathOf(c, true)}" fill="#fffdf6"/>`); rim(c, 0.9);
  _text(cx, cy + 5, text, { size: 14, anchor: 'middle' });
}

function draw(seed) {
  begin(seed);
  scene();
  floorPlan();
  for (const id of IDS) group(`data-state="${id}"`, () => {
    const z = zoneOf(id), [cx, cy] = Z[z].c, r = R(z);
    out.push('<g class="on">');
    litRing(oval(cx, cy, r + 7, r + 7, 30));
    out.push(`<circle cx="${cx}" cy="${cy}" r="${n1(r - 7)}" fill="none" stroke="${RED}" stroke-width="1.2" stroke-dasharray="5 5"/>`);
    nowTag(cx - r - 32, cy + 4);
    const rc = rectM(ROOMS[z]); out.push(`<path d="${pathOf(rc, true)}" fill="none" stroke="${RED}" stroke-width="2.6"/>`);
    if (id === 'report') { const [px, py] = PS(-1.6, -0.6); out.push(`<circle cx="${n1(px)}" cy="${n1(py)}" r="5" fill="${RED}"/>`); }
    out.push('</g>');
  });
  _text(72, 944, 'the round, in order', { cls: 'cap', size: 16 });
  const upto = IDS.indexOf(AT);
  IDS.forEach((id, i) => group(`data-state="${id}"`, () => {
    const y = 976 + i * 25, r = i <= upto;
    _text(72, y, String(i + 1), { size: 16, col: MUTE });
    _text(96, y, LIST[id], { size: 17, col: r ? LEAD : MUTE });
    out.push('<g class="on">');
    _text(72, y, String(i + 1), { size: 16, col: RED });
    _text(96, y, LIST[id], { size: 17, col: RED });
    out.push('</g>');
  }));
  title('a bubble diagram', 'A small café');
  subtitle('zones by area, doors as links');
  status(`${timeOf(AT, V)}, ${NAMES[AT]}`, `${V.guests} of ${SEATS} seats · hairnet ${V.hairnet ? 'on' : 'off'}`);
  legend([{ col: PAL.butter, text: 'guests' }, { col: PAL.sage, text: 'staff only' }, { col: PAL.sky, text: 'wet' }, { col: PAL.stone, text: 'outside' }], 72, 1196);
  const dx = 72 + [ 'guests', 'staff only', 'wet', 'outside'].reduce((s, t) => s + 26 + textW(t, 16) + 28, 0);
  line([[dx, 1191], [dx + 26, 1191]], { w: 1.4, over: 0 }); line([[dx + 13, 1181], [dx + 13, 1201]], { w: 2, over: 0 });
  _text(dx + 36, 1196, 'door', { size: 16 });
  _text(dx + 110, 1196, 'area ∝ m²', { size: 16, col: LEAD });
  footnote('Illustrative: a made-up café, its sizes and its inspector. The plan and the bubbles share one set of m². Bubble radius grows with the square root of the area.');
  OX = BX; OY = BY;
  finish();
}

// the next zone from a state, as the statechart has it
function plan(at, v) {
  switch (at) {
    case 'street': return { to: 'terrace', v };
    case 'terrace': return { to: 'seating', v };
    case 'seating':
      if (!v.toilet) return { to: 'toilet', v };
      if (!v.kitchen) return { to: 'counter', v };
      return { no: 'Every zone is seen. Write the report.' };
    case 'toilet': return { to: 'seating', v: { ...v, toilet: true }, say: 'Back out to the seating. Next, the counter.' };
    case 'counter': return v.hairnet ? { to: 'kitchen', v: { ...v, kitchen: true } } : { no: 'Staff only past the counter. A hairnet first.' };
    case 'kitchen': return { to: 'store', v };
    case 'store': return { to: 'seating', v: { ...v, hairnet: false }, say: 'Back out front through the kitchen and the counter. Hairnet off.' };
    case 'report': return { to: 'street', v: { guests: 16, hairnet: false, toilet: false, kitchen: false }, say: 'Next month, a new round. The tables have turned over.' };
  }
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(SEED); ctx.state(AT); };
  const go = (to, v, say) => {
    const from = zoneOf(AT), dest = zoneOf(to), c = chain(from, dest);
    ctx.say(say || SAY[to]);
    // the bubble she walks into swells a little and settles
    const land = () => {
      AT = to; V = v; redraw();
      const b = document.querySelector(`#art [data-state="${to}"]`);
      if (!b) return;
      b.style.transformBox = 'fill-box'; b.style.transformOrigin = 'center';
      tween(ctx, 700, k => { b.style.transform = `scale(${(1 + 0.05 * Math.sin(Math.PI * k)).toFixed(3)})`; }, () => { b.style.transform = ''; });
    };
    if (c.length < 2) { land(); return; }
    const pts = [spotS(c[0])];
    for (let i = 1; i < c.length; i++) { pts.push(linkGeo(linkOf(c[i - 1], c[i])).m); pts.push(spotS(c[i])); }
    OX = BX; OY = BY;
    // a red line runs through the doors just behind her, as she walks
    const el = $('insp'), trail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    trail.setAttribute('d', pathOf(pts)); trail.setAttribute('fill', 'none'); trail.setAttribute('stroke', RED);
    trail.setAttribute('stroke-width', '4'); trail.setAttribute('stroke-linecap', 'round'); trail.setAttribute('opacity', '.8');
    if (el) el.parentNode.insertBefore(trail, el);
    const L = trail.getTotalLength ? trail.getTotalLength() : 0;
    trail.setAttribute('stroke-dasharray', `${n1(L)} ${n1(L)}`); trail.setAttribute('stroke-dashoffset', n1(L));
    walk(ctx, el, pts.map(p => [...at(...p), 0]), { ms: Math.max(1800, L * 11), then: land, onStep: (k, d) => trail.setAttribute('stroke-dashoffset', n1(Math.max(0, L - d))) });
  };

  ctx.button('next door', () => {
    const p = plan(AT, V);
    if (p.no) return ctx.no(p.no);
    go(p.to, p.v, p.say);
  });
  ctx.button('hairnet on', () => {
    if (V.hairnet) return ctx.no('The hairnet is on already.');
    if (AT !== 'counter') return ctx.no('Hairnets are kept behind the counter, for the staff door.');
    V = { ...V, hairnet: true }; redraw(); ctx.hop($('insp'));
    ctx.say('A hairnet from the box behind the counter. The staff door is open to her now.');
  });
  ctx.button('a group comes in', () => {
    if (!['street', 'terrace', 'seating'].includes(AT)) return ctx.no('She is out back and cannot see the door. Try it out front.');
    if (SEATS - V.guests < 4) return ctx.no(`Full: ${V.guests} guests on ${SEATS} seats. The group waits on the terrace for a table.`);
    const n0 = V.guests;
    V = { ...V, guests: n0 + 4 }; redraw();
    OX = BX; OY = BY;
    // the guests sit inside the scaled seating group: the door in its units
    const [cx, cy] = Z.seating.c, sc = Z.seating.sc, dm = linkGeo(linkOf('street', 'seating')).m;
    const door = at(cx + (dm[0] - cx) / sc, cy + (dm[1] - cy) / sc);
    for (let i = n0; i < V.guests; i++) { const el = $('g' + i), b = el && el.getBBox(); if (b) arrive(ctx, el, door, at(b.x + b.width / 2, b.y + b.height), { delay: (i - n0) * 120 }); }
    ctx.say(`A group of four comes in. ${SEATS - V.guests} seats are free now.`);
  });
  ctx.button('write the report', () => {
    if (AT === 'report') return ctx.no('The report is written.');
    if (!V.kitchen) return ctx.no('Not yet. The kitchen comes first: every report covers it.');
    if (AT !== 'seating') return ctx.no('She writes it outside. Walk back out front first.');
    go('report', V);
  });
  ctx.hint('Press Play all, or next door. At the counter, try next door before the hairnet.');
  redraw();

  return {
    goto(id, play) {
      const v = canon(id);
      if (play && id !== AT) go(id, v);
      else { AT = id; V = v; ctx.say(SAY[id]); redraw(); }
    },
    tick(t) {
      document.querySelectorAll('#art .steam').forEach(p => rise(p, (t * 0.5 + (+p.dataset.i) * 0.31) % 1, (+p.dataset.i % 2 ? 6 : -6), -22, 0.6, 1.6));
      const wk = $('waiter'); if (wk) { OX = Z.seating.c[0]; OY = Z.seating.c[1]; stroll(wk, [w(-22, -6), w(-30, 50), w(40, 40)], t, 10); OX = BX; OY = BY; }
      const b = $('pigeon'); if (b) b.setAttribute('transform', `translate(${n1(Math.sin(t * 0.7) * 8)} ${n1(-Math.max(0, Math.sin(t * 5)) * 3)})`);
    },
    story: IDS,
  };
}
