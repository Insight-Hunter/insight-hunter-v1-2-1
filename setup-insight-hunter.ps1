<# =====================================================================
  setup-insight-hunter.ps1
  Purpose: Clean & optimize Insight Hunter (Vite + React) for Cloudflare Pages
           + Pages Functions (edge workflows) + dynamic edge-created pages.

  Usage:
    powershell -ExecutionPolicy Bypass -File .\setup-insight-hunter.ps1

  Flags (optional):
    -Clean            : remove node_modules & dist before install
    -ForceOverwrite   : allow script to overwrite certain core files (backs up first)
    -SkipFormat       : skip Prettier formatting
===================================================================== #>

param(
  [switch]$Clean = $false,
  [switch]$ForceOverwrite = $false,
  [switch]$SkipFormat = $false
)

$ErrorActionPreference = "Stop"
$root = (Get-Location).Path
Write-Host "==> Working directory: $root" -ForegroundColor Cyan

function New-Dir($p){ if(!(Test-Path $p)){ New-Item -ItemType Directory -Path $p | Out-Null } }
function BackUp-IfExists($path){
  if(Test-Path $path){
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $bak = "$path.bak.$stamp"
    Copy-Item $path $bak -Recurse -Force
    Write-Host "  • Backed up $path -> $bak" -ForegroundColor DarkYellow
  }
}
function Write-File($path, [string]$content, [switch]$Overwrite=$false){
  $dir = Split-Path $path -Parent
  if($dir){ New-Dir $dir }
  if(Test-Path $path){
    if($Overwrite){ BackUp-IfExists $path }
    else{
      Write-Host "  • Exists, keeping: $path" -ForegroundColor DarkGray
      return
    }
  }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
  Write-Host "  • Wrote: $path" -ForegroundColor Green
}
function Ensure-Json($path, [scriptblock]$mutator, [switch]$Overwrite=$false){
  $obj = @{}
  if(Test-Path $path){
    $json = Get-Content $path -Raw
    $obj = $json | ConvertFrom-Json
  } else {
    if($Overwrite){ BackUp-IfExists $path }
  }
  & $mutator ([ref]$obj)
  $out = ($obj | ConvertTo-Json -Depth 100)
  Write-File -path $path -content $out -Overwrite:$true
}

# --- 0. Sanity: Node/npm -----------------------------------------------------
try{
  $nodeV = node -v
  $npmV = npm -v
  Write-Host "==> Node: $nodeV | npm: $npmV" -ForegroundColor Cyan
}catch{
  Write-Host "!! Node.js/npm not found. Install Node 20+ first." -ForegroundColor Red
  exit 1
}

# --- 1. Clean (optional) -----------------------------------------------------
if($Clean){
  Write-Host "==> Cleaning node_modules & dist" -ForegroundColor Cyan
  if(Test-Path node_modules){ Remove-Item node_modules -Recurse -Force }
  if(Test-Path dist){ Remove-Item dist -Recurse -Force }
}

# --- 2. Ensure package.json, scripts, deps -----------------------------------
if(!(Test-Path "package.json")){
  Write-Host "==> No package.json found; initializing..." -ForegroundColor Cyan
  npm init -y | Out-Null
}

Ensure-Json "package.json" {
  param([ref]$pkg)
  if(-not $pkg.Value.name){ $pkg.Value.name = "insight-hunter" }
  if(-not $pkg.Value.version){ $pkg.Value.version = "1.0.0" }

  if(-not $pkg.Value.scripts){ $pkg.Value.scripts = @{} }
  $pkg.Value.scripts.dev = "vite"
  $pkg.Value.scripts.build = "vite build"
  $pkg.Value.scripts.preview = "vite preview --port 4173"
  if(-not $pkg.Value.scripts.format){ $pkg.Value.scripts.format = "prettier --write ." }

  if(-not $pkg.Value.dependencies){ $pkg.Value.dependencies = @{} }
  $pkg.Value.dependencies.react = $pkg.Value.dependencies.react ?? "^18.3.1"
  $pkg.Value.dependencies."react-dom" = $pkg.Value.dependencies."react-dom" ?? "^18.3.1"
  $pkg.Value.dependencies."react-router-dom" = $pkg.Value.dependencies."react-router-dom" ?? "^6.26.2"

  if(-not $pkg.Value.devDependencies){ $pkg.Value.devDependencies = @{} }
  $pkg.Value.devDependencies.vite = $pkg.Value.devDependencies.vite ?? "^5.4.2"
  $pkg.Value.devDependencies.typescript = $pkg.Value.devDependencies.typescript ?? "^5.5.4"
  $pkg.Value.devDependencies."@vitejs/plugin-react" = $pkg.Value.devDependencies."@vitejs/plugin-react" ?? "^4.3.1"
  $pkg.Value.devDependencies."@types/react" = $pkg.Value.devDependencies."@types/react" ?? "^18.3.5"
  $pkg.Value.devDependencies."@types/react-dom" = $pkg.Value.devDependencies."@types/react-dom" ?? "^18.3.0"
  $pkg.Value.devDependencies.prettier = $pkg.Value.devDependencies.prettier ?? "^3.3.3"
}

