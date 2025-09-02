import React from "react"
import { Routes, Route } from "react-router-dom"

// Import your existing components/pages
import Layout from "./components/Layout"
import Home from "./pages/Welcome"
import Dashboard from "./pages/Dashboard"
import Forecast from "./pages/Forecast"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <Routes>
      {/* Layout wraps all pages so nav/footer/etc. are consistent */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        {/* Catch-all route for 404s */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
