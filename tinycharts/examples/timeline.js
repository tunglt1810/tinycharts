// A loaf of bread, timed: every step on one tape, to scale. The baker moves
// from prop to prop, and a red playhead walks the tape.
const ABOUT = 'how long each step takes, to scale';
const HANDS = PAL.butter, WAIT = PAL.sky, HEAT = PAL.brick, EAT = PAL.rose;
// state, the word on the sheet, minutes, colour, side of the tape
const STEPS = [
  ['mixing', 'mix', 10, HANDS, -1], ['kneading', 'knead', 10, HANDS, 1], ['first_rise', 'first rise', 90, WAIT, -1, 'until it doubles'],
  ['shaping', 'shape', 5, HANDS, 1], ['proofing', 'second rise', 50, WAIT, -1], ['baking', 'bake', 32, HEAT, 1],
  ['cooling', 'cool', 60, WAIT, -1], ['sliced', 'eat', 10, EAT, 1],
];
const NAMES = { bowl: 'flour in the bowl', mixing: 'mixing', kneading: 'kneading', first_rise: 'first rise', shaping: 'shaping', proofing: 'second rise', baking: 'baking', cooling: 'cooling', sliced: 'sliced' };
const SAY = {
  bowl: 'Flour, water, salt and yeast. Nothing has happened yet.',
  mixing: 'Ten minutes to bring it together.', kneading: 'Ten minutes of push and fold, until it is smooth.',
  first_rise: 'Into the warm spot under a towel. Now it waits.', shaping: 'Five minutes to shape the loaf.',
  proofing: 'In the tin it rises again, for nearly an hour.', baking: 'Thirty-two minutes at 230 °C.',
  cooling: 'Out of the oven. On the rack it still cooks inside.', sliced: 'Ten minutes, and it is gone.',
};
const WAITS = { first_rise: true, cooling: true };
const X0 = -500, LEN = 1000, OFF = 150;
let AT = 'bowl', HEAD = X0, DONE = { first_rise: false, cooling: false };
let SPANS = [];

