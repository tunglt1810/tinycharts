// A bike repair stall: one bike at a time, fixed only with the part,
// ridden before it goes home. Shows every part of the kit.
const NAMES = { empty: 'waiting for a bike', on_stand: 'on the stand', waiting: 'waiting for a part', fixed: 'fixed' };
const SPOT = { empty: [190, 210], on_stand: [0, 10], waiting: [-200, 40], fixed: [150, -190] };
let AT = 'empty';
let V = { spares: 0, fitted: false, ridden: false, done: 0 };

// A bike seen side on, standing on a sheet point, as flat as the people.
function bike(sx, sy, col = PAL.red) {
  const r = 18, a = [sx - 27, sy - r], b = [sx + 27, sy - r];
  for (const c of [a, b]) group('class="wheel"', () => {
    const o = oval(c[0], c[1], r, r, 22);
    line([...o, o[0], o[1]], { w: 2.3, over: 0, amp: 0.4 });
    rule([0, 1, 2].map(k => { const t = k * Math.PI / 3; return [[c[0] - Math.cos(t) * r * 0.85, c[1] - Math.sin(t) * r * 0.85], [c[0] + Math.cos(t) * r * 0.85, c[1] + Math.sin(t) * r * 0.85]]; }), INK, 0.6);
  });
  const seat = [sx - 6, sy - 46], bar = [sx + 18, sy - 50], crank = [sx - 2, sy - r];
  line([a, seat, crank, a], { w: 2.6, col, over: 0 });
  line([seat, [sx + 15, sy - 42], crank], { w: 2.6, col, over: 0 });
  line([[sx + 15, sy - 42], b], { w: 2.6, col, over: 0 });
  line([[sx + 15, sy - 42], bar, [sx + 24, sy - 52]], { w: 2, over: 0 });
  line([[seat[0] - 7, seat[1] - 3], [seat[0] + 6, seat[1] - 3]], { w: 3.2, over: 0 });
}

const bikeAt = at => (at === 'empty' ? SPOT.empty : at === 'fixed' ? SPOT.fixed : SPOT.on_stand);
const mechAt = () => (AT === 'fixed' && V.ridden ? [190, -150] : AT === 'waiting' ? [-170, 70] : [-40, 40]);
const KID = [[-60, 170], [-5, 120]];
const CHIMNEY = [-262, -262, 120];

function plate([x, y]) { return [P(x - 34, y - 34), P(x + 34, y - 34), P(x + 34, y + 34), P(x - 34, y + 34)]; }

