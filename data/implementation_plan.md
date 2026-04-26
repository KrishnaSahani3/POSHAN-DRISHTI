# Fix AI Health Score Prediction Timing

The user noticed that the AI (TensorFlow.js Risk Score) appears to predict a child's health score *before* they have actually typed in the MUAC or uploaded a photo. This makes the score seem fake or unresponsive to the photo upload since it's already showing a value.

## Proposed Changes

### 1. Update [js/ai.js](file:///C:/Users/Brijesh/Desktop/HACKTHON/js/ai.js) (TFModel.predictRisk)
Currently, [predictRisk()](file:///C:/Users/Brijesh/Desktop/HACKTHON/js/ai.js#155-188) falls back to calculating a score even if `muac` and `weight` are 0, or it might be called with partial data that triggers a high-risk SAM classification immediately.

#### [MODIFY] js/ai.js
- Enhance the initial validation check inside `TFModel.predictRisk`.
- If MUAC is 0 AND (Weight is 0 OR Height is 0), it should explicitly return an "unknown" state rather than attempting to calculate a mathematical health score.
- This ensures the dial stays flat at "—" until real data (either typed MUAC or a MediaPipe estimated MUAC from a photo) is available.

### 2. Update [register.html](file:///C:/Users/Brijesh/Desktop/HACKTHON/register.html) (updateLiveClassify)
Currently, [updateLiveClassify()](file:///C:/Users/Brijesh/Desktop/HACKTHON/register.html#234-256) is triggered on `oninput` for the text fields, and it also calls `TFModel.predictRisk()`. 

#### [MODIFY] register.html
- We need to handle the `unknown` risk state returned by `TFModel.predictRisk` properly in the UI. 
- If the score is 0 or risk is 'unknown', we should clear the progress bar and show a "Waiting for input..." message rather than showing a red SAM badge prematurely.
- When [handlePhoto()](file:///C:/Users/Brijesh/Desktop/HACKTHON/register.html#275-299) finishes running MediaPipe, it should explicitly trigger a visual update of the TF Health Score to show the user that the *photo* directly influenced the new MUAC and Health Score.

### 3. Update [js/ai.js](file:///C:/Users/Brijesh/Desktop/HACKTHON/js/ai.js) (Accuracy Improvements)
- Refine the mathematical weights in `TFModel.predictRisk` so the health score reflects reality more accurately. 
- Ensure that age influences the risk appropriately.
- If MUAC < 11.5cm (SAM), the score should automatically tank below 35% (High Risk) regardless of BMI or symptoms.
- If MUAC > 12.5cm but BMI is low, it should still map correctly to MAM (Moderate Risk).
- Adjust the normalization bounds so that edge cases do not result in overconfident "100%" healthy scores when symptoms exist.

## Verification Plan
1. Open the registration page.
2. Confirm the Health Score is completely blank/waiting (no premature red/green score).
3. Type a name and age. The score should still be waiting.
4. Upload a photo of an arm.
5. MediaPipe should extract the MUAC, populate the field, and **then** the Health Score dial should light up with the correct score.
