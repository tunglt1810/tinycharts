// Builds the GitHub Pages site: bun scripts/site.mjs [-o _site]
// The page uses the Cozy design system (devDependency). The clips in docs/media come from scripts/gifs.mjs.
// Pages serves the page, the interactive gallery and the media. Links to repo files go to github.com.
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { TYPES } from '../tinycharts/build/types.mjs';

const outDir = process.argv[process.argv.indexOf('-o') + 1] || '_site';
const repo = process.env.GITHUB_REPOSITORY;
const ref = process.env.GITHUB_REF_NAME || 'main';
if (!repo) throw new Error('set GITHUB_REPOSITORY to owner/name');
const [owner, name] = repo.split('/');
const siteUrl = `https://${owner.toLowerCase()}.github.io/${name}/`;
const repoUrl = `https://github.com/${repo}`;
const blob = p => `${repoUrl}/blob/${ref}/${p}`;

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')}\n${r.stderr}`);
  return r.stdout;
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

mkdirSync(`${outDir}/cozy`, { recursive: true });
mkdirSync(`${outDir}/fonts`, { recursive: true });

const media = {};
for (const { slug } of TYPES) {
  const gif = readFileSync(`docs/gifs/${slug}.gif`);
  media[slug] = { w: gif.readUInt16LE(6), h: gif.readUInt16LE(8) };
}
cpSync('docs/media', `${outDir}/media`, { recursive: true });

run(process.execPath, ['scripts/gallery.mjs', '-o', `${outDir}/gallery/index.html`]);

for (const f of ['tokens.css', 'effects.css', 'motion'])
  cpSync(fileURLToPath(import.meta.resolve(`cozy/${f}`)), `${outDir}/cozy/${f === 'motion' ? 'cozy-motion.js' : f}`);
for (const f of ['young-serif-400.woff2', 'gaegu-400.woff2']) cpSync(`tinycharts/fonts/${f}`, `${outDir}/fonts/${f}`);

