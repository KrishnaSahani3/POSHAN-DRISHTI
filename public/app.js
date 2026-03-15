/* ─────────────────────────────────────────────────────────
   POSHAN DRISTRI — Frontend App (app.js)
   SPA navigation, API calls, Chart.js charts
───────────────────────────────────────────────────────── */

const API = "";   // same origin

// ─── SPA Navigation ──────────────────────────────────────
let authToken = null;
let currentMobileNo = "";

function showPage(name) {
  // Enforce login
  if (!authToken && name !== "login") {
    name = "login";
  }

  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = document.getElementById("page-" + name);
  if (target) target.classList.add("active");

  // Toggle app shell visibility
  const appShell = document.querySelector(".app-shell");
  if (name === "login") {
    document.querySelector(".icon-sidebar").style.display = "none";
    document.querySelector(".topnav").style.display = "none";
    document.querySelector(".main-content").style.marginLeft = "0";
    document.querySelector(".main-content").style.marginTop = "0";
  } else {
    document.querySelector(".icon-sidebar").style.display = "flex";
    document.querySelector(".topnav").style.display = "flex";
    document.querySelector(".main-content").style.marginLeft = "var(--sidebar-w)";
    document.querySelector(".main-content").style.marginTop = "var(--topnav-h)";
  }

  // top nav active
  document.querySelectorAll(".topnav-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.page === name);
  });
  // icon nav active
  document.querySelectorAll(".icon-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.page === name);
  });

  // Lazy-load page data
  if (name === "dashboard") loadDashboard();
  if (name === "history") loadHistory();
}

// ─── Auth (OTP Login) ────────────────────────────────────
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const step1 = document.getElementById("loginStep1");
  const step2 = document.getElementById("loginStep2");
  const errorEl = document.getElementById("loginError");
  errorEl.style.display = "none";

  if (!currentMobileNo) {
    // Send OTP
    const btn = step1.querySelector("button");
    currentMobileNo = document.getElementById("login_mobile").value.trim();
    if (!currentMobileNo) return;
    btn.textContent = "Sending..."; btn.disabled = true;
    try {
      const res = await fetch(`${API}/api/auth/send-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_no: currentMobileNo })
      });
      const data = await res.json();
      btn.textContent = "Send OTP"; btn.disabled = false;
      if (data.success) {
        step1.style.display = "none";
        step2.style.display = "block";
        document.getElementById("login_otp").focus();
      } else throw new Error(data.error);
    } catch (err) {
      btn.textContent = "Send OTP"; btn.disabled = false;
      currentMobileNo = "";
      errorEl.textContent = "⚠ " + err.message;
      errorEl.style.display = "block";
    }
  } else {
    // Verify OTP
    const btn = document.getElementById("verifyOtpBtn");
    const otp = document.getElementById("login_otp").value.trim();
    if (!otp) return;
    btn.textContent = "Verifying..."; btn.disabled = true;
    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_no: currentMobileNo, otp })
      });
      const data = await res.json();
      btn.textContent = "Verify & Login"; btn.disabled = false;
      if (data.success) {
        authToken = data.token;
        document.getElementById("login_mobile").value = "";
        document.getElementById("login_otp").value = "";
        step1.style.display = "block";
        step2.style.display = "none";
        currentMobileNo = "";
        showPage("dashboard");
      } else throw new Error(data.error);
    } catch (err) {
      btn.textContent = "Verify & Login"; btn.disabled = false;
      errorEl.textContent = "⚠ " + err.message;
      errorEl.style.display = "block";
    }
  }
});

document.getElementById("verifyOtpBtn")?.addEventListener("click", () => {
  document.getElementById("loginForm").dispatchEvent(new Event("submit"));
});

document.querySelectorAll("[data-page]").forEach(el => {
  el.addEventListener("click", () => showPage(el.dataset.page));
});

// ─── Charts ──────────────────────────────────────────────
let donutChart = null;
let trendChart = null;

function buildDonut(statusCounts) {
  const order = ["SAM", "MAM", "At-Risk", "Normal"];
  const colors = { SAM: "#ef4444", MAM: "#f59e42", "At-Risk": "#f5c542", Normal: "#34c48b" };
  const counts = order.map(s => (statusCounts.find(x => x.status === s) || { count: 0 }).count);

  const ctx = document.getElementById("donutChart").getContext("2d");
  if (donutChart) donutChart.destroy();
  donutChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: order,
      datasets: [{ data: counts, backgroundColor: order.map(s => colors[s]), borderWidth: 0, hoverOffset: 6 }]
    },
    options: {
      cutout: "70%",
      plugins: { legend: { display: false } },
      animation: { animateScale: true }
    }
  });

  // Legend
  const leg = document.getElementById("donutLegend");
  leg.innerHTML = order.map((s, i) => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${colors[s]}"></div>
      <span>${s}</span>
      <span style="margin-left:auto;font-weight:700;color:var(--text-dark)">${counts[i]}</span>
    </div>`).join("");
}

function buildTrend(trendData) {
  // Aggregate by date
  const dateMap = {};
  trendData.forEach(({ date, status, count }) => {
    if (!dateMap[date]) dateMap[date] = { SAM: 0, MAM: 0, "At-Risk": 0, Normal: 0 };
    dateMap[date][status] = Number(count);
  });

  const dates = Object.keys(dateMap).sort().slice(-14);
  const colors = { SAM: "#ef4444", MAM: "#f59e42", "At-Risk": "#f5c542", Normal: "#34c48b" };
  const bgColors = { SAM: "rgba(239,68,68,0.12)", MAM: "rgba(245,158,66,0.12)", "At-Risk": "rgba(245,197,66,0.12)", Normal: "rgba(52,196,139,0.12)" };

  const datasets = ["Normal", "At-Risk", "MAM", "SAM"].map(status => ({
    label: status,
    data: dates.map(d => dateMap[d]?.[status] || 0),
    borderColor: colors[status],
    backgroundColor: bgColors[status],
    fill: true,
    tension: 0.4,
    pointRadius: 4,
    pointBackgroundColor: colors[status],
    borderWidth: 2,
  }));

  const ctx = document.getElementById("trendChart").getContext("2d");
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(ctx, {
    type: "line",
    data: { labels: dates, datasets },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: { usePointStyle: true, pointStyle: "circle", font: { size: 11 }, boxWidth: 8, padding: 14 }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#9b97b8" } },
        y: { grid: { color: "rgba(200,195,230,0.18)" }, ticks: { font: { size: 11 }, color: "#9b97b8", stepSize: 1 }, beginAtZero: true }
      }
    }
  });
}

