# Master Project Plan: ASHA Emergency Logistics Engine

> **Smart India Hackathon (SIH) 2026** | **Open Innovation Category**  
> **Theme:** MedTech / BioTech / HealthTech  
> **Team Name:** `TEAM ASHA` | **Team Leader:** `SHAYAK DAS`  
> **Problem Statement Title:** *Mitigating Emergency Golden-Hour Fatalities Caused by In-Transit Bed Allocation Latency and Static Hospital Resource Visibility*  

## Architecture Overview
- **Citizen Web App (`v2/` & `public/`)**: React 18 + TypeScript + Vite, Tailwind CSS + Liquid Glassmorphism, Leaflet.js + OpenStreetMap, OSRM road snapping & routing, W3C Web Speech API (`bn-IN` / `en-IN`), internal clinical translation engine (`translateBengaliToEnglish`), Situational First-Aid sheet (`ClinicalProtocolSheet.tsx`).
- **Hospital ER Desk (`hospital-admin-app/`)**: React 18 + TypeScript, Supabase Realtime WebSockets, 4-digit OTP patient check-in terminal, 1-tap shift nurse and ward capacity overrides, live blood stock inventory.
- **Backend & Cloud Services**: Supabase PostgreSQL 15 cloud database with real-time replication (`active_holds`, `admitted_patients`, `hospital_overrides`), fallback Python Flask microservice, and HTML5 BroadcastChannel for zero-latency local inter-tab synchronization.

## Core Milestones
| # | Milestone Name | Scope & Technical Implementation | Status |
|---|----------------|----------------------------------|--------|
| 1 | M1: Full-Screen Map & Unified Search UI | Full-screen Leaflet map canvas, floating search bar, slidable bottom drawer sheet, unified search supporting symptoms & blood groups, bounds auto-zoom. | DONE |
| 2 | M2: Dynamic Soft-Lock & 4-Digit OTP Engine | 15-minute soft lock reserving 1 hospital bed, 4-digit OTP generation, live GPS directional vector loop (`TOWARD`, `STATIONARY`, `AWAY`), wrong-direction auto-cancellation, ER desk 4-digit OTP admission. | DONE |
| 3 | M3: Native Bengali Speech Translation | Continuous speech-to-text in Bengali (`bn-IN`) and English (`en-IN`), internal `translateBengaliToEnglish()` converting native script (`বুকে ব্যথা`) into canonical clinical keywords, ESI v4 triage classification, Hinglish removal. | DONE |
| 4 | M4: Live Situational First-Aid Protocols | **OUR BIGGEST PLUS POINT:** Immediate life-saving physical positioning (Semi-Fowler 45°, Recovery position, direct pressure tourniquets), 10-second ABC check, numbered clinical steps, DO NOT DO warnings, and calming scripts. | DONE |
| 5 | M5: Staffed Bed Math & Zero-Friction Nurse Desk | Nurse-to-patient ratios ($1:1$ ICU, $1:2$ PICU, $1:6$ Ward), 1-tap bed/nurse incrementors, real-time WebSocket sync, instant patient discharge bed release. | DONE |
| 6 | M6: Production Cloud Deployments | Deployed on Vercel Edge: Citizen App (`ashaien.vercel.app`), Admin Desk (`ashaien-admin.vercel.app`), SIH 2026 6-slide presentation completed. | DONE |

## Code Layout
- `v2/`: Modern React + TypeScript production Citizen Resuscitation Web App.
  - `src/components/ClinicalProtocolSheet.tsx`: Live Situational First-Aid & En-Route Action Protocols sheet.
  - `src/components/VoiceTriageInput.tsx`: Microphone input with English & Bengali speech recognition.
  - `src/utils/triageClassifier.ts`: ESI triage classifier + `translateBengaliToEnglish()`.
  - `src/utils/distance.ts`: Haversine formula & OSRM road distance calibration.
  - `src/data/protocols.ts`: 9 clinical first-aid protocol definitions.
  - `src/data/hospitals.ts`: 30 verified Kolkata emergency hospitals dataset.
- `hospital-admin-app/`: Hospital ER Command Desk Portal for nurses.
- `docs/`: 9 comprehensive technical dossier blueprints covering architecture, triage, navigation, locks, cloud sync, clinical protocols, judge defense, business strategy, and interconnection.
