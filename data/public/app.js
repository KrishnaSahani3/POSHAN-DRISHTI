/* ─────────────────────────────────────────────────────────
   POSHAN DRISHTI — Frontend App (app.js)
   SPA navigation, API calls, Chart.js charts
───────────────────────────────────────────────────────── */

const API = "";   // same origin

// ─── SPA Navigation ──────────────────────────────────────
let authToken = "demo-token"; // Set a demo token so pages are accessible during development
let currentMobileNo = "";

function showPage(name) {
  // Enforce login - temporarily relaxed for better UX during development
  if (!authToken && name !== "login") {
    name = "login";
  }

  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = document.getElementById("page-" + name);
  if (target) {
    target.classList.add("active");
    // Scroll to top
    window.scrollTo(0, 0);
  }

  // Toggle app shell visibility
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

  // update active states
  document.querySelectorAll(".topnav-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.page === name);
  });
  document.querySelectorAll(".icon-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.page === name);
  });

  // Lazy-load page data
  if (name === "dashboard") loadDashboard();
  if (name === "history") loadHistory();
  if (name === "diet") renderDiet("SAM");
}

// Global navigation listener
document.addEventListener("click", (e) => {
  const navEl = e.target.closest("[data-page]");
  if (navEl) {
    e.preventDefault();
    showPage(navEl.dataset.page);
  }
});

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

  // Doctor suggestions based on child area
  loadDoctorSuggestions();
}

