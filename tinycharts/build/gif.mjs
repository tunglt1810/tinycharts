// Record a sheet's Play all as an animated GIF.
// bun tinycharts/build/gif.mjs out.html [--sheet <key>] [--width 560] [--fps 10] [--max 180] -o out.gif
// Needs Chrome and ffmpeg. No npm packages: it talks to Chrome over the
// DevTools protocol with Bun's own WebSocket.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { chromePath, HEADLESS } from './chrome.mjs';

function parse(args) {
  const { values: v, positionals: [html] } = parseArgs({ args, allowPositionals: true, options: {
    sheet: { type: 'string' }, width: { type: 'string', default: '560' }, fps: { type: 'string', default: '10' }, max: { type: 'string', default: '180' }, o: { type: 'string', short: 'o' },
  } });
  if (!html || !v.o) throw new Error('Usage: gif.mjs out.html [--sheet <key>] [--width 560] [--fps 10] [--max 180] -o out.gif');
  return { html, sheet: v.sheet || null, width: +v.width, fps: +v.fps, max: +v.max, out: v.o };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function launch(dir) {
  const p = spawn(chromePath(), [...HEADLESS, '--allow-file-access-from-files', '--remote-debugging-port=0',
    `--user-data-dir=${dir}`, 'about:blank'], { stdio: 'ignore' });
  const portFile = path.join(dir, 'DevToolsActivePort');
  for (let t = 0; !fs.existsSync(portFile); t++) {
    if (t > 100) { p.kill('SIGKILL'); throw new Error('Chrome did not open its DevTools port.'); }
    await sleep(100);
  }
  const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
  const page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page');
  return { p, url: page.webSocketDebuggerUrl };
}

function connect(url) {
  const ws = new WebSocket(url), wait = new Map(), on = {};
  let id = 0;
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && wait.has(m.id)) { const [ok, no] = wait.get(m.id); wait.delete(m.id); m.error ? no(new Error(m.error.message)) : ok(m.result); }
    else if (on[m.method]) on[m.method](m.params);
  };
  const send = (method, params = {}) => new Promise((ok, no) => { wait.set(++id, [ok, no]); ws.send(JSON.stringify({ id, method, params })); });
  return new Promise((ok, no) => { ws.onopen = () => ok({ send, on, close: () => ws.close() }); ws.onerror = no; });
}

export async function recordGif(o) {
  const tmp = path.join(process.cwd(), '.tmp', 'gif');
  fs.mkdirSync(tmp, { recursive: true });
  const dir = fs.mkdtempSync(path.join(tmp, 'run-')), frames = path.join(dir, 'frames');
  fs.mkdirSync(frames);
  const { p, url } = await launch(path.join(dir, 'profile'));
  try {
    const cdp = await connect(url);
    const js = async expr => (await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
    await cdp.send('Page.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 1400, deviceScaleFactor: 1, mobile: false });
    const hash = '#' + [o.sheet && `sheet=${encodeURIComponent(o.sheet)}`, 'gif=1'].filter(Boolean).join('&');
    await cdp.send('Page.navigate', { url: pathToFileURL(path.resolve(o.html)).href + hash });
    for (let t = 0; !(await js('document.body && document.body.dataset.ready === "1"')); t++) {
      if (t > 150) throw new Error('gif: sheet not ready after 15 s' + ((await js('document.body.dataset.error || ""')) ? `: ${await js('document.body.dataset.error')}` : ''));
      await sleep(100);
    }
    // Only the sheet fills the window: the side panel and the zoom buttons
    // are page chrome, not part of the picture.
    const [w, h] = await js(`(() => {
      const vb = document.getElementById('sheet').viewBox.baseVal;
      const s = document.createElement('style');
      s.textContent = '#frame{position:fixed!important;inset:0;width:100vw!important;margin:0;z-index:10;background:#fbf7ef} #zoom{display:none!important} #sheet{width:100%;height:100%}';
      document.head.append(s);
      return [vb.width, vb.height];
    })()`);
    const vw = o.width, vh = Math.round(o.width * h / w);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: vw, height: vh, deviceScaleFactor: 2, mobile: false });
    await sleep(300);

    const shots = [];
    cdp.on['Page.screencastFrame'] = ({ data, metadata, sessionId }) => {
      const file = path.join(frames, `f${String(shots.length).padStart(5, '0')}.jpg`);
      fs.writeFileSync(file, Buffer.from(data, 'base64'));
      shots.push([file, metadata.timestamp]);
      cdp.send('Page.screencastFrameAck', { sessionId });
    };
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1 });
    await sleep(600);
    await js(`document.querySelector('#actions button.run').click()`);
    const t0 = Date.now();
    while (!(await js('document.body.dataset.played === "1"'))) {
      if (Date.now() - t0 > o.max * 1000) { console.warn(`gif: stopped at ${o.max} s before the story ended`); break; }
      await sleep(200);
    }
    await cdp.send('Page.stopScreencast');
    cdp.close();
    if (shots.length < 2) throw new Error('gif: no frames were recorded.');

    // A screencast sends a frame only when the picture changes, so each frame
    // keeps its own duration until the next one.
    const list = shots.map(([f, ts], i) => `file '${f}'\nduration ${Math.max(0.001, ((shots[i + 1] || [0, ts + 1])[1] - ts)).toFixed(3)}`);
    fs.writeFileSync(path.join(dir, 'list.txt'), list.join('\n') + `\nfile '${shots[shots.length - 1][0]}'\n`);
    fs.mkdirSync(path.dirname(path.resolve(o.out)), { recursive: true });
    const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'),
      '-vf', `fps=${o.fps},scale=${o.width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle`,
      '-loop', '0', path.resolve(o.out)], { stdio: 'inherit' });
    if (ff.error) throw new Error('gif: ffmpeg not found. Install it, for example: brew install ffmpeg');
    if (ff.status !== 0) throw new Error(`gif: ffmpeg exited with ${ff.status}`);
    return o.out;
  } finally {
    p.kill('SIGKILL');
    await sleep(200);
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  try { console.log(await recordGif(parse(process.argv.slice(2)))); }
  catch (e) { console.error(e.message); process.exit(1); }
}
