// A tailor's week on a kanban board: four orders, six columns, limits on the
// busy ones. An order in the fitting room waits there for its customer.
const ABOUT = 'where each item is, and what is held up';
const COLS = ['ORDERS', 'MEASURE', 'CUT', 'SEW', 'FITTING', 'READY'];
const LIMIT = [9, 1, 1, 2, 1, 9];
const ORDERS = [
  { name: 'wool jacket', note: 'navy · 40', who: 'for Mr Hale', col: PAL.navy, kind: 'jacket', pin: PAL.brick },
  { name: 'linen trousers', note: 'sand · long', who: 'for Ms Ruiz', col: PAL.tan, kind: 'trousers', pin: PAL.mustard },
  { name: 'dress hem', note: 'up 3 cm', who: 'for Mrs Obi', col: PAL.sky, kind: 'dress', pin: '#7fae6a' },
  { name: 'coat zip', note: 'new zip', who: 'for Tom', col: PAL.brick, kind: 'coat', pin: PAL.navy },
];
const LANES = [['SUITS', 0, 1], ['MENDING', 2, 3]];
const STATES = [['open', 'four orders in'], ['working', 'at work'], ['held', 'held up at the fitting'], ['ready', 'all ready']];
const CX0 = 136, CW = 197, RY0 = 650, RH = 150, CARD = [178, 134];
let AT = 'open';
let V = { pos: [0, 0, 0, 0], tried: false };

const count = (pos, c) => pos.filter(p => p === c).length;
const canGo = (v, i) => v.pos[i] < 5 && count(v.pos, v.pos[i] + 1) < LIMIT[v.pos[i] + 1] && (v.pos[i] !== 4 || v.tried);
const mover = v => [0, 1, 2, 3].filter(i => canGo(v, i)).sort((a, b) => v.pos[b] - v.pos[a] || a - b)[0];
const allReady = v => v.pos.every(p => p === 5);
const after = v => allReady(v) ? 'ready' : mover(v) === undefined ? 'held' : 'working';

const colX = c => CX0 + c * CW;
const rowY = r => RY0 + r * RH + (r >= 2 ? 14 : 0);
// cards stack from the top of their lane: one that leaves lets the one under it move up
const rowOf = (i, pos) => (i < 2 ? 0 : 2) + [0, 1, 2, 3].filter(j => j < i && (j < 2) === (i < 2) && pos[j] === pos[i]).length;
const slot = (i, c, pos = V.pos) => { const p = pos.slice(); p[i] = c; return [colX(c) + (CW - CARD[0]) / 2, rowY(rowOf(i, p))]; };

function garment(kind, cx, cy, col, s = 1) {
  out.push(`<g transform="translate(${n1(cx)} ${n1(cy)}) scale(${s})">`);
  line([[0, -34], [0, -28]], { w: 1.2, over: 0 });
  line(spline([[0, -34], [3, -38], [0, -42], [-3, -39]], false, 2), { w: 1, over: 0 });
  line([[-16, -22], [0, -28], [16, -22]], { w: 1.4, over: 0 });
  if (kind === 'jacket') {
    shape([[-16, -22], [-24, 8], [-18, 9], [-14, -8], [-14, 24], [14, 24], [14, -8], [18, 9], [24, 8], [16, -22], [5, -24], [0, -6], [-5, -24]], col, { w: 1 });
    line([[-5, -24], [0, -6], [5, -24]], { w: 0.8, over: 0 });
    for (const y of [2, 12]) out.push(`<circle cx="2" cy="${y}" r="1.4" fill="${INK}"/>`);
  } else if (kind === 'trousers') {
    shape([[-12, -22], [12, -22], [14, 26], [4, 26], [0, -4], [-4, 26], [-14, 26]], col, { w: 1 });
    line([[-12, -16], [12, -16]], { w: 0.7, over: 0 });
  } else if (kind === 'dress') {
    shape([[-9, -24], [9, -24], [7, -8], [20, 26], [-20, 26], [-7, -8]], col, { w: 1 });
    line([[-7, -8], [7, -8]], { w: 0.8, over: 0 });
    out.push(`<path d="M-20 20H20" stroke="${RED}" stroke-width="1" stroke-dasharray="3 3"/>`);
  } else {
    shape([[-16, -22], [-20, 28], [20, 28], [16, -22], [4, -24], [0, -14], [-4, -24]], col, { w: 1 });
    line([[0, -14], [0, 28]], { w: 1.2, col: PAL.mustard, over: 0 });
  }
  out.push('</g>');
}

