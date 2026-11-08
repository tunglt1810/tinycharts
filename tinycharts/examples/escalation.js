// A lost bag at a train station: four levels, a clock on each; no answer in time sends it up.
const ABOUT = 'who takes it next, if no one answers';
const LEVELS = [
  { id: 'platform', who: 'platform guard', lim: 10, within: 'answers within 10 min', late: 'no answer in 10 min', found: 'under the bench', look: { shirt: PAL.navy, pants: PAL.slate, hair: 'cap' } },
  { id: 'office', who: 'ticket office', lim: 30, within: 'answers within 30 min', late: 'no answer in 30 min', found: 'handed in at the window', look: { shirt: PAL.sage, pants: PAL.slate, hair: 'bob' } },
  { id: 'manager', who: 'station manager', lim: 120, within: 'answers within 2 hours', late: 'no answer in 2 hours', found: 'still on the 9:40 train', look: { shirt: PAL.blue, pants: 'black', hair: 'short' } },
  { id: 'depot', who: 'lost property', lim: 0, within: 'answers within 2 days', late: '', found: 'sent from the depot', look: { shirt: PAL.rose, pants: PAL.slate, hair: 'bun' } },
];
const NAMES = { platform: 'the platform guard has it', office: 'the ticket office has it', manager: 'the station manager has it', depot: 'lost property has it', found: 'the bag is found' };
const CW = 330, CH = 112, GREEN = '#5f8f6a';
let AT = 'platform', LV = 0;

const card = i => [80 + i * 120, 1060 - i * 200];
const bagAt = i => i < 0 ? [1222, 1112] : [card(i)[0] + CW + 30, card(i)[1] + CH - 4];

function suitcase(sx, sy, s = 1) {
  const w = 30 * s, h = 22 * s;
  out.push(`<g><path d="M${n1(sx - 6 * s)} ${n1(sy - h)}v${n1(-5 * s)}h${n1(12 * s)}v${n1(5 * s)}" fill="none" stroke="${INK}" stroke-width="1.6"/>` +
    `<rect x="${n1(sx - w / 2)}" y="${n1(sy - h)}" width="${n1(w)}" height="${n1(h)}" rx="${n1(3 * s)}" fill="${PAL.brick}" stroke="${INK}" stroke-width="1.4"/>` +
    `<path d="M${n1(sx - w / 2 + 6 * s)} ${n1(sy - h)}v${n1(h)}M${n1(sx + w / 2 - 6 * s)} ${n1(sy - h)}v${n1(h)}" stroke="${INK}" stroke-width="1"/></g>`);
}

function level(i) {
  const L = LEVELS[i], [x, y] = card(i), lit = i === LV && AT !== 'found', past = i < LV;
  if (i < LEVELS.length - 1) {
    const ny = card(i + 1)[1], ax = x + 150;
    line([[ax, y], [ax, ny + CH + 30]], { w: 1.1, over: 0 });
    flowArrow([[ax, ny + CH + 30], [ax, ny + CH + 4]], { w: 1.1, col: INK });
    const t = L.late, w = textW(t, 14) + 24, py = (y + ny + CH) / 2;
    out.push(`<rect x="${n1(ax - w / 2)}" y="${n1(py - 13)}" width="${n1(w)}" height="26" rx="13" fill="${PAPER}" stroke="${past ? RED : INK}" stroke-width="1.1"/>`);
    _text(ax, py + 5, t, { size: 14, anchor: 'middle', col: past ? RED : INK });
  }
  group(`id="c${i}"`, () => {
    out.push(`<rect x="${x + 4}" y="${y + 5}" width="${CW}" height="${CH}" rx="9" fill="#e4ddd0"/>`);
    out.push(`<rect x="${x}" y="${y}" width="${CW}" height="${CH}" rx="9" fill="#fffdf6" stroke="${lit ? RED : INK}" stroke-width="${lit ? 2.2 : 1.2}"/>`);
    group(`id="d${i}"`, () => dial(x + 52, y + 56, 38, past ? L.lim : 0));
    _text(x + 108, y + 30, `LEVEL ${i + 1}`, { size: 13, col: LEAD, cls: 'cap' });
    _text(x + 108, y + 62, L.who, { size: 21 });
    _text(x + 108, y + 90, L.within, { size: 14, col: LEAD });
    if (lit) nowTag(x + CW - 30, y - 6);
  });
}

