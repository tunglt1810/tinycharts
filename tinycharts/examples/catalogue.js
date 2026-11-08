// A shelf of jam jars: nine jars, one set of states, each kind keeps for its own weeks.
const ABOUT = 'one set of states, many at once';
// name, jam colour, weeks it keeps once open (99: never goes off), spoonfuls in a jar
const JARS = [
  ['strawberry', '#c8414b', 4, 8], ['raspberry', '#a8324a', 3, 8], ['apricot, no sugar', '#e39a3b', 1, 6],
  ['marmalade', '#e7862c', 8, 10], ['blackcurrant', '#5a2a46', 4, 8], ['plum', '#7d3b5c', 4, 8],
  ['lemon curd', '#efd05a', 2, 6], ['fig', '#8a5a3a', 6, 8], ['honey', '#e5b443', 99, 12],
];
const NAMES = { sealed: 'on the shelf, sealed', open: 'open, in use', finished: 'eaten up', mouldy: 'gone off' };
const LID = ['#d9b45a', '#c9cdd3', '#b9cba8'], MOULD = '#9fb08a';
const SHELF = [500, 790, 1080], COLX = [300, 700, 1100];
let JAR, WEEK, PICK;
const fresh = () => { JAR = JARS.map(([, , , n]) => ({ s: 'sealed', w: 0, left: n })); WEEK = 0; PICK = 0; };
fresh();

// one jar's statechart, the same for all nine; returns false if the event does not fire here
function fire(k, ev) {
  const j = JAR[k], [, , keep, n] = JARS[k];
  if (ev === 'open it' && j.s === 'sealed') { j.s = 'open'; j.w = 0; j.left = n; return true; }
  if (ev === 'a spoonful' && j.s === 'open') { j.left--; if (j.left === 0) j.s = 'finished'; return true; }
  if (ev === 'a week later' && j.s === 'open') { j.w++; if (j.w > keep) j.s = 'mouldy'; return true; }
  if (ev === 'a new jar' && (j.s === 'finished' || j.s === 'mouldy')) { j.s = 'sealed'; j.w = 0; j.left = n; return true; }
  return false;
}
const tap = k => ({ sealed: 'open it', open: 'a spoonful', finished: 'a new jar', mouldy: 'a new jar' })[JAR[k].s];
const spot = k => [COLX[k % 3], SHELF[Math.floor(k / 3)]];

