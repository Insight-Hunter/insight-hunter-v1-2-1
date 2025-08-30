import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const hideTabs = ["/signin", "/signup", "/business-setup"].includes(pathname);

  const tabs = [
    { to: "/", label: "Home" },
    { to: "/forecast", label: "Forecast" },
    { to: "/reports", label: "Reports" },
    { to: "/vendors", label: "Vendors" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 border-b">
        <Link to="/" className="font-semibold">
          Insight Hunter
        </Link>
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
