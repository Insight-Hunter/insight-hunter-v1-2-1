import React from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";

/**
 * Bottom tabs config
 */
type Tab = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

const tabs: Tab[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
  },
  {
    to: "/analytics", // change to "/analytics-trends" if that's your route
    label: "Analytics",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M3 17l5-5 4 4 7-7 2 2-9 9-4-4-5 5z" />
      </svg>
    ),
  },
  {
    to: "/reports",
    label: "Reports",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M4 3h16v18H4zM8 7h8v2H8V7zm0 4h8v2H8v-2zm0 4h5v2H8v-2z" />
      </svg>
    ),
  },
  {
    to: "/settings", // change to "/settings-setup" if that's your route
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M19.14 12.94a7.07 7.07 0 000-1.88l2.03-1.58a.5.5 0 00.12-.65l-1.92-3.32a.5.5 0 00-.61-.22l-2.39.96a7.19 7.19 0 00-1.63-.95l-.36-2.54A.5.5 0 0013.9 1h-3.8a.5.5 0 00-.49.41l-.36 2.54c-.58.23-1.13.54-1.63.95l-2.39-.96a.5.5 0 00-.61.22L2.7 7.02a.5.5 0 00.12.65l2.03 1.58c-.06.31-.09.63-.09.95s.03.64.09.95L2.82 12.7a.5.5 0 00-.12.65l1.92 3.32c.13.23.4.33.61.22l2.39-.96c.5.4 1.05.72 1.63.95l.36 2.54c.05.25.26.41.49.41h3.8c.24 0 .44-.17.49-.41l.36-2.54c.58-.23 1.13-.54 1.63-.95l2.39.96c.22.11.48.01.61-.22l1.92-3.32a.5.5 0 00-.12-.65l-2.03-1.58zM12 15.5A3.5 3.5 0 1115.5 12 3.5 3.5 0 0112 15.5z" />
      </svg>
    ),
  },
];

export default function Layout(): JSX.Element {
  const { pathname } = useLocation();

  // Hide bottom tab bar on home and any /signin route
  const showTabs = !(pathname === "/" || pathname.startsWith("/signin"));

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2" aria-label="Insight Hunter Home">
          <img
            src="/favicon.svg"
            alt=""
            className="h-6 w-6"
            loading="eager"
            decoding="sync"
          />
          <span className="font-semibold">Insight Hunter</span>
        </Link>

        {/* Desktop nav (hidden on small screens) */}
        <nav className="hidden md:flex gap-2">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                [
                  "px-3 py-1.5 rounded-md text-sm transition",
                  isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100",
                ].join(" ")
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Bottom tab bar (mobile) */}
      {showTabs && (
        <nav
          className="md:hidden sticky bottom-0 bg-white border-t border-gray-200"
          aria-label="Primary"
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <ul className="grid grid-cols-4">
            {tabs.map((t) => (
              <li key={t.to}>
                <NavLink
                  to={t.to}
                  className={({ isActive }) =>
                    [
                      "flex flex-col items-center justify-center gap-1 py-2 text-xs",
                      isActive ? "text-gray-900" : "text-gray-500",
                    ].join(" ")
                  }
                >
                  {t.icon}
                  <span>{t.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
