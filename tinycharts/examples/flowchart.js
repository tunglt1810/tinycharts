// Fixing a flat bicycle tyre, as a flowchart: the steps run down the middle,
// and a small picture of each step sits beside it.
const ABOUT = 'every step, and where it splits';
const NAMES = {
  flat: 'flat tyre', wheel_off: 'wheel off', tube_out: 'tube out', dunked: 'tube in water',
  patched: 'patch on', new_tube: 'new tube', refitted: 'tube back in', pumped: 'pumped up', riding: 'back on the road',
};
const X = 700;
const TAGS = {
  flat: [X, 270], wheel_off: [X, 380], tube_out: [X, 490], dunked: [X, 600],
  patched: [585, 730], new_tube: [815, 730], refitted: [X, 860], pumped: [X, 970], riding: [X, 1180],
};
const HOLDS = [X, 1085];
// each picture: its centre on the sheet, and where its link meets the tag
const SPOTS = {
  flat: [250, 330], wheel_off: [1140, 420], tube_out: [250, 560], dunked: [1140, 650],
  patched: [250, 800], new_tube: [1140, 860], pumped: [250, 1040], riding: [1120, 1170],
};
let AT = 'flat';
let V = { patches: 1, thorn: true, fixed: false, air: false, trail: [], took: null };

const tagW = id => Math.max(120, textW(NAMES[id], 17, 'cap') + 44);
const tok = id => { const [x, y] = TAGS[id]; return [x + tagW(id) / 2 + 20, y + 20]; };

function bike(sx, sy, { flat = false, wheels = 2, col = PAL.navy } = {}) {
  const r = 18, a = [sx - 27, sy - r], b = [sx + 27, sy - r];
  for (const [i, c] of [a, b].entries()) {
    if (i >= wheels) continue;
    const squash = flat && i === 0 ? 0.8 : 1, o = oval(c[0], c[1] + r * (1 - squash), r * 1.06, r * squash, 22);
    line([...o, o[0], o[1]], { w: 2.3, over: 0, amp: 0.4 });
    rule([0, 1, 2].map(k => { const t = k * Math.PI / 3; return [[c[0] - Math.cos(t) * r * 0.8, c[1] - Math.sin(t) * r * 0.8], [c[0] + Math.cos(t) * r * 0.8, c[1] + Math.sin(t) * r * 0.8]]; }), INK, 0.6);
  }
  const seat = [sx - 6, sy - 46], bar = [sx + 18, sy - 50], crank = [sx - 2, sy - r];
  line([a, seat, crank, a], { w: 2.6, col, over: 0 });
  line([seat, [sx + 15, sy - 42], crank], { w: 2.6, col, over: 0 });
  line([[sx + 15, sy - 42], b], { w: 2.6, col, over: 0 });
  line([[sx + 15, sy - 42], bar, [sx + 24, sy - 52]], { w: 2, over: 0 });
  line([[seat[0] - 7, seat[1] - 3], [seat[0] + 6, seat[1] - 3]], { w: 3.2, over: 0 });
}

function wheel(cx, cy, r = 22, tube = false) {
  const o = oval(cx, cy, r, r, 24);
  line([...o, o[0], o[1]], { w: 3, over: 0, amp: 0.4 });
  rule([0, 1, 2, 3].map(k => { const t = k * Math.PI / 4; return [[cx - Math.cos(t) * r * 0.85, cy - Math.sin(t) * r * 0.85], [cx + Math.cos(t) * r * 0.85, cy + Math.sin(t) * r * 0.85]]; }), INK, 0.6);
  if (tube) line(spline([[cx + r - 2, cy - 6], [cx + r + 26, cy - 14], [cx + r + 34, cy + 6], [cx + r + 12, cy + 16], [cx + r - 2, cy + 8]], false, 2), { w: 3.4, col: '#3b3330', over: 0 });
}

