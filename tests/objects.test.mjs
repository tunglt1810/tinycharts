import test from 'node:test';
import assert from 'node:assert/strict';
import { loadKit } from './load-kit.mjs';

const OBJECTS = ['rack', 'dbCyl', 'queue', 'gateway', 'browser', 'phone', 'cloud', 'bucket', 'devbox', 'lock', 'container'];
const LOGO = { viewBox: [0, 0, 10, 10], body: '<path d="M1 1h8v8z" class="probe"/>' };

test('every object draws and returns its footprint', () => {
  for (const name of OBJECTS) {
    const k = loadKit(); k.begin(1);
    const f = k[name](0, 0, 0);
    assert.ok(k.out.join('').length > 200, `${name} draws`);
    assert.ok(f.w > 0 && f.d > 0 && f.h > 0, `${name} footprint ${JSON.stringify(f)}`);
  }
});

test('an object with a logo prints it, without one prints its label', () => {
  for (const name of OBJECTS) {
    const k = loadKit(); k.LOGOS = { x: LOGO }; k.begin(1);
    k[name](0, 0, 0, { logo: 'x' });
    assert.match(k.out.join(''), /class="probe"/, `${name} prints the logo`);
    const k2 = loadKit(); k2.begin(1);
    k2[name](0, 0, 0, { label: 'Thing' });
    assert.match(k2.out.join(''), />Thing<\/text>/, `${name} prints the label`);
  }
});

test('tech() picks the object from the table', () => {
  const k = loadKit(); k.TECH = { kafka: { name: 'Kafka', object: 'queue', alias: ['apache kafka'] } }; k.begin(1);
  const f = k.tech('Apache Kafka', 0, 0);
  const k2 = loadKit(); k2.begin(1);
  assert.equal(JSON.stringify(f), JSON.stringify(k2.queue(0, 0, 0)));
  assert.match(k.out.join(''), />Kafka<\/text>/, 'no logo: the name is lettered');
});

test('tech() with an unknown name throws the lookup message', () => {
  const k = loadKit(); k.TECH = { kafka: { name: 'Kafka', object: 'queue' }, redis: { name: 'Redis', object: 'dbCyl' } };
  assert.throws(() => k.tech('kafak', 0, 0), /Unknown technology "kafak"\. Closest: kafka/);
});

test('message() draws an envelope in its colour and returns its size', () => {
  const k = loadKit(); k.begin(1);
  const f = k.message(0, 0, 40, { col: '#5f7db5' });
  const k2 = loadKit(); k2.begin(1); k2.message(0, 0, 40);
  assert.notEqual(k.out.join(''), k2.out.join(''), 'col changes the envelope');
  assert.ok(f.w > 0 && f.d > 0 && f.h > 0);
});

test('a round body wraps its logo round the curve', () => {
  for (const name of ['dbCyl', 'bucket']) {
    const k = loadKit(); k.LOGOS = { x: LOGO }; k.begin(1);
    k[name](0, 0, 0, { logo: 'x' });
    const html = k.out.join('');
    assert.equal(html.split('class="probe"').length - 1, 1, `${name}: the logo is drawn once`);
    const strips = [...html.matchAll(/<g transform="matrix\(([-\d.]+) ([-\d.]+) 0 1 [^"]*"><g clip-path="url\(#[^)]+\)"><use href="#[^"]+"\/>/g)];
    assert.ok(strips.length >= 6, `${name}: in strips, got ${strips.length}`);
    const slope = strips.map(m => +m[2] / +m[1]);
    assert.ok(slope[0] > slope[slope.length - 1] + 0.5, `${name}: each strip turns with the curve ${slope}`);
  }
});
