// A web shop checkout, as a flowchart: the steps run down the middle, the ways
// it fails sit beside them, and each service stands on its own board.
const SIZE = [2620, 1620];
const ABOUT = 'every step, and where it splits or goes back';
const NAMES = {
  cart: 'cart', identified: 'signed in or guest', address: 'shipping address', address_bad: 'address rejected',
  method: 'shipping method', paying: 'card payment', declined: 'card declined', challenge: '3-D Secure',
  sca_failed: '3DS failed', fraud: 'fraud check', review: 'fraud review', reserving: 'stock reservation',
  out_of_stock: 'out of stock', created: 'order created', emailed: 'confirmation email', picking: 'warehouse pick',
  shipped: 'shipped', delivered: 'delivered', cancelled: 'order cancelled', refunded: 'refunded',
};
const SPINE = ['cart', 'identified', 'address', 'method', 'paying', 'challenge', 'fraud', 'reserving', 'created', 'emailed', 'picking', 'shipped', 'delivered'];
const X = 1180, FX = 1540;
const RY = i => 250 + i * 92;
const TAGS = Object.fromEntries(SPINE.map((id, i) => [id, [X, RY(i)]]));
Object.assign(TAGS, {
  address_bad: [FX, RY(2)], declined: [FX, RY(4)], sca_failed: [FX, RY(5)], review: [FX, RY(6)],
  out_of_stock: [FX, RY(7)], refunded: [FX, 1040], cancelled: [FX, 1132],
});
const FAILS = ['address_bad', 'declined', 'sca_failed', 'review', 'out_of_stock', 'refunded', 'cancelled'];

// the service boards: side, top, the states they serve
const CARDS = {
  next: { side: 'L', y0: 280, name: 'Next.js', note: 'the shop pages, and the phone', tint: '#e9e4d4' },
  stripe: { side: 'L', y0: 565, name: 'Stripe', note: 'card, 3-D Secure, fraud score', tint: '#e6e0ec' },
  redis: { side: 'L', y0: 850, name: 'Redis', note: 'stock holds, 15 minutes each', tint: '#f1e1d6' },
  pg: { side: 'L', y0: 1135, name: 'PostgreSQL', note: 'orders, and the outbox', tint: '#dee5ec' },
  sendgrid: { side: 'R', y0: 280, name: 'SendGrid', note: 'the confirmation email', tint: '#dfe6ee' },
  warehouse: { side: 'R', y0: 565, name: 'Warehouse', note: 'pick, pack, label', tint: '#ece2cf' },
  doorstep: { side: 'R', y0: 850, name: 'Courier', note: 'van to the door', tint: '#e1e9dc' },
  kafka: { side: 'R', y0: 1135, name: 'Kafka', note: 'topic: orders', tint: '#e4e6d2' },
};
const CH = 270, BUS_Y = 1445;
const cardX = k => (CARDS[k].side === 'L' ? 110 : 1990);
const cardW = k => (CARDS[k].side === 'L' ? 640 : 530);
const cardC = k => [cardX(k) + cardW(k) / 2, CARDS[k].y0 + CH / 2];
const SVC = {
  cart: 'next', identified: 'next', address: 'next', address_bad: 'next', method: 'next', challenge: 'next',
  paying: 'stripe', declined: 'stripe', sca_failed: 'stripe', fraud: 'stripe', review: 'stripe', refunded: 'stripe',
  reserving: 'redis', out_of_stock: 'redis', created: 'pg', cancelled: 'pg',
  emailed: 'sendgrid', picking: 'warehouse', shipped: 'doorstep', delivered: 'doorstep',
};
// which board each tag links to
const LINKS = {
  cart: 'next', identified: 'next', address: 'next', method: 'next', paying: 'stripe', challenge: 'next', fraud: 'stripe',
  reserving: 'redis', created: 'pg', emailed: 'sendgrid', picking: 'warehouse', shipped: 'doorstep', delivered: 'doorstep',
};

let AT = 'cart', ROUND = 0;
let V = { trail: [], tries: 0 };

const tagW = id => Math.max(150, textW(NAMES[id], 17, 'cap') + 44);
const FW = () => Math.max(...FAILS.map(tagW));
const wOf = id => (FAILS.includes(id) ? FW() : tagW(id));
const tok = id => { const [x, y] = TAGS[id]; return [x - wOf(id) / 2 - 20, y + 20]; };
const rgt = id => TAGS[id][0] + wOf(id) / 2, lft = id => TAGS[id][0] - wOf(id) / 2;

