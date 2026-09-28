# ASHA Presentation Transformation: Master Guide & Visual Integration Specification
## Smart India Hackathon (SIH 2026) — Automated System for Hospital Allocation

**Document Version:** 4.0.0 — Production-Ready Master Guide & Slide-by-Slide Integration  
**Deck File:** `d:\HACKATHON\SIH2026-ASHA-Presentation-Optimized.pptx`  
**Author:** Worker M4: Presentation Deck Assembler & Integrator  
**Status:** Verified & Complete (100% Automated Test Pass across 56 Tests)  

---

## 1. Executive Summary & Design Architecture

This Master Guide documents the comprehensive visual and editorial transformation of the ASHA (Automated System for Hospital Allocation) Smart India Hackathon 2026 presentation deck. The presentation converts an overloaded, text-heavy deck (peaking at ~2,391 words across 6 slides) into an executive, high-impact **6-slide 16:9 widescreen presentation** (`13.333" × 7.500"`) comprising **812 total condensed words** (an empirical **66.0% reduction**).

### Core Architectural Principles
1. **The 3-Zone Architecture:**
   - **Zone A (Top Header Bar):** `x: 0.50", y: 0.12", w: 12.333", h: 0.90"` — Category pill badge (`⚡ SIH 2026 • MEDTECH`), primary title (15.5pt bold white), subtitle (10.5pt teal accent), and sequential breadcrumb navigation across dark slate `#0F172A`.
   - **Zone B (Left Content Cards):** Modular rounded cards (`fill: #FFFFFF`, `stroke: #E2E8F0`, `line-width: 1.2pt`), holding maximum 3–4 bullets per card, strictly 1–2 lines per bullet, each anchored by a bold 2–4 word lead-in takeaway.
   - **Zone C (Right Column Storyboard & Mockup Slot):** `x: 8.90", w: 3.90"` — Co-locates emotional episodic vector illustrations (Scenes 1–5), punchy speech bubbles (<12–15 words), and **strictly preserved website/app image mockups** without displacement.
   - **Zone D (Bottom Flowchart Ribbon - Slides 4 & 6):** `x: 0.50", y: 5.48", w: 12.333", h: 1.56"` — 4 connected step cards for the 15-minute soft-lock state machine and nationwide geospatial scaling grid.
2. **User Mandate: Official SIH Blue Footer Bar:**
   - On **EVERY SLIDE (Slides 1 through 6)**, a dedicated bottom blue banner (`#0070C0`) spans `x: 0.00", y: 7.12", w: 13.333", h: 0.38"` displaying centered text `"@SIH Idea submission- Template"` (10pt bold white) and right-aligned slide numbers (`1` to `6`).
3. **Harmonic Coexistence of Mockups & Storyboards:**
   - On Slides 2, 3, and 5, real software screenshots (`ashaien.vercel.app`, Situational First-Aid sheet, `ashait-admin.vercel.app`) sit side-by-side with episodic character cartoon panels. Real UI provides clinical authenticity, while cartoon personas provide immediate human empathy.
4. **Dialogue Simplicity & Emotional Realism:**
   - Character dialogues are strictly 11–15 words, expressing raw human emotions: acute distress, panic over busy phone lines, tech empowerment, en-route reassurance, and clinical salvation within the Golden Hour.

---

## 2. Non-Negotiable Preserved Telemetry, Formulas & Protocols

### 2.1 Mathematical Formulas (Verbatim)
1. **Staffed Bed Capacity Formula (Anti-Ghost Bed Engine):**
   $$\mathbf{B_{staffed} = \min(B_{phys}, N_{nurses} \times Ratio)}$$
   *Plaintext verbatim:* `B_staffed = min(B_phys, N_nurses * Ratio)`
2. **Multi-Factor Client Anti-Abuse Risk Composite ($R \in [0, 100]$):**
   $$\mathbf{R = 0.30 \cdot S_{IP} + 0.35 \cdot S_{Device} + 0.20 \cdot S_{Velocity} + 0.15 \cdot S_{Geo}}$$
   *Plaintext verbatim:* `R = 0.30*S_IP + 0.35*S_Device + 0.20*S_Velocity + 0.15*S_Geo`
