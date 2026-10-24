// frontend/src/components/Navbar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  AlertTriangle,
  LayoutDashboard,
  ShieldAlert,
  Search,
  BarChart3,
  User,
  ShieldCheck,
  Building2,
  Info
} from 'lucide-react';

export default function Navbar({ role, setRole }) {
  const navigate = useNavigate();

  return (
    <>
      {/* Top Disclaimer Banner */}
      <div className="disclaimer-banner">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="badge">Academic Demo</span>
          <span>
            Simulated Prototype • Uppal X Roads to Ghatkesar Corridor (NH163) • Independent College Software
          </span>
        </div>
        <div className="corridor-badge">
          <MapPin size={12} />
          <span>Strict Scope: Uppal → Ghatkesar (16.07 km)</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-box">
            <Compass size={24} />
          </div>
          <div>
            <div className="brand-title">Smart Road Monitor</div>
            <div className="brand-subtitle">
              <span>Uppal - Ghatkesar Corridor (NH163)</span>
            </div>
          </div>
        </div>

        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`} end>
              <Building2 size={16} />
              <span>Overview</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/map" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
              <Compass size={16} />
              <span>Corridor Map</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/report" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
              <AlertTriangle size={16} />
              <span>Report Issue</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/citizen" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
              <User size={16} />
              <span>Citizen Portal</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/authority" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
              <ShieldAlert size={16} />
              <span>Authority Console</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/track" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
              <Search size={16} />
              <span>Track ID</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/analytics" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
              <BarChart3 size={16} />
              <span>Analytics</span>
            </NavLink>
          </li>
        </ul>

        {/* Demo Role Switcher */}
        <div className="nav-actions">
          <div className="role-switcher" title="Simulated role toggle for demo purposes">
            <button
              className={`role-pill-btn ${role === 'citizen' ? 'active citizen' : ''}`}
              onClick={() => {
                setRole('citizen');
                navigate('/citizen');
              }}
            >
              <User size={14} />
              <span>Citizen</span>
            </button>
            <button
              className={`role-pill-btn ${role === 'authority' ? 'active authority' : ''}`}
              onClick={() => {
                setRole('authority');
                navigate('/authority');
              }}
            >
              <ShieldCheck size={14} />
              <span>Road Authority</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
