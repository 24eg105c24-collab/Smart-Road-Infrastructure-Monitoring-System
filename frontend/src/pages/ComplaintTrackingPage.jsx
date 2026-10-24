// frontend/src/pages/ComplaintTrackingPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  AlertTriangle,
  MapPin,
  Calendar,
  ShieldCheck,
  FileText,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { fetchReportById, fetchReports } from '../api';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';

const STAGES = [
  { id: 'Reported', label: 'Reported', desc: 'Complaint registered' },
  { id: 'Verified', label: 'Verified', desc: 'Site inspection done' },
  { id: 'Assigned', label: 'Assigned', desc: 'Repair crew allocated' },
  { id: 'Under Repair', label: 'Under Repair', desc: 'Roadwork in progress' },
  { id: 'Resolved', label: 'Resolved', desc: 'Surface quality approved' }
];

export default function ComplaintTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState(id || 'SRI-2026-0101');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentList, setRecentList] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const loadReport = async (targetId) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchReportById(targetId);
      if (!data) {
        setErrorMsg(`Complaint ID "${targetId}" not found in corridor database.`);
        setReport(null);
      } else {
        setReport(data);
      }
    } catch (err) {
      setErrorMsg(err.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setSearchId(id);
      loadReport(id);
    } else {
      loadReport(searchId);
    }

    fetchReports()
      .then((reps) => setRecentList(reps.slice(0, 5)))
      .catch((e) => console.warn(e));
  }, [id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/track/${searchId.trim()}`);
    }
  };

  // Determine current stage index (0 to 4)
  const currentStageIndex = report
    ? STAGES.findIndex((s) => s.id === report.status)
    : -1;

  const progressPercent = currentStageIndex >= 0 ? (currentStageIndex / (STAGES.length - 1)) * 100 : 0;

  return (
    <div className="page-container">
      {/* Search Header */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            Live Complaint Tracking & Audit History
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Enter your unique complaint ID (e.g. SRI-2026-0101) to view verification and repair progress
          </p>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <input
              type="text"
              placeholder="e.g. SRI-2026-0101"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.toUpperCase())}
              className="form-input"
              style={{
                maxWidth: '320px',
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '1rem',
                textAlign: 'center',
                letterSpacing: '1px'
              }}
              required
            />
            <button type="submit" className="btn btn-primary">
              <Search size={16} />
              <span>Track Progress</span>
            </button>
          </form>

          {/* Quick Click Demo IDs */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Quick Samples:</span>
            {recentList.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSearchId(r.id);
                  navigate(`/track/${r.id}`);
                }}
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#0d9488',
                  background: '#f0fdfa',
                  border: '1px solid #ccfbf1',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  cursor: 'pointer'
                }}
              >
                {r.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Retrieving complaint details and history log...
        </div>
      ) : errorMsg ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '3rem', border: '1.5px dashed #f87171' }}
        >
          <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>
            Complaint Not Found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>{errorMsg}</p>
        </div>
      ) : report ? (
        <div>
          {/* Top Status & 5-Stage Stepper Card */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#0d9488',
                    letterSpacing: '0.5px'
                  }}
                >
                  {report.id}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  {report.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' }}>
                  <MapPin size={14} color="#0d9488" />
                  <span>{report.address} (Landmark: <strong>{report.landmark}</strong>)</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SeverityBadge severity={report.severity} />
                <StatusBadge status={report.status} />
              </div>
            </div>

            {/* Visual 5-Stage Timeline Stepper */}
            <div className="stepper-container">
              <div className="stepper-track">
                <div
                  className="stepper-track-progress"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {STAGES.map((stg, idx) => {
                const isCompleted = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div
                    key={stg.id}
                    className={`stepper-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                  >
                    <div className="stepper-bubble">
                      {isCompleted ? <CheckCircle2 size={20} /> : idx + 1}
                    </div>
                    <div className="stepper-label">{stg.label}</div>
                    <div className="stepper-subtext">{stg.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details & Live Audit Timeline Grid */}
          <div className="grid-2">
            {/* Left: Defect Information & Assigned Unit */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
                Defect Site & Assignment Specifications
              </h3>

              {report.photo_url && (
                <img
                  src={report.photo_url.startsWith('http') ? report.photo_url : `http://localhost:5001${report.photo_url}`}
                  alt={report.title}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    marginBottom: '1.25rem',
                    border: '1px solid #e2e8f0'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Issue Type:</span>
                  <strong style={{ color: '#0f172a' }}>{report.issue_type}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Reported By:</span>
                  <strong style={{ color: '#0f172a' }}>{report.reporter_name}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Distance to NH163 Highway:</span>
                  <strong style={{ color: '#0d9488' }}>{report.distance_to_corridor_meters} meters</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Verified Inspector:</span>
                  <strong style={{ color: '#0f172a' }}>{report.verified_by || 'Pending Assignment'}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Assigned Maintenance Team:</span>
                  <strong style={{ color: report.assigned_team ? '#0f766e' : '#94a3b8' }}>
                    {report.assigned_team || 'Not Yet Assigned'}
                  </strong>
                </div>

                {report.estimated_completion && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>Target Completion:</span>
                    <strong style={{ color: '#0f172a' }}>
                      {new Date(report.estimated_completion).toLocaleDateString()}
                    </strong>
                  </div>
                )}

                <div style={{ marginTop: '8px' }}>
                  <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Original Report Notes:</span>
                  <p style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', color: '#334155', fontStyle: 'italic' }}>
                    "{report.description}"
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Chronological Status Audit Log */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Clock size={18} color="#0d9488" />
                    <span>Audit Log & Timeline Activity</span>
                  </div>
                  <div className="card-description">
                    Verifiable state transitions logged in SQLite
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {report.history && report.history.length > 0 ? (
                  report.history.map((h, i) => (
                    <div
                      key={h.id || i}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        position: 'relative'
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#f0fdfa',
                          color: '#0d9488',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          flexShrink: 0
                        }}
                      >
                        {i + 1}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <StatusBadge status={h.status} />
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            {new Date(h.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px' }}>
                          Updated by: <span style={{ color: '#0f766e' }}>{h.changed_by}</span> ({h.role})
                        </div>

                        {h.notes && (
                          <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                            {h.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No audit records logged yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
