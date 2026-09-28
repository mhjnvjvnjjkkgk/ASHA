# Project: ASHA Presentation Transformation & Visual Storytelling

## Architecture
- **Deck Format**: 16:9 Widescreen (13.333" x 7.500"), strictly 6 slides adhering to SIH 2026 guidelines.
- **Visual Design Architecture**: Standardized 3-Zone Slide Layout:
  - **Zone A (Top Header)**: Slide category badge, title, subtitle, and breadcrumb indicator.
  - **Zone B (Left Column / Main Content)**: 2 to 3 modular rounded-rectangle cards containing condensed bullet points (max 3-4 bullets per card, strictly 1-2 lines each), formulas, metrics, or flowcharts.
  - **Zone C (Right Column Storyboard Panel & Flanking Mockups)**: Dedicated container hosting the vector cartoon story panel with character dialogue/thought bubble, integrated alongside and strictly preserving existing website/app mockups.
- **Color Palette (60-30-10 Rule)**:
  - 60% Canvas & Backgrounds: `#FFFFFF` (Pure White) and `#F8FAFC` (Slate-50)
  - 30% Structural Elements: `#0F172A` (Midnight Navy), `#334155` (Slate-700), `#E2E8F0` (Border Slate)
  - 10% Clinical & Visual Accents: `#0D9488` (Teal-600 / Vitality), `#E11D48` (Emergency Rose-600), `#10B981` (Life Green / Confirmed)
- **Character Design Tokens (Strict Consistency)**:
  - **Grandmother (Bani Devi, 68)**: Lilac/cream cotton saree with maroon border (`#800020`), low silver-grey hair bun, wire spectacles, expression of acute chest pain / relief.
  - **Mother (Ananya, 42)**: Mustard yellow kurta (`#EAB308`) with teal dupatta (`#0D9488`), dark hair in mid-ponytail, frantic panic / tearful relief.
  - **Teen Granddaughter (Riya, 16-17)**: Deep teal/lavender modern hoodie (`#0D9488` / `#8B5CF6`), dark jeans, wireframe glasses, holding glowing smartphone running ASHA app.
  - **ER Doctor (Dr. Banerjee, 45)**: Crisp white lab coat (`#FFFFFF`) over sea-green scrubs (`#14B8A6`), stethoscope around neck, hospital triage tablet in hand, confident reassuring posture.
- **CRITICAL ASSET PRESERVATION CONSTRAINT**:
  - All existing website and app image mockups in the presentation deck (specifically the 3 mobile mockup containers on Slide 2, Slide 3, and Slide 5 displaying ashaien.vercel.app, Situational First-Aid sheet, and ER desk ashait-admin.vercel.app) MUST BE STRICTLY PRESERVED. Do not delete, displace, or replace.

