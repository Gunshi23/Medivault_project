const http = require('http');
const { randomUUID } = require('crypto');
const PORT = Number(process.env.PORT || 4000);
const collections = { patients: [], records: [], appointments: [], prescriptions: [] };
const allowed = new Set(Object.keys(collections));
const json = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:5500', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }); res.end(JSON.stringify(body)); };
const fs = require('fs');
const path = require('path');
const FRONTEND_DIR = path.resolve(__dirname, '..', 'frontend');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const parts = pathname.split('/').filter(Boolean);

  if (parts[0] !== 'api') {
    const filename = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const safePath = path.normalize(path.join(FRONTEND_DIR, filename));
    if (safePath.startsWith(FRONTEND_DIR) && fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      return fs.createReadStream(safePath).pipe(res);
    }
    return json(res, 404, { error: 'Route not found' });
  }

  if (parts[1] === 'health') return json(res, 200, { status: 'ok', service: 'MediVault API' });
  const collection = parts[1]; if (!allowed.has(collection)) return json(res, 404, { error: 'Resource not found' });
  if (req.method === 'GET' && parts.length === 2) return json(res, 200, { data: collections[collection] });
  if (req.method === 'POST' && parts.length === 2) {
    let raw = ''; req.on('data', chunk => { raw += chunk; if (raw.length > 1_000_000) req.destroy(); });
    req.on('end', () => { let item; try { item = JSON.parse(raw); } catch { return json(res, 400, { error: 'Request body must be valid JSON' }); }
      if (!item || typeof item !== 'object' || Array.isArray(item)) return json(res, 400, { error: 'A JSON object is required' });
      const clean = Object.fromEntries(Object.entries(item).filter(([k,v]) => /^[a-zA-Z][a-zA-Z0-9_]{0,40}$/.test(k) && ['string','number','boolean'].includes(typeof v) && String(v).length <= 2000));
      if (!Object.keys(clean).length) return json(res, 400, { error: 'At least one valid field is required' });
      const saved = { id: randomUUID(), createdAt: new Date().toISOString(), ...clean }; collections[collection].push(saved); return json(res, 201, { data: saved });
    }); return;
  }
  if (req.method === 'DELETE' && parts.length === 3) { const i = collections[collection].findIndex(x => x.id === parts[2]); if (i < 0) return json(res, 404, { error: 'Record not found' }); collections[collection].splice(i, 1); return json(res, 200, { deleted: true }); }
  return json(res, 405, { error: 'Method not allowed' });
});
server.listen(PORT, () => console.log(`MediVault API listening on port ${PORT}`));
