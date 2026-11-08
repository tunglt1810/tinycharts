// Bike or bus: £120 for a bike once, or £2.50 a bus ride; the lines cross at 48 rides.
const ABOUT = 'the point where one option wins';
const BIKE = 120, FARE = 2.5, EVEN = BIKE / FARE, MAX = 80;
const NAMES = { bus: 'the bus is cheaper so far', even: 'the bike has paid for itself', bike: 'the bike is cheaper now' };
const BLUE = '#5f7db5';
let N = 0, AT = 'bus';

const X = n => 220 + n * 13, Y = p => 860 - p * 2.5;
const stateOf = n => n * FARE > BIKE ? 'bike' : n * FARE === BIKE ? 'even' : 'bus';

function chart() {
  // the grid and the axes
  for (let p = 0; p <= 200; p += 40) {
    out.push(`<path d="M${X(0)} ${Y(p)}H${X(MAX)}" stroke="#e2dbcd" stroke-width="1"/>`);
    _text(X(0) - 14, Y(p) + 5, `£${p}`, { size: 14, anchor: 'end', col: LEAD });
  }
  for (let n = 0; n <= MAX; n += 10) {
    out.push(`<path d="M${X(n)} ${Y(0)}V${Y(200)}" stroke="#e2dbcd" stroke-width="1"/>`);
    _text(X(n), Y(0) + 28, String(n), { size: 14, anchor: 'middle', col: LEAD });
  }
  flowArrow([[X(0), Y(0)], [X(0), Y(214)]], { w: 1.4, col: INK });
  flowArrow([[X(0), Y(0)], [X(MAX) + 30, Y(0)]], { w: 1.4, col: INK });
  _text(X(0), Y(214) - 16, 'spent on getting to school', { size: 15, col: LEAD });
  _text(X(MAX), Y(0) - 12, 'rides this term', { size: 15, col: LEAD, anchor: 'end' });
  // the two areas between the lines
  out.push(`<path d="M${X(0)} ${Y(0)}L${X(EVEN)} ${Y(BIKE)}L${X(0)} ${Y(BIKE)}Z" fill="${RED}" fill-opacity=".14"/>`);
  out.push(`<path d="M${X(EVEN)} ${Y(BIKE)}L${X(MAX)} ${Y(MAX * FARE)}L${X(MAX)} ${Y(BIKE)}Z" fill="${BLUE}" fill-opacity=".14"/>`);
  _text(X(18), Y(96), 'the bus is cheaper', { size: 15, col: RED, anchor: 'middle' });
  _text(X(18), Y(96) + 20, 'under 48 rides', { size: 13, col: RED, anchor: 'middle' });
  _text(X(74), Y(144), 'the bike pays off', { size: 15, col: BLUE, anchor: 'middle' });
  _text(X(74), Y(144) + 20, 'past 48 rides', { size: 13, col: BLUE, anchor: 'middle' });
  // the lines
  line([[X(0), Y(BIKE)], [X(MAX), Y(BIKE)]], { w: 2.4, col: BLUE, over: 0 });
  line([[X(0), Y(0)], [X(MAX), Y(MAX * FARE)]], { w: 2.4, col: RED, over: 0 });
  _text(X(1), Y(BIKE) - 12, 'a bike: £120 once, then free', { size: 16, col: BLUE });
  _text(X(30), Y(30 * FARE) + 30, 'the bus: £2.50 a ride', { size: 16, col: RED, anchor: 'middle', extra: `transform="rotate(-25.6 ${X(30)} ${Y(30 * FARE)})"` });
  out.push(`<circle cx="${X(0)}" cy="${Y(BIKE)}" r="7" fill="${BLUE}" stroke="${INK}" stroke-width="1"/>`);
  // the crossing and its note
  out.push(`<path d="M${X(EVEN)} ${Y(BIKE)}V${Y(0)}" stroke="${INK}" stroke-width="1" stroke-dasharray="5 4"/>`);
  out.push(`<circle cx="${X(EVEN)}" cy="${Y(BIKE)}" r="10" fill="#fffdf6" stroke="${INK}" stroke-width="1.6"/><circle cx="${X(EVEN)}" cy="${Y(BIKE)}" r="3.4" fill="${INK}"/>`);
  const bx = X(EVEN) - 170, by = Y(200) - 10, lit = AT === 'even';
  out.push(`<rect x="${bx + 4}" y="${by + 5}" width="340" height="70" rx="8" fill="#e4ddd0"/><rect x="${bx}" y="${by}" width="340" height="70" rx="8" fill="#fffdf6" stroke="${lit ? RED : INK}" stroke-width="${lit ? 2 : 1.2}"/>`);
  _text(bx + 170, by + 30, 'break-even: 48 rides', { size: 20, anchor: 'middle' });
  _text(bx + 170, by + 54, '48 × £2.50 = £120, the bike price', { size: 13, anchor: 'middle', col: LEAD });
  flowArrow([[X(EVEN), by + 72], [X(EVEN), Y(BIKE) - 14]], { w: 1.1, col: INK });
}