// a picture on its own small board, drawn a third larger than the kit size
function pad(id, w = 190, d = 110, col = '#e4e6d2') {
  const [sx, sy] = SPOTS[id], [x, y] = at(sx, sy);
  out.push(`<g transform="translate(${n1(sx)} ${n1(sy)}) scale(1.3) translate(${n1(-sx)} ${n1(-sy)})">`);
  board(x - w / 2, y - d / 2, w, d, 8, col, PAL.tan);
}
const unpad = () => out.push('</g>');

const words = (x, y, s, anchor = 'start') => out.push(`<text class="it route" x="${n1(x)}" y="${n1(y)}" font-size="17" fill="${INK}"${anchor === 'start' ? '' : ` text-anchor="${anchor}"`}>${_attr(s)}</text>`);
const link = (a, b) => out.push(`<path class="link" d="${pathOf([a, b])}" fill="none" stroke="#a89c8a" stroke-width="1.7" stroke-dasharray="0.1 5.6" stroke-linecap="round"/>`);

function pictures() {
  // flat tyre: the bike by the kerb, its owner puzzled
  pad('flat');
  { const [sx, sy] = SPOTS.flat; bike(sx - 20, sy + 6, { flat: true });
    person(sx + 70, sy + 20, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'up', look: -1, say: 'thump, thump, thump' });  }
  unpad();
  // wheel off: the bike upside down on its saddle, the wheel beside it
  pad('wheel_off');
  { const [sx, sy] = SPOTS.wheel_off;
    out.push(`<g transform="translate(${n1(sx - 30)} ${n1(sy - 46)}) scale(1 -1)">`); bike(0, -10, { wheels: 1 }); out.push('</g>');
    wheel(sx + 40, sy + 2, 20);
    person(sx + 92, sy + 30, { shirt: PAL.sage, pants: PAL.bark, hair: 'cap', arm: 'hold', look: -1, say: 'open the quick release' }); }
  unpad();
  // tube out: levers, the tube pulled free, a hand feeling for the thorn
  pad('tube_out');
  { const [sx, sy] = SPOTS.tube_out; wheel(sx - 40, sy, 24, true);
    for (const k of [0, 1]) shape([[sx + 30 + k * 14, sy + 22], [sx + 36 + k * 14, sy + 22], [sx + 40 + k * 14, sy + 44], [sx + 34 + k * 14, sy + 44]], PAL.blue, { w: 1 });
    if (V.thorn) group('id="thorn"', () => shape([[sx - 64, sy - 18], [sx - 52, sy - 22], [sx - 60, sy - 34]], PAL.leaf, { w: 0.9 }));
    person(sx + 90, sy + 34, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'out', look: -1, say: 'anything sharp in here?' }); }
  unpad();
  // tube in water: a bucket, bubbles from the hole, a child who saw them first
  pad('dunked');
  { const [sx, sy] = SPOTS.dunked, [x, y] = at(sx - 20, sy);
    turn(x, y, 0, [[22, 0], [26, 34]], PAL.grey, { wall: 2, sink: 6, cap: '#9ec3d6' });
    group('class="bubbles"', () => { for (const [dx, dy, r] of [[-8, -46, 4], [2, -56, 3], [-2, -66, 2.4], [8, -48, 2]]) out.push(`<circle cx="${n1(sx - 20 + dx)}" cy="${n1(sy + dy)}" r="${r}" fill="#fff" stroke="${INK}" stroke-width=".8"/>`); });
    person(sx + 60, sy + 34, { shirt: PAL.rose, pants: PAL.navy, hair: 'bun', kid: true, arm: 'wave', look: -1, say: 'bubbles!' });
    cat(...at(sx - 90, sy + 30), 0); }
  unpad();
  // patch on: the tin, the glue, the patch
  pad('patched');
  { const [sx, sy] = SPOTS.patched, [x, y] = at(sx - 40, sy - 10);
    box(x, y, 0, 40, 26, 12, { left: PAL.red, top: PAL.rose, marks: false });
    if (V.patches > 0) shape([[sx + 10, sy + 6], [sx + 32, sy + 6], [sx + 32, sy + 20], [sx + 10, sy + 20]], PAL.brick, { w: 1 });
    shape(capsule([sx - 40, sy + 30], [sx - 10, sy + 36], 4), PAL.butter, { w: 1 });
    person(sx + 80, sy + 34, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'hold', look: -1, say: 'rough it, glue, wait' });  }
  unpad();
  // new tube: the shop counter round the corner
  pad('new_tube', 190, 110, '#ece2cf');
  { const [sx, sy] = SPOTS.new_tube, [x, y] = at(sx - 30, sy - 20);
    box(x - 40, y - 20, 0, 90, 40, 46, { left: PAL.wood, top: PAL.sand, marks: false });
    for (const k of [0, 1, 2]) box(x - 30 + k * 26, y - 14, 46, 18, 14, 12, { left: [PAL.sky, PAL.butter, PAL.mint][k], marks: false });
    faceText('right', x + 50, y, 24, 'TUBES', { size: 9 });
    person(sx + 92, sy + 26, { shirt: PAL.sky, pants: PAL.slate, hair: 'short', arm: 'out', look: -1, say: 'that one fits 700c' }); }
  unpad();
  // pumped up: a floor pump, a wheel, a gauge
  pad('pumped');
  { const [sx, sy] = SPOTS.pumped, [x, y] = at(sx - 40, sy);
    cyl(x, y, 0, 7, 56, PAL.red, { cap: PAL.grey });
    line([[sx - 52, sy - 64], [sx - 28, sy - 64]], { w: 3, over: 0 });
    pipe([P(x + 6, y, 6), [sx - 4, sy + 10], [sx + 18, sy - 4]], 2.4, '#3b3330');
    wheel(sx + 30, sy - 4, 22);
    person(sx + 96, sy + 32, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'hold', look: -1, say: 'sixty psi' }); }
  unpad();
  // back on the road: the rider, a dog that runs along
  pad('riding', 220, 120, '#dfe3cf');
  { const [sx, sy] = SPOTS.riding; bike(sx - 10, sy + 10);
    person(sx - 14, sy - 14, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'out', sit: 1, say: 'home before the rain' });
    dog(...at(sx + 80, sy + 24), 0);  }
  unpad();
  tree(...at(80, 1240), 46);
  puff(...at(150, 1270), 0);
  person(1270, 1290, { shirt: PAL.lilac, pants: PAL.slate, hair: 'long', look: -1, say: 'a thorn, every spring' });
}

