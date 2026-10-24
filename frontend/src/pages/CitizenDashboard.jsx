// frontend/src/pages/CitizenDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  Wrench,
  CheckCircle2,
  PlusCircle,
  Eye,
  MapPin,
  HelpCircle,
  Search,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { fetchReports } from '../api';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import CorridorChainage from '../components/CorridorChainage';

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReports()
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load citizen reports:', err);
        setLoading(false);
      });
  }, []);

  const filtered = reports.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.landmark.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const countPending = reports.filter((r) => r.status === 'Reported').length;
  const countRepair = reports.filter((r) => ['Assigned', 'Under Repair'].includes(r.status)).length;
  const countResolved = reports.filter((r) => r.status === 'Resolved').length;

  return (
    <div className="page-container">
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Citizen Road Monitoring Hub
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Report road hazards along the Uppal-Ghatkesar corridor & track repair timelines in real time.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/report')}
          style={{ padding: '12px 20px', fontSize: '0.95rem' }}
        >
          <PlusCircle size={18} />
          <span>Report Road Hazard</span>
        </button>
      </div>

      {/* Corridor Quick Chainage */}
      <CorridorChainage onSelectLandmark={() => navigate('/map')} />

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-value">{reports.length}</div>
            <div className="stat-label">Total Corridor Issues</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{countPending}</div>
            <div className="stat-label">Pending Verification</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <Wrench size={24} />
          </div>
          <div>
            <div className="stat-value">{countRepair}</div>
            <div className="stat-label">Under Active Repair</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">{countResolved}</div>
            <div className="stat-label">Successfully Resolved</div>
          </div>
        </div>
      </div>

      {/* Complaints List and Controls */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="card-title">
              <Search size={20} color="#0d9488" />
              <span>Corridor Defect Reports</span>
            </div>
            <div className="card-description">
              Browse submitted issues, check status progression, or inspect field notes
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by ID, landmark, or defect..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ width: '260px', padding: '6px 12px', fontSize: '0.85rem' }}
            />

            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: '160px', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              <option value="all">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Team Assigned</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Loading corridor complaints...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            No matching road reports found along the corridor.
          </div>
        ) : (
          <div className="grid-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                {item.photo_url && (
                  <img
                    src={item.photo_url.startsWith('http') ? item.photo_url : `http://localhost:5001${item.photo_url}`}
                    alt={item.title}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#0d9488', fontWeight: 700 }}>
                        {item.id}
                      </span>
                      <SeverityBadge severity={item.severity} />
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                      {item.title}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                      <MapPin size={13} color="#0d9488" />
                      <span>{item.address} ({item.distance_to_corridor_meters}m from highway)</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <StatusBadge status={item.status} />

                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => navigate(`/track/${item.id}`)}
                      style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                    >
                      <Eye size={13} />
                      <span>Track Progress</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Citizen Guidelines Card */}
      <div className="card" style={{ background: '#f0fdfa', borderColor: '#ccfbf1' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#0d9488',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <HelpCircle size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f766e', marginBottom: '4px' }}>
              Corridor Reporting Instructions & Geolocation Notice
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#134e4a', lineHeight: 1.5 }}>
              This platform enforces strict geographical boundaries: submissions are accepted exclusively within
              <strong> 1,000 meters of the Uppal to Ghatkesar (NH163) highway</strong>. When submitting an issue,
              you can tap directly on the map along Boduppal, Peerzadiguda, Medipally, Narapally, or Anurag University
              to drop a pin. Each report generates a permanent ID for automated timeline tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
