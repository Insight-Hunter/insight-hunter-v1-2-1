#!/usr/bin/env bash
set -euo pipefail

#  Upgrade script for Insight Hunter v1.2.1 (Linux/macOS/Git Bash)
#  - Backs up existing files to .backup_ih_v121/
#  - Writes full scaffold (worker, routes, styles, pages, config)
#  - Installs deps, builds, deploys with wrangler

echo "🔄 Running upgrade-insight-hunter-v1-2-1.sh"

# 1) Safety backup
mkdir -p .backup_ih_v121
cp -r src public index.html package.json tsconfig*.json vite.config.ts wrangler.json .backup_ih_v121/ 2>/dev/null || true

# 2) Write files from the scaffold
write() { mkdir -p "$(dirname "$1")"; cat > "$1"; }

# package.json
write package.json <<'JSON'
{
  "name": "insight-hunter-v1-2-1",
  "private": true,
  "type": "module",
  "version": "0.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 5173",
    "deploy": "wrangler deploy",
    "tail": "wrangler tail"
  },
  "dependencies": {
    "hono": "^4.6.6",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.4",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.5.4",
    "vite": "^5.4.3"
  }
}
JSON

# tsconfig.json
write tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {"@/*": ["./src/*"]}
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
JSON

# vite.config.ts
write vite.config.ts <<'TS'
import { defineConfig } from 'vite'
import path from 'node:path'
export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: { outDir: 'dist/client', sourcemap: false, assetsDir: 'assets', emptyOutDir: true },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } }
})
TS

# wrangler.json
write wrangler.json <<'JSON'
{
  "name": "insight-hunter-v1-2-1",
  "main": "src/worker.ts",
  "compatibility_date": "2025-08-01",
  "assets": {"directory": "dist/client"}
}
JSON

# index.html
write index.html <<'HTML'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Insight Hunter</title>
    <link rel="icon" href="/favicon.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
HTML

# styles
write src/styles.css <<'CSS'
:root{ --bg:#0b0b12; --panel:#12121b; --muted:#9aa3b2; --text:#e9ecf1; --brand:#7c6cff; --brand-2:#9d89ff; --ok:#35c759; --warn:#ffb020; --bad:#ff6b6b; }
*{box-sizing:border-box} html,body,#root{height:100%}
body{margin:0;background:linear-gradient(160deg,var(--bg),#0e0e17);color:var(--text);font:400 15px/1.45 system-ui,Segoe UI,Roboto,Inter,sans-serif}
.app{min-height:100%;display:flex;flex-direction:column}
.header{position:sticky;top:0;z-index:10;background:rgba(18,18,27,.7);backdrop-filter:saturate(160%) blur(12px);border-bottom:1px solid rgba(255,255,255,.06)}
.header-inner{display:flex;align-items:center;gap:12px;padding:10px 14px}
.logo{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,var(--brand),var(--brand-2));box-shadow:0 4px 22px rgba(124,108,255,.45)}
.title{font-weight:650;letter-spacing:.2px}
.main{flex:1;padding:16px}
.panel{background:var(--panel);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px;box-shadow:0 8px 28px rgba(0,0,0,.35)}
.grid{display:grid;gap:12px}
@media(min-width:760px){.grid{grid-template-columns:repeat(12,1fr)}.span-4{grid-column:span 4}.span-6{grid-column:span 6}.span-12{grid-column:span 12}}
.stat{display:flex;justify-content:space-between;align-items:center;background:#0f0f17;border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:14px}
.stat .label{color:var(--muted);font-size:13px}
.stat .value{font-weight:700}
.tabbar{position:sticky;bottom:0;background:rgba(18,18,27,.9);backdrop-filter:saturate(160%) blur(14px);border-top:1px solid rgba(255,255,255,.06)}
.tabs{display:flex;justify-content:space-around;gap:6px;padding:10px}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 6px;border-radius:12px;text-decoration:none;color:var(--muted)}
.tab.active{color:var(--text);background:rgba(124,108,255,.12);outline:1px solid rgba(124,108,255,.35)}
.tab .icon{font-size:16px}
.link{color:var(--brand)}
.button{appearance:none;border:0;border-radius:12px;padding:10px 14px;background:linear-gradient(135deg,var(--brand),var(--brand-2));color:white;font-weight:600;box-shadow:0 8px 24px rgba(124,108,255,.45)}
.button.ghost{background:transparent;border:1px solid rgba(255,255,255,.12)}
CSS

# worker API
write src/worker.ts <<'TS'
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
TS

# client
write src/lib/api.ts <<'TS'
export async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}
TS

write src/main.tsx <<'TSX'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Forecast from './pages/Forecast'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import './styles.css'
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route element={<Layout />}> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
TSX

write src/App.tsx <<'TSX'
import { Link } from 'react-router-dom'
export default function App(){
  return (
    <div className="app">
      <header className="header"><div className="header-inner"><div className="logo" /><div className="title">Insight Hunter</div></div></header>
      <main className="main">
        <section className="panel" style={{textAlign:'center'}}>
          <h1 style={{marginTop:0}}>Auto‑CFO for everyone</h1>
          <p style={{opacity:.85}}>Upload CSVs, get clean reports, and see your forecast instantly.</p>
          <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:16}}>
            <Link to="/dashboard" className="button">Open Dashboard</Link>
            <Link to="/forecast" className="button ghost">View Forecast</Link>
          </div>
        </section>
      </main>
    </div>
  )
}
TSX

