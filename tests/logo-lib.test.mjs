import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { sanitizeSvg, recolor, toLogo, PALETTE } from '../tinycharts/build/logo-lib.mjs';

const nasty = fs.readFileSync('tests/fixtures/logos/nasty.svg', 'utf8');
const wide = fs.readFileSync('tests/fixtures/logos/wide.svg', 'utf8');
const colours = s => [...s.matchAll(/(?:fill|stroke|stop-color)\s*[:=]\s*"?\s*(#[0-9a-fA-F]{3,6})/g)].map(m => m[1].toLowerCase());

test('sanitize drops scripts, handlers and foreign content', () => {
  const s = sanitizeSvg(nasty, 'nasty');
  assert.doesNotMatch(s, /<script/i);
  assert.doesNotMatch(s, /\son\w+\s*=/i);
  assert.doesNotMatch(s, /<foreignObject|<div|<image|<a[\s>]/i);
  assert.match(s, /<path d="M0 0h10v10z"/);
});

test('sanitize drops outside links and keeps local ones', () => {
  const s = sanitizeSvg(nasty, 'nasty');
  assert.doesNotMatch(s, /evil\.example/);
  assert.match(s, /href="#g"/);
});

test('sanitize drops url() that is not local', () => {
  const s = sanitizeSvg(nasty, 'nasty');
  assert.match(s, /fill="url\(#g\)"/);
  assert.doesNotMatch(s, /url\(http/);
});

test('sanitize refuses a non-SVG and a file over 200 KB', () => {
  assert.throws(() => sanitizeSvg('<html><body>404</body></html>', 'x'), /^Error: x: not an SVG$/);
  assert.throws(() => sanitizeSvg('<svg>' + ' '.repeat(200 * 1024) + '</svg>', 'big'), /big: larger than 200 KB/);
});

test('recolor maps every colour to the nearest palette colour', () => {
  const s = recolor(sanitizeSvg(nasty, 'nasty'), PALETTE);
  const all = colours(s), pal = new Set(Object.values(PALETTE).map(c => c.toLowerCase()));
  assert.ok(all.length >= 5, all.join());
  for (const c of all) assert.ok(pal.has(c), `${c} is in the palette`);
  assert.match(s, new RegExp(`fill="${PALETTE.cream}"`, 'i'), 'white becomes cream');
  assert.match(s, new RegExp(`fill:\\s*${PALETTE.ink}`, 'i'), 'black becomes ink');
});

test('toLogo reads viewBox, or width and height', () => {
  assert.deepEqual(toLogo(sanitizeSvg(nasty, 'n'), 'n').viewBox, [0, 0, 100, 100]);
  const w = toLogo(sanitizeSvg(wide, 'w'), 'w');
  assert.deepEqual(w.viewBox, [0, 0, 200, 40]);
  assert.doesNotMatch(w.body, /<svg/);
  assert.throws(() => toLogo('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>', 'z'), /z: no viewBox or size/);
});

test('toLogo prefixes ids so two logos on one page do not clash', () => {
  const w = toLogo(sanitizeSvg(wide, 'w'), 'w');
  assert.match(w.body, /id="w-a"/);
  assert.match(w.body, /href="#w-a"/);
  assert.match(w.body, /url\(#w-a\)/);
  assert.doesNotMatch(w.body, /id="a"/);
});

test('class colours from a style block move onto the elements', () => {
  const src = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><style>.cls-1{fill:#326ce5;}.cls-2,.cls-3{fill:#fff;stroke:#000;background:url(http://evil.example)}</style></defs><path class="cls-1" d="M0 0"/><path class="cls-3 other" d="M1 1"/></svg>';
  const s = sanitizeSvg(src, 'k');
  assert.doesNotMatch(s, /<style|evil/);
  assert.match(s, /<path class="cls-1" d="M0 0" style="fill:#326ce5"\/>/);
  assert.match(s, /<path class="cls-3 other" d="M1 1" style="fill:#fff;stroke:#000"\/>/);
});

test('a class rule cannot break out of the style it is written into', () => {
  for (const css of ['.a{fill:#000"/><image href="x" onerror="alert(1)"/><path d="}', '.a{fill:#000" onmouseover="alert(1)}']) {
    const s = sanitizeSvg(`<svg viewBox="0 0 10 10"><style>${css}</style><path class="a" d="M0 0h10v10z"/></svg>`, 'x');
    assert.doesNotMatch(s, /<image|\son\w+\s*=/i, s);
    assert.equal(s, sanitizeSvg(s, 'x'), 'one pass is already clean');
  }
});