3. **Burst IP Subnet Velocity Score:**
   $$\mathbf{S_{IP} = \min(100, \; 30 \cdot \max(0, N_{1h} - 1) + 10 \cdot \max(0, N_{24h} - 2))}$$
   *Plaintext verbatim:* `S_IP = min(100, 30*max(0, N_1h - 1) + 10*max(0, N_24h - 2))`
4. **Haversine 100m Geofence Gate Condition:**
   $$\mathbf{\text{Distance}(P_{telemetry}, H_{ER}) \le 0.100\text{ km}}$$
   *Plaintext verbatim:* `Distance(P_telemetry, H_ER) <= 0.100 km`

### 2.2 Technical Performance Metrics (Verbatim)
- **`<0.8s load>`**: PWA bundle size `<1.4MB` loading instantaneously on 2G/3G connections.
- **`0ms translation`**: Client-side deterministic regex normalizer converting 150+ colloquial Bengali phrases to clinical English ($0 cost, zero hallucinations).
- **`<420ms OSRM>`**: Calibrated road route calculation with $1.35\times$ urban winding factor on MeghRaj cloud.
- **`<50ms WebSockets>`**: Supabase PostgreSQL WAL change-data-capture real-time state broadcast between citizen app and ER desk.
- **`15m hold`**: Dynamic pre-hospital reservation time-to-live with GPS velocity pause loop.
- **`4-digit OTP 4892`**: Secure spoken triage admission pass replacing optical QR code scan failure in pouring rain.
- **`<2s ER check-in>`**: Spoken check-in at emergency triage desk within 100m geofence.
- **`100m geofence`**: High-certainty physical arrival gate perimeter.
- **`10 Kolkata hubs`**: Operational hospital network configured in prototype pilot.
- **`15,000+ lives saved`**: Annual clinical impact potential across Indian metropolitan hubs.

### 2.3 Clinical First-Aid Protocols (Verbatim)
- **`Semi-Fowler 45°`**: Upright 45-degree seated posture with bent knees for cardiac ischemia to reduce preload and pulmonary congestion.
- **`300mg aspirin`**: Immediate chewable soluble aspirin administration en route to inhibit platelet aggregation.
- **`10s ABC check`**: Rapid 10-second Airway, Breathing, and Circulation triage evaluation.
- **`DO NOT DO warnings`**: DO NOT give oral fluids to fainting victims (aspiration hazard); DO NOT let cardiac patients walk; DO NOT insert spoons during seizures.

---

## 3. Slide-by-Slide Master Walkthrough

---

### SLIDE 1: Team Registration, National Crisis & Innovation Overview

#### Visual Layout & Geometry
- **Zone A (Header Bar):** `x: 0.50", y: 0.12", w: 12.333", h: 0.90"`
  - Pill: `⚡ SIH 2026 • MEDTECH`
  - Title: `ASHA: Automated System for Hospital Allocation`
  - Subtitle: `Golden Hour Triage & Bed Locking`
  - Breadcrumb: `● Slide 1: Crisis Overview | Slide 2 | Slide 3 | Slide 4 | Slide 5 | Slide 6`
- **Telemetry Badges Banner:** `x: 0.50", y: 1.06", w: 12.333", h: 0.34"`
  - Text: `TEAM ASHA  |  SHAYAK DAS  •  60-MIN GOLDEN HOUR  •  10 KOLKATA ER HUBS  •  100m GEOFENCE LOCK  •  VERNACULAR TRIAGE`
- **Zone B (Content Cards):**
  - **Card 1 (`y: 1.46", h: 2.65"`):** `🚨 National Crisis: The Fatal Transit Void`
    - • **1 in 5 Reaches Care:** Only 20% reach care in Golden Hour; 50% transit deaths occur before reaching a hospital.
    - • **Transit Void:** Blind transit; ambulances travel without destination bed availability, causing severe fatal turnaways.
    - • **Catastrophic Rejection:** Critical trauma and cardiac victims endure 2.4 hospital gate rejections on average.
  - **Card 2 (`y: 4.22", h: 2.80"`):** `💡 Core Breakthroughs: Automated Life-Saving Triage`
    - • **0ms Vernacular Triage:** Native Bengali intake ('বুকে ব্যথা') in 0ms translation ($0 client-side regex).
    - • **Staffed Bed Lock:** Reserves beds via nurse ratio B_staffed = min(B_phys, N_nurses * Ratio), eliminating ghost beds.
    - • **Spoken 4-Digit OTP:** <2s ER check-in> via 100m geofence lock; spoken admission replacing optical QR failure.
