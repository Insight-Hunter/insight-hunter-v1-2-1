import { Link, useLocation } from "react-router-dom";
const tabs = [
  { to: "/dashboard", label: "Home", icon: "🏠" },
  { to: "/forecast", label: "Forecast", icon: "📈" },
  { to: "/reports", label: "Reports", icon: "📄" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];
export default function TabBar() {
  const { pathname } = useLocation();
  return (
    <nav className="tabbar">
      <div className="tabs">
        {tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className={`tab ${pathname === t.to ? "active" : ""}`}
          >
            <div className="icon" aria-hidden>
              {t.icon}
            </div>
            <div className="label">{t.label}</div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
