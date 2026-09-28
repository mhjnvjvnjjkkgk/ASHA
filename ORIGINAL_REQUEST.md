# Original User Request

## Initial Request — 2026-09-05T13:04:52Z

# Teamwork Project Prompt

Full-screen Google Maps style mobile emergency web app for PulseGrid with unified symptom/blood search, dynamic bottom drawer sheet, stabilized ETA calculation, and a real-time GPS soft-lock bed reservation system.

Working directory: d:\HACKATHON
Integrity mode: development

## Requirements

### R1. Full-Screen Google Maps Clone UI & Bottom Sheet
- Full-screen interactive map interface with floating top navbar and slidable bottom sheet drawer matching native Google Maps UI (rounded top edges, drag handle, clean metrics).
- Unified search bar supporting both medical symptoms (Hinglish/Benglish/English text or voice) and blood type requirements (e.g. "O negative", "A+ blood needed").
- Automatic map route fitting and bounds auto-zoom upon search submission.

### R2. Real-Time Soft-Lock & Hard-Lock Bed Reservation Engine
- 15-minute soft lock reserving 1 hospital bed immediately upon lock request.
- Live GPS tracking loop monitoring user directional vector and movement:
  - Moving toward hospital: Hides countdown timer, shows live dynamic ETA.
  - Stationary: Continues 15-minute countdown.
  - Moving away / ETA increasing 2-3 times: Triggers "Wrong Direction" alert; auto-cancels soft lock and restores bed count if unacknowledged.
- Hard lock: OTP verification at hospital entrance converts soft lock into permanent bed claim. Expiration without arrival restores bed to available pool.

### R3. Stabilized Routing, Polling & Post-Booking UX
- Fix ETA recalculation jitter/flickering (eliminating random 9-12 min jumps).
- Remove all judge/demo buttons, hospital desk navbar tabs, and random background auto-scrolling re-renders.
- Post-booking drawer transformation: Replace "Book Bed" button with single-tap "Call Ambulance" and "Call Hospital" quick-dial buttons.

## Acceptance Criteria

### UI & Map Interface
- [ ] Map renders 100% full-screen as background element with floating top search bar.
- [ ] Unified search bar handles both symptom text/voice and blood group requests (e.g., "O- negative blood").
- [ ] Benglish/Hinglish voice input works reliably without language misdetection errors.
- [ ] Bottom drawer slides smoothly up/down displaying exact beds, blood units, ETA, and distance.

### Soft-Lock & Bed Management
- [ ] Clicking "Lock Bed" reduces visible available beds by 1 (e.g. 30 -> 29) for 15 minutes and generates OTP.
- [ ] User movement towards target hospital pauses timer and displays live ETA.
- [ ] Moving away / wrong direction triggers warning prompt and auto-cancellation logic.
- [ ] Verification with OTP hard-locks the bed count at 29.

### Bug Fixes & Stability
- [ ] No auto-scrolling to bottom when hospital list refreshes in background.
- [ ] Judge Hackathon demo elements completely removed.
- [ ] Post-booking view shows only "Call Ambulance" and "Call Hospital" buttons.

## 2026-09-13T12:10:53Z

# Teamwork Project Prompt

Transform the text-heavy 6-slide ASHA presentation into a visually engaging, story-driven deck featuring clean bullet points, flowcharts, and a multi-step consistent vector cartoon story (Grandmother chest pain crisis → Mother panicking/calling → Teen Granddaughter booking via ASHA → Doctor saving life at hospital).

Working directory: d:\HACKATHON
Integrity mode: development

## Requirements

### R1. Slide-by-Slide Text Condensation & Information Hierarchy
- Condense long narrative paragraphs across all 6 slides into crisp, high-impact bullet points (maximum 3-4 bullet points per section, strictly 1-2 lines each).
- Preserve critical mathematical formulas, ESI triage facts, and technical metrics while removing clutter.

### R2. Multi-Step Vector Cartoon Storyboard (Characters & Narrative Flow)
- Develop a 4-to-5 step episodic visual storyline:
  - **Scene 1 (The Crisis):** Elderly Grandmother clutches chest/palpitations in acute distress.
  - **Scene 2 (The Panicked Reality):** Mother (30s/40s) panics, frantically making phone calls with zero beds/answers.
  - **Scene 3 (The Smart Solution):** Tech-savvy Teen Granddaughter (15-17) steps in with phone: discovers ASHA, speaks symptom in Bengali, locks hospital bed with 15-min countdown.
  - **Scene 4 (The Resuscitation & Relief):** Emergency arrival at hospital; Doctor confirms timely Golden Hour arrival saved grandmother's life; family relieved and grateful.
- Include conversational character dialogue bubbles (e.g. Q&A or thought bubbles) to answer common user/judge concerns.

### R3. Character-Consistent Gemini Image Generation Prompts
- Generate exact, production-ready prompts tailored for Google Gemini / Imagen.
- Enforce strict visual consistency: flat modern vector illustration style, clean white/isolated background, distinct character design tokens (Grandmother in saree, Mother in kurta, Granddaughter in modern casuals with smartphone, ER Doctor in lab coat with stethoscope).

## Acceptance Criteria

### Content Optimization
- [ ] Text density across slides reduced by ~50-60%, eliminating walls of text.
- [ ] Every slide retains clear visual breathing room, punchy bold labels, and readable typography.

### Story & Illustration Specification
- [ ] Exact scene breakdown mapping story panels to specific slides (e.g. Crisis on Slide 2, Solution on Slide 2/3, Resolution on Slide 5).
- [ ] Character consistency design guidelines defined (palettes, attire, expressions).
- [ ] 5+ detailed Gemini prompts with isolated white backgrounds ready for image generation.

## Follow-up — 2026-09-13T12:21:26Z

