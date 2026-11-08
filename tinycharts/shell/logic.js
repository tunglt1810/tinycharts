/* Tinycharts logic panel: the checked rules and the statechart drawn by pele.
   It runs before app.js, so it hears every tc:state, and builds itself once
   the page has loaded. */
(() => {
  let now = null;
  const mark = () => {
    for (const el of document.querySelectorAll('#logic .pele-state[data-id]')) el.classList.toggle('now', el.dataset.id === now);
  };
  document.addEventListener('tc:state', e => { now = e.detail; mark(); });

  document.addEventListener('DOMContentLoaded', () => {
    const key = document.body.dataset.sheet, data = LOGICDATA[key];
    if (!data) return;
    const btn = document.getElementById('logicBtn');
    const panel = document.createElement('aside');
    panel.id = 'logic';
    panel.hidden = true;
    panel.innerHTML = `<header><h2>The logic</h2><button class="close" aria-label="Close">&times;</button></header>
      <p class="intro">Each rule below holds on every path through a small model of this drawing. The line under it says how it would break.</p>
      <ol class="rules"></ol>
      <div class="tools"><button data-z="out" aria-label="Zoom out">&minus;</button><span class="pct">100%</span><button data-z="in" aria-label="Zoom in">+</button><button data-z="fit">Fit</button><span class="gap"></span><button data-z="full">Full screen</button></div>
      <div class="chart"></div>
      <p class="checked"></p>`;
    for (const r of data.rules) {
      const li = document.createElement('li');
      li.innerHTML = '<p class="rule"></p><p class="says"></p><p class="breaks"></p>';
      li.querySelector('.rule').textContent = r.rule;
      li.querySelector('.says').textContent = r.says;
      li.querySelector('.breaks').textContent = 'breaks: ' + r.path;
      panel.querySelector('.rules').append(li);
    }
    panel.querySelector('.checked').textContent = data.checked;
    document.body.append(panel);

    const chart = panel.querySelector('.chart');
    if (PELE[key]) chart.innerHTML = PELE[key];
    else { chart.hidden = true; panel.querySelector('.tools').hidden = true; }

    // zoom: the SVG keeps its own size times a scale; Fit fills the box width
    const svg = chart.querySelector('svg');
    let scale = 1;
    const zoom = s => {
      if (!svg) return;
      scale = Math.min(4, Math.max(0.25, s));
      svg.style.width = svg.getAttribute('width') * scale + 'px';
      svg.style.maxWidth = 'none';
      panel.querySelector('.pct').textContent = Math.round(scale * 100) + '%';
    };
    const fit = () => svg && zoom(Math.min(1, (chart.clientWidth - 24) / svg.getAttribute('width')));
    panel.querySelector('.tools').addEventListener('click', e => {
      const z = e.target.dataset.z;
      if (z === 'in') zoom(scale * 1.25);
      if (z === 'out') zoom(scale / 1.25);
      if (z === 'fit') fit();
      if (z === 'full') chart.requestFullscreen && chart.requestFullscreen();
    });

    chart.addEventListener('click', e => {
      const node = e.target.closest('.pele-state[data-id]');
      if (!node) return;
      for (const el of document.querySelectorAll('#art .peek')) el.classList.remove('peek');
      const hits = document.querySelectorAll(`#art [data-state="${CSS.escape(node.dataset.id)}"]`);
      for (const el of hits) el.classList.add('peek');
      setTimeout(() => hits.forEach(el => el.classList.remove('peek')), 1800);
    });

    const show = on => {
      panel.hidden = !on;
      document.body.classList.toggle('with-logic', on);
      btn.textContent = on ? 'Hide the logic' : 'Show the logic';
      if (on) fit();
    };
    btn.hidden = false;
    btn.onclick = () => show(panel.hidden);
    panel.querySelector('.close').onclick = () => show(false);
    if (new URLSearchParams(location.hash.slice(1)).get('logic') === '1') show(true);
    mark();
  });
})();
