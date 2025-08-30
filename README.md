# Insight Hunter

**Insight Hunter** is an AI-powered Auto-CFO platform built for freelancers, small firms, and business owners.  
It simplifies financial reporting, forecasting, and cashflow insights — providing CFO-level intelligence without the overhead.

Live App: [https://insight.hunterturner.com](https://insight.hunterturner.com)

---

## 🚀 Features
- **Authentication & Setup**
  - Sign Up / Sign In with session cookies
  - Business Setup wizard (legal name, currency, fiscal year, industry)
- **Dashboard**
  - CSV upload (via Cloudflare R2)
  - Connect to QuickBooks / Xero (OAuth endpoints planned)
  - AI-generated highlights and KPI snapshots
- **Analytics & Trends**
  - KPI cards (MRR, Clients, AR Days, etc.)
  - Revenue vs Expenses line chart
- **Reports & Forecast**
  - Historical reports (D1 database)
  - Forecasting charts and export (PDF/CSV planned)
- **Vendor & Client Profiles** (stub)
- **AI CFO Assistant** (stub for Q&A and insights)
- **Settings & Alerts** (stub)

---

## 🛠️ Tech Stack
- **Frontend**
  - React + TypeScript
  - React Router v6
  - TailwindCSS
- **Backend**
  - [Hono](https://hono.dev/) on Cloudflare Workers
  - Cloudflare D1 (SQLite) for structured data
  - Cloudflare KV for sessions
  - Cloudflare R2 for file uploads
- **Build & Deploy**
  - Vite
  - Cloudflare Wrangler

---

## 📂 Project Structure
```
src/
  components/     # Layout, shared UI
  pages/          # Dashboard, Forecast, Reports, Settings, Auth, etc.
  App.tsx         # Routes
  main.tsx        # Entry point
workers/
  app.ts          # Hono API + SPA serving
migrations/
  001_init.sql    # D1 schema
public/
  favicon.svg
  icons/
```

---

## ⚡ Development
### Prerequisites
- Node.js 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- Cloudflare account (with D1, KV, R2 enabled)

### Setup
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run worker locally
wrangler dev
```

---

## 🗄️ Database (D1)
Run migrations:
```bash
wrangler d1 migrations apply insight_hunter
```

---

## 🔑 Environment & Bindings
In `wrangler.toml`:
```toml
[[d1_databases]]
binding = "IH_DB"
database_name = "insight_hunter"
database_id = "REPLACE_WITH_ID"

[[kv_namespaces]]
binding = "IH_SESSIONS"
id = "REPLACE_WITH_KV_ID"

[[r2_buckets]]
binding = "IH_R2"
bucket_name = "insight-hunter-uploads"
```

---

## 🤝 Contributing
We welcome contributions! To get started:
1. Fork this repo
2. Create a new feature branch:  
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. Make your changes and commit:  
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to your fork and open a Pull Request

Please follow standard TypeScript + Prettier formatting, and add comments to your API endpoints.

---

## 🛣️ Roadmap
- [x] Authentication (Sign Up / Sign In)
- [x] Business Setup wizard
- [x] Dashboard, Reports, Forecast placeholders
- [x] Analytics & Trends (KPI + chart)
- [ ] Vendor & Client Profiles
- [ ] Alerts
- [ ] AI CFO Assistant (insight Q&A)
- [ ] QuickBooks / Xero integration
- [ ] Stripe + Plaid integrations
- [ ] Export to PDF/CSV
- [ ] White-label + Pro tier subscription

---

## 📝 License
MIT License © 2025 Insight Hunter  
See full license text below:

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👤 Authors
- **James Michael Hunter Turner**  


[insight.hunterturner.com](https://insight.hunterturner.com)