async function loadDoctorSuggestions() {
  const cid = document.getElementById("screen_child_id").value.trim();
  const dsBox = document.getElementById("doctorSuggestions");
  const dList = document.getElementById("doctorList");
  
  if (!cid) {
    dsBox.style.display = "none";
    return;
  }

  try {
    const childRes = await fetch(`${API}/api/children/${cid}`);
    const childData = await childRes.json();
    if (!childData.success || !childData.child.village) {
      dsBox.style.display = "none";
      return;
    }

    const area = childData.child.village;
    const docRes = await fetch(`${API}/api/doctors?area=${encodeURIComponent(area)}`);
    const docData = await docRes.json();

    if (docData.success && docData.doctors.length > 0) {
      dsBox.style.display = "block";
      dList.innerHTML = docData.doctors.map(d => `
        <div class="doctor-card">
          <div class="dc-header">
            <span class="dc-name">${d.name}</span>
            <span class="dc-specialty">${d.specialty}</span>
          </div>
          <div class="dc-hospital">🏥 ${d.hospital || "General Hospital"}</div>
          <div class="dc-contact">📞 ${d.contact || "—"}</div>
          <div class="dc-availability">⏰ ${d.availability || "—"}</div>
        </div>
      `).join("");
    } else {
      // Fallback: search for all doctors if none in specific area
      const allDocRes = await fetch(`${API}/api/doctors`);
      const allDocData = await allDocRes.json();
      if (allDocData.success && allDocData.doctors.length > 0) {
        dsBox.style.display = "block";
        dList.innerHTML = `<div style="font-size:11px;color:var(--text-light);margin-bottom:8px">No doctors found in ${area}. Showing nearby specialists:</div>` + 
          allDocData.doctors.slice(0, 2).map(d => `
            <div class="doctor-card">
              <div class="dc-header">
                <span class="dc-name">${d.name}</span>
                <span class="dc-specialty">${d.specialty}</span>
              </div>
              <div class="dc-hospital">🏥 ${d.hospital || "General Hospital"}</div>
              <div class="dc-contact">📞 ${d.contact || "—"}</div>
              <div class="dc-availability">⏰ ${d.availability || "—"}</div>
            </div>
          `).join("");
      } else {
        dsBox.style.display = "none";
      }
    }
  } catch (err) {
    console.error("Error loading doctors:", err);
    dsBox.style.display = "none";
  }
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
    if (page === "bmicalc") btn.textContent = langData.nav.bmi || "⚖️ BMI Calc";
    if (page === "caloriecalc") btn.textContent = langData.nav.calorie || "🍱 Calorie Calc";
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

// ═══════════════════════════════════════════════════════════
// ─── BMI CALCULATOR ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════

document.getElementById("bmiForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const weight = parseFloat(document.getElementById("bmi_weight").value);
  const heightCm = parseFloat(document.getElementById("bmi_height").value);

  if (isNaN(weight) || isNaN(heightCm) || heightCm <= 0) {
    showError("bmiError", "Please enter valid weight and height values.");
    return;
  }
  hideError("bmiError");

  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  const bmiFixed = bmi.toFixed(1);

  let category, bannerClass, emoji, recommendation;

  if (bmi < 18.5) {
    category = "Underweight"; bannerClass = "banner-yellow"; emoji = "⚠️";
    recommendation = "You are underweight. Consult a nutritionist for a balanced weight-gain diet plan rich in proteins and healthy fats.";
  } else if (bmi < 25) {
    category = "Normal Weight"; bannerClass = "banner-green"; emoji = "✅";
    recommendation = "Excellent! You have a healthy body weight. Maintain a balanced diet and at least 30 minutes of physical activity daily.";
  } else if (bmi < 30) {
    category = "Overweight"; bannerClass = "banner-orange"; emoji = "⚡";
    recommendation = "You are overweight. Consider increasing physical activity and reducing refined carbohydrates and sugars from your diet.";
  } else if (bmi < 35) {
    category = "Obese (Class I)"; bannerClass = "banner-red"; emoji = "🚨";
    recommendation = "BMI indicates Class I obesity. Please consult a doctor for a personalized weight management plan.";
  } else if (bmi < 40) {
    category = "Obese (Class II)"; bannerClass = "banner-red"; emoji = "🚨";
    recommendation = "BMI indicates Class II obesity. Medical intervention is strongly recommended. Please see a healthcare professional.";
  } else {
    category = "Obese (Class III)"; bannerClass = "banner-red"; emoji = "🚨";
    recommendation = "BMI indicates severe (morbid) obesity. Immediate medical consultation is required.";
  }

  const card = document.getElementById("bmiResultCard");
  const banner = document.getElementById("bmiBanner");
  card.style.display = "flex";
  banner.className = "result-banner " + bannerClass;
  document.getElementById("bmiEmoji").textContent = emoji;
  document.getElementById("bmiValue").textContent = `BMI: ${bmiFixed}`;
  document.getElementById("bmiCategory").textContent = category;
  document.getElementById("bmiWeightDisplay").textContent = weight + " kg";
  document.getElementById("bmiHeightDisplay").textContent = heightCm + " cm";
  document.getElementById("bmiFinalValue").textContent = bmiFixed;
  document.getElementById("bmiRecommendation").textContent = recommendation;

  // BMI scale needle: map 16–40 to 0–98%
  const pct = Math.min(Math.max(((bmi - 16) / (40 - 16)) * 100, 2), 98);
  document.getElementById("bmiMarker").style.left = pct + "%";

  card.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.getElementById("bmiResetBtn")?.addEventListener("click", () => {
  document.getElementById("bmiForm").reset();
  document.getElementById("bmiResultCard").style.display = "none";
  hideError("bmiError");
});


// ═══════════════════════════════════════════════════════════
// ─── CALORIE CALCULATOR (AI IMAGE DETECTION) ─────────────
// ═══════════════════════════════════════════════════════════

// ─── Food Database ───────────────────────────────────────
const FOOD_DB = {
  // Grains & Staples
  "rice": { name: "Rice (cooked, 1 cup)", cal: 206, protein: 4.3, carbs: 44.5, fat: 0.4, emoji: "🍚" },
  "roti": { name: "Roti / Chapati (1 piece)", cal: 71, protein: 2.7, carbs: 14.5, fat: 0.9, emoji: "🫓" },
  "bread": { name: "Bread (1 slice)", cal: 79, protein: 2.7, carbs: 15.1, fat: 1.0, emoji: "🍞" },
  "pasta": { name: "Pasta (cooked, 1 cup)", cal: 220, protein: 8.1, carbs: 43.2, fat: 1.3, emoji: "🍝" },
  "noodles": { name: "Noodles (cooked, 1 cup)", cal: 210, protein: 7.5, carbs: 41.0, fat: 1.2, emoji: "🍜" },
  "idli": { name: "Idli (1 piece)", cal: 39, protein: 1.8, carbs: 7.9, fat: 0.2, emoji: "🫓" },
  "dosa": { name: "Dosa (1 piece)", cal: 133, protein: 3.6, carbs: 24.8, fat: 2.6, emoji: "🥞" },
  "poha": { name: "Poha (1 cup)", cal: 250, protein: 4.0, carbs: 48.0, fat: 5.0, emoji: "🍽️" },
  "upma": { name: "Upma (1 cup)", cal: 230, protein: 5.0, carbs: 42.0, fat: 5.5, emoji: "🍽️" },
  // Proteins
  "egg": { name: "Egg (1 whole, boiled)", cal: 78, protein: 6.3, carbs: 0.6, fat: 5.3, emoji: "🥚" },
  "chicken": { name: "Chicken (grilled, 100g)", cal: 165, protein: 31.0, carbs: 0, fat: 3.6, emoji: "🍗" },
  "fish": { name: "Fish (cooked, 100g)", cal: 136, protein: 26.0, carbs: 0, fat: 3.0, emoji: "🐟" },
  "dal": { name: "Dal / Lentils (1 cup)", cal: 230, protein: 17.9, carbs: 39.9, fat: 0.8, emoji: "🍲" },
  "paneer": { name: "Paneer (100g)", cal: 265, protein: 18.3, carbs: 1.2, fat: 20.8, emoji: "🧀" },
  "tofu": { name: "Tofu (100g)", cal: 76, protein: 8.0, carbs: 1.9, fat: 4.8, emoji: "🍱" },
  // Vegetables
  "salad": { name: "Green Salad (1 bowl)", cal: 20, protein: 1.5, carbs: 3.5, fat: 0.2, emoji: "🥗" },
  "potato": { name: "Potato (boiled, 100g)", cal: 87, protein: 1.9, carbs: 20.1, fat: 0.1, emoji: "🥔" },
  "carrot": { name: "Carrot (100g)", cal: 41, protein: 0.9, carbs: 9.6, fat: 0.2, emoji: "🥕" },
  "broccoli": { name: "Broccoli (100g)", cal: 34, protein: 2.8, carbs: 6.6, fat: 0.4, emoji: "🥦" },
  "spinach": { name: "Spinach (1 cup)", cal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, emoji: "🥬" },
  // Fruits
  "apple": { name: "Apple (1 medium)", cal: 95, protein: 0.5, carbs: 25.1, fat: 0.3, emoji: "🍎" },
  "banana": { name: "Banana (1 medium)", cal: 105, protein: 1.3, carbs: 27.0, fat: 0.4, emoji: "🍌" },
  "mango": { name: "Mango (1 cup)", cal: 99, protein: 1.4, carbs: 24.7, fat: 0.6, emoji: "🥭" },
  "orange": { name: "Orange (1 medium)", cal: 62, protein: 1.2, carbs: 15.4, fat: 0.2, emoji: "🍊" },
  "grapes": { name: "Grapes (1 cup)", cal: 104, protein: 1.1, carbs: 27.3, fat: 0.2, emoji: "🍇" },
  // Dairy
  "milk": { name: "Milk (1 glass, 250ml)", cal: 122, protein: 8.2, carbs: 11.7, fat: 4.8, emoji: "🥛" },
  "curd": { name: "Curd / Yogurt (1 cup)", cal: 100, protein: 8.5, carbs: 11.4, fat: 0.7, emoji: "🍶" },
  "butter": { name: "Butter (1 tbsp)", cal: 102, protein: 0.1, carbs: 0, fat: 11.5, emoji: "🧈" },
  // Snacks & Fast Food
  "burger": { name: "Burger (1 piece)", cal: 354, protein: 17.0, carbs: 40.0, fat: 14.0, emoji: "🍔" },
  "pizza": { name: "Pizza (1 slice)", cal: 285, protein: 12.2, carbs: 35.7, fat: 10.4, emoji: "🍕" },
  "samosa": { name: "Samosa (1 piece)", cal: 308, protein: 6.2, carbs: 34.5, fat: 17.0, emoji: "🥟" },
  "pakora": { name: "Pakora (4 pieces)", cal: 160, protein: 4.5, carbs: 18.0, fat: 8.0, emoji: "🧆" },
  "chips": { name: "Chips (small pack)", cal: 160, protein: 2.0, carbs: 16.0, fat: 10.0, emoji: "🍟" },
  // Drinks
  "tea": { name: "Tea with milk & sugar", cal: 55, protein: 1.0, carbs: 10.0, fat: 1.5, emoji: "☕" },
  "coffee": { name: "Coffee (black)", cal: 5, protein: 0.3, carbs: 0, fat: 0, emoji: "☕" },
  "juice": { name: "Fruit Juice (1 glass)", cal: 110, protein: 0.5, carbs: 26.0, fat: 0.3, emoji: "🧃" },
  "lassi": { name: "Lassi (1 glass)", cal: 150, protein: 6.0, carbs: 22.0, fat: 4.0, emoji: "🥤" },
};

// ─── Image food detection simulation groups ─────────────────
const FOOD_IMAGE_SCENARIOS = [
  { label: "Indian Thali",       foods: ["rice", "roti", "dal", "curd", "salad"] },
  { label: "Healthy Breakfast",  foods: ["egg", "bread", "milk", "banana"] },
  { label: "Street Food",        foods: ["samosa", "pakora", "tea"] },
  { label: "Fruit Bowl",         foods: ["apple", "banana", "mango", "grapes"] },
  { label: "Fast Food Meal",     foods: ["burger", "chips", "juice"] },
  { label: "South Indian Meal",  foods: ["idli", "dosa", "curd", "tea"] },
  { label: "Vegetable Sabzi",    foods: ["potato", "spinach", "carrot", "roti"] },
  { label: "Protein Meal",       foods: ["chicken", "egg", "salad", "rice"] },
];

let calorieDetectedFoods = [];
let calorieManualFoods = [];

// ─── Upload zone ────────────────────────────────────────────
const calInput   = document.getElementById("calImageInput");
const calZone    = document.getElementById("calUploadZone");
const calPreview = document.getElementById("calPreviewImg");
const calAnalyzeWrap = document.getElementById("calAnalyzeWrap");

document.getElementById("calSelectBtn")?.addEventListener("click", () => calInput?.click());

calInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) previewCalImage(file);
});

