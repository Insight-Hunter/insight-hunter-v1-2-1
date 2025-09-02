export const onRequest: PagesFunction = () => {
  return new Response(
    JSON.stringify({ ok: true, service: "insight-hunter-demo" }),
    {
      headers: { "content-type": "application/json; charset=utf-8" },
    },
  );
};