# --- 3. Core Vite files ------------------------------------------------------
$indexHtml = @"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Insight Hunter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"@
Write-File "index.html" $indexHtml -Overwrite:$ForceOverwrite

$viteConfig = @"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
})
"@
Write-File "vite.config.ts" $viteConfig -Overwrite:$ForceOverwrite

$tsconfig = @"
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["vite/client"]
  },
  "include": ["src", "functions"]
}
"@
Write-File "tsconfig.json" $tsconfig -Overwrite:$ForceOverwrite

# --- 4. SPA redirects for Cloudflare Pages -----------------------------------
$redirects = "/*    /index.html   200`n"
Write-File "_redirects" $redirects

# --- 5. Source structure + minimal entry files --------------------------------
New-Dir "src"
New-Dir "src/components"
New-Dir "src/pages"

$styles = @"
:root { font-family: Inter, system-ui, Arial, sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; background: #0b0b12; color: #e9e9f1; }
a { color: inherit; text-decoration: none; }
.card { background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px; }
.container { padding: 24px; }
"@
Write-File "src/styles.css" $styles

$main = @"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./styles.css"

const root = document.getElementById("root")!
createRoot(root).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
"@
Write-File "src/main.tsx" $main -Overwrite:$ForceOverwrite

# Layout (non-destructive: only create if missing)
$layout = @"
import React from "react"
import { Outlet, Link, useLocation } from "react-router-dom"

export default function Layout(){
  const { pathname } = useLocation()
  const showTabs = pathname !== "/"
  return (
    <div className="container">
      {showTabs && (
        <nav style={{display:"flex", gap:12, marginBottom:16, flexWrap:"wrap"}}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/forecast">Forecast</Link>
          <Link to="/reports">Reports</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      )}
      <Outlet/>
    </div>
  )
}
"@
if(!(Test-Path "src/components/Layout.tsx")){ Write-File "src/components/Layout.tsx" $layout }

# App.tsx (only create if missing; we won't overwrite your wiring)
$app = @"
import React from "react"
import { Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import Forecast from "./pages/Forecast"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"
import Analytics from "./pages/Analytics"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <Routes>
      <Route element={<Layout/>}>
        <Route path="/" element={<Home/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/forecast" element={<Forecast/>}/>
        <Route path="/reports" element={<Reports/>}/>
        <Route path="/analytics" element={<Analytics/>}/>
        <Route path="/settings" element={<Settings/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Route>
    </Routes>
  )
}
"@
if(!(Test-Path "src/App.tsx")){ Write-File "src/App.tsx" $app }

# Minimal pages (only create if missing)
$pageHome = @"
export default function Home(){
  return (<div><h1>Insight Hunter</h1><p>Welcome to your AI-powered Auto-CFO.</p></div>)
}
"@
if(!(Test-Path "src/pages/Home.tsx")){ Write-File "src/pages/Home.tsx" $pageHome }

$pageDash = @"
export default function Dashboard(){ return (<div><h2>Dashboard</h2></div>) }
"@
if(!(Test-Path "src/pages/Dashboard.tsx")){ Write-File "src/pages/Dashboard.tsx" $pageDash }

$pageForecast = @"
export default function Forecast(){ return (<div><h2>Forecast</h2></div>) }
"@
if(!(Test-Path "src/pages/Forecast.tsx")){ Write-File "src/pages/Forecast.tsx" $pageForecast }

$pageReports = @"
export default function Reports(){ return (<div><h2>Reports</h2></div>) }
"@
if(!(Test-Path "src/pages/Reports.tsx")){ Write-File "src/pages/Reports.tsx" $pageReports }

$pageSettings = @"
export default function Settings(){ return (<div><h2>Settings</h2></div>) }
"@
if(!(Test-Path "src/pages/Settings.tsx")){ Write-File "src/pages/Settings.tsx" $pageSettings }

$page404 = @"
import { Link } from "react-router-dom"
export default function NotFound(){
  return (<div><h2>404</h2><p>Page not found.</p><Link to="/">Go Home</Link></div>)
}
"@
if(!(Test-Path "src/pages/NotFound.tsx")){ Write-File "src/pages/NotFound.tsx" $page404 }

# Analytics page (compatible with your demo APIs, fallback data)
$pageAnalytics = @"
import React, { useEffect, useMemo, useState } from "react"
type KPI = { label: string; value: string; sublabel?: string }
type ForecastPoint = { month: string; cashIn: number; cashOut: number; netCash: number; eomBalance: number }

const FALLBACK_SUMMARY: KPI[] = [
  { label: "MRR", value: "$6,400", sublabel: "+4.3% MoM" },
  { label: "Active Workspaces", value: "41", sublabel: "+3 this week" },
  { label: "Reports / wk", value: "183", sublabel: "-6% vs. last wk" },
  { label: "Net Cash (avg)", value: "$7,100", sublabel: "L3M avg" }
]
const FALLBACK_FORECAST: ForecastPoint[] = [
  { month: "Apr", cashIn: 26000, cashOut: 19900, netCash: 6100, eomBalance: 38000 },
  { month: "May", cashIn: 27000, cashOut: 21600, netCash: 5400, eomBalance: 43400 },
  { month: "Jun", cashIn: 29800, cashOut: 22600, netCash: 7200, eomBalance: 50600 },
  { month: "Jul", cashIn: 29100, cashOut: 22200, netCash: 6900, eomBalance: 57500 },
  { month: "Aug", cashIn: 31200, cashOut: 22800, netCash: 8400, eomBalance: 65900 }
]

const card: React.CSSProperties = { background:"rgba(255,255,255,0.045)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:16 }
const subtle: React.CSSProperties = { opacity:0.8, fontSize:13 }
const title: React.CSSProperties = { margin:"0 0 10px 0", fontSize:18, fontWeight:600 }
const grid = (min=220): React.CSSProperties => ({ display:"grid", gridTemplateColumns:`repeat(auto-fit, minmax(${min}px,1fr))`, gap:16 })

function LineChart({ pts, height=140 }:{ pts:{x:string; y:number}[], height?:number }){
  const pad=28, w=560
  const xs=pts.map((_,i)=>i), ys=pts.map(p=>p.y)
  const xMax=Math.max(...xs,1), yMax=Math.max(...ys,1), yMin=Math.min(...ys,0)
  const x=(i:number)=> pad + (i*(w-pad*2))/(xMax||1)
  const y=(v:number)=> yMax===yMin ? height/2 : height-pad-((v-yMin)*(height-pad*2))/(yMax-yMin)
  const d=pts.map((p,i)=>`${i===0?"M":"L"} ${x(i)} ${y(p.y)}`).join(" ")
  return (<svg viewBox={`0 0 ${w} ${height}`} style={{width:"100%",height}}>
    {[0,0.25,0.5,0.75,1].map((t,i)=>{const yy=pad+t*(height-pad*2);return <line key={i} x1={pad} x2={w-pad} y1={yy} y2={yy} stroke="rgba(255,255,255,0.08)"/>})}
    <path d={d} fill="none" stroke="currentColor" strokeWidth={2.5}/>
    {pts.map((p,i)=><circle key={p.x} cx={x(i)} cy={y(p.y)} r={3.2} fill="currentColor"/>)}
    {pts.map((p,i)=><text key={`x-\${p.x}`} x={x(i)} y={height-6} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.75)">{p.x}</text>)}
  </svg>)
}
function BarChart({ pts, height=160 }:{ pts:{x:string; y:number}[], height?:number }){
  const pad=28, w=560, yMax=Math.max(...pts.map(p=>p.y),1), bw=(w-pad*2)/Math.max(pts.length,1)-10
  return (<svg viewBox={`0 0 ${w} ${height}`} style={{width:"100%",height}}>
    {[0,0.5,1].map((t,i)=>{const yy=pad+t*(height-pad*2);return <line key={i} x1={pad} x2={w-pad} y1={yy} y2={yy} stroke="rgba(255,255,255,0.08)"/>})}
    {pts.map((p,i)=>{const x=pad+i*((w-pad*2)/pts.length); const h=((p.y/yMax)*(height-pad*2))||0;
      return (<g key={p.x}><rect x={x+5} y={height-pad-h} width={bw} height={h} rx={6} fill="currentColor"/><text x={x+5+bw/2} y={height-8} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.75)">{p.x}</text></g>)
    })}
  </svg>)
}

export default function Analytics(){
  const [summary,setSummary]=useState<KPI[]|null>(null)
  const [forecast,setForecast]=useState<ForecastPoint[]|null>(null)
  useEffect(()=>{ let done=false; (async()=>{
    try{
      const [s,f] = await Promise.allSettled([ fetch("/api/demo/summary"), fetch("/api/demo/forecast") ])
      if(done) return
      if(s.status==="fulfilled" && s.value.ok){ setSummary(await s.value.json()) } else setSummary(FALLBACK_SUMMARY)
      if(f.status==="fulfilled" && f.value.ok){ setForecast(await f.value.json()) } else setForecast(FALLBACK_FORECAST)
    }catch{ if(!done){ setSummary(FALLBACK_SUMMARY); setForecast(FALLBACK_FORECAST) } }
  })(); return ()=>{ done=true } },[])
  const rev = useMemo(()=> (forecast??FALLBACK_FORECAST).map(p=>({x:p.month,y:p.cashIn/1000})), [forecast])
  const net = useMemo(()=> (forecast??FALLBACK_FORECAST).map(p=>({x:p.month,y:p.netCash/1000})), [forecast])

  return (
    <div>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:12,marginBottom:12}}>
        <h1 style={{margin:0,fontSize:24}}>Analytics</h1>
        <div style={subtle}>Revenue, cash, and account health</div>
      </div>

      <div style={grid(220)}>
        {(summary??FALLBACK_SUMMARY).map(k=>(
          <div className="card" key={k.label}>
            <div style={{fontSize:13,opacity:.8}}>{k.label}</div>
            <div style={{fontSize:26,fontWeight:700,marginTop:6}}>{k.value}</div>
            {k.sublabel && <div style={{...subtle,marginTop:6}}>{k.sublabel}</div>}
          </div>
        ))}
      </div>

      <div style={{height:16}}/>
      <div style={grid(340)}>
        <div className="card" style={{color:"#98c1ff"}}>
          <div style={title}>Revenue Trend</div>
          <div style={{...subtle,marginBottom:8}}>Cash in (k)</div>
          <LineChart pts={rev}/>
        </div>
        <div className="card" style={{color:"#a6f0c6"}}>
          <div style={title}>Net Cash</div>
          <div style={{...subtle,marginBottom:8}}>Monthly net cash (k)</div>
          <BarChart pts={net}/>
        </div>
      </div>
    </div>
  )
}
"@
if(!(Test-Path "src/pages/Analytics.tsx")){ Write-File "src/pages/Analytics.tsx" $pageAnalytics }

# --- 6. Cloudflare Pages Functions (edge backend) -----------------------------
New-Dir "functions"
New-Dir "functions/api/demo"
New-Dir "functions/pages"

$fnHealth = @"
export const onRequest: PagesFunction = () => {
  return new Response(JSON.stringify({ ok: true, service: "insight-hunter-demo" }), {
    headers: { "content-type": "application/json; charset=utf-8" }
  })
}
"@
Write-File "functions/api/health.ts" $fnHealth -Overwrite:$ForceOverwrite

$fnSummary = @"
export const onRequest: PagesFunction = () => {
  const data = [
    { label: "MRR", value: "$6,400" },
    { label: "Active Workspaces", value: "41" },
    { label: "Reports / wk", value: "183" }
  ]
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json; charset=utf-8" }
  })
}
"@
Write-File "functions/api/demo/summary.ts" $fnSummary

