// frontend/src/pages/AnalyticsPage.jsx
import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Activity,
  Layers,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { fetchAnalytics } from '../api';
import StatusBadge from '../components/StatusBadge';
import CorridorChainage from '../components/CorridorChainage';

const COLORS = ['#0d9488', '#0284c7', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Analytics load error:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
        Loading corridor analytics and chart metrics...
      </div>
    );
  }

  const { summary, byType, byStatus, bySeverity, byPriority, byLandmark, recentActivity } = data;

  const resolutionRate = summary.total > 0
    ? Math.round((summary.resolved / summary.total) * 100)
    : 0;

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={24} color="#0d9488" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Corridor Analytics & Infrastructure Intelligence
          </h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>
          Real-time geospatial analytics across the 16.07 km Uppal X Roads to Ghatkesar (NH163) Highway Corridor.
        </p>
      </div>

      {/* Corridor Chainage Strip */}
      <CorridorChainage />

      {/* Summary KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}>
            <Activity size={24} />
          </div>
          <div>
            <div className="stat-value">{summary.total}</div>
            <div className="stat-label">Total Logged Defect Sites</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="stat-value">{summary.critical}</div>
            <div className="stat-label">Critical Structural Hazards</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{summary.activeTeamsDeployed}</div>
            <div className="stat-label">Field Teams Deployed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">{resolutionRate}%</div>
            <div className="stat-label">Corridor Resolution Rate</div>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Defect Density along Corridor */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <MapPin size={18} color="#0d9488" />
                <span>Defect Density by Corridor Section</span>
              </div>
              <div className="card-description">
                Concentration of road defects from Uppal to Ghatkesar
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={byLandmark} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} name="Defect Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints Status Pipeline */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <TrendingUp size={18} color="#0284c7" />
                <span>Complaint Resolution Lifecycle Funnel</span>
              </div>
              <div className="card-description">
                Breakdown of active complaints by workflow stage
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={byStatus} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} name="Complaints" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2 */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Issue Type Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Layers size={18} color="#0d9488" />
                <span>Defects by Issue Classification</span>
              </div>
              <div className="card-description">
                Potholes, cracks, waterlogging, damaged roads & drainage
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={byType}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {byType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <ShieldAlert size={18} color="#ef4444" />
                <span>Defects by Severity Rating</span>
              </div>
              <div className="card-description">
                Critical, High, Medium, and Low severity hazard levels
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={bySeverity}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {bySeverity.map((entry, index) => {
                    const sevColors = {
                      Critical: '#ef4444',
                      High: '#f97316',
                      Medium: '#f59e0b',
                      Low: '#10b981'
                    };
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={sevColors[entry.name] || COLORS[index % COLORS.length]}
                      />
                    );
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Field Activity Feed */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Clock size={18} color="#0d9488" />
              <span>Real-Time Maintenance Log Feed</span>
            </div>
            <div className="card-description">
              Recent status transitions logged along the corridor
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Complaint ID</th>
                <th>Corridor Location</th>
                <th>New Status</th>
                <th>Authorizing Actor</th>
                <th>Field Work Notes</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0d9488' }}>
                    {log.report_id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{log.landmark}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.title}</div>
                  </td>
                  <td>
                    <StatusBadge status={log.status} />
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>
                    <strong>{log.changed_by}</strong>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{log.role}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                    {log.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