CRITICAL USER REQUIREMENT UPDATE:
"please tell the orchestrator to keep the image mockups of the website that we have already"

Ensure that the orchestrator and all milestone workers:
1. STRICTLY PRESERVE all existing website and app image mockups in the presentation deck (specifically the 3 mobile mockup containers on Slide 2, Slide 3, and Slide 5 displaying the citizen app ashaien.vercel.app, the Situational First-Aid sheet, and the hospital ER desk ashait-admin.vercel.app).
2. DO NOT delete, displace, or replace these existing product mockups.
3. The new vector cartoon story illustrations, condensed bullet points, and flowcharts must be positioned in harmony alongside these existing mockups, keeping the existing mobile mockup containers intact.

## Follow-up — 2026-09-13T12:27:31Z

CRITICAL USER REQUIREMENT UPDATE: DIALOGUE SIMPLICITY & EMOTIONAL REALISM
"make sure that the story is conveyed through simple things and diaologes that actually fit into slides properly and is not too complicated like the characters should actually be saying things to actually express their feeligs etc etc"

Guidelines to enforce across STORYBOARD_NARRATIVE_SPEC.md, SLIDE_DECK_CONDENSED_SPEC.md, and downstream slide deck assembly:
1. KEEP DIALOGUES SHORT & PUNCHY (1-2 sentences maximum, under 12-15 words) so speech/thought bubbles fit cleanly on 16:9 slides without text overflow.
2. RAW EMOTIONAL EXPRESSION: Everyday human feelings instead of complex jargon:
   - Scene 1 (Dadi - Pain): "My chest feels crushed... I can't catch my breath!"
   - Scene 2 (Maa - Panic): "Every hospital line is busy! No ICU beds anywhere?!"
   - Scene 3 (Riya - Calm Action): "Ma, stop calling! ASHA just locked a bed at Apollo—12 mins away!"
   - Scene 4 (En-Route - Care): "Keep Dadi sitting upright at 45°! The timer is paused because we're moving!"
   - Scene 5 (Doctor - Relief): "You got her here in the Golden Hour. She's completely safe now."
3. Q&A CALLOUTS: Simple, conversational questions and answers for common judge doubts (e.g. Ghost Beds, 100m geofence).

## Follow-up — 2026-09-13T12:33:50Z

USER INSTRUCTION & SPECIFICATION UPDATE:
The user has explicitly approved the 1 Big Hero Story + Mini-Stories approach and instructed:
1. EMBED THE 5 MINI-STORIES INTO THE DECK PLAN: Frame them like an illustrated, cute, children's-storybook-style question-and-answer vignette answering common citizen/judge questions.
2. MINI-STORY 5 DEEP DIVE (ANTI-ABUSE RISK SCORE): Explicitly showcase how the 0-100 Risk Score evaluates:
   - Device hardware entropy (GPU canvas 2D/WebGL fingerprinting)
   - Attempt burst velocity (N_1h, N_24h attempt frequency)
   - IP subnet verification
   - Movement velocity vector
   - 100-meter physical hospital geofence gate.
3. CHARACTER CONSISTENCY & TONE: Keep the visual style cute, friendly, and easy to understand (like an educational storybook comic) with recurring characters (Dadi, Maa, Riya, Dr. Sen, Curious Aarav, Chhotu ASHA Mascot, and Sneaky Fox).
4. STORAGE & PLACEMENT:
   - Master specification has been written to `d:\HACKATHON\MINI_STORIES_SPEC.md`.
   - Visual assets to be saved in `d:\HACKATHON\presentation_assets\`.
   - Slide placement: Mini 1 & 3 on Slide 2, Mini 2 on Slide 3, Mini 5 on Slide 4, Mini 4 on Slide 5.

## Follow-up — 2026-09-13T12:35:04Z

USER INSTRUCTION UPDATE FOR MINI-STORY 1 (THE GHOST BED):
The user has explicitly refined Mini-Story 1 to directly highlight that "ghost beds" are what is shown on existing hospital website portals:

👦 Aarav asks:
"Look! The hospital website portal clearly says 10 beds are available! Why did the doctor turn us away at the gate?"

🛡️ ASHA Mascot explains:
"Because hospital website portals show 'Ghost Beds'—they count empty metal furniture, but hide that zero nurses are on duty! A bed without a nurse cannot give oxygen or life-saving care. ASHA eliminates Ghost Beds by strictly counting Staffed Beds = min(Beds, Nurses × Ratio) with real nurses on duty!"

Ensure this exact dialogue is reflected in all prompt generators, storyboard specs, and slide speech bubble allocations.

## Follow-up — 2026-09-13T12:39:15Z

CRITICAL USER REQUIREMENT UPDATE: SIH OFFICIAL BLUE FOOTER RECTANGLE ON EVERY SLIDE
"ohh also make sure that this text is on every slide even, make it smaller but make sure that this blue rectangle with the text is there"

Requirement details:
1. On EVERY SLIDE (Slides 1 through 6), include the official SIH bottom blue footer bar:
   - Geometry: x = 0.00", y = 7.10" to 7.15", width = 13.333", height = 0.35" to 0.40" (slim and elegant so it doesn't take much vertical space).
   - Fill Color: Solid SIH Blue (#0070C0).
   - Border: None.
   - Text Centered: "@SIH Idea submission- Template" (Font: Arial or Segoe UI, Size: 10pt, Color: #FFFFFF, Centered).
   - Slide Number on the Right: "1", "2", "3", "4", "5", "6" (Font: Arial or Segoe UI, Size: 10pt, Color: #FFFFFF, Right-aligned at x = 12.50", y = 7.15").

Ensure this footer bar is present across all slides in SIH2026-ASHA-Presentation-Optimized.pptx and noted in master presentation specs.





