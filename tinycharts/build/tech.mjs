// The technology table: name → base object → logo sources.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'icons', 'tech.json');
const norm = s => String(s).trim().toLowerCase().replace(/\s+/g, ' ');

export function loadTech(file = FILE) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

export function lookup(table, name) {
  const n = norm(name), names = [];
  for (const [key, e] of Object.entries(table)) {
    const all = [key, e.name, ...(e.alias || [])].map(norm);
    if (all.includes(n)) return { key, ...e };
    for (const a of all) names.push([key, lev(n, a)]);
  }
  const best = [...new Set(names.sort((p, q) => p[1] - q[1]).map(([k]) => k))].slice(0, 3);
  throw new Error(`Unknown technology "${name}". Closest: ${best.join(', ')}.`);
}
