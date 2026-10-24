// frontend/src/components/CorridorChainage.jsx
import React from 'react';
import { CORRIDOR_LANDMARKS } from '../corridorPolyline';
import { MapPin, Navigation } from 'lucide-react';

export default function CorridorChainage({ selectedLandmark, onSelectLandmark }) {
  return (
    <div style={{ margin: '1.5rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation size={18} color="#0d9488" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
            NH163 Corridor Chainage (16.07 km)
          </span>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Uppal X Roads <span style={{ color: '#0d9488', fontWeight: 600 }}>→</span> Ghatkesar Town
        </span>
      </div>

      <div className="chainage-bar">
        <div className="chainage-line" />
        {CORRIDOR_LANDMARKS.map((lm, idx) => {
          const isSelected = selectedLandmark && selectedLandmark.toLowerCase().includes(lm.id);
          return (
            <div
              key={lm.id}
              className="chainage-step"
              onClick={() => onSelectLandmark && onSelectLandmark(lm)}
              style={{ cursor: onSelectLandmark ? 'pointer' : 'default' }}
              title={`${lm.name} (${lm.kmMarker}): ${lm.description}`}
            >
              <div
                className="chainage-dot"
                style={{
                  backgroundColor: isSelected ? '#0d9488' : '#0f172a',
                  borderColor: isSelected ? '#14b8a6' : '#cbd5e1',
                  color: isSelected ? '#ffffff' : '#2dd4bf',
                  transform: isSelected ? 'scale(1.2)' : 'none'
                }}
              >
                {idx + 1}
              </div>
              <div
                className="chainage-name"
                style={{
                  color: isSelected ? '#0d9488' : '#1e293b',
                  fontWeight: isSelected ? 800 : 600
                }}
              >
                {lm.name}
              </div>
              <div className="chainage-km">{lm.kmMarker}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
