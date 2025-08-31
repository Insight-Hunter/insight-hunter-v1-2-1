import React from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import "./layout.css";

export default function Layout() {
  const { pathname } = useLocation();

  // Hide the bottom tabs on welcome and sign-in
  const hideTabs = pathname === "/" || pathname.startsWith("/signin");

  return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-12 flex items-center justify-between px-4 border-b">
          <Link to="/" className="flex items-center gap-2">
            {/* Logo (served from /public/favicon.svg) */}
            <img
              src="/favicon.svg"
              alt="Insight Hunter"
              className="h-6 w-6"
              loading="eager"
              decoding="sync"
            />
            <span className="font-semibold">Insight Hunter</span>
          </Link>
          {/* Desktop nav */}
          <nav className="hidden md:flex gap-4">
            {tabs.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className={pathname === t.to ? "font-semibold" : ""}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </header>
        {/* Main */}
        <main className="flex-1 p-4">{children}</main>
        {/* Mobile tab bar */}
        {!hideTabs && (
          <footer className="md:hidden border-t">
            <div className="grid grid-cols-5 text-sm">
              {tabs.map(t => {
                  return (
                      <Link
                        key={t.to}
                        to={t.to}
                        className={`py-2 text-center ${
                          pathname === t.to ? "font-semibold" : ""
                        }`}
                      >
                        {t.label}
                      </Link);
              })}
            </div>
          </footer>
        )}
      </div>
  );
}
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
      </div>;
 }