calZone?.addEventListener("dragover", (e) => { e.preventDefault(); calZone.classList.add("drag-over"); });
calZone?.addEventListener("dragleave", () => calZone.classList.remove("drag-over"));
calZone?.addEventListener("drop", (e) => {
  e.preventDefault();
  calZone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) previewCalImage(file);
});
calZone?.addEventListener("click", (e) => {
  if (e.target === calZone || e.target.classList.contains("ai-upload-icon") ||
    e.target.classList.contains("ai-upload-title") || e.target.classList.contains("ai-upload-sub"))
    calInput?.click();
});

function previewCalImage(file) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    calPreview.src = ev.target.result;
    calPreview.style.display = "block";
    calAnalyzeWrap.style.display = "flex";
    calZone.style.display = "none";
    document.getElementById("calResultSection").style.display = "none";
    calorieDetectedFoods = [];
  };
  reader.readAsDataURL(file);
}

// ─── Smart Food Detection ─────────────────────────────────
/**
 * Step 1: Check filename for food keyword matches against FOOD_DB.
 * Step 2: Analyse image dominant color via Canvas API.
 * Step 3: Combine signals → ranked food list.
 * Results shown as "Suggestions" (honest about demo limitation).
 */
document.getElementById("calDetectBtn")?.addEventListener("click", () => {
  const btn = document.getElementById("calDetectBtn");
  btn.textContent = "🔍 Analysing image…"; btn.disabled = true;
  const spinner = document.getElementById("calDetectSpinner");
  spinner.style.display = "block";

  // ── Signal 1: filename keyword matching ──────────────────
  const fileName = (calInput?.files[0]?.name || "").toLowerCase().replace(/[_\-\.]/g, " ");
  const filenameHits = [];
  for (const [key, food] of Object.entries(FOOD_DB)) {
    const aliases = [key, ...food.name.toLowerCase().split(/[\s,()/]+/)];
    if (aliases.some(a => a.length > 2 && fileName.includes(a))) {
      filenameHits.push(key);
    }
  }

  // ── Signal 2: Canvas color analysis ─────────────────────
  analyzeImageDominantColor(calPreview, (color) => {
    const { r, g, b } = color;

    // Map dominant color → food category weights
    // Each category: [keys], score
    const colorGroups = [];

    const isGreen   = g > r + 20 && g > b + 20;
    const isRed     = r > g + 30 && r > b + 30;
    const isOrange  = r > 160 && g > 80 && g < 180 && b < 80;
    const isYellow  = r > 180 && g > 160 && b < 100;
    const isBrown   = r > 100 && g > 60 && g < 140 && b < 80 && r > g;
    const isWhite   = r > 200 && g > 200 && b > 200;
    const isDark    = r < 80  && g < 80  && b < 80;

    if (isGreen)  colorGroups.push({ label: "Vegetable Plate", foods: ["salad", "broccoli", "spinach", "carrot"] });
    if (isRed)    colorGroups.push({ label: "Fruit & Tomato",  foods: ["apple", "mango", "orange", "juice"] });
    if (isOrange) colorGroups.push({ label: "Fruit Snack",     foods: ["mango", "carrot", "orange", "banana"] });
    if (isYellow) colorGroups.push({ label: "Indian Staple",   foods: ["roti", "dal", "rice", "curd"] });
    if (isBrown)  colorGroups.push({ label: "Cooked Meal",     foods: ["chicken", "rice", "dal", "egg", "roti"] });
    if (isWhite)  colorGroups.push({ label: "Dairy / Rice",    foods: ["milk", "curd", "rice", "egg", "idli"] });
    if (isDark)   colorGroups.push({ label: "Dark Food",       foods: ["coffee", "tea", "dal", "chicken"] });

    // ── Signal 3: Merge & rank ───────────────────────────────
    let finalFoods, label;

    if (filenameHits.length >= 1) {
      // Filename is the strongest signal — trust it first
      finalFoods = [...new Set([...filenameHits, ...(colorGroups[0]?.foods || [])])].slice(0, 5);
      label = "🔑 Filename + Image Analysis";
    } else if (colorGroups.length > 0) {
      // Fall back to color analysis
      const group = colorGroups[0];
      finalFoods = group.foods;
      label = `🎨 Color Analysis: ${group.label}`;
    } else {
      // Last resort: balanced Indian meal as neutral default
      finalFoods = ["rice", "dal", "roti", "salad"];
      label = "🍽️ General Meal Estimate";
    }

    calorieDetectedFoods = finalFoods.filter(k => FOOD_DB[k]).map(key => ({ key, qty: 1 }));

    btn.textContent = "🤖 Re-Analyse Photo"; btn.disabled = false;
    spinner.style.display = "none";

    renderCalorieDetectedList();
    document.getElementById("calResultSection").style.display = "block";
    document.getElementById("calScenarioLabel").textContent =
      `⚠️ Suggestions (${label}) — edit below to correct`;
    recalculateCalories();
    document.getElementById("calResultSection").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/**
 * Draws image onto a 16×16 canvas and returns average RGB.
 * Lightweight proxy for dominant color.
 */
function analyzeImageDominantColor(imgEl, callback) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 16; canvas.height = 16;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgEl, 0, 0, 16, 16);
    const data = ctx.getImageData(0, 0, 16, 16).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
    }
    callback({ r: r / count, g: g / count, b: b / count });
  } catch {
    // Canvas tainted (cross-origin) — fall back to filename only
    callback({ r: 128, g: 128, b: 128 });
  }
}


