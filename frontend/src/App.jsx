// frontend/src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import ReportIssuePage from './pages/ReportIssuePage';
import CorridorMapPage from './pages/CorridorMapPage';
import AuthorityDashboard from './pages/AuthorityDashboard';
import ComplaintTrackingPage from './pages/ComplaintTrackingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { Compass, ShieldCheck } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('citizen'); // 'citizen' | 'authority'

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Navigation Bar */}
        <Navbar role={role} setRole={setRole} />

        {/* Main Routed Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage setRole={setRole} />} />
            <Route path="/citizen" element={<CitizenDashboard />} />
            <Route path="/report" element={<ReportIssuePage />} />
            <Route path="/map" element={<CorridorMapPage />} />
            <Route path="/authority" element={<AuthorityDashboard />} />
            <Route path="/track" element={<ComplaintTrackingPage />} />
            <Route path="/track/:id" element={<ComplaintTrackingPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Academic Project Footer */}
        <footer
          style={{
            background: '#0b1329',
            color: '#94a3b8',
            padding: '2rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.85rem'
          }}
        >
          <div
            style={{
              maxWidth: '1320px',
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 700 }}>
                <Compass size={18} color="#0d9488" />
                <span>Smart Road Infrastructure Monitoring System</span>
              </div>
              <p style={{ marginTop: '4px', fontSize: '0.78rem', color: '#64748b' }}>
                Academic Software Prototype • Scope: Uppal X Roads to Ghatkesar (NH163 Corridor, Telangana, India)
              </p>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.78rem' }}>
              <div>Map Data: OpenStreetMap contributors & OSRM Routing Engine</div>
              <div style={{ color: '#0d9488', fontWeight: 600, marginTop: '2px' }}>
                Simulated Demonstration Prototype • Safe Local SQLite Storage
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
