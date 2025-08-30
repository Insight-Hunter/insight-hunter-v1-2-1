import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

type Resp = { ok: boolean; message?: string; redirect?: string };

export default function SignUp() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!agree) {
      setErr("Please accept the Terms to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, company }),
      });
      const data: Resp = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Sign up failed");
      nav(data.redirect || "/business-setup");
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto py-10">
      <div className="text-center mb-6">
        <img src="/favicon.svg" alt="Insight Hunter" className="mx-auto w-12 h-12" />
        <h1 className="mt-3 text-2xl font-semibold">Create your account</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm">Work Email</span>
          <input
            type="email"
            className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm">Company / Brand</span>
          <input
            type="text"
            className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g., Insight Hunter LLC"
          />
        </label>

        <label className="block">
          <span className="text-sm">Password</span>
          <input
            type="password"
            className="mt-1 w-full rounded border px-3 py-2 outline-none focus:ring"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>I agree to the <a className="underline" href="/terms" target="_blank">Terms</a> and <a className="underline" href="/privacy" target="_blank">Privacy Policy</a>.</span>
        </label>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-orange-500 py-2 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-sm text-center">
          Already have an account? <Link to="/signin" className="underline">Sign In</Link>
        </p>
      </form>
    </div>
  );
}