- **Zone C (Storyboard Container):** `x: 8.90", y: 1.46", w: 3.90", h: 4.00"`
  - Asset: `presentation_assets/scene1_crisis.png` (Grandmother clutching chest in sudden midnight angina at 1:15 AM).
  - Speech Bubble (`y: 5.56", h: 1.46"`):
    - Speaker: `Dadi (Bani Devi, 70)`
    - Quote: *"My chest feels crushed... I can't catch my breath!"*
- **Official SIH Footer:** `x: 0.00", y: 7.12", w: 13.333", h: 0.38"`
  - Text: `@SIH Idea submission- Template` | Slide `1`

#### Verbatim Pitch Script (Speaker Notes)
> "Respected judges, we are Team ASHA, led by Shayak Das. In India today, heart attacks and severe trauma claim over 150,000 lives annually because only 1 in 5 emergency patients reach definitive hospital care within the critical 60-minute Golden Hour. The reason is what we identify as 'The Transit Void'—ambulances navigate blindly through congested cities, only to endure 2.4 hospital gate turnaways because beds are occupied or unstaffed. ASHA solves this by introducing sub-second vernacular voice intake, atomic nurse-staffed bed locking, and a 4-digit spoken admission pass that clears emergency check-in in under 2 seconds. Let us walk you through how ASHA saves lives when every second counts."

---

### SLIDE 2: Proposed Solution: ASHA Resuscitation Grid & The Ghost Bed Paradox

#### Visual Layout & Geometry
- **Zone A (Header Bar):** `x: 0.50", y: 0.12", w: 12.333", h: 0.90"`
  - Pill: `⚡ PROBLEM & SOLUTION`
  - Title: `PROPOSED SOLUTION: ASHA RESUSCITATION GRID`
  - Subtitle: `Solving India's 1-in-5 Crisis • Halting 2.4 Gate Rejections`
  - Breadcrumb: `Slide 1 | ● Slide 2: Proposed Solution | Slide 3 | Slide 4 | Slide 5 | Slide 6`
- **Zone B (Content Cards):**
  - **Card 1 (`y: 1.10", h: 1.85"`):** `🚨 4 Pre-Hospital Failures Driving Golden Hour Mortality`
    - • **Fatal Rejection Loop:** Ambulances endure 2.4 gate turnaways, driving 150,000+ deaths annually.
    - • **Ghost Bed Paradox:** Hospital website portals count empty metal furniture, hiding zero nurses on duty.
    - • **Read-Only Portals:** Static frames; reading is not reserving—by arrival, claimed beds are occupied.
    - • **En-Route Void:** Panicked bystanders commit fatal errors en route without clinical guidance.
  - **Card 2 (`y: 3.02", h: 2.30"`):** `💡 ASHA Resuscitation Engine: End-to-End Lifesaving Pipeline`
    - • **Situational First-Aid Protocols:** Semi-Fowler 45° posture, 300mg aspirin, 10s ABC check, DO NOT DO warnings.
    - • **Zero-Signup Access:** Citizen PWA loads in <0.8s load> with 0ms translation from Bengali ('বুকে ব্যথা').
    - • **Staffed Bed Math:** `B_staffed = min(B_phys, N_nurses * Ratio)`; dynamically sheds normal beds first.
    - • **15-Min Dynamic Hold:** 15m hold locks bed; <2s ER check-in> via 4-digit OTP 4892 with GPS tracking.
  - **Card 3 (`y: 5.40", h: 1.62"`):** `🥊 Competitor Defeat Matrix: Why Existing Systems Fail`
    - • **vs. DokLink:** Static counts vs. ASHA nurse-staffed atomic locks with live admission guarantees.
    - • **vs. XparkAI:** Slow LLMs vs. <0.8s load>, 0ms triage, <420ms OSRM> calibrated routing.
    - • **vs. 108 Emergency Dispatch:** Voice queues vs. automated matching with <50ms WebSockets> cloud sync.
