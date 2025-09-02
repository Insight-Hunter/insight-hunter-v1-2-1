type Point = {
  month: string;
  cashIn: number;
  cashOut: number;
  netCash: number;
  eomBalance: number;
};
export const onRequest: PagesFunction = () => {
  const data: Point[] = [
    {
      month: "Apr",
      cashIn: 26000,
      cashOut: 19900,
      netCash: 6100,
      eomBalance: 38000,
    },
    {
      month: "May",
      cashIn: 27000,
      cashOut: 21600,
      netCash: 5400,
      eomBalance: 43400,
    },
    {
      month: "Jun",
      cashIn: 29800,
      cashOut: 22600,
      netCash: 7200,
      eomBalance: 50600,
    },
    {
      month: "Jul",
      cashIn: 29100,
      cashOut: 22200,
      netCash: 6900,
      eomBalance: 57500,
    },
    {
      month: "Aug",
      cashIn: 31200,
      cashOut: 22800,
      netCash: 8400,
      eomBalance: 65900,
    },
  ];
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
