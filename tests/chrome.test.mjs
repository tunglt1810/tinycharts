import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { dumpDom } from '../tinycharts/build/chrome.mjs';

test('a large page dumps whole, even with many Chromes at once', { timeout: 120000 }, async () => {
  const file = path.resolve('.tmp/test/large.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `<!doctype html><body><p>${'x'.repeat(3 * 1024 * 1024)}</p><p id="end">end</p></body>`);
  const doms = await Promise.all(Array.from({ length: 12 }, () => dumpDom(pathToFileURL(file).href, { wait: 500 })));
  for (const d of doms) assert.match(d, /<p id="end">end<\/p>/);
});