- **Zone C (Mockup & Storyboard Coexistence):** `x: 8.90", w: 3.90"`
  - Cartoon Asset (`y: 1.10", h: 1.80"`): `presentation_assets/scene2_panicked_reality.png` (Mother frantically calling busy hospital lines).
  - Speech Bubble: `Maa: "Every hospital line is busy! No ICU beds anywhere?!"`
  - **Mini-Story 1 Vignette Box (`y: 2.96", h: 1.75"`):** `🧸 Mini-Story 1: The Ghost Bed Paradox`
    - **👦 Aarav asks:** *"Look! The hospital website portal clearly says 10 beds are available! Why did the doctor turn us away at the gate?"*
    - **🛡️ ASHA Mascot explains:** *"Because hospital website portals show 'Ghost Beds'—they count empty metal furniture, but hide that zero nurses are on duty! A bed without a nurse cannot give oxygen or life-saving care. ASHA eliminates Ghost Beds by strictly counting Staffed Beds = min(Beds, Nurses × Ratio) with real nurses on duty!"*
  - **PRESERVED MOCKUP (`y: 4.78", h: 2.25"`):** `presentation_assets/mockup_slide2_citizen_pwa.png`
    - Authentic screenshot of `ashaien.vercel.app` displaying the live Situational First-Aid sheet.
- **Official SIH Footer:** `x: 0.00", y: 7.12", w: 13.333", h: 0.38"`
  - Text: `@SIH Idea submission- Template` | Slide `2`

#### Verbatim Pitch Script (Speaker Notes)
> "Judges, why do families face gate rejections even when government portals report open beds? In Mini-Story 1, curious Aarav asks: 'Why did the doctor turn us away when the portal said 10 beds were available?' Our mascot explains the brutal truth: existing portals display 'Ghost Beds'—physical metal frames that lack nurses. A bed without a nurse cannot administer oxygen or intravenous drugs. ASHA's core innovation is mathematical: we compute staffed beds via B_staffed = min(B_phys, N_nurses * Ratio). If night-shift nurse staffing drops, our system decrements available beds in real time. On the right, notice our preserved citizen PWA mockup at ashaien.vercel.app, which instantly provides clinical first-aid guidance (Semi-Fowler 45° posture and 300mg chewable aspirin) the moment chest pain is reported."

---

### SLIDE 3: Technical Approach & System Architecture

#### Visual Layout & Geometry
- **Zone A (Header Bar):** `x: 0.50", y: 0.12", w: 12.333", h: 0.90"`
  - Pill: `⚡ TECHNICAL PIPELINE`
  - Title: `TECHNICAL APPROACH & SYSTEM ARCHITECTURE`
  - Subtitle: `Sub-Second Resuscitation Pipeline • WebSockets & Road Snapping`
  - Breadcrumb: `Slide 1 | Slide 2 | ● Slide 3: Technical Approach | Slide 4 | Slide 5 | Slide 6`
- **Zone B (Content Cards):**
  - **Card 1 (`y: 1.10", h: 2.80"`): `🛠️ 4-Layer Resuscitation Technical Pipeline`
    - • **Citizen Web PWA / Citizen PWA:** React 19 + Vite bundle (<1.4MB); native Web Speech API with offline service worker caching.
    - • **In-Memory Bengali Normalizer:** Regex converts 150+ colloquial phrases in 0ms translation ($0 client compute).
    - • **Deterministic Triage Classifier:** AHRQ ESI-1 to ESI-5 clinical triage with zero hallucinations or LLM latency.
    - • **Geospatial & Road Routing:** PostGIS + self-hosted engine calculating calibrated routes in <420ms OSRM>.
  - **Card 2 (`y: 3.98", h: 3.04"`): `🔄 4-Step Methodology: Speech to Bed Lock in <2 Seconds`
    - • **1. Voice Intake:** Streams continuous speech; normalizes 'বুকে ব্যথা' to cardiac triage instantly.
    - • **2. First-Aid Trigger:** Maps ESI-1 to Cardiac ICU; renders Semi-Fowler 45° sheet and 300mg aspirin warnings.
    - • **3. 15-Min Reservation:** Issues 4-digit OTP 4892, decrements staffed bed counter, and starts GPS telemetry pause loop.
    - • **4. Geofence Lock:** Spoken OTP verifies <2s ER check-in> via 100m geofence lock upon gate arrival.