function building() {
  OX = 840; OY = 960;
  for (let k = 3; k >= 0; k--) {
    const h = 70 + k * 80, y0 = -k * 90;
    box(0, y0, 0, 130, 90, h, { left: ['#e9e3d6', '#e3e6dc', '#dfe4ea', '#efe2dc'][k], top: ['#ddd3c0', '#d4dccc', '#cfd8e2', '#e6d2ca'][k], marks: false });
    if (k) { windowL(14, y0 + 90, h - 58, 34, 36); windowL(76, y0 + 90, h - 58, 34, 36); }
    for (let r = 0; r < Math.floor((h - 20) / 80); r++) { windowR(130, y0 + 78, 22 + r * 80, 28, 36); windowR(130, y0 + 38, 22 + r * 80, 28, 36); }
    if (k === 0) faceText('left', 65, 90, 22, 'STATION', { size: 16, cls: 'cap' });
    const lit = k === LV && AT !== 'found';
    if (k === 0) { box(10, 20, h, 60, 14, 12, { left: PAL.wood, top: '#d8b98e', marks: false }); }
    if (k === 3) for (let s = 0; s < 3; s++) box(14 + s * 34, y0 + 10, h, 26, 16, 18, { left: [PAL.brick, PAL.blue, PAL.mustard][s], marks: false });
    if (k === 2) box(20, y0 + 20, h, 40, 24, 22, { left: PAL.wood, top: '#d8b98e', marks: false });
    who(84, y0 + 56, { ...LEVELS[k].look, arm: lit ? 'wave' : 'down', look: -1 }, h);
  }
  OX = 700; OY = 0;
}

function resolved() {
  const x = 1150, y = 950, w = 190, h = 240, done = AT === 'found';
  out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${done ? '#e3eee2' : '#eef1ea'}" stroke="${done ? GREEN : '#a9b8a3'}" stroke-width="${done ? 2 : 1.2}"/>`);
  _text(x + w / 2, y + 32, 'RESOLVED', { size: 17, anchor: 'middle', cls: 'cap', col: GREEN });
  person(x + w / 2 + 22, y + 170, { shirt: PAL.mustard, pants: PAL.slate, hair: 'long', arm: done ? 'up' : 'down' });
  _text(x + w / 2, y + 204, done ? 'found' : 'not yet', { size: 16, anchor: 'middle' });
  _text(x + w / 2, y + 228, done ? LEVELS[LV].found : 'waiting for an answer', { size: 13, anchor: 'middle', col: LEAD });
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 0;
  building();
  for (let i = 0; i < LEVELS.length; i++) level(i);
  resolved();
  out.push(`<circle cx="230" cy="1222" r="7" fill="${INK}"/>`);
  flowArrow([[230, 1214], [230, 1178]], { w: 1.1, col: INK });
  _text(248, 1228, 'the bag is reported', { size: 14, col: LEAD });
  person(450, 1250, { shirt: PAL.sky, pants: PAL.bark, hair: 'short', arm: AT === 'found' ? 'wave' : 'down', look: -1, size: 0.8 });
  group('id="bag"', () => { const [bx, by] = bagAt(AT === 'found' ? -1 : LV); suitcase(bx, by); });
  let px = 620;
  for (const id of ['platform', 'office', 'manager', 'depot', 'found']) {
    const t = { platform: 'guard', office: 'office', manager: 'manager', depot: 'lost property', found: 'found' }[id], w = textW(t, 15) + 26, cx = px + w / 2;
    group(`data-state="${id}"`, () => { pill(cx, 1262, t); out.push('<g class="on">'); pill(cx, 1262, t, { lit: true }); nowTag(cx, 1240); out.push('</g>'); });
    px += w + 12;
  }
  title('escalation', 'A lost bag at the station');
  subtitle('four levels, a clock on each');
  status(AT === 'found' ? 'found' : LEVELS[LV].who, AT === 'found' ? LEVELS[LV].found : LEVELS[LV].within.replace('answers ', '') + ' to answer');
  footnote('Illustrative: made-up time limits at a made-up station.');
  finish();
}

