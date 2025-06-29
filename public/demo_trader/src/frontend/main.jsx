// Entry point: renders the app and sets up routing
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App'
import Swap from './Swap'
import History from './History'
import './index.css'

ReactDOM.createRoot(document.getElementById('main')).render(
  <BrowserRouter basename="/demo_trader/dist">
    <Routes>
      <Route path="/index.html" element={<App />} />
      <Route path="/Swap" element={<Swap />} />
      <Route path="/History" element={<History />} />
    </Routes>
</BrowserRouter>
)
