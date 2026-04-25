#!/usr/bin/env node
/**
 * Fortune Sacco CIC Insurance System
 * Node.js HTTP Server — zero npm dependencies
 * Uses built-in: http, crypto, path, fs, url, child_process
 */

'use strict';
const http   = require('http');
const crypto = require('crypto');
const path   = require('path');
const fs     = require('fs');
const { URL } = require('url');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 4001;
const SECRET  = process.env.JWT_SECRET || 'fortune_sacco_cic_jwt_secret_2025_prod';
const DB_SCRIPT = path.join(__dirname, 'db', 'db_engine.py');
const FRONTEND  = path.join(__dirname, 'public');

// ── DB BRIDGE ─────────────────────────────────────────────────────────────────
let dbProcess = null;
let dbReady   = false;
const pending = new Map();  // id -> {resolve, reject, timer}
let buffer    = '';

function startDB() {
  return new Promise((resolve, reject) => {
    dbProcess = spawn('python3', ['-u', DB_SCRIPT], {
      stdio: ['pipe','pipe','pipe']
    });

    dbProcess.stdout.on('data', chunk => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();  // keep incomplete line
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.ready) { dbReady = true; resolve(); continue; }
          if (msg._id) {
            const cb = pending.get(msg._id);
            if (cb) {
              clearTimeout(cb.timer);
              pending.delete(msg._id);
              cb.resolve(msg);
            }
          }
        } catch(e) { /* skip bad lines */ }
      }
    });

    dbProcess.stderr.on('data', d => {
      const txt = d.toString();
      if (!txt.includes('DeprecationWarning')) process.stderr.write('[DB] ' + txt);
    });

    dbProcess.on('close', code => {
      console.error('[DB] Process exited:', code);
      dbReady = false;
      setTimeout(startDB, 2000);  // auto-restart
    });

    setTimeout(() => reject(new Error('DB startup timeout')), 10000);
  });
}

function dbQuery(type, data = {}) {
  return new Promise((resolve, reject) => {
    if (!dbReady) return reject(new Error('Database not ready'));
    const id = crypto.randomBytes(8).toString('hex');
    const payload = JSON.stringify({ type, data, _id: id }) + '\n';
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error('DB query timeout: ' + type));
    }, 15000);
    pending.set(id, { resolve: r => { const { _id, ...rest } = r; resolve(rest); }, reject, timer });
    dbProcess.stdin.write(payload);
  });
}

// ── JWT (stdlib only) ─────────────────────────────────────────────────────────
function b64url(buf) {
  return buf.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
}
function b64urlDecode(s) {
  s = s.replace(/-/g,'+').replace(/_/g,'/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64');
}

function signJWT(payload, expiresInHours = 8) {
  const header  = b64url(Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})));
  const body    = b64url(Buffer.from(JSON.stringify({
    ...payload, iat: Math.floor(Date.now()/1000),
    exp: Math.floor(Date.now()/1000) + expiresInHours * 3600,
    jti: crypto.randomBytes(8).toString('hex')
  })));
  const sig = b64url(crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest());
  return `${header}.${body}.${sig}`;
}

function verifyJWT(token) {
  try {
    const [h, b, s] = token.split('.');
    if (!h || !b || !s) return null;
    const expected = b64url(crypto.createHmac('sha256', SECRET).update(`${h}.${b}`).digest());
    if (!crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected))) return null;
    const payload = JSON.parse(b64urlDecode(b).toString());
    if (payload.exp < Math.floor(Date.now()/1000)) return null;
    return payload;
  } catch { return null; }
}

// ── HTTP HELPERS ──────────────────────────────────────────────────────────────
function json(res, data, status = 200) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  });
  res.end(body);
}

function err(res, msg, status = 400) { json(res, {error: msg}, status); }

function getBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => data += c);
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

function getToken(req) {
  const auth = req.headers['authorization'] || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

function requireAuth(req, res, allowedRoles = null) {
  const token = getToken(req);
  if (!token) { err(res, 'Authentication required', 401); return null; }
  const user = verifyJWT(token);
  if (!user) { err(res, 'Invalid or expired token', 401); return null; }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    err(res, 'Insufficient permissions', 403); return null;
  }
  return user;
}

function branchFilter(user, requestedBranch) {
  if (user.role === 'admin' || user.role === 'hr') return requestedBranch || null;
  return user.branch_id;
}

function parseQS(urlStr) {
  const u = new URL(urlStr, 'http://localhost');
  const p = {};
  u.searchParams.forEach((v, k) => p[k] = v);
  return p;
}