function init(ctx) {
  const redraw = () => { draw(25); ctx.state(AT); };
  const $ = id => document.getElementById(id);
  // the bag slides from where it was drawn to the spot for level j (-1: the resolved box)
  const carry = (j, then) => {
    const [ax, ay] = bagAt(AT === 'found' ? -1 : LV), [bx, by] = bagAt(j), el = $('bag');
    tween(ctx, 800, k => el.setAttribute('transform', `translate(${n1((bx - ax) * k)} ${n1((by - ay) * k - Math.sin(Math.PI * k) * 40)})`), then);
  };
  const wait = then => {
    const L = LEVELS[LV];
    sweep(ctx, $('d' + LV), 0, L.lim, 1400);
    tween(ctx, 1400, () => {}, () => carry(LV + 1, () => {
      LV++; AT = LEVELS[LV].id; redraw(); ctx.hop($('c' + LV)); then();
    }));
  };
  // an answer takes a while too: the level's clock runs on (two whole days at
  // lost property), someone there calls out, then the bag goes to the box
  const TOOK = [6, 18, 70, 2 * 24 * 60];
  const answer = then => {
    const [x, y] = card(LV), ms = LV === 3 ? 1900 : 1100;
    sweep(ctx, $('d' + LV), 0, TOOK[LV], ms);
    tween(ctx, ms, () => {}, () => {
      const t = LV === 3 ? 'found it, two days on!' : 'found it!', w = textW(t, 16) + 28, bx = x - 30, by = y - 54;
      $('art').insertAdjacentHTML('beforeend', `<g id="said"><path d="M${bx} ${by}h${w}v34h-${w - 46}l-10 12l-2-12h-${34}z" fill="#fffdf6" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/><text class="it" x="${bx + w / 2}" y="${by + 23}" font-size="16" text-anchor="middle" fill="${INK}">${t}</text></g>`);
      const said = $('said');
      if (said.animate && !ctx.still) said.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
      ctx.hop($('c' + LV));
      tween(ctx, 650, () => {}, () => carry(-1, () => { AT = 'found'; redraw(); ctx.hop($('bag')); then(); }));
    });
  };
  const again = then => {
    for (let i = 0; i < LV; i++) sweep(ctx, $('d' + i), LEVELS[i].lim, 0, 900);
    carry(0, () => { LV = 0; AT = 'platform'; redraw(); then(); });
  };
  ctx.button('wait', () => {
    if (AT === 'found') return ctx.no('The bag is found. Nobody needs to wait.');
    if (LV === 3) return ctx.no('Lost property is the top level. Nobody takes it after them.');
    wait(() => ctx.say(`No answer in time. The ${LEVELS[LV].who} has it now: ${LEVELS[LV].within}.`));
  });
  ctx.button('they answer', () => {
    if (AT === 'found') return ctx.no('The bag is already found.');
    answer(() => ctx.say(`The ${LEVELS[LV].who} answers: the bag was ${LEVELS[LV].found}.`));
  });
  ctx.button('a new bag is lost', () => {
    if (AT !== 'found') return ctx.no('Find this bag first.');
    again(() => ctx.say('A new bag is lost. The platform guard has it first.'));
  });
  ctx.hint('Press Play all, or wait.');
  redraw();

  const STORY = ['platform', 'office', 'manager', 'depot', 'found'];
  let si = -1;
  return {
    goto(id, play) {
      const j = STORY.indexOf(id), from = si;
      si = j;
      if (play && j === 0 && from > 0) return again(() => ctx.say(NAMES[id] + '.'));
      if (play && j > 0 && j === from + 1) return (id === 'found' ? answer : wait)(() => ctx.say(NAMES[id] + '.'));
      AT = id; LV = id === 'found' ? 3 : LEVELS.findIndex(L => L.id === id);
      ctx.say(NAMES[id] + '.');
      redraw();
    },
    story: STORY,
  };
}