write src/components/Layout.tsx <<'TSX'
import { Outlet, useLocation } from 'react-router-dom'
import TabBar from './TabBar'
export default function Layout(){
  const { pathname } = useLocation()
  const showTabs = pathname !== '/'
  return (
    <div className="app">
      <header className="header"><div className="header-inner"><div className="logo" /><div className="title">Insight Hunter</div></div></header>
      <main className="main"><Outlet /></main>
      {showTabs && <TabBar />}
    </div>
  )
}
TSX

write src/components/TabBar.tsx <<'TSX'
import { Link, useLocation } from 'react-router-dom'
const tabs = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/forecast',  label: 'Forecast', icon: '📈' },
  { to: '/reports',   label: 'Reports', icon: '📄' },
  { to: '/settings',  label: 'Settings', icon: '⚙️' }
]
export default function TabBar(){
  const { pathname } = useLocation()
  return (
    <nav className="tabbar"><div className="tabs">
      {tabs.map(t => (
        <Link key={t.to} to={t.to} className={`tab ${pathname===t.to?'active':''}`}>
          <div className="icon" aria-hidden>{t.icon}</div>
          <div className="label">{t.label}</div>
        </Link>
      ))}
    </div></nav>
  )
}
TSX

write src/components/Stat.tsx <<'TSX'
export function Stat({ label, value }: { label: string; value: string }){
  return (
    <div className="stat"><div className="label">{label}</div><div className="value">{value}</div></div>
  )
}
TSX

write src/pages/Dashboard.tsx <<'TSX'
import { useEffect, useState } from 'react'
import { getJSON } from '@/lib/api'
import { Stat } from '@/components/Stat'
type Summary = { label: string; value: string }
export default function Dashboard(){
  const [data, setData] = useState<Summary[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => { getJSON<Summary[]>('/api/demo/summary').then(setData).catch(e=>setErr(String(e))) }, [])
  return (
    <div className="grid">
      <div className="span-12 panel">
        <h2 style={{marginTop:0}}>Dashboard</h2>
        {err && <div style={{color:'var(--bad)'}}>Error: {err}</div>}
        {!data && !err && <div>Loading…</div>}
        {data && (
          <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
            {data.map((s,i)=> <Stat key={i} label={s.label} value={s.value} />)}
          </div>
        )}
      </div>
    </div>
  )
}
TSX

