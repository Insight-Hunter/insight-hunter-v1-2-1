<# =====================================================================
  setup-ih-rewire_v3_ascii.ps1
  - ASCII-only (no em dashes or arrows)
  - Rewires App.tsx and Layout.tsx (backs up originals)
  - Ensures Vite/React structure, SPA redirects, demo APIs
  - Adds dynamic edge pages via KV (functions/pages/[slug].ts)
  - Optional: -SeedKV to precreate /pages/pitch, /pages/pricing, /pages/terms
===================================================================== #>

param(
  [switch]$Clean = $false,
  [switch]$SkipFormat = $false,
  [switch]$SeedKV = $false,
  [string]$AccountId = $env:CLOUDFLARE_ACCOUNT_ID,
  [string]$NamespaceId = $env:PAGES_KV_NAMESPACE_ID,  # KV Namespace ID bound as PAGES_KV
  [string]$ApiToken = $env:CLOUDFLARE_API_TOKEN
)

$ErrorActionPreference = "Stop"
$root = (Get-Location).Path
Write-Host "==> Working directory: $root"

# ---------- Helpers ----------
function New-Dir($p){ if(!(Test-Path $p)){ New-Item -ItemType Directory -Path $p | Out-Null } }

function BackUp-IfExists($path){
  if(Test-Path $path){
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $bak = "$path.bak.$stamp"
    Copy-Item $path $bak -Recurse -Force
    Write-Host "  * Backed up $path -> $bak"
  }
}

function Write-File {
  param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$Content,
    [switch]$AlwaysBackup = $false
  )
  $dir = Split-Path $Path -Parent
  if($dir){ New-Dir $dir }
  if($AlwaysBackup -and (Test-Path $Path)){ BackUp-IfExists $Path }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
  Write-Host "  * Wrote: $Path"
}

function Has-Command([string]$name){
  try { return [bool](Get-Command $name -ErrorAction SilentlyContinue) } catch { return $false }
}

function Require-NonEmpty([string]$val, [string]$name){
  if([string]::IsNullOrWhiteSpace($val)){ throw "$name is required." }
}

# ---------- Sanity: Node/npm ----------
try{
  $nodeV = node -v
  $npmV = npm -v
  Write-Host "==> Node: $nodeV | npm: $npmV"
}catch{
  Write-Host "ERROR: Node.js/npm not found. Install Node 20+ first."
  exit 1
}

# ---------- Clean optional ----------
if($Clean){
  Write-Host "==> Cleaning node_modules and dist"
  if(Test-Path node_modules){ Remove-Item node_modules -Recurse -Force }
  if(Test-Path dist){ Remove-Item dist -Recurse -Force }
}

# ---------- package.json ----------
if(!(Test-Path "package.json")){
  Write-Host "==> No package.json found; initializing..."
  npm init -y | Out-Null
}
$pkg = (Get-Content package.json -Raw) | ConvertFrom-Json
if(-not $pkg.name){ $pkg | Add-Member -NotePropertyName name -NotePropertyValue "insight-hunter" -Force }
if(-not $pkg.version){ $pkg | Add-Member -NotePropertyName version -NotePropertyValue "1.0.0" -Force }
if(-not $pkg.scripts){ $pkg | Add-Member -NotePropertyName scripts -NotePropertyValue (@{}) -Force }

$pkg.scripts.dev = "vite"
$pkg.scripts.build = "vite build"
$pkg.scripts.preview = "vite preview --port 4173"
if(-not $pkg.scripts.format){ $pkg.scripts.format = "prettier --write ." }

if(-not $pkg.dependencies){ $pkg | Add-Member -NotePropertyName dependencies -NotePropertyValue (@{}) -Force }
if(-not $pkg.dependencies.react){ $pkg.dependencies.react = "^18.3.1" }
if(-not $pkg.dependencies."react-dom"){ $pkg.dependencies."react-dom" = "^18.3.1" }
if(-not $pkg.dependencies."react-router-dom"){ $pkg.dependencies."react-router-dom" = "^6.26.2" }

