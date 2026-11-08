// Signing in with a passkey, as a sequence: one lifeline for each actor,
// one row for each message, and the message itself flying along its row.
const SIZE = [2400, 1700];
const ABOUT = 'who says what to whom, in order';
const NAMES = {
  idle: 'signed out', asked: 'sign in pressed', begun: 'login begun', challenged: 'challenge sent', prompting: 'the phone asks',
  signed: 'face checked', returned: 'signature back', checking: 'login finishing', lookup: 'key asked for', keyed: 'key found', signed_in: 'signed in',
};
const LANES = { you: 330, phone: 680, chrome: 1030, nginx: 1380, keycloak: 1730, pg: 2080 };
const HEADS = [
  ['you', 'you', null, '#f1e1d6'], ['phone', 'iPhone', 'iOS', '#dfe6ee'], ['chrome', 'Chrome', 'Chrome', '#e9e4d4'],
  ['nginx', 'NGINX', 'NGINX', '#e1e9dc'], ['keycloak', 'Keycloak', 'Keycloak', '#e6e0ec'], ['pg', 'PostgreSQL', 'PostgreSQL', '#dee5ec'],
];
const Y0 = 690, DY = 80, TOP = 330;
// one row per message: the state it leads to, from, to, words, a reply?, through the gateway?
const ROWS = [
  ['asked', 'you', 'chrome', 'sign in'],
  ['begun', 'chrome', 'keycloak', 'POST /login/begin', false, true],
  ['challenged', 'keycloak', 'chrome', 'challenge 7f3a', true, true],
  ['prompting', 'chrome', 'phone', 'sign in to shop.example?'],
  ['signed', 'you', 'phone', 'Face ID'],
  ['returned', 'phone', 'chrome', 'signed 7f3a', true],
  ['checking', 'chrome', 'keycloak', 'POST /login/finish', false, true],
  ['lookup', 'keycloak', 'pg', 'key for this passkey?'],
  ['keyed', 'pg', 'keycloak', 'public key', true],
  ['signed_in', 'keycloak', 'chrome', 'session cookie', true, true],
];
const ROW = Object.fromEntries(ROWS.map((r, i) => [r[0], i]));
const rowY = i => Y0 + i * DY;
// where each actor changes state: lane, below which row, the words
const PILLS = [
  ['you', -1, 'signed out'], ['phone', -1, 'locked'], ['chrome', -1, 'shop.example'], ['nginx', -1, 'open'], ['keycloak', -1, 'waiting'], ['pg', -1, '3 passkeys'],
  ['chrome', 1, 'waiting'], ['keycloak', 2, 'expects 7f3a'], ['phone', 4, 'unlocked'], ['chrome', 5, 'has a signature'],
  ['keycloak', 8, 'checks it'], ['you', 9, 'signed in'], ['phone', 9, 'locked'], ['pg', 9, '3 passkeys'],
];
// activation bars: lane, first row, last row
const BARS = [['chrome', 0, 3], ['keycloak', 1, 2], ['phone', 3, 5], ['chrome', 5, 6], ['keycloak', 6, 9], ['pg', 7, 8]];
let AT = 'idle', HOP = null;
let V = { ch: 0, sig: -1, face: false };

const lane = k => LANES[k];

function head([k, name, key, tint]) {
  const cx = lane(k), x0 = cx - 140, c = [[x0, TOP], [x0 + 280, TOP], [x0 + 280, TOP + 240], [x0, TOP + 240]];
  fill(c, tint, { amp: 0.4 }); rim(c, 1.2);
  OX = cx; OY = TOP + 118;
  board(-60, -60, 120, 120, 8, '#efe9da', PAL.tan);
  if (key) tech(key, 0, 0);
  else who(0, 0, { shirt: PAL.rose, pants: PAL.navy, hair: 'bun', arm: 'hold', look: 1, say: 'I just want to sign in.' });
  _text(cx, TOP + 226, name, { cls: 'cap', size: 18, anchor: 'middle' });
}

