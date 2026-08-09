// Echolume dev server — tiny static file server, no deps.
// Serves www/ on port 3852 with no-cache headers so the preview always sees fresh files.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'www');
const PORT = 3852;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  // Dev-only: accept generated assets (icons, splash, screenshots) from the page.
  // Writes are restricted to the project's assets/ and store/ directories.
  if (req.method === 'POST' && req.url === '/__dev/save') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 30e6) req.destroy(); });
    req.on('end', () => {
      try {
        const { name, dataUrl } = JSON.parse(body);
        if (!/^[a-z0-9_\-\/]+\.(png|jpg)$/i.test(name) || name.includes('..')) throw new Error('bad name');
        const b64 = dataUrl.split(',')[1];
        const buf = Buffer.from(b64, 'base64');
        const target = path.normalize(path.join(__dirname, 'assets-out', name));
        if (!target.startsWith(path.join(__dirname, 'assets-out'))) throw new Error('bad path');
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, buf);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, bytes: buf.length, target }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(e) }));
      }
    });
    return;
  }
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  // Dev-only tooling page lives outside www so it never ships.
  if (urlPath === '/__dev/gen') {
    fs.readFile(path.join(__dirname, 'dev-assets-gen.html'), (err, data) => {
      if (err) { res.writeHead(404); res.end('missing'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(data);
    });
    return;
  }
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Echolume dev server on http://localhost:${PORT}`);
});
