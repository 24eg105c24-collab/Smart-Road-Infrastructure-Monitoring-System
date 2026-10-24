// frontend/src/pages/AuthorityDashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  ArrowUpDown,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  UserCheck
} from 'lucide-react';
import { fetchReports, updateReportStatus, resetDemoData } from '../api';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import ReviewModal from '../components/ReviewModal';
import { useNavigate } from 'react-router-dom';

export default function AuthorityDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [landmarkFilter, setLandmarkFilter] = useState('all');

  // Sorting
  const [sortField, setSortField] = useState('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  const loadReports = async () => {
    try {
      const data = await fetchReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleSaveStatus = async (id, updateData) => {
    const updated = await updateReportStatus(id, updateData);
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all demo complaints back to default 14 corridor records?')) {
      await resetDemoData();
      await loadReports();
      alert('Demo data successfully reset to initial corridor state!');
    }
  };

  // Filter and sort reports
  const filtered = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
    if (landmarkFilter !== 'all' && !r.landmark.toLowerCase().includes(landmarkFilter.toLowerCase())) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.landmark.toLowerCase().includes(q) ||
        (r.assigned_team && r.assigned_team.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const countPending = reports.filter((r) => r.status === 'Reported').length;
  const countVerified = reports.filter((r) => r.status === 'Verified').length;
  const countActive = reports.filter((r) => ['Assigned', 'Under Repair'].includes(r.status)).length;
  const countCritical = reports.filter((r) => r.severity === 'Critical').length;

  return (
    <div className="page-container">
      {/* Top Console Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '2rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#0d9488',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              Road Authority Triage Console
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '2px' }}>
            NH163 Warangal Highway Corridor (Uppal X Roads to Ghatkesar) • Maintenance Operations Center
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleResetData}
            title="Reset database to clean 14 sample complaints"
          >
            <RotateCcw size={14} />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/map')}
          >
            <Eye size={14} />
            <span>View Corridor GIS</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
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
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div className="stat-value">{countVerified}</div>
            <div className="stat-label">Verified (Ready to Dispatch)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <Wrench size={24} />
          </div>
          <div>
            <div className="stat-value">{countActive}</div>
            <div className="stat-label">Teams Active on Site</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-value">{countCritical}</div>
            <div className="stat-label">Critical Highway Hazards</div>
          </div>
        </div>
      </div>

      {/* Complaints Table Card */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="card-title">
              <SlidersHorizontal size={20} color="#0d9488" />
              <span>Corridor Maintenance Work Orders</span>
            </div>
            <div className="card-description">
              Select any complaint to verify, assign repair teams, or escalate priority
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search ID, road, team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ width: '220px', padding: '6px 12px', fontSize: '0.82rem' }}
            />

            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '135px', padding: '6px 10px', fontSize: '0.82rem' }}
            >
              <option value="all">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              className="form-select"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{ width: '130px', padding: '6px 10px', fontSize: '0.82rem' }}
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              className="form-select"
              value={landmarkFilter}
              onChange={(e) => setLandmarkFilter(e.target.value)}
              style={{ width: '140px', padding: '6px 10px', fontSize: '0.82rem' }}
            >
              <option value="all">All Landmarks</option>
              <option value="Uppal">Uppal</option>
              <option value="Boduppal">Boduppal</option>
              <option value="Peerzadiguda">Peerzadiguda</option>
              <option value="Medipally">Medipally</option>
              <option value="Narapally">Narapally</option>
              <option value="Anurag">Anurag Univ</option>
              <option value="Ghatkesar">Ghatkesar</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>ID</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>Defect Details</th>
                <th onClick={() => handleSort('landmark')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Landmark</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('severity')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Severity</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('priority')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Priority</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Status</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>Assigned Repair Unit</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0d9488' }}>
                    {item.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {item.issue_type} • {item.address}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.landmark}</span>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      ~{item.distance_to_corridor_meters}m from route
                    </div>
                  </td>
                  <td>
                    <SeverityBadge severity={item.severity} />
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color:
                          item.priority === 'Emergency'
                            ? '#dc2626'
                            : item.priority === 'High'
                            ? '#ea580c'
                            : item.priority === 'Medium'
                            ? '#d97706'
                            : '#059669'
                      }}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    {item.assigned_team ? (
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                        {item.assigned_team}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedReport(item)}
                        style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                      >
                        <Wrench size={13} />
                        <span>Triage</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate(`/track/${item.id}`)}
                        style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                      >
                        <Eye size={13} />
                        <span>Timeline</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Triage Modal */}
      {selectedReport && (
        <ReviewModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onSave={handleSaveStatus}
        />
      )}
    </div>
  );
}
