import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import Swap from "./Swap.jsx";
import History from "./History.jsx";
import "./index.css";

// Component to render the main application
ReactDOM.createRoot(document.getElementById("main")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/Swap" element={<Swap />} />
        <Route path="/History" element={<History />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
