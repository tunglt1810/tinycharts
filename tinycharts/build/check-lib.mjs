// Rule check for a sheet's statechart: a breadth-first visit of every
// reachable state (not a model checker). BFS order makes every path it
// reports a shortest one.
import fs from 'node:fs';
import path from 'node:path';
import { parseMmd } from './mmd.mjs';

const BUILT_IN = 'Every step can happen, and none is a dead end';
const steps = n => `${n} step${n === 1 ? '' : 's'}`;
const keyOf = (at, vars) => at + '|' + JSON.stringify(vars, Object.keys(vars).sort());

function machine(m, { guard, effect }) {
  const byId = new Map(m.states.map(s => [s.id, s]));
  const ancestors = id => { const a = []; for (let p = byId.get(id)?.parent; p; p = byId.get(p)?.parent) a.push(p); return a; };
  const enter = id => { while (m.initialOf.has(id)) id = m.initialOf.get(id); return id; };
  const target = e => (e.to === '[*]' ? (e.parent ? `${e.parent}/[*]` : '[*]') : enter(e.to));
  const out = m.edges.filter(e => e.from !== '[*]');
  const outgoing = at => {
    if (at === '[*]') return [];
    if (at.endsWith('/[*]')) { const p = at.slice(0, -4); return out.filter(e => e.from === p && !e.event); }
    const from = new Set([at, ...ancestors(at)]);
    return out.filter(e => from.has(e.from));
  };
  const name = e => e.event || (e.to === '[*]' ? 'finish' : `go to ${e.to}`);

  function enabled(e, vars, dropped) {
    if (!e.guard || e.guard === dropped) return true;
    if (e.guard === 'else') {
      return !out.some(o => o !== e && o.from === e.from && o.event === e.event && o.guard !== 'else' && enabled(o, vars, dropped));
    }
    return !!guard[e.guard](vars);
  }

  // All moves from one state: [{at, vars, via, edges}]. A choice is passed
  // straight through, so its arrows add no step of their own.
  function moves(at, vars, dropped, seen = new Set()) {
    const res = [];
    for (const e of outgoing(at)) {
      if (!enabled(e, vars, dropped)) continue;
      const v = effect[e.event] ? effect[e.event](vars) : vars;
      const to = target(e);
      if (byId.get(to)?.kind === 'choice') {
        if (seen.has(to)) throw new Error(`choice ${to} loops back to itself`);
        for (const c of moves(to, v, dropped, new Set([...seen, to]))) res.push({ ...c, via: name(e), edges: [e, ...c.edges], choices: [to, ...c.choices] });
      } else res.push({ at: to, vars: v, via: name(e), edges: [e], choices: [] });
    }
    return res;
  }
  return { moves, ancestors, out, enter };
}

// stop(node) ends the visit early: a mutant run only needs its first break.
function explore(m, mc, init, limit, dropped, stop = null) {
  const start = { at: mc.enter(m.initial), vars: init, prev: null, via: null };
  const nodes = new Map([[keyOf(start.at, init), start]]), order = [start], fired = new Set(), reached = new Set(), dead = [];
  let nSteps = 0;
  for (let i = 0; i < order.length; i++) {
    const s = order[i];
    if (stop && stop(s)) return { order, fired, reached, dead, nSteps, hit: s };
    reached.add(s.at);
    for (const a of mc.ancestors(s.at)) reached.add(a);
    const next = mc.moves(s.at, s.vars, dropped);
    if (!next.length && s.at !== '[*]') dead.push(s);
    for (const n of next) {
      nSteps++;
      n.edges.forEach(e => fired.add(e));
      n.choices.forEach(c => reached.add(c));
      const k = keyOf(n.at, n.vars);
      if (nodes.has(k)) continue;
      if (nodes.size >= limit) {
        // a mutant can let a counter run free; past the limit it found no break
        if (stop) return { order, fired, reached, dead, nSteps, hit: null };
        throw new Error(`More than ${limit} states. Is a counter growing without end?`);
      }
      const node = { at: n.at, vars: n.vars, prev: s, via: n.via };
      nodes.set(k, node);
      order.push(node);
    }
  }
  return { order, fired, reached, dead, nSteps };
}

function trail(node) {
  const t = [];
  for (let n = node; n.prev; n = n.prev) t.unshift(n.via);
  return t;
}

export function check({ mmd, title, init = {}, guard = {}, effect = {}, rules, mutants = {}, limit = 10000 }) {
  let src = mmd, name = 'chart.mmd';
  if (!mmd.includes('\n') && mmd.endsWith('.mmd')) { src = fs.readFileSync(mmd, 'utf8'); name = path.basename(mmd); }
  const m = parseMmd(src, name);
  for (const e of m.edges) {
    if (e.guard && e.guard !== 'else' && !guard[e.guard]) throw new Error(`${name}:${e.line}: no guard function for [${e.guard}]`);
  }
  for (const g of Object.keys(mutants)) {
    if (!m.edges.some(e => e.guard === g)) throw new Error(`mutant "${g}" is not a guard in ${name}`);
  }
  const mc = machine(m, { guard, effect });
  const base = explore(m, mc, init, limit, null);

  const problems = [];
  const unreached = m.states.filter(s => !base.reached.has(s.id)).map(s => s.id);
  if (unreached.length) problems.push(`Never reached: ${unreached.join(', ')}.`);
  const idle = mc.out.filter(e => !base.fired.has(e)).map(e => `${e.from} → ${e.to}${e.event || e.guard ? ` (${[e.event, e.guard && `[${e.guard}]`].filter(Boolean).join(' ')})` : ''}`);
  if (idle.length) problems.push(`Never fires: ${idle.join(', ')}.`);
  for (const d of base.dead.slice(0, 1)) {
    const t = trail(d);
    problems.push(t.length ? `Stuck at ${d.at} after: ${t.join(', ')}.` : `Stuck at ${d.at} at the start.`);
  }
  const nStates = m.states.filter(s => s.kind !== 'choice').length;
  const out = [{
    rule: BUILT_IN,
    says: `Each of the ${nStates} states is reached from the start, every step can fire, and no state leaves you stuck.`,
    path: problems.length ? problems.join(' ') : 'Holds on every path.',
  }];
  let holding = problems.length ? 0 : 1;

  const firstBreak = (run, holds) => run.order.find(n => !holds({ at: n.at, ...n.vars }));
  for (const r of rules) {
    const broke = firstBreak(base, r.holds);
    let p;
    if (broke) {
      const t = trail(broke);
      p = t.length ? `Breaks in ${steps(t.length)}: ${t.join(', ')}.` : 'Breaks at the start.';
    } else {
      holding++;
      let best = null;
      for (const g of Object.keys(mutants).filter(g => mutants[g])) {
        const b = explore(m, mc, init, limit, g, n => !r.holds({ at: n.at, ...n.vars })).hit;
        if (b && (!best || trail(b).length < best.t.length)) best = { g, t: trail(b) };
      }
      p = best ? `Take away the ${best.g} guard and it breaks in ${steps(best.t.length)}: ${best.t.join(', ')}.` : 'Holds on every path.';
    }
    out.push({ rule: r.rule, says: r.says, path: p });
  }
  const total = rules.length + 1;
  return {
    title: title || m.title || 'Untitled',
    checked: `Every reachable state checked (${nStates} states, ${base.order.length} with their data, ${steps(base.nSteps)}). ` +
      (holding === total ? `All ${total} rules hold.` : `${holding} of ${total} rules hold.`),
    rules: out,
  };
}

export function writeResult(file, result) {
  fs.writeFileSync(file, JSON.stringify(result, null, 1) + '\n');
}