function renderCalorieDetectedList() {
  const container = document.getElementById("calDetectedFoods");
  if (!calorieDetectedFoods.length) {
    container.innerHTML = `<div class="tbl-loading">No foods detected yet. Upload a photo or search manually.</div>`;
    return;
  }
  container.innerHTML = calorieDetectedFoods.map((item, idx) => {
    const f = FOOD_DB[item.key];
    if (!f) return "";
    return `
      <div class="cal-food-item" id="cfood-${idx}">
        <div class="cfi-emoji">${f.emoji}</div>
        <div class="cfi-info">
          <div class="cfi-name">${f.name}</div>
          <div class="cfi-cals">${Math.round(f.cal * item.qty)} kcal</div>
        </div>
        <div class="cfi-qty">
          <button class="cfi-qty-btn" onclick="changeCalFoodQty(${idx}, -1)">−</button>
          <span class="cfi-qty-val">${item.qty}x</span>
          <button class="cfi-qty-btn" onclick="changeCalFoodQty(${idx}, 1)">+</button>
        </div>
        <button class="cfi-remove-btn" onclick="removeCalFood(${idx})" title="Remove">✕</button>
      </div>`;
  }).join("");
}

function changeCalFoodQty(idx, delta) {
  calorieDetectedFoods[idx].qty = Math.max(1, calorieDetectedFoods[idx].qty + delta);
  renderCalorieDetectedList();
  recalculateCalories();
}

