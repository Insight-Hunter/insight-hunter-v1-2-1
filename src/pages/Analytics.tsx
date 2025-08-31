import type { FC } from "react";
export const Analytics: FC = () => (
  
import { useEffect, useState } from "react";
  <main>
    <h1 style={{ fontSize: 28, marginBottom: 8 }}>Analytics & Trends</h1>
    <p className="sub">“Your invoice risk increased 12% last month.”</p>
  type Kpi = { label: string; value: string };
type Point = { month: string; revenue: number; expenses: number; net: number };

export default function AnalyticsTrends() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [series, setSeries] = useState<Point[]>([]);
  
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/analytics/summary");
        const data = await res.json();
        setKpis(data.kpis || []);
        setSeries(data.series || []);
      } catch {
        setKpis([
          { label: "MRR", value: "$6,400" },
          { label: "Active Clients", value: "18" },
          { label: "Avg. AR Days", value: "27" },
        ]);
        setSeries([
          { month: "Jan", revenue: 22000, expenses: 15000, net: 7000 },
          { month: "Feb", revenue: 23500, expenses: 16400, net: 7100 },
          { month: "Mar", revenue: 25000, expenses: 17200, net: 7800 },
          { month: "Apr", revenue: 26800, expenses: 18600, net: 8200 },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Analytics & Trends</h1>
        <p className="text-sm text-gray-500">Key performance indicators and monthly trends.</p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded border p-4">
            <div className="text-sm text-gray-500">{k.label}</div>
            <div className="text-2xl font-semibold mt-1">{k.value}</div>
          </div>
        ))}
      </section>

      {/* Simple line chart (SVG) */}
      <section className="rounded border p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">Revenue vs Expenses</h2>
          {loading && <span className="text-sm text-gray-500">Loading…</span>}
        </div>
        <Chart data={series} />
      </section>
    </div>
  );
}

function Chart({ data }: { data: Point[] }) {
  if (!data.length) return <div className="text-sm text-gray-500">No data yet.</div>;

  // Normalize to 0..1 for simple plotting
  const maxVal = Math.max(...data.flatMap(d => [d.revenue, d.expenses]));
  const pad = 20, w = 600, h = 220;
  const step = (w - pad * 2) / (data.length - 1 || 1);
  const y = (v: number) => h - pad - (v / maxVal) * (h - pad * 2);
  const x = (i: number) => pad + i * step;

  const path = (key: "revenue" | "expenses") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d[key])}`).join(" ");

  return (
    <div className="overflow-x-auto">
      <svg width={w} height={h} role="img" aria-label="Revenue and expenses line chart">
        {/* axes */}
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#ccc" />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#ccc" />
        {/* revenue */}
        <path d={path("revenue")} fill="none" stroke="currentColor" strokeWidth={2} />
        {/* expenses */}
        <path d={path("expenses")} fill="none" stroke="currentColor" strokeOpacity={0.4} strokeWidth={2} />
        {/* x labels */}
        {data.map((d, i) => (
          <text key={d.month} x={x(i)} y={h - 4} fontSize="10" textAnchor="middle">{d.month}</text>
        ))}
      </svg>
    </div>
  );
}
