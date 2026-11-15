// Logo SVGs come from the web, so they are data: this file reads them as
// text, keeps only drawing elements, and recolours them to the marker palette.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX = 200 * 1024;
const KEEP = new Set(['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'line', 'defs',
  'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask', 'use', 'title']);

// The palette is read from the kit itself, so there is one list of colours.
export const PAL = (() => {
  const ctx = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'kit', 'core.js'), 'utf8') + ';this.PAL = PAL;', ctx);
  return { ...ctx.PAL };
})();
// Paper is the background and red marks the current state, so logos use neither.
export const PALETTE = (({ paper, red, ...rest }) => rest)(PAL);

const localUrl = v => !/url\(/i.test(v) || [...v.matchAll(/url\(\s*['"]?([^)'"]*)/gi)].every(m => m[1].startsWith('#'));

function cleanStyle(v) {
  return v.split(';').map(d => d.trim()).filter(d => d && localUrl(d) && !/expression|@import|javascript:/i.test(d)).join(';');
}

function cleanAttrs(raw) {
  const out = [];
  for (const m of raw.matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    const name = m[1], low = name.toLowerCase();
    let v = m[2] ?? m[3];
    if (low.startsWith('on')) continue;
    if ((low === 'href' || low === 'xlink:href') && !v.startsWith('#')) continue;
    if (low === 'style') { v = cleanStyle(v); if (!v) continue; }
    else if (!localUrl(v) || /javascript:/i.test(v)) continue;
    out.push(` ${name}="${v.replace(/"/g, '&quot;')}"`);
  }
  return out.join('');
}

// Many logos colour their shapes by class in a <style> block. The block
// itself is dropped, so simple class rules are written onto the elements.
const PAINT = /^(fill|stroke|stroke-width|opacity|fill-opacity|stroke-opacity|fill-rule|stop-color)$/;
function classRules(s) {
  const rules = {};
  for (const [, css] of s.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const [, sel, body] of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      // a value goes into style="…", so a quote or a bracket could end the attribute
      const decls = body.split(';').map(d => d.trim()).filter(d => PAINT.test(d.split(':')[0].trim()) && localUrl(d) && !/["'<>&`\\]/.test(d));
      for (const c of sel.split(',').map(x => x.trim()).filter(x => /^\.[\w-]+$/.test(x))) rules[c.slice(1)] = [...(rules[c.slice(1)] || []), ...decls];
    }
  }
  return rules;
}

export function sanitizeSvg(src, name) {
  if (Buffer.byteLength(src) > MAX) throw new Error(`${name}: larger than 200 KB`);
  const s = src.replace(/<!--[\s\S]*?-->/g, '').replace(/<\?[\s\S]*?\?>/g, '').replace(/<!DOCTYPE[\s\S]*?>/gi, '').replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
  if (!/^\s*<svg[\s>]/.test(s)) throw new Error(`${name}: not an SVG`);
  const out = [], rules = classRules(s);
  let skip = 0;
  for (const m of s.matchAll(/<(\/?)([a-zA-Z][\w:.-]*)([^>]*?)(\/?)>|([^<]+)/g)) {
    const [, close, tag, attrs, self, text] = m;
    if (text !== undefined) { if (!skip && /^\s*$/.test(text)) out.push(text); continue; }
    if (skip) {
      if (!self) skip += close ? -1 : 1;
      continue;
    }
    if (tag === 'a') continue; // a link wrapper goes, what it wraps stays
    if (!KEEP.has(tag)) { if (!close && !self) skip = 1; continue; }
    let at = close ? '' : cleanAttrs(attrs);
    const cls = !close && (at.match(/ class="([^"]*)"/) || [])[1];
    const paint = cls ? cls.split(/\s+/).flatMap(c => rules[c] || []) : [];
    if (paint.length) {
      const own = (at.match(/ style="([^"]*)"/) || [])[1];
      at = at.replace(/ style="[^"]*"/, '') + ` style="${[...paint, ...(own ? [own] : [])].join(';')}"`;
    }
    out.push(close ? `</${tag}>` : `<${tag}${at}${self ? '/' : ''}>`);
  }
  return out.join('').trim();
}

// ---- colour: nearest palette colour in Lab
const hex6 = c => (c.length === 4 ? '#' + [...c.slice(1)].map(x => x + x).join('') : c).toLowerCase();
function lab(c) {
  const h = hex6(c), rgb = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(v => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92));
  const [X, Y, Z] = [[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]
    .map((r, i) => (r[0] * rgb[0] + r[1] * rgb[1] + r[2] * rgb[2]) / [0.95047, 1, 1.08883][i]);
  const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}

export function recolor(svg, pal) {
  const cols = Object.values(pal).map(c => [c, lab(c)]);
  const near = raw => {
    const c = /^white$/i.test(raw) ? '#ffffff' : /^black$/i.test(raw) ? '#000000' : raw, [L, a, b] = lab(c);
    if (L > 95 && pal.cream) return pal.cream;
    if (L < 15 && pal.ink) return pal.ink;
    let best = cols[0][0], d = Infinity;
    for (const [p, [L2, a2, b2]] of cols) { const e = (L - L2) ** 2 + (a - a2) ** 2 + (b - b2) ** 2; if (e < d) { d = e; best = p; } }
    return best;
  };
  const COL = '(#[0-9a-fA-F]{6}\\b|#[0-9a-fA-F]{3}\\b|white\\b|black\\b)';
  return svg
    .replace(new RegExp(`((?:fill|stroke|stop-color|color)\\s*=\\s*")${COL}`, 'gi'), (_, k, c) => k + near(c))
    .replace(new RegExp(`((?:fill|stroke|stop-color)\\s*:\\s*)${COL}`, 'gi'), (_, k, c) => k + near(c));
}

export function toLogo(svg, name) {
  const root = svg.match(/^\s*<svg([^>]*)>/);
  const attr = k => (root && root[1].match(new RegExp(`\\s${k}="([^"]*)"`)) || [])[1];
  let vb = attr('viewBox') && attr('viewBox').trim().split(/[\s,]+/).map(Number);
  if (!vb || vb.length !== 4 || vb.some(Number.isNaN)) {
    const w = parseFloat(attr('width')), h = parseFloat(attr('height'));
    if (!(w > 0 && h > 0)) throw new Error(`${name}: no viewBox or size`);
    vb = [0, 0, w, h];
  }
  const body = svg.replace(/^\s*<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    .replace(/\sid="([^"]+)"/g, (_, id) => ` id="${name}-${id}"`)
    .replace(/(href=")#([^"]+)"/g, (_, k, id) => `${k}#${name}-${id}"`)
    .replace(/url\(\s*#([^)\s]+)\s*\)/g, (_, id) => `url(#${name}-${id})`);
  return { viewBox: vb, body: body.trim() };
}
