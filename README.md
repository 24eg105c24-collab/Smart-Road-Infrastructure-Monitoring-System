# Smart Road Infrastructure Monitoring System
### Prototype for Uppal X Roads to Ghatkesar (NH163) Corridor, Telangana, India

**Theme:** Transportation and Sustainable Mobility  
**Scope:** Strict Geographical Focus on the 16.07 km National Highway (NH163) corridor connecting **Uppal X Roads** to **Ghatkesar Town**, covering **Survey of India / Uppal Depot**, **Boduppal**, **Peerzadiguda**, **Medipally**, **Narapally**, **Anurag University area**, and **Ghatkesar ORR Interchange**.

> **Disclaimer:** This software is an independent academic college prototype for educational demonstration purposes. It uses simulated demo records and is not connected to or endorsed by the Greater Hyderabad Municipal Corporation (GHMC), Telangana State Road Transport Corporation (TSRTC), or NHAI.

---

## 1. System Architecture & Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19, Vite 8 | Single Page Application with client-side routing |
| **Routing & Icons** | React Router v7, Lucide React | Modern responsive navigation and UI iconography |
| **Data Visualization**| Recharts v3 | Responsive charts for defect types, statuses, severity, & corridor density |
| **Maps & GIS** | React Leaflet v5, Leaflet 1.9, OpenStreetMap | Interactive GIS map with live OpenStreetMap tile layer |
| **Routing Engine** | OSRM (Open Source Routing Machine) | Real road geometry (304 waypoints) with verified cached fallback |
| **Backend** | Node.js v24, Express 5 | RESTful APIs with route proximity validation and Multer image storage |
| **Database** | SQLite 3 via `better-sqlite3` | Persistent local relational database (`smart_road.db`) with WAL mode |

---

## 2. Key Features

1. **Strict Corridor Proximity Validation:**
   - Every submitted location is verified against the actual Uppal-Ghatkesar driving polyline using an equirectangular point-to-segment distance algorithm in meters.
   - Reports located $\le$ 1,000m from the highway are accepted and geo-tagged with the nearest landmark.
   - Submissions outside the 1,000m buffer (e.g., Banjara Hills, Hitec City, Secunderabad) are rejected with clear user and API error messages.
2. **Interactive Dual-Role Experience:**
   - **Citizen Mode:** Submit road defects with photo upload, drop a map pin, test live distance validation, and track complaints via unique IDs.
   - **Road Authority Mode:** Review complaints, change severity and priority, assign simulated repair teams (*Team Alpha, Team Bravo, Team Delta, Team Echo*), and record inspector field notes.
3. **5-Stage Complaint Lifecycle:**
   - Visual progress stepper: `Reported` $\rightarrow$ `Verified` $\rightarrow$ `Assigned` $\rightarrow$ `Under Repair` $\rightarrow$ `Resolved`.
   - Full chronological audit history log persisting actor name, role, timestamp, and notes in SQLite.
4. **Interactive Corridor Map:**
   - Real OSRM driving geometry drawn with custom cyan/teal road polyline.
   - Distinct colored markers for critical, high, medium, low, and resolved issues.
   - Filter by status, severity, and defect type, with a 1-click "Fit Full Route" controller.
5. **Analytics & Highway Intelligence:**
   - Visual distribution of defect types, resolution funnel, severity breakdown, and chainage density across corridor hubs.

---

## 3. Windows Setup & Startup Instructions

### Prerequisites
- Windows 10 or 11
- Node.js (v18, v20, v22, or v24) and npm installed. Check with:
  ```powershell
  node -v
  npm -v
  ```

### Step 1: Clone or Open Workspace
Open PowerShell inside the project directory:
```powershell
cd c:\Users\erama\OneDrive\Desktop\Smart-Road-Infrastructure
```

### Step 2: One-Time Dependency Installation
Install dependencies for root, backend, and frontend:
```powershell
npm run setup
```
*(Alternatively, run `cd backend; npm install; cd ../frontend; npm install; cd ..`)*

### Step 3: Run the Application
You can run both the Backend and Frontend concurrently with one command:
```powershell
npm run dev
```

Or run them in two separate PowerShell windows:
- **Terminal 1 (Backend API):**
  ```powershell
  npm run server
  ```
- **Terminal 2 (Frontend Client):**
  ```powershell
  npm run client
  ```

---

## 4. Expected Local URLs

