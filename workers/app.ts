// workers/app.ts (Hono)
import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// API routes first...
app.get('/api/health', c => c.json({ ok: true }))

// Static / SPA fallback
app.get('/assets/*', serveStatic({ root: './dist' }))
app.get('*', serveStatic({ path: './dist/index.html' }))

export default app