function removeCalFood(idx) {
  calorieDetectedFoods.splice(idx, 1);
  renderCalorieDetectedList();
  recalculateCalories();
}

// ─── Manual Search ──────────────────────────────────────────
document.getElementById("calSearchInput")?.addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  const results = document.getElementById("calSearchResults");
  if (!q) { results.innerHTML = ""; results.style.display = "none"; return; }

  const matches = Object.entries(FOOD_DB).filter(([key, f]) =>
    key.includes(q) || f.name.toLowerCase().includes(q)
  ).slice(0, 8);

  if (!matches.length) { results.innerHTML = "<div class='cal-search-item'>No results found</div>"; results.style.display = "block"; return; }
  results.style.display = "block";
  results.innerHTML = matches.map(([key, f]) => `
    <div class="cal-search-item" onclick="addCalFood('${key}')">
      <span>${f.emoji} ${f.name}</span>
      <span class="csi-cal">${f.cal} kcal</span>
    </div>`).join("");
});

function addCalFood(key) {
  const existing = calorieDetectedFoods.find(i => i.key === key);
  if (existing) { existing.qty++; }
  else calorieDetectedFoods.push({ key, qty: 1 });

  document.getElementById("calSearchInput").value = "";
  document.getElementById("calSearchResults").innerHTML = "";
  document.getElementById("calSearchResults").style.display = "none";
  document.getElementById("calResultSection").style.display = "block";
  renderCalorieDetectedList();
  recalculateCalories();
}

