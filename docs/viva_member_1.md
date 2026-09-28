# Viva Preparation Guide: Team Leader & Systems Architect (Shayak Das)

**Role:** "I designed the overarching architecture of ASHA, established the problem statement, and led the integration of our dual-app emergency resuscitation grid."

**Elevator Pitch:**
"I am Shayak Das, Team Leader of Team ASHA. We engineered ASHA to eliminate the fatal 2.4 hospital gate rejection cycle in India during the critical Golden Hour. By replacing static dashboards with 15-minute dynamic GPS soft-locks and direct 4-digit OTP admissions, and bridging the en-route transit void with live Situational First-Aid protocols, we prevent preventable deaths before the ambulance ever reaches the ER gates."

## Technical Architecture & Core System Blueprint
- **System Vision:** Dual-app architecture connecting Citizens (`ashaien.vercel.app`) and Hospital ER Desks (`ashaien-admin.vercel.app`) in real time via Supabase WebSockets.
- **Why OTP instead of QR Codes:** In real-world emergency triage bays at 2 AM, rain, darkness, cracked phone screens, camera glare, and dead batteries cause optical barcode scanning to fail. A 4-digit OTP can be spoken aloud in 1 second, entered by the triage nurse in 2 seconds, and requires zero specialized optical hardware.
- **Our Biggest Plus Point (Situational First-Aid):** Over 50% of cardiac and trauma deaths occur in-transit due to bystander panic or fatal mistakes (e.g. pouring water down an unconscious person's throat). ASHA renders real-time medical protocols (`ClinicalProtocolSheet.tsx`) providing immediate life-saving posture (Semi-Fowler 45° for cardiac, Recovery position for stroke), 10-second ABC assessment, tactical checklists, and critical DO NOT DO warnings while traveling.

## Tough Judge Questions & Winning Answers

**1. "What is your official team identity and category?"**
*Answer:* We are **TEAM ASHA**, led by Shayak Das, competing in the **Student Innovation Open Category (Theme: MedTech / BioTech / HealthTech)**. Our problem statement is *'Mitigating Emergency Golden-Hour Fatalities Caused by In-Transit Bed Allocation Latency and Static Hospital Resource Visibility'*.

**2. "Why didn't you use QR code scanners at hospital gates?"**
*Answer:* In real emergency resuscitation bays, ambulances arrive in chaotic conditions. Asking a panicked family member to unlock their phone, turn up screen brightness, and hold it steady in front of a camera scanner is unrealistic. A 4-digit numeric OTP can be spoken verbally across the desk in 2 seconds, keyed into any terminal or tablet without leaving the desk, and works even if the phone screen is shattered or battery dies.

**3. "What is your single biggest differentiator from other hospital finder apps?"**
*Answer:* Our **Live Situational First-Aid & En-Route Action Protocols**. Securing a bed is useless if the patient dies during the 30–45 minutes of transit. ASHA turns panicked family members into active first responders by displaying exact physical positioning (Semi-Fowler 45° with bent knees, recovery position, tourniquets), step-by-step checklists, and critical DO NOT DO warnings.

**4. "What stops people from hoarding beds across the city?"**
*Answer:* We employ a 4-tier defense: 15-minute strict hold limit, 1-hold-per-device rate limiting, a 50% public hold cap (50% reserved for 108/walk-in trauma), and live GPS vector telemetry that automatically cancels the hold if the user moves away from the hospital.

**5. "How do you handle hospital adoption when doctors are already overworked?"**
*Answer:* Our Hospital Admin Desk (`ashaien-admin.vercel.app`) is built for zero administrative overhead. Nurses don't fill EHR forms—they verify arrivals by entering 4 digits in under 2 seconds and adjust beds with 1-tap `+`/`-` buttons.