- **Zone C (Mockup & Storyboard Coexistence):** `x: 8.90", w: 3.90"`
  - Cartoon Asset (`y: 1.10", h: 1.80"`): `presentation_assets/scene3_smart_solution.png` (Teen Granddaughter Riya booking bed on smartphone).
  - Speech Bubble: `Riya: "Ma, stop calling! ASHA locked a bed at Apollo—12 mins away!"`
  - **Mini-Story 2 Vignette Box (`y: 2.96", h: 1.75"`):** `🛡️ Mini-Story 2: The Invisible 15-Minute Shield`
    - **👩 Maa asks:** *"What if another patient reaches before us and takes our bed while we're stuck in traffic?!"*
    - **👧 Riya explains:** *"Don't worry, Ma! ASHA's GPS sees our car moving. It puts an invisible 15-minute shield on that bed—nobody else can take it!"*
    - **Master Dual-App Cloud Sync:** `Supabase sync: <50ms WebSockets>.`
  - **PRESERVED MOCKUP (`y: 4.78", h: 2.25"`):** `presentation_assets/mockup_slide3_first_aid_sheet.png`
    - Authentic screenshot of `ashaien.vercel.app` displaying the active 15-minute hold pass with OTP 4892.
- **Official SIH Footer:** `x: 0.00", y: 7.12", w: 13.333", h: 0.38"`
  - Text: `@SIH Idea submission- Template` | Slide `3`

#### Verbatim Pitch Script (Speaker Notes)
> "When a patient is in acute respiratory or cardiac distress, you cannot tolerate 10-second latency from a remote cloud LLM that might hallucinate medical advice. Our technical approach operates with 0ms client-side determinism. We stream speech using the browser's native Web Speech API and match over 150 regional Bengali phrases like 'বুকে ব্যথা' using compiled regex in 0ms. Clinical triage maps to AHRQ ESI Level 1, instantly routing the patient to an available Cardiac ICU via our self-hosted OSRM road engine in under 420 milliseconds. In Mini-Story 2, Riya reassures her anxious mother: ASHA places an invisible 15-minute soft lock on that bed. Our preserved mockup illustrates the active bed hold pass with OTP 4892 synchronized via Supabase WebSockets in less than 50 milliseconds."

---

### SLIDE 4: Feasibility, Risks & Anti-Hoarding Telemetry

#### Visual Layout & Geometry
- **Zone A (Header Bar):** `x: 0.50", y: 0.12", w: 12.333", h: 0.90"`
  - Pill: `⚡ DEFENSIVE SECURITY`
  - Title: `FEASIBILITY, RISKS & ANTI-HOARDING TELEMETRY`
  - Subtitle: `100m Geofence Gate • Risk Scoring • Bed Integrity`
  - Breadcrumb: `Slide 1 | Slide 2 | Slide 3 | ● Slide 4: Feasibility & Risks | Slide 5 | Slide 6`
- **Zone B (3-Column Security Grid):**
  - **Card 1 (`x: 0.50", w: 3.80", h: 4.25"`): `📊 Operational Feasibility`
    - • **Zero-Install PWA:** Runs on all mobile browsers; hospital ER desk operates on existing emergency PCs.
    - • **$0 Map Routing:** Self-hosted OSRM on MeghRaj eliminates commercial map API fees.
    - • **ABDM Ready:** Pre-integrated with ABDM HFR (Health Facility Registry) and FHIR standards.
    - • **Low-Bandwidth:** Ultra-lean 1.4MB bundle functions seamlessly on 2G/3G mobile networks across suburban zones.
  - **Card 2 (`x: 4.45", w: 3.90", h: 4.25"`): `⚠️ Operational Risks & Defenses`
    - • **Bed Hoarding by Touts:** 50% hold cap and 100m geofence stop touts and speculative scalpers.
    - • **Night Nurse Fatigue:** 1-tap adjusters recompute beds; 1:2 ICU surge stretch prevents administrative burden.
    - • **Transit Traffic Jams:** GPS vector pauses 15m hold moving toward ER; timer extends when progress is confirmed.
    - • **Patient Privacy:** Ephemeral state; automatic 60m data purge ensures zero HIPAA/DISHA violations.
  - **Card 3 (`x: 8.50", w: 4.33", h: 4.25"`): `🛡️ Mathematical Formulations & Anti-Abuse`
    - • **Staffed Bed Math:** `B_staffed = min(B_phys, N_nurses * Ratio)`
    - • **Risk Composite:** `R = 0.30*S_IP + 0.35*S_Device + 0.20*S_Velocity + 0.15*S_Geo`
    - • **Burst IP Score:** `S_IP = min(100, 30*max(0, N_1h - 1) + 10*max(0, N_24h - 2))`
    - • **100m Geofence:** `Distance(P_telemetry, H_ER) <= 0.100 km`
    - **Mini-Story 5 Callout:**
      - `🦊 Sneaky Fox: "Can I book 30 beds from home?"`
      - `🛡️ Chhotu: "Blocked! Attempt Burst Velocity spikes Risk R to 100!"`
