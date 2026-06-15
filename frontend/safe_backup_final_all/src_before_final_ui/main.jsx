import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import AutoProgressTracker from "./components/AutoProgressTracker";
import "./styles/resourcesForceFinal.css";
import "./styles/finalProfessionalTheme.css";
import "./styles/forceRuntimeTheme.js";
import "./styles/finalLightProfessionalUI.css";
import "./styles/premiumDarkTheme.css";
import "./styles/premiumDarkScroll.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AutoProgressTracker />
    <App />
  </React.StrictMode>
);
