// A lighthouse keeper's day on a round plinth of 24 hours. The tower stands
// in the middle; the keeper walks the rim, and a red hand gives the hour.
const ABOUT = 'a whole day, round once';
const R = 330, MID = 205;
// sector: state, from hour, words for the margin, a note, dark?
const SECTORS = [
  ['sleep', 0, 'asleep', 'under the light, one ear open', true], ['watch', 3, 'the watch', 'wind the weights, trim', true],
  ['dawn', 6, 'dawn', 'lamp out, kettle on', false], ['lens', 9, 'the lens', 'polished every day, no fingers', false],
  ['radio', 12, 'the weather log', 'wind, sea, sky, every noon', false], ['garden', 15, 'the garden', 'beans, goat, oil store', false],
  ['supper', 18, 'supper', 'fish, most days', false], ['night', 21, 'the light on', 'lit at sunset, all night', true],
];
const NAMES = {
  sleep: 'asleep', watch: 'the night watch', dawn: 'dawn', lens: 'polishing the lens', radio: 'the weather log', foghorn: 'fog: the horn',
  garden: 'the garden', supper: 'supper', night: 'the light is on', late_oil: 'oil by lantern',
};
const HOUR = { sleep: 0, watch: 3, dawn: 6, lens: 9, radio: 12, foghorn: 13.5, garden: 15, supper: 18, night: 21, late_oil: 21 };
let AT = 'sleep', H = 0, WALK = false;
let V = { oil: 1, lit: true };

// an hour as a world point on the plinth: midnight at the back, clockwise
const pt = (h, r, z = 0) => { const a = h / 24 * 2 * Math.PI, c = Math.cos(a), s = Math.sin(a), k = Math.SQRT1_2; return [r * (-c + s) * k, r * (-c - s) * k, z]; };
const clock = h => `${String(Math.floor(h) % 24).padStart(2, '0')}:${String(Math.round(h % 1 * 60)).padStart(2, '0')}`;
const dark = h => h < 6 || h >= 20;

// where the keeper stands at each stop, in its scene, and what he does there
const SPOT = {
  sleep: [1.5, MID + 4, { sit: 1, arm: 'hold' }], watch: [2.2, MID + 36, { arm: 'up' }], dawn: [2.3, MID + 40, { sit: 1, arm: 'hold', hold: 'mug' }],
  lens: [2.4, MID + 34, { arm: 'out', hold: 'cloth' }], radio: [2.3, MID + 40, { sit: 1, arm: 'out' }], garden: [0.6, MID + 44, { arm: 'out', hold: 'can' }],
  supper: [1.2, MID - 60, { sit: 1, arm: 'hold', hold: 'plate' }], night: [0.9, MID + 40, { arm: 'out', hold: 'lamp' }],
};
const spot = id => id === 'foghorn' ? pt(13.1, R + 80) : id === 'late_oil' ? pt(22.1, R + 30) : pt(HOUR[id] + SPOT[id][0], SPOT[id][1]);
const poseOf = id => id === 'foghorn' ? { arm: 'up' } : id === 'late_oil' ? { arm: 'out', hold: 'oil' } : SPOT[id][2];
const HOLD = {
  mug: ([x, y]) => { shape([[x - 3, y - 6], [x + 4, y - 6], [x + 4, y + 2], [x - 3, y + 2]], '#fffdf6', { w: 0.9 }); },
  cloth: ([x, y]) => { shape([[x - 2, y - 5], [x + 9, y - 3], [x + 7, y + 6], [x - 3, y + 4]], '#fffdf6', { w: 0.9 }); },
  can: ([x, y]) => { shape([[x - 2, y], [x + 10, y], [x + 9, y + 12], [x - 1, y + 12]], PAL.sage, { w: 0.9 }); line([[x + 10, y + 3], [x + 18, y - 3]], { w: 1.4, over: 0 }); },
  plate: ([x, y]) => { out.push(`<ellipse cx="${n1(x)}" cy="${n1(y - 1)}" rx="9" ry="3" fill="#fffdf6" stroke="${INK}" stroke-width="0.9"/>`); },
  lamp: ([x, y]) => { line([[x, y], [x, y + 5]], { w: 1, over: 0 }); shape([[x - 4, y + 5], [x + 4, y + 5], [x + 3, y + 15], [x - 3, y + 15]], PAL.mustard, { w: 0.9 }); },
  oil: ([x, y]) => { shape([[x - 4, y], [x + 6, y], [x + 6, y + 14], [x - 4, y + 14]], PAL.red, { w: 0.9 }); },
};

