import React, { useState } from "react";
import PatientPortalComponent from "./Pages/PatientPortal.js";
import DoctorPortalComponent from "./Pages/DoctorPortal.js";
import HomeComponent from "./Pages/Home.js";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState("home");

  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  const handleBackToHome = () => {
    setCurrentView("home");
  };

  return (
    <div className="w-full min-h-screen">
      {currentView === "home" && (
        <HomeComponent onNavigate={handleNavigation} />
      )}
      {currentView === "patient" && (
        <PatientPortalComponent onBack={handleBackToHome} />
      )}
      {currentView === "doctor" && (
        <DoctorPortalComponent onBack={handleBackToHome} />
      )}
    </div>
  );
}

export default App;