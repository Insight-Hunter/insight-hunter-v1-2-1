export const onRequest: PagesFunction = () => {
  const data = [
    { label: "MRR", value: "$6,400" },
    { label: "Active Workspaces", value: "41" },
    { label: "Reports / wk", value: "183" },
  ];
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
