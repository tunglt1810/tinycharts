// The 28 chart types (spec 7.1): slug, name, gallery group, the question.
const T = (group, slug, name, question) => ({ slug, name, group, question });
export const TYPES = [
  T('Time', 'timeline', 'Timeline', 'how long each step takes, to scale'),
  T('Time', 'parallel-timeline', 'Parallel timeline', 'jobs that run at once, and meet on time'),
  T('Time', 'clock', 'Clock', 'a whole day, round once'),
  T('Time', 'time-lapse', 'Time-lapse', 'one place, changing through the day'),
  T('Time', 'timing-diagram', 'Timing diagram', 'each signal, second by second'),
  T('Time', 'bands', 'Bands', 'which band a changing level is in'),
  T('Space', 'exploded-view', 'Exploded view', 'what is inside, layer by layer'),
  T('Space', 'annotated-scene', 'Annotated scene', 'everything happening in one place'),
  T('Space', 'zoom', 'Zoom', 'where it is, from the big picture down'),
  T('Space', 'route-map', 'Route map', 'where it went, stop by stop'),
  T('Space', 'bubble-diagram', 'Bubble diagram', 'which spaces connect, and how big'),
  T('Order', 'flowchart', 'Flowchart', 'every step, and where it splits'),
  T('Order', 'decision-tree', 'Decision tree', 'every answer, and every outcome in view'),
  T('Order', 'comic-strip', 'Comic strip', 'a story, one panel at a time'),
  T('Order', 'cycle', 'Cycle', 'a loop, and the one way off it'),
  T('Order', 'flow-machine', 'Flow machine', 'a process built as a machine'),
  T('Order', 'kanban', 'Kanban', 'where each item is, and what is held up'),
  T('Order', 'game-board', 'Game board', 'what chance decides'),
  T('Flow', 'sankey', 'Sankey', 'where it all goes, and how much'),
  T('Flow', 'funnel', 'Funnel', 'how many make it through each stage'),
  T('Flow', 'stock-and-flow', 'Stock and flow', 'what fills it, and what drains it'),
  T('Who', 'sequence', 'Sequence', 'who says what to whom, in order'),
  T('Who', 'network', 'Network', 'who reaches whom'),
  T('Who', 'fishbone', 'Fishbone', 'which causes are ruled in or out'),
  T('Who', 'escalation', 'Escalation', 'who takes it next, if no one answers'),
  T('Compare', 'catalogue', 'Catalogue', 'one set of states, many at once'),
  T('Compare', 'break-even', 'Break-even', 'the point where one option wins'),
  T('Compare', 'quadrant', 'Quadrant', 'where each one falls on two measures'),
];

const norm = s => String(s).trim().toLowerCase().replace(/[\s_]+/g, '-');
function lev(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

export function typeOf(name) {
  const n = norm(name), t = TYPES.find(t => t.slug === n || norm(t.name) === n);
  if (t) return t;
  const best = TYPES.map(t => [t.slug, lev(n, t.slug)]).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([s]) => s);
  throw new Error(`Unknown type "${name}". Closest: ${best.join(', ')}.`);
}
