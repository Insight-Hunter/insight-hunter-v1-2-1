import { useOnboarding } from "../../features/onboarding/OnboardingContext";

export default function ConnectData() {
  const { markComplete, next, prev } = useOnboarding();
  return (
    <main style={wrap}>
      <h1 style={h1}>Connect data</h1>
      <p style={sub}>Sync your financial sources.</p>
      <ul style={list}>
        <li>Bank — <em>Pending</em></li>
        <li>Wallet — <em>Pending</em></li>
        <li>Accounting Platform — <em>Pending</em></li>
      </ul>
      <div style={row}>
        <button onClick={prev} style={btnSecondary}>Back</button>
        <button onClick={() => { markComplete("connect-data"); next(); }} style={btnPrimary}>Continue</button>
      </div>
    </main>
  );
}
const wrap: React.CSSProperties = { padding: "24px 16px", color: "#e8f1ef" };
const h1: React.CSSProperties = { fontSize: 28, marginBottom: 8 };
const sub: React.CSSProperties = { opacity: .8, marginBottom: 16 };
const list: React.CSSProperties = { listStyle: "none", padding: 0, display: "grid", gap: 10 };
const row: React.CSSProperties = { display: "flex", gap: 12, marginTop: 24 };
const btnPrimary: React.CSSProperties = { flex: 1, padding: "14px 16px", borderRadius: 14, border: "1px solid #2b3b3a", background: "#0f1a1a", color: "#e8f1ef", fontWeight: 600 };
const btnSecondary: React.CSSProperties = { flex: .7, padding: "14px 16px", borderRadius: 14, border: "1px solid #2b3b3a", background: "transparent", color: "#e8f1ef", fontWeight: 600 };
