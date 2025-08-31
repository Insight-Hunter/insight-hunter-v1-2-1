import { Hono } from 'hono';
import { jsxRenderer } from '@hono/react-renderer';
import { AppShell } from './server/layouts/AppShell';
import { OnboardStep } from './server/pages/OnboardStep';
import { SignInPage } from './server/pages/SignInPage';
import { DashboardPage } from './server/pages/DashboardPage';
import { AnalyticsPage } from './server/pages/AnalyticsPage';
import { ReportsPage } from './server/pages/ReportsPage';

type Env = {
  DB: D1Database;
  STATE: KVNamespace;
  TEMPLATE_VERSION: string;
};

const ORDER = [
  'signin','connect-data','business-setup','settings-setup','dashboard-preview',
  'analytics-trends','profiles','reports','forecasting','alerts','assistant'
] as const;
type StepSlug = typeof ORDER[number];

const app = new Hono<{ Bindings: Env }>();

// ---------- helpers ----------
function getOrSetSession(c: any) {
  const req = c.req.raw;
  const cookies = req.headers.get('Cookie') || '';
  const m = cookies.match(/sid=([^;]+)/);
  if (m) return m[1];
  const sid = crypto.randomUUID();
  c.header('Set-Cookie', `sid=${sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60*60*24*30}`);
  return sid;
}
async function isAuthed(env: Env, sid: string) {
  return (await env.STATE.get(`u:${sid}:auth`)) === '1';
}
async function setAuthed(env: Env, sid: string, v: boolean) {
  await env.STATE.put(`u:${sid}:auth`, v ? '1' : '0', { expirationTtl: 60*60*24*30 });
}
async function getProgress(env: Env, sid: string) {
  const json = await env.STATE.get(`u:${sid}:progress`);
  return json ? JSON.parse(json) as { completed?: string[]; next?: string } : {};
}
async function setProgress(env: Env, sid: string, p: { completed?: string[]; next?: string }) {
  await env.STATE.put(`u:${sid}:progress`, JSON.stringify(p), { expirationTtl: 60*60*24*7 });
}
function calcNext(p?: { completed?: string[]; next?: string }): StepSlug {
  if (p?.next && ORDER.includes(p.next as StepSlug)) return p.next as StepSlug;
  const done = new Set(p?.completed || []);
  const n = ORDER.find(s => !done.has(s)) || 'assistant';
  return n as StepSlug;
}
async function getStep(env: Env, slug: string) {
  const { results } = await env.DB
    .prepare('SELECT slug, title, body_html, cta_label, next_slug FROM steps WHERE slug = ?')
    .bind(slug).all();
  return results?.[0] as any | null;
}

// ---------- SSR shell ----------
app.use('*', jsxRenderer(({ children }) => <AppShell>{children}</AppShell>, { docType: true }));

// ---------- Auth pages ----------
app.get('/signin', (c) => {
  // Plain SSR sign-in page
  return c.render(<SignInPage>);
});

app.post('/api/auth/signin', async (c) => {
  const sid = getOrSetSession(c);
  const body = await c.req.parseBody();
  const email = (body?.email as string || '').trim();
  const password = (body?.password as string || '').trim();

  // Minimal demo auth: accept any non-empty email+password
  if (!email || !password) return c.json({ ok: false, message: 'Email and password required' }, 400);

  await setAuthed(c.env, sid, true);

  // Initialize progress if missing
  const prog = await getProgress(c.env, sid);
  if (!prog.completed?.length) {
    await setProgress(c.env, sid, { completed: ['signin'], next: 'connect-data' });
  }

  return c.json({ ok: true, redirect: '/onboard' });
});

app.post('/api/auth/signout', async (c) => {
  const sid = getOrSetSession(c);
  await setAuthed(c.env, sid, false);
  await setProgress(c.env, sid, { completed: [] });
  return c.json({ ok: true, redirect: '/signin' });
});

// ---------- Onboarding routing ----------
app.get('/onboard', async (c) => {
  const sid = getOrSetSession(c);
  const authed = await isAuthed(c.env, sid);
  if (!authed) return c.redirect('/signin', 302);

  const prog = await getProgress(c.env, sid);
  const next = calcNext(prog);
  return c.redirect(`/onboard/${next}`, 302);
});

app.get('/onboard/:slug', async (c) => {
  const sid = getOrSetSession(c);
  const { slug } = c.req.param();
  const env = c.env;

  // Gate: all onboarding pages except 'signin' require auth
  if (slug !== 'signin') {
    const authed = await isAuthed(env, sid);
    if (!authed) return c.redirect('/signin', 302);
  }

  const cacheKey = new Request(`${c.req.url}?v=${env.TEMPLATE_VERSION}`);
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;

  const step = await getStep(env, slug);
  if (!step) return c.text('Not found', 404);

  const prog = await getProgress(env, sid);
  const index = Math.max(0, ORDER.indexOf(slug as StepSlug));
  const total = ORDER.length;
  const html = c.render(
    <OnboardStep
      slug={step.slug}
      title={step.title}
      bodyHtml={step.body_html}
      ctaLabel={step.cta_label}
      nextSlug={step.next_slug as string | null}
      index={index}
      total={total}
      allowSkip={slug !== 'signin'} // example rule
    />
  );

  const resp = new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60'
    }
  });
  c.executionCtx.waitUntil(caches.default.put(cacheKey, resp.clone()));
  return resp;
});

// Mark complete + compute next
app.post('/api/onboard/complete/:slug', async (c) => {
  const { slug } = c.req.param();
  const sid = getOrSetSession(c);

  // require auth (except completing 'signin')
  if (slug !== 'signin' && !(await isAuthed(c.env, sid))) {
    return c.json({ ok: false, message: 'Not authenticated' }, 401);
  }

  const prog = await getProgress(c.env, sid);
  const completed = new Set(prog.completed || []);
  completed.add(slug);

  const next = calcNext({ completed: [...completed] });
  await setProgress(c.env, sid, { completed: [...completed], next });

  return c.json({ ok: true, next });
});

// ---------- App pages (SSR shells) ----------
app.get('/dashboard', async (c) => c.render(<DashboardPage />));
app.get('/analytics-trends', async (c) => c.render(<AnalyticsPage />));
app.get('/reports', async (c) => c.render(<ReportsPage />));

export default app;
