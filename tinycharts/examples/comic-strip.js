// A lost umbrella finds its way home, as a comic page: nine panels read left
// to right, top to bottom. Each panel is a state; panel 6 is the detour.
const ABOUT = 'a story, one panel at a time';
const COLS = [[72, 486], [506, 902], [922, 1328]], ROWS = [[262, 566], [588, 892], [914, 1218]];
const IDS = ['left', 'depot', 'office', 'rain', 'counter', 'wrong', 'found', 'walk', 'home'];
const CAPS = {
  left: 'The sun comes out. Off the bus.', depot: 'Night. The cleaner finds it.', office: 'Lost property. Ticket 47.',
  rain: 'Next day: rain. The hook is empty.', counter: 'Lost property opens at nine.', wrong: 'Not that one.',
  found: 'A duck on the handle. Ticket 47.', walk: 'Home, dry this time.', home: 'Back on its hook.',
};
const NAMES = {
  left: 'left on the bus', depot: 'the depot at night', office: 'lost property', rain: 'rain, no umbrella', counter: 'at the counter',
  wrong: 'not that one', found: 'the right one', walk: 'home under it', home: 'on its hook',
};
const UMB = '#c0473a';
let AT = 'left';
let V = { open: false, described: false };

// a panel's frame: a little skewed, like a hand-ruled page
function frame(id) {
  const i = IDS.indexOf(id), [x0, x1] = COLS[i % 3], [y0, y1] = ROWS[Math.floor(i / 3)], k = (i * 7) % 5 - 2;
  return [[x0, y0 + k], [x1, y0 - k], [x1 - k, y1], [x0 + k, y1]];
}
const mid = id => { const f = frame(id); return [(f[0][0] + f[1][0]) / 2, (f[0][1] + f[3][1]) / 2]; };

// the umbrella: closed (a spindle) or open (a dome), with a duck on the handle
function umbrella(sx, sy, { open = false, s = 1, col = UMB, duck = true, tilt = 0 } = {}) {
  out.push(`<g transform="translate(${n1(sx)} ${n1(sy)}) rotate(${tilt}) scale(${s})">`);
  if (open) {
    const dome = [[-46, 0]];
    for (let k = 0; k <= 16; k++) { const a = Math.PI * (1 - k / 16); dome.push([46 * Math.cos(a), -30 * Math.sin(a) - 4]); }
    dome.push([46, 0]);
    for (let k = 3; k >= -3; k--) dome.push([k * 46 / 3.5 + (k > 0 ? -6 : 6), k % 2 ? 4 : 0]);
    shape(dome, col, { w: 1.2 });
    line([[0, -34], [0, 52]], { w: 1.8, over: 0 });
    line([[-15, -30], [-9, -2]], { w: 0.7, col: shadeOf(col), over: 0 }); line([[15, -30], [9, -2]], { w: 0.7, col: shadeOf(col), over: 0 });
  } else {
    shape([[0, -46], [7, -6], [5, 18], [-5, 18], [-7, -6]], col, { w: 1.1 });
    line([[0, -54], [0, -46]], { w: 1.4, over: 0 }); line([[0, 18], [0, 30]], { w: 1.6, over: 0 });
  }
  const hy = open ? 52 : 30;
  if (duck) { shape(oval(4, hy + 5, 7, 6, 14), PAL.mustard, { w: 0.9 }); shape([[10, hy + 3], [17, hy + 5], [10, hy + 7]], '#e39b5a', { w: 0.6 }); out.push(`<circle cx="5.5" cy="${hy + 3}" r="1" fill="${INK}"/>`); }
  else line(spline([[0, hy], [0, hy + 8], [-8, hy + 10], [-10, hy + 4]], false, 2), { w: 1.8, over: 0 });
  out.push('</g>');
}

function bubble(x, y, text, tx, ty) {
  const w = textW(text, 16) + 26, h = 34;
  out.push(`<path d="${pathOf([[x - 8, y + h / 2 - 2], [tx, ty], [x + 8, y + h / 2 - 2]], true)}" fill="#fffdf6" stroke="${INK}" stroke-width="1"/>`);
  out.push(`<rect x="${n1(x - w / 2)}" y="${n1(y - h / 2)}" width="${n1(w)}" height="${h}" rx="16" fill="#fffdf6" stroke="${INK}" stroke-width="1.1"/>`);
  out.push(`<rect x="${n1(x - 9)}" y="${n1(y + h / 2 - 3)}" width="18" height="4" fill="#fffdf6"/>`);
  _text(x, y + 6, text, { size: 16, anchor: 'middle' });
}

