# Viva Preparation Guide: UI/UX & Situational Protocol Specialist

**Role:** "I designed the Liquid Glassmorphism design system, mobile-first touch ergonomics, and the Situational First-Aid Protocol Sheet."

**Elevator Pitch:**
"I designed the visual and situational user experience of ASHA. I created a high-contrast Liquid Glassmorphism interface with dark mode and Tiranga Saffron/Green accents to induce calm during emergencies. Most importantly, I designed and implemented our biggest breakthrough: the Situational First-Aid Action Sheet (`ClinicalProtocolSheet.tsx`), providing life-saving medical posture and critical DO NOT DO warnings to bystanders during the transit void."

## Design Philosophy & Clinical UI Components
- **Liquid Glassmorphism Aesthetic:** Semi-transparent panels (`backdrop-filter: blur(20px)`), high contrast typography, and color-coded ESI severity badges (Red, Yellow, Green) for instant visual comprehension under extreme stress.
- **Situational First-Aid Sheet (`ClinicalProtocolSheet.tsx`):**
  - High-visibility emergency header with ESI level and target ward.
  - Bold, single-sentence immediate posture command (e.g. *"Elevate Torso at 45° Semi-Fowler Stance with Bent Knees"*).
  - Rapid 10-second ABC assessment.
  - Numbered step-by-step tactical first-aid checklist.
  - **CRITICAL DO NOT DO Warnings:** High-contrast callout boxes preventing fatal layman errors (e.g. never force water into unconscious victims).
  - Bystander Calming Script with psychological reassurance phrases.
- **Touch Ergonomics:** Extra-large touch targets ($>48\text{px}$) with active tactile scale feedback, designed for one-handed operation on bumpy ambulance rides.

## Tough Judge Questions & Winning Answers

**1. "Why is the Situational First-Aid Sheet considered your biggest plus point?"**
*Answer:* Because in medical emergencies, the transit period is a fatal black hole. Over 50% of cardiac and trauma deaths occur before reaching the hospital. Family members panic and commit fatal errors like giving water to an unconscious patient (causing pulmonary aspiration asphyxiation) or letting a cardiac patient walk. Our situational sheet tells them *exactly what to do right now* to stabilize the patient until arrival.

**2. "Why use dark mode for an emergency healthcare app?"**
*Answer:* Medical emergencies frequently occur at night or in dimly lit conditions. Dark mode reduces screen glare, conserves battery on OLED smartphone displays during transit, and creates high visual contrast for red and yellow clinical priority alerts.

**3. "How did you design the Hospital Admin Desk for busy nurses?"**
*Answer:* ER nurses work under extreme cognitive load. We eliminated multi-step forms. The Admin Desk features 1-tap increment/decrement buttons for bed counts and shift nurses, a live holds queue, and a prominent 4-digit OTP admission box that verifies arrivals in under 2 seconds.

**4. "What medical standards were used for the first-aid instructions?"**
*Answer:* All protocols are derived from peer-reviewed clinical standards: AHA 2020 Guidelines for CPR and STEMI (Semi-Fowler stance), AHA/ASA Stroke Guidelines (FAST protocol and recovery position), and ACS ATLS for hemorrhage control and tourniquets.

**5. "How accessible is the interface for elderly or non-tech-savvy citizens?"**
*Answer:* The app requires zero login, has a prominent microphone button to dictate in natural Bengali or English, features 18px+ readable typography, and provides high-contrast visual status banners that communicate instantly without reading paragraphs of text.
