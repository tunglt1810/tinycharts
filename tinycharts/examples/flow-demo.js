// Checkout with a promo code: a dense product flow on one wide sheet. The
// camera follows the current step. Boxes stand in for icons until Plan 2.
const SIZE = [2400, 1400];
const GAP = 150;
// [column, row, colour, tag]: columns run along x, rows along y
const STEP = {
  browsing: [0, 0, 'sky', 'SHOP'], cart: [1, 0, 'sky', 'SHOP'],
  promo: [1, 1, 'mustard', 'CODE'], applied: [2, 1, 'mustard', 'CODE'], rejected: [1, 2, 'mustard', 'CODE'],
  address: [3, 0, 'sage', 'FORM'], shipping: [4, 0, 'sage', 'FORM'], review: [5, 0, 'sage', 'FORM'],
  payment: [6, 0, 'rose', 'PAY'], timed_out: [6, -1, 'stone', 'STOP'],
  authorising: [6, 1, 'rose', 'BANK'], challenge: [5, 1, 'rose', 'BANK'], declined: [7, 1, 'rose', 'BANK'], cancelled: [7, 2, 'stone', 'STOP'],
  placed: [6, 3, 'lilac', 'SHIP'], emailed: [5, 3, 'lilac', 'SHIP'], packing: [4, 3, 'lilac', 'SHIP'], shipped: [3, 3, 'lilac', 'SHIP'],
};
const NAMES = {
  browsing: 'browsing', cart: 'the cart', promo: 'typing a code', applied: 'code applied', rejected: 'code rejected',
  address: 'address', shipping: 'delivery', review: 'review the order', payment: 'payment', timed_out: 'timed out',
  authorising: 'asking the bank', challenge: '3-D Secure check', declined: 'card declined', cancelled: 'cancelled',
  placed: 'order placed', emailed: 'receipt sent', packing: 'packing', shipped: 'shipped',
};
const LINKS = [
  ['browsing', 'cart'], ['cart', 'promo'], ['promo', 'applied'], ['promo', 'rejected'], ['rejected', 'promo', 1],
  ['applied', 'address'], ['cart', 'address'], ['address', 'shipping'], ['shipping', 'review'], ['review', 'payment'],
  ['payment', 'timed_out'], ['payment', 'authorising'], ['authorising', 'challenge'], ['challenge', 'authorising', 1],
  ['authorising', 'declined'], ['declined', 'payment'], ['declined', 'cancelled'], ['authorising', 'placed'],
  ['placed', 'emailed'], ['emailed', 'packing'], ['packing', 'shipped'],
];
let AT = 'browsing', V = { items: 0, approved: false, tries: 0, asked: false };

const spot = id => { const [c, r] = STEP[id]; return [-525 + c * GAP, -150 + r * GAP]; };

// An L-shaped red path from box edge to box edge; `side` shifts a return path.
function link(a, b, side = 0) {
  const [ax, ay] = spot(a), [bx, by] = spot(b), o = side ? 12 : 0, e = 40;
  if (ay === by) return arrow([[ax + Math.sign(bx - ax) * e, ay + o], [bx - Math.sign(bx - ax) * e, by + o]]);
  if (ax === bx) return arrow([[ax + o, ay + Math.sign(by - ay) * e], [bx + o, by - Math.sign(by - ay) * e]]);
  arrow([[ax, ay + Math.sign(by - ay) * e], [ax, by], [bx - Math.sign(bx - ax) * e, by]]);
}

function draw(seed) {
  begin(seed);
  OX = 1200; OY = 787;
  board(-600, -375, 1200, 750, 18, '#e4e7dc', PAL.slate);
  for (const [a, b, side] of LINKS) link(a, b, side);

  const ids = Object.keys(STEP).sort((p, q) => { const [px, py] = spot(p), [qx, qy] = spot(q); return px + py - qx - qy; });
  for (const id of ids) {
    const [x, y] = spot(id), [, , col, tag] = STEP[id];
    const foot = [P(x - 40, y - 40), P(x + 40, y - 40), P(x + 40, y + 40), P(x - 40, y + 40)];
    group(`data-state="${id}"`, () => {
      out.push('<g class="on">'); litRing(foot); out.push('</g>');
      box(x - 24, y - 24, 0, 48, 48, 34, { left: PAL[col], marks: false });
      faceText('right', x + 24, y, 13, tag, { size: 9, cls: 'cap', col: '#3a3430' });
    });
  }
  for (const id of ids) {
    const [x, y] = spot(id), [px, py] = P(x + 24, y + 24);
    group(`data-state="${id}"`, () => {
      pill(px, py + 22, NAMES[id]);
      out.push('<g class="on">'); pill(px, py + 22, NAMES[id], { lit: true }); nowTag(px - textW(NAMES[id], 15) / 2 - 30, py + 14); out.push('</g>');
    });
  }
  who(-560, -260, { shirt: PAL.sky, hair: 'bun', arm: 'wave', say: 'Is there a code for this?' });
  who(-180, 330, { shirt: PAL.navy, hair: 'cap', arm: 'hold', look: -1, say: 'Packed and labelled.' });

  title('a flowchart', 'Checkout with a promo code');
  subtitle('eighteen steps from the cart to the courier, and every way off them');
  status(NAMES[AT], `card tries: ${V.tries} of 3`);
  label(72, 420, 'the promo loop', 'a bad code can be tried again', [...spot('rejected'), 34]);
  const lab = (id, z = 34) => [...spot(id), z];
  label(2328, 600, 'a way off', 'the page gives up after 15 minutes', lab('timed_out'), 'end');
  label(2328, 1040, 'three tries', 'then the shop stops asking', lab('declined'), 'end');
  label(72, 1110, 'after the order', 'nothing here can be undone', lab('shipped'));
  legend([{ col: PAL.sky, text: 'shop' }, { col: PAL.mustard, text: 'promo code' }, { col: PAL.sage, text: 'details' },
    { col: PAL.rose, text: 'payment' }, { col: PAL.lilac, text: 'after the order' }, { col: PAL.stone, text: 'a way off' }], 72, 1250);
  footnote('Illustrative: one made-up shop. Three card tries, and the payment page times out after 15 minutes.', 2256);
  finish();
}