function chain() {
  const top = id => [TAGS[id][0], TAGS[id][1] - 4], bot = id => [TAGS[id][0], TAGS[id][1] + 42];
  flowArrow([bot('flat'), top('wheel_off')]); words(X + 14, 350, 'take the wheel off');
  flowArrow([bot('wheel_off'), top('tube_out')]); words(X + 14, 460, 'lever the tube out');
  const r = X + tagW('tube_out') / 2;
  flowArrow([[r, 500], [r + 30, 500], [r + 30, 524], [r + 4, 524]]); words(r + 40, 518, 'feel the tyre');
  flowArrow([bot('tube_out'), top('dunked')]); words(X + 14, 570, 'dunk it, find the hole');
  flowArrow([[X - 30, 642], [X - 30, 672], [585, 672], top('patched')]); words(573, 646, '[a patch', 'end'); words(573, 666, 'in kit]', 'end');
  flowArrow([[X + 30, 642], [X + 30, 672], [815, 672], top('new_tube')]); words(826, 690, 'or a new tube');
  flowArrow([bot('patched'), [585, 812], [X - 24, 812], [X - 24, 856]]);
  flowArrow([bot('new_tube'), [815, 812], [X + 24, 812], [X + 24, 856]]); words(826, 840, 'tube back in');
  flowArrow([bot('refitted'), top('pumped')]); words(X + 14, 940, 'pump it up');
  flowArrow([bot('pumped'), [X, HOLDS[1] - 26]]); words(X + 14, 1046, 'wait a minute');
  const [hx, hy] = HOLDS, dia = [[hx, hy - 22], [hx + 26, hy], [hx, hy + 22], [hx - 26, hy]];
  fill(dia, PAL.butter, { amp: 0.3 }); rim(dia, 1.2);
  words(hx + 36, hy + 6, 'holds air?');
  flowArrow([[hx, hy + 24], top('riding')]); words(X + 14, 1150, '[holds air]');
  flowArrow([[hx - 28, hy], [470, hy], [470, 400], [X - tagW('wheel_off') / 2 - 4, 400]], { dashed: true });
  words(480, 1076, '[still flat]');
  // each picture to its step
  for (const id of Object.keys(SPOTS)) {
    const [sx, sy] = SPOTS[id], [tx, ty] = id === 'pumped' ? TAGS.refitted : TAGS[id], left = sx < X;
    link([sx + (left ? 150 : -150), sy - 20], [tx + (left ? -1 : 1) * (tagW(id === 'pumped' ? 'refitted' : id) / 2 + 6), ty + 20]);
  }
}

