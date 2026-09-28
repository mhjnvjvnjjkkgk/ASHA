# 🧠 What You Must Know: Vishwaroop
**Segment:** Segment 4: Cloud Real-Time Replication & Hospital ER Command Desk  
**Role:** Cloud Realtime & ER Command Desk Engineer

This document breaks down everything you need to master your segment in clear, intuitive, plain English. Read this until you can explain these concepts naturally to anyone without hesitation.

---

## 🌟 The Big Picture: Why ASHA Exists
In India, **over 50,000 patients die every year** not because hospital beds don't exist, but because:
1. **Ambulances bounce across 2.4 hospitals** with dying patients before finding an open bed.
2. **Government dashboards show 'Ghost Beds'**—beds that exist as physical furniture but have zero nurses to staff them.
3. **The 30–45 minute transit period is a fatal void** where panicked families do nothing or commit fatal mistakes like pouring water down unconscious throats.

ASHA fixes this with a **zero-signup citizen web app** (`ashaien.vercel.app`) and a **zero-overhead hospital command desk** (`ashaien-admin.vercel.app`).

---

## 🔑 Core Concepts You Must Master for Your Segment:

### 1. Supabase PostgreSQL 15 with Row-Level Security & ACID Mutex Locks
- Master the clinical, mathematical, and algorithmic principles governing Supabase PostgreSQL 15 with Row-Level Security & ACID Mutex Locks.

### 2. Realtime WebSocket Replication via postgres_changes (<50ms latency)
- Master the clinical, mathematical, and algorithmic principles governing Realtime WebSocket Replication via postgres_changes (<50ms latency).

### 3. HTML5 BroadcastChannel API for Zero-Latency Local Inter-Tab Testing
- Master the clinical, mathematical, and algorithmic principles governing HTML5 BroadcastChannel API for Zero-Latency Local Inter-Tab Testing.

### 4. Hospital ER Command Desk (hospital-admin-app & HospitalAdminPortal.tsx)
- Master the clinical, mathematical, and algorithmic principles governing Hospital ER Command Desk (hospital-admin-app & HospitalAdminPortal.tsx).

### 5. All 10 Kolkata Emergency Hospitals (Dedicated Credentials, Helplines & Desks)
- **All 10 Hospitals Supported:** ILS Dum Dum (`ILS-02`), Tata Medical Center (`TMC-01`), Charnock VIP (`CHRN-03`), Ohio New Town (`OHIO-04`), HCG EKO (`HCG-05`), Dum Dum Municipal (`DDM-06`), North City Neuro (`NCB-07`), Bhagirathi Neotia (`NEO-08`), CNCI New Town (`CNCI-09`), Apollo Gleneagles (`APO-10`).
- Every hospital desk features 1-tap bed, nurse, and blood adjusters, plus live 4-digit OTP check-in.

### 6. 1-Tap Shift Nurse Adjuster (+/-) Recalculating Staffed Beds Live
- **Dynamic Calculation:** When triage nurses tap `[+]` or `[-]` to record shift staffing changes, the system immediately recalculates staffed beds in real time using the ISCCM ratio engine (`staffingEngine.ts`).
- **Priority Shedding:** Normal general ward beds are deducted first during staffing drops to preserve critical ICU capacity.
- **Emergency 1:2 ICU Surge Stretch Banner:** If staffing drops to $\le 4$ nurses or fails to cover ICU at 1:1, the desk displays an active yellow alert: `🚨 EMERGENCY 1:2 ICU SURGE RATIO ACTIVE: Critical Care Nurse Stretch Protocol Enabled`, doubling ICU admission capacity and reporting blocked ghost beds!

### 7. 4-Digit Numeric OTP Admission Terminal (<2 seconds verification)
- Master the clinical, mathematical, and algorithmic principles governing 4-Digit Numeric OTP Admission Terminal (<2 seconds verification).

### 8. 1-Tap Emergency Cancel / Re-Route Trigger with Citizen Cloud Push
- **Live Floating Banner Auto-Sync:** If an ER nurse clicks 'Cancel / Re-Route', the citizen app intercepts the cloud event in real time, automatically re-routes to the next closest hospital, generates a fresh 4-digit OTP, and immediately updates the top floating alert banner (`bookingAlert`) with the new hospital name, address, and OTP!

