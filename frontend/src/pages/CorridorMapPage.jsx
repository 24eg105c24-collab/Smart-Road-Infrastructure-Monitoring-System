// frontend/src/pages/CorridorMapPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Compass,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Info,
  Maximize2,
  List,
  Eye
} from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { fetchReports, fetchCorridorRoute } from '../api';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import { useNavigate } from 'react-router-dom';

export default function CorridorMapPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showLegend, setShowLegend] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    Promise.all([fetchReports(), fetchCorridorRoute()])
      .then(([rep, route]) => {
        setReports(rep);
        setRouteData(route);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Map data load error:', err);
        setLoading(false);
      });
  }, []);

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && r.issue_type !== typeFilter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', padding: '1rem 1.5rem' }}>
      {/* Header and Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '0.75rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={22} color="#0d9488" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              Corridor Geospatial Intelligence Map
            </h1>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Uppal X Roads to Ghatkesar (16.07 km NH163 Highway) • Real OSRM Geometry • Showing{' '}
            <strong style={{ color: '#0d9488' }}>{filteredReports.length}</strong> of {reports.length} road defects
          </p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '140px', padding: '6px 10px', fontSize: '0.8rem' }}
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
            style={{ width: '130px', padding: '6px 10px', fontSize: '0.8rem' }}
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '140px', padding: '6px 10px', fontSize: '0.8rem' }}
          >
            <option value="all">All Issue Types</option>
            <option value="Pothole">Pothole</option>
            <option value="Crack">Crack</option>
            <option value="Waterlogging">Waterlogging</option>
            <option value="Damaged Road">Damaged Road</option>
            <option value="Drainage Problem">Drainage Problem</option>
          </select>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setShowLegend(!showLegend)}
            style={{ fontSize: '0.78rem' }}
          >
            <Layers size={13} />
            <span>Legend</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setShowDrawer(!showDrawer)}
            style={{ fontSize: '0.78rem' }}
          >
            <List size={13} />
            <span>Defects List ({filteredReports.length})</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div style={{ flex: 1, position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#64748b' }}>
            Loading corridor GIS layers and defects...
          </div>
        ) : (
          <MapComponent
            routeData={routeData}
            reports={filteredReports}
            height="100%"
            showLandmarks={true}
          />
        )}

        {/* Floating Map Legend */}
        {showLegend && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              zIndex: 800,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(6px)',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
              fontSize: '0.75rem',
              maxWidth: '300px'
            }}
          >
            <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Map Marker Legend</span>
              <span style={{ color: '#0d9488', fontSize: '0.7rem' }}>NH163 Route</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                <span>Critical Severity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f97316' }} />
                <span>High Severity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                <span>Medium Severity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7' }} />
                <span>Low Severity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                <span>Resolved Defect</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '4px', background: '#0d9488', borderRadius: '2px' }} />
                <span>16km NH163 Line</span>
              </div>
            </div>
          </div>
        )}

        {/* Side Drawer with List of Issues */}
        {showDrawer && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              bottom: '12px',
              width: '340px',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              zIndex: 850,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                Defects Along Corridor ({filteredReports.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                style={{ fontSize: '0.75rem', color: '#64748b' }}
              >
                Close
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
              {filteredReports.map((r, idx) => (
                <div
                  key={r.id}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    marginBottom: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/track/${r.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#0d9488', fontWeight: 700 }}>
                      #{idx + 1} {r.id}
                    </span>
                    <SeverityBadge severity={r.severity} />
                  </div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    {r.title}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>
                    {r.address}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <StatusBadge status={r.status} />
                    <span style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 600 }}>
                      Track →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
