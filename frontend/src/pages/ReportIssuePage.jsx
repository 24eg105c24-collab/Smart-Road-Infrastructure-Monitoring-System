// frontend/src/pages/ReportIssuePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Upload,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Camera,
  Navigation,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Droplets,
  Layers,
  FileText
} from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { createReport } from '../api';
import {
  CORRIDOR_LANDMARKS,
  VERIFIED_ROUTE_COORDS,
  pointToPolylineDistance,
  findClosestLandmark
} from '../corridorPolyline';

const ISSUE_TYPES = [
  { id: 'Pothole', name: 'Pothole', icon: AlertCircle, desc: 'Cavity or crater in road pavement' },
  { id: 'Crack', name: 'Crack', icon: Layers, desc: 'Structural or alligator cracking' },
  { id: 'Waterlogging', name: 'Waterlogging', icon: Droplets, desc: 'Standing water or submerged carriageway' },
  { id: 'Damaged Road', name: 'Damaged Road', icon: AlertTriangle, desc: 'Surface peeling, loose gravel, or erosion' },
  { id: 'Drainage Problem', name: 'Drainage Problem', icon: Droplets, desc: 'Clogged culvert, sunken grate, or overflow' }
];

const PRESET_SAMPLE_PHOTOS = [
  {
    name: 'Pothole Crater',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Monsoon Flood',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Broken Bitumen',
    url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&auto=format&fit=crop&q=80'
  }
];