function wedge(h0, h1, r0, r1) {
  const a = [], b = [];
  for (let i = 0; i <= 12; i++) { const h = h0 + (h1 - h0) * i / 12; a.push(P(...pt(h, r1))); b.push(P(...pt(h, r0))); }
  return [...a, ...b.reverse()];
}

function scene(id) {
  const h = HOUR[id] + 1.5, [x, y] = pt(h, MID);
  if (id === 'sleep') { box(x - 30, y - 18, 0, 60, 36, 16, { left: PAL.wood, top: '#fffdf6', marks: false }); box(x - 30, y - 14, 16, 22, 28, 6, { left: PAL.sky, top: '#eef3f8', marks: false }); }
  else if (id === 'watch') { cyl(x - 20, y, 0, 6, 40, PAL.slate, { cap: PAL.grey }); cyl(x + 4, y - 10, 0, 6, 28, PAL.slate, { cap: PAL.grey }); box(x + 14, y + 6, 0, 22, 22, 18, { left: PAL.wood, marks: false }); turn(x + 25, y + 17, 18, [[4, 0], [5, 8]], PAL.rose, { cap: '#6b4226' }); }
  else if (id === 'dawn') { box(x - 26, y - 20, 0, 52, 40, 24, { left: PAL.wood, top: PAL.tan, marks: false }); turn(x - 6, y - 4, 24, [[7, 0], [10, 8], [6, 14]], PAL.mint, { cap: PAL.mint }); turn(x + 12, y + 8, 24, [[3, 0], [4, 5]], '#fffdf6', { cap: '#f1e3b6' }); }
  else if (id === 'lens') { box(x - 12, y - 12, 0, 24, 24, 14, { left: PAL.stone, marks: false }); turn(x, y, 14, [[16, 0], [20, 10], [16, 14], [20, 24], [16, 28], [12, 38], [4, 44]], '#dfeef2', { ink: 0.8, cap: '#eef7f9' }); }
  else if (id === 'radio') { box(x - 28, y - 16, 0, 56, 32, 24, { left: PAL.wood, top: PAL.tan, marks: false }); box(x - 20, y - 10, 24, 22, 16, 16, { left: PAL.navy, top: PAL.blue, marks: false }); box(x + 8, y - 6, 24, 16, 12, 3, { left: PAL.brick, top: '#fffdf6', marks: false }); }
  else if (id === 'garden') {
    for (const d of [-30, -12, 6]) puff(x + d, y - 24, 0, { hw: 9, h: 14 });
    for (let k = 0; k < 2; k++) if (k < V.oil) cyl(x + 26 + k * 14, y + 6, 0, 6, 18, PAL.red, { cap: PAL.brick });
    dog(x - 20, y + 22, 0, '#f3ead8');
  }
  else if (id === 'supper') { box(x - 24, y - 18, 0, 34, 34, 34, { left: PAL.slate, top: '#4b4644', marks: false }); turn(x - 7, y - 1, 34, [[9, 0], [10, 10]], PAL.grey, { cap: '#9c9488' }); box(x + 16, y - 8, 0, 20, 20, 20, { left: PAL.wood, marks: false }); }
  else if (id === 'night') { flight(x - 30, y - 10, 0, 5, 10, 8, 26, 'x', PAL.stone); turn(x + 30, y + 14, 0, [[5, 0], [6, 12], [3, 16]], V.lit ? PAL.mustard : PAL.grey, { cap: PAL.bark }); }
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 780;
  // the sea round the plinth, with a boat that sails by
  const sea = [P(-640, -640), P(640, -640), P(640, 640), P(-640, 640)];
  clipped([[0, 250], [1400, 250], [1400, 1210], [0, 1210]], () => { flat(sea, '#dbe7ee'); rule(Array.from({ length: 40 }, () => { const [a, b] = P(-600 + rnd() * 1200, -600 + rnd() * 1200); return [[a - 10, b], [a + 10, b]]; }), '#9fbccc', 0.7); });
  group('id="boat"', () => { const [bx, by] = P(-150, 470); shape([[bx - 30, by - 8], [bx + 30, by - 8], [bx + 20, by + 4], [bx - 22, by + 4]], PAL.brick); line([[bx, by - 8], [bx, by - 46]], { w: 1.4, over: 0 }); shape([[bx + 2, by - 44], [bx + 26, by - 14], [bx + 2, by - 14]], '#fffdf6', { w: 0.9 }); });
  // the plinth, its sectors, and the hours
  cyl(0, 0, -34, R + 10, 34, PAL.stone, { cap: PAL.sand });
  for (const [id, h0, , , isDark] of SECTORS) group(`data-state="${id}"`, () => {
    const w = wedge(h0, h0 + 3, 70, R - 34);
    flat(w, isDark ? '#cfd3e0' : '#f1e8d2'); rim(w, 0.8);
    out.push('<g class="on">'); flat(w, isDark ? '#d9cad9' : '#f3dcd0'); rim(w, 1.6, RED); out.push('</g>');
  });
  for (let h = 0; h < 24; h++) { const [sx, sy] = P(...pt(h, R - 16)); _text(sx, sy + 5, String(h), { size: 13, col: dark(h + 0.5) ? LEAD : MUTE, anchor: 'middle' }); }
  // the hand, on the floor
  { const a = P(...pt(H, 74, 1)), b = P(...pt(H, R - 40, 1)); group('id="hand"', () => { line([a, b], { w: 3, col: RED, over: 0 }); out.push(`<circle cx="${n1(b[0])}" cy="${n1(b[1])}" r="5" fill="${RED}"/>`); }); }
  // the scenes, the tower, and the keeper, far to near
  for (const [id, h0] of SECTORS) { const [x, y] = pt(h0 + 1.5, MID); put(x + y, 0, () => scene(id)); }
  put(0, 0, () => {
    castDisc(0, 0, 50, 260, 0);
    turn(0, 0, 0, [[56, 0], [44, 210]], '#fffdf6', { cap: PAL.red, ink: 1.2 });
    for (const z of [50, 130]) { const [sx, sy] = P(0, 0, z); shape([[sx - 30, sy], [sx + 30, sy], [sx + 28, sy + 22], [sx - 28, sy + 22]], PAL.red, { w: 0.8 }); }
    cyl(0, 0, 210, 34, 34, V.lit ? '#f7e3a0' : '#dfeaee', { cap: PAL.red });
    turn(0, 0, 244, [[38, 0], [10, 22]], PAL.red, { cap: PAL.brick });
  });
  const kp = spot(AT), po = WALK ? { arm: 'hold' } : poseOf(AT);
  put(kp[0] + kp[1] + 40, 0, () => group('id="keeper"', () => {
    const onBed = AT === 'sleep' && !WALK;
    if (po.sit && !onBed) box(kp[0] - 7, kp[1] - 7, 0, 14, 14, 12, { left: PAL.wood, top: PAL.tan, marks: false });
    who(kp[0], kp[1], { shirt: PAL.navy, pants: PAL.slate, hair: 'cap', arm: po.arm, sit: po.sit || 0, hold: po.hold && HOLD[po.hold], look: 1, say: 'The light first. Then me.' }, onBed ? 16 : 0);
    if (onBed) { const [sx, sy] = P(...kp, 16); _text(sx + 18, sy - 74, 'z z', { size: 15, col: LEAD }); }
  }));
  // the foghorn and the lantern climb: the two states off the dial
  const [fx, fy] = pt(13.5, R + 105);
  put(fx + fy, 0, () => group('data-state="foghorn"', () => {
    box(fx - 10, fy - 10, 0, 20, 20, 30, { left: PAL.slate, marks: false });
    turn(fx, fy, 30, [[6, 0], [20, 18]], PAL.mustard, { cap: '#4b4644' });
    out.push('<g class="on">'); const [sx, sy] = P(fx, fy, 60); for (const r of [24, 40]) out.push(`<path d="M${n1(sx - r)} ${n1(sy - r * 0.4)}q${r} ${-r * 0.6} ${r * 2} 0" fill="none" stroke="${RED}" stroke-width="2"/>`); nowTag(sx, sy - 34); out.push('</g>');
  }));
  const [lx, ly] = pt(22.5, R + 50);
  put(lx + ly, 0, () => group('data-state="late_oil"', () => {
    cyl(lx, ly, 0, 7, 20, PAL.red, { cap: PAL.brick });
    turn(lx + 18, ly, 0, [[5, 0], [6, 12], [3, 16]], PAL.mustard, { cap: PAL.bark });
    out.push('<g class="on">'); const [sx, sy] = P(lx, ly, 30); litRing([[sx - 30, sy - 10], [sx + 40, sy - 10], [sx + 40, sy + 34], [sx - 30, sy + 34]]); nowTag(sx, sy - 16); out.push('</g>');
  }));
  flush();
  // the beam, at night: turned by tick
  if (V.lit) group('id="beam"', () => { const [sx, sy] = P(0, 0, 227); out.push(`<path d="M${n1(sx)} ${n1(sy)}L${n1(sx + 420)} ${n1(sy - 70)}L${n1(sx + 420)} ${n1(sy + 30)}Z" fill="#f7e3a0" opacity=".45"/>`); });

  group('id="clock"', () => dial(1250, 300, 44, H * 60));
  title('a clock', 'A lighthouse keeper’s day');
  subtitle('twenty-four hours round the tower, then again');
  status(`${clock(H)}, ${NAMES[AT]}`, `lamp ${V.lit ? 'lit' : 'out'}, oil for ${V.oil} night${V.oil === 1 ? '' : 's'}`);
  SECTORS.forEach(([id, h0, ttl, note], i) => {
    const right = h0 < 12, k = right ? i : 7 - i, [x, y, z] = pt(h0 + 1.5, MID, 20);
    label(right ? 1328 : 72, 420 + k * 175, ttl, note, [x, y, z], right ? 'end' : 'start');
  });
  footnote('Illustrative: one made-up rock light with a paraffin lamp. The tank holds two nights of oil. Sunrise is at six, sunset at twenty, all year, for the picture.');
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(4); ctx.state(AT); };
  // the keeper steps out of his scene to the rim, walks it in one go, the
  // floor hand and the dial with him, and steps into the next scene; the
  // camera keeps him in view
  const go = (to, change = () => {}) => {
    // he stands up to walk
    WALK = true; draw(4); ctx.state(AT);
    const h0 = H, h1 = HOUR[to] + (HOUR[to] < h0 ? 24 : 0), keeper = $('keeper'), handEl = $('hand');
    const s0 = spot(AT), s1 = spot(to), [kx, ky] = P(...s0), ms = Math.max(1600, (h1 - h0) * 520 + 600);
    const ringAt = h => pt(h + 0.6, R - 70), ra = ringAt(h0), rb = ringAt(h1), mix = (p, q, u) => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
    // drawn in depth order he would pass behind the scenes nearer the front,
    // so while he walks the front half he is moved to the top of the picture
    const home = keeper && keeper.nextSibling, art = $('art');
    ctx.track(keeper, 760);
    sweep(ctx, $('clock'), h0 * 60, h1 * 60, ms);
    tween(ctx, ms, k => {
      const h = h0 + (h1 - h0) * Math.min(1, Math.max(0, (k - 0.12) / 0.76));
      const w = k < 0.12 ? mix(s0, ra, k / 0.12) : k > 0.88 ? mix(rb, s1, (k - 0.88) / 0.12) : ringAt(h);
      const [x, y] = P(...w), bob = Math.abs(Math.sin(k * (h1 - h0 + 2) * 5)) * 3, front = w[0] + w[1] > -60;
      if (keeper) {
        keeper.setAttribute('transform', `translate(${n1(x - kx)} ${n1(y - ky - bob)})`);
        if (front && keeper.nextSibling) art.append(keeper);
        else if (!front && home && keeper.nextSibling !== home) home.before(keeper);
      }
      const a = P(...pt(h, 74, 1)), b = P(...pt(h, R - 40, 1)), l = handEl && handEl.querySelector('path'), c = handEl && handEl.querySelector('circle');
      // the drawn handEl is a filled stroke; while it turns it is a plain line
      if (l) { l.setAttribute('d', pathOf([a, b])); l.setAttribute('fill', 'none'); l.setAttribute('stroke', RED); l.setAttribute('stroke-width', '3'); l.setAttribute('stroke-linecap', 'round'); }
      if (c) { c.setAttribute('cx', n1(b[0])); c.setAttribute('cy', n1(b[1])); }
    }, () => { change(); WALK = false; AT = to; H = HOUR[to]; redraw(); ctx.track($('keeper'), 760); });
  };
  const NEXT = { sleep: 'watch', watch: 'dawn', dawn: 'lens', lens: 'radio', radio: 'garden', foghorn: 'garden', garden: 'supper', late_oil: 'night', night: 'sleep' };
  const SAY = {
    watch: 'Three o’clock. Wind the weights, trim the wick.', dawn: 'Six. Sunrise: the lamp goes out, the kettle goes on.',
    lens: 'Nine. The lens gets its cloth, every day.', radio: 'Noon. Wind from the west, sea calm. Into the log.',
    garden: 'Three o’clock. The beans, the goat, the oil store.', supper: 'Six. Supper.', sleep: 'Midnight. Asleep, under the light.',
  };

  ctx.button('next step', () => {
    if (AT === 'foghorn') { ctx.say('The fog lifts. Back to the garden.'); return go('garden'); }
    if (AT === 'supper') {
      if (V.oil > 0) { ctx.say('Sunset. The lamp is lit. One night of oil burns.'); return go('night', () => { V.lit = true; V.oil--; }); }
      ctx.say('Sunset, and the tank is dry. Down to the store and up again, by lantern.');
      return go('late_oil', () => { V.lit = false; });
    }
    if (AT === 'late_oil') { ctx.say('Lit at last, half an hour late.'); V.lit = true; AT = 'night'; return redraw(); }
    const to = NEXT[AT];
    ctx.say(SAY[to] || NAMES[to]);
    go(to, () => { if (to === 'dawn') V.lit = false; });
  });
  ctx.button('fog rolls in', () => {
    if (AT !== 'radio') return ctx.no(AT === 'foghorn' ? 'The horn is going already.' : 'The log says fog only at noon, in this story.');
    ctx.say('Fog from the sea. The horn every thirty seconds.');
    go('foghorn');
  });
  ctx.button('carry oil up', () => {
    if (AT !== 'garden') return ctx.no('The oil store is down in the garden.');
    if (V.oil >= 2) return ctx.no('The tank is full. Two nights of oil is all it holds.');
    V.oil++; redraw(); ctx.hop($('keeper'));
    ctx.say(`One can up the stairs. ${V.oil} nights of oil now.`);
  });
  ctx.hint('Press Play all, or next step. Forget the oil and see.');
  redraw();

  const STORY = ['sleep', 'watch', 'dawn', 'lens', 'radio', 'foghorn', 'garden', 'supper', 'night', 'sleep', 'watch', 'dawn', 'lens', 'radio', 'garden', 'supper', 'late_oil', 'night', 'sleep'];
  return {
    goto(id, play) {
      if (id === 'late_oil') V = { oil: 0, lit: false };
      if (['night', 'sleep', 'watch'].includes(id)) V.lit = true;
      if (['dawn', 'lens', 'radio', 'foghorn', 'garden', 'supper'].includes(id)) V.lit = false;
      ctx.say(NAMES[id] + '.');
      if (play && id !== AT) go(id);
      else { AT = id; H = HOUR[id]; redraw(); }
    },
    tick(t) {
      const boat = $('boat'), beam = $('beam');
      if (boat) boat.setAttribute('transform', `translate(${n1(((t * 30) % 1400) - 700)} 0)`);
      if (beam) { const [sx, sy] = P(0, 0, 227); beam.setAttribute('transform', `rotate(${n1((t * 40) % 360)} ${n1(sx)} ${n1(sy)})`); }
    },
    story: STORY,
  };
}
