# CLINICAL NURSE-TO-BED RATIO: MATHEMATICAL MODEL & SHEDDING ENGINE

**Standard:** ISCCM (Indian Society of Critical Care Medicine) & ERC (European Resuscitation Council)  
**Implementation Modules:**  
- `hospital-admin-app/src/utils/staffingEngine.ts`  
- `v2/src/utils/staffingEngine.ts`

---

## 1. THE CLINICAL PROBLEM: THE "GHOST BED" PARADOX

A hospital bed is not a wooden frame; it is a clinical ecosystem requiring active nursing care. 
If an emergency department reports **10 physical ICU beds** on a public dashboard, but only **2 critical-care nurses** are on duty for the night shift, 8 of those beds are clinically unusable.

When an ambulance carrying a patient in acute cardiogenic shock or respiratory failure arrives at that hospital based on the portal number, the triage charge nurse must reject the patient at the gate:
$$\text{Rejection} \implies \text{Admitting an unmonitored ventilated patient violates statutory safety and leads to immediate arrest.}$$

This is the origin of the **2.4 Hospital Gate Rejection Cycle**.

---

## 2. THE MATHEMATICAL SPECIFICATION

### 2.1 Statutory Baseline Ratios
* **Normal / General Ward:** $1\text{ Nurse} : 6\text{ Normal Beds}$ ($R_{\text{general}} = 6$).
  * 1 nurse staffs up to 6 normal beds.
  * 2 nurses staff up to 12 normal beds ($2 \times 6 = 12$).
* **ICU (Adult, Cardiac, Pediatric):** $1\text{ Nurse} : 1\text{ ICU Bed}$ ($R_{\text{icu\_std}} = 1$).
  * If 3 nurses are on duty: 2 nurses staff 12 normal beds, and 1 nurse staffs 1 ICU bed!

### 2.2 Priority Rule: Normal Bed Shedding
$$\mathbf{Rule\ 1:\ During\ staffing\ reductions,\ normal\ beds\ are\ deducted\ FIRST.}$$
* **Clinical Rationale:** In emergency healthcare, ICU beds are life-critical resuscitation assets (acute STEMI, polytrauma, stroke). General ward admissions are elective or sub-acute.
* When nurses call in sick or shifts change, nurses are diverted to maintain ICU coverage, while general ward capacity is shed in increments of 6 beds per nurse lost.

### 2.3 Emergency Low-Staff Contingency: The 1:2 ICU Stretch Ratio
$$\mathbf{Rule\ 2:\ When\ staff\ is\ critically\ low,\ activate\ the\ 1:2\ ICU\ Stretch\ Ratio.}$$
* **The Fatal Trap of Fixed 1:1:** If a hospital drops from 4 nurses to 2 nurses, strictly capping at 1:1 would cut ICU capacity in half, forcing gatekeepers to turn away dying cardiac arrest victims into traffic.
* **The Clinical Solution:** During low-staff surge conditions ($N_{\text{total}} \le B_{\text{phys\_icu}}$ or $N_{\text{total}} \le 4$), the system triggers the **Emergency 1:2 ICU Surge Stretch Ratio** ($R_{\text{icu\_surge}} = 2$).
* Under this protocol, 1 critical-care nurse monitors 2 adjacent telemetry beds with centralized continuous vitals alarms, **doubling ICU admission capacity** and saving lives at the gate.

---

## 3. FORMAL ALGORITHM

Given:
* $N_{\text{total}}$ = Available on-duty nurses on shift.
* $B_{\text{phys\_icu}}$ = Physical ICU beds ($B_{\text{adult}} + B_{\text{cardiac}} + B_{\text{pediatric}}$).
* $B_{\text{phys\_gen}}$ = Physical general ward beds.

```
1. Calculate standard nurses needed:
   N_standard = B_phys_icu + ceil(B_phys_gen / 6)

2. Detect low-staff condition:
   is_low_staff = (N_total < N_standard)
   is_stretched = (N_total <= B_phys_icu) or (N_total <= 4)
   icu_ratio    = 2 if is_stretched else 1

3. Determine ICU nurse allocation:
   nurses_for_full_icu = ceil(B_phys_icu / icu_ratio)

   if N_total <= nurses_for_full_icu:
       // Extreme low staff: Normal beds shed FIRST to 0
       N_icu = N_total
       N_gen = 0
   else:
       // Protect ICU; remainder goes to General
       N_icu = nurses_for_full_icu
       N_gen = N_total - N_icu

4. Calculate staffed bed outputs:
   Staffed_ICU = min(B_phys_icu, N_icu * icu_ratio)
   Staffed_Gen = min(B_phys_gen, N_gen * 6)

   Total_Staffed_Available = Staffed_ICU + Staffed_Gen
   Ghost_Beds_Blocked      = (B_phys_icu + B_phys_gen) - Total_Staffed_Available
```

---

## 4. VERIFICATION TRACE: DUM DUM MUNICIPAL HOSPITAL
*Physical Capacity: 2 Adult ICU, 1 Cardiac ICU, 1 Pediatric ICU (Total ICU = 4), 7 General Ward.*

| On-Duty Nurses | Adult ICU | Cardiac ICU | Pediatric ICU | General Ward | Total Available | ICU Ratio | System State & Action |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **14** | 2 | 1 | 1 | 7 | **11** | 1 : 1 | Full capacity; 8 nurses shift buffer |
| **8** | 2 | 1 | 1 | 7 | **11** | 1 : 1 | Normal operation; 1:1 ICU preserved |
| **6** | 2 | 1 | 1 | 7 | **11** | 1 : 1 | Standard staffing; 4 ICU + 2 Gen nurses |
| **5** | 2 | 1 | 1 | 6 | **10** | 1 : 1 | **Normal beds shed first** (7 $\to$ 6) |
| **4** | 2 | 1 | 1 | 7 | **11** | **1 : 2** | **⚡ 1:2 Emergency Stretch Activated!** 2 nurses cover 4 ICU; 2 nurses cover 7 Gen |
| **3** | 2 | 1 | 1 | 6 | **10** | **1 : 2** | 2 nurses cover 4 ICU; 1 nurse covers 6 Gen |
| **2** | 2 | 1 | 1 | 0 | **4** | **1 : 2** | **Gen shed to 0!** 2 nurses preserve ALL 4 ICU beds |
| **1** | 2 | 0 | 0 | 0 | **2** | **1 : 2** | 1 nurse preserves 2 Adult ICU resuscitation beds |
| **0** | 0 | 0 | 0 | 0 | **0** | — | Evacuation / Complete Diversion |

---

## 5. COMPARISON: WITHOUT STRETCH VS. WITH ASHA STRETCH

| On-Duty Nurses | Without Stretch (Fixed 1:1) | With ASHA Engine (1:2 Stretch) | Clinical Outcome |
|:---:|:---:|:---:|:---|
| **2 Nurses** | 2 ICU beds (2 rejected at gate) | **4 ICU beds (0 rejections)** | **2 additional cardiac arrest patients admitted alive** |
| **1 Nurse** | 1 ICU bed (3 rejected at gate) | **2 ICU beds (1 rejection)** | **1 additional polytrauma patient saved from bleed-out** |