function draw(seed) {
  begin(seed);
  OX = 700; OY = 680;
  board(-340, -340, 680, 680, 18, '#dfe3cf', PAL.tan);

  // the floor: stations and the paths between them
  for (const id of Object.keys(SPOT)) {
    const q = plate(SPOT[id]);
    group(`data-state="${id}"`, () => {
      fill(q, PAL.cream, { amp: 0.4 }); rim(q, 1);
      out.push('<g class="on">'); litRing(q.map(([a, b], i) => [a + [0, 8, 0, -8][i], b + [-5, 0, 5, 0][i]])); out.push('</g>');
    });
  }
  route([180, 170], [40, 20], false);
  route([-40, 15], [-160, 40]);
  route([-200, 0], [-30, -20], false);
  route([40, -10], [150, -150], false);
  arrow([[190, -150], [200, 170]]);
  floorText(-200, 300, 0, 'BIKE REPAIRS', { size: 20, cls: 'cap', col: PAL.bark });

  // everything that stands on the floor, far to near
  put(-700, 0, () => {
    fence([[-330, 330], [-330, -330], [330, -330]]);
    bird(-330, -120, 26);
  });
  put(-470, 0, () => gable(-300, -300, 130, 150, 92, 46, { wall: PAL.sand, roof: PAL.slate }));
  put(-468, 0, () => box(...CHIMNEY, 14, 14, 30, { left: PAL.brick, marks: false }));
  put(-469, 0, () => { doorR(-170, -180, 0, 42, 64, PAL.brick); windowR(-170, -240, 34, 40, 30); windowL(-285, -150, 34, 44, 30); });
  put(-450, 0, () => { box(60, -320, 0, 150, 90, 34, { left: PAL.stone, top: PAL.cream }); cat(150, -280, 34); });
  put(-440, 0, () => flight(60, -250, 0, 4, 10, 8.5, 22, '-x'));
  put(-300, 0, () => {
    block(-310, -20, 0, 80, 110, 34, { wall: PAL.wood, deck: PAL.bark });
    for (const [x, y] of [[-290, 0], [-270, 30], [-285, 55]]) turn(x, y, 25, [[9, 0], [9, 5]], '#3b3330', { cap: '#5c5650', wall: 4 });
  });
  put(-180, 0, () => pot(-150, -130, 0));
  put(-120, 0, () => { tree(-300, 230, 54); puff(-310, 140, 0); puff(-305, 175, 0, { hw: 14, h: 20 }); });
  put(-60, 0, () => {
    box(300, -120, 0, 8, 8, 38, { left: PAL.slate, marks: false });
    const [ax, ay] = P(304, -116, 30);
    pipe([[ax, ay], [ax - 6, ay + 22], P(300, -60, 0), P(280, -20, 0)], 6, PAL.leaf);
  });
  put(330, 0, () => { cyl(290, 40, 0, 18, 46, PAL.navy, { cap: PAL.blue }); turn(300, 100, 0, [[12, 0], [15, 24]], PAL.grey, { wall: 2 }); });
  put(-10, 0, () => { box(-8, 2, 0, 24, 24, 6, { left: PAL.slate, marks: false }); box(2, 12, 6, 5, 5, 58, { left: PAL.slate, marks: false }); });

  const bk = bikeAt(AT);
  put(bk[0] + bk[1] + 1, 0, () => group('id="bike"', () => { const [sx, sy] = P(bk[0] + 10, bk[1] + 10); bike(sx, sy); }));
  const mech = mechAt();
  put(mech[0] + mech[1] + 30, 0, () => group('id="mech"', () => who(mech[0], mech[1], { shirt: PAL.navy, pants: PAL.slate, hair: 'cap', arm: AT === 'on_stand' ? 'out' : 'down', look: 1, say: 'One bike at a time.' })));
  put(470, 0, () => who(240, 250, { shirt: PAL.rose, pants: PAL.navy, hair: 'bun', arm: AT === 'empty' ? 'wave' : 'down', look: -1, say: 'The back tyre keeps going flat.' }));
  put(140, 0, () => group('id="kid"', () => { who(...KID[0], { shirt: PAL.mustard, hair: 'bob', kid: true, arm: 'out' }); dog(KID[0][0] + 40, KID[0][1] + 10); }));
  put(330, 0, () => who(60, 280, { shirt: PAL.sage, pants: PAL.bark, hair: 'long' }));
  if (AT === 'waiting') put(-160, 0, () => who(-250, 110, { shirt: PAL.butter, pants: PAL.navy, hair: 'short', arm: 'hold', look: 1, say: 'Your inner tube comes tomorrow.' }));
  flush();

  // steam from the workshop stove, moved by tick
  const [cx, cy] = P(CHIMNEY[0] + 7, CHIMNEY[1] + 7, CHIMNEY[2] + 34);
  for (let i = 0; i < 3; i++) group(`class="wisp" data-x="${n1(cx)}" data-y="${n1(cy - 10)}"`, () => { const o = oval(cx, cy - 10, 10, 7, 14); fill(o, '#f6f1e6', { amp: 0.3 }); rim(o, 0.8); });

  // on top: where each station is, and where the bike is now
  for (const id of Object.keys(SPOT)) {
    const [x, y] = SPOT[id], [px, py] = P(x + 34, y + 34);
    group(`data-state="${id}"`, () => {
      pill(px, py + 26, NAMES[id]);
      out.push('<g class="on">'); pill(px, py + 26, NAMES[id], { lit: true }); nowTag(px - textW(NAMES[id], 15) / 2 - 30, py + 18); out.push('</g>');
    });
  }

  title('an annotated scene', 'A bike repair stall');
  subtitle('one bike at a time, fixed only with the part');
  status(NAMES[AT], `${V.done} fixed today, ${V.spares} part${V.spares === 1 ? '' : 's'} on the shelf`);
  label(72, 330, 'the workshop', 'tools, and the kettle', [-170, -230, 60]);
  label(72, 470, 'spares', 'inner tubes, chains, pads', [-275, 10, 34]);
  label(1328, 330, 'test lane', 'every fix gets a ride', [135, -275, 34], 'end');
  label(1328, 880, 'the hose', 'mud off before the fix', [302, -100, 34], 'end');
  label(1328, 1060, 'the gate', 'bikes come in here', [250, 300, 0], 'end');
  tag(72, 1110, 230, 'a puncture: 8');
  legend([{ col: '#e9b8ad', text: 'where the bike is now' }, { col: PAL.cream, text: 'a station' }], 72, 1250);
  footnote('Illustrative: one made-up stall. A part ordered today comes the next morning.');
  finish();
}

