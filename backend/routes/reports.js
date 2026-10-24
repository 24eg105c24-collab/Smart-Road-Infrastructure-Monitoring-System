// backend/routes/reports.js
// Express Router for Smart Road Infrastructure Reports API

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { db, resetDatabase } = require('../db');
const {
  getRouteLatLngList,
  pointToPolylineDistance,
  findClosestLandmark,
  getCorridorRoute,
  CORRIDOR_LANDMARKS
} = require('../corridorData');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `road-issue-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, safeName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Allowed: JPG, PNG, WEBP'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Helper: generate next unique ID like SRI-2026-0115
function generateNextReportId() {
  const row = db.prepare(`
    SELECT id FROM reports 
    WHERE id LIKE 'SRI-2026-%' 
    ORDER BY id DESC LIMIT 1
  `).get();

  let nextNum = 115;
  if (row && row.id) {
    const parts = row.id.split('-');
    const lastNum = parseInt(parts[2], 10);
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1;
    }
  }
  return `SRI-2026-${String(nextNum).padStart(4, '0')}`;
}

// 1. GET /api/corridor/route
router.get('/corridor/route', async (req, res) => {
  try {
    const routeData = await getCorridorRoute();
    res.json(routeData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve corridor route', message: err.message });
  }
});

// 2. GET /api/reports
router.get('/reports', (req, res) => {
  try {
    const { status, severity, priority, landmark, issue_type, search } = req.query;

    let query = 'SELECT * FROM reports WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (severity && severity !== 'all') {
      query += ' AND severity = ?';
      params.push(severity);
    }
    if (priority && priority !== 'all') {
      query += ' AND priority = ?';
      params.push(priority);
    }
    if (landmark && landmark !== 'all') {
      query += ' AND landmark LIKE ?';
      params.push(`%${landmark}%`);
    }
    if (issue_type && issue_type !== 'all') {
      query += ' AND issue_type = ?';
      params.push(issue_type);
    }
    if (search) {
      query += ' AND (id LIKE ? OR title LIKE ? OR description LIKE ? OR address LIKE ? OR landmark LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    query += ' ORDER BY created_at DESC';

    const reports = db.prepare(query).all(...params);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports', message: err.message });
  }
});

// 3. GET /api/reports/:id
router.get('/reports/:id', (req, res) => {
  try {
    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const history = db.prepare(`
      SELECT * FROM status_history 
      WHERE report_id = ? 
      ORDER BY id ASC
    `).all(req.params.id);

    res.json({
      ...report,
      history
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report details', message: err.message });
  }
});

// 4. POST /api/reports (with photo upload & corridor distance validation)
router.post('/reports', upload.single('photo'), (req, res) => {
  try {
    const {
      issue_type,
      title,
      description,
      severity = 'Medium',
      latitude,
      longitude,
      address,
      reporter_name = 'Citizen Reporter',
      reporter_phone = '',
      demo_photo_url
    } = req.body;

    // Field validations
    if (!issue_type || !description || !latitude || !longitude || !address) {
      return res.status(400).json({
        error: 'Missing required fields: issue_type, description, latitude, longitude, and address are mandatory.'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Invalid coordinates provided.' });
    }

    // STRICT GEOGRAPHICAL VALIDATION: Check distance to Uppal-Ghatkesar polyline
    const polyline = getRouteLatLngList();
    const distanceMeters = pointToPolylineDistance(lat, lng, polyline);
    const MAX_BUFFER_METERS = 1000; // 1 km corridor buffer

    if (distanceMeters > MAX_BUFFER_METERS) {
      // Remove uploaded file if validation failed
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        error: 'Geographical Scope Violation',
        message: `Report location is ${(distanceMeters / 1000).toFixed(2)} km away from the Uppal-Ghatkesar (NH163) corridor. Reports are strictly permitted within 1,000m (1 km) of this corridor only.`,
        distanceMeters: Math.round(distanceMeters)
      });
    }

    // Auto-detect closest landmark along the corridor
    const closestLandmark = findClosestLandmark(lat, lng);
    const landmarkName = req.body.landmark || closestLandmark.name;

    // Default priority based on severity
    let priority = 'Medium';
    if (severity === 'Critical') priority = 'Emergency';
    else if (severity === 'High') priority = 'High';
    else if (severity === 'Low') priority = 'Low';

    const id = generateNextReportId();
    const now = new Date().toISOString();

    // Determine photo URL
    let photo_url = demo_photo_url || null;
    if (req.file) {
      photo_url = `/uploads/${req.file.filename}`;
    }
    if (!photo_url) {
      // Realistic fallback based on issue type
      const fallbacks = {
        Pothole: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
        Waterlogging: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80',
        Crack: 'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?w=600&auto=format&fit=crop&q=80',
        'Damaged Road': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&auto=format&fit=crop&q=80',
        'Drainage Problem': 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?w=600&auto=format&fit=crop&q=80'
      };
      photo_url = fallbacks[issue_type] || fallbacks.Pothole;
    }

    const reportTitle = title || `${issue_type} near ${landmarkName}`;

    // Insert Report
    const insertReport = db.prepare(`
      INSERT INTO reports (
        id, issue_type, title, description, severity, priority, status,
        address, landmark, latitude, longitude, distance_to_corridor_meters,
        photo_url, reporter_name, reporter_phone, verified_by, verified_at,
        assigned_team, estimated_completion, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `);

    insertReport.run(
      id, issue_type, reportTitle, description, severity, priority, 'Reported',
      address, landmarkName, lat, lng, +distanceMeters.toFixed(1),
      photo_url, reporter_name, reporter_phone, null, null,
      null, null, now, now
    );

    // Insert Initial History Entry
    const insertHistory = db.prepare(`
      INSERT INTO status_history (report_id, status, changed_by, role, notes, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertHistory.run(
      id,
      'Reported',
      `${reporter_name} (Citizen)`,
      'Citizen',
      `Road defect reported within Uppal-Ghatkesar corridor (${Math.round(distanceMeters)}m from NH163).`,
      now
    );

    // Fetch and return complete record
    const created = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
    const history = db.prepare('SELECT * FROM status_history WHERE report_id = ?').all(id);

    res.status(201).json({
      ...created,
      history,
      message: 'Road issue successfully reported and registered with unique ID.'
    });
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ error: 'Failed to create report', message: err.message });
  }
});