function card(i, x, y) {
  const o = ORDERS[i], [w, h] = CARD;
  out.push(`<rect x="${n1(x + 3)}" y="${n1(y + 4)}" width="${w}" height="${h}" rx="5" fill="${SHADOW}" opacity=".55"/>`);
  out.push(`<rect x="${n1(x)}" y="${n1(y)}" width="${w}" height="${h}" rx="5" fill="#fffdf6" stroke="${INK}" stroke-width="1.1"/>`);
  rule([0, 1, 2].map(k => [[x + 82, y + 98 + k * 12], [x + w - 10, y + 98 + k * 12]]), '#e3dccf', 0.7);
  out.push(`<circle cx="${n1(x + w / 2)}" cy="${n1(y + 2)}" r="5" fill="${o.pin}" stroke="${INK}" stroke-width=".8"/>`);
  _text(x + w - 10, y + 18, `order ${i + 1}`, { size: 12, col: LEAD, anchor: 'end' });
  garment(o.kind, x + 40, y + 76, o.col, 1.05);
  _text(x + 80, y + 50, o.name.split(' ')[0], { size: 18 });
  _text(x + 80, y + 70, o.name.split(' ').slice(1).join(' '), { size: 18 });
  _text(x + 80, y + 92, o.note, { size: 12, col: LEAD });
  _text(x + 80, y + 120, o.who, { size: 12, col: MUTE });
}

// the shop above the board: one prop over each column
function shop() {
  const top = 256, bot = 528;
  out.push(`<rect x="72" y="${top}" width="1256" height="${bot - top}" fill="#efe7d8" stroke="${INK}" stroke-width="1"/>`);
  out.push(`<rect x="72" y="${bot - 34}" width="1256" height="34" fill="#d9c7a8"/>`);
  rule([[[72, bot - 34], [1328, bot - 34]]], INK, 0.8);
  const at0 = c => { OX = colX(c) + CW / 2; OY = bot - 46; };
  const atFit = V.pos.findIndex(p => p === 4);

  at0(0);
  put(10, 0, () => { box(-40, -20, 0, 80, 40, 42, { left: PAL.wood, top: PAL.tan, marks: false }); const [sx, sy] = P(-10, 0, 42); shape([[sx - 14, sy], [sx + 6, sy - 6], [sx + 16, sy], [sx - 4, sy + 6]], '#fffdf6', { w: 0.8 }); turn(20, 0, 42, [[6, 0], [1, 7]], PAL.mustard); });
  put(20, 0, () => who(40, 46, { shirt: PAL.rose, pants: PAL.slate, hair: 'long', arm: 'out', look: -1 }));
  flush();

  at0(1);
  put(10, 0, () => { turn(-30, 0, 0, [[3, 0], [3, 60], [14, 62], [16, 80], [10, 92], [0, 94]], '#e6d6c0', { cap: '#e6d6c0' }); });
  put(20, 0, () => who(24, 20, { shirt: PAL.sage, pants: PAL.bark, hair: 'bun', arm: 'out', look: -1 }));
  flush();
  { const [a, b] = [P(-30, 0, 76), P(14, 20, 62)]; line([a, b], { w: 2, col: PAL.mustard, over: 0 }); }

  at0(2);
  put(10, 0, () => {
    box(-56, -26, 0, 112, 52, 36, { left: PAL.wood, top: '#e5d3b3', marks: false });
    const cut = V.pos.findIndex(p => p === 2);
    if (cut >= 0) flat([P(-36, -14, 36), P(30, -14, 36), P(30, 14, 36), P(-36, 14, 36)], ORDERS[cut].col);
    const [sx, sy] = P(36, 4, 37); line([[sx - 10, sy - 6], [sx + 10, sy + 6]], { w: 1.4, over: 0 }); line([[sx - 10, sy + 6], [sx + 10, sy - 6]], { w: 1.4, over: 0 });
  });
  put(20, 0, () => who(10, 52, { shirt: PAL.mustard, pants: PAL.navy, hair: 'short', arm: 'out', look: -1 }));
  flush();

  at0(3);
  for (const [k, dx] of [[0, -40], [1, 30]]) put(10 + k, 0, () => {
    box(dx - 20, -16, 0, 40, 32, 34, { left: PAL.wood, top: PAL.tan, marks: false });
    box(dx - 14, -6, 34, 28, 12, 8, { left: '#f3ead8', marks: false });
    box(dx + 6, -6, 42, 8, 12, 18, { left: '#f3ead8', marks: false });
    box(dx - 14, -6, 56, 28, 12, 6, { left: '#f3ead8', marks: false });
  });
  put(30, 0, () => who(0, 46, { shirt: PAL.lilac, pants: PAL.slate, hair: 'bob', sit: 1, arm: 'out', look: -1 }));
  flush();

  at0(4);
  put(10, 0, () => { box(-50, -30, 0, 10, 60, 110, { left: '#cfe0ea', top: PAL.slate, marks: false }); });
  put(12, 0, () => { const pts = [P(30, -30, 116), P(30, 30, 116), P(30, 30, 0), P(30, -30, 0)]; fill(pts, PAL.rose); rim(pts, 1); rule([0, 1, 2, 3].map(k => [P(30, -24 + k * 16, 116), P(30, -24 + k * 16, 4)]), shadeOf(PAL.rose), 0.8); });
  if (atFit >= 0) put(20, 0, () => { const [sx, sy] = P(-10, 0, 80); garment(ORDERS[atFit].kind, sx, sy, ORDERS[atFit].col, 0.9); });
  if (V.tried) put(30, 0, () => who(0, 30, { shirt: ORDERS[atFit].col, pants: PAL.slate, hair: 'cap', arm: 'wave', look: 1 }));
  flush();

  at0(5);
  put(10, 0, () => {
    for (const y of [-40, 40]) box(-4, y, 0, 6, 6, 104, { left: PAL.slate, marks: false });
    line([P(0, -40, 104), P(0, 46, 104)], { w: 2, over: 0 });
  });
  flush();
  V.pos.forEach((p, i) => { if (p === 5) { const [sx, sy] = P(0, -26 + i * 22, 104); garment(ORDERS[i].kind, sx, sy + 40, ORDERS[i].col, 0.75); } });
  OX = 700; OY = 0;
}