if(-not $pkg.devDependencies){ $pkg | Add-Member -NotePropertyName devDependencies -NotePropertyValue (@{}) -Force }
if(-not $pkg.devDependencies.vite){ $pkg.devDependencies.vite = "^5.4.2" }
if(-not $pkg.devDependencies.typescript){ $pkg.devDependencies.typescript = "^5.5.4" }
if(-not $pkg.devDependencies."@vitejs/plugin-react"){ $pkg.devDependencies."@vitejs/plugin-react" = "^4.3.1" }
if(-not $pkg.devDependencies."@types/react"){ $pkg.devDependencies."@types/react" = "^18.3.5" }
if(-not $pkg.devDependencies."@types/react-dom"){ $pkg.devDependencies."@types/react-dom" = "^18.3.0" }
if(-not $pkg.devDependencies.prettier){ $pkg.devDependencies.prettier = "^3.3.3" }

$pkgJson = ($pkg | ConvertTo-Json -Depth 100)
Write-File -Path "package.json" -Content $pkgJson -AlwaysBackup

# ---------- Core Vite files ----------
$indexHtml = @'
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
'@
Write-File -Path "index.html" -Content $indexHtml

$viteConfig = @'
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
})
'@
Write-File -Path "vite.config.ts" -Content $viteConfig

$tsconfig = @'
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
'@
Write-File -Path "tsconfig.json" -Content $tsconfig

# ---------- SPA redirects ----------
$redirects = "/*    /index.html   200`n"
Write-File -Path "_redirects" -Content $redirects

# ---------- Source structure & entry ----------
New-Dir "src"
New-Dir "src/components"
New-Dir "src/pages"

