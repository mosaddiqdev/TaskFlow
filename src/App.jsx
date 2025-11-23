import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import "./App.css";

const App = () => {
  useEffect(() => {
    const savedPreferences = localStorage.getItem("taskflow-preferences");
    if (savedPreferences) {
      try {
        const { theme } = JSON.parse(savedPreferences);
        if (theme === "light") {
          document.documentElement.setAttribute("data-theme", "light");
        }
      } catch (e) {
        // Invalid preferences, ignore
      }
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