// ─── Totals ─────────────────────────────────────────────────
function recalculateCalories() {
  let totalCal = 0, totalProt = 0, totalCarbs = 0, totalFat = 0;
  calorieDetectedFoods.forEach(({ key, qty }) => {
    const f = FOOD_DB[key];
    if (!f) return;
    totalCal   += f.cal * qty;
    totalProt  += f.protein * qty;
    totalCarbs += f.carbs * qty;
    totalFat   += f.fat * qty;
  });

  document.getElementById("calTotalKcal").textContent = Math.round(totalCal);
  document.getElementById("calTotalProt").textContent = totalProt.toFixed(1) + "g";
  document.getElementById("calTotalCarbs").textContent = totalCarbs.toFixed(1) + "g";
  document.getElementById("calTotalFat").textContent  = totalFat.toFixed(1) + "g";

  // Calorie budget rating (based on 2000 kcal/day avg)
  const pct = Math.min((totalCal / 2000) * 100, 100);
  document.getElementById("calBudgetBar").style.width = pct + "%";
  const barEl = document.getElementById("calBudgetBar");
  if (pct < 40)       barEl.style.background = "var(--blue, #4a90d9)";
  else if (pct < 80)  barEl.style.background = "#34c48b";
  else if (pct < 100) barEl.style.background = "#f59e42";
  else                barEl.style.background = "#ef4444";

  document.getElementById("calBudgetLabel").textContent =
    `${Math.round(totalCal)} / 2000 kcal (${Math.round(pct)}% of daily intake)`;

  renderBestFoodSuggestions(totalCal, totalProt, totalCarbs, totalFat);
}

