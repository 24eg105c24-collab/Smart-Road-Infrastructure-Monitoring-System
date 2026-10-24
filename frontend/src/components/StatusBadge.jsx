// frontend/src/components/StatusBadge.jsx
import React from 'react';
import { Clock, CheckCircle2, UserCheck, Wrench, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const map = {
    Reported: {
      className: 'status-reported',
      icon: Clock,
      label: 'Reported'
    },
    Verified: {
      className: 'status-verified',
      icon: CheckCircle2,
      label: 'Verified'
    },
    Assigned: {
      className: 'status-assigned',
      icon: UserCheck,
      label: 'Team Assigned'
    },
    'Under Repair': {
      className: 'status-under-repair',
      icon: Wrench,
      label: 'Under Repair'
    },
    Resolved: {
      className: 'status-resolved',
      icon: CheckCircle2,
      label: 'Resolved'
    }
  };

  const item = map[status] || {
    className: 'status-reported',
    icon: AlertCircle,
    label: status
  };

  const Icon = item.icon;

  return (
    <span className={`badge-status ${item.className}`}>
      <Icon size={13} />
      <span>{item.label}</span>
    </span>
  );
}
