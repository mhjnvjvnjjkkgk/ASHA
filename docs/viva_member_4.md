# Viva Preparation Guide: Background Telemetry & Anti-Abuse Engineer

**Role:** "I built the real-time GPS telemetry vector tracker and anti-hoarding bed reservation engine."

**Elevator Pitch:**
"I engineered ASHA's 15-minute dynamic GPS soft-lock engine and directional vector tracking algorithm. By continuously analyzing the rate of distance change relative to the target hospital, our system differentiates between patients genuinely traveling to the ER, stationary users, and those moving in the wrong direction, automatically returning beds to the public pool to prevent hoarding."

## Code Walkthrough & Mathematical Architecture
- **Vector Derivative Calculation:** Computes velocity vector $\frac{d(t_2) - d(t_1)}{t_2 - t_1} \times 3600$ every 10 seconds.
- **Three Telemetry States:**
  - **`TOWARD` ($\Delta d / \Delta t < -0.5\text{ km/h}$):** Patient is approaching; 15-minute countdown is paused and dynamic driving ETA is displayed.
  - **`STATIONARY` ($|\Delta d / \Delta t| \le 0.5\text{ km/h}$):** User is not moving; 15-minute countdown decrements every second.
  - **`AWAY` ($\Delta d / \Delta t > +0.5\text{ km/h}$):** Distance is increasing; triggers a Wrong Direction Alert and auto-cancels the hold over 2–3 consecutive checks.
- **Staffed Bed vs. Ghost Bed Formula:**
  $$\text{Staffed Beds} = \min(\text{Physical Beds}, \text{On-Duty Nurses} \times \text{Ratio})$$
  Enforces mandatory nurse-to-patient ratios: 1:1 ICU, 1:2 PICU, 1:6 General Ward.

## Tough Judge Questions & Winning Answers

**1. "What is a 'Ghost Bed' and how does ASHA eliminate it?"**
*Answer:* A ghost bed is a physical bed frame listed on a hospital dashboard that cannot accept a patient because no on-duty nurse is available to staff it. ASHA calculates usable beds strictly as the minimum of physical beds and nurse capacity based on clinical ratios ($1:1$ for ICU, $1:6$ for Ward).

**2. "What happens if someone soft-locks a bed and sits at home?"**
*Answer:* The GPS telemetry loop detects $0\text{ km/h}$ movement, setting the vector to `STATIONARY`. The 15-minute countdown continues to decrement. If the user does not arrive and verify the 4-digit OTP before 15 minutes expire, the hold automatically terminates and the bed is freed.

**3. "What if an ambulance encounters a detour or traffic jam?"**
*Answer:* If the vehicle is moving slowly or temporarily stalled in traffic along the route, the system detects proximity to the road polyline. As long as the directional vector is generally toward the hospital, the timer remains paused.

**4. "Why 15 minutes for the soft-lock window?"**
*Answer:* Clinical emergency data shows that in urban Indian settings, the average ambulance transit time to the nearest tertiary center is 12–18 minutes. A 15-minute window provides sufficient travel time while preventing long-term bed hoarding.

**5. "How does the nurse know if a held bed is actually en route?"**
*Answer:* On the Hospital Admin Desk (`ashaien-admin.vercel.app`), the Holds Queue tab displays the live vector status (`TOWARD`, `STATIONARY`, `AWAY`), the patient's triaged symptom, the dynamic ETA, and the 4-digit OTP.
