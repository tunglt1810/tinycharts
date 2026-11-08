import test from 'node:test';
import assert from 'node:assert/strict';
import { loadKit } from './load-kit.mjs';

const kit = logos => { const k = loadKit(); k.LOGOS = logos; k.begin(1); return k; };
const inner = html => html.match(/<g transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([\d.]+)\) translate\(([-\d.]+) ([-\d.]+)\)"/).slice(1).map(Number);

test('a logo fills its box and keeps its shape', () => {
  const k = kit({ w: { viewBox: [0, 0, 100, 20], body: '<path d="M0 0h100v20z"/>' } });
  k.logoOn('right', 0, 0, 60, 60, 60, 'w');
  const [u, v, s] = inner(k.out.join(''));
  assert.ok(Math.abs(s - 60 * (1 - 2 * 0.08) / 100) < 1e-3, `scale ${s}`);
  assert.ok(Math.abs(u - 60 * 0.08) < 0.1, 'fills the width');
  assert.ok(Math.abs(v - (60 - 20 * s) / 2) < 0.1, 'centred in height');
});

test('a tall logo fits by its height', () => {
  const k = kit({ t: { viewBox: [0, 0, 10, 100], body: '<path d="M0 0h10v100z"/>' } });
  k.logoOn('left', 0, 0, 60, 60, 40, 't');
  const [, v, s] = inner(k.out.join(''));
  assert.ok(Math.abs(s - 40 * (1 - 2 * 0.08) / 100) < 1e-3);
  assert.ok(Math.abs(v - 40 * 0.08) < 0.1);
});

test('a viewBox that does not start at 0 is moved to the box', () => {
  const k = kit({ o: { viewBox: [-5, 10, 50, 50], body: '<path/>' } });
  k.logoOn('top', 0, 0, 0, 50, 50, 'o');
  const [, , , tx, ty] = inner(k.out.join(''));
  assert.deepEqual([tx, ty], [5, -10]);
});

test('a missing logo prints its fallback name', () => {
  const k = kit({});
  k.logoOn('right', 0, 0, 60, 60, 60, 'kafka', { fallback: 'Kafka' });
  assert.match(k.out.join(''), /<text[^>]*>Kafka<\/text>/);
  const k2 = kit({});
  k2.logoOn('right', 0, 0, 60, 60, 60, 'redis');
  assert.match(k2.out.join(''), /<text[^>]*>redis<\/text>/);
});

test('the logo sits on the face, with its tint', () => {
  const k = kit({ m: { viewBox: [0, 0, 10, 10], body: '<path/>', tint: '#5f7db5' } });
  k.logoOn('right', 10, 20, 30, 40, 40, 'm');
  const html = k.out.join('');
  assert.ok(html.startsWith(`<g transform="${k.faceM('right', 10, 20, 30)}">`));
  assert.match(html, /fill="#5f7db5"/);
});

test('front prints flat to the viewer, centred under the point', () => {
  const k = kit({ f: { viewBox: [0, 0, 10, 10], body: '<path/>' } });
  k.logoOn('front', 0, 0, 30, 40, 20, 'f');
  const [e, f] = k.P(0, 0, 30);
  assert.ok(k.out.join('').startsWith(`<g transform="translate(${k.n1(e - 20)} ${k.n1(f)})">`));
});

test('a logo sits on a light plate with an ink rim, the label does not', () => {
  const k = kit({ w: { viewBox: [0, 0, 100, 20], body: '<path class="logo"/>' } });
  k.logoOn('right', 0, 0, 60, 60, 60, 'w');
  const html = k.out.join(''), plate = html.indexOf('fill="#fbf8f1"');
  assert.ok(plate > 0 && plate < html.indexOf('class="logo"'), 'plate drawn under the logo');
  assert.ok(html.slice(plate).includes('fill="#2b2a28"'), 'plate has a rim');
  const k2 = kit({});
  k2.logoOn('right', 0, 0, 60, 60, 60, 'kafka', { fallback: 'Kafka' });
  assert.doesNotMatch(k2.out.join(''), /#fbf8f1/);
});