function jar(k) {
  const [name, col, keep, n] = JARS[k], j = JAR[k], [cx, sy] = spot(k);
  OX = cx; OY = sy - 8;
  castDisc(0, 0, 42, 110);
  const H = 100, jam = j.s === 'sealed' ? H - 10 : j.s === 'finished' ? 0 : Math.max(6, (H - 10) * j.left / n);
  if (jam > 0) turn(0, 0, 0, [[40, 0], [42, 6], [42, jam]], j.s === 'mouldy' ? shadeOf(col) : col, { cap: litOf(col), seam: false });
  turn(0, 0, jam, [[42, 0], [42, H - jam], [34, H - jam + 10], [34, H - jam + 18]], '#eef3f2', { cap: j.s === 'sealed' ? null : '#f6f8f7', seam: false, ink: 0.8 });
  if (j.s === 'sealed') group(`id="lid${k}"`, () => { OX = cx; OY = sy - 8; cyl(0, 0, H + 18, 37, 12, LID[k % 3], { cap: litOf(LID[k % 3]) }); });
  else if (j.s !== 'finished') { OX = cx + 84; OY = sy - 4; cyl(0, 0, 0, 28, 9, LID[k % 3], { cap: litOf(LID[k % 3]) }); }
  OX = cx; OY = sy - 8;
  if (j.s === 'mouldy') for (const [dx, dy, r] of [[-16, -2, 12], [8, 6, 14], [16, -8, 9]]) { const [px, py] = P(dx, dy, jam); shape(blob(px, py, r, r * 0.55, 0.3, 6), MOULD, { w: 0.8 }); }
  if (j.s === 'open') { const [px, py] = P(0, 0, H + 18); line([[px + 8, py - 50], [px - 4, py + 30]], { w: 3, col: '#a9aeb0', over: 0 }); }
  // the paper label on the jar
  const [lx, ly] = P(0, 0, 40);
  out.push(`<rect x="${n1(lx - 36)}" y="${n1(ly - 14)}" width="72" height="28" rx="3" fill="#fbf7ec" stroke="${INK}" stroke-width=".9"/>`);
  _text(lx, ly + 4, String(k + 1), { size: 14, anchor: 'middle', cls: 'cap' });
  OX = 700; OY = 0;
  // the tag under the shelf: name, what it is now, weeks open against weeks it keeps
  const ty = sy + 30, lit = k === PICK, note = j.s === 'sealed' ? 'sealed' : j.s === 'open' ? `open, ${j.left} of ${n} spoons left` : j.s === 'finished' ? 'eaten up' : 'gone off: throw out';
  out.push(`<rect x="${cx - 128}" y="${ty}" width="256" height="62" rx="6" fill="#fffdf6" stroke="${lit ? RED : '#c4bbae'}" stroke-width="${lit ? 2 : 1}"/>`);
  _text(cx - 114, ty + 24, name, { size: 17 });
  _text(cx - 114, ty + 48, note, { size: 13, col: j.s === 'mouldy' ? RED : LEAD });
  const weeks = keep === 99 ? 0 : keep;
  for (let d = 0; d < weeks; d++) out.push(`<circle cx="${cx + 114 - d * 12}" cy="${ty + 18}" r="4" fill="${d < weeks - Math.min(j.w, weeks) ? '#fffdf6' : (j.w > keep ? RED : PAL.mustard)}" stroke="${INK}" stroke-width=".8"/>`);
  if (keep === 99) _text(cx + 114, ty + 23, 'keeps for ever', { size: 12, col: LEAD, anchor: 'end' });
  if (lit) nowTag(cx + 100, ty - 2);
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 0;
  // the dresser: a back board and three wooden shelves
  out.push(`<rect x="120" y="300" width="1160" height="880" rx="6" fill="#efe6d4" stroke="${INK}" stroke-width="1.6"/>`);
  for (const y of SHELF) {
    out.push(`<path d="M120 ${y - 16}L1280 ${y - 16}L1280 ${y}L120 ${y}Z" fill="#d8b98e" stroke="${INK}" stroke-width="1.2"/>`);
    out.push(`<rect x="120" y="${y}" width="1160" height="16" fill="${PAL.wood}" stroke="${INK}" stroke-width="1.2"/>`);
  }
  // the wall calendar on the dresser, one page a week
  group('id="cal"', () => {
    out.push(`<rect x="1184" y="192" width="96" height="96" rx="4" fill="#fffdf6" stroke="${INK}" stroke-width="1.2"/><rect x="1184" y="192" width="96" height="24" rx="4" fill="${RED}"/>`);
    _text(1232, 210, 'WEEK', { size: 13, anchor: 'middle', cls: 'cap', col: PAPER });
    _text(1232, 266, String(WEEK), { size: 40, anchor: 'middle' });
  });
  for (let k = 0; k < JARS.length; k++) group(`id="j${k}" class="hit" data-k="${k}"`, () => jar(k));
  legend([{ col: PAL.mustard, text: 'a week open' }, { col: RED, text: 'past its weeks' }, { col: MOULD, text: 'mould' }], 120, 1216);
  let px = 700;
  for (const id of ['sealed', 'open', 'finished', 'mouldy']) {
    const t = NAMES[id], w = textW(t, 15) + 26, cx = px + w / 2;
    group(`data-state="${id}"`, () => { pill(cx, 1262, t); out.push('<g class="on">'); pill(cx, 1262, t, { lit: true }); nowTag(cx, 1240); out.push('</g>'); });
    px += w + 10;
  }
  _text(120, 1268, 'the state of the jar with the red tag', { size: 14, col: LEAD });
  const good = JAR.filter(j => j.s === 'sealed' || j.s === 'open').length;
  // the one who keeps the shelf, and the cat asleep on the bottom board
  person(1110, 298, { shirt: PAL.sage, pants: PAL.slate, hair: 'bun', arm: 'hold', look: 1, size: 0.9 });
  { const ox = OX, oy = OY; OX = 520; OY = 1070; cat(0, 0, 0, PAL.tan); OX = ox; OY = oy; }
  title('a catalogue', 'A shelf of jam jars');
  subtitle('nine jars, one set of states');
  status(`${good} of 9 good to eat`, `week ${WEEK}: ${JAR.filter(j => j.s === 'open').length} open, ${JAR.filter(j => j.s === 'mouldy').length} gone off`);
  footnote('Illustrative: made-up keeping times. Tap a jar to open it, take a spoonful, or put a new one up.');
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(26); ctx.state(JAR[PICK].s); };
  // the motion for one event on jar k, then the redraw
  const play = (k, ev, then = () => {}) => {
    const el = $('j' + k), done = () => { redraw(); then(); };
    PICK = k;
    if (ev === 'open it') {
      const lid = $('lid' + k);
      fire(k, ev);
      return tween(ctx, 800, t => lid.setAttribute('transform', `translate(${n1(84 * Math.max(0, t * 2 - 1))} ${n1(-50 * Math.sin(Math.PI * t) + 136 * Math.max(0, t * 2 - 1))})`), done);
    }
    if (ev === 'a spoonful') {
      const [cx, sy] = spot(k), ns = 'http://www.w3.org/2000/svg', sp = document.createElementNS(ns, 'g');
      sp.innerHTML = `<path d="M0 0L-8 -70" stroke="#8d9397" stroke-width="3.2" stroke-linecap="round"/><ellipse cx="2" cy="4" rx="7" ry="10" fill="#a9aeb0" stroke="${INK}" stroke-width="1"/>`;
      $('art').append(sp);
      fire(k, ev);
      return tween(ctx, 900, t => sp.setAttribute('transform', `translate(${cx + 10} ${n1(sy - 70 - 46 * Math.sin(Math.PI * t) + 10)})`), () => { sp.remove(); done(); });
    }
    if (ev === 'a new jar') {
      fire(k, ev);
      return tween(ctx, 900, t => el.setAttribute('transform', `translate(${n1(t < 0.5 ? 120 * t * 2 : 0)} 0)`), () => { redraw(); arriveJar(k, then); });
    }
  };
  const arriveJar = (k, then) => {
    const el = $('j' + k);
    el.setAttribute('opacity', '0');
    tween(ctx, 600, t => { el.setAttribute('opacity', t.toFixed(2)); el.setAttribute('transform', `translate(${n1(-60 * (1 - t))} 0)`); }, () => { el.removeAttribute('opacity'); el.removeAttribute('transform'); then(); });
  };
  const week = (then = () => {}) => {
    const before = JAR.map(j => j.s), cal = $('cal');
    JAR.forEach((_, k) => fire(k, 'a week later'));
    WEEK++;
    const off = JAR.findIndex((j, k) => j.s === 'mouldy' && before[k] !== 'mouldy');
    if (off >= 0) PICK = off;
    tween(ctx, 700, t => cal.setAttribute('transform', `translate(1232 192) scale(1 ${Math.abs(Math.cos(Math.PI * t)).toFixed(3)}) translate(-1232 -192)`), () => {
      redraw();
      if (off >= 0) ctx.hop($('j' + off));
      then(off);
    });
  };
  const say = k => {
    const j = JAR[k], [name, , keep, n] = JARS[k];
    ctx.say(j.s === 'open' ? `${name}: open, ${j.left} of ${n} spoons left, ${j.w} of ${keep === 99 ? 'any number of' : keep} weeks.` : `${name}: ${NAMES[j.s]}.`);
  };
  ctx.button('a week later', () => {
    if (!JAR.some(j => j.s === 'open')) return ctx.no('No jar is open. A sealed jar does not count the weeks.');
    week(off => ctx.say(off >= 0 ? `Week ${WEEK}: the ${JARS[off][0]} has gone off.` : `Week ${WEEK}: every open jar still good.`));
  });
  ctx.button('start the shelf again', () => { fresh(); ctx.say('Nine new jars, all sealed.'); redraw(); });
  ctx.hint('Tap a jar, or press Play all.');
  redraw();

  // each step of the story: the events from a full shelf; the last one plays
  const OPEN = [['open it', 0], ['a spoonful', 0], ['a spoonful', 0], ['week'], ['open it', 2], ['open it', 6], ['a spoonful', 6], ['open it', 3]];
  const MOULDY = [...OPEN, ['week'], ['week']];
  const FIN = [...MOULDY, ...Array(5).fill(['a spoonful', 6])];
  const STORY = [['sealed', []], ['open', OPEN], ['mouldy', MOULDY], ['finished', FIN], ['sealed', [...FIN, ['a new jar', 6]]]];
  let si = -1;
  return {
    goto(id, go) {
      let j = go ? STORY.findIndex((s, k) => k > si && s[0] === id) : -1;
      if (j < 0) j = STORY.findIndex(s => s[0] === id);
      const from = si;
      si = j;
      const evs = STORY[j][1];
      // played on from the step before: only the new events, one by one, each
      // with its own motion and words, and a breath between
      if (go && from >= 0 && j > from && STORY[from][1].every((e, i) => evs[i] === e)) {
        const add = evs.slice(STORY[from][1].length);
        const next = i => {
          if (i >= add.length) return;
          const [ev, k] = add[i], on = () => tween(ctx, 350, () => {}, () => next(i + 1));
          if (ev === 'week') week(() => { say(PICK); on(); });
          else play(k, ev, () => { say(k); on(); });
        };
        return next(0);
      }
      fresh();
      const apply = ([ev, k]) => { if (ev === 'week') { JAR.forEach((_, i) => fire(i, 'a week later')); WEEK++; const m = JAR.findIndex(x => x.s === 'mouldy'); if (m >= 0) PICK = m; } else { fire(k, ev); PICK = k; } };
      if (!go || !evs.length) { evs.forEach(apply); ctx.say(evs.length ? `${JARS[PICK][0]}: ${NAMES[JAR[PICK].s]}.` : 'Nine jars, all sealed.'); return redraw(); }
      evs.slice(0, -1).forEach(apply);
      redraw();
      const [ev, k] = evs[evs.length - 1];
      if (ev === 'week') return week(() => say(PICK));
      play(k, ev, () => say(k));
    },
    click(e) {
      const g = e.target.closest && e.target.closest('.hit');
      if (!g) return;
      const k = +g.dataset.k;
      play(k, tap(k), () => say(k));
    },
    story: STORY.map(s => s[0]),
  };
}