// ── ROUTER ────────────────────────────────────────────────────────────────────
const routes = [];

function route(method, pattern, handler) {
  // pattern can be string or regex
  routes.push({ method: method.toUpperCase(), pattern, handler });
}

function matchRoute(method, pathname) {
  for (const r of routes) {
    if (r.method !== method && r.method !== 'ALL') continue;
    if (typeof r.pattern === 'string') {
      if (r.pattern === pathname) return { handler: r.handler, params: {} };
    } else if (r.pattern instanceof RegExp) {
      const m = pathname.match(r.pattern);
      if (m) return { handler: r.handler, params: m.groups || {} };
    }
  }
  return null;
}

// ── AUTH ROUTES ───────────────────────────────────────────────────────────────
route('POST', '/api/auth/login', async (req, res) => {
  const body = await getBody(req);
  const result = await dbQuery('auth_login', body);
  if (result.error) return err(res, result.error, 401);
  const token = signJWT({
    user_id:   result.user.id,
    email:     result.user.email,
    role:      result.user.role,
    branch_id: result.user.branch_id,
    full_name: result.user.full_name,
    staff_id:  result.user.staff_id,
  });
  json(res, { token, user: result.user });
});

route('GET', '/api/auth/me', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const result = await dbQuery('auth_me', { user_id: user.user_id });
  json(res, result);
});

route('POST', '/api/auth/change-password', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const body = await getBody(req);
  if (!body.new_password || body.new_password.length < 8)
    return err(res, 'Password must be at least 8 characters');
  const result = await dbQuery('change_password', { user_id: user.user_id, ...body });
  json(res, result);
});

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
route('GET', '/api/dashboard/stats', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const qs   = parseQS(req.url);
  const bid  = branchFilter(user, qs.branch_id);
  const result = await dbQuery('get_dashboard', { branch_id: bid });
  json(res, result);
});

route('GET', '/api/dashboard/branches', async (req, res) => {
  const user = requireAuth(req, res, ['admin','hr']);
  if (!user) return;
  const result = await dbQuery('get_branch_summary');
  json(res, result);
});

// ── BRANCHES ──────────────────────────────────────────────────────────────────
route('GET', '/api/branches', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const result = await dbQuery('get_branches');
  json(res, result);
});

// ── MEMBERS ───────────────────────────────────────────────────────────────────
route('GET', '/api/members', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const qs  = parseQS(req.url);
  const bid = branchFilter(user, qs.branch_id);
  const result = await dbQuery('get_members', { ...qs, branch_id: bid });
  json(res, result);
});

route('GET', /^\/api\/members\/(?<id>[^/]+)$/, async (req, res, params) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const result = await dbQuery('get_member', { id: params.id });
  if (result.error) return err(res, result.error, 404);
  if (user.role !== 'admin' && user.role !== 'hr' && result.member?.branch_id !== user.branch_id)
    return err(res, 'Access denied', 403);
  json(res, result);
});

route('POST', '/api/members', async (req, res) => {
  const user = requireAuth(req, res, ['admin','branch','hr']);
  if (!user) return;
  const body = await getBody(req);
  if (user.role === 'branch' && body.branch_id !== user.branch_id)
    return err(res, 'Cannot add members to another branch', 403);
  const result = await dbQuery('create_member', { ...body, created_by: user.user_id });
  if (result.error) return err(res, result.error);
  json(res, result, 201);
});

route('PUT', /^\/api\/members\/(?<id>[^/]+)$/, async (req, res, params) => {
  const user = requireAuth(req, res, ['admin','branch','hr']);
  if (!user) return;
  const body = await getBody(req);
  const result = await dbQuery('update_member', { id: params.id, ...body });
  json(res, result);
});

// ── POLICIES ──────────────────────────────────────────────────────────────────
route('GET', '/api/policies', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const qs  = parseQS(req.url);
  const bid = branchFilter(user, qs.branch_id);
  const result = await dbQuery('get_policies', { ...qs, branch_id: bid });
  json(res, result);
});

route('GET', /^\/api\/policies\/(?<id>[^/]+)$/, async (req, res, params) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const result = await dbQuery('get_policy', { id: params.id });
  if (result.error) return err(res, result.error, 404);
  json(res, result);
});

route('POST', '/api/policies', async (req, res) => {
  const user = requireAuth(req, res, ['admin','branch','hr']);
  if (!user) return;
  const body = await getBody(req);
  if (user.role === 'branch' && body.branch_id !== user.branch_id)
    return err(res, 'Cannot create policy for another branch', 403);
  const result = await dbQuery('create_policy', { ...body, created_by: user.user_id });
  if (result.error) return err(res, result.error);
  json(res, result, 201);
});

