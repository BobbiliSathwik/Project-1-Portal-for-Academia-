import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.env.PORT || 4173);
const providerUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1/chat/completions';
const providerModel = process.env.AI_MODEL || 'gpt-4o-mini';
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

async function serveStatic(request, response, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
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
  if (url.pathname === '/api/health') return sendJson(response, 200, { ok: true, aiConfigured: Boolean(process.env.AI_API_KEY) });
  if (url.pathname === '/api/ai/chat') {
    if (request.method !== 'POST') return sendJson(response, 405, { error: 'Method not allowed.' });
    return handleChat(request, response);
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: 'Method not allowed.' });
  return serveStatic(request, response, url.pathname);
});

server.listen(port, () => console.log(`SkillAura running at http://localhost:${port}`));
