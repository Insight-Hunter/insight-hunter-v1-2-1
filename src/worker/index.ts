// worker/index.ts
import { Hono } from "hono";

type Env = {
  Bindings: {
    ASSETS: Fetcher; // provided by [assets] in wrangler.toml
  };
};

const app = new Hono<Env>();

// --- API routes ---
app.get("/api/health", (c) => c.json({ ok: true, service: "insight-hunter" }));

app.get("/api/demo/summary", (c) =>
  c.json([
    { label: "MRR", value: "$6,400" },
    { label: "Active Workspaces", value: "41" },
    { label: "Reports / wk", value: "183" },
  ])
);

app.get("/api/demo/forecast", (c) =>
  c.json([
    { month: "Sep", cashIn: 28000, cashOut: 21000, netCash: 7000, eomBalance: 42000 },
    { month: "Oct", cashIn: 29500, cashOut: 21900, netCash: 7600, eomBalance: 49600 },
    { month: "Nov", cashIn: 31000, cashOut: 23200, netCash: 7800, eomBalance: 57400 },
  ])
);

// --- Static assets + SPA fallback ---
// Order matters: API first, then assets/fallback
app.all("*", async (c) => {
  // Try to serve a static file first
  const assetRes = await c.env.ASSETS.fetch(c.req.raw);
  if (assetRes.status !== 404) return assetRes;

  // If client requested HTML (likely a SPA route), return index.html
  const accept = c.req.header("accept") ?? "";
  if (accept.includes("text/html")) {
    const url = new URL(c.req.url);
    return c.env.ASSETS.fetch(new Request(`${url.origin}/index.html`, c.req.raw));
  }

  // Otherwise, propagate the 404
  return assetRes;
});

export default app;
