// src/api.ts
import { Hono } from 'hono'

// Define types for clarity
type Kpi = { label: string; value: string }
type Point = { month: string; revenue: number; expenses: number; net: number }

const app = new Hono()

// Health check
app.get('/api/health', (c) =>
  c.json({ ok: true, service: 'insight-hunter', timestamp: new Date().toISOString() })
)

// Demo summary (
