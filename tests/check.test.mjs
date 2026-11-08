import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMmd } from '../tinycharts/build/mmd.mjs';
import { check } from '../tinycharts/build/check-lib.mjs';

test('door rule holds and its mutant breaks in 2 steps', async () => {
  const { result } = await import('./fixtures/door.check.mjs');
  const r = result.rules.find(x => x.rule === 'Never open while locked');
  assert.equal(r.path, 'Take away the unlocked guard and it breaks in 2 steps: lock, open.');
  assert.equal(result.title, 'The door');
  assert.match(result.checked, /All 2 rules hold/);
});

test('the built-in rule comes first and holds for the door', async () => {
  const { result } = await import('./fixtures/door.check.mjs');
  assert.equal(result.rules[0].rule, 'Every step can happen, and none is a dead end');
  assert.equal(result.rules[0].path, 'Holds on every path.');
});

test('parallel regions fail with the line number', () => {
  const src = 'stateDiagram-v2\n  state a {\n    x --> y\n    --\n    p --> q\n  }\n';
  assert.throws(() => parseMmd(src, 'door.mmd'), /door\.mmd:4: parallel regions are not supported yet/);
});

test('parseMmd reads labels, events, guards, composites and choices', () => {
  const m = parseMmd([
    '---', 'title: "Tea"', '---', 'stateDiagram-v2',
    '  [*] --> idle', '  idle: Waiting', '  state "Making tea" as making {', '    [*] --> boil',
    '    boil --> steep: boiled', '  }', '  state pick <<choice>>',
    '  idle --> pick: order', '  pick --> making: [has tea]', '  pick --> idle: [else]', '  making --> [*]',
  ].join('\n'));
  assert.equal(m.title, 'Tea');
  assert.equal(m.initial, 'idle');
  assert.equal(m.states.find(s => s.id === 'idle').label, 'Waiting');
  assert.equal(m.states.find(s => s.id === 'making').label, 'Making tea');
  assert.equal(m.states.find(s => s.id === 'boil').parent, 'making');
  assert.equal(m.states.find(s => s.id === 'pick').kind, 'choice');
  assert.deepEqual({ ...m.edges.find(e => e.from === 'pick' && e.to === 'making') }, { from: 'pick', to: 'making', event: '', guard: 'has tea', line: 13, parent: null });
  assert.equal(m.edges.find(e => e.from === 'idle').event, 'order');
});

test('a dead end and an unreached state break the built-in rule', () => {
  const r = check({
    mmd: 'stateDiagram-v2\n  [*] --> a\n  a --> b: go\n  c --> a: back\n',
    rules: [],
  });
  assert.match(r.rules[0].path, /Never reached: c/);
  assert.match(r.rules[0].path, /Stuck at b after: go/);
});

test('a rule the chart itself breaks says so', () => {
  const r = check({
    mmd: 'stateDiagram-v2\n  [*] --> a\n  a --> b: go\n  b --> a: back\n',
    rules: [{ rule: 'Never b', says: 'b never happens.', holds: s => s.at !== 'b' }],
  });
  assert.equal(r.rules[1].path, 'Breaks in 1 step: go.');
  assert.match(r.checked, /1 of 2 rules hold/);
});

test('a choice is passed through on the way in', () => {
  const r = check({
    mmd: 'stateDiagram-v2\n  [*] --> idle\n  state pick <<choice>>\n  idle --> pick: order\n  pick --> made: [has tea]\n  pick --> idle: [else]\n  made --> idle: drink\n  idle --> idle: stock\n',
    init: { tea: false },
    guard: { 'has tea': v => v.tea },
    effect: { stock: v => ({ ...v, tea: true }), drink: v => ({ ...v, tea: false }) },
    rules: [{ rule: 'No tea, no cup', says: 'A cup is made only with tea.', holds: s => s.at !== 'made' || s.tea }],
    mutants: { 'has tea': true },
  });
  assert.equal(r.rules[0].path, 'Holds on every path.');
  assert.equal(r.rules[1].path, 'Take away the has tea guard and it breaks in 1 step: order.');
});

test('the state limit stops a run that never ends', () => {
  assert.throws(() => check({
    mmd: 'stateDiagram-v2\n  [*] --> a\n  a --> a: tick\n',
    init: { n: 0 }, effect: { tick: v => ({ n: v.n + 1 }) }, rules: [], limit: 50,
  }), /More than 50 states/);
});

test('a mutant that lets a counter grow stops at the first break', () => {
  const r = check({
    mmd: 'stateDiagram-v2\n  [*] --> a\n  a --> a: tick [under 3]\n',
    init: { n: 0 }, guard: { 'under 3': v => v.n < 3 }, effect: { tick: v => ({ n: v.n + 1 }) },
    rules: [{ rule: 'At most 3', says: 'n stays at 3 or less.', holds: s => s.n <= 3 }],
    mutants: { 'under 3': true }, limit: 50,
  });
  assert.equal(r.rules[1].path, 'Take away the under 3 guard and it breaks in 4 steps: tick, tick, tick, tick.');
});

test('a mutant that runs past the limit without a break does not break that rule', () => {
  const r = check({
    mmd: 'stateDiagram-v2\n  [*] --> a\n  a --> a: tick [under 3]\n  a --> b: go\n  b --> a: back\n',
    init: { n: 0 }, guard: { 'under 3': v => v.n < 3 }, effect: { tick: v => ({ n: v.n + 1 }) },
    rules: [{ rule: 'b is fine', says: 'Always true.', holds: () => true }],
    mutants: { 'under 3': true }, limit: 50,
  });
  assert.equal(r.rules[1].path, 'Holds on every path.');
});
