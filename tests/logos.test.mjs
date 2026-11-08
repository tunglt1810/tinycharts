import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { sourcesFor, fetchLogo } from '../tinycharts/build/logos.mjs';

const DIR = path.resolve('.tmp/test/logos');
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10z" fill="#326ce5"/></svg>';
const reply = (status, body) => ({ ok: status === 200, status, text: async () => body });
// a fake fetch: answers by source name in the URL, and counts calls
const fake = answers => {
  const f = async url => { f.calls.push(url); const k = Object.keys(answers).find(s => url.includes(s)); const a = answers[k]; if (a instanceof Error) throw a; return a || reply(404, 'nope'); };
  f.calls = [];
  return f;
};
const ENTRY = { cncf: 'kafka', simple: 'apachekafka', devicon: 'apachekafka' };

beforeEach(() => { fs.rmSync(DIR, { recursive: true, force: true }); fs.mkdirSync(DIR, { recursive: true }); });

test('sources come in the order CNCF, simple-icons, devicon', () => {
  assert.deepEqual(sourcesFor(ENTRY).map(s => s.source), ['cncf', 'simple-icons', 'devicon']);
  assert.equal(sourcesFor(ENTRY)[0].url, 'https://raw.githubusercontent.com/cncf/artwork/main/projects/kafka/icon/color/kafka-icon-color.svg');
  assert.deepEqual(sourcesFor({ simple: 'redis' }).map(s => s.source), ['simple-icons']);
});

test('takes the first source that answers', async () => {
  const f = fake({ 'simple-icons': reply(200, SVG) });
  const r = await fetchLogo('kafka', ENTRY, { fetch: f, dir: DIR });
  assert.equal(r.source, 'simple-icons');
  assert.match(fs.readFileSync(path.join(DIR, 'kafka.svg'), 'utf8'), /<path d="M0 0h10v10z"/);
});

test('a cached logo is not fetched again', async () => {
  await fetchLogo('kafka', ENTRY, { fetch: fake({ cncf: reply(200, SVG) }), dir: DIR });
  const f = fake({ cncf: reply(200, SVG) });
  const r = await fetchLogo('kafka', ENTRY, { fetch: f, dir: DIR });
  assert.equal(f.calls.length, 0);
  assert.equal(r.source, 'cached');
});

test('no source gives null and writes nothing', async () => {
  const r = await fetchLogo('kafka', ENTRY, { fetch: fake({ cncf: new Error('offline'), 'simple-icons': reply(500, '') }), dir: DIR });
  assert.equal(r, null);
  assert.ok(!fs.existsSync(path.join(DIR, 'kafka.svg')));
});

test('a reply that is not an SVG is skipped', async () => {
  const r = await fetchLogo('kafka', ENTRY, { fetch: fake({ cncf: reply(200, '<html>moved</html>'), devicon: reply(200, SVG) }), dir: DIR });
  assert.equal(r.source, 'devicon');
});

test('each saved logo gets one SOURCES.md line', async () => {
  await fetchLogo('kafka', ENTRY, { fetch: fake({ cncf: reply(200, SVG) }), dir: DIR });
  await fetchLogo('kafka', ENTRY, { fetch: fake({ cncf: reply(200, SVG) }), dir: DIR });
  const lines = fs.readFileSync(path.join(DIR, 'SOURCES.md'), 'utf8').split('\n').filter(l => l.startsWith('| kafka '));
  assert.equal(lines.length, 1);
  assert.match(lines[0], /\| kafka \| cncf \| https:\/\/raw\.githubusercontent\.com\/cncf\/artwork\/.+ \| .+ \|/);
});
