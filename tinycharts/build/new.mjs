// Start a sheet from the template of its type: the type's example sheet,
// copied under a new name.
// bun tinycharts/build/new.mjs <type> <dir/name> [--force]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { typeOf } from './types.mjs';

const EXAMPLES = process.env.TINYCHARTS_EXAMPLES || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'examples');
const EXTS = ['js', 'mmd', 'check.mjs'];

// A type name, or the file name of a second template such as flowchart-tech.
function templateOf(type) {
  try { return typeOf(type).slug; } catch (e) {
    if (/^[a-z-]+$/.test(type) && fs.existsSync(path.join(EXAMPLES, `${type}.check.mjs`))) return type;
    throw e;
  }
}

export function newSheet(type, target, { force = false } = {}) {
  const slug = templateOf(type), name = path.basename(target), dir = path.dirname(path.resolve(target));
  const to = ext => path.join(dir, `${name}.${ext}`);
  if (!force) for (const ext of EXTS) if (fs.existsSync(to(ext))) throw new Error(`${path.relative(process.cwd(), to(ext))} already exists. Use --force to overwrite.`);
  fs.mkdirSync(dir, { recursive: true });
  for (const ext of EXTS) {
    let text = fs.readFileSync(path.join(EXAMPLES, `${slug}.${ext}`), 'utf8');
    if (ext === 'check.mjs') text = text.replaceAll(`'${slug}.mmd'`, `'${name}.mmd'`).replaceAll(`'${slug}.json'`, `'${name}.json'`)
      .replace(/'(\.[^']*check-lib\.mjs)'/, (_, p) => `'${path.relative(dir, path.resolve(EXAMPLES, p)).replaceAll(path.sep, '/').replace(/^(?!\.)/, './')}'`);
    fs.writeFileSync(to(ext), text);
  }
  return EXTS.map(to);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), force = args.includes('--force'), [type, target] = args.filter(a => a !== '--force');
  try {
    if (!type || !target) throw new Error('Usage: new.mjs <type> <dir/name> [--force]');
    newSheet(type, target, { force }).forEach(f => console.log(path.relative(process.cwd(), f)));
  } catch (e) { console.error(e.message); process.exit(1); }
}