function row(i) {
  const [id, a, b, text, reply, via] = ROWS[i], y = rowY(i), xa = lane(a), xb = lane(b), dir = Math.sign(xb - xa);
  const p = [[xa + dir * 8, y], [xb - dir * 10, y]], mid = via ? (Math.min(xa, xb) + lane('nginx')) / 2 : (xa + xb) / 2, lx = mid - textW(text, 17) / 2;
  group(`data-state="${id}"`, () => {
    flowArrow(p, { dashed: !!reply, col: '#b3aa9d', w: 1.4 });
    out.push(`<circle cx="${n1(lx - 16)}" cy="${n1(y - 16)}" r="9" fill="#b3aa9d"/>`);
    _text(lx - 16, y - 11.5, String(i + 1), { size: 13, col: PAPER, anchor: 'middle' });
    _text(lx, y - 10, text, { size: 17, col: MUTE });
    if (via) out.push(`<circle cx="${n1(lane('nginx'))}" cy="${y}" r="4" fill="#b3aa9d"/>`);
    out.push('<g class="on">');
    flowArrow(p, { dashed: !!reply, w: 2.2 });
    out.push(`<circle cx="${n1(lx - 16)}" cy="${n1(y - 16)}" r="9" fill="${RED}"/>`);
    _text(lx - 16, y - 11.5, String(i + 1), { size: 13, col: PAPER, anchor: 'middle' });
    _text(lx, y - 10, text, { size: 17 });
    nowTag(lx + textW(text, 17) + 34, y - 8);
    out.push('</g>');
  });
}

