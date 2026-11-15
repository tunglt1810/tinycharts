import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { KIT_ORDER } from '../tinycharts/build/build.mjs';

const KIT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'tinycharts', 'kit');

// Runs the kit the way the page does (plain scripts sharing one scope) and
// exposes that scope through a proxy, so tests can read and set top-level
// let/const/function names.
export function loadKit() {
  const art = { innerHTML: '' };
  const ctx = vm.createContext({
    console, Math, JSON,
    setTimeout: (...a) => globalThis.setTimeout(...a), clearTimeout: t => globalThis.clearTimeout(t),
    document: { getElementById: id => (id === 'art' ? art : null) },
  });
  for (const name of KIT_ORDER) {
    const file = path.join(KIT, name + '.js');
    if (fs.existsSync(file)) vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  }
  return new Proxy({}, {
    get: (_, k) => (k === '__art' ? art : k === '__run' ? code => vm.runInContext(code, ctx) : vm.runInContext(String(k), ctx)),
    set: (_, k, v) => { ctx.__v = v; vm.runInContext(`${String(k)} = __v`, ctx); return true; },
  });
}