function tags() {
  for (const id of Object.keys(TAGS)) {
    const [x, y] = TAGS[id], w = tagW(id);
    group(`data-state="${id}"`, () => {
      tag(x - w / 2, y, w, NAMES[id]);
      out.push('<g class="on">');
      litRing([[x - w / 2 - 6, y - 6], [x + w / 2 + 6, y - 6], [x + w / 2 + 6, y + 46], [x - w / 2 - 6, y + 46]]);
      nowTag(x > X ? x + w / 2 - 32 : x - w / 2 + 32, y - 8);
      out.push('</g>');
    });
  }
}

// the way not taken at the split, under a paper mist: its tag, its arrows, its picture
const FOG = {
  patched: [[478, 626, 182, 219], [60, 680, 380, 240]],
  new_tube: [[740, 655, 250, 190], [950, 730, 380, 250]],
};
function fog() {
  if (!V.took) return;
  for (const [x, y, w, h] of FOG[V.took === 'patched' ? 'new_tube' : 'patched']) out.push(`<rect class="fog" x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${PAPER}" opacity=".68"/>`);
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 0;
  if (V.trail.length > 1) out.push(`<path d="${pathOf(V.trail)}" fill="none" stroke="${RED}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/>`);
  pictures();
  chain();
  tags();
  fog();
  group('id="token"', () => {
    const [tx, ty] = tok(AT), o = oval(tx, ty, 11, 11, 16);
    shape(o, RED, { w: 1.2 }); out.push(`<circle cx="${n1(tx)}" cy="${n1(ty)}" r="3.5" fill="${PAPER}"/>`);
  });
  title('a flowchart', 'Fixing a flat tyre');
  subtitle('every step, from the thump to the ride home');
  status(NAMES[AT], `${V.patches} patch${V.patches === 1 ? '' : 'es'} in the kit, ${V.thorn ? 'a thorn still in the tyre' : 'no thorn in the tyre'}`);
  footnote('Illustrative: one bike, one puncture kit with one patch. Pressures vary by tyre: read the number on its side.');
  finish();
}

