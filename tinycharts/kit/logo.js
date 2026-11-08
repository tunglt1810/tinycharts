// Logos printed on a face of a solid. The build defines LOGOS (key →
// {viewBox, body, tint?}) before the kit; a sheet with no logos has none.

const _logos = () => (typeof LOGOS === 'undefined' ? {} : LOGOS);
const _f4 = v => String(Math.round(v * 1e4) / 1e4);

// A w by h box on a face, its top-left corner (as seen) at world (x, y, z).
// 'front' is flat to the viewer, with (x, y, z) at the middle of its top edge.
// The logo fits inside it with pad on each side, keeping its shape; with no
// logo, the name is lettered instead. The logo sits on a light plate, so its
// colours read on any face colour.
function logoOn(face, x, y, z, w, h, key, { fallback, pad = 0.08 } = {}) {
  const [e, f] = P(x, y, z);
  out.push(`<g transform="${face === 'front' ? `translate(${n1(e - w / 2)} ${n1(f)})` : faceM(face, x, y, z)}">`);
  _logoFace(w, h, key, fallback, pad);
  out.push('</g>');
}

function _logoFace(w, h, key, fallback, pad = 0.08) {
  const lg = _logos()[key], iw = w * (1 - 2 * pad), ih = h * (1 - 2 * pad);
  if (lg) {
    const [vx, vy, vw, vh] = lg.viewBox, s = Math.min(iw / vw, ih / vh), m = Math.min(w, h) * 0.06;
    const u0 = Math.max(0, (w - vw * s) / 2 - m), v0 = Math.max(0, (h - vh * s) / 2 - m), u1 = w - u0, v1 = h - v0;
    const plate = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
    flat(plate, '#fbf8f1'); rim(plate, 1);
    out.push(`<g transform="translate(${_f4((w - vw * s) / 2)} ${_f4((h - vh * s) / 2)}) scale(${_f4(s)}) translate(${_f4(-vx)} ${_f4(-vy)})"${lg.tint ? ` fill="${lg.tint}"` : ''}>${lg.body}</g>`);
  } else {
    const t = fallback || key, size = Math.min(h * 0.3, iw / textW(t, 1, 'cap'));
    _text(w / 2, h / 2 + size * 0.35, t, { cls: 'cap', size: Math.round(size * 10) / 10, col: INK, anchor: 'middle' });
  }
}

// A logo wrapped round an upright cylinder (centre x, y, radius r), its top
// edge at ztop and its middle at angle mid (radians from +x towards +y).
// SVG cannot bend a drawing, so the logo is drawn once and shown in thin
// vertical strips, each on the plane that touches the curve there.
let _wraps = 0;
function logoWrap(x, y, ztop, r, w, h, key, { fallback, mid = 0.45, strips = 10 } = {}) {
  const n = out.length;
  _logoFace(w, h, key, fallback);
  const body = out.splice(n).join(''), id = `tcwrap${++_wraps}`, du = w / strips, parts = [];
  let clips = '';
  for (let i = 0; i < strips; i++) {
    const um = (i + 0.5) * du, a = mid - (um - w / 2) / r, tx = Math.sin(a), ty = -Math.cos(a);
    const [e, f] = P(x + r * Math.cos(a) - tx * um, y + r * Math.sin(a) - ty * um, ztop);
    clips += `<clipPath id="${id}-${i}"><rect x="${_f4(i * du - 0.2)}" y="-2" width="${_f4(du + 0.4)}" height="${_f4(h + 4)}"/></clipPath>`;
    parts.push(`<g transform="matrix(${_f4(C * (tx - ty))} ${_f4(S * (tx + ty))} 0 1 ${n1(e)} ${n1(f)})"><g clip-path="url(#${id}-${i})"><use href="#${id}"/></g></g>`);
  }
  out.push(`<defs><g id="${id}">${body}</g>${clips}</defs>`, ...parts);
}