function rain(x0, y0, x1, y1, n = 40) {
  rule(Array.from({ length: n }, () => { const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0); return [[x, y], [x - 5, y + 14]]; }), '#7f9bb8', 0.9);
}

// walls: back right (plane y = 0) and back left (plane x = 0), a world units long
function room(a, h, wallR, wallL, floor) {
  flat([P(0, 0), P(a, 0), P(a, a), P(0, a)], floor);
  flat([P(0, 0, 0), P(a, 0, 0), P(a, 0, h), P(0, 0, h)], wallR);
  flat([P(0, 0, 0), P(0, a, 0), P(0, a, h), P(0, 0, h)], wallL);
  rule([[P(0, 0, 0), P(0, 0, h)], [P(0, 0, 0), P(a, 0, 0)], [P(0, 0, 0), P(0, a, 0)]], INK, 0.9);
}
const winR = (x, z, w, h, col = '#cfe0ea') => { const q = [P(x, 0, z), P(x + w, 0, z), P(x + w, 0, z + h), P(x, 0, z + h)]; flat(q, col); rim(q, 0.9); return q; };
const winL = (y, z, w, h, col = '#cfe0ea') => { const q = [P(0, y, z), P(0, y + w, z), P(0, y + w, z + h), P(0, y, z + h)]; flat(q, col); rim(q, 0.9); return q; };

