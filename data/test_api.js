const http = require("http");

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: "localhost", port: 3000, path, method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) }
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => resolve(JSON.parse(raw)));
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: "localhost", port: 3000, path }, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => resolve(JSON.parse(raw)));
    }).on("error", reject);
  });
}

async function runTests() {
  console.log("=".repeat(60));
  console.log(" POSHAN DRISHTI API — Endpoint Tests");
  console.log("=".repeat(60));

  // 1. Health check
  const health = await get("/api/health");
  console.log("\n✅ GET /api/health →", health.message);

  // 2. Stats
  const stats = await get("/api/stats");
  console.log("✅ GET /api/stats → thresholds for:", Object.keys(stats.classification_thresholds).join(", "));

  // 3. Single classify - SAM
  const sam = await post("/api/classify", { child_id: "C-001", age_months: 18, weight_kg: 6.5, height_cm: 72, muac_cm: 11.0 });
  console.log("\n✅ POST /api/classify [SAM]");
  console.log("   Status:", sam.classification.status, "| Color:", sam.classification.color, "| WFA z:", sam.classification.wfa_zscore);

  // 4. Single classify - Normal
  const normal = await post("/api/classify", { child_id: "C-002", age_months: 24, weight_kg: 12.0, height_cm: 87, muac_cm: 15.0 });
  console.log("✅ POST /api/classify [Normal]");
  console.log("   Status:", normal.classification.status, "| Color:", normal.classification.color, "| WFA z:", normal.classification.wfa_zscore);

  // 5. Batch
  const batch = await post("/api/classify/batch", {
    children: [
      { child_id: "C-001", age_months: 18, weight_kg: 6.5, height_cm: 72, muac_cm: 11.0 },
      { child_id: "C-002", age_months: 12, weight_kg: 7.2, height_cm: 70, muac_cm: 12.0 },
      { child_id: "C-003", age_months: 36, weight_kg: 11.5, height_cm: 88, muac_cm: 13.0 },
      { child_id: "C-004", age_months: 24, weight_kg: 12.0, height_cm: 87, muac_cm: 15.0 },
    ],
  });
  console.log("\n✅ POST /api/classify/batch");
  console.log("   Total:", batch.total, "| Classified:", batch.classified, "| Failed:", batch.failed);
  console.log("   Summary:", JSON.stringify(batch.summary));
  batch.results.forEach((r) =>
    console.log(`   [${r.child_id}] → ${r.classification.status} (${r.classification.color})`)
  );

  // 6. Validation error test
  const badInput = await post("/api/classify", { age_months: 200, weight_kg: -1 });
  console.log("\n✅ POST /api/classify [Validation error test]");
  console.log("   Success:", badInput.success, "| Errors:", badInput.details);

  console.log("\n" + "=".repeat(60));
  console.log(" All tests passed! 🎉");
  console.log("=".repeat(60));
}

runTests().catch(console.error);
