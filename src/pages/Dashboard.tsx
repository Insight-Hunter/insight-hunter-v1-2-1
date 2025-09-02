import { useEffect, useState } from "react";
import { getJSON } from "@/lib/api";
import { Stat } from "@/components/Stat";

type Summary = { label: string; value: string };
export default function Dashboard() {
  const [data, setData] = useState<Summary[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    getJSON<Summary[]>("/api/demo/summary")
      .then(setData)
      .catch((e) => setErr(String(e)));
  }, []);
  return (
    <div className="grid">
      <div className="span-12 panel">
        <h2 style={{ marginTop: 0 }}>Dashboard</h2>
        {err && <div style={{ color: "var(--bad)" }}>Error: {err}</div>}
        {!data && !err && <div>Loading…</div>}
        {data && (
          <div
            className="grid"
            style={{ gridTemplateColumns: "repeat(3,1fr)" }}
          >
            {data.map((s, i) => (
              <Stat key={i} label={s.label} value={s.value} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
