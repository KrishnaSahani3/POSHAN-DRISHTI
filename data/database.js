/**
 * @fileoverview SQLite database layer for POSHAN DRISHTI using sql.js (pure JS).
 * Persists data to poshan_drishti.db file on disk.
 */

const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "poshan_drishti.db");

let db = null;

/** Save DB to disk */
function persist() {
  try {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (err) {
    console.warn("⚠️ Persistence failed (expected on read-only systems like Netlify):", err.message);
  }
}

/** Run a write statement and persist */
function run(sql, params = {}) {
  db.run(sql, params);
  persist();
}

/** Execute a query and return all rows as objects */
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/** Execute a query and return first row */
function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0] || null;
}

/** Generate a random child ID like C-2347 */
function genChildId() {
  return "C-" + Math.floor(1000 + Math.random() * 9000);
}

/** Initialize DB (call once at startup) */
async function initDB() {
  if (db) return; // Already initialized

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileData = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileData);
    console.log("✅ Loaded existing database from disk");
  } else {
    db = new SQL.Database();
    console.log("✅ Created new database");
  }

  // Schema
  db.run(`
    CREATE TABLE IF NOT EXISTS children (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id    TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      gender      TEXT DEFAULT 'other',
      village     TEXT,
      awc_name    TEXT,
      guardian    TEXT,
      parent_name TEXT,
      mobile_no   TEXT,
      created_at  TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS screenings (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id     TEXT NOT NULL,
      age_months   REAL NOT NULL,
      weight_kg    REAL NOT NULL,
      height_cm    REAL NOT NULL,
      muac_cm      REAL NOT NULL,
      status       TEXT NOT NULL,
      color        TEXT NOT NULL,
      wfa_zscore   REAL NOT NULL,
      hfa_zscore   REAL NOT NULL,
      urgency      TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      screened_by  TEXT DEFAULT 'ANM/ASHA',
      screened_at  TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      specialty    TEXT NOT NULL,
      hospital     TEXT,
      area         TEXT NOT NULL,
      contact      TEXT,
      availability TEXT
    );
  `);

  // Seed demo data if empty
  const countRow = get("SELECT COUNT(*) AS n FROM children");
  if (!countRow || countRow.n === 0) {
    const { classifyChild } = require("./classifyChild");

    // Seed doctors
    const demoDoctors = [
      { name: "Dr. Anjali Sharma", specialty: "Pediatrician", hospital: "City General Hospital", area: "Rampur", contact: "9876500111", availability: "Mon-Sat, 10am-4pm" },
      { name: "Dr. Vikram Seth", specialty: "Nutrition Specialist", hospital: "Healthy Kids Clinic", area: "Bhagpur", contact: "9876500222", availability: "Tue, Thu, Sat, 2pm-6pm" },
      { name: "Dr. Meera Iyer", specialty: "Child Specialist", hospital: "Mother & Child Care", area: "Sonpur", contact: "9876500333", availability: "Daily, 9am-12pm" },
      { name: "Dr. Rahul Verma", specialty: "Pediatrician", hospital: "Public Health Center", area: "Lakhanpur", contact: "9876500444", availability: "Mon-Fri, 10am-5pm" },
      { name: "Dr. Sangeeta Rao", specialty: "General Physician", hospital: "Community Health Center", area: "Rampur", contact: "9876500555", availability: "Wed, Fri, 3pm-7pm" },
    ];

    for (const d of demoDoctors) {
      db.run(
        `INSERT INTO doctors (name, specialty, hospital, area, contact, availability) VALUES (?,?,?,?,?,?)`,
        [d.name, d.specialty, d.hospital, d.area, d.contact, d.availability]
      );
    }

    const demoChildren = [
      { child_id: "C-1001", name: "Aarav Singh", gender: "male", village: "Rampur", awc_name: "AWC-12", guardian: "Meena Singh", parent_name: "Ramesh Singh", mobile_no: "9876543210", data: { age_months: 18, weight_kg: 6.5, height_cm: 72, muac_cm: 11.0 } },
      { child_id: "C-1002", name: "Priya Yadav", gender: "female", village: "Bhagpur", awc_name: "AWC-07", guardian: "Sunita Yadav", parent_name: "Ramesh Yadav", mobile_no: "9876543211", data: { age_months: 24, weight_kg: 8.2, height_cm: 80, muac_cm: 12.1 } },
      { child_id: "C-1003", name: "Rohan Gupta", gender: "male", village: "Sonpur", awc_name: "AWC-03", guardian: "Rekha Gupta", parent_name: "Anil Gupta", mobile_no: "9876543212", data: { age_months: 36, weight_kg: 11.5, height_cm: 88, muac_cm: 13.0 } },
      { child_id: "C-1004", name: "Nisha Patel", gender: "female", village: "Lakhanpur", awc_name: "AWC-15", guardian: "Savita Patel", parent_name: "Vijay Patel", mobile_no: "9876543213", data: { age_months: 12, weight_kg: 9.0, height_cm: 74, muac_cm: 14.2 } },
      { child_id: "C-1005", name: "Kartik Verma", gender: "male", village: "Rampur", awc_name: "AWC-12", guardian: "Geeta Verma", parent_name: "Sanjay Verma", mobile_no: "9876543214", data: { age_months: 48, weight_kg: 14.5, height_cm: 101, muac_cm: 16.0 } },
      { child_id: "C-1006", name: "Lakshmi Devi", gender: "female", village: "Bhagpur", awc_name: "AWC-07", guardian: "Ram Devi", parent_name: "Krishna Devi", mobile_no: "9876543215", data: { age_months: 6, weight_kg: 5.5, height_cm: 62, muac_cm: 11.3 } },
      { child_id: "C-1007", name: "Arjun Mishra", gender: "male", village: "Sonpur", awc_name: "AWC-03", guardian: "Usha Mishra", parent_name: "Naveen Mishra", mobile_no: "9876543216", data: { age_months: 30, weight_kg: 10.0, height_cm: 84, muac_cm: 13.8 } },
    ];

    for (const c of demoChildren) {
      db.run(
        `INSERT OR IGNORE INTO children (child_id, name, gender, village, awc_name, guardian, parent_name, mobile_no) VALUES (?,?,?,?,?,?,?,?)`,
        [c.child_id, c.name, c.gender, c.village, c.awc_name, c.guardian, c.parent_name, c.mobile_no]
      );
      const r = classifyChild(c.data);
      db.run(
        `INSERT INTO screenings (child_id, age_months, weight_kg, height_cm, muac_cm, status, color, wfa_zscore, hfa_zscore, urgency, recommendation) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [c.child_id, c.data.age_months, c.data.weight_kg, c.data.height_cm, c.data.muac_cm, r.status, r.color, r.wfa_zscore, r.hfa_zscore, r.urgency, r.recommendation]
      );
    }
    persist();
    console.log("✅ Database seeded with 7 demo children");
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────
module.exports = {
  initDB,
  genChildId,

  createChild({ child_id, name, gender, village, awc_name, guardian, parent_name, mobile_no }) {
    run(
      `INSERT INTO children (child_id, name, gender, village, awc_name, guardian, parent_name, mobile_no) VALUES (?,?,?,?,?,?,?,?)`,
      [child_id, name, gender || "other", village || "", awc_name || "", guardian || "", parent_name || "", mobile_no || ""]
    );
    return get("SELECT * FROM children WHERE child_id = ?", [child_id]);
  },

  getAllChildren() {
    return all("SELECT * FROM children ORDER BY created_at DESC");
  },

  getChildById(child_id) {
    return get("SELECT * FROM children WHERE child_id = ?", [child_id]);
  },

  saveScreening({ child_id, age_months, weight_kg, height_cm, muac_cm, status, color, wfa_zscore, hfa_zscore, urgency, recommendation, screened_by }) {
    run(
      `INSERT INTO screenings (child_id, age_months, weight_kg, height_cm, muac_cm, status, color, wfa_zscore, hfa_zscore, urgency, recommendation, screened_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [child_id, age_months, weight_kg, height_cm, muac_cm, status, color, wfa_zscore, hfa_zscore, urgency, recommendation, screened_by || "ANM/ASHA"]
    );
    return get("SELECT * FROM screenings WHERE id = (SELECT MAX(id) FROM screenings)");
  },

  getAllScreenings() {
    return all(`
      SELECT s.*, c.name, c.village, c.awc_name
      FROM screenings s
      LEFT JOIN children c ON s.child_id = c.child_id
      ORDER BY s.screened_at DESC
    `);
  },

  getScreeningsByChild(child_id) {
    return all(`
      SELECT s.*, c.name, c.village
      FROM screenings s
      LEFT JOIN children c ON s.child_id = c.child_id
      WHERE s.child_id = ?
      ORDER BY s.screened_at DESC
    `, [child_id]);
  },

  getAnalytics() {
    const statusCounts = all(`
      SELECT status, COUNT(*) AS count FROM (
        SELECT child_id, status FROM screenings
        WHERE id IN (SELECT MAX(id) FROM screenings GROUP BY child_id)
      ) GROUP BY status
    `);
    const totalChildren = (get("SELECT COUNT(*) AS n FROM children") || {}).n || 0;
    const totalScreenings = (get("SELECT COUNT(*) AS n FROM screenings") || {}).n || 0;
    const recentScreenings = all(`
      SELECT s.*, c.name, c.village
      FROM screenings s LEFT JOIN children c ON s.child_id = c.child_id
      ORDER BY s.screened_at DESC LIMIT 5
    `);
    const trendData = all(`
      SELECT substr(screened_at,1,10) AS date, status, COUNT(*) AS count
      FROM screenings
      GROUP BY substr(screened_at,1,10), status
      ORDER BY date DESC LIMIT 90
    `);
    return { totalChildren, totalScreenings, statusCounts, recentScreenings, trendData };
  },

  getDoctorsByArea(area) {
    if (!area) return all("SELECT * FROM doctors");
    return all("SELECT * FROM doctors WHERE area = ?", [area]);
  },

  getAllAreas() {
    return all("SELECT DISTINCT area FROM doctors");
  },
};
