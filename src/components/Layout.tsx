import React from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import "./layout.css";

export default function Layout() {
  const { pathname } = useLocation();

  // Hide the bottom tabs on welcome and sign-in
  const hideTabs = pathname === "/" || pathname.startsWith("/signin");

  return (
    <div className="ih-layout">
      <div className="ih-main">
        <Outlet />
      </div>

      {!hideTabs && (
        <nav className="ih-tabbar" role="navigation" aria-label="Primary">
          <Link
            to="/dashboard"
            className={pathname === "/dashboard" ? "active" : ""}
          >
            Dashboard
          </Link>
          <Link
            to="/analytics-trends"
            className={pathname === "/analytics-trends" ? "active" : ""}
          >
            Analytics
          </Link>
          <Link
            to="/reports"
            className={pathname === "/reports" ? "active" : ""}
          >
            Reports
          </Link>
          <Link
            to="/settings-setup"
            className={pathname === "/settings-setup" ? "active" : ""}
          >
            Settings
          </Link>
        </nav>
      )}
    </div>
  );
}
