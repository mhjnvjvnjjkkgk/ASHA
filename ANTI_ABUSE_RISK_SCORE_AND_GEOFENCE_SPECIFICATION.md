# ASHA / PULSEGRID: ANTI-ABUSE RISK SCORING & GEOFENCE SECURITY ARCHITECTURE
**Document Reference:** SEC-SPEC-2026-V1  
**Status:** Planned Engineering Roadmap (Research & Architectural Specification — Do Not Implement Yet)  
**Target Scope:** Prevention of Bed Hoarding, Touting Syndicates, Remote Hard-Lock Scalping & Denial-of-Inventory Attacks  

---

## 1. EXECUTIVE SUMMARY & THREAT MODEL

In emergency healthcare informatics, an open, zero-signup bed reservation platform faces a fundamental adversarial paradox:
* **The Clinical Imperative:** A citizen in cardiac shock must never be blocked by authentication passwords, KYC verifications, or credit card holds. Access must be instantaneous ($\le 0.8\text{ seconds}$).
* **The Adversarial Threat:** Unscrupulous private ambulance touts, competing healthcare syndicates, or automated scripts can exploit frictionless access to create fake holds, paralyzing ICU bed availability and driving patients to high-commission secondary nursing homes.

To dismantle this threat without imposing friction on dying citizens, ASHA specifies a **Dual-Layered Anti-Abuse Defense**:
1. **The 100-Meter Proximity Geofence Guard:** The 4-digit OTP *only* permits Hard-Lock conversion in the Hospital Admin Panel when client telemetry proves the patient is physically within 100 meters of the ER bay. Remote hard-locking is mathematically impossible.
2. **The Client IP & Hardware Fingerprint Risk-Scoring Engine:** A backend heuristic assigning every reservation session a dynamic Risk Score ($0 \dots 100$) based on IP velocity bursts, hardware canvas entropy, and abandonment history. Suspicious actors are throttled or blocked before acquiring a bed hold.

---

## 2. THE 100-METER HOSPITAL GEOFENCE HARD-LOCK GATE

### 2.1 The Vulnerability It Eliminates
Under naive implementations, an attacker who obtains a 4-digit soft-lock OTP could telephone a corrupt or deceived triage clerk from 15 kilometers away, claiming: *"We are outside in an unlisted ambulance, admit OTP 4892 immediately."* If the clerk enters the code, the soft-lock is converted into a permanent hard admission (`status = 'ADMITTED'`), locking out genuine arriving ambulances.

### 2.2 Mathematical Geofence Verification
When the triage nurse inputs the 4-digit OTP into `ashaien-admin.vercel.app`, the Supabase backend executes an atomic verification enforcing a **100-Meter Spatial Geofence**:

$$\text{Distance}(P_{\text{telemetry}}, H_{\text{ER}}) \le 0.100\text{ km}$$

Where distance is calculated using the Great-Circle Haversine metric against the client's latest verified GPS heartbeat (timestamped within the last 30 seconds):

$$d = 2R \cdot \arcsin \left( \sqrt{ \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos \phi_{\text{user}} \cos \phi_{\text{hosp}} \sin^2\left(\frac{\Delta \lambda}{2}\right) } \right)$$