route('PUT', /^\/api\/policies\/(?<id>[^/]+)$/, async (req, res, params) => {
  const user = requireAuth(req, res, ['admin','hr']);
  if (!user) return;
  const body = await getBody(req);
  const result = await dbQuery('update_policy', { id: params.id, ...body });
  json(res, result);
});

route('POST', /^\/api\/policies\/(?<id>[^/]+)\/renew$/, async (req, res, params) => {
  const user = requireAuth(req, res, ['admin','hr','branch']);
  if (!user) return;
  const result = await dbQuery('renew_policy', { id: params.id, user_id: user.user_id });
  json(res, result);
});

// ── PREMIUMS ──────────────────────────────────────────────────────────────────
route('GET', '/api/premiums', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const qs  = parseQS(req.url);
  const bid = branchFilter(user, qs.branch_id);
  const result = await dbQuery('get_premiums', { ...qs, branch_id: bid });
  json(res, result);
});

route('POST', '/api/premiums/run-deductions', async (req, res) => {
  const user = requireAuth(req, res, ['admin']);
  if (!user) return;
  const result = await dbQuery('run_deductions', { user_id: user.user_id });
  json(res, result);
});

route('POST', /^\/api\/premiums\/(?<id>[^/]+)\/mark-paid$/, async (req, res, params) => {
  const user = requireAuth(req, res, ['admin','hr']);
  if (!user) return;
  const body = await getBody(req);
  const result = await dbQuery('mark_premium_paid', { id: params.id, ...body });
  json(res, result);
});

// ── CLAIMS ────────────────────────────────────────────────────────────────────
route('GET', '/api/claims', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const qs  = parseQS(req.url);
  const bid = branchFilter(user, qs.branch_id);
  const result = await dbQuery('get_claims', { ...qs, branch_id: bid });
  json(res, result);
});

route('GET', /^\/api\/claims\/(?<id>[^/]+)$/, async (req, res, params) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const result = await dbQuery('get_claim', { id: params.id });
  if (result.error) return err(res, result.error, 404);
  if (!['admin','hr','claims'].includes(user.role) && result.claim?.branch_id !== user.branch_id)
    return err(res, 'Access denied', 403);
  json(res, result);
});

route('POST', '/api/claims', async (req, res) => {
  const user = requireAuth(req, res, ['admin','branch','claims','hr']);
  if (!user) return;
  const body = await getBody(req);
  const result = await dbQuery('submit_claim', { ...body, created_by: user.user_id });
  if (result.error) return err(res, result.error);
  json(res, result, 201);
});

route('POST', /^\/api\/claims\/(?<id>[^/]+)\/review$/, async (req, res, params) => {
  const user = requireAuth(req, res, ['admin','hr','claims']);
  if (!user) return;
  const body = await getBody(req);
  const result = await dbQuery('review_claim', { id: params.id, user_id: user.user_id, ...body });
  if (result.error) return err(res, result.error);
  json(res, result);
});

route('POST', /^\/api\/claims\/(?<id>[^/]+)\/documents$/, async (req, res, params) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const body = await getBody(req);
  const result = await dbQuery('add_claim_doc', { claim_id: params.id, ...body });
  json(res, result, 201);
});

// ── HOSPITALS ─────────────────────────────────────────────────────────────────
route('GET', '/api/hospitals', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const qs = parseQS(req.url);
  const result = await dbQuery('get_hospitals', qs);
  json(res, result);
});

route('POST', '/api/hospitals', async (req, res) => {
  const user = requireAuth(req, res, ['admin','hr']);
  if (!user) return;
  const body = await getBody(req);
  const result = await dbQuery('add_hospital', { ...body, user_id: user.user_id });
  if (result.error) return err(res, result.error);
  json(res, result, 201);
});

route('PUT', /^\/api\/hospitals\/(?<id>[^/]+)$/, async (req, res, params) => {
  const user = requireAuth(req, res, ['admin','hr']);
  if (!user) return;
  const body = await getBody(req);
  const result = await dbQuery('update_hospital', { id: params.id, ...body });
  json(res, result);
});

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
route('GET', '/api/notifications', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const result = await dbQuery('get_notifications', {
    user_id: user.user_id, branch_id: user.branch_id
  });
  json(res, result);
});

route('POST', /^\/api\/notifications\/(?<id>[^/]+)\/read$/, async (req, res, params) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const result = await dbQuery('mark_notif_read', { id: params.id });
  json(res, result);
});

