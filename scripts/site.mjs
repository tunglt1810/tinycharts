// Builds the GitHub Pages site from README.md: bun scripts/site.mjs [-o _site]
// GitHub's own markdown API renders the page, so it looks like the README on
// github.com. Links to repo files go to github.com, because Pages only serves
// the GIFs.
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const outDir = process.argv[process.argv.indexOf('-o') + 1] || '_site';
const repo = process.env.GITHUB_REPOSITORY;
const ref = process.env.GITHUB_REF_NAME || 'main';
const token = process.env.GITHUB_TOKEN;
if (!repo) throw new Error('set GITHUB_REPOSITORY to owner/name');

const blob = p => `https://github.com/${repo}/blob/${ref}/${p}`;
const local = p => !/^(https?:|#|mailto:|docs\/gifs\/)/.test(p);
const md = readFileSync('README.md', 'utf8')
  .replace(/\]\(([^)\s]+)\)/g, (m, p) => local(p) ? `](${blob(p)})` : m)
  .replace(/href="([^"]+)"/g, (m, p) => local(p) ? `href="${blob(p)}"` : m)
  .replaceAll('<this repo>', `https://github.com/${repo}.git`);

const res = await fetch('https://api.github.com/markdown', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
  body: JSON.stringify({ text: md, mode: 'gfm', context: repo }),
});
if (!res.ok) throw new Error(`markdown API: ${res.status} ${await res.text()}`);
const body = await res.text();
const title = md.match(/^# (.+)$/m)[1];

mkdirSync(outDir, { recursive: true });
cpSync('docs/gifs', `${outDir}/docs/gifs`, { recursive: true });
writeFileSync(`${outDir}/index.html`, `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css">
<style>
  body { margin: 0; background: #fff; }
  @media (prefers-color-scheme: dark) { body { background: #0d1117; } }
  .markdown-body { box-sizing: border-box; max-width: 1012px; margin: 0 auto; padding: 45px 16px; }
</style>
</head>
<body>
<article class="markdown-body">
<p><a href="https://github.com/${repo}">github.com/${repo}</a></p>
${body}
</article>
</body>
</html>
`);
console.log(`wrote ${outDir}/index.html`);
