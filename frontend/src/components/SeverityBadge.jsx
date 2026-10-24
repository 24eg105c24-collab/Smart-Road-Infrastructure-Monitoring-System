// frontend/src/components/SeverityBadge.jsx
import React from 'react';
import { AlertTriangle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';

export default function SeverityBadge({ severity }) {
  const map = {
    Critical: {
      className: 'sev-critical',
      icon: ShieldAlert,
      label: 'Critical'
    },
    High: {
      className: 'sev-high',
      icon: AlertOctagon,
      label: 'High'
    },
    Medium: {
      className: 'sev-medium',
      icon: AlertTriangle,
      label: 'Medium'
    },
    Low: {
      className: 'sev-low',
      icon: Info,
      label: 'Low'
    }
  };

  const item = map[severity] || {
    className: 'sev-medium',
    icon: Info,
    label: severity
  };

  const Icon = item.icon;

  return (
    <span className={`badge-sev ${item.className}`}>
      <Icon size={12} />
      <span>{item.label}</span>
    </span>
  );
}