* $R = 6371\text{ km}$ (Earth's mean radius)
* $\Delta \phi = \phi_{\text{hosp}} - \phi_{\text{user}}$
* $\Delta \lambda = \lambda_{\text{hosp}} - \lambda_{\text{user}}$

```
                      [ PATIENT EN ROUTE (2.4 km away) ]
                                      │
                   Triage Nurse enters OTP: "4892"
                                      │
                                      ▼
                        [ ER Command Desk Check ]
                                      │
                 Is Distance <= 100m of ER Entrance?
                                 /         \
                                /           \
                            NO /             \ YES
                              /               \
                             ▼                 ▼
          ❌ HARD-LOCK REJECTED           ✅ ADMITTED & CONFIRMED
          "Distance = 2,410m.             Bed converted to Hard-Lock.
          Device must be at bay."         Ambulance bay alerted.
```

### 2.3 Strict Rejection Protocol
If $d > 0.100\text{ km}$, the transaction fails atomically:
```json
{
  "status": "REJECTED_GEOFENCE_BREACH",
  "error_code": 403,
  "message": "Admission blocked: Patient device is 2.4 km from hospital perimeter. Physical presence within 100m of ER entrance bay is mandatory for hard-lock execution.",
  "telemetry_distance_meters": 2410,
  "threshold_meters": 100
}
```
**Outcome:** Soft-locks can NEVER be prematurely or fraudulently hard-locked by remote actors.

---

## 3. MULTI-FACTOR CLIENT RISK-SCORING ENGINE ($0 \dots 100$)

Before a soft-lock is granted, the backend evaluates four orthogonal telemetry dimensions:

$$R = w_1 S_{\text{IP}} + w_2 S_{\text{Device}} + w_3 S_{\text{Velocity}} + w_4 S_{\text{Geo}}$$

With weights calibrated for emergency zero-friction priority:
* $w_1 = 0.30$ (IP Address Velocity)
* $w_2 = 0.35$ (Hardware & Browser Entropy)
* $w_3 = 0.20$ (Reservation Velocity & Abandonment)
* $w_4 = 0.15$ (Spatial & Network Consistency)

### 3.1 Dimension 1: IP Address Subnet Velocity ($S_{\text{IP}}$)
Monitors burst requests from identical public IP addresses or cellular carrier subnets (`/64` IPv6 or `/24` IPv4):
* Let $N_{\text{1h}}$ be the number of hold requests from this IP in the last 60 minutes.
* Let $N_{\text{24h}}$ be the number of hold requests in the last 24 hours.

$$S_{\text{IP}} = \min\left(100, \; 30 \cdot \max(0, N_{\text{1h}} - 1) + 10 \cdot \max(0, N_{\text{24h}} - 2)\right)$$

* *Single genuine caller:* $N_{\text{1h}} = 1 \implies S_{\text{IP}} = 0$.
* *Tout bot launching 4 holds in 20 minutes:* $N_{\text{1h}} = 4 \implies S_{\text{IP}} = 90$ (High Risk).

### 3.2 Dimension 2: Device Fingerprint & Hardware Entropy ($S_{\text{Device}}$)
Clearing browser cookies or opening private/incognito tabs does **not** reset physical hardware signatures. The client computes a zero-overhead cryptographic hash across 7 hardware properties:
1. **Canvas 2D Rendering Entropy:** Unique GPU anti-aliasing pixel variance.
2. **WebGL Vendor & Renderer String:** GPU chipset identity.
3. **AudioContext Oscillator Decay:** Micro-variations in audio DAC hardware.
4. **Hardware Concurrency & Memory:** `navigator.hardwareConcurrency` + `navigator.deviceMemory`.
5. **Screen Dimension & Pixel Ratio:** Physical display geometry.

If the same physical phone/browser requests multiple beds under different session IDs:
$$S_{\text{Device}} = \begin{cases} 
0 & \text{if } N_{\text{hardware}} = 1 \text{ (Normal Emergency)} \\
45 & \text{if } N_{\text{hardware}} = 2 \text{ within 12 hours} \\
95 & \text{if } N_{\text{hardware}} \ge 3 \text{ within 12 hours (Tout Hoarding Attempt)}
\end{cases}$$

### 3.3 Dimension 3: Velocity & Abandonment History ($S_{\text{Velocity}}$)
Evaluates whether previous soft-locks associated with this device/IP were abandoned or cancelled due to moving in the opposite direction:
$$S_{\text{Velocity}} = \min\left(100, \; 35 \cdot N_{\text{abandoned\_holds}}\right)$$

### 3.4 Dimension 4: Spatial & Network Plausibility ($S_{\text{Geo}}$)
Compares the caller's GPS location with IP ASN geolocation and flags GPS spoofing:
* Client GPS in Newtown, Kolkata vs. ISP IP routing in Moscow or Chennai: $+50$ penalty.
* Speed delta $>200\text{ km/h}$ between successive pings (Mock Location Spoofing): $+80$ penalty.

---

## 4. DYNAMIC POLICY DECISION MATRIX

```
             ┌──────────────────────────────────────────────┐
             │         COMPUTED RISK SCORE (R)              │
             └──────────────────────┬───────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
   [ 0 <= R < 30 ]           [ 30 <= R < 70 ]           [ 70 <= R <= 100 ]
     TRUSTED                     CAUTION                   HIGH RISK
  ────────────────          ─────────────────          ─────────────────
  • Instant 1-tap lock      • Soft-lock granted        • Soft-lock BLOCKED
  • Full 15-min TTL         • Reduced 8-min TTL        • Direct phone dial
  • Zero Captcha / KYC      • Requires silent SMS        to ER bay shown
  • Immediate 4-digit OTP     challenge confirmation   • Flagged on ER Desk
```

1. **Trusted Tier ($R < 30$ — 98.5% of Citizens):**
   - Instant frictionless 15-minute soft lock.
   - Bed decrements immediately across network; 4-digit OTP generated in $<0.2\text{s}$.
2. **Caution Tier ($30 \le R < 70$ — Suspicious Patterns):**
   - Soft-lock duration compressed to **8 minutes**.
   - Requires 1-tap device biometric or silent SMS verification.
3. **High-Risk Tier ($R \ge 70$ — Confirmed Tout / Bot Pattern):**
   - Automated soft-lock is **denied**.
   - UI seamlessly falls back to direct telephone quick-dial (`"Call Emergency Room Directly: 033-4031-9000"`).
   - Flagged on Hospital Admin Fraud Sentinel table.

---

## 5. PLANNED ROADMAP & ARCHITECTURAL SUMMARY FOR JUDGES

| Defense Mechanism | How It Works | Judge Defense Pitch Point |
|---|---|---|
| **100m Hospital Geofence Guard** | OTP admission only triggers when GPS distance $\le 100\text{m}$ from hospital. | *"A tout cannot sit at home and convert 5 soft-locks into permanent admissions. The patient must physically be at the ER bay."* |
| **IP Subnet Burst Throttling** | Tracks requests per IP subnet over 1h/24h rolling windows. | *"Prevents automated bot scripts from spamming hold reservations across Kolkata hospitals."* |
| **Canvas & Hardware Fingerprinting** | Identifies physical smartphone across private/incognito sessions. | *"Opening 5 incognito tabs on one phone will not fool our backend—it detects the same GPU canvas hash."* |
| **50% Public Hold Cap** | Max 50% of staffed beds can be soft-locked simultaneously. | *"Guarantees that 50% of staffed beds are always reserved for direct drive-ups and non-app ambulances."* |

> [!NOTE]
> **Implementation Note:** This architecture is formally planned and specified in our SIH engineering roadmap. It is intentionally decoupled from current development builds to ensure the zero-friction emergency flow remains lightweight, clean, and robust for demonstration purposes.