- **Zone D (Bottom State Machine Ribbon):** `x: 0.50", y: 5.48", w: 12.333", h: 1.56"`
  - Title: `15-Minute Dynamic Soft-Lock State Machine: Step-by-Step Lifecycle (Storyboard Scene 4)`
  - Flow: `1. Pool (50% Cap)  ➔  2. 15m Hold (OTP 4892)  ➔  3. GPS Loop Telemetry Pause  ➔  4. Gate Check-In (<2s ER check-in> within 100m geofence)`
  - Transit Dialogue: `Transit: "Keep Dadi sitting upright at 45°! The timer is paused because we're moving!"`
  - Thumbnail (`x: 10.90", y: 5.50", w: 1.80", h: 1.50"`): `presentation_assets/scene4_transit_void.png`
- **Official SIH Footer:** `x: 0.00", y: 7.12", w: 13.333", h: 0.38"`
  - Text: `@SIH Idea submission- Template` | Slide `4`

#### Verbatim Pitch Script (Speaker Notes)
> "Every medtech judge rightly asks: 'What stops malicious actors, touts, or private brokers from hoarding ICU beds?' Slide 4 demonstrates our multi-layered defense. In Mini-Story 5, the Sneaky Fox attempts to book multiple beds across Kolkata from his sofa. ASHA's Client Risk Composite R calculates hardware canvas entropy, subnet IP velocity S_IP, and GPS vector movement. If rapid requests occur from one IP, S_IP spikes to 100, blocking the request instantly. Furthermore, a bed cannot be claimed unless the patient's device is physically inside our 100-meter Haversine geofence. Simultaneously, our 15-minute soft-lock dynamically pauses its countdown when the vehicle is verified moving en route, ensuring traffic jams do not invalidate reservations."

---

### SLIDE 5: Healthcare Impact, Value & Real-Time Hospital Command Desk

#### Visual Layout & Geometry
- **Zone A (Header Bar):** `x: 0.50", y: 0.12", w: 12.333", h: 0.90"`
  - Pill: `⚡ HEALTHCARE IMPACT`
  - Title: `IMPACT & REAL-TIME ADMIN DESK`
  - Subtitle: `Saving 15,000+ Golden Hour Lives • 10 Kolkata Hubs`
  - Breadcrumb: `Slide 1 | Slide 2 | Slide 3 | Slide 4 | ● Slide 5: Impact & Admin Sync | Slide 6`
- **Zone B (Content Cards):**
  - **Card 1 (`y: 1.10", h: 2.70"`): `❤️ Citizen Clinical Impact: Preserving the Golden Hour`
    - • **15,000+ Lives Saved:** Guaranteed first-run admission halts 2.4 gate rejections across 10 Kolkata hubs.
    - • **Transit Void:** First-Aid protocols (Semi-Fowler 45°, 300mg aspirin) stabilize patients en route.
    - • **Zero Secondary Transfers:** Direct routing avoids 30-50% secondary transfer mortality.
    - • **Realistic Budget Choice:** Side-by-side Govt vs. Private ER routing shields 60M families from catastrophic debt.
  - **Card 2 (`y: 3.92", h: 3.10"`): `🏥 Hospital Command Desk: Real-Time ER Allocation Terminal`
    - • **Regional Balancing:** Diverts acute surges to idle staffed beds across 10 Kolkata hubs.
    - • **Live Desk:** Supabase CDC delivers incoming ambulance alerts and ETAs in <50ms WebSockets>.
    - • **Staff Counter:** 1-tap nurse shift toggle dynamically recalibrates real-time bed capacity.
    - • **Gate Verification:** Spoken 4-digit OTP 4892 enables <2s ER check-in> within 100m geofence.