// ─── Best Food Suggestions Engine ──────────────────────────────
// Daily reference targets (avg adult):  Cal 2000, Protein 50g, Carbs 275g, Fat 65g
const DAILY_TARGETS = { cal: 2000, protein: 50, carbs: 275, fat: 65 };

function renderBestFoodSuggestions(totalCal, totalProt, totalCarbs, totalFat) {
  const container = document.getElementById("calBestFoods");
  if (!container) return;

  const gaps = {
    protein: Math.max(0, (DAILY_TARGETS.protein - totalProt)  / DAILY_TARGETS.protein),
    carbs:   Math.max(0, (DAILY_TARGETS.carbs   - totalCarbs) / DAILY_TARGETS.carbs),
    fat:     Math.max(0, (DAILY_TARGETS.fat     - totalFat)   / DAILY_TARGETS.fat),
    cal:     Math.max(0, (DAILY_TARGETS.cal     - totalCal)   / DAILY_TARGETS.cal),
  };

  const [weakMacro, weakGapFraction] = Object.entries(gaps).sort((a, b) => b[1] - a[1])[0];

  if (weakGapFraction < 0.10) {
    container.innerHTML = `
      <div class="best-foods-header">
        <span class="bf-icon">🏆</span>
        <div>
          <div class="bf-title">Great balance!</div>
          <div class="bf-sub">Your meal covers all macros well. Stay hydrated 💧</div>
        </div>
      </div>`;
    return;
  }

  const alreadyAdded = new Set(calorieDetectedFoods.map(i => i.key));
  const ranked = Object.entries(FOOD_DB)
    .filter(([key]) => !alreadyAdded.has(key))
    .map(([key, food]) => {
      const value      = food[weakMacro] ?? 0;
      const efficiency = food.cal > 0 ? (value / food.cal) * 100 : 0;
      return { key, food, value, efficiency };
    })
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 3);

  const META = {
    protein: { label: "Protein",       emoji: "💪", color: "#4a90d9", unit: "g",    tip: "Builds muscle & keeps you full" },
    carbs:   { label: "Carbs",         emoji: "⚡", color: "#f59e42", unit: "g",    tip: "Primary energy source for the body" },
    fat:     { label: "Healthy Fats",  emoji: "🥑", color: "#34c48b", unit: "g",    tip: "Essential for brain & hormone health" },
    cal:     { label: "Calories",      emoji: "🔥", color: "#ef4444", unit: " kcal",tip: "You need more energy for the day" },
  };
  const m = META[weakMacro];

  container.innerHTML = `
    <div class="best-foods-header">
      <span class="bf-icon">${m.emoji}</span>
      <div>
        <div class="bf-title">Best to add for <span style="color:${m.color}">${m.label}</span></div>
        <div class="bf-sub">${m.tip} &nbsp;·&nbsp; ${Math.round(weakGapFraction * 100)}% of daily ${m.label} still needed</div>
      </div>
    </div>
    <div class="bf-list">
      ${ranked.map(({ key, food, value }) => `
        <div class="bf-item">
          <span class="bf-emoji">${food.emoji}</span>
          <div class="bf-info">
            <div class="bf-food-name">${food.name}</div>
            <div class="bf-macros">
              <span style="color:${m.color};font-weight:700">${value}${m.unit} ${m.label}</span>
              <span class="bf-dot">&middot;</span>
              <span>${food.cal} kcal</span>
            </div>
          </div>
          <button class="bf-add-btn" onclick="addCalFood('${key}')">+ Add</button>
        </div>`).join("")}
    </div>`;
}

// ─── Reset ──────────────────────────────────────────────────
document.getElementById("calResetBtn")?.addEventListener("click", () => {
  calorieDetectedFoods = [];
  calPreview.style.display = "none";
  calZone.style.display = "block";
  calAnalyzeWrap.style.display = "none";
  document.getElementById("calResultSection").style.display = "none";
  document.getElementById("calSearchInput").value = "";
  document.getElementById("calSearchResults").innerHTML = "";
  document.getElementById("calSearchResults").style.display = "none";
  document.getElementById("calScenarioLabel").textContent = "";
  if (calInput) calInput.value = "";
});

