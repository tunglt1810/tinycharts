// The technology table: name → base object → logo sources.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'icons', 'tech.json');
const norm = s => String(s).trim().toLowerCase().replace(/\s+/g, ' ');

export function loadTech(file = FILE) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

export function lev(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

const namesOf = (key, e) => [key, e.name, ...(e.alias || [])].map(norm);

export function find(table, name) {
  const n = norm(name), hit = Object.entries(table).find(([key, e]) => namesOf(key, e).includes(n));
  return hit ? { key: hit[0], ...hit[1] } : null;
}

export function lookup(table, name) {
  const e = find(table, name);
  if (e) return e;
  const n = norm(name), names = Object.entries(table).flatMap(([key, x]) => namesOf(key, x).map(a => [key, lev(n, a)]));
  const best = [...new Set(names.sort((p, q) => p[1] - q[1]).map(([k]) => k))].slice(0, 3);
  throw new Error(`Unknown technology "${name}". Closest: ${best.join(', ')}.`);
}