export default function ReportIssuePage() {
  const navigate = useNavigate();

  // Form State
  const [issueType, setIssueType] = useState('Pothole');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('High');
  const [reporterName, setReporterName] = useState('Citizen Commuter');
  const [reporterPhone, setReporterPhone] = useState('+91 98480 54321');
  const [address, setAddress] = useState('Near Boduppal X Roads, NH163 Warangal Highway');
  const [landmark, setLandmark] = useState('Boduppal X Roads');

  // Selected Pin Coordinates (Default to Boduppal on NH163)
  const [selectedPoint, setSelectedPoint] = useState({
    lat: 17.404200,
    lng: 78.583500,
    distanceMeters: 102,
    landmark: 'Boduppal X Roads'
  });

  // Photo State
  const [file, setFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(PRESET_SAMPLE_PHOTOS[0].url);
  const [demoPhotoUrl, setDemoPhotoUrl] = useState(PRESET_SAMPLE_PHOTOS[0].url);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Handle map click
  const handleMapClick = (clickInfo) => {
    setSelectedPoint(clickInfo);
    setLandmark(clickInfo.landmark);
    setAddress(`Along NH163 near ${clickInfo.landmark}`);
    if (!title || title.includes('Defect near')) {
      setTitle(`${issueType} near ${clickInfo.landmark}`);
    }
  };

  // Quick preset landmark selection
  const handleSelectLandmarkPreset = (lm) => {
    const dist = Math.round(pointToPolylineDistance(lm.lat, lm.lng, VERIFIED_ROUTE_COORDS));
    setSelectedPoint({
      lat: lm.lat,
      lng: lm.lng,
      distanceMeters: dist,
      landmark: lm.name
    });
    setLandmark(lm.name);
    setAddress(`Near ${lm.name}, NH163 Corridor`);
    setTitle(`${issueType} near ${lm.name}`);
  };

  // Geolocation handling
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const dist = Math.round(pointToPolylineDistance(latitude, longitude, VERIFIED_ROUTE_COORDS));
        const closest = findClosestLandmark(latitude, longitude);

        setSelectedPoint({
          lat: latitude,
          lng: longitude,
          distanceMeters: dist,
          landmark: closest.name
        });
        setLandmark(closest.name);
        setAddress(`GPS Location near ${closest.name}`);
        setTitle(`${issueType} near ${closest.name}`);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err);
        // Fallback to Medipally
        handleSelectLandmarkPreset(CORRIDOR_LANDMARKS[4]);
        alert('Could not acquire GPS position. Defaulting to Medipally on Uppal-Ghatkesar corridor.');
      }
    );
  };

  // Photo file upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setFile(selectedFile);
      setDemoPhotoUrl(null);
      setPhotoPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation check: must be within 1,000 meters of the corridor
    if (selectedPoint.distanceMeters > 1000) {
      setErrorMsg(`Report rejected: Selected location is ${selectedPoint.distanceMeters}m away from the corridor. Submissions are strictly allowed within 1,000m (1 km) of the Uppal-Ghatkesar route.`);
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please provide a description of the road defect.');
      return;
    }

    setSubmitting(true);

    try {
      let reportData;
      if (file) {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('issue_type', issueType);
        formData.append('title', title || `${issueType} near ${landmark}`);
        formData.append('description', description);
        formData.append('severity', severity);
        formData.append('latitude', selectedPoint.lat);
        formData.append('longitude', selectedPoint.lng);
        formData.append('address', address);
        formData.append('landmark', landmark);
        formData.append('reporter_name', reporterName);
        formData.append('reporter_phone', reporterPhone);
        reportData = formData;
      } else {
        reportData = {
          issue_type: issueType,
          title: title || `${issueType} near ${landmark}`,
          description,
          severity,
          latitude: selectedPoint.lat,
          longitude: selectedPoint.lng,
          address,
          landmark,
          reporter_name: reporterName,
          reporter_phone: reporterPhone,
          demo_photo_url: demoPhotoUrl
        };
      }

      const created = await createReport(reportData);
      setSubmittedReport(created);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isWithinCorridor = selectedPoint.distanceMeters <= 1000;

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0d9488', fontWeight: 600, fontSize: '0.88rem' }}>
          <Navigation size={16} />
          <span>Uppal X Roads → Ghatkesar (NH163 Corridor)</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
          Report Road Damage
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
          Select a defect location along the verified Uppal-Ghatkesar highway. The system validates real-time proximity to the road route.
        </p>
      </div>

      {errorMsg && (
        <div
          style={{
            background: '#fee2e2',
            border: '1.5px solid #ef4444',
            color: '#b91c1c',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <AlertCircle size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{errorMsg}</span>
        </div>
      )}

      {/* Main Form & Map Grid */}
      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Left Column: Form Details */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
              1. Defect Classification & Description
            </h3>

            {/* Issue Type Selector */}
            <div className="form-group">
              <label className="form-label">
                Defect Type <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px'
                }}
              >
                {ISSUE_TYPES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = issueType === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setIssueType(t.id);
                        if (!title || title.includes('near')) {
                          setTitle(`${t.id} near ${landmark}`);
                        }
                      }}
                      style={{
                        border: isSelected ? '2px solid #0d9488' : '1.5px solid #e2e8f0',
                        background: isSelected ? '#f0fdfa' : '#ffffff',
                        padding: '10px 8px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon
                        size={20}
                        color={isSelected ? '#0d9488' : '#64748b'}
                        style={{ margin: '0 auto 4px' }}
                      />
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#0f766e' : '#1e293b'
                        }}
                      >
                        {t.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Issue Title */}
            <div className="form-group">
              <label className="form-label">Title / Summary</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Deep Pothole on Left Lane near Boduppal Flyover"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                Detailed Description <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="Describe size, depth, traffic risk, water accumulation, or lane obstruction..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
              />
            </div>

            {/* Severity Rating */}
            <div className="form-group">
              <label className="form-label">
                Observed Severity <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { level: 'Low', color: '#10b981', desc: 'Minor wear' },
                  { level: 'Medium', color: '#f59e0b', desc: 'Noticeable bump' },
                  { level: 'High', color: '#f97316', desc: 'Vehicle hazard' },
                  { level: 'Critical', color: '#ef4444', desc: 'Immediate danger' }
                ].map((s) => (
                  <button
                    key={s.level}
                    type="button"
                    onClick={() => setSeverity(s.level)}
                    style={{
                      border: severity === s.level ? `2px solid ${s.color}` : '1.5px solid #e2e8f0',
                      background: severity === s.level ? `${s.color}15` : '#ffffff',
                      color: severity === s.level ? s.color : '#64748b',
                      borderRadius: '8px',
                      padding: '8px 4px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    <div>{s.level}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 400, opacity: 0.85 }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Attachment & Demo Presets */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Photo Evidence (Live Upload or 1-Click Demo)</label>

              {photoPreview && (
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '140px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem'
                    }}
                  >
                    Photo Attached
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <label
                  className="btn btn-outline btn-sm"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Camera size={14} />
                  <span>Choose Image File...</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Max 5MB (JPG/PNG)</span>
              </div>

              {/* 1-Click Presets for Fast Evaluation */}
              <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Quick 1-Click Demo Photos:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {PRESET_SAMPLE_PHOTOS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setFile(null);
                        setDemoPhotoUrl(p.url);
                        setPhotoPreview(p.url);
                      }}
                      style={{
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        background: demoPhotoUrl === p.url ? '#f0fdfa' : '#ffffff',
                        borderColor: demoPhotoUrl === p.url ? '#0d9488' : '#e2e8f0'
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reporter Information */}
            <div className="grid-2" style={{ marginTop: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Reporter Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Geospatial Map Pinning & Proximity Verification */}
          <div>
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                    2. Pin Location on NH163 Corridor Map
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Click anywhere along the teal route to drop a pin.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleGeolocation}
                  title="Detect GPS location"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Navigation size={13} color="#0d9488" />
                  <span>My Location</span>
                </button>
              </div>

              {/* Real-time Proximity Status Badge */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isWithinCorridor ? '#ecfdf5' : '#fee2e2',
                  border: `1.5px solid ${isWithinCorridor ? '#10b981' : '#ef4444'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isWithinCorridor ? (
                    <CheckCircle2 size={18} color="#059669" />
                  ) : (
                    <ShieldAlert size={18} color="#b91c1c" />
                  )}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isWithinCorridor ? '#065f46' : '#991b1b' }}>
                      {isWithinCorridor
                        ? `Corridor Verified: ~${selectedPoint.distanceMeters}m from NH163`
                        : `Out of Bounds: ${selectedPoint.distanceMeters}m from corridor`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: isWithinCorridor ? '#047857' : '#b91c1c' }}>
                      {isWithinCorridor
                        ? `Valid submission location near ${selectedPoint.landmark}`
                        : `Reports strictly restricted to within 1,000m of Uppal-Ghatkesar route.`}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: isWithinCorridor ? '#d1fae5' : '#fecaca',
                    color: isWithinCorridor ? '#047857' : '#991b1b'
                  }}
                >
                  Limit: 1,000m
                </div>
              </div>

              {/* Interactive Leaflet Map for Pinning */}
              <div style={{ height: '360px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <MapComponent
                  height="100%"
                  selectedPoint={selectedPoint}
                  onMapClick={handleMapClick}
                  interactivePin={true}
                  showLandmarks={true}
                />
              </div>

              {/* Quick Select Buttons along Corridor */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                  Quick-Jump Corridor Landmarks:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {CORRIDOR_LANDMARKS.slice(0, 6).map((lm) => (
                    <button
                      key={lm.id}
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleSelectLandmarkPreset(lm)}
                      style={{
                        fontSize: '0.74rem',
                        padding: '3px 8px',
                        background: selectedPoint.landmark === lm.name ? '#f0fdfa' : '#ffffff',
                        borderColor: selectedPoint.landmark === lm.name ? '#0d9488' : '#e2e8f0'
                      }}
                    >
                      {lm.name} ({lm.kmMarker})
                    </button>
                  ))}
                </div>
              </div>

              {/* Address input */}
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label">
                  Road Address / Landmark Text <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submission Card & Submit Button */}
            <div className="card" style={{ background: '#0f172a', color: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                    Ready to Dispatch to Highway Authority?
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Generates persistent SQLite record & live tracking ID
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !isWithinCorridor}
                  style={{
                    padding: '12px 24px',
                    fontSize: '0.95rem',
                    opacity: isWithinCorridor ? 1 : 0.5,
                    cursor: isWithinCorridor ? 'pointer' : 'not-allowed'
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>{submitting ? 'Registering...' : 'Submit Report'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* SUCCESS MODAL ON SUBMISSION */}
      {submittedReport && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center', maxWidth: '520px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#d1fae5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Defect Report Registered!
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your complaint has been successfully recorded in the corridor monitoring system.
            </p>

            {/* Unique ID Box */}
            <div
              style={{
                background: '#f8fafc',
                border: '1.5px dashed #0d9488',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '1.5rem'
              }}
            >
              <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Unique Complaint ID
              </span>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: '#0d9488',
                  letterSpacing: '1px',
                  marginTop: '4px'
                }}
              >
                {submittedReport.id}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px' }}>
                Location: <strong>{submittedReport.address}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Proximity to NH163: ~{submittedReport.distance_to_corridor_meters}m
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/map')}
              >
                <span>View on Map</span>
              </button>

              <button
                className="btn btn-primary"
                onClick={() => navigate(`/track/${submittedReport.id}`)}
              >
                <span>Track Complaint Progress</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
