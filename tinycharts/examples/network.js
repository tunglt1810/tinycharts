// A school's phone chain on a snow day: who rings whom, round by round.
const ABOUT = 'who reaches whom';
const PEOPLE = ['the head', 'the caretaker', 'Mrs Obi', 'Mr Dale', 'the bus driver', 'the Patels', "Sam's dad", 'Ms Ng', "the twins' mum", 'Grandma Rose', 'the cook', 'the lollipop man', 'the new family'];
const CALLS = [[0, 1], [0, 2], [0, 3], [1, 4], [2, 5], [2, 6], [3, 7], [3, 8], [7, 4], [6, 9], [4, 10], [8, 11], [11, 9], [5, 9]];
const CARETAKER = 1, R = 34;
const AT_ = [[300, 450], [600, 400], [330, 700], [640, 630], [930, 400], [190, 930], [470, 940], [930, 660], [760, 910], [600, 1120], [1180, 490], [960, 1110], [1180, 830]];
const LOOK = [
  { shirt: PAL.navy, hair: 'bun' }, { shirt: PAL.sage, hair: 'cap' }, { shirt: PAL.rose, hair: 'long' }, { shirt: PAL.slate, hair: 'short' },
  { shirt: PAL.mustard, hair: 'cap' }, { shirt: PAL.sky, hair: 'short' }, { shirt: PAL.brick, hair: 'short' }, { shirt: PAL.sage, hair: 'bob' },
  { shirt: PAL.sky, hair: 'long' }, { shirt: PAL.rose, hair: 'bun' }, { shirt: '#f3f1ea', hair: 'cap' }, { shirt: PAL.mustard, hair: 'short' }, { shirt: PAL.slate, hair: 'bob' },
];
const NAMES = { start: 'only the head knows', calling: 'the calls go round', settled: 'no one new to call' };
let AT = 'start', K = 1, AWAY = false, ROUND = 0, FRESH = 0, WHEN = [0];

function nextRound(k, away) {
  let add = 0;
  for (const [a, b] of CALLS) if (k & (1 << a) && !(k & (1 << b)) && !(away && b === CARETAKER)) add |= 1 << b;
  return add;
}
const knows = i => !!(K & (1 << i));
const count = m => m.toString(2).replace(/0/g, '').length;

function village() {
  const road = pts => { out.push(`<path d="${pathOf(pts)}" fill="none" stroke="#e4ded2" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>`); out.push(`<path d="${pathOf(pts)}" fill="none" stroke="#f6f3ec" stroke-width="2" stroke-dasharray="10 12"/>`); };
  road([[90, 570], [520, 530], [1060, 570], [1320, 550]]);
  road([[520, 530], [560, 810], [420, 1170]]);
  road([[1060, 570], [1040, 930], [1120, 1190]]);
  for (let k = 0; k < 90; k++) { const x = 110 + (k * 197) % 1180, y = 350 + (k * 131) % 840; out.push(`<circle cx="${x}" cy="${y}" r="${1.2 + (k % 3) * 0.5}" fill="#ffffff" stroke="#d8dde2" stroke-width=".5"/>`); }
  const snowRoof = '#eef1f4';
  const house = (sx, sy, w, d, h, wall) => put(sy, 0, () => { const [x, y] = at(sx, sy); gable(x, y, w, d, h, 22, { wall, roof: snowRoof }); });
  put(400, 0, () => { const [x, y] = at(170, 400); gable(x, y, 120, 70, 50, 26, { wall: PAL.brick, roof: snowRoof }); faceText('left', x + 60, y + 70, 30, 'SCHOOL', { size: 14, cls: 'cap' }); });
  house(720, 350, 60, 50, 36, PAL.sand);
  house(70, 820, 60, 50, 36, PAL.sky);
  house(1250, 1060, 60, 50, 36, PAL.sand);
  house(1240, 750, 50, 46, 34, '#d9cbb0');
  house(1060, 350, 70, 50, 38, PAL.sage);
  house(430, 630, 50, 44, 32, '#e6d3c8');
  house(880, 810, 56, 46, 34, PAL.sky);
  house(230, 1140, 60, 48, 34, PAL.sage);
  house(1240, 260, 50, 44, 32, '#d9cbb0');
  for (const [sx, sy] of [[440, 370], [800, 490], [130, 690], [760, 1180], [1300, 960], [1300, 400], [330, 1100]]) put(sy, 0, () => { const [x, y] = at(sx, sy); tree(x, y, 22, 0, '#9fb3a2'); });
  flush();
}

