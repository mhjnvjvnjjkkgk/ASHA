# 🏥⚡ ASHA — Automated System for Hospital Allocation

> **Smart India Hackathon (SIH) 2026** | **Open Innovation Category**  
> **Theme:** MedTech / BioTech / HealthTech  
> **Problem Statement Title:** *Mitigating Emergency Golden-Hour Fatalities Caused by In-Transit Bed Allocation Latency and Static Hospital Resource Visibility*  
> **Team Name:** `TEAM ASHA` | **Team Leader:** `SHAYAK DAS`  

---

## 🌐 Live Production Deployments
- 📱 **Citizen Resuscitation Web App:** [https://ashaien.vercel.app](https://ashaien.vercel.app)
- 🏥 **Hospital ER Command Desk Portal:** [https://ashaien-admin.vercel.app](https://ashaien-admin.vercel.app)

---

## 🚑 What is ASHA?

**ASHA** is an autonomous real-time emergency triage, navigation, and bed reservation engine engineered to eliminate **Ambulance Wandering** and **Pre-Hospital In-Transit Fatalities** during the critical **Golden Hour** (the first 60 minutes of trauma, stroke, and cardiac arrest).

Traditional emergency healthcare portals fail because they display **"Ghost Beds"** (physical furniture without active on-duty nurses), rely on static once-a-day manual spreadsheets, require heavy sign-up friction, and leave families in an **"En-Route Black Hole"** with zero guidance while the ambulance travels.

ASHA bridges this crisis by connecting citizens, ambulances, and hospital ER desks in real-time.

---

## 🌟 Core Breakthroughs & Features

### 1. 🩸 Live Situational First-Aid & En-Route Action Protocols (OUR BIGGEST PLUS POINT)
- **Why this was done:** In India, over 50% of trauma and cardiac arrest deaths occur before the patient ever reaches the hospital bay, caused by bystander panic or fatal layman blunders (e.g., pouring water down an unconscious person's throat causing aspiration asphyxia, or letting a heart attack victim walk).
- **How it works:** The instant a symptom is detected or a bed is reserved, ASHA renders an actionable medical protocol sheet (`ClinicalProtocolSheet.tsx`):
  - **Immediate Life-Saving Posture:** Semi-Fowler 45° torso elevation with bent knees for cardiac emergencies; Recovery Position on left side for unconscious/stroke patients; continuous direct pressure & high tourniquet for arterial bleeding.
  - **10-Second Rapid ABC Assessment:** Airway, Breathing, and Circulation check.
  - **Step-by-Step Tactical Checklist:** Numbered clinical stabilization actions.
  - **CRITICAL DO NOT DO Warnings:** Clear prohibitions against fatal layman mistakes.
  - **Bystander Calming Script:** Psychological stabilization phrases to prevent panic during transit.

### 2. 🎙️ Native Bengali Speech Recognition + In-Memory Clinical Translation Engine
- **Why this was done:** Spoken Bengali in the browser produces native script (`"বুকে ব্যথা"`, `"শ্বাসকষ্ট"`, `"রক্তক্ষরণ"`). However, clinical triage rule catalogs, ESI v4 standards, and hospital ward codes are standardized on English clinical terminology (`cardiac_icu`, `acute coronary syndrome`, `STEMI`).
- **How it works:** A high-speed internal translation engine (`translateBengaliToEnglish()`) intercepts native Bengali script and maps it directly into canonical English clinical terms (`acute chest pain heart attack cardiac angina buke betha`).
- **Clinical Rationale:** Achieves **instant zero-latency translation with 0 API costs, 0 external cloud dependencies, and 100% offline resilience**, so a patient in severe distress speaking Bengali is triaged with identical clinical accuracy to an English speaker. (Hinglish was completely removed to ensure razor-sharp acoustic accuracy).

### 3. 🔒 15-Minute Dynamic GPS Soft-Lock Bed Reservation Engine
- **Why this was done:** Eliminates the fatal race condition where an ambulance arrives at an ER only to find the last ICU bed was taken 2 minutes prior.
- **Anti-Hoarding Vector Telemetry:** Continuously monitors user movement every 10 seconds:
  - **TOWARD (Approaching):** 15-minute countdown pauses and displays a live dynamic ETA.
  - **STATIONARY (Not Moving):** 15-minute countdown continues to decrement.
  - **AWAY (Moving Away):** Prompts Wrong Direction Alert; auto-cancels the hold over consecutive checks to return the bed to the public pool and prevent malicious hoarding.

### 4. 🔑 Direct 4-Digit Gate OTP Admission (QR Codes Eliminated)
- **Why QR was removed:** In an active, chaotic 2 AM emergency bay with rain, darkness, cracked phone screens, camera glare, and dead batteries, optical scanning causes fatal friction.
- **Why 4-digit OTP is superior:** A 4-digit number can be spoken aloud by a paramedic or bystander in under 2 seconds, keyed into the nurse's desk terminal with zero delay, or read off an SMS backup.

### 5. 🧮 Staffed Beds vs. Ghost Beds Formula
- A physical bed without an assigned nurse is a death trap. ASHA dynamically enforces nurse-to-patient staffing ratios:
  - **ICU / Cardiac ICU:** 1 Nurse : 1 Patient
  - **Pediatric ICU (PICU):** 1 Nurse : 2 Patients
  - **General Ward:** 1 Nurse : 6 Patients
- Staffed Beds = min(Physical Beds, On-Duty Nurses * Ratio)

### 6. 🏥 Zero-Friction Hospital ER Admin Desk
- Designed for overworked ER triage nurses: 1-tap OTP redemption, 1-tap bed occupancy adjustment (+ / -), and 1-tap patient discharge to restore beds live. Zero forms, zero EHR administrative friction.

---

## 🛠️ Complete Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript + Vite 6 |
| **Styling & UI** | Tailwind CSS + Vanilla CSS (Liquid Glassmorphism, Saffron/Emerald accents) + Lucide Icons |
| **Maps & Routing** | Leaflet.js + OpenStreetMap (CartoDB Dark Tiles) + OSRM C++ Routing API |
| **Speech Engine** | W3C Web Speech API (bn-IN, en-IN) + Internal Bengali-to-Clinical Translation |
| **Cloud Database** | Supabase (PostgreSQL 15 + Realtime WebSocket Engine) + HTML5 BroadcastChannel |
| **Cloud Hosting** | Vercel Edge Cloud Infrastructure |

---

## 📚 Comprehensive Documentation Suite (`docs/`)

The repository includes 9 exhaustive master technical blueprints located in `docs/`:

1. [`docs/01_master_architecture_overview.md`](./docs/01_master_architecture_overview.md) — Master Architecture & Core Tech Stack Blueprint
2. [`docs/02_multilingual_ai_triage_speech_engine.md`](./docs/02_multilingual_ai_triage_speech_engine.md) — Speech-to-Text & Bengali Clinical Translation Engine
3. [`docs/03_maps_routing_road_snapping_engine.md`](./docs/03_maps_routing_road_snapping_engine.md) — OSRM Road Snapping & Geospatial Vector Navigation
4. [`docs/04_softlock_hardlock_reservation_engine.md`](./docs/04_softlock_hardlock_reservation_engine.md) — 15-Minute Soft-Lock & 4-Digit OTP Gate Verification
5. [`docs/05_realtime_cloud_sync_admin_portal.md`](./docs/05_realtime_cloud_sync_admin_portal.md) — Dual-App Realtime Cloud Sync & Zero-Friction ER Desk
6. [`docs/06_clinical_protocols_ui_system.md`](./docs/06_clinical_protocols_ui_system.md) — Situational First-Aid Protocols & Staffed Bed Math
7. [`docs/07_judge_defense_30_critical_qa.md`](./docs/07_judge_defense_30_critical_qa.md) — 30 Critical Judge Defense Q&As & Stress-Test Armor
8. [`docs/08_business_competition_scaling_blueprint.md`](./docs/08_business_competition_scaling_blueprint.md) — Business Feasibility, Monetization & Competitor Matrix
9. [`docs/09_complete_system_interconnection_guide.md`](./docs/09_complete_system_interconnection_guide.md) — Complete System Interconnection & Master Data Flow

---

## 👥 Team Identity
- **Team Name:** `TEAM ASHA`
- **Team Leader:** `SHAYAK DAS`
- **Category:** Student Innovation (Open Category — Theme: MedTech / BioTech / HealthTech)
- **Built for:** Smart India Hackathon (SIH) 2026