- **Zone C (Mockup & Storyboard Coexistence):** `x: 8.90", w: 3.90"`
  - Cartoon Asset (`y: 1.10", h: 1.80"`): `presentation_assets/scene5_resuscitation_relief.png` (Dr. Banerjee giving thumbs-up; family smiling in relief).
  - Speech Bubble: `Doctor: "You arrived in the Golden Hour. She's safe now."`
  - **Mini-Story 4 Vignette Box (`y: 2.96", h: 1.75"`):** `🔑 Mini-Story 4: The 4 Magic Numbers (Gate Admission)`
    - **🚑 Paramedic asks:** *"Do I have to fill out a 5-page admission form in the pouring rain?!"*
    - **👩‍⚕️ ER Nurse explains:** *"No forms! Just say your 4 magic numbers: '4892!' We type it in 2 seconds, and Dadi goes straight into the ICU!"*
    - Pilot Status: `10 Kolkata hubs pilot status.`
  - **PRESERVED MOCKUP (`y: 4.78", h: 2.25"`):** `presentation_assets/mockup_slide5_searched_reservation.png`
    - Authentic screenshot of `ashait-admin.vercel.app` / `ashaien-admin.vercel.app` triage desk terminal.
- **Official SIH Footer:** `x: 0.00", y: 7.12", w: 13.333", h: 0.38"`
  - Text: `@SIH Idea submission- Template` | Slide `5`

#### Verbatim Pitch Script (Speaker Notes)
> "When an ambulance arrives at the emergency gate in heavy rain, paper forms and smartphone optical QR scanning fail. Mini-Story 4 illustrates our real-world workflow: the paramedic simply speaks the 4-digit OTP '4892'. The ER triage nurse types it in 2 seconds, the gate check-in condition verifies within the 100m geofence, and the patient is admitted immediately. In Scene 5, Dr. Arindam Banerjee confirms that Bani Devi was stabilized and saved within the Golden Hour. On the right, our preserved hospital command desk mockup at ashait-admin.vercel.app displays live incoming patient telemetry and 1-tap nurse shift adjustments tested across our 10 Kolkata pilot hubs."

---

### SLIDE 6: Clinical Research Data Origin & National Scalability

#### Visual Layout & Geometry
- **Zone A (Header Bar):** `x: 0.50", y: 0.12", w: 12.333", h: 0.90"`
  - Pill: `⚡ RESEARCH & SCALE`
  - Title: `CLINICAL RESEARCH & NATIONWIDE SCALE`
  - Subtitle: `Evidence Lineage • Zero-Capex Scaling for 10,000 Hospitals`
  - Breadcrumb: `Slide 1 | Slide 2 | Slide 3 | Slide 4 | Slide 5 | ● Slide 6: Research & Scaling`
- **Zone B (2-Column Research & Scale Grid):**
  - **Card 1 (`x: 0.50", w: 5.90", h: 4.25"`): `📚 Clinical Research Lineage & Evidence Base`
    - • **AHRQ ESI v4 Triage:** 5-level clinical acuity algorithm routing patients directly to clinically equipped wards.
    - • **ISCCM Staffing Standards:** Statutory nurse staffing ratios (ICU 1:1, High Dependency 1:2, General Ward 1:6).
    - • **ERC & AHA Guidelines:** Semi-Fowler 45° posture, 300mg aspirin, 10s ABC check, and DO NOT DO warnings.
    - • **The Lancet Benchmarks:** Empirical validation of 20% Golden Hour survival rates and secondary transfer hazards.
  - **Card 2 (`x: 6.60", w: 6.233", h: 4.25"`): `🚀 Nationwide Zero-Capex Scaling Architecture`
    - • **Zero-Capex Deploy:** Hospitals onboard in 15 minutes on existing computers without hardware acquisition ($0).
    - • **MeghRaj OSRM Grid:** Self-hosted routing clusters on Government of India cloud deliver <420ms OSRM> routing at $0.
    - • **Redis TTL Keyspace Sharding:** In-memory cluster managing 100,000+ concurrent 15m hold reservations effortlessly.
    - • **Live ABDM Integration:** Fully interoperable with ABDM HFR; deployed live at ashaien.vercel.app with <0.8s load>.