$fnForecast = @"
type Point = { month: string; cashIn: number; cashOut: number; netCash: number; eomBalance: number }
export const onRequest: PagesFunction = () => {
  const data: Point[] = [
    { month: "Apr", cashIn: 26000, cashOut: 19900, netCash: 6100, eomBalance: 38000 },
    { month: "May", cashIn: 27000, cashOut: 21600, netCash: 5400, eomBalance: 43400 },
    { month: "Jun", cashIn: 29800, cashOut: 22600, netCash: 7200, eomBalance: 50600 },
    { month: "Jul", cashIn: 29100, cashOut: 22200, netCash: 6900, eomBalance: 57500 },
    { month: "Aug", cashIn: 31200, cashOut: 22800, netCash: 8400, eomBalance: 65900 }
  ]
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json; charset=utf-8" }
  })
}
"@
Write-File "functions/api/demo/forecast.ts" $fnForecast

# Dynamic edge-created pages via KV on first request:
$fnDynamicPage = @"
type PageDoc = { title: string; bodyHtml: string }

function html(doc: PageDoc){
  return `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>\${doc.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><style>body{margin:0;background:#0b0b12;color:#e9e9f1;font-family:Inter,system-ui,Arial,sans-serif} .wrap{padding:24px} a{color:inherit;text-decoration:none} .card{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px}</style></head>
<body><div class="wrap"><div class="card"><h1>\${doc.title}</h1><div>\${doc.bodyHtml}</div></div></div></body></html>`
}