const readme = readFileSync('README.md', 'utf8');
const section = h => readme.split(/^## /m).find(s => s.startsWith(`${h}\n`)).slice(h.length + 1);
const intro = readme.split(/^## /m)[0].split('\n\n').slice(1);
const md = s => Bun.markdown.html(s
  .replaceAll('<this repo>', `${repoUrl}.git`)
  .replace(/\]\(([^)\s]+)\)/g, (m, p) => /^(https?:|#)/.test(p) ? m : `](${blob(p)})`)
  .replace(/^### (.+)$/gm, '#### $1'));
const credit = intro.find(p => p.startsWith('> **Credit.**')).replace(/^> /, '');

// Each group gets one Cozy category hue. The hue only separates the groups.
const HUE = { Time: 'orange', Space: 'blue', Order: 'green', Flow: 'teal', Who: 'purple', Compare: 'yellow' };
const groups = [...new Set(TYPES.map(t => t.group))];
const HERO = 'flow-machine';

const card = (t, i) => `
<article class="card cozy-lift" data-group="${t.group}" style="--hue-bg: var(--cozy-${HUE[t.group]}-bg); --hue-text: var(--cozy-${HUE[t.group]}-text); --cozy-row-delay: ${Math.min(i, 12) * 28}ms">
  <video class="sheet" muted loop playsinline preload="none" loading="lazy" width="${media[t.slug].w}" height="${media[t.slug].h}" poster="media/${t.slug}.webp" aria-label="${esc(`${t.name}: ${t.question}`)}">
    <source src="media/${t.slug}.mp4" type="video/mp4">
  </video>
  <div class="card-body">
    <span class="badge">${t.group}</span>
    <h3><a class="stretch" href="gallery/#sheet=${t.slug}">${t.name}</a></h3>
    <p class="question">${esc(t.question)}</p>
    <a class="source" href="${blob(`tinycharts/examples/${t.slug}.js`)}">examples/${t.slug}.js</a>
  </div>
</article>`;

const title = readme.match(/^# (.+)$/m)[1];
const lede = intro[0];
const description = lede.split('. ').slice(0, 1).join('') + '.';

writeFileSync(`${outDir}/index.html`, `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}: hand-drawn statechart sheets</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${siteUrl}media/og.png">
<meta property="og:url" content="${siteUrl}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#EF8F63"/><path d="M8 22c3-8 6-12 8-12s3 6 8 2" fill="none" stroke="#261101" stroke-width="3" stroke-linecap="round"/></svg>')}">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
<link rel="preload" as="image" href="media/${HERO}.webp" fetchpriority="high">
<link rel="stylesheet" href="cozy/tokens.css">
<link rel="stylesheet" href="cozy/effects.css">
<style>
  @font-face { font-family: 'Young Serif'; src: url(fonts/young-serif-400.woff2) format('woff2'); font-display: swap; }
  @font-face { font-family: 'Gaegu'; src: url(fonts/gaegu-400.woff2) format('woff2'); font-display: swap; }
  :root { --serif: 'Young Serif', Georgia, serif; --hand: 'Gaegu', var(--cozy-font-family-sans); }
  [hidden] { display: none !important; }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--cozy-bg-body); color: var(--cozy-text-primary);
    font: var(--cozy-text-body-weight) 1rem/1.6 var(--cozy-font-family-sans);
  }
  a { color: var(--cozy-text-accent); text-underline-offset: 0.2em; }
  :focus-visible { outline: 2px solid var(--cozy-focus-ring); outline-offset: 2px; }
  .wrap { max-width: 1120px; margin: 0 auto; padding-inline: var(--cozy-space-4); }
  code { font-family: var(--cozy-font-family-mono); font-size: 0.875em; background: var(--cozy-bg-muted); padding: 0.1em 0.35em; border-radius: 0.375rem; }
  pre { background: var(--cozy-bg-muted); border-radius: var(--cozy-radius-element); padding: var(--cozy-space-4); overflow-x: auto; }
  pre code { background: none; padding: 0; }

  .top { display: flex; align-items: center; justify-content: space-between; gap: var(--cozy-space-4); padding-block: var(--cozy-space-4); }
  .brand { font: 1.25rem var(--serif); color: var(--cozy-text-primary); text-decoration: none; }
  .top nav { display: flex; gap: var(--cozy-space-2); }

  .btn {
    display: inline-flex; align-items: center; gap: var(--cozy-space-2); min-height: 40px; padding: 0 var(--cozy-space-5);
    border-radius: var(--cozy-radius-full); font: 600 var(--cozy-text-label-size) var(--cozy-font-family-sans);
    text-decoration: none; cursor: pointer; border: 1px solid transparent;
  }
  .btn-primary { background: var(--cozy-accent); color: var(--cozy-on-accent); }
  .btn-secondary { background: var(--cozy-bg-surface); color: var(--cozy-text-primary); border-color: var(--cozy-border-emphasized); }
  .btn-ghost { background: none; color: var(--cozy-text-primary); }
  .btn-ghost:hover, .btn-secondary:hover { background-color: var(--cozy-overlay-hover); }

  .hero { display: grid; gap: var(--cozy-space-8); align-items: center; padding-block: var(--cozy-space-10) var(--cozy-space-12); }
  @media (width >= 860px) { .hero { grid-template-columns: 1.1fr 1fr; } }
  .hero h1 { font: 400 clamp(2.5rem, 7vw, 4rem)/1.1 var(--serif); margin: 0 0 var(--cozy-space-4); letter-spacing: -0.01em; }
  .hero .lede { font-size: 1.125rem; color: var(--cozy-text-secondary); margin: 0 0 var(--cozy-space-6); max-width: 38rem; }
  .actions { display: flex; flex-wrap: wrap; gap: var(--cozy-space-3); }
  .hero-sheet { width: 100%; height: auto; border-radius: var(--cozy-radius-page); box-shadow: var(--cozy-shadow-high); background: var(--cozy-bg-surface); }

  .stats { display: grid; gap: var(--cozy-space-4); grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: var(--cozy-space-10); }
  .cozy-stat-card { padding: var(--cozy-space-5); color: var(--cozy-text-primary); }
  .cozy-stat-card b { display: block; font: 400 2rem/1.2 var(--serif); }

  .credit { border-radius: var(--cozy-radius-container); background: var(--cozy-info-muted); color: var(--cozy-on-info-muted); padding: var(--cozy-space-4) var(--cozy-space-5); margin-bottom: var(--cozy-space-12); }
  .credit p { margin: 0; }
  .credit a { color: inherit; }

  h2 { font: 400 var(--cozy-text-display-size)/var(--cozy-text-display-leading) var(--serif); margin: 0 0 var(--cozy-space-2); }
  .sub { color: var(--cozy-text-secondary); margin: 0 0 var(--cozy-space-6); }
  .toolbar { display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--cozy-space-3); margin-bottom: var(--cozy-space-6); }
  .chips { display: flex; flex-wrap: wrap; gap: var(--cozy-space-2); }
  .chip {
    min-height: 36px; padding: 0 var(--cozy-space-4); border-radius: var(--cozy-radius-full); cursor: pointer;
    border: 1px solid var(--cozy-border-emphasized); background: var(--cozy-bg-surface); color: var(--cozy-text-primary);
    font: 500 var(--cozy-text-label-size) var(--cozy-font-family-sans);
  }
  .chip:hover { background-color: var(--cozy-overlay-hover); }
  .chip[aria-pressed='true'] { background: var(--cozy-bg-inverted); color: var(--cozy-text-on-inverted); border-color: transparent; }
  .chip .n { opacity: 0.7; margin-inline-start: var(--cozy-space-1); }

  .grid { display: grid; gap: var(--cozy-space-5); grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); margin-bottom: var(--cozy-space-12); }
  .card {
    position: relative; display: flex; flex-direction: column; overflow: hidden;
    background: var(--cozy-bg-surface); border: 1px solid var(--cozy-border); border-radius: var(--cozy-radius-card-expressive); box-shadow: var(--cozy-shadow-low);
  }
  .card:has(.stretch:focus-visible) { outline: 2px solid var(--cozy-focus-ring); outline-offset: 2px; }
  .card .stretch:focus-visible { outline: none; }
  .sheet { display: block; width: 100%; height: auto; aspect-ratio: 1; object-fit: contain; background: var(--cozy-bg-muted); }
  .card-body { padding: var(--cozy-space-4) var(--cozy-space-5) var(--cozy-space-5); display: flex; flex-direction: column; gap: var(--cozy-space-1); }
  .badge { align-self: start; font: 600 var(--cozy-text-supporting-size)/1.6 var(--cozy-font-family-sans); padding: 0 var(--cozy-space-2); border-radius: var(--cozy-radius-full); background: var(--hue-bg); color: var(--hue-text); }
  .card h3 { font: 400 1.25rem/1.3 var(--serif); margin: var(--cozy-space-1) 0 0; }
  .card h3 a { color: var(--cozy-text-primary); text-decoration: none; }
  .stretch::after { content: ''; position: absolute; inset: 0; }
  .question { font: 1.25rem/1.2 var(--hand); color: var(--cozy-text-accent); margin: 0; }
  .source { position: relative; z-index: 1; align-self: start; font-size: var(--cozy-text-supporting-size); color: var(--cozy-text-secondary); margin-top: var(--cozy-space-2); }

  .start { display: grid; gap: var(--cozy-space-6); margin-bottom: var(--cozy-space-12); }
  @media (width >= 860px) { .start { grid-template-columns: 1fr 1fr; } }
  .panel { background: var(--cozy-bg-surface); border-radius: var(--cozy-radius-container); box-shadow: var(--cozy-shadow-low); padding: var(--cozy-space-6); min-width: 0; }
  .panel h3 { font: 400 var(--cozy-text-heading-1-size) var(--serif); margin: 0 0 var(--cozy-space-3); }
  .panel h4 { font: var(--cozy-text-heading-3-weight) var(--cozy-text-heading-3-size) var(--cozy-font-family-sans); margin: var(--cozy-space-6) 0 var(--cozy-space-2); }

  footer { border-top: 1px solid var(--cozy-border); padding-block: var(--cozy-space-8); color: var(--cozy-text-secondary); font-size: var(--cozy-text-body-size); }
  footer p { margin: 0 0 var(--cozy-space-2); }

  @media (prefers-reduced-motion: no-preference) {
    .js .reveal { animation: cozy-rise var(--cozy-motion-duration-entrance) var(--cozy-motion-ease-out) var(--d, 140ms) backwards; }
    .js .card { animation: cozy-rise var(--cozy-motion-duration-medium) var(--cozy-motion-ease-out) var(--cozy-row-delay) backwards; }
    @keyframes cozy-rise { from { opacity: 0; transform: translateY(12px); } }
  }
</style>
<script>document.documentElement.classList.add('js');</script>
</head>
<body>
<header class="wrap top">
  <a class="brand" href="./">${esc(title)}</a>
  <nav aria-label="Site">
    <a class="btn btn-ghost cozy-press" href="gallery/">Gallery</a>
    <a class="btn btn-ghost cozy-press" href="${repoUrl}">GitHub</a>
  </nav>
</header>
<main>
  <section class="wrap hero">
    <div>
      <h1 id="title"><span class="cozy-highlight">${esc(title)}</span></h1>
      <p class="lede reveal">${esc(lede)}</p>
      <div class="actions reveal" style="--d: 210ms">
        <a class="btn btn-primary cozy-press" href="gallery/">Open the gallery</a>
        <a class="btn btn-secondary cozy-press" href="#start">Get started</a>
      </div>
    </div>
    <video class="hero-sheet reveal sheet" style="--d: 260ms" muted loop playsinline preload="metadata" width="${media[HERO].w}" height="${media[HERO].h}" poster="media/${HERO}.webp" aria-label="Flow machine example sheet, recorded with Play all">
      <source src="media/${HERO}.mp4" type="video/mp4">
    </video>
  </section>

  <div class="wrap">
    <div class="stats">
      <div class="cozy-stat-card reveal" data-tone="peach" style="--d: 0ms"><b>${TYPES.length}</b>diagram types</div>
      <div class="cozy-stat-card reveal" data-tone="sage" style="--d: 55ms"><b>${groups.length}</b>groups: ${groups.join(', ')}</div>
      <div class="cozy-stat-card reveal" data-tone="butter" style="--d: 110ms"><b>SVG, PNG, GIF</b>export from each sheet</div>
    </div>

    <aside class="credit">${md(credit)}</aside>

    <section aria-labelledby="types">
      <h2 id="types">${TYPES.length} diagram types</h2>
      <p class="sub">Each card is a recording of Play all. Click a card to open the sheet and click its buttons yourself.</p>
      <div class="toolbar">
        <div class="chips" role="group" aria-label="Filter by group" hidden>
          <button class="chip cozy-press" type="button" aria-pressed="true" data-group="">All<span class="n">${TYPES.length}</span></button>
          ${groups.map(g => `<button class="chip cozy-press" type="button" aria-pressed="false" data-group="${g}">${g}<span class="n">${TYPES.filter(t => t.group === g).length}</span></button>`).join('\n          ')}
        </div>
        <button class="btn btn-secondary cozy-press" id="pause" type="button" aria-pressed="false" hidden>Pause animations</button>
      </div>
      <div class="grid">${TYPES.map(card).join('')}
      </div>
    </section>

    <section id="start" aria-labelledby="start-h">
      <h2 id="start-h">Get started</h2>
      <p class="sub">Tinycharts is a skill for Claude Code. Clone the repository, then link the skill folder.</p>
      <div class="start">
        <div class="panel"><h3>Requirements</h3>${md(section('Requirements'))}</div>
        <div class="panel"><h3>Setup</h3>${md(section('Setup'))}</div>
      </div>
    </section>
  </div>
</main>
<footer>
  <div class="wrap">
    <p>Code under the <a href="${blob('LICENSE')}">PolyForm Noncommercial License 1.0.0</a>. Third-party parts: <a href="${blob('tinycharts/NOTICE.md')}">NOTICE.md</a>.</p>
    <p>A fan-made reverse-engineering of <a href="https://april-zhu.com/tinycharts">tinycharts by April Zhu</a>. Page styled with <a href="https://github.com/tunglt1810/cozy">Cozy</a> (MIT).</p>
  </div>
</footer>
<script type="module">
  import { splitTitle, reducedMotion } from './cozy/cozy-motion.js';
  const h1 = document.querySelector('#title .cozy-highlight');
  if (!reducedMotion()) splitTitle(h1);

  const videos = [...document.querySelectorAll('video.sheet')];
  const pause = document.getElementById('pause');
  let paused = reducedMotion();
  const visible = new Set();
  const sync = () => {
    for (const v of videos) (!paused && visible.has(v)) ? v.play().catch(() => {}) : v.pause();
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? 'Play animations' : 'Pause animations';
  };
  // Play only the sheets in view. Lazy video loading is not in every browser, so the observer also starts the download.
  const io = new IntersectionObserver(entries => {
    for (const e of entries) e.isIntersecting ? visible.add(e.target) : visible.delete(e.target);
    sync();
  }, { rootMargin: '100px 0px' });
  videos.forEach(v => io.observe(v));
  pause.hidden = false;
  pause.onclick = () => { paused = !paused; sync(); };
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => { paused = e.matches; sync(); });

  const chips = document.querySelector('.chips');
  chips.hidden = false;
  chips.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    for (const c of chips.children) c.setAttribute('aria-pressed', String(c === chip));
    for (const card of document.querySelectorAll('.card'))
      card.hidden = chip.dataset.group !== '' && card.dataset.group !== chip.dataset.group;
  });
</script>
</body>
</html>
`);
console.log(`wrote ${outDir}/index.html`);