// ─── Dashboard ───────────────────────────────────────────
async function loadDashboard() {
  try {
    const res = await fetch(`${API}/api/analytics`);
    const data = await res.json();
    if (!data.success) return;

    const { totalChildren, totalScreenings, statusCounts, recentScreenings, trendData } = data;

    // Stats
    document.getElementById("totalChildren").textContent = totalChildren;
    document.getElementById("totalScreenings")?.textContent ?? "";

    const get = status => (statusCounts.find(s => s.status === status) || { count: 0 }).count;
    document.getElementById("samCount").textContent = get("SAM");
    document.getElementById("normalCount").textContent = get("Normal");
    document.getElementById("atRiskCount").textContent = get("MAM") + get("At-Risk");
    document.getElementById("totalScreeningsLabel").textContent = `${totalScreenings} total`;

    // Status list
    const list = document.getElementById("statusListCards");
    const statusDefs = [
      { key: "SAM", cls: "si-sam", label: "SAM — Severe" },
      { key: "MAM", cls: "si-mam", label: "MAM — Moderate" },
      { key: "At-Risk", cls: "si-atrisk", label: "At-Risk" },
      { key: "Normal", cls: "si-normal", label: "Normal" },
    ];
    list.innerHTML = statusDefs.map(s => `
      <div class="status-item ${s.cls}">
        <div class="si-dot"></div>
        <div class="si-label">${s.label}</div>
        <div class="si-count">${get(s.key)}</div>
      </div>`).join("");

    // Recent children
    const childList = document.getElementById("recentChildrenList");
    const avatarColors = ["#7c5cfc", "#34c48b", "#f59e42", "#4a90d9", "#ef4444", "#a07cfc"];
    childList.innerHTML = recentScreenings.slice(0, 5).map((s, i) => `
      <div class="child-item" onclick="openChildDetails('${s.child_id}')" style="cursor:pointer" title="View Details">
        <div class="child-avatar" style="background:${avatarColors[i % avatarColors.length]}">
          ${(s.name || "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <div class="ci-name">${s.name || s.child_id}</div>
          <div class="ci-village">${s.village || "—"} · ${s.screened_at ? s.screened_at.slice(0, 10) : ""}</div>
        </div>
        <span class="ci-status-badge badge-${s.status}">${s.status}</span>
      </div>`).join("") || `<div class="tbl-loading">No data yet</div>`;

    // Alerts (SAM only)
    const samCases = recentScreenings.filter(s => s.status === "SAM");
    const alertBadge = document.getElementById("alertCount");
    const alertsList = document.getElementById("alertsList");
    alertBadge.textContent = samCases.length;
    alertsList.innerHTML = samCases.length ? samCases.map(s => `
      <div class="alert-item">
        <span>🚨</span>
        <div>
          <div class="alert-name">${s.name || s.child_id}</div>
          <div class="alert-detail">${s.village || ""} · MUAC ${s.muac_cm} cm</div>
        </div>
      </div>`).join("") : `<div class="no-alerts">✅ No critical cases</div>`;

    // Charts
    buildDonut(statusCounts);
    if (trendData && trendData.length) buildTrend(trendData);

  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}

// ─── History ─────────────────────────────────────────────
let allScreenings = [];

async function loadHistory() {
  const tbody = document.getElementById("historyTable");
  tbody.innerHTML = `<tr><td colspan="9" class="tbl-loading">Loading…</td></tr>`;
  try {
    const res = await fetch(`${API}/api/screenings`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    allScreenings = data.screenings;
    renderHistory(allScreenings);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="tbl-loading" style="color:var(--red)">Error: ${err.message}</td></tr>`;
  }
}

function renderHistory(rows) {
  const tbody = document.getElementById("historyTable");
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="tbl-loading">No screenings found.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map((s, i) => `
    <tr onclick="openChildDetails('${s.child_id}')" style="cursor:pointer" title="View Details">
      <td style="color:var(--text-light)">${i + 1}</td>
      <td><code style="font-size:12px;color:var(--purple)">${s.child_id}</code></td>
      <td><strong>${s.name || "—"}</strong></td>
      <td>${s.village || "—"}</td>
      <td>${s.age_months}</td>
      <td>${s.muac_cm} cm</td>
      <td style="font-weight:600;color:${s.wfa_zscore < -2 ? "var(--red)" : "var(--text-dark)"}">${s.wfa_zscore}</td>
      <td><span class="status-chip chip-${s.status}">${s.status}</span></td>
      <td style="color:var(--text-light);font-size:12px">${s.screened_at ? s.screened_at.slice(0, 16) : "—"}</td>
    </tr>`).join("");
}

// Search + Filter
function applyHistoryFilter() {
  const q = document.getElementById("historySearch").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;
  let rows = allScreenings;
  if (status) rows = rows.filter(r => r.status === status);
  if (q) rows = rows.filter(r =>
    (r.name || "").toLowerCase().includes(q) ||
    (r.village || "").toLowerCase().includes(q) ||
    (r.child_id || "").toLowerCase().includes(q)
  );
  renderHistory(rows);
}

document.getElementById("historySearch")?.addEventListener("input", applyHistoryFilter);
document.getElementById("statusFilter")?.addEventListener("change", applyHistoryFilter);
document.getElementById("refreshHistory")?.addEventListener("click", loadHistory);

// ─── MUAC Guide Toggle ────────────────────────────────────
document.getElementById("muacHelpBtn")?.addEventListener("click", () => {
  const box = document.getElementById("muacGuideBox");
  const btn = document.getElementById("muacHelpBtn");
  const isOpen = box.style.display !== "none";
  box.style.display = isOpen ? "none" : "block";
  btn.textContent = isOpen ? "📏 कैसे मापें?" : "✖ बंद करें";
});

// ─── Screen Child ─────────────────────────────────────────
// Lookup child by ID
document.getElementById("lookupBtn")?.addEventListener("click", async () => {
  const cid = document.getElementById("screen_child_id").value.trim();
  const box = document.getElementById("childInfoBox");
  if (!cid) return;
  try {
    const res = await fetch(`${API}/api/children/${cid}`);
    const data = await res.json();
    box.style.display = "block";
    if (data.success && data.child) {
      box.style.borderLeftColor = "var(--green)";
      box.style.background = "var(--green-soft)";
      box.innerHTML = `<strong>✅ ${data.child.name}</strong> · ${data.child.village || "—"} · AWC: ${data.child.awc_name || "—"} · Guardian: ${data.child.guardian || "—"}`;
    } else {
      box.style.borderLeftColor = "var(--red)";
      box.style.background = "var(--red-soft)";
      box.innerHTML = `❌ Child <strong>${cid}</strong> not found. <a href="#" data-page="register" style="color:var(--purple)">Register them first →</a>`;
      box.querySelector("a")?.addEventListener("click", e => { e.preventDefault(); showPage("register"); });
    }
  } catch { box.style.display = "none"; }
});

// Quick Classify (no save)
document.getElementById("quickClassifyBtn")?.addEventListener("click", async () => {
  const payload = buildMeasurementPayload(false);
  if (!payload) return;
  try {
    const res = await fetch(`${API}/api/classify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!data.success) throw new Error(data.details ? data.details.join(", ") : data.error);
    showResult(data.classification, payload.muac_cm);
    hideError("screenError");
  } catch (err) { showError("screenError", err.message); }
});

