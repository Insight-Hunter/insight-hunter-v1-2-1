import { useNavigate } from "react-router-dom";
import "./welcome.css";

export default function Welcome() {
  const nav = useNavigate();

  return (
    <main className="ih-welcome">
      <header className="ih-header">
        <div className="ih-logo">
          <span className="ih-logo-mark">◈</span>
          <span className="ih-logo-type">INSIGHT&nbsp;HUNTER</span>
        </div>
      </header>

      <section className="ih-content">
        <h1 className="ih-title">
          <span>Welcome to</span>
          <br />
          <span>Insight Hunter</span>
        </h1>
        <p className="ih-subtitle">Get started in a few simple steps</p>

        <div className="ih-hero">
          {/* Wallet icon (inline SVG so no extra assets needed) */}
          <svg
            className="ih-wallet"
            viewBox="0 0 64 64"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <radialGradient id="g" cx="50%" cy="40%" r="70%">
                <stop offset="0%" stopColor="rgba(40,200,180,0.7)" />
                <stop offset="100%" stopColor="rgba(40,200,180,0.1)" />
              </radialGradient>
            </defs>
            <circle cx="32" cy="32" r="28" fill="url(#g)" />
            <path
              d="M47 25H26a4 4 0 0 1-4-4v0a4 4 0 0 1 4-4h17"
              stroke="rgba(180,255,245,0.6)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <rect
              x="14"
              y="22"
              width="36"
              height="22"
              rx="8"
              fill="rgba(0,30,30,0.6)"
              stroke="rgba(140,220,210,0.6)"
              strokeWidth="2"
            />
            <rect x="36" y="29" width="12" height="8" rx="3" fill="#0b2a2a" />
            <circle cx="44" cy="33" r="2" fill="#1fd1b5" />
          </svg>
        </div>

        <ul className="ih-list" role="list">
          <li><span className="ih-check" aria-hidden>✔</span>Connect your accounts</li>
          <li><span className="ih-check" aria-hidden>✔</span>Set up KPI Alerts insights</li>
          <li><span className="ih-check" aria-hidden>✔</span>Get real-time insights from Auto-CFO</li>
          <li><span className="ih-check" aria-hidden>✔</span>Monitor Crypto funds</li>
        </ul>

        <button
          className="ih-cta"
          onClick={() => nav("/signin")}
          aria-label="Continue to sign in"
        >
          Continue
        </button>
      </section>

      <div className="ih-home-indicator" aria-hidden />
    </main>
  );
}