route('POST', '/api/notifications/read-all', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const result = await dbQuery('mark_all_read', { user_id: user.user_id });
  json(res, result);
});

// ── AUDIT LOGS ────────────────────────────────────────────────────────────────
route('GET', '/api/audit-logs', async (req, res) => {
  const user = requireAuth(req, res, ['admin','hr']);
  if (!user) return;
  const qs = parseQS(req.url);
  const result = await dbQuery('get_audit_logs', qs);
  json(res, result);
});

// ── ALERTS ────────────────────────────────────────────────────────────────────
route('GET', '/api/alerts', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const qs  = parseQS(req.url);
  const bid = branchFilter(user, qs.branch_id);
  const result = await dbQuery('get_alerts', { branch_id: bid });
  json(res, result);
});

// ── USERS ─────────────────────────────────────────────────────────────────────
route('GET', '/api/users', async (req, res) => {
  const user = requireAuth(req, res, ['admin']);
  if (!user) return;
  const result = await dbQuery('get_users', {});
  json(res, result);
});

route('POST', '/api/users', async (req, res) => {
  const user = requireAuth(req, res, ['admin']);
  if (!user) return;
  const body = await getBody(req);
  const result = await dbQuery('create_user', body);
  if (result.error) return err(res, result.error);
  json(res, result, 201);
});

// ── SYSTEM STATS ──────────────────────────────────────────────────────────────
route('GET', '/api/system/stats', async (req, res) => {
  const user = requireAuth(req, res, ['admin','hr']);
  if (!user) return;
  const result = await dbQuery('get_stats_summary', {});
  json(res, result);
});

route('GET', '/api/health', async (req, res) => {
  json(res, { status: 'ok', db: dbReady, timestamp: new Date().toISOString() });
});

// ── SERVE FRONTEND ────────────────────────────────────────────────────────────
function serveStatic(req, res) {
  const urlPath = new URL(req.url, `http://localhost`).pathname;
  let filePath = path.join(FRONTEND, urlPath === '/' ? 'index.html' : urlPath);

  // SPA fallback: if file doesn't exist, serve index.html
  if (!fs.existsSync(filePath)) filePath = path.join(FRONTEND, 'index.html');
  if (!fs.existsSync(filePath)) return err(res, 'Not found', 404);

  const ext = path.extname(filePath).toLowerCase();
  const mime = {
    '.html':'text/html', '.js':'application/javascript', '.css':'text/css',
    '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg',
    '.svg':'image/svg+xml', '.ico':'image/x-icon'
  }[ext] || 'application/octet-stream';

  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    'Content-Type': mime,
    'Content-Length': stat.size,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
  });
  fs.createReadStream(filePath).pipe(res);
}

// ── MAIN REQUEST HANDLER ──────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const u        = new URL(req.url, `http://localhost`);
  const pathname = u.pathname;
  const method   = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    });
    return res.end();
  }

  // API routes
  if (pathname.startsWith('/api/')) {
    const match = matchRoute(method, pathname);
    if (match) {
      try {
        await match.handler(req, res, match.params);
      } catch (e) {
        console.error('[Route Error]', e);
        err(res, 'Internal server error', 500);
      }
    } else {
      err(res, `Cannot ${method} ${pathname}`, 404);
    }
    return;
  }

  // Static files
  serveStatic(req, res);
});

// ── STARTUP ───────────────────────────────────────────────────────────────────
(async () => {
  console.log('🚀 Starting Fortune Sacco CIC Insurance System...');
  console.log('📦 Initialising database engine...');

  try {
    await startDB();
    console.log('✅ Database engine ready');
  } catch (e) {
    console.error('❌ DB failed to start:', e.message);
    process.exit(1);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║     Fortune Sacco CIC Insurance Management System        ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  🌐  API:      http://localhost:${PORT}/api              ║`);
    console.log(`║  🏥  Health:   http://localhost:${PORT}/api/health       ║`);
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║  DEFAULT LOGIN CREDENTIALS:                              ║');
    console.log('║  admin@fortunesacco.co.ke    / admin123  (System Admin)  ║');
    console.log('║  hr@fortunesacco.co.ke       / admin123  (CEO/HR)        ║');
    console.log('║  branch.nbi@fortunesacco.co.ke/ admin123 (Branch NBI)   ║');
    console.log('║  claims@fortunesacco.co.ke   / admin123  (Claims)        ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⏹  Shutting down...');
    if (dbProcess) dbProcess.kill();
    server.close(() => process.exit(0));
  });
})();