export const onRequest: PagesFunction<{ PAGES_KV: KVNamespace }> = async (ctx) => {
  const slug = (ctx.params as any)?.slug as string
  if(!slug) return new Response("Missing slug", { status: 400 })

  const key = `page:\${slug}`
  let raw = await ctx.env.PAGES_KV?.get(key, "json") as PageDoc | null

  // If not found, create a default page on-the-fly
  if(!raw){
    raw = {
      title: slug.replace(/[-_]/g," ").replace(/\b\w/g, c => c.toUpperCase()),
      bodyHtml: `<p>This page was created dynamically at the edge.</p><p>Slug: <strong>\${slug}</strong></p>`
    }
    try{
      await ctx.env.PAGES_KV?.put(key, JSON.stringify(raw), { metadata: { createdAt: Date.now() } })
    }catch(e){}
  }

  return new Response(html(raw), { headers: { "content-type": "text/html; charset=utf-8" }})
}
"@
Write-File "functions/pages/[slug].ts" $fnDynamicPage

# --- 7. Install deps (ci if possible) ----------------------------------------
Write-Host "==> Installing dependencies" -ForegroundColor Cyan
$didCi = $false
try{
  if(Test-Path "package-lock.json"){
    npm ci --progress=false
    $didCi = $true
  } else {
    throw "no-lock"
  }
}catch{
  Write-Host "   (ci failed or no lock) Falling back to npm install…" -ForegroundColor DarkYellow
  npm install --no-audit --progress=false
}