| Service | Local URL | Description |
|---|---|---|
| **Frontend Web App** | [http://localhost:5173/](http://localhost:5173/) | Citizen & Authority User Interface |
| **Backend REST API** | [http://localhost:5001/api](http://localhost:5001/api) | Express API root |
| **API Health Check** | [http://localhost:5001/api/health](http://localhost:5001/api/health) | System status & scope verification |
| **Corridor Route API** | [http://localhost:5001/api/corridor/route](http://localhost:5001/api/corridor/route) | GeoJSON polyline & corridor landmarks |
| **Corridor Reports API**| [http://localhost:5001/api/reports](http://localhost:5001/api/reports) | Report list, filtering & creation |
| **Analytics API** | [http://localhost:5001/api/analytics](http://localhost:5001/api/analytics) | Real-time aggregated statistics |

---

## 5. Verification & Testing Report

| Test Item | Command / Method | Result | Notes |
|---|---|---|---|
| **OSRM Route Fetch** | OSRM Driving API | **PASSED** | 16.07 km, 304 waypoints from Uppal (`17.4018, 78.5602`) to Ghatkesar (`17.4520, 78.6918`). Cached locally in `backend/osrm_cache.json` for offline reliability. |
| **Corridor Scope Enforcement** | API test with point in Banjara Hills (13.37 km away) | **PASSED** | Rejected with HTTP 400: *"Report location is 13.37 km away from Uppal-Ghatkesar corridor. Allowed within 1,000m only."* |
| **Corridor Proximity Acceptance** | API test with point in Boduppal (102m away) | **PASSED** | Accepted with HTTP 201; generated unique ID `SRI-2026-0115`. |
| **Frontend Production Build** | `npm --prefix frontend run build` | **PASSED** | Compiled in Vite with 0 errors (`dist/index.html`, 27 KB CSS, 885 KB bundle). |
| **End-to-End Workflow** | `test_e2e.js` test suite | **PASSED** | Citizen submitted defect $\rightarrow$ visible in list $\rightarrow$ Authority verified & assigned Team Alpha $\rightarrow$ Citizen tracking updated with 2 audit steps $\rightarrow$ verified in SQLite database. |
| **Demo Data Reset** | `POST /api/reports/reset-demo` | **PASSED** | Cleanly restores database to the default 14 realistic corridor records. |

### Known Limitations & Honest Fallback
- **Public OSRM Rate Limits:** Public OSRM routing servers occasionally throttle requests during heavy traffic. To guarantee uninterrupted evaluation without external network dependence, the system includes a pre-fetched and verified 304-point route cache that loads instantaneously if external routing fails.
- **Simulated Repair Teams:** Team dispatch and GPS unit tracking are simulated for academic prototyping without live telematics hardware.

---

## 6. 3-Minute Faculty Demonstration Script

### Minute 1: The Problem & Corridor Overview (Landing & Map)
1. Open the application in the browser: [http://localhost:5173/](http://localhost:5173/).
2. Point out the **Corridor Scope Banner**: Uppal X Roads to Ghatkesar (NH163, 16.07 km).
3. Scroll through the **Corridor Chainage Bar**: Show the 9 verified landmarks (Uppal $\rightarrow$ Survey of India $\rightarrow$ Boduppal $\rightarrow$ Peerzadiguda $\rightarrow$ Medipally $\rightarrow$ Narapally $\rightarrow$ Anurag University $\rightarrow$ Ghatkesar ORR $\rightarrow$ Ghatkesar Town).
4. Click **Corridor Map** on the navigation bar:
   - Highlight the neon teal polyline showing the actual curved highway route (not a straight line).
   - Click a colored marker (e.g. Medipally or Peerzadiguda) to reveal the defect popup, severity badge, and photo thumbnail.
   - Use the filter bar to filter by **Critical** severity or **Under Repair** status.
   - Click **Fit Full Route** to demonstrate dynamic camera bounds fitting.

### Minute 2: Citizen Hazard Reporting & Route Proximity Validation
1. Click **Report Issue** in the navigation bar.
2. Select **Defect Type**: Click *Pothole*.
3. Demonstrate **Geospatial Route Validation**:
   - Click on the map far away from the route (e.g. towards Hyderabad city center). Notice the red badge: *"Out of Bounds (> 1,000m from corridor)"* and the disabled submit button.
   - Click one of the quick preset buttons: **[Boduppal X Roads]** or **[Anurag Univ Turn]**. Notice the badge turns green: *"Corridor Verified: ~45m from NH163"*, and the address auto-populates.
4. Select a 1-Click Demo Photo (e.g. *Pothole Crater*) or upload a local image.
5. Click **Submit Report**.
6. The modal pops up: Show the newly generated unique ID (e.g. `SRI-2026-0115`).
7. Click **Track Complaint Progress**.

### Minute 3: Authority Triage & Citizen Live Sync
1. On the **Complaint Tracking** page, observe the 5-stage stepper at Step 1 (`Reported`).
2. Switch to **Road Authority Mode** using the top pill in the navbar or navigate to **Authority Console**.
3. Locate the new complaint in the work orders table.
4. Click **Triage**:
   - Change Status to **Assigned**.
   - Set Priority to **Emergency**.
   - Select Simulated Team: **Team Alpha - Rapid Asphalt Patching**.
   - Add field inspection note: *"Inspected site. Assigned Team Alpha for emergency hot-mix resurfacing."*
   - Click **Confirm & Save Update**.
5. Switch back to **Citizen Mode** and open **Track ID** (or refresh the tracking page).
6. Point out that the stepper has advanced to `Assigned`, Team Alpha is listed, and the full audit log shows both timestamps and inspector signatures.
7. Click **Analytics** to view the live Recharts breakdown showing real-time updates reflected in the charts.
