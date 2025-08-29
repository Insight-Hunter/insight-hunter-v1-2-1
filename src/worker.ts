// src/worker.ts
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const app = new Hono()

// --- Demo / health ---
app.get('/api/health', (c) => c.json({ ok: true, service: 'insight-hunter' }))
app.get('/api/demo/summary', (c) =>
  c.json([
    { label: 'MRR', value: '$6,400' },
    { label: 'Active Workspaces', value: '41' },
    { label: 'Reports / wk', value: '183' },
  ])
)
app.get('/api/demo/forecast', (c) =>
  c.json([
    { month: 'Sep', cashIn: 28000, cashOut: 21000, netCash: 7000, eomBalance: 42000 },
    { month: 'Oct', cashIn: 29500, cashOut: 21900, netCash: 7600, eomBalance: 49600 },
  ])
)


const headerAuthSchema = z.object({ 'x-api-key': z.string().min(20) })
const reportCreateSchema = z.object({
  name: z.string().min(3).max(64),
  period: z.enum(['M', 'Q', 'Y']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  includeForecast: z.boolean().default(false),
}).strict()

app.post(
  '/api/reports',
  zValidator('header', headerAuthSchema, (r, c) => {
    if (!r.success) return c.json({ ok: false, error: r.error.flatten() }, 401)
  }),
  zValidator('json', reportCreateSchema, (r, c) => {
    if (!r.success) return c.json({ ok: false, error: r.error.flatten() }, 400)
  }),
  (c) => {
    const body = c.req.valid('json')
    return c.json({ ok: true, reportId: crypto.randomUUID(), input: body })
  }
)

app.notFound((c) => c.json({ ok: false, error: 'Not Found' }, 404))
app.onError((_err, c) => c.json({ ok: false, error: 'Internal Server Error' }, 500))

export default app

