# Dispatch for Worker M4: Final Slide Deck Assembler & Integrator

- Role: Presentation Deck Assembler & Integrator
- Working Directory: d:\HACKATHON\.agents\teamwork_preview_worker_m4
- Original Request: d:\HACKATHON\.agents\ORIGINAL_REQUEST.md
- Project Scope: d:\HACKATHON\.agents\teamwork_preview_orchestrator_1\PROJECT.md
- Input Specifications:
  - `d:\HACKATHON\SLIDE_DECK_CONDENSED_SPEC.md`
  - `d:\HACKATHON\STORYBOARD_NARRATIVE_SPEC.md`
  - `d:\HACKATHON\MINI_STORIES_SPEC.md`
  - `d:\HACKATHON\GEMINI_PROMPTS_AND_IMAGE_ASSETS.md`
  - Visual Assets: `d:\HACKATHON\presentation_assets\`

## Assignment
1. Assemble the complete, production-ready 6-slide PowerPoint presentation deck (`d:\HACKATHON\SIH2026-ASHA-Presentation-Optimized.pptx`):
   - Strict 16:9 widescreen format (13.333" x 7.500") across strictly 6 slides.
   - Standardized 3-zone layout (Zone A Header, Zone B Left Content Cards, Zone C Right Storyboard / Flanking Container).
   - Insert condensed bullet points from `SLIDE_DECK_CONDENSED_SPEC.md` (strictly 1-2 lines per bullet, max 3-4 per card, bold 2-4 word lead-ins).
   - Insert all 4 mathematical formulas verbatim ($B_{staffed}$, $R$, $S_{IP}$, Haversine 100m geofence).
   - Insert all technical performance metrics (<0.8s load, 0ms translation, <420ms OSRM, <50ms WebSockets, 15m hold, 4-digit OTP 4892, <2s ER check-in, 100m geofence, 10 Kolkata hubs, 15,000+ lives saved).
   - STRICTLY PRESERVE all existing website and app image mockups on Slides 2, 3, and 5 (specifically `mockup_slide2_citizen_pwa.png`, `mockup_slide3_first_aid_sheet.png`, `mockup_slide5_searched_reservation.png`).
   - Insert the high-resolution vector cartoon story panels from `d:\HACKATHON\presentation_assets\` (Scenes 1 to 5) alongside the preserved mockups.
   - Embed the 5 storybook mini-stories from `d:\HACKATHON\MINI_STORIES_SPEC.md` with simple, cute character interactions (Aarav, Chhotu, Sneaky Fox, etc.).
   - Embed the short, punchy, emotional dialogue bubbles (<12-15 words).
2. Author `d:\HACKATHON\PRESENTATION_TRANSFORMATION_MASTER_GUIDE.md`:
   - Complete slide-by-slide visual layout, verbatim condensed text, speaker notes, dialogue scripts, and design tokens.
3. Validate deck using `python-pptx` to ensure clean generation, zero shape overlaps, correct aspect ratio, and 100% test compatibility.
4. Deliver handoff.md in your working directory and notify parent.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-13T12:35:39Z
**Context**: USER INSTRUCTION UPDATE FOR MINI-STORY 1 (THE GHOST BED)
**Content**: The user has refined Mini-Story 1 to directly call out that "ghost beds" are what existing hospital website portals display:
- Aarav asks: "Look! The hospital website portal clearly says 10 beds are available! Why did the doctor turn us away at the gate?"
- ASHA Mascot explains: "Because hospital website portals show 'Ghost Beds'—they count empty metal furniture, but hide that zero nurses are on duty! A bed without a nurse cannot give oxygen or life-saving care. ASHA eliminates Ghost Beds by strictly counting Staffed Beds = min(Beds, Nurses × Ratio) with real nurses on duty!"
**Action**: Ensure this exact wording is reflected on Slide 2 and in the presentation master guide.

## 2026-09-13T12:39:47Z
**Context**: CRITICAL USER REQUIREMENT UPDATE - SIH Official Blue Footer Bar on Every Slide
**Content**: The user has explicitly mandated: "ohh also make sure that this text is on every slide even, make it smaller but make sure that this blue rectangle with the text is there".
1. On EVERY SLIDE (Slides 1 through 6), include the official SIH bottom blue footer bar:
   - Geometry: x = 0.00", y = 7.10" to 7.15", width = 13.333", height = 0.35" to 0.40" (slim, elegant).
   - Fill Color: Solid SIH Blue (#0070C0).
   - Border: None.
   - Text Centered: "@SIH Idea submission- Template" (Font: Arial or Segoe UI, Size: 10pt, Color: #FFFFFF, Centered).
   - Slide Number on the Right: "1", "2", "3", "4", "5", "6" (Font: Arial or Segoe UI, Size: 10pt, Color: #FFFFFF, Right-aligned at x = 12.50", y = 7.15").
**Action**: Implement this exact footer bar across strictly all 6 slides in SIH2026-ASHA-Presentation-Optimized.pptx and document it in PRESENTATION_TRANSFORMATION_MASTER_GUIDE.md.