// the data of each state, in each round: 0 signs in, 1 is a guest, 2 cancels
function dataOf(id, round) {
  const after = s => SPINE.indexOf(id) > SPINE.indexOf(s);
  const paid = ['fraud', 'review', 'reserving', 'out_of_stock', 'created', 'emailed', 'picking', 'shipped', 'delivered', 'cancelled'].includes(id);
  return {
    guest: round === 1, paid, refunded: id === 'refunded',
    held: ['created', 'emailed', 'picking', 'shipped', 'delivered'].includes(id),
    stock: round === 1 && ['reserving', 'out_of_stock', 'refunded'].includes(id) ? 0 : 1,
    addrOk: after('address') || ['declined', 'sca_failed', 'review', 'out_of_stock', 'refunded', 'cancelled'].includes(id),
  };
}

// what each service shows in its pill
function pillOf(k) {
  const g = V.guest, a = AT;
  if (k === 'next') return { cart: 'cart: 2 items, €84', identified: g ? 'guest: email only' : 'signed in as Mai', address: 'checking the address', address_bad: 'postcode not found',
    method: 'standard, 2–3 days', challenge: 'bank app: approve?', paying: 'Pay pressed' }[a] || (['created', 'emailed', 'picking', 'shipped', 'delivered'].includes(a) ? 'thank-you page' : 'waiting');
  if (k === 'stripe') return { paying: `charge, try ${V.tries + 1}`, declined: 'card_declined', sca_failed: '3DS failed', fraud: 'Radar score 12', review: 'Radar score 78: review',
    refunded: 'refund sent', challenge: 'needs 3-D Secure', out_of_stock: 'refund queued', cancelled: 'refund queued' }[a] || (V.paid ? 'paid €84' : 'no charge yet');
  if (k === 'redis') return { reserving: V.stock ? 'SET hold:sku-41' : 'stock 0', out_of_stock: 'no unit to hold', cancelled: 'hold released', refunded: 'no hold' }[a] || (V.held ? 'hold: 1 unit' : `stock ${V.stock}`);
  if (k === 'pg') return { created: 'INSERT order 1043', cancelled: 'order 1043: cancelled' }[a] || (V.held ? 'order 1043' : 'no order');
  if (k === 'kafka') return { created: 'OrderCreated', emailed: 'OrderCreated read', picking: 'OrderCreated read', cancelled: 'OrderCancelled' }[a] || 'quiet';
  if (k === 'sendgrid') return { emailed: '202 accepted' }[a] || (['picking', 'shipped', 'delivered'].includes(a) ? 'delivered to inbox' : 'idle');
  if (k === 'warehouse') return { picking: 'pick list: 1 box' }[a] || (['shipped', 'delivered'].includes(a) ? 'handed over' : 'no pick list');
  return { shipped: 'on the van', delivered: 'signed for' }[a] || 'no parcel';
}

function card(k, fn) {
  const c = CARDS[k], x0 = cardX(k), y0 = c.y0, W = cardW(k), [cx, cy] = cardC(k);
  const r = [[x0, y0], [x0 + W, y0], [x0 + W, y0 + CH], [x0, y0 + CH]];
  fill(r, c.tint, { amp: 0.4 }); rim(r, 1.2);
  if (SVC[AT] === k) litRing([[x0 - 7, y0 - 7], [x0 + W + 7, y0 - 7], [x0 + W + 7, y0 + CH + 7], [x0 - 7, y0 + CH + 7]]);
  _text(x0 + 20, y0 + 34, c.name, { cls: 'cap', size: 19 });
  _text(x0 + 20, y0 + 58, c.note, { size: 15, col: LEAD });
  const p = pillOf(k), lit = SVC[AT] === k;
  pill(x0 + W - textW(p, 15) / 2 - 30, y0 + 30, p, { lit });
  OX = cx + 70; OY = cy + 40;
  board(-110, -70, 220, 140, 8, '#efe9da', PAL.tan);
  fn();
  OX = 0; OY = 0;
}

// a box on a shelf, a parcel, a credit card: small flat things on the boards
const parcel = (x, y, z, s = 16, col = PAL.wood) => box(x - s / 2, y - s / 2, z, s, s, s * 0.8, { left: col, top: PAL.sand, marks: false });

