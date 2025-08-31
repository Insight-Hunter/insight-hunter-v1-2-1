import React from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import "./layout.css";

// Navigation Links
const tabs = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/analytics-trends", label: "Analytics" },
  { to: "/reports", label: "Reports" },
  { to: "/settings-setup", label: "Settings" },
];

export default function Layout() {
  const { pathname } = useLocation();

  // Hide bottom Tabs 
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

      {/* Main content area */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>

      {/* Mobile tab bar */}
      {!hideTabs && (
        <footer className="md:hidden border-t">
          <div className="grid grid-cols-4 text-sm">
            {tabs.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className={`py-2 text-center ${
                  pathname === t.to ? "font-semibold" : ""
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
