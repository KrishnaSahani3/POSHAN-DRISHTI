/**
 * @fileoverview POSHAN DRISTRI — Full Express REST API + Static Frontend Server
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const { classifyChild } = require("./classifyChild");
const database = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ─── Validation ───────────────────────────────────────────────────────────────
function validateMeasurements(body) {
  const errors = [];
  const { age_months, weight_kg, height_cm, muac_cm } = body;
  if (age_months === undefined) errors.push("age_months is required");
  else if (typeof age_months !== "number" || age_months < 0 || age_months > 60)
    errors.push("age_months must be 0–60");
  if (weight_kg === undefined) errors.push("weight_kg is required");
  else if (typeof weight_kg !== "number" || weight_kg <= 0 || weight_kg > 50)
    errors.push("weight_kg must be a positive number");
  if (height_cm === undefined) errors.push("height_cm is required");
  else if (typeof height_cm !== "number" || height_cm <= 0 || height_cm > 130)
    errors.push("height_cm must be a positive number");
  if (muac_cm === undefined) errors.push("muac_cm is required");
  else if (typeof muac_cm !== "number" || muac_cm <= 0 || muac_cm > 30)
    errors.push("muac_cm must be a positive number");
  return { valid: errors.length === 0, errors };
}

// ─── Health & Meta ───────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "POSHAN DRISTRI API is running", version: "2.0.0", timestamp: new Date().toISOString() });
});

app.get("/api/stats", (_req, res) => {
  res.json({
    success: true,
    classification_thresholds: {
      SAM: { muac_cm: "< 11.5", wfa_zscore: "< -3", color: "red", urgency: "immediate" },
      MAM: { muac_cm: "11.5 – 12.5", wfa_zscore: "-3 to -2", color: "orange", urgency: "monitor" },
      "At-Risk": { muac_cm: "12.5 – 13.5", wfa_zscore: "-2 to -1.5", color: "yellow", urgency: "monitor" },
      Normal: { muac_cm: "> 13.5", wfa_zscore: "> -1.5", color: "green", urgency: "routine" },
    },
    source: "WHO Child Growth Standards (0–60 months)",
  });
});

// ─── Auth (Simulated OTP) ──────────────────────────────────────────────────────
app.post("/api/auth/send-otp", (req, res) => {
  const { mobile_no } = req.body;
  if (!mobile_no) return res.status(400).json({ success: false, error: "Mobile number required" });
  // Simulating sending an OTP
  res.json({ success: true, message: "OTP sent", test_otp: "1234" });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { mobile_no, otp } = req.body;
  if (otp === "1234") {
    res.json({ success: true, token: "mock_token_" + Date.now() });
  } else {
    res.status(401).json({ success: false, error: "Invalid OTP" });
  }
});

// ─── Children ─────────────────────────────────────────────────────────────────
app.get("/api/children", (_req, res) => {
  try {
    res.json({ success: true, children: database.getAllChildren() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/api/children/:child_id", (req, res) => {
  try {
    const child = database.getChildById(req.params.child_id);
    if (!child) return res.status(404).json({ success: false, error: "Child not found" });
    const screenings = database.getScreeningsByChild(req.params.child_id);
    res.json({ success: true, child, screenings });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/children", (req, res) => {
  try {
    const { name, gender, village, awc_name, guardian, parent_name, mobile_no } = req.body;
    if (!name) return res.status(400).json({ success: false, error: "Child name is required" });
    const child_id = database.genChildId();
    const child = database.createChild({ child_id, name, gender, village, awc_name, guardian, parent_name, mobile_no });
    res.status(201).json({ success: true, child });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── Classify (no save) ───────────────────────────────────────────────────────
app.post("/api/classify", (req, res) => {
  try {
    const { child_id, age_months, weight_kg, height_cm, muac_cm } = req.body;
    const { valid, errors } = validateMeasurements({ age_months, weight_kg, height_cm, muac_cm });
    if (!valid) return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    const result = classifyChild({ age_months, weight_kg, height_cm, muac_cm });
    res.json({ success: true, child_id: child_id || null, input: { age_months, weight_kg, height_cm, muac_cm }, classification: result, classified_at: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/classify/batch", (req, res) => {
  try {
    const { children } = req.body;
    if (!Array.isArray(children) || children.length === 0)
      return res.status(400).json({ success: false, error: "children array required" });
    if (children.length > 100)
      return res.status(400).json({ success: false, error: "Batch max 100" });
    const results = [], errors = [];
    children.forEach((child, index) => {
      const { child_id, age_months, weight_kg, height_cm, muac_cm } = child;
      const v = validateMeasurements({ age_months, weight_kg, height_cm, muac_cm });
      if (!v.valid) { errors.push({ index, child_id, errors: v.errors }); }
      else {
        const classification = classifyChild({ age_months, weight_kg, height_cm, muac_cm });
        results.push({ index, child_id, input: { age_months, weight_kg, height_cm, muac_cm }, classification });
      }
    });
    const summary = results.reduce((a, r) => { a[r.classification.status] = (a[r.classification.status] || 0) + 1; return a; }, {});
    res.json({ success: true, total: children.length, classified: results.length, failed: errors.length, summary, results, validation_errors: errors.length ? errors : undefined, classified_at: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── Screenings (classify + save) ────────────────────────────────────────────
app.get("/api/screenings", (_req, res) => {
  try {
    res.json({ success: true, screenings: database.getAllScreenings() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/api/screenings/:child_id", (req, res) => {
  try {
    res.json({ success: true, screenings: database.getScreeningsByChild(req.params.child_id) });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/screenings", (req, res) => {
  try {
    const { child_id, age_months, weight_kg, height_cm, muac_cm, screened_by } = req.body;
    if (!child_id) return res.status(400).json({ success: false, error: "child_id is required" });
    const child = database.getChildById(child_id);
    if (!child) return res.status(404).json({ success: false, error: `Child ${child_id} not found. Register the child first.` });
    const { valid, errors } = validateMeasurements({ age_months, weight_kg, height_cm, muac_cm });
    if (!valid) return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    const result = classifyChild({ age_months, weight_kg, height_cm, muac_cm });
    const screening = database.saveScreening({ child_id, age_months, weight_kg, height_cm, muac_cm, ...result, screened_by });
    res.status(201).json({ success: true, child, input: { age_months, weight_kg, height_cm, muac_cm }, classification: result, screening_id: screening ? screening.id : null, saved_at: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── Analytics ────────────────────────────────────────────────────────────────
app.get("/api/analytics", (_req, res) => {
  try {
    res.json({ success: true, ...database.getAnalytics() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found", available_routes: ["GET /api/health", "GET /api/stats", "GET /api/children", "POST /api/children", "GET /api/children/:id", "POST /api/classify", "POST /api/classify/batch", "GET /api/screenings", "POST /api/screenings", "GET /api/screenings/:child_id", "GET /api/analytics"] });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: err.message });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
database.initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 POSHAN DRISTRI running at http://localhost:${PORT}`);
    console.log(`   Dashboard: http://localhost:${PORT}`);
    console.log(`   API:       http://localhost:${PORT}/api/health\n`);
  });
}).catch(err => {
  console.error("Failed to initialize DB:", err);
  process.exit(1);
});

module.exports = app;
