import type { FC, PropsWithChildren } from "react";

export const AppShell: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <title>Insight Hunter</title>
        <style>{`
          :root{ --fg:#e8f1ef; --bg:#050809; --sub:#a8b8b5; --stroke:#2b3b3a; --btn:#0f1a1a; --accent:#1fd1b5; }
          body{ margin:0; background:var(--bg); color:var(--fg); font-family: ui-sans-serif, -apple-system, system-ui, Segoe UI, Roboto, Inter, Arial, sans-serif; }
          main{ padding:24px 16px; max-width:640px; margin:0 auto; }
          .cta{ display:inline-block; margin-top:16px; padding:14px 16px; border-radius:14px; border:1px solid var(--stroke); background:var(--btn); color:var(--fg); font-weight:600; text-decoration:none; }
          .sub{ color:var(--sub) }
          .progress{ height:6px; border-radius:999px; background:rgba(255,255,255,.12); overflow:hidden; margin:12px 0 6px; }
          .progress > i{ display:block; height:6px; background:var(--accent); }
          .row{ display:flex; gap:12px; margin-top:16px; }
          .btn-outline{ padding:12px 14px; border-radius:12px; border:1px solid var(--stroke); background:transparent; color:var(--fg); text-decoration:none; font-weight:600; display:inline-block; }
        `}</style>
      </head>
      <body>
        {children}
        <script type="module" src="/static/onboard.js"></script>
        <script type="module" src="/static/signin.js"></script>
      </body>
    </html>
  );
};
