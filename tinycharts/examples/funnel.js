// A packet of bean seeds, stage by stage to the picking. Each stage box is
// as wide as the plants still in it; what drops out goes to the compost.
const ABOUT = 'how many make it through each stage';
const SEEDS = 40, LOSS = [0, 6, 6, 2, 2, 0];
const STAGES = ['packet', 'sown', 'sprouted', 'planted', 'flowered', 'podded'];
const NAMES = { packet: 'in the packet', sown: 'sown', sprouted: 'sprouted', planted: 'planted out', flowered: 'flowered', podded: 'in pod', harvest: 'picked', bare: 'nothing left to pick' };
const NOTES = { sown: 'one seed a cell', sprouted: 'six never came up', planted: 'six too weak to move', flowered: 'two blown over', podded: 'two never set pods' };
const CXF = 880, BH = 84;
const rowY = i => 380 + (i - 1) * 134;
let AT = 'packet';
let V = { s: 0, n: SEEDS, lost: 0 }, COUNT = [SEEDS], SLUGS = 0, EATEN = 0;

const boxW = n => 150 + n * 9;

function tray(sprouts) {
  box(-50, -30, 0, 100, 60, 10, { left: '#4d4a48', top: '#5c5754', marks: false });
  for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) {
    const [sx, sy] = P(-44 + i * 12.5, -24 + j * 14, 10);
    out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="2.2" fill="${sprouts ? '#6b5a48' : '#8a6a4f'}"/>`);
    if (sprouts && (i * 4 + j) % 7) { line([[sx, sy], [sx, sy - 9]], { w: 1, col: '#5f8a5a', over: 0 }); shape(oval(sx + 3, sy - 9, 3, 1.8, 8), '#8fae84', { w: 0.5 }); }
  }
}
function bed(kind) {
  box(-60, -36, 0, 120, 72, 20, { left: PAL.wood, top: '#7a5a42', marks: false });
  const spots = [[-36, -14], [0, -14], [36, -14], [-36, 14], [0, 14], [36, 14]];
  for (const [x, y] of spots) {
    const [sx, sy] = P(x, y, 20);
    if (kind === 'small') { shape(blob(sx, sy - 6, 9, 7), '#8fae84'); continue; }
    line([[sx, sy], [sx, sy - 52]], { w: 1.4, col: PAL.tan, over: 0 });
    for (const dy of [-12, -26, -40]) shape(blob(sx + (dy % 2 ? 5 : -5), sy + dy, 7, 5), '#8fae84');
    if (kind === 'flower') for (const dy of [-20, -34]) out.push(`<circle cx="${n1(sx + 4)}" cy="${n1(sy + dy)}" r="2.6" fill="${PAL.brick}" stroke="${INK}" stroke-width=".5"/>`);
    if (kind === 'pod') for (const dy of [-18, -30, -42]) line([[sx + 3, sy + dy], [sx + 5, sy + dy + 11]], { w: 2.2, col: '#5f8a5a', over: 0 });
  }
}
function slug(sx, sy) {
  shape(oval(sx, sy, 11, 4, 12), '#e0b968', { w: 0.8 });
  line([[sx + 6, sy - 2], [sx + 9, sy - 7]], { w: 0.7, over: 0 });
}
function packetIcon(cx, cy) {
  out.push(`<rect x="${cx - 18}" y="${cy - 26}" width="36" height="50" rx="2" fill="${PAL.butter}" stroke="${INK}" stroke-width="1.1"/>`);
  shape(oval(cx, cy - 4, 8, 12, 14), '#8fae84', { w: 0.8 });
  shape(oval(cx + 2, cy + 2, 3, 6, 10), '#e6d8b8', { w: 0.6 });
  _text(cx, cy + 20, 'BEANS', { size: 8, cls: 'cap', anchor: 'middle' });
}

const PICS = [null, () => tray(false), () => tray(true), () => bed('small'), () => bed('flower'), () => bed('pod')];

function draw(seed) {
  begin(seed);
  OX = 700; OY = 0;
  // the trapezoids between the boxes
  for (let i = 1; i < 5; i++) {
    const a = boxW(COUNT[i] ?? SEEDS - LOSS.slice(0, i + 1).reduce((x, y) => x + y, 0)), b = boxW(COUNT[i + 1] ?? SEEDS - LOSS.slice(0, i + 2).reduce((x, y) => x + y, 0));
    const y0 = rowY(i) + BH, y1 = rowY(i + 1);
    const col = ['', '#e3ead8', '#dfe8e6', '#efe6d0', '#efdcd6'][i];
    fill([[CXF - a / 2, y0], [CXF + a / 2, y0], [CXF + b / 2, y1], [CXF - b / 2, y1]], col, { amp: 0.3 });
  }
  // the stage boxes, the pictures, and the leaks to the compost
  for (let i = 1; i <= 5; i++) {
    const id = STAGES[i], reached = V.s >= i, n = COUNT[i];
    const w = boxW(reached ? n : SEEDS - LOSS.slice(0, i + 1).reduce((x, y) => x + y, 0)), y = rowY(i);
    group(`data-state="${id}"`, () => {
      out.push(`<rect x="${n1(CXF - w / 2)}" y="${y}" width="${n1(w)}" height="${BH}" fill="${reached ? '#fffdf6' : PAPER}" stroke="${INK}" stroke-width="1.1" stroke-dasharray="5 4"/>`);
      _text(CXF, y + 32, NAMES[id], { size: 18, anchor: 'middle' });
      _text(CXF, y + 58, reached ? `${n} plants` : '·', { size: reached ? 17 : 22, anchor: 'middle', col: reached ? INK : LEAD });
      if (reached && NOTES[id]) _text(CXF, y + 76, NOTES[id] + (i === 3 && EATEN ? ` · ${EATEN} to slugs` : ''), { size: 12, anchor: 'middle', col: LEAD });
      out.push('<g class="on">');
      litRing([[CXF - w / 2 - 5, y - 5], [CXF + w / 2 + 5, y - 5], [CXF + w / 2 + 5, y + BH + 5], [CXF - w / 2 - 5, y + BH + 5]]);
      nowTag(CXF + w / 2 - 14, y - 9);
      out.push('</g>');
    });
    // a little picture of the stage, on the left
    OX = 240 + (i % 2) * 70; OY = y + 50;
    PICS[i]();
    if (SLUGS && i >= 3 && i <= V.s) for (let k = 0; k < Math.min(SLUGS, 3); k++) { const [sx, sy] = P(-40 + k * 34, 30, 20); slug(sx, sy + 6); }
    OX = 700; OY = 0;
    out.push(`<path d="M${400 + (i % 2) * 70} ${y + 42}H${n1(CXF - w / 2 - 8)}" stroke="${MUTE}" stroke-width=".9" stroke-dasharray="2 5" fill="none"/>`);
  }
  // brackets
  for (const [name, a, b] of [['UNDER GLASS', 1, 2], ['IN THE BED', 3, 5]]) {
    const y0 = rowY(a), y1 = rowY(b) + BH;
    out.push(`<path d="M492 ${y0}h-8V${y1}h8" fill="none" stroke="${INK}" stroke-width="1"/>`);
    _text(470, (y0 + y1) / 2, name, { size: 13, cls: 'cap', col: LEAD, anchor: 'middle', extra: `transform="rotate(-90 470 ${(y0 + y1) / 2})"` });
  }
  // the packet at the top
  group('data-state="packet"', () => {
    out.push(`<circle cx="${CXF - 90}" cy="296" r="5" fill="${INK}"/>`);
    flowArrow([[CXF - 84, 298], [CXF - 28, 308]], { w: 1.3, col: INK });
    packetIcon(CXF, 310);
    _text(CXF + 34, 316, `${SEEDS} seeds in the packet`, { size: 15, col: LEAD });
    out.push('<g class="on">');
    litRing([[CXF - 26, 278], [CXF + 26, 278], [CXF + 26, 342], [CXF - 26, 342]]);
    nowTag(CXF + 10, 274);
    out.push('</g>');
  });
  // the picking, or the bare bed
  flowArrow([[CXF, rowY(5) + BH + 6], [CXF, 1100]], { w: 1.4, col: INK });
  group('data-state="harvest"', () => {
    OX = CXF; OY = 1150;
    turn(0, 0, 0, [[34, 0], [44, 34]], PAL.wood, { cap: '#5c4a38' });
    const full = AT === 'harvest';
    if (full) for (let k = 0; k < 9; k++) { const [sx, sy] = P(-20 + (k % 3) * 18, -20 + Math.floor(k / 3) * 18, 34); line([[sx - 6, sy - 4], [sx + 6, sy + 3]], { w: 3, col: '#5f8a5a', over: 0 }); }
    OX = 700; OY = 0;
    _text(CXF + 70, 1150, 'the picking', { size: 18 });
    _text(CXF + 70, 1172, full ? `${V.n} plants, about ${V.n * 40} beans` : 'nothing yet', { size: 14, col: LEAD });
    out.push('<g class="on">');
    litRing([[CXF - 60, 1100], [CXF + 60, 1100], [CXF + 60, 1196], [CXF - 60, 1196]]);
    nowTag(CXF + 40, 1096);
    out.push('</g>');
  });
  { const [px, py] = [CXF - 110, 1196]; person(px, py, { shirt: PAL.sage, pants: PAL.navy, hair: 'bob', arm: AT === 'harvest' ? 'up' : 'down', look: 1, kid: true }); }
  group('data-state="bare"', () => {
    const x = CXF - 470, y = 1110;
    out.push(`<rect x="${x}" y="${y}" width="230" height="80" rx="6" fill="#fffdf6" stroke="${INK}" stroke-width="1" stroke-dasharray="5 4"/>`);
    _text(x + 115, y + 34, 'nothing left to pick', { size: 17, anchor: 'middle' });
    _text(x + 115, y + 58, 'the slugs had it all', { size: 13, anchor: 'middle', col: LEAD });
    out.push('<g class="on">');
    litRing([[x - 5, y - 5], [x + 235, y - 5], [x + 235, y + 85], [x - 5, y + 85]]);
    nowTag(x + 200, y - 9);
    out.push('</g>');
  });
  // the compost bin
  OX = 1220; OY = 1000;
  box(-40, -40, 0, 80, 80, 44, { left: PAL.bark, top: '#6b5240', marks: false });
  const [hx, hy] = P(0, 0, 44); shape(blob(hx, hy, 34, 12), '#8a6a4f');
  for (let k = 0; k < Math.min(V.lost, 30); k++) { const [sx, sy] = P(-28 + (k * 13) % 56, -20 + (k * 7) % 40, 46); out.push(`<circle cx="${n1(sx)}" cy="${n1(sy)}" r="1.8" fill="#c8b48a"/>`); }
  OX = 700; OY = 0;
  _text(1220, 1090, String(V.lost), { size: 26, anchor: 'middle' });
  _text(1220, 1112, 'on the compost', { size: 14, col: LEAD, anchor: 'middle' });
  // what each stage lost runs off the funnel's side and down to the compost
  let top = 0;
  for (let i = 1; i < 5; i++) {
    // the slugs' share leaves from the planted box itself, not with the six too weak
    const lost = V.s > i ? COUNT[i] - COUNT[i + 1] - (i === 2 ? EATEN : 0) : 0;
    if (lost <= 0) continue;
    const ym = (rowY(i) + BH + rowY(i + 1)) / 2, sx = CXF + (boxW(COUNT[i]) + boxW(COUNT[i + 1])) / 4 + 6;
    flowArrow([[sx, ym], [1156, ym]], { dashed: true, w: 1.4 });
    _text(1172, ym + 5, `−${lost}`, { size: 15, col: RED });
    top = top || ym;
  }
  if (EATEN && V.s >= 3) {
    const ym = rowY(3) + BH / 2;
    flowArrow([[CXF + boxW(COUNT[3]) / 2 + 6, ym], [1156, ym]], { dashed: true, w: 1.4 });
    _text(1172, ym + 5, `−${EATEN} slugs`, { size: 15, col: RED });
    top = Math.min(top || ym, ym);
  }
  if (top) out.push(`<path d="M1160 ${n1(top)}V934" stroke="${RED}" stroke-width="1.4" stroke-dasharray="6 5" fill="none"/>`);

  group('id="seed"', () => { const [x, y] = seedAt(AT); out.push(`<ellipse cx="${x}" cy="${y}" rx="6" ry="9" fill="#e6d8b8" stroke="${INK}" stroke-width="1" transform="rotate(30 ${x} ${y})"/>`); });

  title('a funnel', 'Beans from a packet');
  subtitle(`one packet of ${SEEDS} runner bean seeds, sown in April`);
  status(NAMES[AT], `${V.n} plants · ${V.lost} on the compost`);
  footnote('Illustrative: made-up counts for one packet. Slugs eat eight plants a night.');
  finish();
}

function seedAt(id) {
  if (id === 'packet') return [CXF - 40, 330];
  if (id === 'harvest') return [CXF + 40, 1120];
  if (id === 'bare') return [CXF - 240, 1110];
  const i = STAGES.indexOf(id); return [CXF - 70, rowY(i) + 54];
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(20); ctx.state(AT); };
  const go = (to, change) => {
    const A = seedAt(AT), B = seedAt(to);
    hops(ctx, $('seed'), [at(...A), at(...B)], { arc: 24, rest: 0, then: () => { change(); AT = to; redraw(); } });
  };
  ctx.button('next stage', () => {
    if (AT === 'harvest' || AT === 'bare') return ctx.no('The year is over. Sow again.');
    if (V.s === 5) {
      if (V.n > 0) { ctx.say(`Picking time: ${V.n} plants.`); return go('harvest', () => {}); }
      ctx.say('Nothing left to pick.'); return go('bare', () => {});
    }
    const d = Math.min(V.n, LOSS[V.s]), to = STAGES[V.s + 1];
    ctx.say(d ? `${NAMES[to][0].toUpperCase() + NAMES[to].slice(1)}: ${d} drop out.` : `${NAMES[to][0].toUpperCase() + NAMES[to].slice(1)}.`);
    go(to, () => { V = { s: V.s + 1, n: V.n - d, lost: V.lost + d }; COUNT[V.s] = V.n; });
  });
  ctx.button('slugs in the night', () => {
    if (V.s < 3 || AT === 'harvest' || AT === 'bare') return ctx.no('The slugs reach only the plants in the bed.');
    if (!V.n) return ctx.no('Nothing left for the slugs.');
    const d = Math.min(V.n, 8);
    V = { ...V, n: V.n - d, lost: V.lost + d }; COUNT[V.s] = V.n; SLUGS++; EATEN += d;
    crossfade(ctx, redraw); ctx.say(`Slugs in the night: ${d} plants eaten.`);
  });
  ctx.button('sow again', () => {
    if (AT !== 'harvest' && AT !== 'bare') return ctx.no('Wait for the end of the year.');
    V = { s: 0, n: SEEDS, lost: 0 }; COUNT = [SEEDS]; SLUGS = 0; EATEN = 0; AT = 'packet'; redraw(); ctx.say('A new packet. Forty seeds.');
  });
  ctx.hint('Press Play all, or next stage. Let the slugs in to see the funnel narrow.');
  redraw();

  // [state, stage, slug nights]: a good year, then a year the slugs take it all
  const STORY = [['packet', 0, 0], ['sown', 1, 0], ['sprouted', 2, 0], ['planted', 3, 0], ['planted', 3, 1], ['flowered', 4, 1], ['podded', 5, 1], ['harvest', 5, 1],
    ['packet', 0, 0], ['sown', 1, 0], ['sprouted', 2, 0], ['planted', 3, 0], ['planted', 3, 1], ['planted', 3, 2], ['planted', 3, 3], ['planted', 3, 4],
    ['flowered', 4, 4], ['podded', 5, 4], ['bare', 5, 4], ['packet', 0, 0]];
  const replay = (s, slugs) => {
    let v = { s: 0, n: SEEDS, lost: 0 }, eaten = 0; const c = [SEEDS];
    for (let k = 0; k < s; k++) { const d = Math.min(v.n, LOSS[k]); v = { s: k + 1, n: v.n - d, lost: v.lost + d }; c[k + 1] = v.n; if (k + 1 === 3 && slugs) for (let j = 0; j < slugs; j++) { const e = Math.min(v.n, 8); v = { ...v, n: v.n - e, lost: v.lost + e }; c[3] = v.n; eaten += e; } }
    return { v, c, eaten };
  };
  let si = -1;
  return {
    goto(id, play) {
      let j = play ? STORY.findIndex((s, k) => k > si && s[0] === id) : -1;
      if (j < 0) j = STORY.findIndex(s => s[0] === id);
      si = j;
      const { v, c, eaten } = replay(STORY[j][1], STORY[j][2]);
      const set = () => { V = v; COUNT = c; SLUGS = STORY[j][2]; EATEN = eaten; };
      ctx.say(NAMES[id] + (V.n !== v.n ? `: ${v.n} plants.` : '.'));
      if (play && id !== AT && id !== 'packet') go(id, set);
      else if (play) { set(); AT = id; crossfade(ctx, redraw); }
      else { set(); AT = id; redraw(); }
    },
    story: STORY.map(s => s[0]),
  };
}