const SCENES = {
  left() {
    room(230, 120, '#dfe6e2', '#d3dbd6', '#b9bfc9');
    for (const x of [20, 90, 160]) { const q = winR(x, 50, 54, 50); clipped(q, () => out.push(`<circle cx="${n1(P(x + 40, 0, 88)[0])}" cy="${n1(P(x + 40, 0, 88)[1])}" r="14" fill="${PAL.mustard}"/>`)); }
    winL(30, 50, 60, 50); winL(120, 50, 60, 50);
    for (const x of [40, 100, 160]) for (const y of [30, 120]) put(x + y, 0, () => { box(x, y, 0, 28, 56, 24, { left: PAL.navy, top: PAL.blue, marks: false }); box(x, y, 24, 7, 56, 28, { left: PAL.navy, top: PAL.blue, marks: false }); });
    put(220, 1, () => { const [sx, sy] = P(100, 120, 60); group('class="lost"', () => umbrella(sx + 6, sy + 4, { s: 0.8, tilt: -8 })); });
    put(300, 0, () => who(190, 200, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'wave', look: 1, say: 'Sun! Lovely.' }));
    put(150, 0, () => who(60, 90, { shirt: PAL.sage, pants: PAL.slate, hair: 'short', sit: 1, look: 1 }));
    put(260, 0, () => who(160, 110, { shirt: PAL.rose, pants: PAL.bark, hair: 'long', sit: 1, look: -1, kid: true }));
    put(210, 0, () => cyl(140, 80, 0, 3, 110, PAL.grey));
    flush();
    bubble(...P(196, 200, 112), 'Sun at last!', ...P(196, 200, 82));
  },
  depot() {
    room(240, 130, '#3d4462', '#353b57', '#4a4f62');
    for (const x of [20, 120]) winR(x, 70, 70, 44, '#202640');
    put(80, 0, () => { box(30, 50, 0, 170, 70, 64, { left: PAL.mustard, top: '#f3e3a8', marks: false }); for (let k = 0; k < 5; k++) windowL(40 + k * 30, 120, 30, 20, 18); });
    put(260, 0, () => who(170, 170, { shirt: PAL.sky, pants: PAL.navy, hair: 'cap', arm: 'hold', look: -1 }));
    put(270, 1, () => { const [sx, sy] = P(170, 170, 40); umbrella(sx - 24, sy - 10, { s: 0.75, tilt: 30 }); });
    put(250, 0, () => { const [a, b] = [P(200, 150, 0), P(215, 120, 60)]; line([a, b], { w: 2, col: PAL.bark, over: 0 }); shape([[a[0] - 10, a[1]], [a[0] + 10, a[1]], [a[0] + 6, a[1] + 8], [a[0] - 6, a[1] + 8]], PAL.mustard, { w: 0.8 }); });
    put(300, 0, () => cyl(30, 200, 0, 12, 22, PAL.grey, { cap: PAL.slate }));
    flush();
    const [lx, ly] = P(120, 0, 128); out.push(`<path d="M${n1(lx)} ${n1(ly)}L${n1(lx - 90)} ${n1(ly + 170)}L${n1(lx + 90)} ${n1(ly + 170)}Z" fill="#fff6c8" opacity=".18"/>`);
    out.push(`<circle cx="${n1(lx)}" cy="${n1(ly)}" r="5" fill="#fff6c8"/>`);
    bubble(...P(170, 170, 128), 'A duck? Lost property.', ...P(170, 170, 98));
  },
  office() {
    room(230, 130, '#e8dcc6', '#ddd0b8', '#cbbfa8');
    put(60, 0, () => {
      box(10, 4, 0, 200, 34, 110, { left: PAL.wood, top: PAL.tan, marks: false });
      const items = [[20, 82, 'box', PAL.sky], [52, 82, 'hat', PAL.navy], [92, 82, 'box', PAL.rose], [132, 82, 'teddy', PAL.wood], [168, 82, 'box', PAL.sage],
        [24, 44, 'glove', PAL.brick], [60, 44, 'box', PAL.butter], [100, 44, 'bag', PAL.lilac], [140, 44, 'box', PAL.stone], [176, 44, 'hat', PAL.brick], [30, 6, 'box', PAL.mint], [90, 6, 'bag', PAL.sky], [150, 6, 'box', PAL.rose]];
      for (const [x, z, kind, col] of items) {
        if (kind === 'box') box(x, 40, z, 22, 18, 16, { left: col, marks: false });
        else if (kind === 'hat') { cyl(x + 10, 50, z, 12, 3, col); cyl(x + 10, 50, z + 3, 7, 10, col); }
        else if (kind === 'teddy') { const [sx, sy] = P(x + 10, 50, z); shape(blob(sx, sy - 10, 10, 10), col); shape(oval(sx, sy - 24, 7, 7, 14), col); }
        else if (kind === 'glove') { const [sx, sy] = P(x + 10, 50, z); shape(blob(sx, sy - 6, 9, 6), col); }
        else { const [sx, sy] = P(x + 10, 50, z); shape([[sx - 10, sy], [sx + 10, sy], [sx + 8, sy - 16], [sx - 8, sy - 16]], col, { w: 0.9 }); }
      }
    });
    put(150, 0, () => { turn(30, 150, 0, [[14, 0], [14, 30]], PAL.slate, { wall: 2, cap: '#5c5650' }); });
    put(151, 0, () => { const [sx, sy] = P(30, 150, 30); for (const [dx, c, t] of [[-6, INK, -10], [4, PAL.navy, 6], [10, '#3d6b4f', 14]]) umbrella(sx + dx, sy - 26, { s: 0.6, col: c, duck: false, tilt: t }); });
    put(250, 0, () => box(110, 130, 0, 90, 40, 40, { left: PAL.wood, top: PAL.tan, marks: false }));
    put(240, 0, () => who(150, 90, { shirt: PAL.lilac, pants: PAL.slate, hair: 'bun', arm: 'hold', look: 1 }));
    put(260, 1, () => { const [sx, sy] = P(140, 150, 40); umbrella(sx, sy - 6, { s: 0.8, tilt: 80 }); });
    flush();
    const [tx, ty] = P(140, 150, 40);
    out.push(`<rect x="${n1(tx + 34)}" y="${n1(ty - 30)}" width="34" height="20" fill="#fffdf6" stroke="${INK}" stroke-width=".9" transform="rotate(8 ${n1(tx + 34)} ${n1(ty - 30)})"/>`);
    _text(tx + 52, ty - 15, '47', { size: 14, col: RED, anchor: 'middle' });
  },
  rain() {
    room(230, 130, '#efe3cf', '#e4d6bf', '#d6c2a2');
    const q = winR(60, 40, 110, 76, '#a9b9c9');
    clipped(q, () => rain(q[3][0] - 20, q[3][1] - 10, q[1][0] + 10, q[1][1] + 90, 50));
    rule([[P(115, 0, 40), P(115, 0, 116)], [P(60, 0, 78), P(170, 0, 78)]], INK, 1);
    put(30, 0, () => { box(60, 4, 36, 110, 18, 6, { left: PAL.wood, top: PAL.tan, marks: false }); cat(130, 12, 42, '#e3c77a'); });
    // the empty hook, by the door
    const [hx, hy] = P(0, 170, 96);
    line([[hx, hy], [hx + 10, hy + 6]], { w: 2.4, over: 0 });
    out.push(`<path d="M${n1(hx + 10)} ${n1(hy + 8)}v60" stroke="${RED}" stroke-width="1.4" stroke-dasharray="4 4" fill="none"/>`);
    doorL(0, 190, 0, 34, 90, PAL.brick);
    put(260, 0, () => who(130, 110, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'up', look: -1 }));
    put(280, 0, () => box(160, 160, 0, 40, 40, 30, { left: PAL.sage, top: PAL.mint, marks: false }));
    flush();
    bubble(...P(130, 110, 120), 'My umbrella!', ...P(130, 110, 92));
  },
  counter() {
    room(230, 130, '#e8dcc6', '#ddd0b8', '#cbbfa8');
    put(40, 0, () => box(10, 4, 0, 200, 30, 90, { left: PAL.wood, top: PAL.tan, marks: false }));
    put(120, 0, () => who(110, 60, { shirt: PAL.lilac, pants: PAL.slate, hair: 'bun', arm: 'out', look: 1 }));
    put(160, 0, () => box(40, 90, 0, 160, 36, 46, { left: PAL.wood, top: PAL.tan, marks: false }));
    put(270, 0, () => who(130, 150, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'out', look: -1 }));
    put(330, 0, () => who(236, 176, { shirt: PAL.sage, pants: PAL.bark, hair: 'cap', arm: 'hold', look: -1 }));
    put(200, 0, () => { const [sx, sy] = P(130, 150); out.push(`<ellipse cx="${n1(sx)}" cy="${n1(sy + 4)}" rx="22" ry="6" fill="#a9c4d6" opacity=".8"/>`); });
    flush();
    const [gx, gy] = P(124, 0, 86), sw = textW('LOST PROPERTY', 13, 'cap') + 18;
    rule([[[gx - sw / 3, gy - 30], [gx - sw / 3, gy - 12]], [[gx + sw / 3, gy - 30], [gx + sw / 3, gy - 12]]], INK, 0.9);
    out.push(`<rect x="${n1(gx - sw / 2)}" y="${n1(gy - 12)}" width="${n1(sw)}" height="24" fill="#fffdf6" stroke="${INK}" stroke-width="1.1"/>`);
    _text(gx, gy + 5, 'LOST PROPERTY', { size: 13, cls: 'cap', anchor: 'middle', col: RED });
    bubble(...P(130, 150, 118), 'A red umbrella?', ...P(130, 150, 90));
  },
  wrong() {
    room(230, 130, '#e8dcc6', '#ddd0b8', '#cbbfa8');
    put(40, 0, () => box(10, 4, 0, 200, 30, 90, { left: PAL.wood, top: PAL.tan, marks: false }));
    put(160, 0, () => box(40, 90, 0, 160, 36, 46, { left: PAL.wood, top: PAL.tan, marks: false }));
    put(120, 0, () => who(110, 60, { shirt: PAL.lilac, pants: PAL.slate, hair: 'bun', arm: 'out', look: 1 }));
    put(170, 1, () => { const [sx, sy] = P(120, 100, 46); umbrella(sx + 10, sy - 6, { s: 0.8, col: '#3b3a3c', duck: false, tilt: 80 }); });
    put(270, 0, () => who(130, 150, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'up', look: -1 }));
    flush();
    bubble(...P(150, 170, 150), 'Mine has a duck.', ...P(130, 150, 92));
  },
  found() {
    room(230, 130, '#e8dcc6', '#ddd0b8', '#cbbfa8');
    put(40, 0, () => box(10, 4, 0, 200, 30, 90, { left: PAL.wood, top: PAL.tan, marks: false }));
    put(160, 0, () => box(40, 90, 0, 160, 36, 46, { left: PAL.wood, top: PAL.tan, marks: false }));
    put(120, 0, () => who(110, 60, { shirt: PAL.lilac, pants: PAL.slate, hair: 'bun', arm: 'out', look: 1 }));
    put(270, 0, () => who(130, 150, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'hold', look: -1 }));
    put(280, 1, () => { const [sx, sy] = P(130, 150, 40); umbrella(sx - 22, sy - 14, { s: 0.8, tilt: -12 }); });
    put(300, 0, () => dog(190, 140, 0, '#c9a36a'));
    flush();
    bubble(...P(130, 150, 124), 'That one!', ...P(130, 150, 96));
  },
  walk() {
    flat([P(-40, 0), P(260, 0), P(260, 240), P(-40, 240)], '#cfd3d6');
    flat([P(-40, 150), P(260, 150), P(260, 240), P(-40, 240)], '#9ea4aa');
    rule([[P(-40, 150), P(260, 150)]], INK, 0.9);
    rule([0, 1, 2, 3].map(k => [P(-20 + k * 70, 196), P(10 + k * 70, 196)]), '#f3ead8', 2.4);
    put(40, 0, () => { gable(20, -60, 90, 50, 70, 30, { wall: PAL.rose, roof: PAL.brick }); });
    put(120, 0, () => gable(130, -60, 90, 50, 60, 26, { wall: PAL.sky, roof: PAL.slate }));
    put(100, 0, () => tree(60, 40, 22));
    put(170, 0, () => cyl(200, 40, 0, 3, 100, PAL.slate, { cap: PAL.butter }));
    put(230, 0, () => who(120, 100, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', arm: 'hold', look: 1 }));
    put(231, 1, () => { const [sx, sy] = P(120, 100, 52); umbrella(sx + 4, sy - 26, { open: true, s: 0.75 }); });
    put(250, 0, () => dog(150, 110, 0, '#c9a36a'));
    put(200, 0, () => who(30, 160, { shirt: PAL.sage, pants: PAL.slate, hair: 'short', arm: 'hold', look: -1 }));
    put(201, 1, () => { const [sx, sy] = P(30, 160, 52); umbrella(sx - 2, sy - 26, { open: true, s: 0.65, col: PAL.navy, duck: false }); });
    put(10, 0, () => { const [sx, sy] = P(170, 70); out.push(`<ellipse cx="${n1(sx)}" cy="${n1(sy)}" rx="26" ry="7" fill="#a9c4d6"/>`); });
    flush();
    const f = frame('walk'); rain(f[0][0], f[0][1] + 10, f[1][0], f[2][1], 70);
  },
  home() {
    room(230, 130, '#efe3cf', '#e4d6bf', '#d6c2a2');
    doorL(0, 150, 0, 40, 96, PAL.brick);
    const [hx, hy] = P(0, 110, 100);
    line([[hx, hy], [hx + 10, hy + 6]], { w: 2.4, over: 0 });
    group('class="home-umb"', () => umbrella(hx + 10, hy + 50, { s: 0.8 }));
    for (const d of [0, 10, 20]) out.push(`<circle cx="${n1(hx + 10)}" cy="${n1(hy + 86 + d)}" r="2" fill="#7f9bb8"/>`);
    out.push(`<ellipse cx="${n1(hx + 10)}" cy="${n1(hy + 112)}" rx="16" ry="4" fill="#a9c4d6"/>`);
    const q = winR(110, 50, 80, 56, '#dfeef2'); clipped(q, () => out.push(`<circle cx="${n1(P(170, 0, 92)[0])}" cy="${n1(P(170, 0, 92)[1])}" r="12" fill="${PAL.mustard}"/>`));
    put(220, 0, () => box(140, 90, 0, 40, 40, 26, { left: PAL.sage, top: PAL.mint, marks: false }));
    put(240, 0, () => who(150, 110, { shirt: PAL.mustard, pants: PAL.navy, hair: 'bob', sit: 1, arm: 'hold', look: -1 }));
    put(270, 0, () => cat(120, 170, 0, '#e3c77a'));
    put(200, 0, () => { box(60, 60, 0, 40, 30, 30, { left: PAL.wood, top: PAL.tan, marks: false }); turn(80, 75, 30, [[5, 0], [6, 9]], '#fffdf6', { cap: '#8a6a4f' }); });
    flush();
  },
};

function panel(id, faint) {
  const f = frame(id), [x0, y0] = f[0], i = IDS.indexOf(id);
  group(`data-state="${id}"`, () => {
    if (faint) out.push('<g opacity=".42">');
    fill(f, id === 'depot' ? '#3a405c' : '#f6efe0', { amp: 0.2 });
    clipped(f, () => {
      OX = mid(id)[0] + 6; OY = y0 + 92;
      SCENES[id]();
      OX = 700; OY = 0;
    });
    rim(f, 1.8);
    // the caption box, top left
    const w = textW(CAPS[id], 15) + 44;
    out.push(`<rect x="${n1(x0 + 10)}" y="${n1(y0 + 10)}" width="${n1(w)}" height="30" fill="#fffdf6" stroke="${INK}" stroke-width="1"/>`);
    _text(x0 + 22, y0 + 31, String(i + 1), { size: 15, col: RED });
    _text(x0 + 38, y0 + 31, CAPS[id], { size: 15 });
    if (faint) out.push('</g>');
    out.push('<g class="on">');
    line([...f, f[0], f[1]], { w: 4, col: RED, amp: 0.4, over: 0 });
    nowTag(f[1][0] - 34, f[1][1] - 6);
    out.push('</g>');
  });
}

// the red route through the gutters, panel to panel, with the detour
function gutters() {
  const g = (a, b, dashed = false) => flowArrow([a, b], { dashed, w: 2 });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
    const y = (ROWS[r][0] + ROWS[r][1]) / 2 + 60, x = (COLS[c][1] + COLS[c + 1][0]) / 2;
    if (IDS[r * 3 + c] === 'counter') continue;
    g([x - 8, y], [x + 10, y]);
  }
  // end of a row to the start of the next
  for (const r of [0, 1]) {
    const y = (ROWS[r][1] + ROWS[r + 1][0]) / 2;
    if (r === 1) continue;
    out.push(`<path d="M${COLS[2][0] + 200} ${y}H${COLS[0][0] + 200}" fill="none" stroke="${RED}" stroke-width="2" stroke-dasharray="1 7" stroke-linecap="round"/>`);
  }
  // counter: ask for it, to 6 if the duck is not described, or down to 7 if it is
  const cy = (ROWS[1][0] + ROWS[1][1]) / 2 + 60, gx = (COLS[1][1] + COLS[2][0]) / 2;
  g([gx - 8, cy], [gx + 10, cy]);
  const by = (ROWS[1][1] + ROWS[2][0]) / 2;
  flowArrow([[COLS[1][0] + 60, ROWS[1][1] - 2], [COLS[1][0] + 60, by], [COLS[0][0] + 200, by], [COLS[0][0] + 200, ROWS[2][0] + 2]], { w: 2 });
  flowArrow([[COLS[2][0] + 120, ROWS[1][1] + 2], [COLS[2][0] + 120, by + 2], [COLS[1][0] + 260, by + 2], [COLS[1][0] + 260, ROWS[1][1] + 4]], { dashed: true, w: 2 });
}

