import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      // TODO: swap this for your real endpoint (e.g. /api/auth/signin)
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Guard against non-JSON responses
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // keep data as {}
      }

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || "Sign in failed");
      }

      // Go to next onboarding step
      nav(data?.redirect || "/business-setup");
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return c
    .header("Set-Cookie", [
      `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=7200`,
    ])
    .json({ success: true });
    
  return (
    <main style={{ padding: "24px 16px", color: "#e8f1ef" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Sign in</h1>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Use Email, Google, or Wallet Connect.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          inputMode="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={field}
          aria-label="Email"
          required
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={field}
          aria-label="Password"
          required
        />

        <button
          type="submit"
          style={btnPrimary}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Signing in…" : "Continue"}
        </button>

        {err && (
          <div role="alert" style={alertErr}>
            {err}
          </div>
        )}
      </form>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        <button type="button" style={btnSecondary}>
          Continue with Google
        </button>
        <button type="button" style={btnSecondary}>
          Wallet Connect
        </button>
      </div>
    </main>
  );
}

const field: React.CSSProperties = {
  padding: "14px 12px",
  borderRadius: 12,
  border: "1px solid #2b3b3a",
  background: "#0f1a1a",
  color: "#e8f1ef",
};

const btnPrimary: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid #2b3b3a",
  background: "#0f1a1a",
  color: "#e8f1ef",
  fontWeight: 600,
};

const btnSecondary: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #2b3b3a",
  background: "transparent",
  color: "#e8f1ef",
  fontWeight: 600,
};

const alertErr: React.CSSProperties = {
  marginTop: 8,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,0,0,.35)",
  background: "rgba(255,0,0,.08)",
  color: "#ffd0d0",
  fontSize: 14,
};