// Full classify + save
document.getElementById("screenForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = buildMeasurementPayload(true);
  if (!payload) return;
  const btn = document.getElementById("screenForm").querySelector(".btn-primary");
  btn.textContent = "Saving…"; btn.disabled = true;
  try {
    const res = await fetch(`${API}/api/screenings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    btn.textContent = "Classify & Save to DB"; btn.disabled = false;
    if (!data.success) throw new Error(data.details ? data.details.join(", ") : data.error);
    showResult(data.classification, payload.muac_cm);
    hideError("screenError");
  } catch (err) {
    btn.textContent = "Classify & Save to DB"; btn.disabled = false;
    showError("screenError", err.message);
  }
});

function buildMeasurementPayload(withChildId) {
  const age_months = parseFloat(document.getElementById("age_months").value);
  const weight_kg = parseFloat(document.getElementById("weight_kg").value);
  const height_cm = parseFloat(document.getElementById("height_cm").value);
  const muac_cm = parseFloat(document.getElementById("muac_cm").value);
  if ([age_months, weight_kg, height_cm, muac_cm].some(isNaN)) {
    showError("screenError", "Please fill in all measurement fields.");
    return null;
  }
  const payload = { age_months, weight_kg, height_cm, muac_cm };
  if (withChildId) {
    payload.child_id = document.getElementById("screen_child_id").value.trim();
    payload.screened_by = document.getElementById("screened_by").value.trim() || "ANM/ASHA";
  }
  return payload;
}

function showResult(cls, muac) {
  const card = document.getElementById("resultCard");
  const banner = document.getElementById("resultBanner");
  card.style.display = "flex";
  card.scrollIntoView({ behavior: "smooth", block: "start" });

  const emojiMap = { SAM: "🚨", MAM: "⚡", "At-Risk": "🔔", Normal: "✅" };
  const bannerMap = { SAM: "banner-red", MAM: "banner-orange", "At-Risk": "banner-yellow", Normal: "banner-green" };
  const urgencyMap = { immediate: "🔴 Immediate Action", monitor: "🟡 Monitor Closely", routine: "🟢 Routine Care" };

  banner.className = "result-banner " + bannerMap[cls.status];
  document.getElementById("resultEmoji").textContent = emojiMap[cls.status];
  document.getElementById("resultStatus").textContent = cls.status;
  document.getElementById("resultUrgency").textContent = urgencyMap[cls.urgency];
  document.getElementById("wfaScore").textContent = cls.wfa_zscore;
  document.getElementById("hfaScore").textContent = cls.hfa_zscore;
  document.getElementById("muacDisplay").textContent = muac + " cm";
  document.getElementById("resultRec").textContent = cls.recommendation;

  // MUAC needle — map muac 10–16+ to 0–100%
  const pct = Math.min(Math.max(((muac - 10) / (16 - 10)) * 100, 2), 98);
  document.getElementById("muacMarker").style.left = pct + "%";
}

// ─── Register Child ───────────────────────────────────────
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    name: document.getElementById("reg_name").value.trim(),
    gender: document.getElementById("reg_gender").value,
    village: document.getElementById("reg_village").value.trim(),
    awc_name: document.getElementById("reg_awc").value.trim(),
    guardian: document.getElementById("reg_parent").value.trim(),
    parent_name: document.getElementById("reg_parent").value.trim(),
    mobile_no: document.getElementById("reg_mobile").value.trim(),
  };
  if (!payload.name) { showError("registerError", "Child name is required."); return; }

  const btn = document.getElementById("registerForm").querySelector(".btn-primary");
  btn.textContent = "Registering…"; btn.disabled = true;

  try {
    const res = await fetch(`${API}/api/children`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    btn.textContent = "Register Child"; btn.disabled = false;
    if (!data.success) throw new Error(data.error);
    const box = document.getElementById("registerSuccess");
    box.style.display = "block";
    box.innerHTML = `✅ <strong>${data.child.name}</strong> registered! Child ID: <strong>${data.child.child_id}</strong> — Use this ID on the Screening page.`;
    hideError("registerError");
    document.getElementById("registerForm").reset();
  } catch (err) {
    btn.textContent = "Register Child"; btn.disabled = false;
    showError("registerError", err.message);
    document.getElementById("registerSuccess").style.display = "none";
  }
});

// ─── Helpers ─────────────────────────────────────────────
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.style.display = "block"; el.textContent = "⚠ " + msg; }
}
function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

// ─── Init ────────────────────────────────────────────────
showPage("dashboard");

// ═══════════════════════════════════════════════════════════
// ─── AI IMAGE DETECTION ─────────────────────────────────
// ═══════════════════════════════════════════════════════════

const aiInput = document.getElementById("aiImageInput");
const aiZone = document.getElementById("aiUploadZone");
const aiPreview = document.getElementById("aiPreviewImg");
const aiAnalyzeWrap = document.getElementById("aiAnalyzeWrap");
const aiResultPanel = document.getElementById("aiResultPanel");

// Select button
document.getElementById("aiSelectBtn")?.addEventListener("click", () => aiInput.click());

// File input change
aiInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) previewAIImage(file);
});

// Drag & Drop
aiZone?.addEventListener("dragover", (e) => { e.preventDefault(); aiZone.classList.add("drag-over"); });
aiZone?.addEventListener("dragleave", () => aiZone.classList.remove("drag-over"));
aiZone?.addEventListener("drop", (e) => {
  e.preventDefault();
  aiZone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) previewAIImage(file);
});
aiZone?.addEventListener("click", (e) => {
  if (e.target === aiZone || e.target.classList.contains("ai-upload-icon") ||
    e.target.classList.contains("ai-upload-title") || e.target.classList.contains("ai-upload-sub"))
    aiInput.click();
});

function previewAIImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    aiPreview.src = e.target.result;
    aiPreview.style.display = "block";
    aiAnalyzeWrap.style.display = "block";
    aiResultPanel.style.display = "none";
    aiZone.style.display = "none";
  };
  reader.readAsDataURL(file);
}

// Analyse button
document.getElementById("aiAnalyzeBtn")?.addEventListener("click", () => {
  const age = parseFloat(document.getElementById("ai_age").value) || 18;
  const muac = parseFloat(document.getElementById("ai_muac").value) || null;

  // Show spinner
  const resultPanel = document.getElementById("aiResultPanel");
  resultPanel.style.display = "flex";
  resultPanel.innerHTML = `<div class="ai-spinner">Analysing image using AI model…</div>`;

  // Simulate AI processing (realistic 2.5s delay)
  setTimeout(() => {
    const result = simulateAIAnalysis(age, muac);
    renderAIResult(result);
  }, 2500);
});

/**
 * Simulates AI analysis of child image.
 * In production, this would call a real ML model endpoint (TF.js or remote API).
 * Currently uses MUAC input + age + probabilistic heuristics for realistic demo.
 */
function simulateAIAnalysis(age, muac) {
  // Base detection on MUAC if provided, otherwise simulate random-but-realistic
  let status, confidence, indicators;

  if (muac !== null) {
    if (muac < 11.5) status = "SAM";
    else if (muac < 12.5) status = "MAM";
    else if (muac < 13.5) status = "At-Risk";
    else status = "Normal";
    confidence = 82 + Math.floor(Math.random() * 14); // 82-95%
  } else {
    // Probabilistic based on age range (young children more at risk in demo)
    const rand = Math.random();
    if (age < 12) status = rand < 0.3 ? "SAM" : rand < 0.55 ? "MAM" : rand < 0.7 ? "At-Risk" : "Normal";
    else if (age < 24) status = rand < 0.2 ? "SAM" : rand < 0.4 ? "MAM" : rand < 0.6 ? "At-Risk" : "Normal";
    else status = rand < 0.1 ? "SAM" : rand < 0.25 ? "MAM" : rand < 0.45 ? "At-Risk" : "Normal";
    confidence = 64 + Math.floor(Math.random() * 22); // 64-85%
  }

  const indicatorsByStatus = {
    SAM: [
      { label: "Severe visible wasting of arm and face muscles", cls: "found" },
      { label: "Prominent rib and clavicle bones visible", cls: "found" },
      { label: "Skin-fold thinning detected (upper arm region)", cls: "found" },
      { label: "Reduced skin turgor / possible oedema signs", cls: "moderate" },
      { label: "Hair depigmentation (flag sign)", cls: "moderate" },
    ],
    MAM: [
      { label: "Moderate arm muscle wasting detected", cls: "moderate" },
      { label: "Slight rib prominence observed", cls: "moderate" },
      { label: "Mild skin-fold reduction (upper arm)", cls: "moderate" },
      { label: "No severe oedema detected", cls: "ok" },
      { label: "Hair and skin colour within range", cls: "ok" },
    ],
    "At-Risk": [
      { label: "Mild subcutaneous fat reduction", cls: "moderate" },
      { label: "Arm circumference slightly low for age", cls: "moderate" },
      { label: "No visible wasting detected", cls: "ok" },
      { label: "Skin and hair appearance normal", cls: "ok" },
      { label: "Facial fullness within normal range", cls: "ok" },
    ],
    Normal: [
      { label: "Good arm muscle mass detected", cls: "ok" },
      { label: "Visible fat folds — healthy subcutaneous tissue", cls: "ok" },
      { label: "No wasting or oedema signs", cls: "ok" },
      { label: "Hair and skin appearance healthy", cls: "ok" },
      { label: "Facial fullness age-appropriate", cls: "ok" },
    ],
  };

  return { status, confidence, indicators: indicatorsByStatus[status] };
}

function renderAIResult({ status, confidence, indicators }) {
  const emojiMap = { SAM: "🚨", MAM: "⚡", "At-Risk": "🔔", Normal: "✅" };
  const bannerMap = { SAM: "banner-red", MAM: "banner-orange", "At-Risk": "banner-yellow", Normal: "banner-green" };
  const recMap = {
    SAM: "⚠️ AI detected severe acute malnutrition signs. Refer to nearest NRC immediately. Confirm with physical MUAC measurement.",
    MAM: "⚡ AI detected moderate wasting. Enroll in SNP programme. Monitor MUAC every 2 weeks.",
    "At-Risk": "🔔 Child shows early risk signs. Increase caloric intake. Follow up in 4 weeks.",
    Normal: "✅ No malnutrition signs detected. Continue routine care and monthly growth monitoring.",
  };

  const panel = document.getElementById("aiResultPanel");
  panel.innerHTML = `
    <div class="result-banner ${bannerMap[status]}" id="aiResultBanner">
      <div class="result-big-emoji">${emojiMap[status]}</div>
      <div class="result-status-text">${status}</div>
      <div class="result-urgency-chip">AI Confidence: ${confidence}%</div>
    </div>
    <div class="white-card" style="margin-top:0">
      <div class="card-title" style="margin-bottom:12px">🔍 Visual Indicators Detected</div>
      <div class="ai-indicators-list">
        ${indicators.map(ind => `
          <div class="ai-indicator-item ${ind.cls}">
            <span>${ind.cls === "found" ? "🔴" : ind.cls === "moderate" ? "🟡" : "🟢"}</span>
            <span>${ind.label}</span>
          </div>`).join("")}
      </div>
    </div>
    <div class="recommendation-box">${recMap[status]}</div>
    <div class="white-card" style="background:var(--blue-soft);border:none;font-size:12px;color:var(--text-mid);margin-top:0">
      ⚠️ <strong>Note:</strong> AI detection is a screening aid only. Always confirm with physical MUAC measurement and a trained health worker.
    </div>`;
  panel.style.display = "flex";
  panel.style.animation = "fadeIn 0.35s ease";
}

// ═══════════════════════════════════════════════════════════
// ─── BALANCED DIET PLAN ──────────────────────────────────
// ═══════════════════════════════════════════════════════════

function getDietData(status) {
  // Normalize status key: 'SAM' -> 'sam', 'MAM' -> 'mam', 'At-Risk' -> 'atRisk', 'Normal' -> 'normal'
  const keyMap = { "SAM": "sam", "MAM": "mam", "At-Risk": "atRisk", "Normal": "normal" };
  const s = keyMap[status];

  const lang = window.I18N.current || "en";
  const langDict = window.I18N.langs[lang] || window.I18N.langs["en"];
  let d = langDict.diet ? langDict.diet[s] : null;

  // Fallback to English for missing parts
  const enD = window.I18N.langs["en"].diet[s];
  if (!d) d = enD;
  else if (!d.c1) d = { ...enD, ...d }; // Merge translated headers over english cards

  return d;
}

// ─── LANGUAGE SWITCHER ───────────────────────────────────
document.getElementById("langSelect")?.addEventListener("change", (e) => {
  window.I18N.current = e.target.value;
  applyTranslations();
  // Re-render diet if on diet page
  const activeDietTab = document.querySelector(".diet-tab.active");
  if (activeDietTab && document.getElementById("page-diet").classList.contains("active")) {
    renderDiet(activeDietTab.dataset.status);
  }
});

function applyTranslations() {
  const langData = window.I18N.langs[window.I18N.current] || window.I18N.langs["en"];

  // Top Nav Items
  const navBtns = document.querySelectorAll(".topnav-btn");
  navBtns.forEach(btn => {
    const page = btn.dataset.page;
    if (page === "dashboard") btn.textContent = langData.nav.dash;
    if (page === "register") btn.textContent = langData.nav.reg;
    if (page === "screen") btn.textContent = langData.nav.scr;
    if (page === "history") btn.textContent = langData.nav.prog;
    if (page === "aidetect") btn.textContent = langData.nav.ai;
    if (page === "diet") btn.textContent = langData.nav.diet;
  });

  // UI labels updates based on availability
  if (langData.ui) {
    const totalScreeningsLabel = document.getElementById("totalScreeningsLabel");
    if (totalScreeningsLabel && totalScreeningsLabel.closest(".card-header-row")) {
      const titleSpan = totalScreeningsLabel.closest(".card-header-row").querySelector(".card-title");
      if (titleSpan) titleSpan.textContent = langData.ui.stats;
    }
    const historySearch = document.getElementById("historySearch");
    if (historySearch) historySearch.placeholder = langData.ui.search;
  }
}

// Apply initial translations on load
applyTranslations();


function renderDiet(status) {
  try {
    const d = getDietData(status);
    if (!d) return;
    const content = document.getElementById("dietContent");
    if (!content) return;

    const emojiMap = { "SAM": "🚨", "MAM": "⚡", "At-Risk": "🔔", "Normal": "✅" };
    const cards = [d.c1, d.c2, d.c3].filter(Boolean);

    content.innerHTML = `
      <div class="diet-header-card diet-${status}">
        <div class="diet-header-emoji">${emojiMap[status] || "🥗"}</div>
        <div class="diet-header-info">
          <h2>${d.hl || ""}</h2>
          <p>${d.desc || ""}</p>
        </div>
      </div>

      <div class="diet-grid">
        ${cards.map((card, idx) => `
          <div class="diet-card">
            <div class="diet-card-icon">${["🥣", "🥛", "🛡️"][idx % 3]}</div>
            <div class="diet-card-title">${card.t || ""}</div>
            <ul class="diet-card-items">
              ${(card.i || []).map(item => `<li>${item}</li>`).join("")}
            </ul>
          </div>`).join("")}
      </div>`;
  } catch (e) {
    console.error("renderDiet error:", e);
  }
}

// Diet Tab Clicks
document.getElementById("dietTabRow")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".diet-tab");
  if (!btn) return;
  document.querySelectorAll(".diet-tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  renderDiet(btn.dataset.status);
});

// Auto-render SAM diet on page load of diet tab
const origShowPage = showPage;
// Patch showPage to also init diet
const _origShowPage = showPage;
function showPagePatched(name) {
  _origShowPage(name);
  if (name === "diet") renderDiet("SAM");
}
document.querySelectorAll("[data-page]").forEach(el => {
  el.removeEventListener("click", () => { });
});
document.querySelectorAll("[data-page]").forEach(el => {
  el.addEventListener("click", () => showPagePatched(el.dataset.page));
});

// ─── CHILD DETAILS MODAL ─────────────────────────────────
async function openChildDetails(child_id) {
  const modal = document.getElementById("childDetailsModal");
  const nameEl = document.getElementById("cdName");
  const metaEl = document.getElementById("cdMeta");
  const avatarEl = document.getElementById("cdAvatar");
  const statusEl = document.getElementById("cdCurrentStatus");
  const timelineEl = document.getElementById("cdTimeline");

  // Reset / Loading State
  nameEl.textContent = "Loading...";
  metaEl.textContent = child_id;
  timelineEl.innerHTML = "<div class='tbl-loading'>Retrieving history...</div>";
  statusEl.style.display = "none";
  modal.style.display = "flex";

  try {
    const res = await fetch(`${API}/api/children/${child_id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to load child data");

    const child = data.child;
    const history = data.screenings || [];

    // Populate Profile
    nameEl.textContent = child.name || "Unknown";
    const villageStr = child.village ? child.village + " · " : "";
    const awcStr = child.awc_name ? "AWC: " + child.awc_name : "";
    metaEl.textContent = `${child_id} | ${villageStr}${awcStr}`;
    avatarEl.textContent = (child.name || "C").charAt(0).toUpperCase();

    // Parent & Mobile
    const parentEl = document.getElementById("cdParent");
    const mobileEl = document.getElementById("cdMobile");
    parentEl.textContent = child.parent_name ? "👨‍👩‍👧 " + child.parent_name : "👨‍👩‍👧 —";
    mobileEl.textContent = child.mobile_no ? "📞 " + child.mobile_no : "📞 —";

    // Latest status badge
    if (history.length > 0) {
      const latest = history[0]; // ordered DESC by API
      statusEl.textContent = latest.status;
      statusEl.className = `cd-status-badge badge-${latest.status}`;
      statusEl.style.display = "block";
    }

    // Populate Timeline
    if (history.length === 0) {
      timelineEl.innerHTML = "<div class='tbl-loading'>No screening records found.</div>";
    } else {
      timelineEl.innerHTML = history.map(s => `
        <div class="timeline-item">
          <div class="tl-dot"></div>
          <div class="tl-content">
            <div class="tl-header">
              <span class="tl-date">${s.screened_at ? new Date(s.screened_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
              <span class="tl-status badge-${s.status}">${s.status}</span>
            </div>
            <div class="tl-metrics">
              <div class="tl-metric">
                <span class="tl-metric-lbl">Age</span>
                <span class="tl-metric-val">${s.age_months} months</span>
              </div>
              <div class="tl-metric">
                <span class="tl-metric-lbl">Weight</span>
                <span class="tl-metric-val">${s.weight_kg} kg</span>
              </div>
              <div class="tl-metric">
                <span class="tl-metric-lbl">Height</span>
                <span class="tl-metric-val">${s.height_cm} cm</span>
              </div>
              <div class="tl-metric">
                <span class="tl-metric-lbl">MUAC</span>
                <span class="tl-metric-val">${s.muac_cm} cm</span>
              </div>
              <div class="tl-metric">
                <span class="tl-metric-lbl">Z-Score (WFA)</span>
                <span class="tl-metric-val" style="color:${s.wfa_zscore < -2 ? 'var(--red)' : 'inherit'}">${s.wfa_zscore}</span>
              </div>
            </div>
          </div>
        </div>
      `).join("");
    }
  } catch (err) {
    nameEl.textContent = "Error";
    timelineEl.innerHTML = `<div class='tbl-loading' style='color:var(--red)'>${err.message}</div>`;
  }
}

function closeChildDetailsModal() {
  document.getElementById("childDetailsModal").style.display = "none";
}

// Close modal when clicking overlay background
document.getElementById("childDetailsModal")?.addEventListener("click", e => {
  if (e.target.id === "childDetailsModal") closeChildDetailsModal();
});