function draw(seed) {
  begin(seed);
  OX = 700; OY = 0;
  const now = IDS.indexOf(AT);
  for (const id of IDS) panel(id, IDS.indexOf(id) > now);
  gutters();
  group('id="token"', () => { const f = frame(AT); umbrella(f[2][0] - 26, f[2][1] - 44, { s: 0.42 }); });
  title('a comic strip', 'The lost umbrella');
  subtitle('nine panels, one red umbrella with a duck on the handle');
  status(NAMES[AT], `office ${V.open ? 'open' : 'shut'} · duck handle ${V.described ? 'described' : 'not said'}`);
  const by = (ROWS[1][1] + ROWS[2][0]) / 2;
  for (const [x, t] of [[COLS[0][0] + 268, '[duck described]'], [(COLS[1][0] + COLS[2][0] + 380) / 2, 'give it back']]) {
    out.push(`<rect x="${n1(x - textW(t, 13) / 2 - 6)}" y="${n1(by - 9)}" width="${n1(textW(t, 13) + 12)}" height="18" fill="${PAPER}"/>`);
    _text(x, by + 5, t, { size: 13, col: RED, anchor: 'middle' });
  }
  footnote('Illustrative: a made-up bus company and its lost property office, open from nine.');
  finish();
}

function init(ctx) {
  const $ = id => document.getElementById(id);
  const redraw = () => { draw(20); ctx.state(AT); };
  const go = (to, change = () => {}) => {
    const a = frame(AT), b = frame(to), A = at(a[2][0] - 26, a[2][1] - 44), B = at(b[2][0] - 26, b[2][1] - 44);
    const via = IDS.indexOf(to) === IDS.indexOf(AT) + 1 && Math.floor(IDS.indexOf(to) / 3) !== Math.floor(IDS.indexOf(AT) / 3) ? [A, at(a[2][0] - 26, a[3][1] + 10), at(b[0][0] + 40, b[0][1] - 10), B] : [A, B];
    // the camera rides with the umbrella, then closes in on the new panel as it comes in
    walk(ctx, $('token'), via.map(p => [...p, 0]), { ms: via.length > 2 ? 2600 : 1700, follow: 980, then: () => {
      change(); AT = to; crossfade(ctx, redraw, 800);
      ctx.focus(...mid(to), 2.3);
    } });
  };
  const NEXT = { left: 'depot', depot: 'office', office: 'rain', found: 'walk', walk: 'home' };
  ctx.button('next step', () => {
    if (AT === 'rain') {
      if (!V.open) return ctx.no('Half past eight. The office opens at nine.');
      ctx.say(CAPS.counter); return go('counter');
    }
    if (AT === 'counter') return ctx.no('Ask for it, and say what it looks like.');
    if (AT === 'wrong') { ctx.say('Back over the counter it goes.'); return go('counter'); }
    if (AT === 'home') { ctx.say('Another day. Another bus.'); return go('left', () => { V = { open: false, described: false }; }); }
    const to = NEXT[AT]; ctx.say(CAPS[to]); go(to);
  });
  ctx.button('wait for nine', () => {
    if (AT !== 'rain') return ctx.no(AT === 'counter' ? 'It is open. Ask.' : 'Nothing to wait for here.');
    if (V.open) return ctx.no('Nine o’clock already. Go.');
    V.open = true; crossfade(ctx, redraw); ctx.say('Nine o’clock. The shutter goes up.');
  });
  ctx.button('describe the handle', () => {
    if (AT !== 'counter') return ctx.no('Say it at the lost property counter.');
    if (V.described) return ctx.no('She heard. A duck, yellow, on the handle.');
    V.described = true; crossfade(ctx, redraw); ctx.say('“Red, with a yellow duck on the handle.”');
  });
  ctx.button('ask for it', () => {
    if (AT !== 'counter') return ctx.no(AT === 'wrong' ? 'Give this one back first.' : 'Ask at the lost property counter.');
    if (!V.described) { ctx.say('“A red umbrella?” She has six. She picks one.'); return go('wrong'); }
    ctx.say('Ticket 47. Red, with a duck.'); go('found');
  });
  ctx.hint('Press Play all, or next step. Ask before you describe it, and see.');
  redraw();

  const STORY = ['left', 'depot', 'office', 'rain', 'counter', 'wrong', 'counter', 'found', 'walk', 'home'];
  let si = 0;
  return {
    goto(id, play) {
      let j = play ? STORY.indexOf(id, si + 1) : -1;
      if (j < 0) j = STORY.indexOf(id);
      si = j;
      V = { open: j >= 4, described: j >= 6 };
      ctx.say(CAPS[id]);
      if (play && id !== AT) go(id);
      else { AT = id; redraw(); }
    },
    tick(t) {
      const u = document.querySelector('.home-umb');
      if (u) u.setAttribute('transform', `rotate(${n1(Math.sin(t * 1.4) * 2)} ${n1(+u.getBBox?.().x || 0)} 0)`);
    },
    story: STORY,
  };
}
