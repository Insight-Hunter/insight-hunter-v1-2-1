/// <reference types="@cloudflare/workers-types" />

import React from "react"
import { Hono } from "hono"
import { jsxRenderer } from "./hono/react-renderer"
import { AppShell } from "./server/layouts/AppShell"
import { OnboardStep } from "./server/pages/OnboardStep"
import { SignInPage } from "./server/pages/SignInPage"
import { DashboardPage } from "./server/pages/DashboardPage"
import { AnalyticsPage } from "./server/pages/AnalyticsPage"
import { ReportsPage } from "./server/pages/ReportsPage"

type Env = {
  DB: D1Database
  STATE: KVNamespace
  TEMPLATE_VERSION: string
}

const ORDER = [
  "signin",
  "connect-data",
  "business-setup",
  "settings-setup",
  "dashboard-preview",
  "analytics-trends",
  "profiles",
  "reports",
  "forecasting",
  "alerts",
  "assistant",
] as const
type StepSlug = typeof ORDER[number]
type Progress = { completed?: string[]; next?: string }
type StepRow = {
  slug: string
  title: string
  body_html: string
  cta_label: string | null
  next_slug: string | null
}

const app = new Hono<{ Bindings: Env }>()

// ---------- helpers ----------
function getOrSetSession(c: any) {
  const req = c.req.raw as Request
  const cookies = req.headers.get("Cookie") || ""
  const m = cookies.match(/sid=([^;]+)/)
  if (m) return m[1]
  const sid = crypto.randomUUID()
  c.header(
    "Set-Cookie",
    `sid=${sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
  )
  return sid
}
async function isAuthed(env: Env, sid: string) {
  return (await env.STATE.get(`u:${sid}:auth`)) === "1"
}
async function setAuthed(env: Env, sid: string, v: boolean) {
  await env.STATE.put(`u:${sid}:auth`, v ? "1" : "0", {
    expirationTtl: 60 * 60 * 24 * 30,
  })
}
async function getProgress(env: Env, sid: string): Promise<Progress> {
  const json = await env.STATE.get(`u:${sid}:progress`)
  return json ? (JSON.parse(json) as Progress) : {}
}
async function setProgress(env: Env, sid: string, p: Progress) {
  await env.STATE.put(`u:${sid}:progress`, JSON.stringify(p), {
    expirationTtl: 60 * 60 * 24 * 7,
  })
}
function calcNext(p?: Progress): StepSlug {
  if (p?.next && (ORDER as readonly string[]).includes(p.next)) return p.next as StepSlug
  const done = new Set(p?.completed || [])
  const n = ORDER.find((s) => !done.has(s)) || "assistant"
  return n as StepSlug
}
async function getStep(env: Env, slug: string): Promise<StepRow | null> {
  const { results } = await env.DB.prepare(
    "SELECT slug, title, body_html, cta_label, next_slug FROM steps WHERE slug = ?"
  )
    .bind(slug)
    .all<StepRow>()
  return (results && results[0]) || null
}

// ---------- global SSR shell ----------
app.use(
  "*",
  jsxRenderer(({ children }) => <AppShell>{children}</AppShell>, { docType: true })
)

// ---------- auth ----------
app.get("/signin", (c) => c.render(<SignInPage />))

app.post("/api/auth/signin", async (c) => {
  const sid = getOrSetSession(c)

  let body: any = {}
  try {
    body = await c.req.parseBody()
  } catch {
    try {
      body = await c.req.json()
    } catch {
      body = {}
    }
  }
  const email = ((body?.email as string) || "").trim()
  const password = ((body?.password as string) || "").trim()

  if (!email || !password) {
    return c.json({ ok: false, message: "Email and password required" }, 400)
  }

  await setAuthed(c.env, sid, true)

  const prog = await getProgress(c.env, sid)
  if (!prog.completed?.length) {
    await setProgress(c.env, sid, { completed: ["signin"], next: "connect-data" })
  }

  return c.json({ ok: true, redirect: "/onboard" })
})

app.post("/api/auth/signout", async (c) => {
  const sid = getOrSetSession(c)
  await setAuthed(c.env, sid, false)
  await setProgress(c.env, sid, { completed: [] })
  return c.json({ ok: true, redirect: "/signin" })
})

// ---------- onboarding ----------
app.get("/onboard", async (c) => {
  const sid = getOrSetSession(c)
  const authed = await isAuthed(c.env, sid)
  if (!authed) return c.redirect("/signin", 302)

  const prog = await getProgress(c.env, sid)
  const next = calcNext(prog)
  return c.redirect(`/onboard/${next}`, 302)
})

app.get("/onboard/:slug", async (c) => {
  const sid = getOrSetSession(c)
  const { slug } = c.req.param()
  const env = c.env

  if (slug !== "signin") {
    const authed = await isAuthed(env, sid)
    if (!authed) return c.redirect("/signin", 302)
  }

  const cacheKey = new Request(`${c.req.url}?v=${env.TEMPLATE_VERSION}`)
  const canCache = typeof caches !== "undefined" && caches?.default
  if (canCache) {
    const hit = await caches.default.match(cacheKey)
    if (hit) return hit
  }

  const step = await getStep(env, slug)
  if (!step) return c.text("Not found", 404)

  const index = Math.max(0, ORDER.indexOf(slug as StepSlug))
  const total = ORDER.length

  const html = c.render(
    <OnboardStep
      slug={step.slug}
      title={step.title}
      bodyHtml={step.body_html}
      ctaLabel={step.cta_label ?? undefined}
      nextSlug={step.next_slug ?? null}
      index={index}
      total={total}
      allowSkip={slug !== "signin"}
    />
  )

  const resp = new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=60",
    },
  })
  if (canCache) c.executionCtx.waitUntil(caches.default.put(cacheKey, resp.clone()))
  return resp
})

app.post("/api/onboard/complete/:slug", async (c) => {
  const { slug } = c.req.param()
  const sid = getOrSetSession(c)

  if (slug !== "signin" && !(await isAuthed(c.env, sid))) {
    return c.json({ ok: false, message: "Not authenticated" }, 401)
  }

  const prog = await getProgress(c.env, sid)
  const completed = new Set(prog.completed || [])
  completed.add(slug)

  const next = calcNext({ completed: [...completed] })
  await setProgress(c.env, sid, { completed: [...completed], next })

  return c.json({ ok: true, next })
})

// ---------- app pages ----------
app.get("/dashboard", (c) => c.render(<DashboardPage />))
app.get("/analytics", (c) => c.render(<AnalyticsPage />))           // nice short path
app.get("/analytics", (c) => c.render(<AnalyticsPage />))    // compat alias
app.get("/reports", (c) => c.render(<ReportsPage />))

// ---------- export worker ----------
export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) =>
    app.fetch(request, env, ctx),
}
