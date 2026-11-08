// Test fixture: a door that opens, shuts and locks. The #selftest hash runs
// one scripted check and writes its result to <pre id="selftest">.
const SELF = new URLSearchParams(location.hash.slice(1)).get('selftest');

function draw(seed) {
  begin(seed);
  OX = 700; OY = 620;
  board(-220, -220, 440, 440, 18, PAL.sand, PAL.tan);
  for (const [id, x] of [['shut', 520], ['open', 880]]) {
    group(`data-state="${id}"`, () => {
      pill(x, 1180, id);
      out.push('<g class="on">');
      pill(x, 1180, id, { lit: true });
      nowTag(x, 1150);
      out.push('</g>');
    });
  }
  box(-40, -60, 18, 80, 20, 150, { left: PAL.brick });
  title('a fixture', 'The door');
  subtitle('two states, one lock');
  status('shut', 'not locked');
  if (SELF === 'overflow') label(1390, 400, 'too far', 'off the edge', [0, 0, 0]);
  if (SELF === 'overlap') { label(72, 400, 'one note', 'here', [0, 0, 0]); label(80, 404, 'another', 'here too', [0, 0, 0]); }
  if (SELF === 'say') person(900, 800, { say: 'mind the step' });
  footnote('Illustrative: one made-up door.');
  finish();
}

function init(ctx) {
  let at = 'shut', locked = false, running = 0, peak = 0, ticks = 0;
  const plays = [];
  const show = () => {
    document.getElementById('statusBig').textContent = at;
    document.getElementById('statusSmall').textContent = locked ? 'locked' : 'not locked';
    ctx.state(at);
  };
  const swing = to => {
    running++; peak = Math.max(peak, running);
    const a = { done: false, finish() {
      if (a.done) return;
      a.done = true; running--; clearTimeout(t); at = to; show(); ctx.idle();
    } };
    const t = setTimeout(a.finish, 1000);
    ctx.busy(a);
  };
  ctx.button('open', () => {
    if (locked) return ctx.say("It's locked. Unlock it first.");
    if (at === 'open') return ctx.say('It is already open.');
    swing('open');
  });
  ctx.button('close', () => (at === 'shut' ? ctx.no('It is already shut.') : swing('shut')));
  ctx.button('lock', () => {
    if (at === 'open') return ctx.say('Shut it first. An open door cannot lock.');
    locked = true; show();
  });
  ctx.button('unlock', () => { locked = false; show(); });
  ctx.hint('Press Play all, or open.');

  const pre = (id, text) => {
    const p = document.createElement('pre'); p.id = id; p.textContent = text; document.body.append(p);
  };
  (async () => {
    const ok = async (font, fam) => (await document.fonts.load(font)).length > 0 && document.fonts.check(font) &&
      [...document.fonts].some(f => f.family.replace(/"/g, '') === fam && f.status === 'loaded');
    pre('fonts', `${await ok('70px "Young Serif"', 'Young Serif')} ${await ok('16px Gaegu', 'Gaegu')}`);
  })();
  if (SELF === 'peek') {
    setTimeout(() => {
      document.querySelector('#logic .pele-state[data-id="open"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      pre('selftest', document.querySelector('#art [data-state="open"]').classList.contains('peek') ? 'peek' : 'none');
    }, 200);
  }
  if (SELF === 'follow') ctx.follow(true);
  if (SELF === 'no') {
    const btn = () => [...document.querySelectorAll('#actions button')].find(b => b.textContent === 'close');
    setTimeout(() => btn().click(), 100);
    setTimeout(() => pre('selftest', `${btn().getAnimations().length} ${document.getElementById('status').textContent}`), 200);
  }
  if (SELF === 'play') {
    setTimeout(() => document.querySelector('#actions .run').click(), 100);
    setTimeout(() => pre('selftest', plays.join(' ')), 300);
  }
  if (SELF === 'playwait') {
    const got = [];
    setTimeout(() => document.querySelector('#actions .run').click(), 100);
    setTimeout(() => got.push(plays.length), 1900);
    setTimeout(() => { got.push(plays.length); pre('selftest', got.join(' ')); }, 2800);
  }
  if (SELF === 'reset') setTimeout(() => { ctx.clear(); pre('selftest', document.querySelector('#actions .reset') ? 'kept' : 'gone'); }, 100);
  if (SELF === 'playpress') {
    setTimeout(() => document.querySelector('#actions .run').click(), 100);
    setTimeout(() => [...document.querySelectorAll('#actions button')].find(b => b.textContent === 'open').click(), 1450);
    setTimeout(() => pre('selftest', `${peak} ${plays.join(' ')}`), 3600);
  }
  const z = k => document.querySelector(`#zoom [data-z="${k}"]`).click();
  const pct = () => document.querySelector('#zoom .pct').textContent;
  if (SELF === 'zoom') {
    const got = [];
    setTimeout(() => { z('in'); z('in'); }, 100);
    setTimeout(() => { got.push(pct()); z('fit'); }, 1000);
    setTimeout(() => { got.push(pct()); pre('selftest', got.join(' ')); }, 1900);
  }
  if (SELF === 'zoomfollow') {
    ctx.follow(true);
    setTimeout(() => { z('in'); z('in'); z('in'); }, 100);
    setTimeout(() => [...document.querySelectorAll('#actions button')].find(b => b.textContent === 'open').click(), 900);
    setTimeout(() => pre('selftest', pct()), 2200);
  }
  if (SELF === 'zoomhold') {
    setTimeout(() => { z('in'); z('in'); ctx.focus(700, 700, 1.7, 300); }, 100);
    setTimeout(() => pre('selftest', pct()), 900);
  }
  const drag = d => {
    const s = document.getElementById('sheet'), at = { clientX: 300, clientY: 300, button: 0, buttons: 1, bubbles: true, pointerId: 1 };
    s.dispatchEvent(new PointerEvent('pointerdown', at));
    s.dispatchEvent(new PointerEvent('pointermove', { ...at, clientX: 300 + d }));
    s.dispatchEvent(new PointerEvent('pointerup', { ...at, clientX: 300 + d, buttons: 0 }));
  };
  if (SELF === 'jitter' || SELF === 'pan') {
    ctx.focus(700, 700, 1.7);
    setTimeout(() => { drag(SELF === 'jitter' ? 2 : 40); ctx.focus(700, 700, 2.5); pre('selftest', pct()); }, 200);
  }
  if (SELF === 'say') setTimeout(() => {
    document.querySelector('#art .person').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    pre('selftest', document.querySelector('.bubble text')?.textContent || 'none');
  }, 200);
  if (SELF === 'tick') setTimeout(() => pre('selftest', ticks ? 'ticks' : 'none'), 3000);
  if (SELF === 'stack') {
    const press = () => [...document.querySelectorAll('#actions button')].find(b => b.textContent === 'open').click();
    setTimeout(press, 100);
    setTimeout(press, 150);
    setTimeout(() => pre('selftest', String(peak)), 1600);
  }

  return {
    goto(id, play) { locked = false; plays.push(`${id}:${!!play}`); if (play) return swing(id); at = id; show(); },
    tick() { ticks++; },
    story: ['shut', 'open', 'shut'],
  };
}
