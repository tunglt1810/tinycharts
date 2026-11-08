/* Tinycharts kit: lettering. Title, status, margin notes, tags, pills and the
   footnote. Hand lettering is class "it", small capitals "cap", serif "tt". */

let SHEET_W = 1400, SHEET_H = 1400;
const LEAD = '#5c5650', MUTE = '#9a9187';

// Glyph width per font size, measured in Chrome on ordinary words (Gaegu with
// font-size-adjust .5 and the sheet letter-spacing, Young Serif), rounded up.
const _GLYPH = { it: 0.68, cap: 0.84, tt: 0.6 };
function textW(str, size, cls = 'it') { return String(str).length * size * (_GLYPH[cls] || 0.6); }

function _text(x, y, s, { cls = 'it', size = 16, col = INK, anchor = 'start', extra = '' } = {}) {
  out.push(`<text class="${cls}" x="${n1(x)}" y="${n1(y)}" font-size="${size}" fill="${col}"` +
    (anchor === 'start' ? '' : ` text-anchor="${anchor}"`) + (extra ? ' ' + extra : '') + `>${_attr(s)}</text>`);
}

function title(kicker, big, x = 72) {
  if (kicker) _text(x, 112, kicker, { cls: 'cap kicker', size: 16, extra: 'letter-spacing="2"' });
  _text(x - 4, 190, big, { cls: 'tt title', size: 70, extra: 'letter-spacing="-1"' });
}
function subtitle(str, x = 72) { _text(x, 228, str, { size: 21 }); }

function status(big, small) {
  const x = SHEET_W - 72;
  out.push(`<g id="sheetStatus">`);
  _text(x, 134, big, { size: 27, anchor: 'end', extra: 'id="statusBig"' });
  _text(x, 164, small, { size: 18, col: LEAD, anchor: 'end', extra: 'id="statusSmall"' });
  out.push('</g>');
}

// A hand-drawn ring of n points, closed.
function _ring2(c, r, n = 14) {
  const p = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * 2 * Math.PI, k = 1 + (rnd() - 0.5) * 0.08;
    p.push([c[0] + Math.cos(t) * r * k, c[1] + Math.sin(t) * r * k]);
  }
  return p;
}

// Leader from a margin note to a sheet point: a level run, then one slant.
function _leader(a, b) {
  const sx = Math.sign(b[0] - a[0]) || 1, run = Math.abs(b[1] - a[1]) * 0.58, ex = b[0] - sx * run;
  const pts = sx * (ex - a[0]) > 0 ? [a, [ex, a[1]], b] : [a, b];
  line(pts, { w: 1.05, col: LEAD, over: 0, amp: 0.5 });
  const r = _ring2(a, 3.8);
  out.push(`<path d="${pathOf(r, true)}" fill="${PAPER}"/>`);
  line(r, { w: 1, col: LEAD, over: 0, amp: 0.3 });
  out.push(`<circle class="tip" cx="${n1(b[0])}" cy="${n1(b[1])}" r="2.4" fill="${LEAD}"/>`);
}

function label(tx, ty, ttl, note, to, side = 'start') {
  const q = P(...to), s = side === 'start' ? 1 : -1;
  const w = Math.max(textW(ttl, 20, 'cap'), textW(note || '', 17)) + 16;
  out.push(`<g class="note" data-to="${n1(q[0])},${n1(q[1])}">`);
  _leader([tx + s * w, ty + 18], q);
  _text(tx, ty + 24, ttl, { cls: 'cap', size: 20, anchor: side });
  if (note) _text(tx, ty + 48, note, { size: 17, col: LEAD, anchor: side });
  out.push('</g>');
}

function tag(x, y, w, text) {
  const h = 40, c = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  out.push(`<path d="${pathOf(c, true)}" fill="#fffdf6"/>`);
  rim(c, 1.2);
  out.push(`<circle cx="${n1(x + 10)}" cy="${n1(y + 10)}" r="3" fill="${RED}"/>`);
  _text(x + w / 2, y + 27, text, { cls: 'cap', size: 17, anchor: 'middle' });
}

function pill(sx, sy, text, { lit = false } = {}) {
  const size = 15, w = textW(text, size) + 26, h = 28;
  out.push(`<g class="pill${lit ? ' lit' : ''}"><rect x="${n1(sx - w / 2)}" y="${n1(sy - h / 2)}" width="${n1(w)}" height="${h}" rx="${h / 2}"` +
    ` fill="${lit ? '#f6e6e0' : PAPER}" stroke="${lit ? RED : '#c4bbae'}" stroke-width="${lit ? 1.6 : 1.1}"/>`);
  _text(sx, sy + 5, text, { size, col: lit ? INK : MUTE, anchor: 'middle' });
  out.push('</g>');
}

// Lettering laid flat on a plane: on the floor (top) or on a wall face.
function floorText(x, y, z, s, o = {}) { faceText('top', x, y, z, s, o); }
function faceText(face, x, y, z, s, { size = 16, col = INK, cls = 'it', anchor = 'middle', scale = 1 } = {}) {
  out.push(`<g transform="${faceM(face, x, y, z, scale)}">`);
  _text(0, 0, s, { cls, size, col, anchor });
  out.push('</g>');
}

function footnote(str, maxW = 1256) {
  const size = 14.5, lines = [];
  let cur = '';
  for (const word of String(str).split(/\s+/).filter(Boolean)) {
    const next = cur ? cur + ' ' + word : word;
    if (cur && textW(next, size) > maxW) { lines.push(cur); cur = word; } else cur = next;
  }
  if (cur) lines.push(cur);
  const lead = 21, y0 = SHEET_H - 72 - (lines.length - 1) * lead;
  lines.forEach((l, i) => _text(72, y0 + i * lead, l, { cls: 'it foot', size, col: LEAD }));
}
