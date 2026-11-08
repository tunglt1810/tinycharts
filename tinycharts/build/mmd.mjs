// Reads the subset of Mermaid stateDiagram-v2 that sheets use.
// parseMmd(src, name) -> {title, initial, states: [{id, label, parent, kind?}], edges: [{from, to, event, guard, line, parent}]}

const ID = '[\\w.-]+';
const END = '\\[\\*\\]';

export function parseMmd(src, name = 'chart.mmd') {
  const lines = src.split('\n');
  const where = n => `${name}:${n}:`;
  const states = new Map(), edges = [], initialOf = new Map(), stack = [];
  let title = '', i = 0, inNote = false;

  const parent = () => stack[stack.length - 1] ?? null;
  const add = (id, o = {}) => {
    if (!states.has(id)) states.set(id, { id, label: id, parent: parent() });
    Object.assign(states.get(id), o);
  };

  if (lines[0].trim() === '---') {
    for (i = 1; i < lines.length && lines[i].trim() !== '---'; i++) {
      const m = lines[i].match(/^\s*title:\s*"?(.*?)"?\s*$/);
      if (m) title = m[1];
    }
    i++;
  }

  for (; i < lines.length; i++) {
    const n = i + 1, line = lines[i].replace(/%%.*$/, '').trim();
    if (inNote) { if (/^end note$/.test(line)) inNote = false; continue; }
    if (!line || /^stateDiagram(-v2)?$/.test(line) || /^direction\s/.test(line) || /^(classDef|class|style)\s/.test(line)) continue;
    if (/^note\s/.test(line)) { if (!line.includes(':')) inNote = true; continue; }
    if (line === '--') throw new Error(`${where(n)} parallel regions are not supported yet`);
    if (line === '}') {
      if (!stack.length) throw new Error(`${where(n)} "}" without a matching state block`);
      stack.pop();
      continue;
    }
    let m;
    if ((m = line.match(new RegExp(`^state\\s+(?:"([^"]*)"\\s+as\\s+)?(${ID})\\s*(<<choice>>)?\\s*(\\{)?$`)))) {
      const [, label, id, choice, open] = m;
      add(id, { ...(label ? { label } : {}), ...(choice ? { kind: 'choice' } : {}) });
      if (open) stack.push(id);
      continue;
    }
    if ((m = line.match(new RegExp(`^(${ID}|${END})\\s*-->\\s*(${ID}|${END})\\s*(?::\\s*(.*))?$`)))) {
      const [, from, to, text = ''] = m;
      const t = text.match(/^(.*?)\s*(?:\[([^\]]*)\])?\s*$/);
      const event = t[1].trim(), guard = (t[2] || '').trim();
      if (from === '[*]') {
        initialOf.set(parent(), to);
        add(to);
      } else {
        add(from);
        if (to !== '[*]') add(to);
      }
      edges.push({ from, to, event, guard, line: n, parent: parent() });
      continue;
    }
    if ((m = line.match(new RegExp(`^(${ID})\\s*:\\s*(.+)$`)))) { add(m[1], { label: m[2].trim() }); continue; }
    throw new Error(`${where(n)} cannot read "${line}"`);
  }
  if (stack.length) throw new Error(`${name}: state block "${stack[stack.length - 1]}" is never closed`);
  if (!initialOf.has(null)) throw new Error(`${name}: no start arrow ([*] --> state)`);
  return { title, initial: initialOf.get(null), initialOf, states: [...states.values()], edges };
}
