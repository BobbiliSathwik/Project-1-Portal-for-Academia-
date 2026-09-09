import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.env.PORT || 4173);
const providerUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1/chat/completions';
const providerModel = process.env.AI_MODEL || 'gpt-4o-mini';
const authStorePath = join(root, 'data', 'skillaura-auth-users.json');
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) throw new Error('SESSION_SECRET must be set in the environment.');
const examPortalBaseUrl = process.env.EXAM_PORTAL_BASE_URL || 'http://localhost:3000';
const ssoSharedSecret = process.env.SSO_SHARED_SECRET || '';
const allowedAuthOrigins = new Set([
  'https://bobbilisathwik.github.io',
  'https://project-1-portal-for-academia.onrender.com',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
]);
const sessionTtlMs = 8 * 60 * 60 * 1000;
const authSessions = new Map();
const examLaunches = new Map();
const examLaunchTtlMs = Number(process.env.SSO_LAUNCH_TTL_MS || 90 * 1000);
const authAttempts = new Map();
const authRateLimitWindowMs = 15 * 60 * 1000;
const authRateLimitMaxAttempts = 8;
const contentTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon' };

const sendJson = (response, status, payload) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(payload));
};

const readBody = async (request) => {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) throw new Error('Request body is too large.');
  }
  return JSON.parse(body || '{}');
};

const normalizeAuthRole = (role) => role === 'employee' ? 'student' : role;
const publicAuthUser = (user) => ({ id: user.id, role: user.role, originalRole: user.originalRole || user.role, email: user.email, name: user.name });
const passwordHash = (password, salt = randomBytes(16).toString('hex')) => ({ salt, hash: scryptSync(password, salt, 32).toString('hex') });
const passwordMatches = (password, stored) => {
  if (!stored?.salt || !stored?.hash) return false;
  const actual = scryptSync(password, stored.salt, 32);
  const expected = Buffer.from(stored.hash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
const signSessionId = (id) => createHmac('sha256', sessionSecret).update(id).digest('base64url');
const parseCookies = (request) => Object.fromEntries((request.headers.cookie || '').split(';').map((part) => part.trim()).filter(Boolean).map((part) => { const index = part.indexOf('='); return [index < 0 ? part : part.slice(0, index), index < 0 ? '' : decodeURIComponent(part.slice(index + 1))]; }));
const isHttpsRequest = (request) => process.env.NODE_ENV === 'production' || request.socket.encrypted || request.headers['x-forwarded-proto'] === 'https';
const sessionCookie = (id, maxAge = sessionTtlMs / 1000, request) => `${`skillaura_session=${encodeURIComponent(`${id}.${signSessionId(id)}`)}; Path=/; Max-Age=${maxAge}; HttpOnly;`}${request && isHttpsRequest(request) ? ' SameSite=None; Secure' : ' SameSite=Lax'}`;
const allowedAuthOrigin = (request) => {
  const origin = request.headers.origin;
  return typeof origin === 'string' && allowedAuthOrigins.has(origin);
};
const setAuthCorsHeaders = (request, response) => {
  const origin = request.headers.origin;
  if (!allowedAuthOrigin(request)) return false;
  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Vary', 'Origin');
  return true;
};
const authClientKey = (request, email = '') => `${request.socket.remoteAddress || 'unknown'}:${email}`;
const rateLimitStatus = (key) => {
  const now = Date.now();
  const attempts = (authAttempts.get(key) || []).filter((timestamp) => timestamp > now - authRateLimitWindowMs);
  authAttempts.set(key, attempts);
  return attempts.length >= authRateLimitMaxAttempts;
};
const recordAuthAttempt = (key) => authAttempts.set(key, [...(authAttempts.get(key) || []), Date.now()]);
const clearAuthAttempts = (key) => authAttempts.delete(key);
const issueExamLaunch = (user) => {
  const code = randomBytes(32).toString('base64url');
  examLaunches.set(code, { userId: user.id, expiresAt: Date.now() + examLaunchTtlMs });
  return code;
};
const consumeExamLaunch = (code) => {
  const launch = examLaunches.get(code);
  examLaunches.delete(code);
  if (!launch || launch.expiresAt <= Date.now()) return null;
  return launch;
};
const sameSecret = (request) => {
  const supplied = request.headers['x-skillaura-sso-secret'];
  if (!ssoSharedSecret || typeof supplied !== 'string' || supplied.length !== ssoSharedSecret.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(ssoSharedSecret));
};
const validSession = (request) => {
  const value = parseCookies(request).skillaura_session || '';
  const [id, signature] = value.split('.');
  if (!id || !signature || signature !== signSessionId(id)) return null;
  const session = authSessions.get(id);
  if (!session || session.expiresAt <= Date.now()) { authSessions.delete(id); return null; }
  session.expiresAt = Date.now() + sessionTtlMs;
  return session;
};
const sendAuthJson = (response, status, payload, cookie = '') => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...(cookie ? { 'Set-Cookie': cookie } : {}) });
  response.end(JSON.stringify(payload));
};
async function readAuthStore() {
  try { return JSON.parse(await readFile(authStorePath, 'utf8')); } catch (error) { return { users: [] }; }
}
async function writeAuthStore(store) {
  await mkdir(join(root, 'data'), { recursive: true });
  await writeFile(authStorePath, JSON.stringify(store, null, 2), 'utf8');
}
async function ensureDemoAuthUsers() {
  const store = await readAuthStore();
  const demos = [
    ['student-demo', 'demo@student.skillaura', 'Demo Student/Employee', 'student'],
    ['tutor-demo', 'demo@tutor.skillaura', 'Demo Tutor', 'tutor'],
    ['company-demo', 'demo@company.skillaura', 'Demo Company', 'company'],
    ['institution-demo', 'demo@institution.skillaura', 'Demo Institution', 'institution']
  ];
  let changed = false;
  demos.forEach(([id, email, name, role]) => {
    if (!store.users.some((user) => user.email === email)) {
      store.users.push({ id, email, name, role, originalRole: role, password: passwordHash('demo-access'), createdAt: new Date().toISOString(), demoAccount: true });
      changed = true;
    }
  });
  if (changed) await writeAuthStore(store);
  return store;
}
async function createAuthSession(user, response, request) {
  const id = randomUUID();
  authSessions.set(id, { userId: user.id, expiresAt: Date.now() + sessionTtlMs });
  sendAuthJson(response, 200, { success: true, user: publicAuthUser(user) }, sessionCookie(id, sessionTtlMs / 1000, request));
}

