// worker/index.ts
import { Hono } from "hono";

type Env = {
  Bindings: {
    // Matches [assets] binding in wrangler.toml
    ASSETS: { fetch: typeof fetch };
    // Uncomment/add as you bind more stuff:
    // DB: D1Database;
    // BUCKET: R2Bucket;
    // CACHE: KVNamespace;
    // JOBS: Queue<any>;
  };
};

const app = new Hono<Env>();

// --- API routes ---
app.get("/api/health", (c) => c.json({ ok: true, service: "insight-hunter" }));
app.get("/api/hello/:name", (c) => c.json({ hello: c.req.param("name") }));

// --- Static assets + SPA fallback ---
app.all("*", async (c) => {
  // Try to serve a real static file first
  const res = await c.env.ASSETS.fetch(c.req.raw);
  if (res.status !== 404) return res;

  // If the client wants HTML (likely a client-side route), return index.html
  const accept = c.req.header("accept") ?? "";
  if (accept.includes("text/html")) {
    const url = new URL(c.req.url);
    // Important: fetch index.html from the assets binding
    return c.env.ASSETS.fetch(new Request(`${url.origin}/index.html`, c.req.raw));
  }

  // Otherwise, propagate the 404 (e.g., missing image/json/etc.)
  return res;
});

export default app;