# --- 8. Format (optional) ----------------------------------------------------
if(-not $SkipFormat){
  try{
    npx prettier --version | Out-Null
    Write-Host "==> Formatting project with Prettier" -ForegroundColor Cyan
    npx prettier --write .
  }catch{
    Write-Host "   (prettier not available?) skipping format" -ForegroundColor DarkYellow
  }
}

# --- 9. Build ---------------------------------------------------------------
Write-Host "==> Building (vite build)" -ForegroundColor Cyan
npm run build

# --- 10. Summary ------------------------------------------------------------
Write-Host ""
Write-Host "✅ Setup complete." -ForegroundColor Green
Write-Host "— Output:           $root\dist"
Write-Host "— SPA redirects:    $root\_redirects"
Write-Host "— Demo APIs:        /api/health, /api/demo/summary, /api/demo/forecast (Pages Functions)"
Write-Host "— Dynamic pages:    /pages/{slug} -> created/read in KV (binding: PAGES_KV)"
Write-Host ""
Write-Host "ℹ To enable KV in Cloudflare Pages:" -ForegroundColor Cyan
Write-Host "   • Create a KV namespace (e.g., PAGES_KV) in Cloudflare Dashboard."
Write-Host "   • In your Pages project → Settings → Functions → KV bindings → Bind name `PAGES_KV` to that namespace."
Write-Host "   • Visit https://<your-domain>/pages/your-new-page to create it on first load."
if($didCi){ Write-Host "   • Installed with npm ci (lockfile respected)." } else { Write-Host "   • Installed with npm install (lockfile updated locally)." }
