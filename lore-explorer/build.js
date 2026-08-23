#!/usr/bin/env node
/* Holocron build: inline all CSS/JS into
   - dist/index.html   (standalone single file: open directly, no server needed)
   - a body-only variant for artifact publishing when OUT_ARTIFACT is set. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

function inline(html) {
  html = html.replace(/<link rel="stylesheet" href="css\/style.css">/,
    () => '<style>\n' + fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8') + '\n</style>');
  html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g,
    (m, p) => '<script>\n' + fs.readFileSync(path.join(ROOT, p), 'utf8') + '\n</script>');
  return html;
}

const full = inline(src);
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist/index.html'), full);
console.log('dist/index.html  ' + (full.length / 1024).toFixed(0) + ' KB');

/* Artifact variant: no doctype/html/head/body wrapper (the publisher adds those).
   Keep <title> first so it is picked up, then fonts link, then the inlined page. */
const OUT = process.env.OUT_ARTIFACT;
if (OUT) {
  const bodyMatch = full.match(/<body>([\s\S]*)<\/body>/);
  const inner = bodyMatch ? bodyMatch[1] : full;
  const styleMatch = full.match(/<style>[\s\S]*?<\/style>/);
  const fontsMatch = full.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^"]*">/);
  const artifact = '<title>Old Republic Holocron</title>\n' +
    (fontsMatch ? fontsMatch[0] : '') + '\n' +
    (styleMatch ? styleMatch[0] : '') + '\n' + inner;
  fs.writeFileSync(OUT, artifact);
  console.log(OUT + '  ' + (artifact.length / 1024).toFixed(0) + ' KB');
}
