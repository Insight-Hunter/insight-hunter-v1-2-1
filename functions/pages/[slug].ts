type PageDoc = { title: string; bodyHtml: string };

function html(doc: PageDoc) {
  return `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${doc.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><style>body{margin:0;background:#0b0b12;color:#e9e9f1;font-family:Inter,system-ui,Arial,sans-serif} .wrap{padding:24px} a{color:inherit;text-decoration:none} .card{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px}</style></head>
<body><div class="wrap"><div class="card"><h1>${doc.title}</h1><div>${doc.bodyHtml}</div></div></div></body></html>`;
}

export const onRequest: PagesFunction<{ PAGES_KV: KVNamespace }> = async (
  ctx,
) => {
  const slug = (ctx.params as any)?.slug as string;
  if (!slug) return new Response("Missing slug", { status: 400 });

  const key = `page:${slug}`;
  let raw = (await ctx.env.PAGES_KV?.get(key, "json")) as PageDoc | null;

  if (!raw) {
    raw = {
      title: slug
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      bodyHtml: `<p>This page was created dynamically at the edge.</p><p>Slug: <strong>${slug}</strong></p>`,
    };
    try {
      await ctx.env.PAGES_KV?.put(key, JSON.stringify(raw), {
        metadata: { createdAt: Date.now() },
      });
    } catch (e) {}
  }

  return new Response(html(raw), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
};
