/**
 * @fileoverview Child nutritional status classifier based on WHO Child Growth Standards.
 * Uses MUAC (Mid-Upper Arm Circumference) and Weight-for-Age / Height-for-Age z-score approximations.
 */

/**
 * WHO Child Growth Standard median and SD reference values for Weight-for-Age (WFA).
 * Approximated using polynomial regression on WHO tables (0–60 months).
 * @param {number} age_months - Child's age in months (0–60)
 * @returns {{ median: number, sd: number }} Approximate median weight (kg) and SD
 */
function getWFAReference(age_months) {
  // Approximated median weight and SD from WHO WFA tables
  const age = Math.min(Math.max(age_months, 0), 60);
  const median = 3.3 + 0.19 * age - 0.001 * age * age;
  const sd = 0.4 + 0.015 * age;
  return { median, sd };
}

/**
 * WHO Child Growth Standard median and SD reference values for Height-for-Age (HFA).
 * Approximated using polynomial regression on WHO tables (0–60 months).
 * @param {number} age_months - Child's age in months (0–60)
 * @returns {{ median: number, sd: number }} Approximate median height (cm) and SD
 */
function getHFAReference(age_months) {
  const age = Math.min(Math.max(age_months, 0), 60);
  const median = 49.5 + 1.8 * age - 0.018 * age * age;
  const sd = 1.8 + 0.012 * age;
  return { median, sd };
}

/**
 * Classifies a child's nutritional status based on WHO Child Growth Standards.
 *
 * Classification hierarchy (most severe takes priority):
 * - **SAM** (Severe Acute Malnutrition): MUAC < 11.5 cm OR WFA z-score < -3
 * - **MAM** (Moderate Acute Malnutrition): MUAC 11.5–12.5 cm OR WFA z-score -3 to -2
 * - **At-Risk**: MUAC 12.5–13.5 cm OR WFA z-score -2 to -1.5
 * - **Normal**: All other cases
 *
 * @param {Object} data - Child anthropometric measurements
 * @param {number} data.age_months  - Age in months (0–60)
 * @param {number} data.weight_kg  - Weight in kilograms
 * @param {number} data.height_cm  - Height/length in centimetres
 * @param {number} data.muac_cm    - Mid-Upper Arm Circumference in centimetres
 *
 * @returns {{
 *   status: "SAM" | "MAM" | "At-Risk" | "Normal",
 *   color: "red" | "orange" | "yellow" | "green",
 *   wfa_zscore: number,
 *   hfa_zscore: number,
 *   recommendation: string,
 *   urgency: "immediate" | "monitor" | "routine"
 * }} Classification result
 *
 * @example
 * const result = classifyChild({ age_months: 18, weight_kg: 7.5, height_cm: 74, muac_cm: 11.0 });
 * // result.status → "SAM"
 */
function classifyChild(data) {
  const { age_months, weight_kg, height_cm, muac_cm } = data;

  // --- Compute z-scores ---
  const wfaRef = getWFAReference(age_months);
  const hfaRef = getHFAReference(age_months);

  const wfa_zscore = parseFloat(((weight_kg - wfaRef.median) / wfaRef.sd).toFixed(2));
  const hfa_zscore = parseFloat(((height_cm - hfaRef.median) / hfaRef.sd).toFixed(2));

  // --- Classify ---
  let status, color, recommendation, urgency;

  const isSAM = muac_cm < 11.5 || wfa_zscore < -3;
  const isMAM = !isSAM && (muac_cm < 12.5 || wfa_zscore < -2);
  const isAtRisk = !isSAM && !isMAM && (muac_cm < 13.5 || wfa_zscore < -1.5);

  if (isSAM) {
    status = "SAM";
    color = "red";
    urgency = "immediate";
    recommendation =
      "⚠️ Severe Acute Malnutrition detected. Refer the child immediately to the nearest Nutrition Rehabilitation Centre (NRC) or hospital. " +
      "Initiate therapeutic feeding (RUTF) if available. Conduct medical check for complications such as oedema, infection, or dehydration. " +
      "Do NOT wait — this is a medical emergency. Contact the nearest ASHA/ANM worker or health facility right away.";
  } else if (isMAM) {
    status = "MAM";
    color = "orange";
    urgency = "monitor";
    recommendation =
      "⚡ Moderate Acute Malnutrition detected. Enroll the child in a Supplementary Nutrition Programme (SNP) through the Anganwadi Centre. " +
      "Provide Ready-to-Use Supplementary Food (RUSF) or fortified blended food. Increase dietary diversity with energy-dense foods. " +
      "Schedule a follow-up in 2 weeks to track weight gain and MUAC improvement. Counsel the mother/caregiver on breastfeeding and complementary feeding practices.";
  } else if (isAtRisk) {
    status = "At-Risk";
    color = "yellow";
    urgency = "monitor";
    recommendation =
      "🔔 Child is at risk of malnutrition. Increase caloric and protein intake through locally available nutrient-rich foods (eggs, pulses, dairy). " +
      "Ensure timely immunisation is up to date. Encourage continued breastfeeding (if < 24 months). Monitor weight and MUAC monthly at the Anganwadi Centre. " +
      "Provide nutritional counseling to parents. If no improvement within 4 weeks, escalate to MAM protocol.";
  } else {
    status = "Normal";
    color = "green";
    urgency = "routine";
    recommendation =
      "✅ Child is in normal nutritional status. Continue balanced diet with adequate fruits, vegetables, proteins, and cereals. " +
      "Maintain routine health check-ups and immunisation schedule. Continue breastfeeding if < 24 months. " +
      "Visit Anganwadi Centre every month for growth monitoring. Encourage good hygiene and safe drinking water practices.";
  }

  return {
    status,
    color,
    wfa_zscore,
    hfa_zscore,
    recommendation,
    urgency,
  };
}

module.exports = { classifyChild };
