// Test fixture: a sheet that names two technologies, one with a logo file.
function draw(seed) {
  begin(seed);
  OX = 700; OY = 700;
  group('data-state="one"', () => { tech('Kafka', -100, 0); tech("redis", 100, 0); });
  finish();
}
function init(ctx) { return { goto() {}, story: ['one'] }; }