function boards() {
  card('next', () => {
    tech('Next.js', -30, -10, 0);
    phone(50, -50, 0, { label: 'bank' });
    who(40, 50, { shirt: PAL.rose, pants: PAL.navy, hair: 'bun', arm: AT === 'challenge' ? 'hold' : 'out', look: -1, say: 'Two mugs, standard post.' });
  });
  card('stripe', () => {
    tech('Stripe', -60, -20, 0);
    devbox(30, -30, 0);
    const cc = [P(-10, 40, 0), P(30, 40, 0), P(30, 64, 0), P(-10, 64, 0)];
    shape(cc, ['declined', 'sca_failed'].includes(AT) ? PAL.rose : PAL.sky, { w: 1 });
    who(60, 40, { shirt: PAL.slate, pants: INK, hair: 'short', arm: AT === 'review' ? 'up' : 'hold', look: -1, say: 'A guest, a new card, a far address: I look first.' });
  });
  card('redis', () => {
    tech('Redis', -60, -10, 0);
    box(10, -50, 0, 70, 30, 40, { left: PAL.wood, top: PAL.sand, marks: false });
    for (let i = 0; i < 2; i++) parcel(22 + i * 22, -35, 40);
    if (V.stock > 0) group('id="unit"', () => parcel(66, -35, 40, 16, V.held ? PAL.brick : PAL.wood));
    who(50, 40, { shirt: PAL.sage, pants: PAL.bark, hair: 'cap', arm: 'down', look: -1, say: 'A hold lasts 15 minutes, then it lets go.' });
  });
  card('pg', () => {
    tech('PostgreSQL', -60, -10, 0);
    devbox(40, -30, 0);
    who(60, 40, { shirt: PAL.mustard, pants: PAL.navy, hair: 'long', arm: AT === 'cancelled' ? 'up' : 'hold', look: -1, say: 'I can cancel it until it ships.' });
  });
  card('sendgrid', () => {
    tech('SendGrid', -40, -10, 0);
    box(40, -40, 0, 22, 30, 40, { left: PAL.red, top: PAL.rose, marks: false });
    if (['emailed', 'picking', 'shipped', 'delivered'].includes(AT)) message(60, 30, 2, { col: PAL.leaf });
  });
  card('warehouse', () => {
    box(-90, -60, 0, 30, 110, 60, { left: PAL.wood, top: PAL.sand, marks: false });
    for (let i = 0; i < 4; i++) parcel(-75, -45 + i * 26, 60);
    if (['picking'].includes(AT)) parcel(10, 10, 0, 22);
    who(30, -30, { shirt: PAL.mustard, pants: PAL.navy, hair: 'cap', arm: 'hold', look: -1, say: 'Aisle 4, shelf 2: two mugs.' });
    who(60, 40, { shirt: PAL.sky, pants: PAL.slate, hair: 'bob', arm: 'out', look: -1, say: 'Tape, label, onto the cage.' });
  });
  card('doorstep', () => {
    gable(-100, -60, 60, 60, 44, 24, { wall: PAL.butter, roof: PAL.brick });
    box(10, -50, 0, 70, 36, 34, { left: PAL.paper, top: PAL.stone, marks: false });
    if (AT === 'delivered') parcel(-20, 0, 0, 20);
    who(40, 30, { shirt: PAL.brick, pants: PAL.navy, hair: 'cap', arm: AT === 'shipped' ? 'hold' : 'down', look: -1, say: 'Parcel for flat 3!' });
    who(-30, 40, { shirt: PAL.rose, pants: PAL.navy, hair: 'bun', arm: AT === 'delivered' ? 'wave' : 'down', look: 1, say: 'That was quick.' });
  });
  card('kafka', () => {
    tech('Kafka', -40, -10, 0);
    who(60, 40, { shirt: PAL.leaf, pants: PAL.bark, hair: 'short', arm: 'down', look: -1, say: 'Each event, once per reader.' });
  });
}

// the wires between the boards, along which the messages travel
function buses() {
  const col = '#b3aa9d';
  const L = Object.keys(CARDS).filter(k => CARDS[k].side === 'L'), R = Object.keys(CARDS).filter(k => CARDS[k].side === 'R');
  line([[70, cardC('next')[1]], [70, BUS_Y], [2560, BUS_Y], [2560, cardC('sendgrid')[1]]], { w: 1.4, col, over: 0, amp: 0.3 });
  for (const k of L) flowArrow([[70, cardC(k)[1]], [106, cardC(k)[1]]], { col, w: 1.4 });
  for (const k of R) flowArrow([[2560, cardC(k)[1]], [2524, cardC(k)[1]]], { col, w: 1.4 });
  _text(1300, BUS_Y - 10, 'HTTPS, webhooks and Kafka events', { size: 15, col: MUTE, anchor: 'middle' });
}

