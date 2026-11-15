// Every part of the kit on one sheet, one cell each, named by the call that
// draws it. The last row moves: a cart that glides between two stops, steam,
// a walker, and a bird that hops when clicked.
const SIZE = [2400, 1960];
const ABOUT = 'the main parts of the kit, by name';
const COLS = 6, CW = 376, CH = 300, X0 = 72, Y0 = 280;
const STOP = { home: [-70, 30], away: [30, -70] };
let AT = 'home';

const cellAt = i => [X0 + CW / 2 + (i % COLS) * CW, Y0 + Math.floor(i / COLS) * CH];

// Draws one cell: the art is centred on (OX, OY), the call name and a note below.
function cell(i, name, note, art) {
  const [cx, top] = cellAt(i);
  OX = cx; OY = top + 150;
  art(cx, top + 150);
  _text(cx, top + 252, name, { cls: 'cap', size: 15, anchor: 'middle' });
  _text(cx, top + 274, note, { size: 15, col: LEAD, anchor: 'middle' });
}

function draw(seed) {
  begin(seed);
  title('the kit', 'The main parts of the kit');
  subtitle('each cell is one call; the bottom row moves');
  status(AT === 'home' ? 'the cart is home' : 'the cart is away', 'press the buttons, or click the bird');

  const cells = [
    ['box', 'three washed faces', () => box(-45, -35, 0, 90, 70, 60, { left: PAL.sky })],
    ['cyl', 'a drum or a tank', () => cyl(0, 0, 0, 34, 70, PAL.navy, { cap: PAL.blue })],
    ['turn', 'anything lathe-turned', () => turn(0, 0, 0, [[18, 0], [26, 22], [14, 52], [17, 66]], PAL.rose, { cap: '#7a5a4a' })],
    ['block', 'a planter or a pit', () => block(-55, -40, 0, 110, 80, 36, { wall: PAL.wood, deck: PAL.bark })],
    ['gable', 'with doorR, windowL', () => { gable(-60, -50, 120, 100, 60, 34, { wall: PAL.sand, roof: PAL.slate }); doorR(60, -10, 0, 28, 42, PAL.brick); windowL(-30, 50, 24, 30, 22); }],
    ['flight', 'steps up a block', () => { box(-20, -60, 0, 70, 80, 50, { left: PAL.stone, top: PAL.cream, marks: false }); flight(-20, -10, 0, 5, 9, 10, 26, '-x'); }],

    ['fence', 'posts on a path', () => fence([[-90, 40], [-90, -60], [60, -60]])],
    ['pipe', 'a bent run', () => pipe([P(-80, 30, 40), P(-20, 30, 40), P(-20, -40, 40), P(60, -40, 0)], 8, PAL.leaf)],
    ['board', 'with floorText', () => { board(-80, -60, 160, 120, 14, '#e4e7dc', PAL.slate); floorText(0, 0, 0, 'FLOOR', { size: 22, cls: 'cap', col: PAL.bark }); }],
    ['faceText', 'words on a side', () => { box(-50, -40, 0, 100, 80, 60, { left: PAL.mustard, marks: false }); faceText('right', 50, 0, 24, 'CRATE', { size: 14, cls: 'cap', col: '#3a3430' }); }],
    ['tree, puff', 'a tree and a bush', () => { tree(-30, 0, 46); puff(50, 20, 0); puff(70, -20, 0, { hw: 14, h: 20 }); }],
    ['pot', 'with or without a plant', () => { pot(-40, 0, 0); pot(40, 0, 0, false, PAL.navy); }],

    ['who: hair', 'short, bun, bob, cap', () => ['short', 'bun', 'bob', 'cap'].forEach((h, k) => who(-75 + k * 50, 30 - k * 10, { hair: h, shirt: [PAL.sky, PAL.rose, PAL.sage, PAL.mustard][k] }))],
    ['who: arms', 'wave, up, out, hold', () => ['wave', 'up', 'out', 'hold'].forEach((a, k) => who(-75 + k * 50, 30 - k * 10, { arm: a, shirt: [PAL.lilac, PAL.butter, PAL.navy, PAL.brick][k] }))],
    ['who: kid', 'and a speech line', () => { who(-30, 20, { shirt: PAL.sage, say: 'Hello!' }); who(30, 20, { kid: true, shirt: PAL.mustard, hair: 'bob', look: -1 }); }],
    ['cat', 'sitting', () => cat(0, 0)],
    ['dog', 'standing', () => dog(0, 0)],
    ['bird', 'click it to hop', () => group('class="hop"', () => bird(0, 0, 20))],

    ['arrow, route', 'world paths, red', () => { arrow([[-90, -40], [60, -40]]); route([-90, 20], [60, 70]); }],
    ['pill, nowTag', 'a station name, lit', (cx, cy) => { pill(cx - 70, cy - 30, 'plain'); pill(cx + 60, cy + 30, 'lit', { lit: true }); nowTag(cx + 20, cy + 22); }],
    ['litRing', 'around the now spot', () => { const q = [P(-50, -50), P(50, -50), P(50, 50), P(-50, 50)]; fill(q, PAL.cream, { amp: 0.4 }); rim(q, 1); litRing(q); }],
    ['tag, legend', 'a count, a key', (cx, cy) => { tag(cx - 120, cy - 70, 200, 'a count: 3'); legend([{ col: PAL.sky, text: 'one' }, { col: PAL.rose, text: 'two' }], cx - 120, cy + 30); }],
    ['label', 'a margin note', (cx, cy) => { box(30, -20, 0, 40, 40, 40, { left: PAL.sage, marks: false }); label(cx - 170, cy - 80, 'a note', 'its leader', [50, 0, 40]); }],
    ['line, rim, dash, hatch, fill', 'the pens', (cx, cy) => {
      const sq = [[cx - 150, cy - 50], [cx - 80, cy - 50], [cx - 80, cy + 20], [cx - 150, cy + 20]];
      fill(sq, PAL.rose); rim(sq);
      const sq2 = sq.map(([x, y]) => [x + 100, y]);
      rim(sq2); hatch(sq2, { dir: [1, 1] });
      line([[cx + 60, cy - 50], [cx + 150, cy - 10]], { w: 2.2 });
      dash([cx + 60, cy + 20], [cx + 150, cy + 20]);
    }],

    ['glide', 'press send or bring back', () => {
      for (const id of Object.keys(STOP)) {
        const [x, y] = STOP[id], q = [P(x - 34, y - 34), P(x + 34, y - 34), P(x + 34, y + 34), P(x - 34, y + 34)];
        group(`data-state="${id}"`, () => {
          fill(q, PAL.cream, { amp: 0.4 }); rim(q, 1);
          out.push('<g class="on">'); litRing(q); out.push('</g>');
        });
      }
      const [x, y] = STOP[AT];
      group('id="cart"', () => box(x - 22, y - 22, 0, 44, 44, 30, { left: PAL.mustard, marks: false }));
      for (const id of Object.keys(STOP)) {
        const [px, py] = P(STOP[id][0] + 34, STOP[id][1] + 34);
        group(`data-state="${id}"`, () => { pill(px, py + 14, id); out.push('<g class="on">'); pill(px, py + 14, id, { lit: true }); out.push('</g>'); });
      }
    }],
    ['rise', 'steam from a kettle', () => {
      cyl(0, 0, 0, 26, 34, PAL.grey, { cap: PAL.stone });
      const [sx, sy] = P(0, 0, 44);
      for (let k = 0; k < 3; k++) group(`class="wisp" data-x="${n1(sx)}" data-y="${n1(sy)}"`, () => { const o = oval(sx, sy, 10, 7, 14); fill(o, '#f6f1e6', { amp: 0.3 }); rim(o, 0.8); });
    }],
    ['stroll', 'pacing to and fro', () => group('id="walker"', () => who(-60, 0, { shirt: PAL.brick, hair: 'bun' }))],
    ['ctx.no', 'a refused press shakes', (cx, cy) => _text(cx, cy, 'press send twice', { size: 20, anchor: 'middle', col: RED })],
    ['tc-pop', 'the lit marks drop in', (cx, cy) => _text(cx, cy, 'watch the glide cell', { size: 20, anchor: 'middle', col: LEAD })],
    ['ctx.follow', 'see flowchart-tech', (cx, cy) => _text(cx, cy, 'the camera follows', { size: 20, anchor: 'middle', col: LEAD })],
  ];
  cells.forEach(([name, note, art], i) => cell(i, name, note, art));
  OX = SIZE[0] / 2; OY = SIZE[1] / 2;
  footnote('Illustrative: each cell uses the kit as a sheet would. The names are the calls in tinycharts/kit. The full list is in references/kit.md.', 2256);
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(7); ctx.state(AT); };
  const go = to => glide(ctx, $('cart'), STOP[AT], STOP[to], { then: () => { AT = to; redraw(); } });

  ctx.button('send the cart', () => (AT === 'away' ? ctx.no('The cart is away already.') : (ctx.say('Off it goes.'), go('away'))));
  ctx.button('bring it back', () => (AT === 'home' ? ctx.no('The cart is home already.') : (ctx.say('Back it comes.'), go('home'))));
  ctx.hint('Press Play all, or send the cart. Click the bird.');
  redraw();

  return {
    goto(id, play) {
      ctx.say(id === 'home' ? 'The cart is home.' : 'The cart is away.');
      if (play) go(id);
      else { AT = id; redraw(); }
    },
    tick(t) {
      document.querySelectorAll('#art .wisp').forEach((w, k) => rise(w, (t * 0.25 + k / 3) % 1, 18, -70, 0.6, 1.7));
      const w = $('walker');
      if (w) stroll(w, [[-60, 0], [60, 0]], t, 30);
    },
    click(e) {
      const h = e.target.closest('.hop');
      if (h) ctx.hop(h);
    },
    story: ['home', 'away', 'home'],
  };
}