function init(ctx) {
  const show = text => {
    document.getElementById('statusBig').textContent = NAMES[AT];
    document.getElementById('statusSmall').textContent = `card tries: ${V.tries} of 3`;
    if (text) ctx.say(text);
    ctx.state(AT);
  };
  const to = (id, text) => { AT = id; show(text); };

  ctx.button('next step', () => {
    switch (AT) {
      case 'browsing': return to('cart', 'The cart is empty.');
      case 'cart':
        if (!V.items) { V.items = 1; return show('A teapot goes in the cart.'); }
        return to('address', 'Check out.');
      case 'promo': return to('applied', 'TEAPOT10 works: 10% off.');
      case 'applied': return to('address', 'On to the address.');
      case 'rejected': return to('promo', 'Type it again.');
      case 'address': return to('shipping', 'Address saved.');
      case 'shipping': return to('review', 'Next-day delivery.');
      case 'review': return to('payment', 'The order looks right.');
      case 'payment': V.tries++; V.approved = false; V.asked = false; return to('authorising', 'The card goes to the bank.');
      case 'authorising':
        if (V.approved) return to('placed', 'The order is placed.');
        if (!V.asked) return to('challenge', 'The bank asks for a check in the app.');
        V.approved = true; return show('The bank says yes.');
      case 'challenge': V.asked = true; return to('authorising', 'Approved in the app.');
      case 'declined':
        if (V.tries >= 3) return ctx.say('Three cards declined. The shop does not ask for another one.');
        return to('payment', 'Try another card.');
      case 'placed': return to('emailed', 'The receipt is in the inbox.');
      case 'emailed': return to('packing', 'Picked from the shelf.');
      case 'packing': return to('shipped', 'Handed to the courier.');
      case 'timed_out': V.tries = 0; V.approved = false; return to('cart', 'Back to the cart. Nothing was charged.');
      default: return ctx.say(AT === 'shipped' ? 'Shipped. This order is done.' : 'Cancelled. Start a new order from the shop.');
    }
  });
  ctx.button('use a promo code', () => {
    if (AT !== 'cart') return ctx.say('Codes go in at the cart.');
    if (!V.items) return ctx.say('Add something first. A code needs a cart.');
    to('promo', 'Type the code.');
  });
  ctx.button('something goes wrong', () => {
    switch (AT) {
      case 'promo': return to('rejected', 'That code has expired.');
      case 'rejected': return to('address', 'Skip the code and pay full price.');
      case 'payment': return to('timed_out', 'Fifteen minutes pass. The page times out.');
      case 'authorising':
        if (V.approved) return ctx.say('The bank already said yes.');
        return to('declined', 'The bank says no.');
      case 'declined': return to('cancelled', 'Give up. Nothing was charged.');
      default: return ctx.say('Nothing can go wrong at this step.');
    }
  });
  ctx.hint('Press Play all, or next step. The view follows the order.');
  ctx.follow(true);
  show();

  const after = ['placed', 'emailed', 'packing', 'shipped'];
  return {
    goto(id) {
      AT = id;
      V = { items: id === 'browsing' ? 0 : 1, approved: after.includes(id), tries: ['browsing', 'cart', 'promo', 'applied', 'rejected', 'address', 'shipping', 'review', 'payment', 'timed_out'].includes(id) ? 0 : 1, asked: id === 'authorising' || after.includes(id) };
      show(NAMES[id] + '.');
    },
    story: ['browsing', 'cart', 'promo', 'rejected', 'promo', 'applied', 'address', 'shipping', 'review', 'payment', 'authorising', 'challenge', 'authorising', 'placed', 'emailed', 'packing', 'shipped'],
  };
}
