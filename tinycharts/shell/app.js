/* Tinycharts page shell: runs one sheet, its buttons, the camera and the
   hash. Hash: #sheet=<key>&state=<id>&bare=1&audit=1. A page built with a
   gallery shows the grid of sheets when the hash names no sheet. */
(() => {
  const $ = id => document.getElementById(id);
  const hash = new URLSearchParams(location.hash.slice(1));
  const keys = META.map(m => m.key);
  const key = keys.includes(hash.get('sheet')) ? hash.get('sheet') : keys[0];
  const meta = META.find(m => m.key === key), sheet = SHEETS[key];
  const [W, H] = sheet.size;
  const svg = $('sheet'), fx = $('fx');
  const FONTS = ['70px "Young Serif"', '16px Gaegu'];
  const gallery = typeof GALLERY === 'undefined' ? null : GALLERY;
  const fontsLoaded = async () => {
    await document.fonts.ready;
    const loaded = await Promise.all(FONTS.map(f => document.fonts.load(f)));
    return loaded.every(l => l.length) && FONTS.every(f => document.fonts.check(f));
  };
  // A new hash names another page: load it fresh rather than patch this one.
  window.addEventListener('hashchange', () => {
    const h = new URLSearchParams(location.hash.slice(1));
    if ((h.get('sheet') || '') !== (hash.get('sheet') || '')) location.reload();
  });

  if (gallery && !hash.get('sheet')) {
    document.body.classList.add('gallery');
    document.title = 'All charts';
    $('kindName').textContent = 'All charts';
    $('back').hidden = true; $('pager').hidden = true;
    const grid = document.createElement('div');
    grid.id = 'cards';
    for (const g of new Set(gallery.map(e => e.group))) {
      const items = gallery.filter(e => e.group === g);
      const sec = document.createElement('section');
      sec.innerHTML = '<h2></h2><div class="row"></div>';
      sec.querySelector('h2').textContent = g;
      for (const e of items) {
        const a = document.createElement('a');
        a.className = 'card';
        a.href = '#sheet=' + encodeURIComponent(e.key);
        a.innerHTML = '<b></b><small></small>';
        a.querySelector('b').textContent = e.type;
        a.querySelector('small').textContent = e.question;
        sec.querySelector('.row').append(a);
      }
      grid.append(sec);
    }
    $('stage').replaceChildren(grid);
    fontsLoaded().then(ok => { if (ok) document.body.dataset.ready = '1'; });
    return;
  }

  const entry = gallery && gallery.find(e => e.key === key);
  document.body.dataset.sheet = key;
  document.title = entry ? entry.type : meta.name;
  $('kindName').textContent = entry ? entry.type : meta.name;
  $('kindAbout').textContent = entry ? entry.question : sheet.about;
  if (gallery) $('back').href = '#';
  const at = keys.indexOf(key);
  $('pos').textContent = `${at + 1} / ${keys.length}`;
  $('prev').disabled = at === 0;
  $('next').disabled = at === keys.length - 1;
  $('prev').onclick = () => { location.hash = `sheet=${keys[at - 1]}`; };
  $('next').onclick = () => { location.hash = `sheet=${keys[at + 1]}`; };
  $('pager').hidden = keys.length < 2;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  for (const r of ['paper', 'grid']) { $(r).setAttribute('width', W); $(r).setAttribute('height', H); }
  $('frame').style.setProperty('--ratio', `${W} / ${H}`);
  if (hash.get('bare') === '1') {
    document.body.classList.add('bare');
    svg.setAttribute('width', W); svg.setAttribute('height', H);
  }

  // ---- camera: the view box eases toward a target
  let view = [0, 0, W, H], to = view, dur = 0, back = 0, tracked = null, trackW = 0;
  const setView = v => {
    view = v; svg.setAttribute('viewBox', v.map(n => n.toFixed(1)).join(' '));
    if (tracked) $('zoom').querySelector('.pct').textContent = Math.round(W / v[2] * 100) + '%';
    svg.classList.toggle('zoomed', v[2] < W - 1);
    showWhere();
  };
  // A zoomed view cuts off the status lines in the sheet's corner, so a copy
  // of them stays on top of the stage while the view is zoomed.
  function showWhere() {
    const big = document.getElementById('statusBig'), box = $('where');
    box.hidden = view[2] >= W - 1 || !big;
    if (box.hidden) return;
    const small = document.getElementById('statusSmall');
    box.firstChild.textContent = big.textContent;
    box.lastChild.textContent = small ? small.textContent : '';
  }
  const fit = (cx, cy, w) => {
    w = Math.min(W, Math.max(W / 4, w));
    const h = w * H / W;
    return [Math.min(W - w, Math.max(0, cx - w / 2)), Math.min(H - h, Math.max(0, cy - h / 2)), w, h];
  };
  // A bare page is a picture of the sheet: its camera never moves.
  const still = hash.get('bare') === '1' || hash.get('export') === '1';
  // A GIF keeps the whole sheet in view: a moving camera changes every pixel
  // of every frame, and the file grows tenfold.
  const fixed = still || hash.get('gif') === '1';
  const moveTo = (v, ms = 900) => {
    if (fixed) return;
    to = v; dur = ms;
    $('zoom').querySelector('.pct').textContent = Math.round(W / v[2] * 100) + '%';
  };
  // A zoom the reader chose wins over the sheet's camera until they press Fit.
  let manual = false;
  const zoomBy = f => { manual = true; moveTo(fit(to[0] + to[2] / 2, to[1] + to[3] / 2, to[2] / f), 300); };
  $('zoom').addEventListener('click', e => {
    const z = e.target.dataset.z;
    tracked = null;
    if (z === 'in') zoomBy(1.25);
    if (z === 'out') zoomBy(1 / 1.25);
    if (z === 'fit') { manual = false; moveTo([0, 0, W, H], 300); }
  });
  // A press becomes a drag only once it moves a few pixels, so a click that
  // shakes a little still clicks and the sheet's camera keeps following.
  let drag = null;
  svg.addEventListener('pointerdown', e => {
    if (!still && e.button === 0 && to[2] < W - 1) drag = { x: e.clientX, y: e.clientY, v: to.slice(), moved: false };
  });
  addEventListener('pointerup', () => { if (drag && drag.moved) addEventListener('click', e => e.stopPropagation(), { capture: true, once: true }); drag = null; });
  addEventListener('pointermove', e => {
    if (!drag) return;
    if (!e.buttons) { drag = null; return; }
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    const k = drag.v[2] / svg.clientWidth, v = drag.v;
    drag.moved = manual = true; dur = 0; tracked = null; to = fit(v[0] + v[2] / 2 - dx * k, v[1] + v[3] / 2 - dy * k, v[2]);
    setView(to);
  });
  // The view closes a share of the gap to its target each frame, so a target
  // that moves on every frame (a tracked thing) never restarts the ease.
  function camera(dt) {
    if (tracked && !manual) {
      if (!tracked.isConnected) tracked = null;
      else {
        const r = tracked.getBoundingClientRect(), m = svg.getScreenCTM().inverse();
        const c = new DOMPoint(r.x + r.width / 2, r.y + r.height / 2).matrixTransform(m);
        to = fit(c.x, c.y, trackW); dur = dur || 900;
      }
    }
    if (!dur) return;
    const k = 1 - Math.pow(0.01, Math.min(0.05, dt) * 1000 / dur), e = to.map((a, i) => a + (view[i] - a) * (1 - k));
    if (to.every((a, i) => Math.abs(a - e[i]) < 0.3)) { setView(to); if (!tracked) dur = 0; }
    else setView(e);
  }
  let following = false, stateId = null;
  function followTo(id) {
    if (manual) return;
    const el = svg.querySelector(`[data-state="${CSS.escape(id)}"]`);
    if (!el) { console.warn(`follow: no [data-state="${id}"] on the sheet`); return; }
    const b = el.getBBox();
    // keep about one ordinary sheet in view, so the next steps show too
    moveTo(fit(b.x + b.width / 2, b.y + b.height / 2, Math.max(1100, Math.max(b.width, b.height * W / H) * 2.2)));
  }

  // ---- animation lock: a press while busy finishes the running animation first
  // More than one move can run at once (a walk and its dial), so the lock is a set.
  const anims = new Set();

  // ---- clock times in the status lines roll on to the new time, minute by
  // minute, instead of jumping. The status a sheet last drew is read when a
  // redraw replaces the picture: a sheet that redraws on every frame of a
  // move has shown the times on the way already, so only the rest rolls.
  const CLOCK = /(\d{1,2}):(\d{2})/g, seen = {}, rolling = {};
  const statusText = id => { const el = document.getElementById(id); return el ? el.textContent : null; };
  new MutationObserver(() => { for (const id of ['statusBig', 'statusSmall']) seen[id] = statusText(id); showWhere(); })
    .observe($('art'), { childList: true });
  function rollClocks() {
    for (const id of ['statusBig', 'statusSmall']) {
      const now = statusText(id), was = seen[id];
      seen[id] = now;
      if (still || !now || !was || now === was) continue;
      const a = [...was.matchAll(CLOCK)], b = [...now.matchAll(CLOCK)], mins = m => +m[1] * 60 + +m[2];
      if (!b.length || a.length !== b.length || a.every((m, i) => mins(m) === mins(b[i]))) continue;
      const from = a.map(mins), to = b.map(mins), ms = Math.min(900, 350 + Math.max(...to.map((m, i) => Math.abs(m - from[i]))) * 6);
      const fmt = (m, i) => { const h = Math.floor(m / 60) % 24, mm = String(m % 60).padStart(2, '0'); return (b[i][1].length === 2 && h < 10 ? '0' : '') + h + ':' + mm; };
      const token = rolling[id] = {}, t0 = performance.now();
      const step = t => {
        if (rolling[id] !== token) return;
        const el = document.getElementById(id), k = Math.min(1, (t - t0) / ms), e = easeInOut(k);
        if (!el) return;
        let i = 0;
        el.textContent = now.replace(CLOCK, () => { const v = fmt(Math.round(from[i] + (to[i] - from[i]) * e), i); i++; return v; });
        if (k < 1) requestAnimationFrame(step); else el.textContent = now;
        showWhere();
      };
      step(t0);
    }
  }
  const finishAll = () => { for (const a of [...anims]) { anims.delete(a); a.finish(); } };
  let nButtons = 0, pressed = null, timer = 0;
  const press = fn => () => {
    finishAll();
    clearTimeout(back);
    clearTimeout(timer);
    run(fn);
  };
  function run(fn) {
    try { return fn(); } catch (e) { fail(e); }
  }
  function fail(e) {
    console.error(e);
    $('error').hidden = false;
    $('error').textContent = String(e && e.message || e);
    $('status').textContent = String(e && e.message || e);
    document.body.dataset.error = '1';
  }
  // A throw in a move's callback runs after run() has returned.
  addEventListener('error', e => fail(e.error || e.message));
  addEventListener('unhandledrejection', e => fail(e.reason));

  const ctx = {
    say: text => { $('status').textContent = text; },
    hint: text => { $('hint').textContent = text; },
    // a refusal: the reason, and a short shake of the button that was pressed
    no(text) {
      $('status').textContent = text;
      if (!still && pressed && pressed.animate) {
        pressed.animate(['0', '-8px', '8px', '-5px', '5px', '-2px', '0'].map(x => ({ transform: `translateX(${x})` })), { duration: 360, easing: 'ease-out' });
      }
    },
    still,
    button(label, fn) {
      if (++nButtons > 4) throw new Error('At most 4 event buttons');
      const b = document.createElement('button');
      b.textContent = label;
      const go = press(fn);
      b.onclick = () => { pressed = b; go(); };
      $('actions').append(b);
      return b;
    },
    clear() {
      for (const b of [...$('actions').querySelectorAll('button:not(.run):not(.reset)')]) b.remove();
      nButtons = 0;
      fx.innerHTML = '';
    },
    state(id) {
      rollClocks();
      // a redraw in the same state draws new marks: they must not pop again
      const fresh = id !== stateId;
      stateId = id;
      for (const el of svg.querySelectorAll('[data-state]')) {
        const on = el.dataset.state === id;
        el.classList.toggle('lit', on);
        if (fresh) el.classList.toggle('pop', on);
        // lines, arrow heads and marks with their own transform fade in, not hop
        if (fresh && on && !still) for (const m of el.querySelectorAll(':scope .on > *')) {
          const b = m.getBBox ? m.getBBox() : null;
          if (m.classList.contains('head') || m.hasAttribute('transform') || (b && Math.min(b.width, b.height) < 8 && Math.max(b.width, b.height) > 24)) m.classList.add('flat-in');
        }
      }
      const h = new URLSearchParams(location.hash.slice(1));
      h.set('state', id);
      if (keys.length > 1) h.set('sheet', key);
      history.replaceState(null, '', '#' + h.toString().replace(/%2C/g, ','));
      document.dispatchEvent(new CustomEvent('tc:state', { detail: id }));
      if (following) followTo(id);
    },
    busy: a => { anims.add(a); },
    idle: a => { if (a) anims.delete(a); else anims.clear(); },
    // the camera keeps el in the middle, w sheet pixels wide; track(null)
    // stops and leaves the view where it is
    track(el, w = W / 1.6) { tracked = fixed ? null : el; trackW = w; },
    focus(sx, sy, zoom = 1.7, hold = 0) {
      if (!manual) moveTo(fit(sx, sy, W / zoom));
      clearTimeout(back);
      if (hold) back = setTimeout(() => { if (!manual) moveTo([0, 0, W, H]); }, hold);
    },
    follow(on = true) {
      following = on;
      if (on && stateId) followTo(stateId);
      if (!on && !manual) moveTo([0, 0, W, H]);
    },
    bubble(sx, sy, text) {
      const w = text.length * 9.6 + 28, h = 38, x = sx - w / 2, y = sy - h - 14;
      fx.innerHTML = `<g class="bubble"><path d="M${x + 8} ${y}H${x + w - 8}Q${x + w} ${y} ${x + w} ${y + 8}V${y + h - 8}Q${x + w} ${y + h} ${x + w - 8} ${y + h}H${sx + 7}L${sx} ${y + h + 12}L${sx - 7} ${y + h}H${x + 8}Q${x} ${y + h} ${x} ${y + h - 8}V${y + 8}Q${x} ${y} ${x + 8} ${y}Z" fill="#fffdf6" stroke="#2b2a28" stroke-width="1.3"/><text class="it" x="${sx}" y="${y + 25}" font-size="16" text-anchor="middle" fill="#2b2a28"></text></g>`;
      fx.querySelector('text').textContent = text;
    },
    hop(el) {
      if (el && el.animate) el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }, { transform: 'translateY(0)' }], { duration: 420, easing: 'ease-out' });
    },
  };

  // ---- run the sheet
  SHEET_W = W; SHEET_H = H;
  let api = null, playAll = null;
  try {
    sheet.draw(7);
    api = sheet.init(ctx);
  } catch (e) { fail(e); }

  if (api) {
    const play = document.createElement('button');
    play.className = 'run';
    play.textContent = '▶ Play all';
    // Each step waits for its moves to end, then holds a moment to be read:
    // a fixed beat cut long moves short and finished them with a jump.
    play.onclick = () => {
      clearTimeout(timer);
      finishAll();
      const story = api.story || [];
      delete document.body.dataset.played;
      const step = i => {
        // build/gif.mjs stops recording when the story has played to its end
        if (i >= story.length) { document.body.dataset.played = '1'; return; }
        run(() => api.goto(story[i], true));
        const t0 = performance.now();
        const wait = () => {
          if (anims.size && performance.now() - t0 < 20000) { timer = setTimeout(wait, 80); return; }
          timer = setTimeout(() => step(i + 1), 1100);
        };
        timer = setTimeout(wait, 80);
      };
      step(0);
    };
    playAll = play.onclick;
    const reset = document.createElement('button');
    reset.className = 'reset';
    reset.textContent = '↺ Reset';
    // A sheet keeps its data in its own scope, so only a fresh load is a true reset.
    reset.onclick = () => {
      location.hash = keys.length > 1 ? `sheet=${encodeURIComponent(key)}` : '';
      location.reload();
    };
    $('actions').prepend(play, reset);

    const known = new Set([...svg.querySelectorAll('[data-state]')].map(el => el.dataset.state).concat(api.story || []));
    const want = hash.get('state');
    if (want) {
      if (known.has(want)) run(() => api.goto(want));
      else if (hash.get('export') === '1') fail(new Error(`Unknown state: ${want}`));
      else {
        run(() => api.goto((api.story || [])[0]));
        ctx.say(`Unknown state: ${want}`);
      }
    }

    let last = 0;
    const frame = now => {
      camera(last ? (now - last) / 1000 : 0);
      if (api.tick && !still) run(() => api.tick(now / 1000, last ? (now - last) / 1000 : 0));
      last = now;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    if (api.click) svg.addEventListener('click', e => run(() => api.click(e)));
    svg.addEventListener('click', e => {
      const p = e.target.closest?.('.person[data-say]');
      if (!p) return;
      const r = p.getBoundingClientRect(), m = svg.getScreenCTM().inverse();
      const at = new DOMPoint(r.x + r.width / 2, r.y).matrixTransform(m);
      ctx.bubble(at.x, at.y, p.dataset.say);
    });
  }

  // ---- audit: text off the sheet or on top of other text
  // getBBox spans the font's whole line box; the inked letters fill about
  // the middle 60% of it, so the box is trimmed before the overlap test.
  function boxOf(el) {
    const b = el.getBBox(), m = svg.getScreenCTM().inverse().multiply(el.getScreenCTM());
    const y0 = b.y + b.height * 0.2, y1 = b.y + b.height * 0.8;
    const pts = [[b.x, y0], [b.x + b.width, y0], [b.x, y1], [b.x + b.width, y1]]
      .map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
  }
  function auditLines() {
    const lines = [], texts = [...$('art').querySelectorAll('text')]
      .filter(t => t.textContent.trim() && t.getBBox().width > 0)
      .map(t => ({ t, s: t.textContent.trim(), b: boxOf(t), on: !t.closest('[data-state]:not(.lit) .on') }));
    for (const { s, b } of texts) {
      if (b.x0 < -1 || b.y0 < -1 || b.x1 > W + 1 || b.y1 > H + 1) lines.push(`off sheet: "${s}" at ${Math.round(b.x0)},${Math.round(b.y0)}`);
    }
    const shown = texts.filter(x => x.on);
    for (let i = 0; i < shown.length; i++) for (let j = i + 1; j < shown.length; j++) {
      const a = shown[i].b, c = shown[j].b;
      // a lit overlay repeats its own label in the same place
      if (shown[i].s === shown[j].s && Math.abs(a.x0 - c.x0) < 4 && Math.abs(a.y0 - c.y0) < 4) continue;
      const w = Math.min(a.x1, c.x1) - Math.max(a.x0, c.x0), h = Math.min(a.y1, c.y1) - Math.max(a.y0, c.y0);
      const small = Math.min((a.x1 - a.x0) * (a.y1 - a.y0), (c.x1 - c.x0) * (c.y1 - c.y0));
      if (w > 0 && h > 0 && w * h > 0.2 * small) lines.push(`overlap: "${shown[i].s}" and "${shown[j].s}"`);
    }
    return lines;
  }
  // audit=all opens every state the sheet marks or tells in its story, and
  // audits each one; a line starts with the state it was found in.
  async function audit(all) {
    // the drop-in of the now marks would move a lit label off its own place
    document.body.classList.add('audit');
    setView([0, 0, W, H]);
    let lines = auditLines();
    if (all && api) {
      const ids = [...new Set([...svg.querySelectorAll('[data-state]')].map(el => el.dataset.state).concat(api.story || []))];
      lines = [];
      for (const id of ids) { run(() => api.goto(id)); setView([0, 0, W, H]); lines.push(...auditLines().map(l => `${id}: ${l}`)); }
      if (api.story && api.story[0]) run(() => api.goto(api.story[0]));
    }
    const pre = document.createElement('pre');
    pre.id = 'audit';
    pre.textContent = lines.join('\n');
    document.body.append(pre);
    // goto(id) alone never runs a sheet's moves; Play all runs every one.
    if (all && playAll) {
      playAll();
      await new Promise(done => { const wait = () => (document.body.dataset.played ? done() : setTimeout(wait, 200)); wait(); });
    }
  }

  // ---- export: a clean copy of the sheet for export.mjs. Marks of unlit
  // states are dropped, so the file needs no shell CSS to look right.
  function exportSvg() {
    const c = svg.cloneNode(true);
    c.setAttribute('viewBox', `0 0 ${W} ${H}`);
    c.setAttribute('width', W); c.setAttribute('height', H);
    c.removeAttribute('id'); c.removeAttribute('style');
    for (const el of c.querySelectorAll('[data-state]:not(.lit) .on')) el.remove();
    for (const el of c.querySelectorAll('.lit, .peek')) el.classList.remove('lit', 'peek');
    for (const el of c.querySelectorAll('[class=""]')) el.removeAttribute('class');
    const t = document.createElement('textarea');
    t.id = 'svgout';
    t.textContent = new XMLSerializer().serializeToString(c);
    document.body.append(t);
    document.body.dataset.story = JSON.stringify(api ? api.story || [] : []);
  }

  // ---- ready: fonts really loaded, hash state applied
  (async () => {
    if (!await fontsLoaded()) {
      fail(new Error('Fonts did not load'));
      return;
    }
    if (hash.get('audit') === '1' || hash.get('audit') === 'all') await audit(hash.get('audit') === 'all');
    if (hash.get('export') === '1') exportSvg();
    if (!document.body.dataset.error) document.body.dataset.ready = '1';
  })();
})();
