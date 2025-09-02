export const rateLimit = async (c: Context, next: Next) => {
  const ip = c.req.headers.get("CF-Connecting-IP")!;
  const key = `rate:${ip}`;
  const count = parseInt((await IH_SESSIONS.get(key)) || "0", 10);

  if (count >= 10) {
    return c.text("Too Many Requests", 429);
  }

  await IH_SESSIONS.put(key, (count + 1).toString(), { expirationTtl: 60 });
  await next();
};
