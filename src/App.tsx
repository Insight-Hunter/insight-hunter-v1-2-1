// src/App.tsx
import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";

import Layout from "./components/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import Forecast from "./pages/Forecast";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import BusinessSetup from "./pages/BusinessSetup";
import AnalyticsTrends from "./pages/AnalyticsTrends";
import VendorProfiles from "./pages/VendorProfiles";
import Alerts from "./pages/Alerts";
import AICFOAssistant from "./pages/AICFOAssistant";
import NotFound from "./pages/NotFound";

import "./App.css";

// home section for "/"
function HomeLanding() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo" />
          <div className="title">Insight Hunter</div>
        </div>
      </header>
      <main className="main">
        <section className="panel" style={{ textAlign: "center" }}>
          <h1 style={{ marginTop: 0 }}>Auto-CFO for everyone</h1>
          <p style={{ opacity: 0.85 }}>
            Upload CSVs, get clean reports, and see your forecast instantly.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
            <Link to="/dashboard" className="button">Open Dashboard</Link>
            <Link to="/forecast" className="button ghost">View Forecast</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  // (Keep these if you still use them elsewhere; otherwise you can remove)
  const [count, setCount] = useState(0);
  const [name, setName] = useState("unknown");

  return (
    <Routes>
      {/* All routes share the Layout shell */}
      <Route element={<Layout />}>
        {/* Home / Landing */}
        <Route index element={<HomeLanding />} />

        {/* App routes */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="business-setup" element={<BusinessSetup />} />
        <Route path="analytics" element={<AnalyticsTrends />} />
        <Route path="vendors" element={<VendorProfiles />} />
        <Route path="reports" element={<Reports />} />
        <Route path="forecast" element={<Forecast />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="assistant" element={<AICFOAssistant />} />
        <Route path="settings" element={<Settings />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}


