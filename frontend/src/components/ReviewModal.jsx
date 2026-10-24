// frontend/src/components/ReviewModal.jsx
import React, { useState } from 'react';
import { X, ShieldCheck, Wrench, Calendar, FileText, UserCheck, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import SeverityBadge from './SeverityBadge';

const SIMULATED_TEAMS = [
  'Team Alpha - Rapid Asphalt Patching',
  'Team Bravo - Heavy Asphalt & Milling Squad',
  'Team Delta - Drainage & Dewatering Unit',
  'Team Echo - Highway Structures & Barrier Crew'
];

export default function ReviewModal({ report, onClose, onSave }) {
  const [status, setStatus] = useState(report?.status || 'Verified');
  const [priority, setPriority] = useState(report?.priority || 'High');
  const [assignedTeam, setAssignedTeam] = useState(report?.assigned_team || SIMULATED_TEAMS[0]);
  const [inspectorName, setInspectorName] = useState(report?.verified_by || 'Inspector R. K. Sharma (East Corridor)');
  const [estimatedCompletion, setEstimatedCompletion] = useState(
    report?.estimated_completion
      ? report.estimated_completion.split('T')[0]
      : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!report) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(report.id, {
        status,
        priority,
        assigned_team: status === 'Reported' ? null : assignedTeam,
        estimated_completion: estimatedCompletion ? `${estimatedCompletion}T18:00:00Z` : null,
        changed_by: inspectorName,
        role: 'Road Authority Inspector',
        notes: notes.trim() || `Inspection status transitioned to ${status}.`
      });
      onClose();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0d9488', fontSize: '0.9rem' }}>
                {report.id}
              </span>
              <StatusBadge status={report.status} />
              <SeverityBadge severity={report.severity} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
              {report.title}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {report.address} • Nearest Landmark: <strong>{report.landmark}</strong> ({report.distance_to_corridor_meters}m from NH163)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ marginBottom: '1rem' }}>
            {/* Status Update */}
            <div className="form-group">
              <label className="form-label">
                Target Status <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="Reported">Reported (Pending Verification)</option>
                <option value="Verified">Verified (Inspection Approved)</option>
                <option value="Assigned">Assigned (Team Allocated)</option>
                <option value="Under Repair">Under Repair (Work in Progress)</option>
                <option value="Resolved">Resolved (Repair Closed)</option>
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low - Routine Cycle</option>
                <option value="Medium">Medium - Standard Repair</option>
                <option value="High">High - Prompt Action (24h)</option>
                <option value="Emergency">Emergency - Hazard Mitigation (4h)</option>
              </select>
            </div>
          </div>

          {/* Assigned Team */}
          {status !== 'Reported' && (
            <div className="grid-2" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Simulated Repair Team</label>
                <select
                  className="form-select"
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                >
                  {SIMULATED_TEAMS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Completion Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={estimatedCompletion}
                  onChange={(e) => setEstimatedCompletion(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Inspector Signature */}
          <div className="form-group">
            <label className="form-label">Inspector / Engineer Signature</label>
            <input
              type="text"
              className="form-input"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              required
            />
          </div>

          {/* Inspection / Field Notes */}
          <div className="form-group">
            <label className="form-label">Official Inspection Log / Work Notes</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Inspected site at Boduppal junction. Pothole measured 12cm depth. Dispatched Team Alpha for emergency cold mix patch..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <CheckCircle2 size={16} />
              <span>{loading ? 'Updating...' : 'Confirm & Save Update'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
