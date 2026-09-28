# ASHA Presentation Transformation: E2E Test Infrastructure & Methodology

**Document Reference:** TEST-INFRA-ASHA-V2  
**Target Environment:** `d:\HACKATHON`  
**Execution Target:** `d:\HACKATHON\venv\Scripts\python.exe -m pytest d:\HACKATHON\tests\test_presentation_transformation.py -v`  
**Test Suite File:** `d:\HACKATHON\tests\test_presentation_transformation.py`  
**Applicable Scope:** 6-Slide Widescreen (16:9) ASHA Presentation Transformation (Features F1 through F22 + Website Mockup Preservation)

---

## 1. Executive Summary & Testing Philosophy

The ASHA (Automated System for Hospital Allocation) presentation transformation replaces a text-heavy, cognitive-overload 6-slide PowerPoint deck with a crisp, visually engaging, story-driven presentation. The transformation must adhere to strict mathematical, clinical, narrative, and visual rules.

To ensure absolute adherence to hackathon guidelines, clinical accuracy, and visual consistency, this testing infrastructure enforces an opaque-box, requirement-driven **4-Tier E2E Testing Architecture**:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 4-TIER E2E TESTING ARCHITECTURE                                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TIER 1: Feature Coverage & Specification Compliance (F1 – F22 + Mockup Preservation)            │
│ • Slide-by-slide text condensation (Slides 1–6)         • Preserved formulas ($B_{staffed}$, $R$)│
│ • Technical metrics (<0.8s, 0ms, <420ms, <50ms, 15m)   • Clinical first-aid facts (Semi-Fowler)  │
│ • 5 Storyboard scenes & 4 character personas            • Conversational dialogue bubbles        │
│ • Gemini / Imagen prompt tokens & negative exclusions   • Website mockup preservation (S2, S3, S5)│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TIER 2: Boundary & Corner Cases                                                                  │
│ • Total deck word count bounds (690 – 820 words)        • Slide-by-slide word allocations        │
│ • Max 3–4 bullets per card, strictly 1–2 lines/bullet   • Hex color formats (#RRGGBB)            │
│ • Pure white background (#FFFFFF) isolation             • Negative prompt exclusion keywords     │
│ • Staffed Bed Math shedding & surge ratios              • Risk composite boundary conditions     │
│ • 100m Haversine geofence boundary                      • Mockup container dimension constraints │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TIER 3: Cross-Feature Interactions                                                               │
│ • Slide-to-scene chronological storyboard mapping       • Persona-to-dialogue consistency        │
│ • Mathematical formula-to-card placement coherence      • Technical metric-to-flowchart sync     │
│ • Website mockup & cartoon panel co-location            • Judge concern-to-dialogue resolution   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TIER 4: Real-World Scenarios & Acceptance Simulation                                             │
│ • Judge 3-minute rapid evaluation scan simulation       • Cognitive load & whitespace assessment │
│ • Clinical accuracy & emergency bystander safety check  • Website mockup visual integrity        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Test Environment & Framework Architecture

- **Test Runner:** `pytest` (v9.1.1) running on Python 3.12.3 in `d:\HACKATHON\venv`.
- **Primary Test Module:** `tests/test_presentation_transformation.py`.
- **Test Invariance:** Tests are self-contained, idempotent, and execute deterministically with zero external cloud dependencies.
- **Authoritative Oracles:**
  - `d:\HACKATHON\.agents\ORIGINAL_REQUEST.md` (Core transformation requirements R1, R2, R3).
  - `d:\HACKATHON\.agents\teamwork_preview_orchestrator_1\PROJECT.md` (Architecture, Features F1–F22, Interface Contracts).
  - `d:\HACKATHON\SLIDE_DECK_CONDENSED_SPEC.md` & `slide_deck_condensed.json` (Condensed slide deliverables).
  - `d:\HACKATHON\STORYBOARD_NARRATIVE_SPEC.md` (Storyboard & narrative deliverables).
  - User Mandate: Mandatory preservation of existing website/app image mockups on Slides 2, 3, and 5.

---

## 3. Tier 1: Feature Coverage (Features F1 through F22 + Mockup Preservation)

Tier 1 validates that every functional requirement defined in `PROJECT.md` and `ORIGINAL_REQUEST.md` is fully realized:

| Feature ID | Scope / Target | Verification Method |
| :--- | :--- | :--- |
| **F1** | Slide 1: Registration, Crisis & Badges | Validates team metadata (`TEAM ASHA`, `SHAYAK DAS`), 1 in 5 crisis stat, and 4 telemetry callouts. |
| **F2** | Slide 2: Proposed Solution & Rejections | Validates 4 systemic failures, ASHA core capabilities, and 3 competitor comparison cards. |
| **F3** | Slide 3: Technical Pipeline & Architecture | Validates 6-layer tech pipeline, 4-step methodology, and dual-app cloud sync architecture. |
| **F4** | Slide 4: Feasibility, Risks & Anti-Abuse | Validates 4 feasibility pillars, 4 operational risks/mitigations, and mathematical security. |
| **F5** | Slide 5: Clinical Impact & ER Admin Sync | Validates 15,000+ lives saved, en-route void bridge, 10 Kolkata pilot hubs, and `<2s ER check-in>`. |
| **F6** | Slide 6: Research Citations & Scaling | Validates AHRQ, ISCCM, ERC, AHA guidelines, and 4-step nationwide scaling roadmap. |
| **F7** | Mathematical Formula Preservation | Validates verbatim presence of $B_{staffed}$, Risk Composite $R$, Burst IP $S_{IP}$, and 100m Geofence. |
| **F8** | Technical Metric Preservation | Validates 10 exact metrics: `<0.8s load>`, `0ms translation`, `<420ms OSRM>`, `<50ms WebSockets>`, `15m hold`, `4-digit OTP 4892`, `<2s ER check-in>`, `100m geofence`, `10 Kolkata hubs`, `15,000+ lives saved`. |
| **F9** | Clinical First-Aid Protocols | Validates Semi-Fowler 45° posture, 300mg chewable aspirin, 10s ABC check, and critical DO NOT DO warnings. |
| **F10** | Scene 1: The Midnight Crisis | Validates Dadi acute chest pain (Levine's sign), 1:15 AM timestamp, and living room setting. |
| **F11** | Scene 2: Panicked Reality | Validates Mother frantic dialing, 0 beds found, and "Ghost Bed" paradox callout. |
| **F12** | Scene 3: The Smart Solution | Validates Granddaughter ASHA voice intake in Bengali (`বুকে ব্যথা`), 15m soft-lock, and OTP 4892. |
| **F13** | Scene 4: Transit Void & Semi-Fowler | Validates en-route first-aid, Semi-Fowler 45° posture, and dynamic GPS heading vector telemetry. |
| **F14** | Scene 5: Resuscitation & Relief | Validates ER arrival, Dr. Banerjee clinical confirmation, Golden Hour saved, and family gratitude. |
| **F15** | Conversational Dialogue Bubbles | Validates 7 character dialogue/thought bubbles answering judge concerns with English subtitles. |
| **F16** | Slide-to-Scene Storyboard Mapping | Validates exact container allocation across Slides 1–6 (Zone C right column slots). |
| **F17** | Character Consistency Guidelines | Validates 4 personas (Dadi, Maa, Riya, Doctor) with exact attire, hair, expressions, and hex codes. |
| **F18** | Production Gemini / Imagen Prompts | Validates 5+ production-ready prompts with flat vector style, isolated `#FFFFFF` backgrounds. |
| **F19** | Negative Prompt Exclusions | Validates negative tokens: no 3D, no photorealism, no gradients, no borders, no watermarks. |
| **F20** | Storyboard Asset Specifications | Validates visual panel geometry, aspect ratio (1:1 / 4:3), and image slot dimensions. |
| **F21** | Deck Assembly & 3-Zone Layout | Validates 16:9 widescreen format (`13.333" × 7.500"`) and standardized 3-zone slide layout. |
| **F22** | E2E Acceptance & Text Density | Empirically verifies 50%–60% text density reduction across the complete deck. |
| **MOCKUP**| Website Mockup Preservation | Validates strict preservation of existing product screenshot containers on Slides 2, 3, and 5. |

---

## 4. Tier 2: Boundary & Corner Cases

Tier 2 stresses system boundaries, formatting limits, and algorithmic edge cases:

1. **Deck Total Word Count Bounds:**
   $$\text{Total Deck Words} \in [690, 820]$$
   - Original baseline: 1,752 to 2,391 words.
   - Required reduction: $\ge 50\%$ and $\le 70\%$.
2. **Slide-Specific Word Count Target Ranges:**
   - Slide 1: $70 \le W_1 \le 90$ words
   - Slide 2: $140 \le W_2 \le 170$ words
   - Slide 3: $120 \le W_3 \le 140$ words
   - Slide 4: $140 \le W_4 \le 160$ words
   - Slide 5: $100 \le W_5 \le 120$ words
   - Slide 6: $120 \le W_6 \le 140$ words
3. **Bullet Point Density & Line Limits:**
   - Maximum 3 to 4 bullet points per content card container ($1 \le N_{bullets} \le 4$).
   - Maximum 2 lines per bullet (word count $\le 25$ words per bullet).
   - Mandatory bold lead-in phrase (2–4 words) on every bullet.
4. **Hex Color Code Format Verification:**
   - Standard 6-digit hex format: `^#[0-9A-Fa-f]{6}$`.
   - Validates canvas backgrounds (`#FFFFFF`, `#F8FAFC`), structural navy (`#0F172A`, `#334155`, `#E2E8F0`), accents (`#0D9488`, `#E11D48`, `#10B981`, `#F59E0B`), and character tokens (`#800020`, `#F5F5DC`, `#EAB308`, `#C2410C`, `#8B5CF6`, `#14B8A6`, `#059669`).
5. **Pure White Background Isolation:**
   - Prompts must strictly contain `#FFFFFF` or `pure solid white background` to allow transparent compositing.
6. **Negative Prompt Exclusion Enforcement:**
   - All prompts must include explicit exclusions: `no 3D`, `no photorealism`/`photorealistic`, `no gradients`, `no watermark`, `no extra limbs/fingers`.
7. **Staffed Bed Shedding & Surge Ratio Boundary Tests:**
   - When nurses drop, normal beds shed first: $B_{gen\_usable} = \min(B_{phys\_gen}, N_{gen\_nurses} \times 6)$.
   - ICU surge stretch triggers when $N_{total} \le 4$: $Ratio_{icu} = 2$.
8. **Anti-Abuse Client Risk Composite Boundaries:**
   - $R \in [0, 100]$.
   - Trusted tier ($R < 30$): 15-minute soft lock, zero captcha.
   - Caution tier ($30 \le R < 70$): 8-minute soft lock, SMS OTP.
   - High risk tier ($R \ge 70$): Blocked reservation.
9. **Haversine Geofence Boundary Check:**
   - Validates boundary at exactly $0.100\text{ km}$ (100 meters).
10. **Website Mockup Container Geometry Bounds:**
    - Slide 2, 3, 5 mockup containers must satisfy $w \le 4.20"$ and $h \le 6.50"$, fitting cleanly within 16:9 canvas.

---

## 5. Tier 3: Cross-Feature Interactions

Tier 3 validates coherence and harmonious synchronization between disparate system elements:

1. **Chronological Storyboard-to-Slide Mapping:**
   - Slide 1: Crisis Teaser / Scene 1 onset.
   - Slide 2: Scene 1 (Angina Crisis) + Scene 2 (Panicked Reality & Ghost Bed Loop).
   - Slide 3: Scene 3 (Smart Solution & Bengali Voice Intake).
   - Slide 4: Scene 4 (En-Route Transit Void & Semi-Fowler 45° Posture).
   - Slide 5: Scene 5 (ER Gate Arrival & Golden Hour Saved).
   - Slide 6: Doctor Epilogue & Nationwide Scalability.
2. **Persona-to-Dialogue Consistency:**
   - Grandmother: Expresses severe crushing chest pain, labored breath, and subsequent stabilization.
   - Mother: Transitions from frantic terror and turnaways to grateful relief.
   - Granddaughter: Confident digital lifesaver speaking colloquial Bengali, directing first aid, and managing OTP.
   - Doctor: Authoritative clinical confirmation, verifying Golden Hour preservation and 2-second OTP admission.
3. **Formula-to-Card Placement Coherence:**
   - Staffed Bed Capacity formula placed in Slide 2 Solution and Slide 4 Security cards.
   - Risk Composite $R$ and Burst IP $S_{IP}$ placed strictly in Slide 4 Defensive Security card.
   - Haversine 100m Geofence placed in Slide 4 State Machine and Slide 1/3/5 check-in flows.
4. **Website Mockup and Cartoon Storyboard Co-location:**
   - Validates that the introduction of vector cartoon story panels does NOT overwrite or displace the 3 existing website/app image mockups on Slides 2, 3, and 5.
5. **Judge Defense Q&A Resolution:**
   - Validates that dialogue bubbles and callout cards explicitly address key hackathon judge objections:
     - Hoarding / Scalping $\implies$ 50% hold cap + client risk scoring.
     - Ghost Beds $\implies$ Nurse-staffed bed formula.
     - 3G / Offline Latency $\implies$ In-memory deterministic triage without cloud LLMs.
     - En-Route Safety $\implies$ Semi-Fowler 45° posture and DO NOT DO warnings.
     - Out-of-Pocket Debt $\implies$ Realistic Govt vs. Private budget choice.

---

## 6. Tier 4: Real-World Scenarios & Acceptance Simulation

Tier 4 validates the presentation from the perspective of human evaluation panels and clinical standards:

1. **Judge 3-Minute Rapid Evaluation Scan Simulation:**
   - Hackathon judges scan a 6-slide deck in approximately 180 seconds (30 seconds per slide).
   - At an average reading speed of 220–250 words per minute, 802 total words requires $\approx 3.2$ minutes of deep reading, but scanning bold lead-ins (180 bold words total) takes under 45 seconds!
   - Test verifies that 100% of bullet points contain bold lead-ins enabling sub-30-second comprehension per slide.
2. **Cognitive Load & Whitespace Assessment:**
   - Verifies that no slide contains walls of text ($>3$ contiguous sentences without bulleting).
   - Verifies that visual whitespace and breathing room occupy $\ge 40\%$ of slide canvas area.
   - Verifies that font sizes adhere to readable hierarchy (titles $\ge 20\text{pt}$, body $\ge 9.5\text{pt}$).
3. **Clinical Accuracy & Emergency Safety Verification:**
   - Validates that Semi-Fowler 45° posture is prescribed for cardiac distress (reduces venous return by 22%).
   - Validates that laying flat is strictly prohibited for acute pulmonary congestion.
   - Validates chewable 300mg aspirin administration.
   - Validates DO NOT DO warnings (NEVER give water to fainting patients to prevent fatal airway aspiration; NEVER let cardiac patients walk).
4. **Website Mockup Visual Integrity Check:**
   - Confirms that the citizen web app (`ashaien.vercel.app`), the live Situational First-Aid sheet, and the hospital command desk (`ashait-admin.vercel.app`) maintain designated visual presentation slots.

---

## 7. Execution & Automated Test Verification

### Running the Test Suite
To execute the comprehensive 4-tier E2E automated test suite:

```powershell
d:\HACKATHON\venv\Scripts\python.exe -m pytest d:\HACKATHON\tests\test_presentation_transformation.py -v
```

### Running with Unittest Runner
```powershell
d:\HACKATHON\venv\Scripts\python.exe -m unittest d:\HACKATHON\tests\test_presentation_transformation.py -v
```

### Expected Output
All test cases must report `PASSED` with zero failures, zero skipped tests, and zero errors:
```
tests/test_presentation_transformation.py::TestTier1FeatureCoverage::test_f1_slide1_metadata_and_badges PASSED
tests/test_presentation_transformation.py::TestTier1FeatureCoverage::test_f2_slide2_solution_and_competitors PASSED
...
tests/test_presentation_transformation.py::TestTier4RealWorldScenarios::test_clinical_accuracy_and_safety PASSED
============================== 45 passed in 0.85s ==============================
```

---

## 8. Test Infrastructure Deliverables Index
1. `d:\HACKATHON\TEST_INFRA.md`: This comprehensive architecture specification.
2. `d:\HACKATHON\tests\test_presentation_transformation.py`: The executable automated test implementation.
3. `d:\HACKATHON\TEST_READY.md`: Formal test readiness declaration with complete coverage matrix.
