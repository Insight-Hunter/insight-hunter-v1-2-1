import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

type SaveResp = { ok: boolean; message?: string };

export default function BusinessSetup() {
  const nav = useNavigate();
  const [legalName, setLegalName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [fiscalMonth, setFiscalMonth] = useState("January");
  const [industry, setIndustry] = useState("Consulting");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/setup/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legalName, currency, fiscalMonth, industry }),
      });
      const data: SaveResp = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Save failed");
      nav("/dashboard"); // or "/connect-data" if you add that route
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-2">Business Setup</h1>
      <p className="text-sm text-gray-500 mb-6">
        These defaults help Insight Hunter calculate reports & forecasts.
      </p>

      <form onSubmit={onSave} className="space-y-4">
        <label className="block">
          <span className="text-sm">Legal Name</span>
          <input
            className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            placeholder="Insight Hunter LLC"
            required
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm">Currency</span>
            <select
              className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>CAD</option>
              <option>AUD</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm">Fiscal Year Starts</span>
            <select
              className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring"
              value={fiscalMonth}
              onChange={(e) => setFiscalMonth(e.target.value)}
            >
              {[
                "January","February","March","April","May","June",
                "July","August","September","October","November","December",
              ].map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-sm">Industry</span>
            <select
              className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option>Consulting</option>
              <option>Agency</option>
              <option>E-commerce</option>
              <option>Professional Services</option>
              <option>Other</option>
            </select>
          </label>
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <div className="flex gap-3">
          <Link to="/dashboard" className="rounded border px-4 py-2">Skip for now</Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-orange-500 px-4 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </form>

      <div className="mt-6 text-sm text-gray-500">
        Next: <Link to="/dashboard" className="underline">Dashboard</Link> →{" "}
        <Link to="/analytics" className="underline">Analytics & Trends</Link> →{" "}
        <Link to="/reports" className="underline">Reports</Link>
      </div>
    </div>
  );
}