function cardBoard() {
  out.push(`<rect x="72" y="546" width="1256" height="730" rx="10" fill="${PAL.wood}" stroke="${INK}" stroke-width="1.4"/>`);
  out.push(`<rect x="84" y="558" width="1232" height="706" rx="6" fill="#e2d2b4"/>`);
  for (let c = 1; c < 6; c++) out.push(`<rect x="${colX(c) - 3}" y="558" width="6" height="706" fill="#ecdcb2"/>`);
  out.push(`<rect x="84" y="${rowY(2) - 14}" width="1232" height="8" fill="#ecdcb2"/>`);
  // the headers
  COLS.forEach((name, c) => {
    const x = colX(c) + (CW - CARD[0]) / 2, n = count(V.pos, c), full = c > 0 && c < 5 && n >= LIMIT[c];
    const red = full && AT === 'held';
    out.push(`<rect x="${n1(x)}" y="568" width="${CARD[0]}" height="62" rx="4" fill="${red ? '#f6e6e0' : '#fffdf6'}" stroke="${red ? RED : INK}" stroke-width="${red ? 1.6 : 1}"/>`);
    out.push(`<circle cx="${n1(x + CARD[0] / 2)}" cy="570" r="4.5" fill="${c > 0 && c < 5 ? RED : PAL.navy}" stroke="${INK}" stroke-width=".7"/>`);
    const wip = c > 0 && c < 5;
    _text(x + CARD[0] / 2 - (wip ? 24 : 0), 596, name, { size: 16, cls: 'cap', anchor: 'middle' });
    if (wip) _text(x + CARD[0] / 2 + textW(name, 16, 'cap') / 2 - 18, 596, `· ${LIMIT[c]}`, { size: 16, col: RED });
    _text(x + CARD[0] / 2, 618, wip ? `${LIMIT[c] - n} of ${LIMIT[c]} free` : c === 0 ? `${n} waiting` : `${n} of 4`, { size: 13, col: LEAD, anchor: 'middle' });
  });
  // swimlanes
  for (const [name, r0, r1] of LANES) {
    const y0 = rowY(r0), y1 = rowY(r1) + CARD[1];
    out.push(`<rect x="92" y="${y0}" width="36" height="${y1 - y0}" rx="4" fill="#fffdf6" stroke="${INK}" stroke-width="1"/>`);
    _text(110, (y0 + y1) / 2, name, { size: 15, cls: 'cap', anchor: 'middle', extra: `transform="rotate(-90 110 ${(y0 + y1) / 2})" dy="5"` });
  }
  // empty slots
  const full = new Set(V.pos.map((c, i) => `${rowOf(i, V.pos)} ${c}`));
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) if (!full.has(`${r} ${c}`)) {
    const x = colX(c) + (CW - CARD[0]) / 2, y = rowY(r);
    out.push(`<rect x="${n1(x)}" y="${n1(y)}" width="${CARD[0]}" height="${CARD[1]}" rx="5" fill="none" stroke="#bda98a" stroke-width="1" stroke-dasharray="4 4"/>`);
  }
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 0;
  shop();
  // the shop's states, in a row on the wall
  let x = 96;
  STATES.forEach(([id, label], k) => {
    const w = textW(label, 15) + 26;
    group(`data-state="${id}"`, () => {
      pill(x + w / 2, 286, label);
      out.push('<g class="on">');
      pill(x + w / 2, 286, label, { lit: true });
      nowTag(x + w - 18, 268);
      out.push('</g>');
    });
    if (k < 3) flowArrow([[x + w + 4, 286], [x + w + 26, 286]], { w: 1.4, col: INK });
    x += w + 30;
  });
  cardBoard();
  ORDERS.forEach((_, i) => group(`id="card${i}"`, () => card(i, ...slot(i, V.pos[i]))));
  if (AT === 'held') {
    const fit = V.pos.findIndex(p => p === 4), [hx, hy] = slot(fit, 4);
    out.push(`<rect x="${n1(hx - 4)}" y="${n1(hy - 4)}" width="${CARD[0] + 8}" height="${CARD[1] + 8}" rx="7" fill="none" stroke="${RED}" stroke-width="2"/>`);
  }

  const ready = count(V.pos, 5);
  title('a kanban', 'The tailor’s week');
  subtitle('six columns, four orders, limits on the busy ones');
  status(`${ready} of 4 ready`, AT === 'held' ? 'the fitting room waits' : V.tried ? 'a customer is trying on' : AT === 'open' ? 'all four on the order pad' : AT === 'ready' ? 'every order on the rail' : 'needles busy');
  footnote('Illustrative: four made-up orders in a made-up shop. The limits are how many fit at each bench.');
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(17); ctx.state(AT); };
  const centre = (i, c, pos) => { const [x, y] = slot(i, c, pos); return at(x + CARD[0] / 2, y + CARD[1] / 2); };
  const move = (next, then = () => {}) => {
    const i = [0, 1, 2, 3].find(k => next.pos[k] !== V.pos[k]);
    if (i === undefined) { V = next; then(); return redraw(); }
    // the cards left behind in its lane slide up while it travels
    const sy = (j, pos) => rowY(rowOf(j, pos));
    for (const j of [0, 1, 2, 3]) {
      const dy = j === i ? 0 : sy(j, next.pos) - sy(j, V.pos), el = $('card' + j);
      if (dy && el) tween(ctx, 900, k => { el.style.transform = `translate(0px,${n1(dy * k)}px)`; });
    }
    glide(ctx, $('card' + i), centre(i, V.pos[i], V.pos), centre(i, next.pos[i], next.pos), { arc: 26, ms: 1200, then: () => { V = next; then(); redraw(); } });
  };
  const step = v => { const i = mover(v); const pos = v.pos.slice(); pos[i]++; return { i, v: { pos, tried: pos[i] >= 4 ? false : v.tried } }; };

  ctx.button('move an order', () => {
    if (AT === 'ready') return ctx.no('Every order is ready. Start a new week.');
    if (AT === 'held') return ctx.no('Nothing can move: the fitting room waits for its customer.');
    const { i, v } = step(V);
    ctx.say(`The ${ORDERS[i].name} goes to ${COLS[v.pos[i]].toLowerCase()}.`);
    move(v, () => { AT = after(v); if (AT === 'held') ctx.say('Held up. Every bench is full, and the fitting room waits.'); });
  });
  ctx.button('the customer comes in', () => {
    const fit = V.pos.findIndex(p => p === 4);
    if (fit < 0) return ctx.no('Nobody is in the fitting room to try on.');
    if (V.tried) return ctx.no('They tried it on already.');
    V.tried = true; AT = 'working'; redraw();
    ctx.say(`${ORDERS[fit].who.replace('for ', '')} tries on the ${ORDERS[fit].name}. It fits.`);
  });
  ctx.button('a new week', () => {
    if (AT !== 'ready') return ctx.no('Finish this week’s orders first.');
    V = { pos: [0, 0, 0, 0], tried: false }; AT = 'open'; redraw(); ctx.say('A new week. Four new orders on the pad.');
  });
  ctx.hint('Press Play all, or move an order. Watch the fitting room.');
  redraw();

  // the whole week, worked out with the same rules as the buttons
  const STORY = [['open', { pos: [0, 0, 0, 0], tried: false }]];
  for (let v = STORY[0][1]; !allReady(v);) {
    v = after(v) === 'held' ? { ...v, tried: true } : step(v).v;
    STORY.push([STORY.at(-1)[0] === 'held' ? 'working' : after(v), v]);
  }
  STORY.push(['open', { pos: [0, 0, 0, 0], tried: false }]);
  let si = -1;
  return {
    goto(id, play) {
      let j = play ? STORY.findIndex((s, k) => k > si && s[0] === id) : -1;
      if (j < 0) j = STORY.findIndex(s => s[0] === id);
      si = j;
      const next = STORY[j][1];
      if (play && id !== 'open') move(next, () => { AT = id; });
      else { V = next; AT = id; redraw(); }
      ctx.say({ open: 'Four orders on the pad.', working: 'At work.', held: 'Held up: the fitting room waits for a customer.', ready: 'All four ready on the rail.' }[id]);
    },
    story: STORY.map(s => s[0]),
  };
}