function mark() {
  const x = X(N), y = Y(N * FARE);
  group('id="mark"', () => {
    out.push(`<path d="M${n1(x)} ${n1(y)}V${Y(0)}" stroke="${RED}" stroke-width="1.4"/>`.replace(`V${Y(0)}`, `V${Y(0) + 38}`));
    out.push(`<circle cx="${n1(x)}" cy="${n1(y)}" r="7" fill="${RED}" stroke="${INK}" stroke-width="1"/>`);
    const t = `${N} rides`, w = textW(t, 15) + 22;
    out.push(`<rect x="${n1(x - w / 2)}" y="${Y(0) + 38}" width="${n1(w)}" height="26" rx="13" fill="${INK}"/>`);
    _text(x, Y(0) + 56, t, { size: 15, anchor: 'middle', col: PAPER });
    nowTag(x, y - 14);
  });
}

function strip() {
  const panel = (x, w, cap, col, lit) => {
    out.push(`<rect x="${x}" y="960" width="${w}" height="270" rx="10" fill="none" stroke="${lit ? RED : '#c4bbae'}" stroke-width="${lit ? 2 : 1}"/>`);
    _text(x + w - 18, 990, cap, { size: 14, cls: 'cap', col, anchor: 'end' });
  };
  panel(72, 400, 'THE BUS', RED, AT === 'bus');
  panel(500, 400, 'THE MONEY', INK, AT === 'even');
  panel(928, 400, 'A BIKE', BLUE, AT === 'bike');
  // the money as two stacks of £10 coins: bus fares so far, and the bike's price
  for (const [x, n, col, t] of [[620, Math.floor(N * FARE / 10), RED, `bus £${(N * FARE).toFixed(2)}`], [780, BIKE / 10, BLUE, `bike £${BIKE}`]]) {
    for (let k = 0; k < n; k++) out.push(`<ellipse cx="${x}" cy="${1176 - k * 7}" rx="26" ry="9" fill="#e9cf86" stroke="${INK}" stroke-width="1"/>`);
    if (!n) out.push(`<ellipse cx="${x}" cy="1176" rx="26" ry="9" fill="none" stroke="${MUTE}" stroke-dasharray="4 4"/>`);
    _text(x, 1212, t, { size: 14, anchor: 'middle', col });
  }
  _text(520, 990, 'one coin is £10', { size: 13, col: LEAD });
  // the bus stop and the bus
  OX = 170; OY = 1080;
  box(6, 2, 0, 56, 14, 22, { left: PAL.wood, top: '#d8b98e', marks: false });
  for (const dx of [4, 66]) line([P(dx, 28, 0), P(dx, 28, 84)], { w: 2.2, over: 0 });
  box(0, 0, 84, 72, 32, 6, { left: '#8d9397', top: '#b9bdc0', marks: false });
  line([P(-30, 40, 0), P(-30, 40, 112)], { w: 2.4, over: 0 });
  const [sx, sy] = P(-30, 40, 118);
  out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="14" fill="#fffdf6" stroke="${RED}" stroke-width="2"/>`);
  _text(sx, sy + 4, 'BUS', { size: 9, anchor: 'middle', cls: 'cap' });
  who(36, 46, { shirt: PAL.mustard, pants: PAL.slate, hair: 'bob', arm: 'hold', look: 1 });
  OX = 330; OY = 1030;
  out.push(`<path d="M${n1(P(-40, 64, 0)[0])} ${n1(P(-40, 64, 0)[1])}L${n1(P(200, 64, 0)[0])} ${n1(P(200, 64, 0)[1])}" stroke="${LEAD}" stroke-width="1.2" stroke-dasharray="10 8"/>`);
  group('id="bus"', () => {
    OX = 330; OY = 1030;
    box(0, 0, 0, 150, 50, 58, { left: PAL.brick, top: '#e8e2d6', marks: false });
    for (let k = 0; k < 4; k++) windowL(14 + k * 32, 50, 26, 22, 22);
    for (const wx of [28, 122]) { const [cx, cy] = P(wx, 50, 0); out.push(`<circle cx="${n1(cx)}" cy="${n1(cy)}" r="11" fill="${INK}"/><circle cx="${n1(cx)}" cy="${n1(cy)}" r="4" fill="#c9cdd3"/>`); }
  });
  OX = 700; OY = 0;
  _text(100, 1214, `£2.50 a ride · paid so far: £${(N * FARE).toFixed(2)}`, { size: 14, col: LEAD });
  // the bike and its rider
  const cx = 980, cy = 1150, r = 38;
  group('id="bike"', () => {
    for (const wx of [cx, cx + 130]) out.push(`<circle cx="${wx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="${wx}" cy="${cy}" r="3" fill="${INK}"/>`);
    out.push(`<path d="M${cx} ${cy}L${cx + 50} ${cy - 60}L${cx + 110} ${cy - 60}L${cx + 130} ${cy}M${cx + 50} ${cy - 60}L${cx + 64} ${cy}L${cx + 110} ${cy - 60}M${cx + 64} ${cy}L${cx} ${cy}" fill="none" stroke="${BLUE}" stroke-width="4" stroke-linejoin="round"/>`);
    out.push(`<path d="M${cx + 40} ${cy - 74}H${cx + 64}M${cx + 50} ${cy - 60}L${cx + 46} ${cy - 74}M${cx + 110} ${cy - 60}L${cx + 116} ${cy - 82}L${cx + 130} ${cy - 84}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`);
  });
  person(1268, 1196, { shirt: PAL.sage, pants: PAL.navy, hair: 'short', arm: AT === 'bus' ? 'down' : 'wave', look: -1 });
  // the price tag on the bike
  out.push(`<rect x="1190" y="1010" width="120" height="40" rx="6" fill="#fffdf6" stroke="${BLUE}" stroke-width="1.4"/>`);
  _text(1250, 1036, '£120 once', { size: 16, anchor: 'middle', col: BLUE });
  _text(956, 1214, AT === 'bus' ? `still £${(BIKE - N * FARE).toFixed(2)} to pay off` : AT === 'even' ? 'paid off today' : `£${(N * FARE - BIKE).toFixed(2)} saved so far`, { size: 14, col: LEAD });
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 0;
  chart();
  mark();
  strip();
  let px = 1328;
  for (const id of ['bike', 'even', 'bus']) {
    const t = NAMES[id], w = textW(t, 15) + 26, cx = px - w / 2;
    group(`data-state="${id}"`, () => { pill(cx, 1270, t); out.push('<g class="on">'); pill(cx, 1270, t, { lit: true }); nowTag(cx, 1248); out.push('</g>'); });
    px -= w + 10;
  }
  title('break-even', 'Bike or bus?');
  subtitle('one school term: where the lines cross');
  status(NAMES[AT], `${N} rides: £${(N * FARE).toFixed(2)} on the bus`);
  footnote('Illustrative prices: £2.50 a bus ride, £120 for a second-hand bike.');
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(27); ctx.state(AT); };
  // the dot runs up the bus line to the new count, the bus pulls away and
  // back; the count, the coins and the sums go up ride by ride on the way
  const go = (to, then = () => {}) => {
    const from = N;
    tween(ctx, Math.min(1600, 500 + Math.abs(to - from) * 40), k => {
      const x = from + (to - from) * k, n = k < 1 ? Math.round(x) : to;
      if (n !== N) {
        const was = AT;
        N = n; AT = stateOf(N); draw(27);
        // ctx.state also rewrites the URL, too often for every ride
        if (AT !== was) ctx.state(AT); else document.querySelectorAll('#art [data-state]').forEach(el => el.classList.toggle('lit', el.dataset.state === AT));
      }
      $('mark').setAttribute('transform', `translate(${n1((x - N) * 13)} ${n1(-(x - N) * FARE * 2.5)})`);
      if (to > from) $('bus').setAttribute('transform', `translate(${n1(90 * Math.sin(Math.PI * k))} ${n1(-52 * Math.sin(Math.PI * k))})`);
      else $('bike').setAttribute('transform', `translate(${n1(-60 * Math.sin(Math.PI * k))} 0)`);
    }, () => {
      redraw();
      if (AT === 'even') ctx.hop($('art').querySelector('circle[r="10"]'));
      then();
    });
  };
  const add = k => {
    if (N >= MAX) return ctx.no('The term is over at 80 rides. Start again.');
    go(Math.min(MAX, N + k), () => ctx.say(AT === 'bus' ? `${N} rides: £${(N * FARE).toFixed(2)} on the bus. The bus is still cheaper.` : AT === 'even' ? '48 rides: £120 on the bus, the price of the bike.' : `${N} rides: the bike has saved £${(N * FARE - BIKE).toFixed(2)}.`));
  };
  ctx.button('ride', () => add(1));
  ctx.button('a week of rides', () => add(10));
  ctx.button('start again', () => {
    if (AT === 'bus') return ctx.no('The bike has not paid off yet. Ride on first.');
    go(0, () => ctx.say('A new term: 0 rides.'));
  });
  ctx.hint('Press Ride or A week of rides, or Play all.');
  redraw();

  const STORY = [['bus', 0], ['bus', 20], ['bus', 40], ['even', 48], ['bike', 64]];
  let si = -1;
  return {
    goto(id, play) {
      let j = play ? STORY.findIndex((s, k) => k > si && s[0] === id) : -1;
      if (j < 0) j = STORY.findIndex(s => s[0] === id);
      si = j;
      const to = STORY[j][1];
      if (play && to !== N) return go(to, () => ctx.say(`${NAMES[AT]}: ${N} rides.`));
      N = to; AT = stateOf(N);
      ctx.say(`${NAMES[AT]}: ${N} rides.`);
      redraw();
    },
    story: STORY.map(s => s[0]),
  };
}