const words = (x, y, s, anchor = 'start', size = 17) => out.push(`<text class="it route" x="${n1(x)}" y="${n1(y)}" font-size="${size}" fill="${INK}"${anchor === 'start' ? '' : ` text-anchor="${anchor}"`}>${_attr(s)}</text>`);
const link = pts => out.push(`<path class="link" d="${pathOf(pts)}" fill="none" stroke="#a89c8a" stroke-width="1.7" stroke-dasharray="0.1 5.6" stroke-linecap="round"/>`);

function chain() {
  const top = id => [TAGS[id][0], TAGS[id][1] - 4], bot = id => [TAGS[id][0], TAGS[id][1] + 44];
  const STEP = ['sign in, or as guest', 'next step', 'validate [valid address]', 'next step: pay', 'charge card [accepted]', 'answer 3DS [passed]',
    'score [low risk]', 'hold stock [in stock]', 'next step', 'next step', 'hand to the courier', 'next step'];
  SPINE.slice(0, -1).forEach((id, i) => { flowArrow([bot(id), top(SPINE[i + 1])]); words(X - 16, RY(i) + 74, STEP[i], 'end'); });
  // each way off the chain, and its way back
  const fl = id => lft(id) - 4, fr = id => rgt(id) + 4, wx = rgt('address_bad') + 40;
  const side = (from, to, back, w1, w2) => {
    const y = TAGS[to][1];
    flowArrow([[rgt(from) + 4, y + 13], [fl(to), y + 13]]);
    if (back) flowArrow([[lft(to) - 4, y + 29], [rgt(from) + 4, y + 29]], { dashed: true });
    words(wx, y + 17, w1, 'start', 15); if (w2) words(wx, y + 36, w2, 'start', 15);
  };
  side('address', 'address_bad', true, '[else]', 'fix it, validate again');
  side('paying', 'declined', true, '[else]', 'retry [tries left]');
  side('challenge', 'sca_failed', false, '[else]', 'another card');
  const sy = TAGS.sca_failed[1], py = TAGS.paying[1];
  flowArrow([[fl('sca_failed'), sy + 33], [1400, sy + 33], [1400, py + 38], [rgt('paying') + 4, py + 38]], { dashed: true });
  side('fraud', 'review', false, '[else]: a person looks', 'approve, or reject');
  const ry = TAGS.review[1], vy = TAGS.reserving[1];
  flowArrow([[lft('review') + 30, ry + 44], [lft('review') + 30, vy - 16], [X + 20, vy - 16], [X + 20, vy - 4]]);
  side('reserving', 'out_of_stock', false, '[else]', 'refund');
  const rx = rgt('review') + 22, fy = TAGS.refunded[1];
  flowArrow([[fr('review'), ry + 20], [rx, ry + 20], [rx, fy + 20], [fr('refunded'), fy + 20]]);
  flowArrow([[FX, TAGS.out_of_stock[1] + 44], [FX, fy - 4]]);
  // cancel: from any step before it ships
  const cy = TAGS.cancelled[1], gx = rgt('emailed') + 40;
  dash([gx, TAGS.created[1]], [gx, TAGS.picking[1] + 40], '#9a9187', 5, 5, 1.2);
  for (const id of ['created', 'emailed', 'picking']) out.push(`<path d="${pathOf([[rgt(id) + 4, TAGS[id][1] + 20], [gx, TAGS[id][1] + 20]])}" fill="none" stroke="#9a9187" stroke-width="1.2"/>`);
  flowArrow([[gx, cy + 22], [fl('cancelled'), cy + 22]]);
  flowArrow([[FX, cy - 2], [FX, fy + 44]]);
  words(wx, fy + 17, 'refund through Stripe', 'start', 15); words(wx, fy + 36, 'hold released', 'start', 15);
  words(wx, cy + 17, 'cancel order', 'start', 15); words(wx, cy + 36, '[before it ships]', 'start', 15);
  // each step to the board that does it
  let lane = 0;
  for (const id of Object.keys(LINKS)) {
    const k = LINKS[id], [, ty] = TAGS[id], [, cy2] = cardC(k), y = ty + 20;
    if (CARDS[k].side === 'L') link([[lft(id) - 40, y], [930, y], [cardX(k) + cardW(k) + 4, cy2 + 30]]);
    else { const lx = 1910 + 12 * lane++; link([[rgt(id) + 6, y], [lx, y], [lx, cy2 + 40], [cardX(k) - 4, cy2 + 40]]); }
  }
}