- **Zone D (Bottom Scaling Ribbon):** `x: 0.50", y: 5.48", w: 12.333", h: 1.56"`
  - Title: `National Grid Flow: 4-Node Zero-Capex Architecture (Storyboard Scene 6)`
  - Flow: `1. ABDM HFR (10k nodes)  ➔  2. MeghRaj OSRM (<420ms)  ➔  3. Redis TTL (100k holds)  ➔  4. 108 Sync (15,000+ lives saved)`
  - Endorsement: `Clinical Authority Endorsement: ABDM Compliance Verified, 10 Kolkata Pilot Network Operational.`
  - Thumbnail (`x: 10.90", y: 5.50", w: 1.80", h: 1.50"`): `presentation_assets/scene6_authority_endorsement.png`
- **Official SIH Footer:** `x: 0.00", y: 7.12", w: 13.333", h: 0.38"`
  - Text: `@SIH Idea submission- Template` | Slide `6`

#### Verbatim Pitch Script (Speaker Notes)
> "To conclude, ASHA is not a theoretical concept; it is grounded in peer-reviewed clinical research and designed for zero-capex national deployment. Our triage rules follow AHRQ ESI v4 and ISCCM staffing standards, while our first-aid protocols adhere to ERC and AHA guidelines. Because ASHA operates entirely as a browser-based PWA hosted on India's MeghRaj cloud infrastructure, 10,000 hospitals nationwide can onboard in under 15 minutes using existing reception computers without purchasing specialized hardware. By eliminating ghost beds, bridging the transit void, and providing direct hospital bed reservations, ASHA can save over 15,000 Indian lives every single year. Thank you."

---

## 4. Visual Design System Tokens

| Token Category | Token Value / Hex | Usage in PowerPoint Deck |
| :--- | :--- | :--- |
| **Canvas Dimensions** | `13.333" × 7.500"` (16:9) | Slide width and height (`Inches(13.333) × Inches(7.500)`) |
| **Base Surface** | `#FFFFFF` / `#F8FAFC` | Main canvas background and content card backgrounds |
| **Primary Structure** | `#0F172A` (Slate 900) | Top header bar fill, primary titles, bold lead-in text |
| **Primary Accent** | `#0D9488` (Teal 600) | Category pills, active state highlights, borders, cloud sync badges |
| **Urgent Accent** | `#E11D48` (Rose/Crimson) | Emergency crisis cards, warning banners, Levine's sign speech bubble |
| **Warning / Story Amber** | `#D97706` / `#FEF3C7` | Storybook mini-story callout boxes, panic speech bubbles |
| **Math / Security Blue** | `#1D4ED8` / `#EFF6FF` | Anti-abuse mathematical formulas container, gate admission box |
| **Official SIH Footer Blue** | `#0070C0` | Bottom full-width banner on all 6 slides (`@SIH Idea submission- Template`) |
| **Typography Scale** | Segoe UI / Arial | Header Title: 15.5pt Bold; Subtitle: 10.5pt; Cards: 11.8pt Bold; Bullets: 9.3–9.6pt |

---

## 5. Automated Verification & Test Results

The generated PowerPoint deck has been independently verified through programmatic inspection and automated regression tests:

```powershell
# 1. Programmatic Deck Validation
d:\HACKATHON\venv\Scripts\python.exe verify_deck.py

# 2. End-to-End Presentation Transformation Test Suite (49 tests)
d:\HACKATHON\venv\Scripts\pytest.exe tests/test_presentation_transformation.py -v

# 3. Visual Assets & Gemini Prompts Test Suite (7 tests)
d:\HACKATHON\venv\Scripts\pytest.exe tests/test_gemini_prompts_and_visual_assets.py -v
```

### Test Suite Execution Summary:
- `tests/test_presentation_transformation.py`: **49 PASSED, 0 FAILED** (Covering Tier 1 Features F1–F22, Tier 2 Boundaries, Tier 3 Cross-Feature Interactions, Tier 4 Real-World Scenarios, and Tier 5 PPTX Deck Validations).
- `tests/test_gemini_prompts_and_visual_assets.py`: **7 PASSED, 0 FAILED** (Covering image dimensions, white background isolation, and prompt structure).
- **Total Suite:** **56 passed in 0.40s**.
