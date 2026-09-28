# Dispatch for Remediation Worker: Remediation & Quality Engineer

- Role: Remediation & Quality Engineer
- Working Directory: d:\HACKATHON\.agents\teamwork_preview_worker_remediation_1
- Original Request: d:\HACKATHON\.agents\ORIGINAL_REQUEST.md
- Project Scope: d:\HACKATHON\.agents\teamwork_preview_orchestrator_1\PROJECT.md
- Gate Fail Reports:
  - Reviewer 1 Report: `d:\HACKATHON\.agents\teamwork_preview_reviewer_1\handoff.md`
  - Challenger 2 Report: `d:\HACKATHON\.agents\teamwork_preview_challenger_2\handoff.md`

## Assignment
Execute the 4 required remediation items to resolve the Gate Failures:

1. **Scene PNG Outer Perimeter Pure White (#FFFFFF) Isolation**:
   - In `d:\HACKATHON\presentation_assets\`, process all 6 scene PNGs (`scene1_crisis.png` through `scene6_authority_endorsement.png`).
   - Ensure that 100% of outer perimeter pixels ($x=0, 1023; y=0, 1023$) and the 5-pixel outer margin band are strictly pure white `#FFFFFF` `(255, 255, 255)` with zero artwork bleed.
   - Run `pytest tests/test_stress_math_and_assets.py -k "Perimeter or WhiteBackground"` to ensure 100% pass.

2. **PPTX Word Count Condensation (Target: 690–820 total words)**:
   - In `build_deck.py`, refactor text payloads to use the concise bullet points from `slide_deck_condensed.json` (max 10-14 words per bullet, 2-3 bullets per card).
   - Remove redundant banners (e.g. 21-word telemetry badge box on Slide 1) and trim verbose dialogue while preserving the exact core lines.
   - Ensure the total text frame word count in `SIH2026-ASHA-Presentation-Optimized.pptx` is strictly between **690 and 820 words**.
   - Preserve all 4 mathematical formulas verbatim, all 10 technical metrics, all clinical first-aid facts, all 3 preserved app mockups on Slides 2, 3, 5, and the official SIH blue footer on every slide.

3. **Slide Ribbon Thumbnail Collisions**:
   - In `build_deck.py`, set `margin_right = Inches(2.10)` on Slide 4 (`Rounded Rectangle 5`) and Slide 6 (`Rounded Rectangle 4`) so text wraps before reaching the thumbnail images.

4. **Update Automated Test Assertions**:
   - In `tests/test_presentation_transformation.py`, update `test_total_deck_word_count_bounds` and slide-by-slide word count tests to parse `self.prs` directly (`sum(len(shape.text.split()) for s in self.prs.slides for shape in s.shapes if shape.has_text_frame)`) asserting bounds $690 \le words \le 820$.
   - Update `PRESENTATION_TRANSFORMATION_MASTER_GUIDE.md` to reflect the exact verified word counts.

5. **Empirical Verification**:
   - Run `python build_deck.py`
   - Run `pytest tests/test_presentation_transformation.py -v`
   - Run `pytest tests/test_stress_math_and_assets.py -v`
   - Run `pytest tests/test_adversarial_geometry.py -v`
   - Verify all tests pass with 100% success.

6. Deliver handoff.md in your working directory and notify parent.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-13T12:51:02Z
You are the Remediation & Quality Engineer.
Working Directory: d:\HACKATHON\.agents\teamwork_preview_worker_remediation_1
Original Request: d:\HACKATHON\.agents\ORIGINAL_REQUEST.md
Project Scope: d:\HACKATHON\.agents\teamwork_preview_orchestrator_1\PROJECT.md
Dispatch Instructions: d:\HACKATHON\.agents\teamwork_preview_worker_remediation_1\DISPATCH.md
Gate Failure Evidence:
- Reviewer 1 Handoff: d:\HACKATHON\.agents\teamwork_preview_reviewer_1\handoff.md
- Challenger 2 Handoff: d:\HACKATHON\.agents\teamwork_preview_challenger_2\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL USER MANDATES TO PRESERVE:
1. STRICTLY PRESERVE all existing website and app image mockups on Slides 2, 3, 5 (mockup_slide2_citizen_pwa.png, mockup_slide3_first_aid_sheet.png, mockup_slide5_searched_reservation.png).
2. KEEP DIALOGUES SHORT & PUNCHY (<12-15 words) with genuine emotional expression.
3. STORYBOOK MINI-STORIES: Keep the cute character interactions (including ghost beds on hospital portals).
4. SIH OFFICIAL BLUE FOOTER: Keep the blue rectangle (#0070C0) on EVERY slide with centered "@SIH Idea submission- Template" and slide number.

Your task:
1. Re-pad / process the 6 scene PNGs in d:\HACKATHON\presentation_assets\ with a solid pure white #FFFFFF border so 100% of outer perimeter pixels (x=0, 1023; y=0, 1023) and a 5-pixel margin band are pure white (255, 255, 255). Ensure tests/test_stress_math_and_assets.py perimeter tests pass.
2. In build_deck.py, condense text payloads using the concise bullets from slide_deck_condensed.json so the generated presentation d:\HACKATHON\SIH2026-ASHA-Presentation-Optimized.pptx contains strictly between 690 and 820 words.
3. In build_deck.py, set margin_right = Inches(2.10) on Slide 4 and Slide 6 bottom ribbons to avoid image collisions.
4. In tests/test_presentation_transformation.py, update word count tests to inspect self.prs directly (the actual PPTX text frames) asserting bounds 690 <= words <= 820.
5. In database.py, ensure geofence evaluation includes float tolerance (epsilon 1e-4) or millimeter rounding.
6. Re-generate presentation, run all test suites (test_presentation_transformation.py, test_stress_math_and_assets.py, test_adversarial_geometry.py, test_gemini_prompts_and_visual_assets.py), ensure 100% pass.
7. Deliver handoff.md in your working directory and notify parent.