function draw(seed) {
  begin(seed);
  // the frame, its tab, and time running down
  const F = [[150, 270], [2330, 270], [2330, 1520], [150, 1520]];
  rim(F, 1.2);
  const tab = [[150, 270], [520, 270], [500, 306], [150, 306]];
  fill(tab, '#f3ead8', { amp: 0.2 }); rim(tab, 1);
  _text(166, 294, 'sd', { size: 13, col: MUTE }); _text(194, 295, 'sign in with a passkey', { size: 18 });
  flowArrow([[112, 600], [112, 1470]], { col: LEAD, w: 1.2 });
  out.push(`<text class="it" x="100" y="1040" font-size="16" fill="${LEAD}" transform="rotate(-90 100 1040)" text-anchor="middle">time</text>`);

  for (const k of Object.keys(LANES)) dash([lane(k), TOP + 250], [lane(k), 1500], '#9a9187', 6, 6, 1.2);
  for (const [k, r0, r1] of BARS) { const b = [[lane(k) - 7, rowY(r0) - 8], [lane(k) + 7, rowY(r0) - 8], [lane(k) + 7, rowY(r1) + 8], [lane(k) - 7, rowY(r1) + 8]]; flat(b, PAPER); rim(b, 1); }
  HEADS.forEach(head);
  OX = 1200; OY = 0;
  // the people who can get it wrong, by the heads they act on
  person(lane('phone') + 170, TOP + 228, { shirt: PAL.sage, pants: PAL.bark, hair: 'cap', arm: 'out', look: -1, say: 'Let me see that phone.' });
  person(lane('chrome') + 170, TOP + 228, { shirt: PAL.slate, pants: INK, hair: 'short', arm: 'hold', look: -1, say: 'I kept yesterday’s signature.' });
  person(lane('keycloak') + 166, TOP + 228, { shirt: PAL.mustard, pants: PAL.navy, hair: 'long', look: -1, say: 'One challenge, one use.' });
  person(lane('pg') + 166, TOP + 228, { shirt: PAL.sky, pants: PAL.slate, hair: 'bob', kid: false, look: -1, say: 'Only public keys in here.' });

  for (const [k, r, text] of PILLS) {
    const y = r < 0 ? TOP + 278 : rowY(r) + 40;
    if (r < 0 && k === 'you') group('data-state="idle"', () => {
      pill(lane(k), y, text);
      out.push('<g class="on">'); pill(lane(k), y, text, { lit: true }); nowTag(lane(k) - 84, y - 6); out.push('</g>');
    });
    else pill(lane(k), y, text);
  }
  ROWS.forEach((r, i) => row(i));
  _text(lane('phone') + 44, rowY(4) + 26, 'the private key never leaves the phone', { size: 15, col: LEAD });

  // the message in flight, an envelope over its row
  const i = ROW[AT];
  if (i !== undefined) group('id="msg"', () => {
    const [, , b, , reply] = ROWS[i], [x, y] = HOP || [lane(b), rowY(i)];
    message(...at(x, y), 20, { col: reply ? PAL.leaf : PAL.sky });
  });

  title('a sequence', 'Signing in with a passkey');
  subtitle('six lifelines, ten messages, no password anywhere');
  status(i === undefined ? '0 of 10' : `${i + 1} of 10`, NAMES[AT]);
  footnote('Illustrative: the WebAuthn flow, made short. The phone signs the challenge with a private key that never leaves it. Keycloak checks the signature with the public key from PostgreSQL. Logos are trademarks of their owners.', 2256);
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(3); ctx.state(AT); };
  // send the message that leads to state id: the envelope hops along its row
  const send = (id, change = () => {}) => {
    const i = ROW[id], [, a, b, , , via] = ROWS[i], y = rowY(i);
    const pts = [[lane(a), y], ...(via ? [[lane('nginx'), y]] : []), [lane(b), y]];
    change(); AT = id; HOP = pts[0]; redraw();
    hops(ctx, $('msg'), pts.map(p => [...at(...p), 0]), { then: () => { HOP = null; redraw(); } });
  };
  const NEXT = { idle: 'asked', asked: 'begun', begun: 'challenged', challenged: 'prompting', signed: 'returned', returned: 'checking', checking: 'lookup', lookup: 'keyed' };
  const SAY = {
    asked: 'You press Sign in. No password box.', begun: 'Chrome asks Keycloak to begin, through NGINX.',
    challenged: 'Keycloak sends a fresh challenge: 7f3a.', prompting: 'Chrome asks the phone to sign it.',
    returned: 'The phone sends back the signed challenge.', checking: 'Chrome sends the signature to Keycloak.',
    lookup: 'Keycloak asks PostgreSQL for the public key.', keyed: 'Here it is. Now Keycloak can check.',
  };

  ctx.button('next message', () => {
    if (AT === 'prompting') { ctx.say('Face ID knows you. The phone signs.'); return send('signed', () => { V.face = true; }); }
    if (AT === 'keyed') {
      if (V.sig === V.ch) { ctx.say('The signature fits. You are signed in.'); return send('signed_in'); }
      ctx.no('That signature is for an old challenge. Keycloak refuses it.');
      AT = 'idle'; V = { ch: V.ch, sig: -1, face: false }; return redraw();
    }
    if (AT === 'signed_in') { ctx.say('Signed out. Press next message to sign in again.'); AT = 'idle'; V.face = false; V.sig = -1; return redraw(); }
    const to = NEXT[AT];
    ctx.say(SAY[to]);
    send(to, () => {
      if (to === 'challenged') { V.ch++; V.sig = -1; }
      if (to === 'returned') V.sig = V.ch;
    });
  });
  ctx.button('a stranger looks', () => {
    if (AT !== 'prompting') return ctx.no('The phone is not asking for a face now.');
    ctx.no('Face ID does not know that face. The phone signs nothing.');
    AT = 'idle'; V.face = false; redraw();
  });
  ctx.button('replay an old one', () => {
    if (AT !== 'returned') return ctx.no('There is no signature on its way to swap.');
    ctx.say('An attacker sends yesterday’s signature instead.');
    send('checking', () => { V.sig = V.ch - 1; });
  });
  ctx.hint('Press Play all, or next message.');
  ctx.follow(true);
  redraw();

  const STORY = ['idle', 'asked', 'begun', 'challenged', 'prompting', 'signed', 'returned', 'checking', 'lookup', 'keyed', 'signed_in'];
  return {
    goto(id, play) {
      const k = STORY.indexOf(id);
      V = { ch: k >= 3 ? 1 : 0, sig: k >= 6 ? 1 : -1, face: k >= 5 };
      ctx.say(NAMES[id] + '.');
      if (play && ROW[id] !== undefined) send(id);
      else { AT = id; HOP = null; redraw(); }
    },
    story: STORY,
  };
}
