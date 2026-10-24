// frontend/src/components/MapComponent.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import {
  VERIFIED_ROUTE_COORDS,
  CORRIDOR_LANDMARKS,
  START_POINT,
  END_POINT,
  pointToPolylineDistance,
  findClosestLandmark
} from '../corridorPolyline';
import StatusBadge from './StatusBadge';
import SeverityBadge from './SeverityBadge';
import { Maximize2, Navigation, MapPin, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Create custom SVG Leaflet DivIcons
function createColoredIcon(color, text = '', size = 28) {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 2.5px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 700;
        font-size: 11px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        cursor: pointer;
        transition: transform 0.2s;
      ">
        ${text}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
}

const START_ICON = L.divIcon({
  className: 'custom-marker-start',
  html: `
    <div style="
      background: #0f172a;
      color: #38bdf8;
      border: 2.5px solid #ffffff;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    ">
      <span>START: Uppal X Roads</span>
    </div>
  `,
  iconSize: [140, 26],
  iconAnchor: [70, 13]
});

const END_ICON = L.divIcon({
  className: 'custom-marker-end',
  html: `
    <div style="
      background: #0f172a;
      color: #34d399;
      border: 2.5px solid #ffffff;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    ">
      <span>END: Ghatkesar</span>
    </div>
  `,
  iconSize: [120, 26],
  iconAnchor: [60, 13]
});

const LANDMARK_ICON = L.divIcon({
  className: 'custom-landmark-pin',
  html: `
    <div style="
      width: 14px;
      height: 14px;
      background: #0f766e;
      border: 2.5px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Helper component to handle map clicks for pin placement
function MapClickHandler({ onMapClick, routeCoords }) {
  useMapEvents({
    click(e) {
      if (!onMapClick) return;
      const { lat, lng } = e.latlng;
      const dist = pointToPolylineDistance(lat, lng, routeCoords);
      const landmark = findClosestLandmark(lat, lng);
      onMapClick({
        lat,
        lng,
        distanceMeters: Math.round(dist),
        landmark: landmark.name
      });
    }
  });
  return null;
}

// Controller component to fit bounds
function MapBoundsController({ routeCoords, triggerFit }) {
  const map = useMap();

  useEffect(() => {
    if (routeCoords && routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [triggerFit, map, routeCoords]);

  return null;
}

export default function MapComponent({
  routeData,
  reports = [],
  selectedPoint,
  onMapClick,
  height = '560px',
  showLandmarks = true,
  interactivePin = false,
  highlightReportId = null
}) {
  const navigate = useNavigate();
  const [fitCounter, setFitCounter] = useState(0);

  // Fallback to verified coordinates
  const polyline = (routeData && routeData.polyline && routeData.polyline.length > 0)
    ? routeData.polyline
    : VERIFIED_ROUTE_COORDS;

  const getMarkerColor = (report) => {
    if (report.status === 'Resolved') return '#10b981';
    if (report.severity === 'Critical') return '#ef4444';
    if (report.severity === 'High') return '#f97316';
    if (report.severity === 'Medium') return '#f59e0b';
    return '#0284c7';
  };

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      {/* Fit Route Button */}
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() => setFitCounter(c => c + 1)}
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          zIndex: 800,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          fontSize: '0.78rem'
        }}
      >
        <Maximize2 size={13} />
        <span>Fit Full Route</span>
      </button>

      <MapContainer
        center={[17.425, 78.625]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', borderRadius: '14px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | OSRM Routing'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Bound Controller */}
        <MapBoundsController routeCoords={polyline} triggerFit={fitCounter} />

        {/* Map Click Handler for Reporting */}
        {interactivePin && (
          <MapClickHandler onMapClick={onMapClick} routeCoords={polyline} />
        )}

        {/* Real Uppal-Ghatkesar Route Polyline (Double Layer for Neon Effect) */}
        <Polyline
          positions={polyline}
          pathOptions={{
            color: '#0f172a',
            weight: 8,
            opacity: 0.5,
            lineCap: 'round',
            lineJoin: 'round'
          }}
        />
        <Polyline
          positions={polyline}
          pathOptions={{
            color: '#0d9488',
            weight: 5,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round'
          }}
        />

        {/* Start Point Marker (Uppal X Roads) */}
        <Marker position={[START_POINT.lat, START_POINT.lng]} icon={START_ICON}>
          <Popup>
            <div style={{ padding: '4px' }}>
              <strong>{START_POINT.name}</strong>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Corridor Km 0.0 • Uppal Metro Junction
              </p>
            </div>
          </Popup>
        </Marker>

        {/* End Point Marker (Ghatkesar) */}
        <Marker position={[END_POINT.lat, END_POINT.lng]} icon={END_ICON}>
          <Popup>
            <div style={{ padding: '4px' }}>
              <strong>{END_POINT.name}</strong>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Corridor Km 16.07 • Warangal Highway Terminus
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Key Corridor Landmark Pins */}
        {showLandmarks &&
          CORRIDOR_LANDMARKS.map(lm => (
            <Marker key={lm.id} position={[lm.lat, lm.lng]} icon={LANDMARK_ICON}>
              <Popup>
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{lm.name}</div>
                  <div style={{ color: '#0d9488', fontWeight: 600, fontSize: '0.78rem' }}>
                    Marker: {lm.kmMarker}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '3px' }}>
                    {lm.description}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* User-selected Pin (During Issue Reporting) */}
        {selectedPoint && selectedPoint.lat && selectedPoint.lng && (
          <Marker
            position={[selectedPoint.lat, selectedPoint.lng]}
            icon={createColoredIcon('#0d9488', '📍', 36)}
          >
            <Popup>
              <div style={{ fontSize: '0.85rem' }}>
                <strong>Selected Defect Location</strong>
                <p style={{ margin: '4px 0', fontSize: '0.78rem' }}>
                  Distance to NH163:{' '}
                  <span style={{ fontWeight: 700, color: selectedPoint.distanceMeters <= 1000 ? '#10b981' : '#ef4444' }}>
                    {selectedPoint.distanceMeters}m
                  </span>
                </p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Nearest Landmark: {selectedPoint.landmark}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Road Defect Markers */}
        {reports.map((rep, idx) => {
          const color = getMarkerColor(rep);
          const isHighlighted = highlightReportId === rep.id;

          return (
            <Marker
              key={rep.id}
              position={[rep.latitude, rep.longitude]}
              icon={createColoredIcon(color, idx + 1, isHighlighted ? 36 : 28)}
            >
              <Popup minWidth={260} maxWidth={320}>
                <div style={{ padding: '2px' }}>
                  {rep.photo_url && (
                    <img
                      src={rep.photo_url.startsWith('http') ? rep.photo_url : `http://localhost:5001${rep.photo_url}`}
                      alt={rep.title}
                      style={{
                        width: '100%',
                        height: '110px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        marginBottom: '8px'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#64748b', fontWeight: 600 }}>
                      {rep.id}
                    </span>
                    <SeverityBadge severity={rep.severity} />
                  </div>

                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '2px 0 6px' }}>
                    {rep.title}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
                    <MapPin size={12} color="#0d9488" />
                    <span>{rep.address}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                    <StatusBadge status={rep.status} />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/track/${rep.id}`)}
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    >
                      <Eye size={12} />
                      <span>Track</span>
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
