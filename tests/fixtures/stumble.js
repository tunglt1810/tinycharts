// Clean in every state, but a move that Play all starts throws. Make must
// report the throw.
function draw(seed) {
  begin(seed);
  title('', 'Stumble');
  for (const [id, y] of [['shut', 400], ['open', 500]]) group(`data-state="${id}"`, () => tag(100, y, 140, id));
  finish();
}
function init(ctx) {
  return {
    goto(id, play) {
      if (play) setTimeout(() => { const env = route([0, 0], [10, 10]); return env.length; }, 50);
      ctx.state(id);
    },
    story: ['shut', 'open'],
  };
}
