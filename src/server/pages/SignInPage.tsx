import type { FC } from "react";

export const SignInPage: FC = () => {
  return (
    <main>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Sign in</h1>
      <p className="sub" style={{ marginBottom: 16 }}>Email + password (demo). Replace with your provider later.</p>

      <form id="signin" style={{ display: "grid", gap: 12 }}>
        <input name="email" inputMode="email" placeholder="you@company.com"
          style={{ padding:"14px 12px", borderRadius:12, border:"1px solid var(--stroke)", background:"var(--btn)", color:"var(--fg)" }} required />
        <input name="password" type="password" placeholder="Password"
          style={{ padding:"14px 12px", borderRadius:12, border:"1px solid var(--stroke)", background:"var(--btn)", color:"var(--fg)" }} required />
        <button className="cta" type="submit">Continue</button>
      </form>

      <div id="err" role="alert" style="display:none; margin-top:8px; color:#ffd0d0;"></div>
    </main>
  );
};
