import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Forecast from "./pages/Forecast";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import SignUp from "./pages/SignUp";
import BusinessSetup from "./pages/BusinessSetup";
import AnalyticsTrends from "./pages/AnalyticsTrends";
import VendorProfiles from "./pages/VendorProfiles";
import Alerts from "./pages/Alerts";
import AICFOAssistant from "./pages/AICFOAssistant";
import NotFound from "./pages/NotFound";


export default function App() {
  return (
    <Routes>
      <Route element={<Layout />} >
        {/* Entry point */}
        <Route path="/" element={<Welcome />} />

        {/* Auth */}
        <Route path="/signup" element={<SignUp />} />
        
        {/* App */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/business-setup" element={<BusinessSetup />} />
        <Route path="/analytics" element={<AnalyticsTrends />} />
        <Route path="/vendors" element={<VendorProfiles />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/assistant" element={<AICFOAssistant />} />
        <Route path="/settings" element={<Settings />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
        <Route path="*" element={<Welcome />} />
      </Route>
   </Routes>
  );
}





