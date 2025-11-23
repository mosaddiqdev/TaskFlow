import { Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import "./App.css";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<Dashboard />} />
    </Routes>
  );
};

export default App;