function tags() {
  for (const id of Object.keys(TAGS)) {
    const [x, y] = TAGS[id], w = wOf(id);
    group(`data-state="${id}"`, () => {
      tag(x - w / 2, y, w, NAMES[id]);
      out.push('<g class="on">');
      litRing([[x - w / 2 - 6, y - 6], [x + w / 2 + 6, y - 6], [x + w / 2 + 6, y + 46], [x - w / 2 - 6, y + 46]]);
      nowTag(x + w / 2 - 32, y - 8);
      out.push('</g>');
    });
  }
}

// the envelope rests on the board of the service that holds the request now
const spot = k => [cardX(k) + cardW(k) - 60, cardC(k)[1] + 20];
const port = k => [CARDS[k].side === 'L' ? 70 : 2560, cardC(k)[1]];
function envPath(a, b) {
  if (a === b) return [];
  if (CARDS[a].side === CARDS[b].side) return [spot(a), port(a), port(b), spot(b)];
  const pa = port(a), pb = port(b), via = CARDS[b].side === 'R' && b !== 'kafka' ? [port('kafka'), spot('kafka'), port('kafka')] : [];
  return [spot(a), pa, [pa[0], BUS_Y], [pb[0], BUS_Y], ...via, pb, spot(b)];
}

function draw(seed) {
  begin(seed);
  OX = 0; OY = 0;
  if (V.trail.length > 1) out.push(`<path d="${pathOf(V.trail)}" fill="none" stroke="${RED}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/>`);
  buses();
  boards();
  chain();
  tags();
  const bad = ['address_bad', 'declined', 'sca_failed', 'out_of_stock', 'cancelled'].includes(AT);
  group('id="msg"', () => message(...at(...spot(SVC[AT])), 30, { col: bad ? PAL.rose : AT === 'refunded' ? PAL.mustard : V.paid ? PAL.leaf : PAL.sky }));
  group('id="token"', () => {
    const [tx, ty] = tok(AT), o = oval(tx, ty, 11, 11, 16);
    shape(o, RED, { w: 1.2 }); out.push(`<circle cx="${n1(tx)}" cy="${n1(ty)}" r="3.5" fill="${PAPER}"/>`);
  });
  title('a flowchart', 'Web shop checkout');
  subtitle('every step from cart to doorstep, every way it fails, and the service that does it');
  status(NAMES[AT], `${V.guest ? 'guest checkout' : 'signed in'}, ${V.refunded ? 'money back' : V.paid ? 'paid €84' : 'not paid'}, ${V.held ? '1 unit held' : 'no stock held'}`);
  footnote('Illustrative: one order of two mugs for €84. The 15-minute stock hold, the three card tries and the fraud scores are example values, not Stripe or Redis defaults. SendGrid has no free logo, so it is drawn by name. Logos are trademarks of their owners.', 2400);
  finish();
}

