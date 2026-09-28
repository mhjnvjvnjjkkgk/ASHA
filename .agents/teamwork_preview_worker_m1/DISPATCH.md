# Dispatch for Worker M1: Slide Text Condensation & Information Hierarchy

- Role: Slide Content Architect
- Working Directory: d:\HACKATHON\.agents\teamwork_preview_worker_m1
- Original Request: d:\HACKATHON\.agents\ORIGINAL_REQUEST.md
- Project Scope: d:\HACKATHON\.agents\teamwork_preview_orchestrator_1\PROJECT.md
- Input Explorer Reports:
  - `d:\HACKATHON\.agents\teamwork_preview_explorer_survey_1\analysis.md`
  - `d:\HACKATHON\.agents\teamwork_preview_explorer_survey_3\analysis.md`

## Assignment
1. Implement Requirement R1 across strictly all 6 slides of the ASHA presentation:
   - Condense long narrative paragraphs across all 6 slides into crisp, high-impact bullet points.
   - Max 3-4 bullet points per section/card, strictly 1-2 lines each.
   - Reduce overall slide text density by 50-60% (target 690-820 total words across the deck, down from 1,752-2,391).
   - Use the 3-zone slide architecture (Zone A Header, Zone B Left Content Cards, Zone C Right Storyboard Slot).
2. CRITICAL PRESERVATION REQUIREMENT:
   - Preserve all 4 mathematical formulas verbatim:
     * Staffed Bed Capacity: $B_{staffed} = \min(B_{phys}, N_{nurses} \times Ratio)$
     * Multi-Factor Client Risk Composite: $R = 0.30 S_{IP} + 0.35 S_{Device} + 0.20 S_{Velocity} + 0.15 S_{Geo}$
     * Burst IP Score: $S_{IP} = \min(100, 30 \max(0, N_{1h} - 1) + 10 \max(0, N_{24h} - 2))$
     * Haversine 100m Geofence: $\text{Distance}(P_{telemetry}, H_{ER}) \le 0.100\text{ km}$
   - Preserve all technical metrics: <0.8s load, 0ms translation, <420ms OSRM, <50ms WebSockets, 15m hold, 4-digit OTP 4892, <2s ER check-in, 100m geofence, 10 Kolkata hubs, 15,000+ lives saved.
   - Preserve clinical first-aid facts: Semi-Fowler 45° posture, 300mg chewable aspirin, 10s ABC check, DO NOT DO warnings.
3. Deliverables:
   - `d:\HACKATHON\SLIDE_DECK_CONDENSED_SPEC.md`
   - `d:\HACKATHON\.agents\teamwork_preview_worker_m1\slide_deck_condensed.json`
   - `d:\HACKATHON\.agents\teamwork_preview_worker_m1\handoff.md`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-13T12:18:54Z
You are Worker M1: Slide Content Architect.
Working Directory: d:\HACKATHON\.agents\teamwork_preview_worker_m1
Original Request: d:\HACKATHON\.agents\ORIGINAL_REQUEST.md
Project Scope: d:\HACKATHON\.agents\teamwork_preview_orchestrator_1\PROJECT.md
Dispatch Instructions: d:\HACKATHON\.agents\teamwork_preview_worker_m1\DISPATCH.md
Input Survey Analysis:
- d:\HACKATHON\.agents\teamwork_preview_explorer_survey_1\analysis.md
- d:\HACKATHON\.agents\teamwork_preview_explorer_survey_3\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your task:
1. Condense long narrative paragraphs across strictly all 6 slides into crisp, high-impact bullet points:
   - Strictly 1-2 lines per bullet.
   - Maximum 3-4 bullets per card/section.
   - Reduce total slide deck text density by 50-60% (target 690-820 total words across the deck, down from 1,752-2,391).
   - Adopt the 3-zone layout (Zone A Header, Zone B Left Content Cards, Zone C Right Storyboard Slot).
2. CRITICALLY PRESERVE all mathematical formulas verbatim:
   - Staffed Bed Math: B_staffed = min(B_phys, N_nurses * Ratio)
   - Risk Composite: R = 0.30*S_IP + 0.35*S_Device + 0.20*S_Velocity + 0.15*S_Geo
   - Burst IP Score: S_IP = min(100, 30*max(0, N_1h - 1) + 10*max(0, N_24h - 2))
   - Haversine 100m Geofence: Distance(P_telemetry, H_ER) <= 0.100 km
3. CRITICALLY PRESERVE all technical metrics (<0.8s load, 0ms translation, <420ms OSRM, <50ms WebSockets, 15m hold, 4-digit OTP 4892, <2s ER check-in, 100m geofence, 10 Kolkata hubs, 15,000+ lives saved) and clinical first-aid facts (Semi-Fowler 45°, 300mg aspirin, 10s ABC check, DO NOT DO warnings).
4. Write the complete, production-ready slide text and layout specifications to d:\HACKATHON\SLIDE_DECK_CONDENSED_SPEC.md and d:\HACKATHON\.agents\teamwork_preview_worker_m1\slide_deck_condensed.json.
5. Deliver handoff.md in your working directory and send a completion message back to parent.

## 2026-09-13T12:21:59Z
**Context**: CRITICAL USER REQUIREMENT UPDATE - Website Mockup Preservation
**Content**: The user has explicitly mandated: "please tell the orchestrator to keep the image mockups of the website that we have already".
1. STRICTLY PRESERVE all existing website and app image mockups in the presentation deck (specifically the 3 mobile mockup containers on Slide 2, Slide 3, and Slide 5 displaying the citizen app ashaien.vercel.app, the Situational First-Aid sheet, and the hospital ER desk ashait-admin.vercel.app).
2. DO NOT delete, displace, or replace these existing product mockups.
3. The new vector cartoon story illustrations, condensed bullet points, and flowcharts must be positioned in harmony alongside these existing mockups, keeping the existing mobile mockup containers intact.
**Action**: In SLIDE_DECK_CONDENSED_SPEC.md, explicitly designate and preserve the existing app mockup slots on Slide 2, Slide 3, and Slide 5, ensuring condensed bullet cards and vector story elements flank them harmoniously.

## 2026-09-13T12:28:01Z
**Context**: CRITICAL USER REQUIREMENT UPDATE - Dialogue Simplicity & Emotional Realism
**Content**: The user has explicitly instructed: "make sure that the story is conveyed through simple things and diaologes that actually fit into slides properly and is not too complicated like the characters should actually be saying things to actually express their feeligs etc etc".
Enforce across SLIDE_DECK_CONDENSED_SPEC.md:
1. Keep character dialogues short and punchy (1-2 sentences, strictly under 12-15 words) so speech bubbles fit cleanly into 16:9 slide containers without text overflow.
2. Raw emotional expressions:
   - Dadi: "My chest feels crushed... I can't catch my breath!"
   - Maa: "Every hospital line is busy! No ICU beds anywhere?!"
   - Riya: "Ma, stop calling! ASHA just locked a bed at Apollo—12 mins away!"
   - Transit: "Keep Dadi sitting upright at 45°! The timer is paused because we're moving!"
   - Doctor: "You got her here in the Golden Hour. She's completely safe now."
**Action**: Integrate these concise, human, slide-fitting dialogue bubbles in your slide specifications.



