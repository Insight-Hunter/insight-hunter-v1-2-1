import { useState } from "react";
import { useOnboarding } from "../../features/onboarding/OnboardingContext";

export default function SignIn() {
  const { markComplete, next } = useOnboarding();
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: hook to real auth (Email, Google, WalletConnect)
    markComplete("signin");
    next();
  

  return (
    <main style={{ padding: "24px 16px", color: "#e8f1ef" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Sign in</h1>
      <p style={{ opacity: .8, marginBottom: 16 }}>Email, Google, or Wallet Connect.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          inputMode="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={field}
          aria-label="Email"
        />
        <button type="submit" style={btnPrimary}>Continue</button>
      </form>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        <button type="button" style={btnSecondary}>Continue with Google</button>
        <button type="button" style={btnSecondary}>Wallet Connect</button>
      </div>
    </main>
  );
}
const field: React.CSSProperties = { padding: "14px 12px", borderRadius: 12, border: "1px solid #2b3b3a", background: "#0f1a1a", color: "#e8f1ef" };
const btnPrimary: React.CSSProperties = { padding: "14px 16px", borderRadius: 14, border: "1px solid #2b3b3a", background: "#0f1a1a", color: "#e8f1ef", fontWeight: 600 };
const btnSecondary: React.CSSProperties = { padding: "12px 14px", borderRadius: 12, border: "1px solid #2b3b3a", background: "transparent", color: "#e8f1ef", fontWeight: 600 };
