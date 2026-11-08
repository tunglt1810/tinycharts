// Test fixture: a sheet whose open state has two notes on top of each other.
let AT = 'shut';
function draw(seed) {
  begin(seed);
  title('a fixture', 'The crowd');
  for (const id of ['shut', 'open']) group(`data-state="${id}"`, () => pill(id === 'shut' ? 520 : 880, 1180, id));
  group('data-state="open"', () => { out.push('<g class="on">'); label(72, 400, 'one note', 'here', [0, 0, 0]); label(80, 404, 'another', 'here too', [0, 0, 0]); out.push('</g>'); });
  finish();
}
function init(ctx) {
  const show = () => { draw(1); ctx.state(AT); };
  ctx.button('open', () => { AT = 'open'; show(); });
  show();
  return { goto(id) { AT = id; show(); }, story: ['shut', 'open'] };
}
