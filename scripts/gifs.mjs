// Record the README GIF of each example sheet: Play all, into docs/gifs/<slug>.gif.
// It also writes the clip and the poster that the Pages site uses, into docs/media/.
// Not part of the skill. Needs ffmpeg.
// bun scripts/gifs.mjs [slug...]   (no slug: every sheet in the gallery)
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { TYPES } from '../tinycharts/build/types.mjs';

const gallery = TYPES.map(t => t.slug);
const args = process.argv.slice(2), slugs = args.length ? args : gallery;
const bad = slugs.filter(s => !gallery.includes(s));
if (bad.length) { console.error(`Not in the gallery: ${bad.join(', ')}`); process.exit(1); }

const run = (...a) => spawnSync(process.execPath, a, { encoding: 'utf8' });
const ffmpeg = (...a) => spawnSync('ffmpeg', ['-v', 'error', '-y', ...a], { encoding: 'utf8' });
// A 6 MB GIF is about 270 KB as H.264. The first frame is the poster.
const media = s => {
  const gif = `docs/gifs/${s}.gif`;
  return [
    ffmpeg('-i', gif, '-movflags', '+faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-c:v', 'libx264', '-crf', '26', '-preset', 'slow', `docs/media/${s}.mp4`),
    ffmpeg('-i', gif, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '80', `docs/media/${s}.webp`),
    ...(s === 'flow-machine' ? [ffmpeg('-i', gif, '-frames:v', '1', 'docs/media/og.png')] : []),
  ].find(r => r.status !== 0);
};
fs.mkdirSync('docs/gifs', { recursive: true });
fs.mkdirSync('docs/media', { recursive: true });
fs.mkdirSync('.tmp/gifsrc', { recursive: true });
let failed = 0;
for (const s of slugs) {
  const html = `.tmp/gifsrc/${s}.html`, t0 = Date.now();
  const r = run('tinycharts/build/build.mjs', `tinycharts/examples/${s}.js`, '-o', html);
  const g = r.status === 0 && run('tinycharts/build/gif.mjs', html, '-o', `docs/gifs/${s}.gif`);
  const m = g && g.status === 0 && media(s);
  if (!g || g.status !== 0 || m) { failed++; console.log(`${s}: failed\n${(m || g || r).stderr}`); continue; }
  console.log(`${s}: ${Math.round((Date.now() - t0) / 1000)} s, ${Math.round(fs.statSync(`docs/gifs/${s}.gif`).size / 1024)} KB`);
}
process.exit(failed ? 1 : 0);