$styles = @'
:root { font-family: Inter, system-ui, Arial, sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; background: #0b0b12; color: #e9e9f1; }
a { color: inherit; text-decoration: none; }
.card { background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px; }
.container { padding: 24px; }
'@
Write-File -Path "src/styles.css" -Content $styles

$main = @'
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
'@
Write-File -Path "src/main.tsx" -Content $main

# ---------- ALWAYS REWIRE: Layout & App ----------
$layout = @'
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
'@
Write-File -Path "src/components/Layout.tsx" -Content $layout -AlwaysBackup

$app = @'
import React from "react"
import { Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"

import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import Forecast from "./pages/Forecast"
import Reports from "./pages/Reports"
import Analytics from "./pages/Analytics"
import Settings from "./pages/Settings"
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
'@
Write-File -Path "src/App.tsx" -Content $app -AlwaysBackup

# ---------- Minimal pages if missing ----------
if(!(Test-Path "src/pages/Home.tsx")){
  Write-File -Path "src/pages/Home.tsx" -Content @'
export default function Home(){
  return (<div><h1>Insight Hunter</h1><p>Welcome to your AI-powered Auto-CFO.</p></div>)
}
'@
}
if(!(Test-Path "src/pages/Dashboard.tsx")){
  Write-File -Path "src/pages/Dashboard.tsx" -Content @'
export default function Dashboard(){ return (<div><h2>Dashboard</h2></div>) }
'@
}
if(!(Test-Path "src/pages/Forecast.tsx")){
  Write-File -Path "src/pages/Forecast.tsx" -Content @'
export default function Forecast(){ return (<div><h2>Forecast</h2></div>) }
'@
}
if(!(Test-Path "src/pages/Reports.tsx")){
  Write-File -Path "src/pages/Reports.tsx" -Content @'
export default function Reports(){ return (<div><h2>Reports</h2></div>) }
'@
}
if(!(Test-Path "src/pages/Settings.tsx")){
  Write-File -Path "src/pages/Settings.tsx" -Content @'
export default function Settings(){ return (<div><h2>Settings</h2></div>) }
'@
}
if(!(Test-Path "src/pages/NotFound.tsx")){
  Write-File -Path "src/pages/NotFound.tsx" -Content @'
import { Link } from "react-router-dom"
export default function NotFound(){
  return (<div><h2>404</h2><p>Page not found.</p><Link to="/">Go Home</Link></div>)
}
'@
}

# Provide Analytics page if missing (compatible with demo APIs)
if(!(Test-Path "src/pages/Analytics.tsx")){
  Write-File -Path "src/pages/Analytics.tsx" -Content @'
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
    {pts.map((p,i)=><text key={`x-${p.x}`} x={x(i)} y={height-6} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.75)">{p.x}</text>)}
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
'@
}

# ---------- Pages Functions (demo + dynamic pages) ----------
New-Dir "functions"
New-Dir "functions/api"
New-Dir "functions/api/demo"
New-Dir "functions/pages"

$fnHealth = @'
export const onRequest: PagesFunction = () => {
  return new Response(JSON.stringify({ ok: true, service: "insight-hunter-demo" }), {
    headers: { "content-type": "application/json; charset=utf-8" }
  })
}
'@
Write-File -Path "functions/api/health.ts" -Content $fnHealth

$fnSummary = @'
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
'@
Write-File -Path "functions/api/demo/summary.ts" -Content $fnSummary

$fnForecast = @'
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
'@
Write-File -Path "functions/api/demo/forecast.ts" -Content $fnForecast

# Dynamic edge-created pages via KV on first request
$fnDynamic = @'
type PageDoc = { title: string; bodyHtml: string }

function html(doc: PageDoc){
  return `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${doc.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><style>body{margin:0;background:#0b0b12;color:#e9e9f1;font-family:Inter,system-ui,Arial,sans-serif} .wrap{padding:24px} a{color:inherit;text-decoration:none} .card{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px}</style></head>
<body><div class="wrap"><div class="card"><h1>${doc.title}</h1><div>${doc.bodyHtml}</div></div></div></body></html>`
}

export const onRequest: PagesFunction<{ PAGES_KV: KVNamespace }> = async (ctx) => {
  const slug = (ctx.params as any)?.slug as string
  if(!slug) return new Response("Missing slug", { status: 400 })

  const key = `page:${slug}`
  let raw = await ctx.env.PAGES_KV?.get(key, "json") as PageDoc | null

  if(!raw){
    raw = {
      title: slug.replace(/[-_]/g," ").replace(/\b\w/g, c => c.toUpperCase()),
      bodyHtml: `<p>This page was created dynamically at the edge.</p><p>Slug: <strong>${slug}</strong></p>`
    }
    try{
      await ctx.env.PAGES_KV?.put(key, JSON.stringify(raw), { metadata: { createdAt: Date.now() } })
    }catch(e){}
  }

  return new Response(html(raw), { headers: { "content-type": "text/html; charset=utf-8" }})
}
'@
Write-File -Path "functions/pages/[slug].ts" -Content $fnDynamic

# ---------- Install deps ----------
Write-Host "==> Installing dependencies"
$didCi = $false
try{
  if(Test-Path "package-lock.json"){
    npm ci --progress=false
    $didCi = $true
  } else { throw "no-lock" }
}catch{
  Write-Host "   (ci failed or no lock) Falling back to npm install..."
  npm install --no-audit --progress=false
}

# ---------- Format optional ----------
if(-not $SkipFormat){
  try{
    npx prettier --version | Out-Null
    Write-Host "==> Formatting project with Prettier"
    npx prettier --write .
  }catch{
    Write-Host "   (prettier not available) skipping format"
  }
}

# ---------- Build ----------
Write-Host "==> Building (vite build)"
npm run build

# ---------- Optional: Seed KV ----------
if($SeedKV){
  Write-Host "==> Seeding KV (PAGES_KV) with /pages/pitch, /pages/pricing, /pages/terms"

  $docs = @(
    @{
      slug = "pitch"
      title = "Insight Hunter - Pitch"
      bodyHtml = @'
<h2>Insight Hunter Pitch</h2>
<p>Insight Hunter is your AI-powered Auto-CFO for freelancers and small firms. We automate reporting, forecasting, and cash insights so owners move faster.</p>
<ul>
  <li><b>Problem:</b> Financial ops are manual and slow.</li>
  <li><b>Solution:</b> Plug-and-play dashboards, forecasting, and alerts.</li>
  <li><b>Why now:</b> AI plus modern fintech rails enable CFO-grade insights for everyone.</li>
</ul>
<p><a href="/analytics">Explore Analytics -></a></p>
'@
    },
    @{
      slug = "pricing"
      title = "Insight Hunter - Pricing"
      bodyHtml = @'
<h2>Pricing</h2>
<ul>
  <li><b>Starter:</b> $39/mo - core dashboards, CSV uploads, basic insights</li>
  <li><b>Pro:</b> $99/mo - forecasting, report packs, alerts, client portal</li>
  <li><b>Firm:</b> $199/mo - multi-workspace, white-label, priority support</li>
</ul>
<p>Annual and firm discounts available.</p>
'@
    },
    @{
      slug = "terms"
      title = "Insight Hunter - Terms of Service"
      bodyHtml = @'
<h2>Terms of Service</h2>
<p>By using Insight Hunter, you agree to acceptable use, confidentiality, and data handling terms. Content is provided as-is; we are not your CPA.</p>
<p>Contact: <a href="mailto:michael@hunterturner.com">michael@hunterturner.com</a></p>
'@
    }
  )

  $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $items = @()
  foreach($d in $docs){
    $items += @{
      key = ("page:{0}" -f $d.slug)
      value = (ConvertTo-Json @{ title = $d.title; bodyHtml = $d.bodyHtml } -Depth 50)
      metadata = @{ createdAt = $now; seeded = $true }
    }
  }

  $wranglerExists = Has-Command "wrangler"

  if($wranglerExists){
    try{
      $tmp = New-TemporaryFile
      $json = ($items | ConvertTo-Json -Depth 100)
      [System.IO.File]::WriteAllText($tmp.FullName, $json, (New-Object System.Text.UTF8Encoding($false)))
      if([string]::IsNullOrWhiteSpace($NamespaceId)){ Require-NonEmpty $NamespaceId "NamespaceId (PAGES_KV)" }
      Write-Host "   Using Wrangler KV bulk put"
      wrangler kv:bulk put --namespace-id $NamespaceId $tmp.FullName
      Remove-Item $tmp -Force
      Write-Host "[OK] KV seeded via Wrangler."
    }catch{
      Write-Host "Wrangler failed; trying REST API..."
      $wranglerExists = $false
    }
  }

  if(-not $wranglerExists){
    Require-NonEmpty $AccountId "AccountId"
    Require-NonEmpty $ApiToken "ApiToken"
    Require-NonEmpty $NamespaceId "NamespaceId (PAGES_KV)"

    $uri = "https://api.cloudflare.com/client/v4/accounts/$AccountId/storage/kv/namespaces/$NamespaceId/bulk"
    $headers = @{
      "Authorization" = "Bearer $ApiToken"
      "Content-Type"  = "application/json"
    }
    $body = ($items | ConvertTo-Json -Depth 100)

    Write-Host ("   PUT {0}" -f $uri)
    $response = Invoke-RestMethod -Method Put -Uri $uri -Headers $headers -Body $body
    if($response.success -ne $true){
      Write-Host "ERROR: KV seed failed."
      $response | ConvertTo-Json -Depth 10
      exit 1
    }
    Write-Host "[OK] KV seeded via REST."
  }

  Write-Host "Visit:"
  $docs | ForEach-Object { Write-Host ("  /pages/{0}" -f $_.slug) }
}

# ---------- Summary ----------
Write-Host ""
Write-Host "[OK] Rewire v3 (ASCII) complete."
Write-Host " - App.tsx and Layout.tsx overwritten (backups created)."
Write-Host " - SPA redirects: _redirects"
Write-Host " - Demo APIs: /api/health, /api/demo/summary, /api/demo/forecast"
Write-Host " - Dynamic pages: /pages/{slug} (KV binding name: PAGES_KV)"
if($SeedKV){ Write-Host " - KV seeded: pitch, pricing, terms" }
Write-Host ""
Write-Host "Cloudflare Pages settings:"
Write-Host " - Build command: npm run build"
Write-Host " - Output dir:    dist"
Write-Host " - Framework:     Vite"
Write-Host " - Add KV binding in Pages -> Settings -> Functions -> KV: name PAGES_KV"