// 5. PATCH /api/reports/:id/status (Road Authority updates status, assigns teams, verifies)
router.patch('/reports/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      priority,
      assigned_team,
      estimated_completion,
      changed_by = 'Road Authority Inspector',
      role = 'Road Authority Inspector',
      notes = ''
    } = req.body;

    const existing = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const now = new Date().toISOString();
    let verified_by = existing.verified_by;
    let verified_at = existing.verified_at;

    // If moving to Verified or later, set verified info if not set
    if (['Verified', 'Assigned', 'Under Repair', 'Resolved'].includes(status) && !verified_by) {
      verified_by = changed_by;
      verified_at = now;
    }

    const newStatus = status || existing.status;
    const newPriority = priority || existing.priority;
    const newAssignedTeam = assigned_team !== undefined ? assigned_team : existing.assigned_team;
    const newEstComp = estimated_completion !== undefined ? estimated_completion : existing.estimated_completion;

    // Update Report
    const updateStmt = db.prepare(`
      UPDATE reports SET
        status = ?,
        priority = ?,
        assigned_team = ?,
        estimated_completion = ?,
        verified_by = ?,
        verified_at = ?,
        updated_at = ?
      WHERE id = ?
    `);

    updateStmt.run(
      newStatus,
      newPriority,
      newAssignedTeam,
      newEstComp,
      verified_by,
      verified_at,
      now,
      id
    );

    // Append to status history
    const historyStmt = db.prepare(`
      INSERT INTO status_history (report_id, status, changed_by, role, notes, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const autoNote = notes || `Status updated to ${newStatus}${newAssignedTeam ? ` and assigned to ${newAssignedTeam}` : ''}.`;
    historyStmt.run(id, newStatus, changed_by, role, autoNote, now);

    // Return updated report with history
    const updated = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
    const history = db.prepare('SELECT * FROM status_history WHERE report_id = ? ORDER BY id ASC').all(id);

    res.json({
      ...updated,
      history,
      message: `Report ${id} successfully updated to status: ${newStatus}`
    });
  } catch (err) {
    console.error('Error updating report status:', err);
    res.status(500).json({ error: 'Failed to update report status', message: err.message });
  }
});

// 6. GET /api/analytics
router.get('/analytics', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM reports').get().count;
    const pending = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'Reported'").get().count;
    const verified = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'Verified'").get().count;
    const assigned = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'Assigned'").get().count;
    const underRepair = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'Under Repair'").get().count;
    const resolved = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'Resolved'").get().count;
    const critical = db.prepare("SELECT COUNT(*) as count FROM reports WHERE severity = 'Critical'").get().count;

    // By Issue Type
    const byType = db.prepare(`
      SELECT issue_type as name, COUNT(*) as count 
      FROM reports 
      GROUP BY issue_type 
      ORDER BY count DESC
    `).all();

    // By Status
    const byStatus = db.prepare(`
      SELECT status as name, COUNT(*) as count 
      FROM reports 
      GROUP BY status
    `).all();

    // By Severity
    const bySeverity = db.prepare(`
      SELECT severity as name, COUNT(*) as count 
      FROM reports 
      GROUP BY severity
    `).all();

    // By Priority
    const byPriority = db.prepare(`
      SELECT priority as name, COUNT(*) as count 
      FROM reports 
      GROUP BY priority
    `).all();

    // By Landmark along corridor
    const byLandmark = db.prepare(`
      SELECT landmark as name, COUNT(*) as count 
      FROM reports 
      GROUP BY landmark
      ORDER BY count DESC
    `).all();

    // Recent activity log
    const recentActivity = db.prepare(`
      SELECT h.*, r.title, r.issue_type, r.landmark 
      FROM status_history h
      JOIN reports r ON h.report_id = r.id
      ORDER BY h.id DESC 
      LIMIT 8
    `).all();

    res.json({
      summary: {
        total,
        pending,
        verified,
        assigned,
        underRepair,
        resolved,
        critical,
        corridorLengthKm: 16.07,
        activeTeamsDeployed: 4
      },
      byType,
      byStatus,
      bySeverity,
      byPriority,
      byLandmark,
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics', message: err.message });
  }
});

// 7. POST /api/reports/reset-demo
router.post('/reports/reset-demo', (req, res) => {
  try {
    const result = resetDatabase();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset demo data', message: err.message });
  }
});

module.exports = router;