function init(ctx) {
  let mechWas = null, part = 0;
  const $ = id => document.getElementById(id);
  const steam = t => document.querySelectorAll('#art .wisp').forEach((w, i) => rise(w, (t * 0.22 + i / 3) % 1, 24, -60, 0.6, 1.7));
  const redraw = () => {
    draw(7); ctx.state(AT); steam(0);
    const m = mechAt();
    if (mechWas) arrive(ctx, $('mech'), mechWas, m, { delay: 90 });
    mechWas = m;
  };
  const go = (to, change) => (clearTimeout(part), glide(ctx, $('bike'), bikeAt(AT), bikeAt(to), {
    spin: [...document.querySelectorAll('#bike .wheel')],
    then: () => { change(); AT = to; redraw(); },
  }));

  ctx.button('next bike', () => {
    if (AT !== 'empty') return ctx.no('One bike at a time. Hand this one back first.');
    ctx.say('A bike with a flat tyre comes in.');
    go('on_stand', () => { V.fitted = false; V.ridden = false; });
  });
  ctx.button('fix it', () => {
    if (AT === 'empty') return ctx.no('There is no bike on the stand.');
    if (AT === 'waiting') return ctx.no('The part has not come yet.');
    if (AT === 'fixed') return ctx.no('It is fixed already. Take it for a test ride.');
    if (V.spares > 0) {
      ctx.say('The new part goes on.');
      go('fixed', () => { V.spares--; V.fitted = true; });
    } else {
      ctx.say('No inner tube on the shelf. One is ordered.');
      AT = 'waiting'; redraw();
      part = setTimeout(() => {
        if (AT !== 'waiting') return;
        V.spares++; AT = 'on_stand'; redraw();
        ctx.say('The part came. Press fix it again.');
      }, 1800);
    }
  });
  ctx.button('test ride', () => {
    if (AT !== 'fixed') return ctx.no('Fix it first.');
    V.ridden = true; redraw(); ctx.hop($('bike'));
    ctx.say('Once round the lane. The brakes work.');
  });
  ctx.button('hand back', () => {
    if (AT !== 'fixed') return ctx.no('It is not fixed yet.');
    if (!V.ridden) return ctx.no('Not yet. Nobody has ridden it since the fix.');
    ctx.say('Back to its owner.');
    go('empty', () => { V.done++; V.fitted = false; V.ridden = false; });
  });
  ctx.hint('Press Play all, or next bike.');
  redraw();

  return {
    goto(id, play) {
      const set = () => { AT = id; V = { spares: 0, fitted: id === 'fixed', ridden: false, done: V.done }; };
      clearTimeout(part);
      ctx.say(NAMES[id] + '.');
      if (play) go(id, set);
      else { set(); redraw(); }
    },
    tick(t) {
      steam(t);
      const kid = $('kid');
      if (kid) stroll(kid, KID, t, 14);
    },
    story: ['empty', 'on_stand', 'waiting', 'on_stand', 'fixed', 'empty'],
  };
}
