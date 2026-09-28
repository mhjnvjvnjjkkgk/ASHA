# Dispatch for Worker M3: Character-Consistent Gemini Prompts & Visual Assets

- Role: Visual Asset & Prompt Engineer
- Working Directory: d:\HACKATHON\.agents\teamwork_preview_worker_m3
- Original Request: d:\HACKATHON\.agents\ORIGINAL_REQUEST.md
- Project Scope: d:\HACKATHON\.agents\teamwork_preview_orchestrator_1\PROJECT.md
- Storyboard Narrative Input: `d:\HACKATHON\STORYBOARD_NARRATIVE_SPEC.md`
- Visual Design Input: `d:\HACKATHON\.agents\teamwork_preview_explorer_survey_3\analysis.md`

## Assignment
1. Implement Requirement R3:
   - Generate exact, production-ready prompts tailored for Google Gemini / Imagen for all 5 scenes:
     * Scene 1: The Midnight Crisis (Grandmother clutching chest at 1:15 AM)
     * Scene 2: The Panicked Reality & Ghost Beds (Mother frantic phone calls, 0 beds)
     * Scene 3: The Smart Solution (Teen Granddaughter booking via ASHA with Bengali speech & 15-min countdown)
     * Scene 4: Bridging the Transit Void (Ambulance transit, Granddaughter props Grandmother in Semi-Fowler 45° posture, GPS telemetry heartbeat)
     * Scene 5: Resuscitation & Relief in Golden Hour (Emergency bay arrival, 1.8s check-in, Doctor confirms life saved)
   - Enforce strict visual consistency:
     * Flat modern vector illustration style, clean lines, bold saturated palette, corporate healthcare editorial style.
     * Isolated pure white background (`#FFFFFF`) with zero shadows, gradients, or background noise.
     * Character design tokens:
       - Grandmother (Bani Devi, 68): lilac/cream cotton saree with maroon border (`#800020`), low silver bun, spectacles.
       - Mother (Ananya, 42): mustard yellow kurta (`#EAB308`) with teal dupatta (`#0D9488`), dark hair ponytail.
       - Granddaughter (Riya, 16-17): teal hoodie (`#0D9488`), dark jeans, wireframe glasses, holding glowing smartphone running ASHA app.
       - ER Doctor (Dr. Banerjee, 45): crisp white lab coat (`#FFFFFF`) over sea-green scrubs (`#14B8A6`), stethoscope, triage tablet.
     * Negative exclusion tokens: photorealism, 3D render, gradients, colored backgrounds, borders, visual clutter.
2. CRITICAL USER MANDATE:
   - STRICTLY PRESERVE all existing website and app image mockups in the presentation deck (specifically on Slides 2, 3, and 5 displaying ashaien.vercel.app, the Situational First-Aid sheet, and ashait-admin.vercel.app).
   - Ensure the new vector cartoon panels are designed to sit harmoniously alongside the preserved mockups.
3. Visual Asset Production:
   - Create or render high-resolution visual panels in `d:\HACKATHON\presentation_assets\`:
     * `scene1_crisis.png`
     * `scene2_panicked_reality.png`
     * `scene3_smart_solution.png`
     * `scene4_transit_void.png`
     * `scene5_resuscitation_relief.png`
   - Also provide vector SVG fallbacks for zero-dependency presentation embedding.
4. Deliverables:
   - `d:\HACKATHON\GEMINI_PROMPTS_AND_IMAGE_ASSETS.md`
   - `d:\HACKATHON\.agents\teamwork_preview_worker_m3\handoff.md`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-13T12:28:04Z
CRITICAL USER REQUIREMENT UPDATE - Dialogue Simplicity & Emotional Realism
"make sure that the story is conveyed through simple things and diaologes that actually fit into slides properly and is not too complicated like the characters should actually be saying things to actually express their feeligs etc etc"
1. Prompts for visual panels and speech bubbles must feature these short, punchy (12-15 words max), emotionally resonant dialogue lines:
   - Scene 1 (Dadi - Pain): "My chest feels crushed... I can't catch my breath!"
   - Scene 2 (Maa - Panic): "Every hospital line is busy! No ICU beds anywhere?!"
   - Scene 3 (Riya - Calm Action): "Ma, stop calling! ASHA just locked a bed at Apollo—12 mins away!"
   - Scene 4 (En-Route - Care): "Keep Dadi sitting upright at 45°! The timer is paused because we're moving!"
   - Scene 5 (Doctor - Relief): "You got her here in the Golden Hour. She's completely safe now."
2. Character facial expressions must match these exact human emotions (acute distress -> frantic tears -> calm digital mastery -> disciplined emergency posture -> profound relief).