const SAY = {
  identified: 'Signed in: the address book and the saved card come along.',
  address: 'Next.js checks the address against the postcode list.',
  address_bad: 'No such postcode. The form asks again.',
  method: 'Address good. Standard post, 2–3 days.',
  paying: 'Pay: Next.js asks Stripe to charge the card.',
  declined: 'The bank says no: card_declined.',
  challenge: 'The bank wants 3-D Secure: the phone asks Mai to approve.',
  sca_failed: 'No approval in time. 3-D Secure failed: try another card.',
  fraud: 'Paid. Stripe Radar scores the order.',
  review: 'High score: a guest, a new card. A person looks first.',
  reserving: 'Redis holds one unit for 15 minutes.',
  out_of_stock: 'The last unit sold while the order waited. Nothing to hold.',
  created: 'PostgreSQL writes the order and an OrderCreated event.',
  emailed: 'Kafka carries the event to SendGrid: the confirmation email goes out.',
  picking: 'The warehouse reads the same event and picks the mugs.',
  shipped: 'Packed, labelled, on the van.',
  delivered: 'Signed for at the door.',
  cancelled: 'Cancelled before it ships: OrderCancelled, the hold goes.',
  refunded: 'Stripe sends the money back.',
};

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(5); ctx.state(AT); };
  const settle = (to, round) => { ROUND = round; V = { ...V, ...dataOf(to, round) }; if (to === 'cart') V.tries = 0; };
  const go = (to, round = ROUND, tries = V.tries) => {
    const from = AT, pts = [tok(from), tok(to)], env = route(SVC[from], SVC[to]);
    ctx.say(SAY[to] || NAMES[to] + '.');
    hops(ctx, $('token'), pts.map(p => at(...p)), { then: () => {
      if (to === 'cart') V.trail = [];
      V.trail.push(...pts);
      const done = () => { AT = to; settle(to, round); V.tries = to === 'cart' ? 0 : tries; redraw(); };
      if (env.length) hops(ctx, $('msg'), env.map(p => at(...p)), { arc: 16, rest: 80, then: done });
      else done();
    } });
  };
  ctx.follow(true);

  const NEXT = { identified: 'address', method: 'paying', paying: 'challenge', challenge: 'fraud', review: 'reserving', created: 'emailed', emailed: 'picking',
    picking: 'shipped', shipped: 'delivered', address_bad: 'address', declined: 'paying', sca_failed: 'paying', out_of_stock: 'refunded', cancelled: 'refunded' };
  ctx.button('next step', () => {
    if (AT === 'cart') return go('identified', 0);
    if (AT === 'address') return go('method');
    if (AT === 'fraud') return go(V.guest ? 'review' : 'reserving');
    if (AT === 'reserving') return go(V.stock > 0 && !V.guest ? 'created' : 'out_of_stock');
    if (AT === 'declined' && V.tries >= 3) return ctx.no('Three declines: the shop stops trying this card.');
    if (AT === 'paying') return go('challenge', ROUND, V.tries + 1);
    if (AT === 'delivered' || AT === 'refunded') return ctx.no('This order is over. Press Reset for a new one.');
    go(NEXT[AT]);
  });
  ctx.button('as guest', () => {
    if (AT !== 'cart') return ctx.no('Sign in or guest is chosen at the cart.');
    go('identified', 1);
  });
  ctx.button('it fails here', () => {
    const FAIL = { address: 'address_bad', paying: 'declined', challenge: 'sca_failed', review: 'refunded', reserving: 'out_of_stock' };
    if (AT === 'paying' && V.tries >= 2) return ctx.no('Three tries already: no more charges on this card.');
    if (!FAIL[AT]) return ctx.no(AT === 'fraud' ? 'The score decides: a guest goes to a person.' : 'Nothing fails at this step.');
    if (AT === 'review') ctx.say('The reviewer rejects it. Stripe refunds the card.');
    go(FAIL[AT], AT === 'reserving' ? 1 : ROUND, AT === 'paying' ? V.tries + 1 : V.tries);
  });
  ctx.button('cancel order', () => {
    if (['shipped', 'delivered'].includes(AT)) return ctx.no('The parcel left the warehouse. Too late to cancel: ask for a return.');
    if (!['created', 'emailed', 'picking'].includes(AT)) return ctx.no('There is no order yet to cancel.');
    go('cancelled', 2);
  });
  ctx.hint('Press Play all, or next step. Try "it fails here" at the address, the card, 3-D Secure and the stock.');
  settle('cart', 0);
  redraw();

  const STORY = ['cart', 'identified', 'address', 'address_bad', 'address', 'method', 'paying', 'declined', 'paying', 'challenge', 'sca_failed', 'paying', 'challenge',
    'fraud', 'reserving', 'created', 'emailed', 'picking', 'shipped', 'delivered',
    'cart', 'identified', 'address', 'method', 'paying', 'challenge', 'fraud', 'review', 'reserving', 'out_of_stock', 'refunded',
    'created', 'emailed', 'cancelled', 'refunded'];
  const SOLO = { review: 1, out_of_stock: 1, refunded: 1, cancelled: 2 };
  return {
    goto(id, play) {
      let round = ROUND;
      if (!play) round = SOLO[id] || 0;
      else if (id === 'cart') round = AT === 'delivered' ? 1 : 0;
      else if (id === 'created' && AT === 'refunded') round = 2;
      const tries = id === 'declined' ? 1 : ['challenge', 'sca_failed'].includes(id) && round === 0 ? 2 : 0;
      if (play && id !== AT) go(id, round, tries);
      else { AT = id; settle(id, round); V.tries = tries; ctx.say(SAY[id] || NAMES[id] + '.'); redraw(); }
    },
    story: STORY,
  };
}