// the token's way from one tag to the next, as sheet points
function way(from, to) {
  if (from === 'pumped' && to === 'wheel_off') return [tok(from), [X + 90, HOLDS[1]], [470, HOLDS[1]], [470, 400], tok(to)];
  if (from === 'pumped') return [tok(from), [X + 90, HOLDS[1]], tok(to)];
  return [tok(from), tok(to)];
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(5); ctx.state(AT); };
  const go = (to, change = () => {}) => {
    const pts = way(AT, to);
    hops(ctx, $('token'), pts.map(p => at(...p)), { then: () => {
      V.trail.push(...pts); change(); AT = to;
      const split = to === 'patched' || to === 'new_tube';
      if (split) V.took = to;
      if (to === 'wheel_off') V.took = null;
      redraw();
      if (split) for (const f of document.querySelectorAll('#art .fog')) tween(ctx, 700, k => f.setAttribute('opacity', (0.68 * k).toFixed(3)));
    } });
  };
  const NEXT = { flat: 'wheel_off', wheel_off: 'tube_out', tube_out: 'dunked', patched: 'refitted', new_tube: 'refitted', refitted: 'pumped' };
  const SAY = {
    wheel_off: 'Flip the bike onto its saddle and take the wheel off.',
    tube_out: 'Two levers under the tyre. The tube comes out.',
    dunked: 'Pump a little air in and dunk it. Bubbles show the hole.',
    refitted: 'Tube back in, tyre back on, wheel back in.',
    pumped: 'Pump it up hard. Now wait a minute.',
  };

  ctx.button('next step', () => {
    if (AT === 'dunked') return ctx.no('Patch the hole, or fit a new tube.');
    if (AT === 'riding') return ctx.no('Home already. Play all starts again.');
    if (AT === 'pumped') {
      const holds = V.fixed && !V.thorn;
      if (holds) { ctx.say('Still hard after a minute. Off you go.'); return go('riding', () => { V.air = true; }); }
      ctx.say('Still flat! The thorn is still in the tyre. Start again.');
      return go('wheel_off', () => { V.fixed = false; V.air = false; });
    }
    ctx.say(SAY[NEXT[AT]]);
    go(NEXT[AT]);
  });
  ctx.button('feel the tyre', () => {
    if (AT !== 'tube_out') return ctx.no('Feel inside the tyre while the tube is out.');
    if (!V.thorn) return ctx.say('Nothing sharp left in there.');
    V.thorn = false; redraw(); ctx.say('A thorn! Out it comes.');
  });
  ctx.button('patch it', () => {
    if (AT !== 'dunked') return ctx.no('Find the hole first: the tube goes in the water.');
    if (V.patches < 1) return ctx.no('The kit has no patch left. Fit a new tube.');
    ctx.say('Rough it up, glue, wait, press the patch on.');
    go('patched', () => { V.patches--; V.fixed = true; });
  });
  ctx.button('new tube', () => {
    if (AT !== 'dunked') return ctx.no('Take the old tube out and check it first.');
    ctx.say('A new tube from the shop round the corner.');
    go('new_tube', () => { V.fixed = true; });
  });
  ctx.hint('Press Play all, or next step.');
  redraw();

  const STORY = ['flat', 'wheel_off', 'tube_out', 'dunked', 'patched', 'refitted', 'pumped', 'wheel_off', 'tube_out', 'dunked', 'new_tube', 'refitted', 'pumped', 'riding'];
  let round = 0;
  return {
    goto(id, play) {
      // a state on its own link gets the data it has in the story
      if (id === 'flat') round = 0;
      if (id === 'wheel_off' && AT === 'pumped') round = 1;
      if (['new_tube', 'riding'].includes(id)) round = 1;
      V = { ...V, patches: round || id === 'patched' ? 0 : 1, thorn: !(round && id !== 'wheel_off') && id !== 'riding',
        fixed: ['patched', 'new_tube', 'refitted', 'pumped', 'riding'].includes(id), air: id === 'riding' };
      if (id === 'flat') V.trail = [];
      V.took = id === 'patched' || (!round && ['refitted', 'pumped'].includes(id)) ? 'patched' : ['new_tube', 'riding'].includes(id) || (round && ['refitted', 'pumped'].includes(id)) ? 'new_tube' : null;
      ctx.say(NAMES[id] + '.');
      if (play && id !== AT) go(id);
      else { AT = id; redraw(); }
    },
    story: STORY,
  };
}
