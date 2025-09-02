// src/pages/Analytics.tsx
import React, { useEffect, useState } from "react";

type Kpi = { label: string; value: string };
type Point = { month: string; revenue: number; expenses: number; net?: number };

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 16,
};

const subtle: React.CSSProperties = { opacity: 0.8, fontSize: 13 };
const grid = (min = 220): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: `repeat(auto-fit, minmax(${min}px,1fr))`,
  gap: 16,
});

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [series, setSeries] = useState<Point[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/analytics/summary").catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setKpis((data?.kpis as Kpi[]) ?? []);
            setSeries((data?.series as Point[]) ?? []);
          }
        } else {
          // Fallback demo data
          if (!cancelled) {
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
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24 }}>Analytics</h1>
        <div style={subtle}>Key performance indicators and monthly trends</div>
      </div>

      {/* KPIs */}
      <section style={grid(220)}>
        {kpis.map((k) => (
          <div key={k.label} style={card}>
            <div style={{ ...subtle }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>
              {k.value}
            </div>
          </div>
        ))}
        {!kpis.length && (
          <div style={card}>
            <div style={{ ...subtle }}>No KPIs</div>
            <div style={{ marginTop: 6 }}>
              Add data sources to see KPIs here.
            </div>
          </div>
        )}
      </section>

      <div style={{ height: 16 }} />

      {/* Chart */}
      <section style={{ ...card }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div style={{ fontWeight: 600 }}>Revenue vs Expenses</div>
          {loading && <span style={subtle}>Loading…</span>}
        </div>
        <Chart data={series} />
      </section>
    </main>
  );
}

function Chart({ data }: { data: Point[] }) {
  if (!data.length) {
    return <div style={{ ...subtle }}>No data yet.</div>;
  }

  // Simple responsive-ish SVG settings
  const pad = 24;
  const w = 640;
  const h = 240;
  const maxVal = Math.max(...data.flatMap((d) => [d.revenue, d.expenses, 1]));
  const step = (w - pad * 2) / Math.max(data.length - 1, 1);
  const y = (v: number) => h - pad - (v / maxVal) * (h - pad * 2);
  const x = (i: number) => pad + i * step;

  const pathFor = (key: "revenue" | "expenses") =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y((d as any)[key])}`)
      .join(" ");

  return (
    <div style={{ overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height={h}
        role="img"
        aria-label="Revenue and expenses line chart"
      >
        {/* grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const yy = pad + t * (h - pad * 2);
          return (
            <line
              key={i}
              x1={pad}
              x2={w - pad}
              y1={yy}
              y2={yy}
              stroke="rgba(255,255,255,0.08)"
            />
          );
        })}

        {/* axes */}
        <line
          x1={pad}
          y1={h - pad}
          x2={w - pad}
          y2={h - pad}
          stroke="rgba(255,255,255,0.25)"
        />
        <line
          x1={pad}
          y1={pad}
          x2={pad}
          y2={h - pad}
          stroke="rgba(255,255,255,0.25)"
        />

        {/* revenue */}
        <path
          d={pathFor("revenue")}
          fill="none"
          stroke="#9EC5FF"
          strokeWidth={2.5}
        />
        {/* expenses */}
        <path
          d={pathFor("expenses")}
          fill="none"
          stroke="#FFD1A6"
          strokeWidth={2.5}
          strokeOpacity={0.85}
        />

        {/* points + labels */}
        {data.map((d, i) => (
          <g key={d.month}>
            <circle cx={x(i)} cy={y(d.revenue)} r={3} fill="#9EC5FF" />
            <circle cx={x(i)} cy={y(d.expenses)} r={3} fill="#FFD1A6" />
            <text
              x={x(i)}
              y={h - 6}
              fontSize="11"
              textAnchor="middle"
              fill="rgba(255,255,255,0.75)"
            >
              {d.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