## Feature Inventory
Every requirement from ORIGINAL_REQUEST.md and user updates is mapped below:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Slide 1 Condensation | Condense title, problem, team, and breakthrough text to 1-2 line bullets | M1 | Survey / R1 |
| F2 | Slide 2 Condensation | Condense gate rejections and proposed solution to max 3-4 bullets/card | M1 | Survey / R1 |
| F3 | Slide 3 Condensation | Condense technical architecture and cloud sync flow to crisp cards | M1 | Survey / R1 |
| F4 | Slide 4 Condensation | Condense feasibility, risks, and 15-min soft-lock state machine | M1 | Survey / R1 |
| F5 | Slide 5 Condensation | Condense clinical/social impact and economic metrics | M1 | Survey / R1 |
| F6 | Slide 6 Condensation | Condense clinical evidence, guidelines, and production links | M1 | Survey / R1 |
| F7 | Mathematical Formula Preservation | Preserve Staffed Bed Math, Risk Composite $R$, $S_{IP}$, Haversine 100m geofence | M1 | Survey / R1 |
| F8 | Technical Metric Preservation | Preserve <0.8s load, 0ms translation, <420ms OSRM, <50ms sync, 15m hold, 4-digit OTP 4892 | M1 | Survey / R1 |
| F9 | ESI Triage & First-Aid Protocol | Preserve Semi-Fowler 45°, 300mg aspirin, 10s ABC check, DO NOT DO warnings | M1 | Survey / R1 |
| F10 | Scene 1: The Crisis | Grandmother acute chest pain at 1:15 AM, clutched saree, family distress | M2 | Survey / R2 |
| F11 | Scene 2: Panicked Reality | Mother frantically calling hospitals, 0 beds found, ghost bed dilemma | M2 | Survey / R2 |
| F12 | Scene 3: The Smart Solution | Granddaughter uses ASHA, speaks Bengali, 15-min countdown bed lock | M2 | Survey / R2 |
| F13 | Scene 4: Transit Void & Semi-Fowler | En-route first-aid, Semi-Fowler 45° posture, GPS directional heartbeat | M2 | Survey / R2 |
| F14 | Scene 5: Resuscitation & Relief | ER arrival, Doctor confirms Golden Hour life saved, family grateful | M2 | Survey / R2 |
| F15 | Conversational Dialogue Bubbles | 7 speech/thought bubbles answering judge concerns (hoarding, ghost beds, latency, etc.) | M2 | Survey / R2 |
| F16 | Slide-to-Scene Storyboard Mapping | Precise mapping of cartoon scenes and bubbles to Slides 1–6 | M2 | Survey / R2 |
| F17 | Character Consistency Guidelines | Exact hex colors, attire, hair, expressions, and props across all scenes | M3 | Survey / R3 |
| F18 | Production Gemini / Imagen Prompts | 5+ production-ready prompts with flat vector style & isolated `#FFFFFF` background | M3 | Survey / R3 |
| F19 | Negative Prompt Exclusions | Strict exclusion tokens (no 3D, no photorealism, no gradients, no borders) | M3 | Survey / R3 |
| F20 | Storyboard Asset Generation / Rendering | Generate vector-style visual panels for all scenes | M3 | Survey / R3 |
| F21 | Deck Assembly & Slide Generation | Update PowerPoint presentation / create standalone master slides with visuals | M4 | Survey / Plan |
| F22 | E2E Acceptance & Readability Verification | Empirical verification of 50-60% text reduction, formula preservation, prompt consistency | E2E-Test | Survey / Plan |
| F23 | Existing Website Mockup Preservation | Strictly preserve existing app mockups on Slides 2, 3, and 5 | M1/M2/M4/E2E | User Mandate |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Slide-by-Slide Text Condensation & Hierarchy (R1) | Condense narrative text across all 6 slides into crisp 1-2 line bullets (max 3-4/section), preserving formulas ($B_{staffed}$, $R$, $S_{IP}$, Haversine) and technical metrics; preserve mockup slots. | none | IN_PROGRESS |
| M2 | Multi-Step Vector Cartoon Storyboard & Dialogue (R2) | 5-step episodic storyline, 7 judge-defense dialogue bubbles, slide mapping harmonized with existing mockups. | M1 | IN_PROGRESS |
| M3 | Character-Consistent Gemini Prompts & Visual Assets (R3) | Production-ready Gemini/Imagen prompts with strict visual consistency tokens, isolated white backgrounds, image generation and validation. | M2 | PLANNED |
| M4 | Final Deck Assembly & Integration | Assemble the complete presentation deliverables preserving existing mockups, placing new vector panels and flowcharts. | M1, M2, M3 | PLANNED |
| E2E | E2E Testing & Acceptance Verification | Requirement-driven opaque-box verification suite testing all 23 features including mockup preservation. | none (runs parallel) | IN_PROGRESS |

## Interface Contracts
### M1 ↔ M2 & M4 (Slide Text & Layout Contract)
- M1 provides a structured JSON and Markdown specification (`SLIDE_DECK_CONDENSED_SPEC.md` and `slide_deck_condensed.json`):
  - Array of 6 slide objects, each with `slide_number`, `title`, `subtitle`, `cards` (each max 3-4 bullets, max 25 words/bullet), `preserved_formulas`, `preserved_metrics`, `preserved_mockups` (coordinates and files for existing app mockups on Slides 2, 3, 5), and `storyboard_slot` (geometry coordinates for Zone C).
- M2 and M4 consume this contract to align text placement and cartoon panel dimensions.

### M2 ↔ M3 (Storyboard & Visual Spec Contract)
- M2 provides `STORYBOARD_NARRATIVE_SPEC.md`:
  - 5 scenes with scene IDs, character personas present, actions, emotion/expression, dialogue bubble text (English + Bengali subtitle), and judge objection addressed, noting proximity to app mockups.
- M3 consumes this to engineer the character prompts and generate visual assets matching the exact narrative beats.

### M3 ↔ M4 (Image Asset Contract)
- M3 delivers high-resolution image files in `d:\HACKATHON\presentation_assets\`:
  - `scene1_crisis.png`, `scene2_panicked_reality.png`, `scene3_smart_solution.png`, `scene4_transit_void.png`, `scene5_resuscitation_relief.png`.
  - Format: Isolated clean white background (`#FFFFFF`), flat modern vector style.
- M4 places these into the right-hand storyboard slots on each slide alongside preserved mockups.

## Code & Deliverable Layout
- `d:\HACKATHON\presentation_assets\`: Output directory for generated cartoon panels, flowcharts, and visual assets.
- `d:\HACKATHON\SIH2026-ASHA-Presentation-Optimized.pptx`: Final transformed 6-slide widescreen PowerPoint presentation.
- `d:\HACKATHON\PRESENTATION_TRANSFORMATION_MASTER_GUIDE.md`: Comprehensive master documentation containing slide-by-slide layout, condensed bullets, speaker notes, and dialogue scripts.
- `.agents/teamwork_preview_orchestrator_1/`: Orchestrator state and tracking files.
