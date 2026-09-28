# Dispatch for Reviewer 1: Presentation & Content Reviewer

- Role: Presentation & Content Reviewer
- Working Directory: d:\HACKATHON\.agents\teamwork_preview_reviewer_1
- Original Request: d:\HACKATHON\.agents\ORIGINAL_REQUEST.md
- Project Scope: d:\HACKATHON\.agents\teamwork_preview_orchestrator_1\PROJECT.md

## Assignment
1. Review the generated presentation deck `d:\HACKATHON\SIH2026-ASHA-Presentation-Optimized.pptx` and `d:\HACKATHON\PRESENTATION_TRANSFORMATION_MASTER_GUIDE.md` against Requirement R1 and user mandates:
   - Exactly 6 slides, 16:9 widescreen format (13.333" x 7.500").
   - 50-60% text density reduction (total deck words between 690 and 820 words).
   - Strictly 1-2 lines per bullet with bold 2-4 word lead-ins, max 3-4 bullets per card.
   - Verbatim preservation of all 4 mathematical formulas ($B_{staffed}$, $R$, $S_{IP}$, Haversine 100m geofence).
   - Verbatim preservation of all technical metrics and clinical first-aid facts.
   - Strict preservation of the 3 existing website/app mockups on Slides 2, 3, and 5.
   - Presence of the official SIH blue footer bar (`#0070C0`) on EVERY SLIDE with centered `@SIH Idea submission- Template` and right-aligned slide numbers.
2. Execute the test suite via:
   `d:\HACKATHON\venv\Scripts\python.exe -m pytest d:\HACKATHON\tests\test_presentation_transformation.py -v`
3. Deliver handoff.md in your working directory with explicit verdict: `APPROVE` or `REQUEST_CHANGES`.

## 2026-09-13T12:43:17Z
You are Reviewer 1: Presentation & Content Reviewer.
Working Directory: d:\HACKATHON\.agents\teamwork_preview_reviewer_1
Original Request: d:\HACKATHON\.agents\ORIGINAL_REQUEST.md
Project Scope: d:\HACKATHON\.agents\teamwork_preview_orchestrator_1\PROJECT.md
Dispatch Instructions: d:\HACKATHON\.agents\teamwork_preview_reviewer_1\DISPATCH.md

Review d:\HACKATHON\SIH2026-ASHA-Presentation-Optimized.pptx, d:\HACKATHON\PRESENTATION_TRANSFORMATION_MASTER_GUIDE.md, and d:\HACKATHON\SLIDE_DECK_CONDENSED_SPEC.md against R1 and all user updates:
1. 6 slides, 16:9 widescreen, 50-60% text density reduction (690-820 words).
2. Verbatim preservation of all 4 formulas (B_staffed, R, S_IP, Haversine 100m geofence) and all technical/clinical metrics.
3. Strict preservation of the 3 existing website/app image mockups on Slides 2, 3, and 5.
4. Presence of official SIH blue footer bar (#0070C0) on EVERY slide with centered "@SIH Idea submission- Template" and right-aligned slide number.
5. Run the test suite: d:\HACKATHON\venv\Scripts\python.exe -m pytest d:\HACKATHON\tests\test_presentation_transformation.py -v
6. Deliver handoff.md with explicit verdict: APPROVE or REQUEST_CHANGES.
7. Notify parent when complete.
