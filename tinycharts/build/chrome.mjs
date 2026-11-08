// Headless Chrome helper: read a page's DOM after its scripts ran, or take a
// screenshot. No npm packages: it spawns the Chrome that is already installed.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
];

export function chromePath() {
  const found = [process.env.CHROME, ...CANDIDATES].find(p => p && fs.existsSync(p));
  if (!found) throw new Error('Chrome not found. Set CHROME to its path.');
  return found;
}

// Each run gets its own profile: test files run in parallel and Chrome locks
// a profile while it runs.
function run(args, timeout) {
  const base = path.join(process.cwd(), '.tmp', 'chrome');
  fs.mkdirSync(base, { recursive: true });
  const dir = fs.mkdtempSync(path.join(base, 'p-'));
  const all = ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--hide-scrollbars', '--mute-audio', `--user-data-dir=${dir}`, ...args];
  return new Promise((resolve, reject) => {
    const p = spawn(chromePath(), all, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    p.stdout.on('data', d => { out += d; });
    p.stderr.on('data', d => { err += d; });
    const timer = setTimeout(() => p.kill('SIGKILL'), timeout);
    p.on('close', code => {
      clearTimeout(timer);
      fs.rmSync(dir, { recursive: true, force: true });
      if (code === 0) resolve(out);
      else reject(new Error(`Chrome exited with ${code ?? 'a timeout'}: ${err.slice(-400)}`));
    });
  });
}

export function dumpDom(url, { wait = 4000 } = {}) {
  return run(['--dump-dom', `--virtual-time-budget=${wait}`, url], wait + 30000);
}

export async function shot(url, file, [w, h] = [1400, 1400], { wait = 4000 } = {}) {
  await run([`--screenshot=${path.resolve(file)}`, `--window-size=${w},${h}`,
    `--virtual-time-budget=${wait}`, url], wait + 30000);
}
