import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
const app = new Hono()
app.get('/api/health', c => c.json({ ok: true, service: 'insight-hunter', version: 'v1.2.1' }))
app.get('/api/demo/summary', c => c.json([
  { label: 'MRR', value: '$6,400' },
  { label: 'Active Workspaces', value: '41' },
  { label: 'Reports / wk', value: '183' }
]))
app.get('/api/demo/forecast', c => c.json([
  { month: 'Sep', cashIn: 28000, cashOut: 21000, netCash: 7000, eomBalance: 42000 },
  { month: 'Oct', cashIn: 29500, cashOut: 21900, netCash: 7600, eomBalance: 49600 },
  { month: 'Nov', cashIn: 31000, cashOut: 23500, netCash: 7500, eomBalance: 57100 }
]))
app.get('/assets/*', serveStatic())
app.get('/favicon.svg', serveStatic())
app.get('*', serveStatic({ path: 'index.html' }))
export default app
