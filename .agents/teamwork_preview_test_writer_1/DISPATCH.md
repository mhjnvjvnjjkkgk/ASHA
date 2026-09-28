# Dispatch for E2E Test Writer

- Role: E2E Testing Track Lead
- Working Directory: d:\HACKATHON\.agents\teamwork_preview_test_writer_1
- Original Request: d:\HACKATHON\.agents\ORIGINAL_REQUEST.md
- Project Scope: d:\HACKATHON\.agents\teamwork_preview_orchestrator_1\PROJECT.md

## Assignment
1. Design and implement the complete E2E testing infrastructure for the ASHA presentation transformation project in accordance with the 4-tier methodology:
   - Tier 1: Feature Coverage (F1 to F22, verifying slide condensation, formulas, metrics, triage, scenes, prompts, tokens)
   - Tier 2: Boundary & Corner Cases (word counts, font sizes, line counts, hex color formats, negative prompts, white background)
   - Tier 3: Cross-Feature Combinations (slide-to-scene mapping, character-to-dialogue consistency, formula-to-card placement)
   - Tier 4: Real-World Scenarios (Judge evaluation speed-read test, cognitive load assessment, clinical fidelity check)
2. Create the executable automated test runner in `d:\HACKATHON\tests\test_presentation_transformation.py` and run it via python.
3. Author `d:\HACKATHON\TEST_INFRA.md` at project root.
4. When test cases are implemented and ready, publish `d:\HACKATHON\TEST_READY.md` at project root with full coverage tables.
5. Provide handoff.md in your working directory and notify parent.

## 2026-09-13T12:18:54Z
You are the E2E Testing Track Lead.
Working Directory: d:\HACKATHON\.agents\teamwork_preview_test_writer_1
Original Request: d:\HACKATHON\.agents\ORIGINAL_REQUEST.md
Project Scope: d:\HACKATHON\.agents\teamwork_preview_orchestrator_1\PROJECT.md
Dispatch Instructions: d:\HACKATHON\.agents\teamwork_preview_test_writer_1\DISPATCH.md

Your task:
1. Design the comprehensive 4-tier E2E testing infrastructure for the ASHA presentation transformation project:
   - Tier 1: Feature Coverage (Features F1 through F22, testing slide text reduction, formula preservation, metrics preservation, 4 personas, 5 scenes, dialogue bubbles, Gemini prompt tokens).
   - Tier 2: Boundary & Corner Cases (word count bounds 690-820, line count <= 2 per bullet, <= 4 bullets per card, hex color format checks, pure white background #FFFFFF check, negative exclusions).
   - Tier 3: Cross-Feature Interactions (slide-to-scene mapping, persona-to-dialogue consistency, formula-to-card placement).
   - Tier 4: Real-World Scenarios (Judge 3-minute evaluation scan, cognitive load test, clinical accuracy).
2. Author d:\HACKATHON\TEST_INFRA.md following the specification in PROJECT.md.
3. Write the automated test suite in d:\HACKATHON\tests\test_presentation_transformation.py using Python unittest or pytest.
4. Execute the test runner, ensure it runs cleanly, and publish d:\HACKATHON\TEST_READY.md when test infrastructure is ready.
5. Deliver handoff.md in your working directory and notify parent when complete.

## 2026-09-13T12:21:55Z
**Context**: CRITICAL USER REQUIREMENT UPDATE - Website Mockup Preservation
**Content**: The user has explicitly mandated: "please tell the orchestrator to keep the image mockups of the website that we have already".
1. STRICTLY PRESERVE all existing website and app image mockups in the presentation deck (specifically the 3 mobile mockup containers on Slide 2, Slide 3, and Slide 5 displaying the citizen app ashaien.vercel.app, the Situational First-Aid sheet, and the hospital ER desk ashait-admin.vercel.app).
2. DO NOT delete, displace, or replace these existing product mockups.
3. The new vector cartoon story illustrations, condensed bullet points, and flowcharts must be positioned in harmony alongside these existing mockups, keeping the existing mobile mockup containers intact.
**Action**: Add test cases in all 4 tiers verifying that existing website/app image mockups on Slides 2, 3, and 5 are strictly preserved and not removed or overwritten. Update TEST_INFRA.md and test suite accordingly.
