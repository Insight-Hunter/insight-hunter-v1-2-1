import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

type AuthResponse = { ok: boolean; message?: string; redirect?: string };

export default function SignIn() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email || !password) {
      setErr("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      // Swap this endpoint with your real auth handler
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data: AuthResponse = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Sign in failed");
      nav(data.redirect || "/business-setup");
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail("demo@example.com");
    setPassword("demo1234");
  }

  return (
    <div className="max-w-sm mx-auto py-10">
      <div className="text-center mb-6">
        <img src="/favicon.svg" alt="Insight Hunter" className="mx-auto w-12 h-12" />
        <h1 className="mt-3 text-2xl font-semibold">Sign In</h1>
        <p className="text-sm text-gray-500">Your AI CFO in your pocket</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm">Email</span>
          <input
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm">Password</span>
          <div className="mt-1 relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              className="w-full rounded border px-3 py-2 pr-16 outline-none focus:ring"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm underline"
              onClick={() => setShowPw((s) => !s)}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-orange-500 py-2 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <button
          type="button"
          className="w-full rounded border py-2 text-sm"
          onClick={fillDemo}
        >
          Use demo credentials
        </button>

        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot" className="underline">Forgot password?</Link>
          <span>
            Don’t have an account? <Link to="/signup" className="underline">Sign Up</Link>
          </span>
        </div>
      </form>
    </div>
  );
}
