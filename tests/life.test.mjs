import test from 'node:test';
import assert from 'node:assert/strict';
import { loadKit } from './load-kit.mjs';

const CALLS = {
  person: k => k.person(100, 200, { shirt: '#c9d6e6', hair: 'bun', arm: 'wave' }),
  who: k => k.who(10, 20, { hair: 'cap' }),
  cat: k => k.cat(0, 0),
  dog: k => k.dog(0, 0),
  bird: k => k.bird(0, 0, 20),
  tree: k => k.tree(0, 0),
  puff: k => k.puff(0, 0, 0),
  pot: k => k.pot(0, 0, 0),
};

for (const [name, call] of Object.entries(CALLS)) {
  test(`${name} draws in ink and repeats for one seed`, () => {
    const k = loadKit();
    k.begin(11); call(k); const a = k.out.join('');
    assert.match(a, /fill="#2b2a28"/, 'has ink');
    k.begin(11); call(k);
    assert.equal(k.out.join(''), a);
  });
}

test('every hair and arm option draws something different', () => {
  const k = loadKit();
  const seen = new Set();
  for (const hair of ['short', 'bun', 'bob', 'long', 'cap']) for (const arm of ['down', 'wave', 'up', 'out', 'hold']) {
    k.begin(3); k.person(0, 0, { hair, arm }); seen.add(k.out.join(''));
  }
  assert.equal(seen.size, 25);
});

test('a person who speaks carries data-say', () => {
  const k = loadKit();
  k.begin(1); k.person(0, 0, { say: 'hi "there"' });
  assert.match(k.out.join(''), /data-say="hi &quot;there&quot;"/);
});

test('size scales a person', () => {
  const k = loadKit();
  const top = o => { k.begin(1); k.person(0, 0, o); return Math.min(...[...k.out.join('').matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(m => +m[2])); };
  assert.ok(top({ size: 2 }) < top({ size: 1 }) * 1.6);
});