function face(i, lit) {
  const [cx, cy] = AT_[i], on = knows(i), away = AWAY && i === CARETAKER;
  out.push(`<circle cx="${cx}" cy="${cy + 3}" r="${R + 2}" fill="${SHADOW}"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${on ? '#f1d892' : '#d9e0e6'}"/>`);
  clipped(oval(cx, cy, R - 1, R - 1, 40), () => person(cx, cy + 96, { ...LOOK[i], kid: false, size: 1.45 }));
  out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${lit ? RED : INK}" stroke-width="${lit ? 2.4 : 1.3}"/>`);
  if (away) { out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${PAPER}" fill-opacity=".55"/>`); }
  const t = PEOPLE[i], w = textW(t, 15) + 20;
  out.push(`<rect x="${n1(cx - w / 2)}" y="${cy + R + 6}" width="${n1(w)}" height="26" rx="13" fill="#fffdf6" stroke="${INK}" stroke-width="1"/>`);
  _text(cx, cy + R + 24, t, { size: 15, anchor: 'middle' });
  if (on) {
    out.push(`<circle cx="${cx + R - 4}" cy="${cy - R + 4}" r="11" fill="#fffdf6" stroke="${INK}" stroke-width="1"/>`);
    _text(cx + R - 4, cy - R + 9, String(WHEN[i]), { size: 13, anchor: 'middle' });
  }
}

// an arrow coming up from below stops under the name tag, not behind it
function edgeEnds(a, b) {
  const [x0, y0] = AT_[a], [x1, y1] = AT_[b], l = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / l, uy = (y1 - y0) / l;
  const te = uy < -0.5 ? (R + 38) / -uy : R + 6;
  return [[x0 + ux * (R + 4), y0 + uy * (R + 4)], [x1 - ux * te, y1 - uy * te]];
}
function link(a, b, lit) {
  flowArrow(edgeEnds(a, b), { w: lit ? 2.4 : 1.2, col: lit ? RED : INK });
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 0;
  village();
  const told = i => FRESH & (1 << i);
  for (const [a, b] of CALLS) link(a, b, told(b) && knows(a) && WHEN[a] === ROUND - 1);
  out.push(`<circle cx="330" cy="310" r="6" fill="${INK}"/>`);
  flowArrow([[328, 318], [AT_[0][0] + 8, AT_[0][1] - R - 6]], { w: 1.3, col: INK });
  _text(344, 306, 'the school shuts: the head rings first', { size: 14, col: LEAD });
  for (let i = 0; i < PEOPLE.length; i++) group(`id="p${i}"`, () => face(i, !!told(i)));
  _text(AT_[12][0], AT_[12][1] + R + 50, 'not on the list yet', { size: 13, col: LEAD, anchor: 'middle' });
  if (AWAY) { const [cx, cy] = AT_[CARETAKER]; _text(cx, cy - R - 10, 'out: no answer', { size: 14, col: RED, anchor: 'middle' }); }

  // the state pills
  const py = 1232;
  [['start', 260], ['calling', 520], ['settled', 780]].forEach(([id, x]) => group(`data-state="${id}"`, () => {
    pill(x, py, NAMES[id]);
    out.push('<g class="on">'); pill(x, py, NAMES[id], { lit: true }); nowTag(x, py - 18); out.push('</g>');
  }));
  flowArrow([[260 + textW(NAMES.start, 15) / 2 + 16, py], [520 - textW(NAMES.calling, 15) / 2 - 16, py]], { w: 1.1, col: INK });
  flowArrow([[520 + textW(NAMES.calling, 15) / 2 + 16, py], [780 - textW(NAMES.settled, 15) / 2 - 16, py]], { w: 1.1, col: INK });
  // the round counter
  _text(960, py + 5, 'round', { size: 14, col: LEAD });
  for (let r = 0; r <= 4; r++) {
    const x = 1030 + r * 46, on = r === ROUND;
    out.push(`<circle cx="${x}" cy="${py}" r="15" fill="${on ? RED : '#fffdf6'}" stroke="${on ? RED : INK}" stroke-width="1"/>`);
    _text(x, py + 5, String(r), { size: 14, col: on ? PAPER : INK, anchor: 'middle' });
  }
  legend([{ col: '#f1d892', text: 'knows' }, { col: '#d9e0e6', text: "hasn't heard" }], 120, 1286);
  line([[470, 1280], [500, 1280]], { w: 2.4, col: RED, over: 0 });
  _text(510, 1286, 'rung this round', { size: 16 });
  flowArrow([[680, 1280], [712, 1280]], { w: 1.2, col: INK });
  _text(722, 1286, 'one way only', { size: 16 });

  title('a network', 'Snow day');
  subtitle('the school shuts; who rings whom, round by round');
  status(`${count(K)} of ${PEOPLE.length} know`, `round ${ROUND} · ${NAMES[AT]}`);
  footnote('Illustrative: a made-up phone chain. Each round, everyone who knows rings the people on their list.');
  finish();
}

function init(ctx) {
  const redraw = () => { draw(23); ctx.state(AT); };
  const reset = () => { K = 1; AWAY = false; ROUND = 0; FRESH = 0; WHEN = [0]; AT = 'start'; };
  const ring = () => {
    const add = nextRound(K, AWAY);
    FRESH = add;
    if (!add) { AT = 'settled'; return 0; }
    ROUND++; K |= add;
    for (let i = 0; i < PEOPLE.length; i++) if (add & (1 << i)) WHEN[i] = ROUND;
    AT = 'calling';
    return add;
  };
  // each call of the round runs down its line as a red fill with a phone on
  // its tip; the one rung lights up when the phone gets there
  const calls = then => {
    const add = nextRound(K, AWAY), art = document.getElementById('art');
    const lines = CALLS.filter(([a, b]) => knows(a) && add & (1 << b)).map(([a, b]) => {
      const [p, q] = edgeEnds(a, b), ns = 'http://www.w3.org/2000/svg';
      const ln = document.createElementNS(ns, 'path'), ph = document.createElementNS(ns, 'g');
      ln.setAttribute('d', `M${n1(p[0])} ${n1(p[1])}L${n1(q[0])} ${n1(q[1])}`); ln.setAttribute('stroke', RED); ln.setAttribute('stroke-width', '3'); ln.setAttribute('stroke-linecap', 'round');
      const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      ln.setAttribute('stroke-dasharray', `${n1(L)} ${n1(L)}`); ln.setAttribute('stroke-dashoffset', n1(L));
      ph.innerHTML = `<circle r="12" fill="#fffdf6" stroke="${RED}" stroke-width="1.4"/><path d="M-6 -4Q-6 -7 -3 -7L-1 -3L-3 -1Q-1 3 2 4L4 2L7 4Q7 7 4 7Q-6 6 -6 -4Z" fill="${RED}"/>`;
      art.append(ln, ph);
      return { ln, ph, p, q, L };
    });
    if (!lines.length) { then(); return; }
    tween(ctx, 1500, k => {
      for (const { ln, ph, p, q, L } of lines) {
        ln.setAttribute('stroke-dashoffset', n1(L * (1 - k)));
        ph.setAttribute('transform', `translate(${n1(p[0] + (q[0] - p[0]) * k)} ${n1(p[1] + (q[1] - p[1]) * k)})`);
      }
    }, () => { for (const { ln, ph } of lines) { ln.remove(); ph.remove(); } then(); });
  };
  const rung = add => {
    redraw();
    if (!add) return ctx.say(`No one new heard. ${count(K)} of ${PEOPLE.length} know.`);
    ctx.say(`Round ${ROUND}: ${PEOPLE.filter((_, i) => add & (1 << i)).join(', ')}.`);
    for (let i = 0; i < PEOPLE.length; i++) if (add & (1 << i)) ctx.hop(document.getElementById('p' + i));
  };
  ctx.button('ring round', () => {
    if (AT === 'settled') return ctx.no('No one new to call. Start again.');
    calls(() => rung(ring()));
  });
  ctx.button('caretaker in or out', () => {
    if (AT === 'settled') return ctx.no('The chain has stopped. Start again first.');
    AWAY = !AWAY;
    ctx.say(AWAY ? 'The caretaker is out. Their phone rings with no answer.' : 'The caretaker is back home.');
    redraw();
  });
  ctx.button('start again', () => {
    if (AT !== 'settled') return ctx.no('Let the chain finish first.');
    reset(); ctx.say('Only the head knows.'); redraw();
  });
  ctx.hint('Press Play all, or ring round. Send the caretaker out and see who hears late.');
  redraw();

  // [state, rounds rung]; the last ring finds no one new
  const STORY = [['start', 0], ['calling', 1], ['calling', 2], ['calling', 3], ['settled', 4]];
  let si = -1;
  return {
    goto(id, play) {
      let j = play ? STORY.findIndex((s, k) => k > si && s[0] === id) : -1;
      if (j < 0) j = STORY.findIndex(s => s[0] === id);
      si = j;
      reset();
      const n = STORY[j][1], anim = play && n > 0;
      for (let r = 0; r < n - (anim ? 1 : 0); r++) ring();
      if (anim) { redraw(); return calls(() => { ring(); ctx.say(`${NAMES[AT]}: ${count(K)} of ${PEOPLE.length} know.`); rung(FRESH); }); }
      ctx.say(`${NAMES[AT]}: ${count(K)} of ${PEOPLE.length} know.`);
      redraw();
    },
    story: STORY.map(s => s[0]),
  };
}