const ix = id => STEPS.findIndex(s => s[0] === id);
const propAt = id => { const i = ix(id), s = SPANS[i]; return [s.m, STEPS[i][4] * OFF]; };
const bakerAt = id => { const i = Math.max(0, ix(id)), s = SPANS[i] || { m: X0 }; return [s.m + 30, STEPS[i][4] < 0 ? -OFF - 55 : OFF - 75]; };
const minutesAt = x => (x - X0) / LEN * STEPS.reduce((t, s) => t + s[2], 0);
const clock = m => { const t = 8 * 60 + Math.round(m); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
// where the playhead stands in each state: a waiting step starts at its
// beginning and the wait walks it to the end; any other step is done at once
const headOf = (id, waited) => {
  if (id === 'bowl') return X0;
  const s = SPANS[ix(id)];
  return WAITS[id] && !waited ? s.a : s.b;
};

function wisps(sx, sy, n = 3) {
  for (let i = 0; i < n; i++) group(`class="wisp" data-x="${n1(sx + i * 9 - 9)}" data-y="${n1(sy)}"`, () => { const o = oval(sx + i * 9 - 9, sy, 6, 4, 12); fill(o, '#f6f1e6', { amp: 0.3 }); rim(o, 0.7); });
}

function prop(id) {
  const [x, y] = propAt(id);
  if (id === 'mixing') {
    box(x - 70, y - 20, 0, 34, 26, 40, { left: PAL.cream, top: PAL.sand, marks: false });
    faceText('left', x - 70, y + 6, 26, 'FLOUR', { size: 10 });
    turn(x + 10, y, 0, [[14, 0], [26, 20]], PAL.sky, { wall: 2, sink: 5, cap: PAL.cream });
    cyl(x + 50, y - 30, 0, 8, 24, PAL.mint, { cap: '#cfe3ec' });
  } else if (id === 'kneading') {
    box(x - 44, y - 30, 0, 88, 60, 6, { left: PAL.wood, top: PAL.tan, marks: false });
    const [bx, by] = P(x, y, 6); shape(blob(bx, by - 8, 26, 12, 0.1, 5), PAL.cream);
    for (let i = 0; i < 10; i++) out.push(`<circle cx="${n1(bx - 40 + rnd() * 80)}" cy="${n1(by + rnd() * 16)}" r="1.4" fill="#fffdf6"/>`);
  } else if (id === 'first_rise') {
    box(x - 70, y - 8, 0, 10, 80, 54, { left: PAL.stone, top: PAL.grey, marks: false });
    for (let k = 0; k < 5; k++) { const a = P(x - 60, y + k * 15, 50), b = P(x - 60, y + k * 15, 6); line([a, b], { w: 0.8, over: 0 }); }
    turn(x + 10, y + 20, 0, [[14, 0], [26, 20]], PAL.blue, { wall: 2, sink: 5, cap: PAL.cream });
    const [bx, by] = P(x + 10, y + 20, 20); shape(blob(bx, by - 6 - (DONE.first_rise ? 10 : 0), 30, DONE.first_rise ? 18 : 9, 0.06, 6), '#f5ecd8');
    shape([[bx - 20, by - 10], [bx + 26, by - 24], [bx + 34, by - 4], [bx - 6, by + 6]], PAL.rose, { w: 0.9 });
  } else if (id === 'shaping') {
    box(x - 24, y - 14, 0, 48, 28, 18, { left: '#8e96a3', top: '#b9bfc9', marks: false });
    const [bx, by] = P(x, y, 18); shape(blob(bx, by - 3, 22, 6, 0.05, 5), PAL.cream);
  } else if (id === 'proofing') {
    box(x - 24, y - 14, 0, 48, 28, 18, { left: '#8e96a3', top: '#b9bfc9', marks: false });
    const [bx, by] = P(x, y, 18); shape(blob(bx, by - 10, 26, 14, 0.05, 5), PAL.cream);
    cyl(x + 50, y - 10, 0, 10, 14, PAL.red, { cap: PAL.paper });
  } else if (id === 'baking') {
    box(x - 50, y - 40, 0, 100, 80, 78, { left: PAL.stone, top: PAL.grey, marks: false });
    const [a, b, c, d] = [P(x + 50, y - 26, 18), P(x + 50, y + 26, 18), P(x + 50, y + 26, 58), P(x + 50, y - 26, 58)];
    fill([a, b, c, d], AT === 'baking' ? '#e9a25e' : '#4b4644', { amp: 0.2 }); rim([a, b, c, d], 1.1);
    const [sx, sy] = P(x - 10, y - 10, 82); wisps(sx, sy - 6, 2);
  } else if (id === 'cooling') {
    for (const [dx, dy] of [[-40, -24], [40, -24], [-40, 24], [40, 24]]) box(x + dx - 2, y + dy - 2, 0, 4, 4, 22, { left: INK, marks: false });
    box(x - 44, y - 28, 22, 88, 56, 2, { left: PAL.grey, top: '#dcdfe4', marks: false });
    const [bx, by] = P(x, y, 24); shape(blob(bx, by - 12, 32, 16, 0.05, 5), '#c98a4b');
    line([[bx - 18, by - 18], [bx - 6, by - 24]], { w: 1, over: 0 }); line([[bx + 2, by - 20], [bx + 14, by - 26]], { w: 1, over: 0 });
    wisps(bx, by - 40);
  } else if (id === 'sliced') {
    box(x - 60, y - 34, 0, 120, 68, 36, { left: PAL.wood, top: PAL.sand, marks: false });
    const [bx, by] = P(x - 10, y, 36); shape(blob(bx, by - 10, 26, 13, 0.05, 5), '#c98a4b');
    for (const k of [0, 1, 2]) shape(oval(bx + 34 + k * 9, by - 4 + k * 3, 7, 9, 12), '#f3e3c0', { w: 0.8 });
  }
}

function caption(id) {
  const i = ix(id), [x, y] = propAt(id), [sx0, sy] = P(x, y), sx = sx0 + (id === 'first_rise' ? 40 : 0), [, name, min, , , until] = STEPS[i];
  const ty = sy + ({ kneading: 64, proofing: 56, baking: 110, sliced: 124 }[id] || 48);
  group(`data-state="${id}"`, () => {
    _text(sx, ty, `${i + 1} · ${name}`, { cls: 'cap', size: 16, anchor: 'middle' });
    _text(sx, ty + 22, until || `${min} min`, { size: 17, col: RED, anchor: 'middle' });
    if (until) _text(sx, ty + 42, `about ${min} min`, { size: 15, col: RED, anchor: 'middle' });
    out.push('<g class="on">');
    const hw = until ? 84 : 70, hb = until ? 50 : 30;
    litRing([[sx - hw, ty - 22], [sx + hw, ty - 22], [sx + hw, ty + hb], [sx - hw, ty + hb]]);
    nowTag(sx - hw - 26, ty - 8);
    out.push('</g>');
  });
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 720;
  // the tape, its clock times, and the start
  SPANS = tape(X0, 0, LEN, STEPS.map(s => ({ sec: s[2] * 60, col: s[3] })), { w: 40 });
  group('data-state="bowl"', () => {
    const [sx, sy] = P(X0 - 20, 0);
    _text(sx - 10, sy + 6, 'start', { cls: 'cap', size: 15, anchor: 'end' });
    out.push('<g class="on">'); nowTag(sx - 34, sy - 18); out.push('</g>');
  });
  // the props, far to near, with the people who use them
  for (const [id] of STEPS) put(propAt(id)[0] + propAt(id)[1], 0, () => prop(id));
  put(SPANS[2].m - 120 + OFF, 0, () => cat(SPANS[2].m - 40, -OFF - 50, 0));
  put(SPANS[7].m + OFF + 60, 0, () => {
    who(SPANS[7].m - 20, OFF + 70, { shirt: PAL.rose, pants: PAL.navy, hair: 'bob', kid: true, arm: 'out', look: 1, say: 'Is it ready yet?' });
    dog(SPANS[7].m + 110, OFF + 40, 0);
  });
  put(SPANS[7].m + OFF + 90, 0, () => who(SPANS[7].m + 80, OFF - 60, { shirt: PAL.sage, pants: PAL.bark, hair: 'bun', look: -1, say: 'Wait for the crust to sing.' }));
  put(SPANS[4].m - OFF - 30, 0, () => who(SPANS[4].m + 60, -OFF - 140, { shirt: PAL.sky, pants: PAL.slate, hair: 'cap', arm: 'wave', look: -1, say: 'Smells good from the door.' }));
  const bk = bakerAt(AT);
  put(bk[0] + bk[1] + 200, 0, () => group('id="baker"', () => who(...bk, { shirt: PAL.cream, pants: PAL.navy, hair: 'short', arm: AT === 'kneading' ? 'out' : 'hold', look: -1, say: 'Most of bread is waiting.' })));
  flush();
  for (const [id] of STEPS) caption(id);
  for (const x of [X0, SPANS[2].b, SPANS[4].b, SPANS[5].b, SPANS[6].b]) {
    const [sx, sy] = P(x, -30);
    _text(sx + 8, sy - 4, (x > SPANS[2].a ? 'about ' : '') + clock(minutesAt(x)), { size: 14, col: LEAD });
  }

  // the playhead
  group('id="head"', () => {
    const [sx, sy] = P(HEAD, 0, 4);
    line([[sx, sy], [sx, sy - 40]], { w: 2, col: RED, over: 0 });
    shape([[sx, sy - 40], [sx + 18, sy - 34], [sx, sy - 28]], RED, { w: 0.9 });
  });

  { const m = minutesAt(HEAD);
    group('id="clock"', () => dial(1250, 300, 44, 8 * 60 + m));
    _text(1250, 376, `${HEAD > SPANS[2].a ? 'about ' : ''}${clock(m)} now`, { size: 18, anchor: 'middle' }); }

  title('a timeline', 'A loaf of bread, timed');
  subtitle('every step to scale, from the bowl to the last slice');
  const i = ix(AT), min = i < 0 ? 0 : STEPS[i][2];
  status(NAMES[AT], i < 0 ? 'starts at 8:00' : STEPS[i][5] ? `${STEPS[i][5]}: about ${min} min, from ${clock(minutesAt(SPANS[i].a))}` : `${min} min, ${clock(minutesAt(SPANS[i].b) - min)} to ${clock(minutesAt(SPANS[i].b))}`);
  label(72, 300, 'the bowl', 'flour, water, salt, yeast', [...propAt('mixing'), 30]);
  label(72, 690, 'the board', 'a little flour, no more', [...propAt('kneading'), 6]);
  label(72, 870, 'the tin', 'oiled, so the loaf comes out', [...propAt('shaping'), 18]);
  label(72, 1040, 'the oven', '230 °C, steam for the crust', [...propAt('baking'), 60]);
  label(1328, 440, 'the warm spot', 'by the radiator, under a towel', [...propAt('first_rise'), 40], 'end');
  label(1328, 640, 'the rack', 'air all round, or the base goes soft', [...propAt('cooling'), 26], 'end');
  label(1328, 1150, 'the table', 'butter at the ready', [...propAt('sliced'), 36], 'end');
  legend([{ col: HANDS, text: 'hands on: 25 min' }, { col: WAIT, text: 'waiting: 3 h 20' }, { col: HEAT, text: 'oven: 32 min' }, { col: EAT, text: 'eating: 10 min' }], 72, 1250);
  footnote('Illustrative: one home loaf of 500 g flour, at a room of about 22 °C. The first rise has no fixed time: it ends when the dough doubles, so the times after it are about. The tape is to scale: 1 minute is the same length everywhere.');
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const steam = t => document.querySelectorAll('#art .wisp').forEach((w, i) => rise(w, (t * 0.25 + i / 3) % 1, 16, -46, 0.6, 1.5));
  const redraw = () => { draw(11); ctx.state(AT); steam(0); };
  // the playhead walks the tape; the baker follows a beat later
  const move = (to, change = () => {}) => {
    const from = HEAD, was = bakerAt(AT);
    change();
    const end = headOf(to, DONE[to]);
    hops(ctx, $('head'), [[from, 0, 4], [end, 0, 4]], { arc: 0, rest: 0, clock: [$('clock'), minutesAt(from), minutesAt(end)], then: () => {
      AT = to; HEAD = end; redraw();
      if (bakerAt(to)[0] !== was[0]) arrive(ctx, $('baker'), was, bakerAt(to), { delay: 0 });
    } });
  };
  const NEXT = { bowl: 'mixing', mixing: 'kneading', kneading: 'first_rise', first_rise: 'shaping', shaping: 'proofing', proofing: 'baking', baking: 'cooling' };

  ctx.button('next step', () => {
    if (AT === 'first_rise' && !DONE.first_rise) return ctx.no('It has not doubled yet. Wait.');
    if (AT === 'cooling') return ctx.no('Cooling is the last wait. Then slice it.');
    if (AT === 'sliced') return ctx.no('All gone. Play all bakes another.');
    const to = NEXT[AT];
    ctx.say(SAY[to]);
    move(to);
  });
  ctx.button('wait', () => {
    if (!WAITS[AT]) return ctx.no('Nothing here needs waiting for. Press next step.');
    if (DONE[AT]) return ctx.no(AT === 'cooling' ? 'It is cool. Slice it.' : 'It has doubled. Shape it.');
    ctx.say(AT === 'cooling' ? 'An hour on the rack. Now it is cool.' : 'An hour and a half. It has doubled.');
    move(AT, () => { DONE[AT] = true; });
  });
  ctx.button('slice it', () => {
    if (AT !== 'cooling') return ctx.no(AT === 'sliced' ? 'Already sliced.' : 'There is no loaf yet.');
    if (!DONE.cooling) return ctx.no('Too hot. Inside it is still cooking. Wait an hour.');
    ctx.say(SAY.sliced);
    move('sliced');
  });
  ctx.hint('Press Play all, or next step.');
  redraw();

  const STORY = ['bowl', 'mixing', 'kneading', 'first_rise', 'shaping', 'proofing', 'baking', 'cooling', 'sliced'];
  return {
    goto(id, play) {
      const k = STORY.indexOf(id);
      if (id === 'bowl') DONE = { first_rise: false, cooling: false };
      // in the story, a waiting step is shown with its wait done
      DONE.first_rise = k >= 3; DONE.cooling = k >= 7;
      ctx.say(SAY[id]);
      if (play && id !== AT) move(id);
      else { AT = id; HEAD = headOf(id, DONE[id]); redraw(); }
    },
    tick: steam,
    story: STORY,
  };
}
