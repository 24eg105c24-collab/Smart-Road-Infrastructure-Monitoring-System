// backend/db.js
// SQLite database connection and initial schema/seed data

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'smart_road.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for reliability
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      issue_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      address TEXT NOT NULL,
      landmark TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      distance_to_corridor_meters REAL NOT NULL,
      photo_url TEXT,
      reporter_name TEXT NOT NULL,
      reporter_phone TEXT,
      verified_by TEXT,
      verified_at TEXT,
      assigned_team TEXT,
      estimated_completion TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id TEXT NOT NULL,
      status TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      role TEXT NOT NULL,
      notes TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
    CREATE INDEX IF NOT EXISTS idx_reports_landmark ON reports(landmark);
    CREATE INDEX IF NOT EXISTS idx_history_report ON status_history(report_id);
  `);
}

// 14 Realistic Simulated Demo Road Reports along Uppal-Ghatkesar corridor
const INITIAL_REPORTS = [
  {
    id: 'SRI-2026-0101',
    issue_type: 'Pothole',
    title: 'Deep Edge Pothole near Boduppal Flyover Junction',
    description: 'Crater pothole (~12cm depth, 60cm diameter) on left lane right at the Boduppal junction approach. Two-wheelers swerving dangerously during evening rush hour.',
    severity: 'High',
    priority: 'High',
    status: 'Under Repair',
    address: 'Near Pillar 42, Boduppal X Roads, NH163 Warangal Highway',
    landmark: 'Boduppal X Roads',
    latitude: 17.404200,
    longitude: 78.583500,
    distance_to_corridor_meters: 101.7,
    photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    reporter_name: 'Venkatesh Rao',
    reporter_phone: '+91 98480 12345',
    verified_by: 'Inspector R. K. Sharma (East Zone Infra)',
    verified_at: '2026-10-22T09:30:00Z',
    assigned_team: 'Team Alpha - Rapid Asphalt Patching',
    estimated_completion: '2026-10-24T18:00:00Z',
    created_at: '2026-10-21T14:15:00Z',
    updated_at: '2026-10-23T11:00:00Z',
    history: [
      { status: 'Reported', changed_by: 'Venkatesh Rao (Citizen)', role: 'Citizen', notes: 'Report submitted with geo-tag at Boduppal junction.', timestamp: '2026-10-21T14:15:00Z' },
      { status: 'Verified', changed_by: 'Inspector R. K. Sharma', role: 'Road Authority Inspector', notes: 'Site inspection completed. Verified high safety risk for two-wheelers. Priority escalated.', timestamp: '2026-10-22T09:30:00Z' },
      { status: 'Assigned', changed_by: 'Highway Maintenance Division', role: 'Maintenance Supervisor', notes: 'Work order #WK-441 issued to Team Alpha (Asphalt patching unit).', timestamp: '2026-10-22T14:00:00Z' },
      { status: 'Under Repair', changed_by: 'Team Alpha Foreman (S. Naidu)', role: 'Field Repair Lead', notes: 'Cold mix and compaction roller deployed on site. Expected finish by evening.', timestamp: '2026-10-23T11:00:00Z' }
    ]
  },
  {
    id: 'SRI-2026-0102',
    issue_type: 'Waterlogging',
    title: 'Monsoon Waterlogging on Westbound Carriageway',
    description: 'Choked road-side culvert causing 25cm deep water sheet covering 2 entire highway lanes. Traffic slowed to single-lane crawling.',
    severity: 'Critical',
    priority: 'Emergency',
    status: 'Assigned',
    address: 'Opposite Medipally Police Station, NH163 Corridor',
    landmark: 'Medipally Junction',
    latitude: 17.417487,
    longitude: 78.627606,
    distance_to_corridor_meters: 0.0,
    photo_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80',
    reporter_name: 'Pooja Reddy',
    reporter_phone: '+91 97012 34567',
    verified_by: 'Divisional Engineer K. Madhav',
    verified_at: '2026-10-23T08:15:00Z',
    assigned_team: 'Team Delta - Drainage & Dewatering Unit',
    estimated_completion: '2026-10-24T20:00:00Z',
    created_at: '2026-10-22T19:40:00Z',
    updated_at: '2026-10-23T10:30:00Z',
    history: [
      { status: 'Reported', changed_by: 'Pooja Reddy (Citizen)', role: 'Citizen', notes: 'Severe flooding reported outside police station.', timestamp: '2026-10-22T19:40:00Z' },
      { status: 'Verified', changed_by: 'Divisional Engineer K. Madhav', role: 'Road Authority Inspector', notes: 'Verified standing water affecting national highway corridor. Culvert intake blocked by silt.', timestamp: '2026-10-23T08:15:00Z' },
      { status: 'Assigned', changed_by: 'Disaster Cell Control', role: 'Maintenance Supervisor', notes: 'High-volume suction tanker and Team Delta deployed.', timestamp: '2026-10-23T10:30:00Z' }
    ]
  },
  {
    id: 'SRI-2026-0103',
    issue_type: 'Crack',
    title: 'Longitudinal Alligator Cracking on Left Lane',
    description: 'Extensive subgrade cracking spanning 35 meters along the shoulder curb. Water seepage beginning to undermine base course.',
    severity: 'Medium',
    priority: 'Medium',
    status: 'Verified',
    address: 'Near Narapally RTC Bus Shelter, Eastbound',
    landmark: 'Narapally Junction',
    latitude: 17.426847,
    longitude: 78.647935,
    distance_to_corridor_meters: 0.0,
    photo_url: 'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?w=600&auto=format&fit=crop&q=80',
    reporter_name: 'Dr. Srinivasulu M.',
    reporter_phone: '+91 94401 98765',
    verified_by: 'Junior Inspector T. Venu',
    verified_at: '2026-10-23T15:20:00Z',
    assigned_team: null,
    estimated_completion: null,
    created_at: '2026-10-23T11:00:00Z',
    updated_at: '2026-10-23T15:20:00Z',
    history: [
      { status: 'Reported', changed_by: 'Dr. Srinivasulu M.', role: 'Citizen', notes: 'Reported road cracking near Narapally bus bay.', timestamp: '2026-10-23T11:00:00Z' },
      { status: 'Verified', changed_by: 'Junior Inspector T. Venu', role: 'Road Authority Inspector', notes: 'Structural crack confirmed. Bitumen emulsion crack-sealing recommended before next rain.', timestamp: '2026-10-23T15:20:00Z' }
    ]
  },
  {
    id: 'SRI-2026-0104',
    issue_type: 'Damaged Road',
    title: 'Severely Broken Bituminous Surface & Loose Gravel',
    description: 'Top asphalt layer stripped away over 20-meter stretch. Flying stones hitting windshields and two-wheeler skidding hazards.',
    severity: 'Critical',
    priority: 'Emergency',
    status: 'Reported',
    address: 'Peerzadiguda Kaman Junction, approaching Municipal Office',
    landmark: 'Peerzadiguda Kaman',
    latitude: 17.407560,
    longitude: 78.595821,
    distance_to_corridor_meters: 0.0,
    photo_url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&auto=format&fit=crop&q=80',
    reporter_name: 'K. Anitha',
    reporter_phone: '+91 99890 22334',
    verified_by: null,
    verified_at: null,
    assigned_team: null,
    estimated_completion: null,
    created_at: '2026-10-24T08:10:00Z',
    updated_at: '2026-10-24T08:10:00Z',
    history: [
      { status: 'Reported', changed_by: 'K. Anitha (Citizen)', role: 'Citizen', notes: 'Citizen submission via mobile web interface with photo.', timestamp: '2026-10-24T08:10:00Z' }
    ]
  },
  {
    id: 'SRI-2026-0105',
    issue_type: 'Drainage Problem',
    title: 'Sunken Manhole & Broken Storm Drainage Grate',
    description: 'Storm water chamber grate collapsed 15cm below road grade. Poses severe vehicle wheel trapping risk.',
    severity: 'High',
    priority: 'High',
    status: 'Resolved',
    address: 'Anurag University Approach Road, NH163 junction',
    landmark: 'Anurag University Turn',
    latitude: 17.442197,
    longitude: 78.670663,
    distance_to_corridor_meters: 0.0,
    photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?w=600&auto=format&fit=crop&q=80',
    reporter_name: 'Campus Safety Council (Anurag Univ)',
    reporter_phone: '+91 91234 56789',
    verified_by: 'AE P. Chandrasekhar',
    verified_at: '2026-10-20T10:00:00Z',
    assigned_team: 'Team Bravo - Heavy Civil Squad',
    estimated_completion: '2026-10-22T17:00:00Z',
    created_at: '2026-10-19T16:30:00Z',
    updated_at: '2026-10-22T16:45:00Z',
    history: [
      { status: 'Reported', changed_by: 'Campus Safety Council', role: 'Citizen', notes: 'Student buses endangered by sunken storm drain frame.', timestamp: '2026-10-19T16:30:00Z' },
      { status: 'Verified', changed_by: 'AE P. Chandrasekhar', role: 'Road Authority Inspector', notes: 'Confirmed damaged frame. Needs ductile iron cover replacement and concrete collar.', timestamp: '2026-10-20T10:00:00Z' },
      { status: 'Assigned', changed_by: 'Sub-Divisional Office', role: 'Maintenance Supervisor', notes: 'Assigned to Team Bravo (Civil structures).', timestamp: '2026-10-20T14:00:00Z' },
      { status: 'Under Repair', changed_by: 'Team Bravo Lead', role: 'Field Repair Lead', notes: 'New frame placed and high-early-strength concrete poured.', timestamp: '2026-10-21T11:00:00Z' },
      { status: 'Resolved', changed_by: 'AE P. Chandrasekhar', role: 'Road Authority Inspector', notes: 'Final inspection passed. Surface leveled smoothly with road profile.', timestamp: '2026-10-22T16:45:00Z' }
    ]
  },
  {
    id: 'SRI-2026-0106',
    issue_type: 'Pothole',
    title: 'Twin Wheel-Rutt Potholes at Metro Pillar 118',
    description: 'Double potholes formed right after metro pillar turn. Both tires drop simultaneously causing loss of steering control.',
    severity: 'Critical',
    priority: 'High',
    status: 'Resolved',
    address: 'Uppal Metro Station East Concourse, Inner Ring Rd intersection',
    landmark: 'Uppal X Roads',
    latitude: 17.401825,
    longitude: 78.560226,
    distance_to_corridor_meters: 0.0,
    photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    reporter_name: 'Metro Commuter Forum',
    reporter_phone: '+91 93900 11223',
    verified_by: 'Executive Engineer N. Ramakrishna',
    verified_at: '2026-10-18T11:00:00Z',
    assigned_team: 'Team Alpha - Rapid Asphalt Patching',
    estimated_completion: '2026-10-20T06:00:00Z',
    created_at: '2026-10-18T08:00:00Z',
    updated_at: '2026-10-20T05:30:00Z',
    history: [
      { status: 'Reported', changed_by: 'Metro Commuter Forum', role: 'Citizen', notes: 'Reported via corridor portal.', timestamp: '2026-10-18T08:00:00Z' },
      { status: 'Verified', changed_by: 'EE N. Ramakrishna', role: 'Road Authority Inspector', notes: 'Verified high traffic bottleneck.', timestamp: '2026-10-18T11:00:00Z' },
      { status: 'Assigned', changed_by: 'Road Operations Center', role: 'Maintenance Supervisor', notes: 'Night shift priority repair assigned to Team Alpha.', timestamp: '2026-10-18T16:00:00Z' },
      { status: 'Under Repair', changed_by: 'Team Alpha Lead', role: 'Field Repair Lead', notes: 'Milled surface and compacted hot-mix asphalt.', timestamp: '2026-10-19T23:30:00Z' },
      { status: 'Resolved', changed_by: 'EE N. Ramakrishna', role: 'Road Authority Inspector', notes: 'Night inspection completed. Road opened to full traffic flow.', timestamp: '2026-10-20T05:30:00Z' }
    ]
  },
  {
    id: 'SRI-2026-0107',
    issue_type: 'Damaged Road',
    title: 'Shoulder Erosion & Guardrail Damage near ORR Bridge',
    description: 'Rain runoff eroded the unpaved shoulder embankment by 40cm. Steel crash barrier leaning outward.',
    severity: 'High',
    priority: 'High',
    status: 'Under Repair',
    address: 'Ghatkesar Outer Ring Road (ORR) Interchange Ramp',
    landmark: 'Ghatkesar ORR Junction',
    latitude: 17.447447,
    longitude: 78.689206,
    distance_to_corridor_meters: 0.0,
    photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?w=600&auto=format&fit=crop&q=80',
    reporter_name: 'Highway Patrol Squad (NH163)',
    reporter_phone: '+91 94906 17001',
    verified_by: 'Project Director S. Balaji',
    verified_at: '2026-10-22T14:30:00Z',
    assigned_team: 'Team Echo - Highway Structures Crew',
    estimated_completion: '2026-10-25T18:00:00Z',
    created_at: '2026-10-22T11:20:00Z',
    updated_at: '2026-10-23T14:00:00Z',
    history: [
      { status: 'Reported', changed_by: 'Highway Patrol Squad', role: 'Citizen', notes: 'Erosion noticed on ORR down-ramp.', timestamp: '2026-10-22T11:20:00Z' },
      { status: 'Verified', changed_by: 'Project Director S. Balaji', role: 'Road Authority Inspector', notes: 'Verified structural threat to shoulder slope.', timestamp: '2026-10-22T14:30:00Z' },
      { status: 'Assigned', changed_by: 'Division 4 Works', role: 'Maintenance Supervisor', notes: 'Dispatched Team Echo with gabion baskets and stone pitching.', timestamp: '2026-10-23T09:00:00Z' },
      { status: 'Under Repair', changed_by: 'Team Echo Foreman', role: 'Field Repair Lead', notes: 'Stone pitching retaining wall 60% complete.', timestamp: '2026-10-23T14:00:00Z' }
    ]
  },
  {
    id: 'SRI-2026-0108',
    issue_type: 'Drainage Problem',
    title: 'Blocked Culvert Causing Stagnant Mud Ponding',
    description: 'Roadside concrete culvert clogged with silt and weeds. Muddy ponding spilling onto bicycle/motorcycle track.',
    severity: 'Medium',
    priority: 'Medium',
    status: 'Verified',
    address: 'Near Survey of India gate, Uppal Depot corridor',
    landmark: 'Survey of India / Uppal Depot',
    latitude: 17.402213,
    longitude: 78.575840,
    distance_to_corridor_meters: 0.0,
    photo_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80',
    reporter_name: 'B. Jagadeeshwar',
    reporter_phone: '+91 98850 77889',
    verified_by: 'AE M. Sudhakar',
    verified_at: '2026-10-23T16:00:00Z',
    assigned_team: null,
    estimated_completion: null,
    created_at: '2026-10-23T10:15:00Z',
    updated_at: '2026-10-23T16:00:00Z',
    history: [
      { status: 'Reported', changed_by: 'B. Jagadeeshwar', role: 'Citizen', notes: 'Stagnant water near Survey gate.', timestamp: '2026-10-23T10:15:00Z' },
      { status: 'Verified', changed_by: 'AE M. Sudhakar', role: 'Road Authority Inspector', notes: 'Culvert blockage confirmed. Slated for mechanical JCB desilting.', timestamp: '2026-10-23T16:00:00Z' }
    ]
  },
  {
    id: 'SRI-2026-0109',
    issue_type: 'Crack',
    title: 'Thermal Transverse Cracks across Carriageway',
    description: 'Hairline cracks expanding across both lanes due to heavy container truck traffic from Ghatkesar logistics parks.',
    severity: 'Low',
    priority: 'Low',
    status: 'Reported',
    address: 'Korremula - Narapally Road crossing, Warangal Highway',
    landmark: 'Narapally Junction',
    latitude: 17.429500,
    longitude: 78.652000,
    distance_to_corridor_meters: 18.4,
    photo_url: 'https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?w=600&auto=format&fit=crop&q=80',
    reporter_name: 'Satyanarayana G.',
    reporter_phone: '+91 96180 54321',
    verified_by: null,
    verified_at: null,
    assigned_team: null,
    estimated_completion: null,
    created_at: '2026-10-24T09:45:00Z',
    updated_at: '2026-10-24T09:45:00Z',
    history: [
      { status: 'Reported', changed_by: 'Satyanarayana G. (Citizen)', role: 'Citizen', notes: 'Report submitted for preventative inspection.', timestamp: '2026-10-24T09:45:00Z' }
    ]
  },
  {
    id: 'SRI-2026-0110',
    issue_type: 'Pothole',
    title: 'Craters on Service Road near College Bus Bay',
    description: 'Series of 3 clustered potholes on the college bus deceleration lane. College buses scrape underbody every morning.',
    severity: 'High',
    priority: 'High',
    status: 'Assigned',
    address: 'Near Anurag University Main Bus Stop, Venkatapur road',
    landmark: 'Anurag University Turn',
    latitude: 17.440100,
    longitude: 78.667500,
    distance_to_corridor_meters: 85.2,
    photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    reporter_name: 'Anurag Univ Transport Dept',
    reporter_phone: '+91 84152 55555',
    verified_by: 'Inspector R. K. Sharma',
    verified_at: '2026-10-23T11:45:00Z',
    assigned_team: 'Team Alpha - Rapid Asphalt Patching',
    estimated_completion: '2026-10-25T12:00:00Z',
    created_at: '2026-10-23T07:30:00Z',
    updated_at: '2026-10-23T14:15:00Z',
    history: [
      { status: 'Reported', changed_by: 'Anurag Univ Transport Dept', role: 'Citizen', notes: 'College bus bay defects reported.', timestamp: '2026-10-23T07:30:00Z' },
      { status: 'Verified', changed_by: 'Inspector R. K. Sharma', role: 'Road Authority Inspector', notes: 'High priority due to student bus safety. Potholes depth up to 10cm.', timestamp: '2026-10-23T11:45:00Z' },
      { status: 'Assigned', changed_by: 'Highway Maintenance Division', role: 'Maintenance Supervisor', notes: 'Work order allocated to Team Alpha.', timestamp: '2026-10-23T14:15:00Z' }
    ]
  },
  {
    id: 'SRI-2026-0111',
    issue_type: 'Damaged Road',
    title: 'Pavement Delamination and Surface Stripping',
    description: 'Bitumen surface debonded from base over a 45-meter strip. Heavy vibration felt by cars traveling at 50 km/h.',
    severity: 'Medium',
    priority: 'Medium',
    status: 'Under Repair',
    address: 'Chengicherla Junction, Peerzadiguda - Medipally stretch',
    landmark: 'Peerzadiguda Kaman',
    latitude: 17.412000,
    longitude: 78.610500,
    distance_to_corridor_meters: 25.1,
    photo_url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&auto=format&fit=crop&q=80',
    reporter_name: 'Mahesh Goud',
    reporter_phone: '+91 99480 33445',
    verified_by: 'Junior Inspector T. Venu',
    verified_at: '2026-10-22T13:00:00Z',
    assigned_team: 'Team Bravo - Heavy Civil Squad',
    estimated_completion: '2026-10-24T19:00:00Z',
    created_at: '2026-10-21T18:00:00Z',
    updated_at: '2026-10-23T09:30:00Z',
    history: [
      { status: 'Reported', changed_by: 'Mahesh Goud', role: 'Citizen', notes: 'Pavement stripping reported.', timestamp: '2026-10-21T18:00:00Z' },
      { status: 'Verified', changed_by: 'Junior Inspector T. Venu', role: 'Road Authority Inspector', notes: 'Milling and 40mm wearing layer resurfacing required.', timestamp: '2026-10-22T13:00:00Z' },
      { status: 'Assigned', changed_by: 'Sub-Divisional Office', role: 'Maintenance Supervisor', notes: 'Team Bravo assigned with cold planer and paver.', timestamp: '2026-10-22T16:00:00Z' },
      { status: 'Under Repair', changed_by: 'Team Bravo Lead', role: 'Field Repair Lead', notes: 'Milling complete; tack coat sprayed.', timestamp: '2026-10-23T09:30:00Z' }
    ]
  },
  {
    id: 'SRI-2026-0112',
    issue_type: 'Drainage Problem',
    title: 'Drainage Inlet Clogged with Solid Trash',
    description: 'Inlet basin filled with plastic bottles and vegetative debris, leading to water damming up against the railway approach curb.',
    severity: 'Low',
    priority: 'Low',
    status: 'Resolved',
    address: 'Opp. Ghatkesar Railway Station Approach Road',
    landmark: 'Ghatkesar Town Terminal',
    latitude: 17.452045,
    longitude: 78.691799,
    distance_to_corridor_meters: 0.0,
    photo_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80',
    reporter_name: 'Ghatkesar Merchants Welfare Assoc',
    reporter_phone: '+91 97000 88990',
    verified_by: 'Sanitary Inspector B. Raju',
    verified_at: '2026-10-20T09:00:00Z',
    assigned_team: 'Team Delta - Drainage & Dewatering Unit',
    estimated_completion: '2026-10-21T15:00:00Z',
    created_at: '2026-10-19T14:00:00Z',
    updated_at: '2026-10-21T14:30:00Z',
    history: [
      { status: 'Reported', changed_by: 'Ghatkesar Merchants Assoc', role: 'Citizen', notes: 'Clogged drainage basin reported.', timestamp: '2026-10-19T14:00:00Z' },
      { status: 'Verified', changed_by: 'Sanitary Inspector B. Raju', role: 'Road Authority Inspector', notes: 'Grate blockage verified.', timestamp: '2026-10-20T09:00:00Z' },
      { status: 'Assigned', changed_by: 'Town Works Cell', role: 'Maintenance Supervisor', notes: 'Team Delta sanitation crew assigned.', timestamp: '2026-10-20T11:00:00Z' },
      { status: 'Resolved', changed_by: 'Sanitary Inspector B. Raju', role: 'Road Authority Inspector', notes: 'Debris cleared, new trash arrestor installed. Water draining cleanly.', timestamp: '2026-10-21T14:30:00Z' }
    ]
  },
  {
    id: 'SRI-2026-0113',
    issue_type: 'Damaged Road',
    title: 'Disintegrated Speed Table with Exposed Metal Rebar',
    description: 'Elevated pedestrian table sheared off by overweight trucks. Exposed anchor rebar punctures scooter tires.',
    severity: 'High',
    priority: 'High',
    status: 'Verified',
    address: 'Boduppal Municipal Ward Office Road intersection',
    landmark: 'Boduppal X Roads',
    latitude: 17.405500,
    longitude: 78.588000,
    distance_to_corridor_meters: 52.3,
    photo_url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&auto=format&fit=crop&q=80',
    reporter_name: 'Chandana K.',
    reporter_phone: '+91 98492 44321',
    verified_by: 'Junior Inspector T. Venu',
    verified_at: '2026-10-23T17:10:00Z',
    assigned_team: null,
    estimated_completion: null,
    created_at: '2026-10-23T13:40:00Z',
    updated_at: '2026-10-23T17:10:00Z',
    history: [
      { status: 'Reported', changed_by: 'Chandana K.', role: 'Citizen', notes: 'Citizen reported damaged speed breaker with sharp exposed rebar.', timestamp: '2026-10-23T13:40:00Z' },
      { status: 'Verified', changed_by: 'Junior Inspector T. Venu', role: 'Road Authority Inspector', notes: 'Immediate hazard verified. Rebar to be cut and rubberized speed table installed.', timestamp: '2026-10-23T17:10:00Z' }
    ]
  },
  {
    id: 'SRI-2026-0114',
    issue_type: 'Waterlogging',
    title: 'Pavement Depression Ponding near Shanthi Nagar Arch',
    description: 'Depression in service lane pools water up to 18cm after light rain, forcing schoolchildren and cyclists into high-speed highway lane.',
    severity: 'Medium',
    priority: 'Medium',
    status: 'Reported',
    address: 'Medipally Shanthi Nagar Arch, NH163 Service Lane',
    landmark: 'Medipally Junction',
    latitude: 17.420500,
    longitude: 78.632000,
    distance_to_corridor_meters: 15.6,
    photo_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80',
    reporter_name: 'Shanthi Nagar Residents Society',
    reporter_phone: '+91 99080 66778',
    verified_by: null,
    verified_at: null,
    assigned_team: null,
    estimated_completion: null,
    created_at: '2026-10-24T11:00:00Z',
    updated_at: '2026-10-24T11:00:00Z',
    history: [
      { status: 'Reported', changed_by: 'Shanthi Nagar Residents Society', role: 'Citizen', notes: 'Service lane ponding submitted with photo.', timestamp: '2026-10-24T11:00:00Z' }
    ]
  }
];

function seedInitialData() {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM reports').get().cnt;
  if (count === 0) {
    console.log('Seeding initial 14 Uppal-Ghatkesar corridor simulated reports...');
    const insertReport = db.prepare(`
      INSERT INTO reports (
        id, issue_type, title, description, severity, priority, status,
        address, landmark, latitude, longitude, distance_to_corridor_meters,
        photo_url, reporter_name, reporter_phone, verified_by, verified_at,
        assigned_team, estimated_completion, created_at, updated_at
      ) VALUES (
        @id, @issue_type, @title, @description, @severity, @priority, @status,
        @address, @landmark, @latitude, @longitude, @distance_to_corridor_meters,
        @photo_url, @reporter_name, @reporter_phone, @verified_by, @verified_at,
        @assigned_team, @estimated_completion, @created_at, @updated_at
      )
    `);

    const insertHistory = db.prepare(`
      INSERT INTO status_history (report_id, status, changed_by, role, notes, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertAll = db.transaction((reports) => {
      for (const rep of reports) {
        insertReport.run(rep);
        if (rep.history && rep.history.length > 0) {
          for (const h of rep.history) {
            insertHistory.run(rep.id, h.status, h.changed_by, h.role, h.notes, h.timestamp);
          }
        }
      }
    });

    insertAll(INITIAL_REPORTS);
    console.log('Seeded successfully with 14 demo records along NH163!');
  }
}

// Reset database to initial demo state
function resetDatabase() {
  db.exec('DELETE FROM status_history; DELETE FROM reports;');
  seedInitialData();
  return { success: true, message: 'Database reset to default 14 corridor demo reports' };
}

initSchema();
seedInitialData();

module.exports = {
  db,
  resetDatabase,
  INITIAL_REPORTS
};
