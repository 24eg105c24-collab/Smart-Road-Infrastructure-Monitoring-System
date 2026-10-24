// frontend/src/pages/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  Activity,
  Layers,
  Wrench,
  BarChart2,
  Sparkles,
  Route
} from 'lucide-react';
import { fetchAnalytics, fetchReports } from '../api';
import CorridorChainage from '../components/CorridorChainage';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';

export default function LandingPage({ setRole }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAnalytics(), fetchReports({ limit: 4 })])
      .then(([analyticsData, reportsData]) => {
        setStats(analyticsData.summary);
        setRecentReports(reportsData.slice(0, 4));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Landing page load error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0b1329 0%, #1e293b 100%)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '2.5rem',
          boxShadow: '0 20px 40px rgba(11, 19, 41, 0.4)'
        }}
      >
        <div style={{ maxWidth: '800px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(13, 148, 136, 0.25)',
              border: '1px solid rgba(20, 184, 166, 0.5)',
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#2dd4bf',
              marginBottom: '1.25rem'
            }}
          >
            <Sparkles size={14} />
            <span>Smart City Mobility & Infrastructure Prototype</span>
          </div>

          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1rem',
              letterSpacing: '-0.5px'
            }}
          >
            Smart Road Infrastructure Monitoring System
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              marginBottom: '2rem'
            }}
          >
            Real-time geospatial monitoring, citizen defect reporting, and automated maintenance workflows
            along the dedicated <strong style={{ color: '#ffffff' }}>Uppal X Roads to Ghatkesar (NH163)</strong> corridor.
            Built with verified OSRM routing geometry and strict corridor distance validation.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                setRole('citizen');
                navigate('/report');
              }}
              style={{ fontSize: '1rem', padding: '12px 24px' }}
            >
              <AlertTriangle size={18} />
              <span>Report Road Damage</span>
            </button>

            <button
              className="btn btn-outline"
              onClick={() => navigate('/map')}
              style={{
                fontSize: '1rem',
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <Compass size={18} />
              <span>Explore Corridor Map</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => {
                setRole('authority');
                navigate('/authority');
              }}
              style={{
                fontSize: '1rem',
                padding: '12px 24px',
                background: '#0d9488',
                color: '#ffffff'
              }}
            >
              <ShieldCheck size={18} />
              <span>Road Authority Console</span>
            </button>
          </div>
        </div>

        {/* Ambient Geometric Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13, 148, 136, 0.35) 0%, rgba(11, 19, 41, 0) 70%)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Corridor Chainage Strip */}
      <CorridorChainage onSelectLandmark={(lm) => navigate('/map')} />

      {/* Corridor Real-Time Stats */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}>
            <Route size={26} />
          </div>
          <div>
            <div className="stat-value">{stats?.corridorLengthKm || '16.07'} km</div>
            <div className="stat-label">Verified NH163 Corridor</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Activity size={26} />
          </div>
          <div>
            <div className="stat-value">{stats?.total || 14}</div>
            <div className="stat-label">Total Corridor Reports</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Wrench size={26} />
          </div>
          <div>
            <div className="stat-value">{(stats?.underRepair || 0) + (stats?.assigned || 0)}</div>
            <div className="stat-label">Active Work Orders</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="stat-value">{stats?.resolved || 3}</div>
            <div className="stat-label">Resolved Defect Sites</div>
          </div>
        </div>
      </div>

      {/* Role Selection Showcase */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Interactive Dual-Role Experience
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
          Test the end-to-end workflow by toggling between Citizen and Road Authority perspectives.
        </p>

        <div className="grid-2">
          {/* Citizen Card */}
          <div
            className="card"
            style={{
              borderLeft: '4px solid #0284c7',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => {
              setRole('citizen');
              navigate('/citizen');
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  Citizen Portal
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Report road hazards & track repair timeline
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Pinpoint potholes or waterlogging on the interactive corridor map with automatic distance verification,
              upload live photos, and track the 5-stage repair timeline from verification to resolution.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 700, fontSize: '0.88rem' }}>
              <span>Enter as Citizen</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Road Authority Card */}
          <div
            className="card"
            style={{
              borderLeft: '4px solid #0d9488',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => {
              setRole('authority');
              navigate('/authority');
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#ccfbf1',
                  color: '#0f766e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  Road Authority Console
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Inspect defects, dispatch teams, update statuses
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Access the centralized triage console to verify citizen complaints, assess structural severity,
              assign simulated repair teams (Team Alpha, Bravo, Delta, Echo), and maintain complete audit logs.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0d9488', fontWeight: 700, fontSize: '0.88rem' }}>
              <span>Enter as Road Authority</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Corridor Reports Snapshot */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <Activity size={20} color="#0d9488" />
              <span>Live Corridor Activity Snapshot</span>
            </div>
            <div className="card-description">
              Recent road condition reports along Uppal, Boduppal, Medipally, and Ghatkesar
            </div>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/map')}
          >
            <span>View All on Map</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid-2">
          {recentReports.map((r) => (
            <div
              key={r.id}
              style={{
                display: 'flex',
                gap: '14px',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/track/${r.id}`)}
            >
              {r.photo_url && (
                <img
                  src={r.photo_url.startsWith('http') ? r.photo_url : `http://localhost:5001${r.photo_url}`}
                  alt={r.title}
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    flexShrink: 0
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b', fontWeight: 600 }}>
                    {r.id}
                  </span>
                  <StatusBadge status={r.status} />
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  {r.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#64748b' }}>
                  <MapPin size={12} color="#0d9488" />
                  <span>{r.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
