// src/worker.ts
import { Hono } from 'hono';
import { Eta } from 'eta'; // npm i eta
import { cors } from 'hono/cors';

type Env = {
  DB: D1Database;
  STATE: KVNamespace;
  ASSETS: R2Bucket;
  TEMPLATE_VERSION: string;
};

const app = new Hono<{ Bindings: Env }>();
app.use('*', cors());

const eta = new Eta({ autoEscape: true });

async function loadBaseTemplate(env: Env) {
  // Try KV cache first, then R2
  const cacheKey = `tpl:${env.TEMPLATE_VERSION}:base`;
  const cached = await env.STATE.get(cacheKey);
  if (cached) return cached;

  const obj = await env.ASSETS.get('templates/base.eta'); // upload this to R2
  const text = await obj?.text();
  if (!text) throw new Error('Base template missing');
  await env.STATE.put(cacheKey, text, { expirationTtl: 60 * 15 });
  return text;
}

async function getStep(env: Env, slug: string) {
  const { results } = await env.DB
    .prepare('SELECT * FROM steps WHERE slug = ?')
    .bind(slug)
    .all();
  return (results && results[0]) as any | undefined;
}

function cacheKey(env: Env, slug: string) {
  return `onboard:${env.TEMPLATE_VERSION}:${slug}`;
}

app.get('/onboard/:slug', async (c) => {
  const { slug } = c.req.param();
  const env = c.env;

  // Edge cache
  const key = new Request(new URL(c.req.url).toString());
  const cached = await caches.default.match(key);
  if (cached) return cached;

  // Fetch data
  const step = await getStep(env, slug);
  if (!step) return c.text('Not found', 404);

  // Load template
  const base = await loadBaseTemplate(env);

  // Compile & render (Blade-like)
  const html = eta.renderString(base, {
    title: step.title,
    body: step.body,
    cta: step.cta_label,
    nextSlug: step.next_slug,
    step,
    initialState: JSON.stringify({ step }),
  });

  const resp = new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60' },
  });

  // Save to edge cache
  c.executionCtx.waitUntil(caches.default.put(key, resp.clone()));
  return resp;
});

// API to compute the "next" step server-side (based on STATE)
app.get('/onboard/next', async (c) => {
  const env = c.env;
  const sid = c.req.header('X-Session') || 'anon';
  const progress = JSON.parse((await env.STATE.get(`u:${sid}:progress`)) || '{}');
  // Determine next slug from your policy
  const next = progress.next || 'signin';
  return c.json({ next });
});

export default app;
