import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { nanoid } from "nanoid"; // if not available, swap with a tiny random function
import { serveStatic } from "hono/cloudflare-workers";

type Env = {
  IH_DB: D1Database;
  IH_SESSIONS: KVNamespace;
  SESSION_TTL_SECONDS: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

/** --- UTIL --- **/
function nowSec() {
  return Math.floor(Date.now() / 1000);
}
function ttl(env: Env) {
  return parseInt(env.SESSION_TTL_SECONDS || "604800", 10);
}
function sidKey(sid: string) {
  return `sid:${sid}`;
}

/** --- AUTH: SIGN UP --- **/
app.post("/api/auth/signup", async (c) => {
  const body = await c.req.json<{
    email: string;
    password: string;
    company?: string;
  }>();
  const email = (body.email || "").trim().toLowerCase();
  const pw = body.password || "";
  if (!email || pw.length < 8)
    return c.json({ ok: false, message: "Invalid email or password" }, 400);

  const userId = nanoid();
  const password_hash = `plain:${pw}`; // TODO: replace with bcrypt/argon hash via worker-compatible lib
  const createdAt = nowSec();

  const db = c.env.IH_DB;
  try {
    await db
      .prepare(
        "INSERT INTO users (id,email,password_hash,created_at) VALUES (?,?,?,?)",
      )
      .bind(userId, email, password_hash, createdAt)
      .run();

    // optional: create an empty business now
    if (body.company) {
      await db
        .prepare(
          "INSERT INTO businesses (id,user_id,legal_name,currency,fiscal_month,industry,created_at) VALUES (?,?,?,?,?,?,?)",
        )
        .bind(
          nanoid(),
          userId,
          body.company,
          "USD",
          "January",
          "Other",
          createdAt,
        )
        .run();
    }

    // create session
    const sid = nanoid();
    await c.env.IH_SESSIONS.put(
      sidKey(sid),
      JSON.stringify({ userId, email }),
      { expirationTtl: ttl(c.env) },
    );
    setCookie(c, "ih_sid", sid, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
    });

    return c.json({ ok: true, redirect: "/business-setup" });
  } catch (e: any) {
    const msg = /UNIQUE/.test(String(e?.message))
      ? "Email already registered"
      : "Signup failed";
    return c.json({ ok: false, message: msg }, 400);
  }
});

/** --- AUTH: SIGN IN --- **/
app.post("/api/auth/signin", async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();
  const email = (body.email || "").trim().toLowerCase();
  const pw = body.password || "";
  if (!email || !pw)
    return c.json({ ok: false, message: "Missing credentials" }, 400);

  const user = await c.env.IH_DB.prepare(
    "SELECT id,password_hash FROM users WHERE email = ?",
  )
    .bind(email)
    .first<{ id: string; password_hash: string }>();
  if (!user) return c.json({ ok: false, message: "Invalid login" }, 401);

  const ok = user.password_hash === `plain:${pw}`; // TODO: compare hash in prod
  if (!ok) return c.json({ ok: false, message: "Invalid login" }, 401);

  const sid = nanoid();
  await c.env.IH_SESSIONS.put(
    sidKey(sid),
    JSON.stringify({ userId: user.id, email }),
    { expirationTtl: ttl(c.env) },
  );
  setCookie(c, "ih_sid", sid, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
  });

  return c.json({ ok: true, redirect: "/business-setup" });
});

/** --- SETUP: BUSINESS --- **/
app.post("/api/setup/business", async (c) => {
  const sid = getCookie(c, "ih_sid");
  if (!sid) return c.json({ ok: false, message: "Unauthorized" }, 401);
  const sess = (await c.env.IH_SESSIONS.get(sidKey(sid), "json")) as {
    userId: string;
  } | null;
  if (!sess) return c.json({ ok: false, message: "Unauthorized" }, 401);

  const body = await c.req.json<{
    legalName: string;
    currency: string;
    fiscalMonth: string;
    industry: string;
  }>();
  const { legalName, currency, fiscalMonth, industry } = body;
  if (!legalName)
    return c.json({ ok: false, message: "Legal name required" }, 400);

  const row = await c.env.IH_DB.prepare(
    "SELECT id FROM businesses WHERE user_id = ?",
  )
    .bind(sess.userId)
    .first<{ id: string }>();
  if (row) {
    await c.env.IH_DB.prepare(
      "UPDATE businesses SET legal_name=?, currency=?, fiscal_month=?, industry=? WHERE id=?",
    )
      .bind(legalName, currency, fiscalMonth, industry, row.id)
      .run();
  } else {
    await c.env.IH_DB.prepare(
      "INSERT INTO businesses (id,user_id,legal_name,currency,fiscal_month,industry,created_at) VALUES (?,?,?,?,?,?,?)",
    )
      .bind(
        nanoid(),
        sess.userId,
        legalName,
        currency,
        fiscalMonth,
        industry,
        nowSec(),
      )
      .run();
  }

  return c.json({ ok: true });
});

/** --- Analytics stub used by AnalyticsTrends.tsx --- **/
app.get("/api/analytics/summary", (c) => {
  return c.json({
    kpis: [
      { label: "MRR", value: "$6,400" },
      { label: "Active Clients", value: "18" },
      { label: "Avg. AR Days", value: "27" },
    ],
    series: [
      { month: "Jan", revenue: 22000, expenses: 15000, net: 7000 },
      { month: "Feb", revenue: 23500, expenses: 16400, net: 7100 },
      { month: "Mar", revenue: 25000, expenses: 17200, net: 7800 },
      { month: "Apr", revenue: 26800, expenses: 18600, net: 8200 },
    ],
  });
});

/** --- Static & SPA fallback (serve your React build) --- **/
app.get("/assets/*", serveStatic({ root: "./dist" }));
app.get("*", serveStatic({ path: "./dist/index.html" }));

export default app;
