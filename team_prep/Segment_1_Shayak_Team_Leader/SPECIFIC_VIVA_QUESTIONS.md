# 🎯 Specific Viva Questions & Winning Answers: Shayak Das
**Segment:** Segment 1: Master Architecture, System Integration & Dynamic Soft-Lock Reservation  
**Role:** Team Leader & Lead Systems Architect

Practice answering these questions out loud. Each answer is designed to be punchy, technically unassailable, and medically grounded.

---

### Q1. "What is the official team identity and category?"
**Winning Answer:** We are **TEAM ASHA**, led by Shayak Das, competing in the **Student Innovation Open Category (Theme: MedTech / BioTech / HealthTech)**. Our problem statement is *'Mitigating Emergency Golden-Hour Fatalities Caused by In-Transit Bed Allocation Latency and Static Hospital Resource Visibility'*.

### Q2. "What is ASHA's single biggest differentiator from Google Maps, Practo, or 108?"
**Winning Answer:** Our **Live Situational First-Aid En-Route Protocols**. Securing a bed is useless if the patient dies during the 30–45 minutes of transit. ASHA turns terrified family members into active first responders by displaying exact physical positioning (Semi-Fowler 45° with bent knees, recovery position, tourniquets), step-by-step checklists, and critical DO NOT DO warnings.

### Q3. "How does the 15-minute soft-lock reservation engine work?"
**Winning Answer:** When a citizen taps 'Lock Bed', the system atomically decrements the hospital's available staffed beds by 1, generates a unique 4-digit numeric OTP (1000–9999), and sets an active hold in Supabase with a 15-minute TTL expiration. Upon ER arrival, the nurse verifies the 4-digit OTP, converting the temporary hold into a permanent hard-locked admission.

### Q4. "How does the GPS directional vector tracker prevent bed hoarding?"
**Winning Answer:** Every 10 seconds, the client computes the velocity vector relative to the target hospital. If the user is approaching (`TOWARD`), the 15-minute timer pauses and dynamic ETA is shown. If stationary at home (`STATIONARY`), the 15-minute timer continues counting down. If moving away (`AWAY`), a wrong-direction alert triggers and the hold auto-cancels after consecutive checks, returning the bed to the public.

### Q5. "Why 4-digit OTP instead of QR codes?"
**Winning Answer:** At 2 AM in a chaotic ER resuscitation bay, ambulances arrive in heavy rain. Asking a panicked family member to unlock their phone, turn up screen brightness, and hold it steady in front of an optical camera scanner is unrealistic. A 4-digit numeric OTP can be spoken verbally across the desk in 1 second, keyed into any terminal or tablet in under 2 seconds, and works even if the phone screen is shattered or battery dies.

### Q6. "What happens if a hospital cancels a hold and how does the top floating banner stay synchronized?"
**Winning Answer:** When an ER nurse clicks 'Cancel / Re-Route', the mobile app intercepts the cloud update via WebSockets. It immediately scans for the next nearest hospital with staffed beds, calculates the new route, generates a new 4-digit OTP, and dispatches `setBookingAlert(...)` so the top floating banner instantly updates to display the new hospital name, address, and new 4-digit OTP!

### Q7. "Without user logins, what stops touts or rival hospitals from writing bots to lock all 30 beds in Kolkata?"
**Winning Answer:** We deploy a dual defense: an algorithmic **Multi-Factor Risk Scoring Engine** ($R \in [0, 100]$) and a physical **100m Hospital Geofence Hard-Lock Gate**. Before issuing a 15-minute soft-lock, the backend computes:
$$R = 0.30 \cdot S_{\text{IP}} + 0.35 \cdot S_{\text{Device}} + 0.20 \cdot S_{\text{Velocity}} + 0.15 \cdot S_{\text{Geo}}$$
Where $S_{\text{IP}} = \min(100, 30 \cdot \max(0, N_{\text{1h}} - 1) + 10 \cdot \max(0, N_{\text{24h}} - 2))$.
The $-1$ offset is a panic grace allowance so bona fide citizens score $S_{\text{IP}} = 0$. $\max(0, \dots)$ acts as a non-negative rectifier (ReLU) preventing negative scores from laundering bot fraud, while $\min(100, \dots)$ caps maximum saturation. A tout attempting 4 holds gets $S_{\text{IP}} = 100$ and triggers immediate rate-limiting and SMS OTP binding. Finally, even if an OTP is generated, the bed cannot be claimed remotely: the ER desk strictly validates that the patient's phone is within **100 meters** of the ER door before converting to permanent admission!

### Q8. "Why does ASHA present both Government and Private hospitals side-by-side?"
**Winning Answer:** Realistically in India, **healthcare budget is a life-or-death factor**. Over 60 million Indians are pushed into poverty every year due to catastrophic out-of-pocket medical expenditure. During a midnight emergency, a family blindly routed to a premium private tertiary hospital may face an instant ₹1–2 lakh admission deposit they cannot afford, causing fatal treatment delays. ASHA immediately bifurcates the triage popup between the nearest **Government Hospital (Free/Subsidized)** and nearest **Private ER**—giving families the transparent choice to balance speed and family finances without getting trapped in catastrophic medical debt.
