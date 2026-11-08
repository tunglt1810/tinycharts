// Test fixture: one button too many.
function draw(seed) { begin(seed); title('a fixture', 'Five buttons'); finish(); }
function init(ctx) {
  for (const b of ['one', 'two', 'three', 'four', 'five']) ctx.button(b, () => {});
  return { goto() {}, story: ['a'] };
}