async function authenticatedUser(request) {
  const session = validSession(request);
  if (!session) return null;
  const store = await readAuthStore();
  return store.users.find((user) => user.id === session.userId) || null;
}

const systemPrompt = (role, context) => `You are SkillAura AI, a grounded ${role || 'student'} assistant inside the SkillAura prototype. Use only the supplied SkillAura context for website-specific facts, records, statuses, people, opportunities, and routes. Never invent missing data. If the context does not contain an answer, say that it is unavailable. Give practical, concise guidance. Current page: ${context?.currentPage || 'unknown'}.`;

async function handleChat(request, response) {
  if (!process.env.AI_API_KEY) {
    return sendJson(response, 503, { error: 'AI provider is not configured.', code: 'AI_NOT_CONFIGURED' });
  }
  let body;
  try {
    body = await readBody(request);
  } catch (error) {
    return sendJson(response, 400, { error: 'Invalid JSON request.', code: 'INVALID_JSON' });
  }
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return sendJson(response, 400, { error: 'Message is required.', code: 'EMPTY_MESSAGE' });
  const context = body.context && typeof body.context === 'object' ? body.context : {};
  const history = Array.isArray(body.conversation) ? body.conversation.slice(-8).filter((item) => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string') : [];
  const providerPayload = {
    model: providerModel,
    temperature: Number(body.config?.temperature ?? 0.4),
    max_tokens: Number(body.config?.maxOutput ?? 600),
    messages: [{ role: 'system', content: systemPrompt(context.role, context) }, ...history, { role: 'user', content: message }]
  };
  try {
    const providerResponse = await fetch(providerUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.AI_API_KEY}` }, body: JSON.stringify(providerPayload), signal: AbortSignal.timeout(25_000) });
    const providerBody = await providerResponse.json().catch(() => ({}));
    if (!providerResponse.ok) return sendJson(response, 502, { error: 'The AI provider returned an error.', code: 'AI_PROVIDER_ERROR' });
    const reply = providerBody.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) return sendJson(response, 502, { error: 'The AI provider returned an empty response.', code: 'AI_EMPTY_RESPONSE' });
    return sendJson(response, 200, { reply: reply.trim() });
  } catch (error) {
    return sendJson(response, 502, { error: 'SkillAura AI is temporarily unavailable.', code: error.name === 'TimeoutError' ? 'AI_TIMEOUT' : 'AI_NETWORK_ERROR' });
  }
}

async function handleAuth(request, response, pathname) {
  const stateChangingAuthPath = ['/api/auth/logout', '/api/auth/demo', '/api/auth/login', '/api/auth/register', '/api/auth/exam-launch'].includes(pathname);
  if (pathname.startsWith('/api/auth/') && request.method === 'OPTIONS') {
    if (!setAuthCorsHeaders(request, response)) return sendAuthJson(response, 403, { error: 'Allowed authentication origin required.' });
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.writeHead(204);
    response.end();
    return true;
  }
  if (stateChangingAuthPath && request.method === 'POST' && !setAuthCorsHeaders(request, response)) {
    return sendAuthJson(response, 403, { error: 'Same-origin authentication request required.' });
  }
  if (pathname.startsWith('/api/auth/')) setAuthCorsHeaders(request, response);
  if (pathname === '/api/auth/exam-launch' && request.method === 'POST') {
    const user = await authenticatedUser(request);
    if (!user) return sendAuthJson(response, 401, { error: 'Authentication required.' });
    if (!['student', 'tutor'].includes(user.role)) return sendAuthJson(response, 403, { error: 'Exam access is unavailable for this account.' });
    if (!ssoSharedSecret) return sendAuthJson(response, 503, { error: 'Exam access is unavailable.' });
    const code = issueExamLaunch(user);
    return sendAuthJson(response, 200, { launchUrl: `${examPortalBaseUrl.replace(/\/$/, '')}/sso/launch?code=${encodeURIComponent(code)}` });
  }
  if (pathname === '/api/auth/exam-exchange' && request.method === 'POST') {
    if (!sameSecret(request)) return sendAuthJson(response, 401, { error: 'Invalid exam launch.' });
    const body = await readBody(request).catch(() => ({}));
    const code = typeof body.code === 'string' ? body.code : '';
    const launch = consumeExamLaunch(code);
    if (!launch) return sendAuthJson(response, 401, { error: 'Invalid exam launch.' });
    const store = await readAuthStore();
    const user = store.users.find((item) => item.id === launch.userId);
    if (!user || !['student', 'tutor'].includes(user.role)) return sendAuthJson(response, 401, { error: 'Invalid exam launch.' });
    return sendAuthJson(response, 200, { user: publicAuthUser(user) });
  }
  if (pathname === '/api/auth/me' && request.method === 'GET') {
    const user = await authenticatedUser(request);
    if (!user) return sendAuthJson(response, 401, { error: 'Authentication required.' });
    return sendAuthJson(response, 200, { user: publicAuthUser(user) });
  }
  if (pathname === '/api/auth/session' && request.method === 'GET') {
    const session = validSession(request);
    if (!session) return sendAuthJson(response, 200, { authenticated: false });
    const store = await readAuthStore();
    const user = store.users.find((item) => item.id === session.userId);
    if (!user) return sendAuthJson(response, 200, { authenticated: false });
    return sendAuthJson(response, 200, { authenticated: true, user: publicAuthUser(user) }, sessionCookie(parseCookies(request).skillaura_session.split('.')[0], sessionTtlMs / 1000, request));
  }
  if (pathname === '/api/auth/logout' && request.method === 'POST') {
    const value = parseCookies(request).skillaura_session || '';
    const [id] = value.split('.');
    if (id) authSessions.delete(id);
    return sendAuthJson(response, 200, { success: true }, sessionCookie('', 0, request));
  }
  if (pathname === '/api/auth/demo' && request.method === 'POST') {
    const body = await readBody(request).catch(() => ({}));
    const role = normalizeAuthRole(body.role);
    const store = await ensureDemoAuthUsers();
    const user = store.users.find((item) => item.demoAccount && item.role === role);
    if (!user) return sendAuthJson(response, 400, { error: 'Demo role is unavailable.' });
    return createAuthSession(user, response, request);
  }
  if (pathname === '/api/auth/login' && request.method === 'POST') {
    const body = await readBody(request).catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const role = normalizeAuthRole(body.role);
    const attemptKey = authClientKey(request, email);
    if (rateLimitStatus(attemptKey)) return sendAuthJson(response, 429, { error: 'Too many login attempts. Try again later.' }, '');
    const store = await readAuthStore();
    const user = store.users.find((item) => item.email === email && (!role || item.role === role));
    if (!user || !passwordMatches(password, user.password)) {
      recordAuthAttempt(attemptKey);
      return sendAuthJson(response, 401, { error: 'That email or password is not correct.' });
    }
    clearAuthAttempts(attemptKey);
    return createAuthSession(user, response, request);
  }
  if (pathname === '/api/auth/register' && request.method === 'POST') {
    const body = await readBody(request).catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const role = normalizeAuthRole(body.role || 'student');
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!email || !password || !name || !['student', 'tutor', 'company', 'institution'].includes(role)) return sendAuthJson(response, 400, { error: 'Name, email, password, and a valid role are required.' });
    const store = await readAuthStore();
    if (store.users.some((item) => item.email === email)) return sendAuthJson(response, 409, { error: 'An account with that email already exists.' });
    const user = { id: `user-${randomUUID()}`, email, name, role, originalRole: role, profile: body.profile && typeof body.profile === 'object' ? body.profile : {}, password: passwordHash(password), createdAt: new Date().toISOString() };
    store.users.push(user);
    await writeAuthStore(store);
    return createAuthSession(user, response, request);
  }
  return false;
}

async function serveStatic(request, response, pathname) {
  let decodedPathname;
  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch (error) {
    return sendJson(response, 400, { error: 'Invalid URL.' });
  }
  const requested = decodedPathname === '/' ? '/index.html' : decodedPathname;
  const filePath = resolve(join(root, normalize(requested)));
  const relativePath = relative(root, filePath);
  if (relativePath.startsWith('..') || relativePath.includes('..' + '/') || relativePath.includes('..\\')) return sendJson(response, 403, { error: 'Forbidden' });
  try {
    const stat = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(stat);
  } catch (error) {
    if (error.code === 'ENOENT') return sendJson(response, 404, { error: 'Not found' });
    sendJson(response, 500, { error: 'Unable to read file.' });
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/auth/')) {
    try { const handled = await handleAuth(request, response, url.pathname); if (handled !== false) return; } catch (error) { return sendJson(response, 500, { error: 'Authentication service unavailable.' }); }
  }
  if (url.pathname === '/api/health') return sendJson(response, 200, { ok: true, aiConfigured: Boolean(process.env.AI_API_KEY) });
  if (url.pathname === '/api/ai/chat') {
    if (request.method !== 'POST') return sendJson(response, 405, { error: 'Method not allowed.' });
    return handleChat(request, response);
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: 'Method not allowed.' });
  return serveStatic(request, response, url.pathname);
});

server.listen(port, () => console.log(`SkillAura running at http://localhost:${port}`));
