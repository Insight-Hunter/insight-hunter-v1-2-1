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
  - CSV upload (via R2)
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
