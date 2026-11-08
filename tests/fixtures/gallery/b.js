// Test fixture: a one-state sheet for the gallery.
function draw(seed) { begin(seed); group('data-state="still"', () => pill(700, 700, 'still')); title('a fixture', 'Sheet b'); finish(); }
function init(ctx) { ctx.state('still'); return { goto() { ctx.state('still'); }, story: ['still'] }; }