write src/pages/Forecast.tsx <<'TSX'
import { useEffect, useMemo, useState } from 'react'
import { getJSON } from '@/lib/api'
type Row = { month: string; cashIn: number; cashOut: number; netCash: number; eomBalance: number }
export default function Forecast(){
  const [rows, setRows] = useState<Row[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  useEffect(()=>{ getJSON<Row[]>('/api/demo/forecast').then(setRows).catch(e=>setErr(String(e))) },[])
  const totals = useMemo(()=>{ if(!rows) return null; return rows.reduce((acc,r)=>({
    cashIn: acc.cashIn + r.cashIn, cashOut: acc.cashOut + r.cashOut, netCash: acc.netCash + r.netCash, eomBalance: r.eomBalance
  }),{cashIn:0,cashOut:0,netCash:0,eomBalance:0}) },[rows])
  return (
    <div className="panel">
      <h2 style={{marginTop:0}}>Forecast</h2>
      {err && <div style={{color:'var(--bad)'}}>Error: {err}</div>}
      {!rows && !err && <div>Loading…</div>}
      {rows && (
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{color:'var(--muted)',fontSize:13}}>
                <th align="left">Month</th>
                <th align="right">Cash In</th>
                <th align="right">Cash Out</th>
                <th align="right">Net Cash</th>
                <th align="right">EoM Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r=> (
                <tr key={r.month}>
                  <td>{r.month}</td>
                  <td align="right">${r.cashIn.toLocaleString()}</td>
                  <td align="right">${r.cashOut.toLocaleString()}</td>
                  <td align="right" style={{color:r.netCash>=0?'var(--ok)':'var(--bad)'}}>{r.netCash>=0?'+':''}${r.netCash.toLocaleString()}</td>
                  <td align="right">${r.eomBalance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            {totals && (
              <tfoot>
                <tr>
                  <td style={{fontWeight:700}}>Totals</td>
                  <td align="right" style={{fontWeight:700}}>${totals.cashIn.toLocaleString()}</td>
                  <td align="right" style={{fontWeight:700}}>${totals.cashOut.toLocaleString()}</td>
                  <td align="right" style={{fontWeight:700,color:totals.netCash>=0?'var(--ok)':'var(--bad)'}}>{totals.netCash>=0?'+':''}${totals.netCash.toLocaleString()}</td>
                  <td align="right" style={{fontWeight:700}}>${totals.eomBalance.toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  )
}
TSX

write src/pages/Reports.tsx <<'TSX'
export default function Reports(){
  return (
    <div className="panel">
      <h2 style={{marginTop:0}}>Reports</h2>
      <p className="muted">Upload CSVs and generate a P&L, balance sheet, and cash flow PDF (coming next).</p>
      <button className="button">Upload CSV</button>
    </div>
  )
}
TSX

write src/pages/Settings.tsx <<'TSX'
export default function Settings(){
  return (
    <div className="panel">
      <h2 style={{marginTop:0}}>Settings</h2>
      <div className="grid">
        <div>
          <label className="label">Demo Mode</label>
          <div style={{opacity:.8}}>This build uses demo data from /api/demo/*</div>
        </div>
      </div>
    </div>
  )
}
TSX

# public
mkdir -p public
write public/favicon.svg <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7c6cff"/>
      <stop offset="1" stop-color="#9d89ff"/>
    </linearGradient>
  </defs>
  <rect width="48" height="48" rx="10" fill="url(#g)"/>
  <path d="M11 32l9-9 5 5 10-10 2 2-12 12-5-5-7 7z" fill="#fff"/>
</svg>
SVG

# 3) Install, build, deploy
if command -v npm >/dev/null 2>&1; then
  npm i
  npm run build
  npx wrangler deploy
else
  echo "npm not found; skip install/build"
fi

echo ""
echo "✅ Upgrade complete. Backup at .backup_ih_v121/"
