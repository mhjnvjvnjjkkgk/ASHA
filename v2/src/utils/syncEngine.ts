import { Hospital } from '../types';

export interface AdminHospitalOverride {
  id: string;
  total_physical_beds?: number;
  occupied_beds?: number;
  staff_count?: number;
  nurse_patient_ratio?: number; // e.g. 1:1 for ICU, 1:2 for Cardiac, 1:4 General
  blood_stock?: Record<string, number>;
  active_holds?: ActiveHold[];
  admitted_patients?: AdmittedPatient[];
}

export interface ActiveHold {
  hold_id: string;
  hospital_id: string;
  otp: string;
  patient_name: string;
  symptom: string;
  ward_code: string;
  locked_at: string;
  expires_at: string;
  status: 'ACTIVE' | 'ADMITTED' | 'EXPIRED' | 'CANCELLED';
}

export interface AdmittedPatient {
  id: string;
  hospital_id: string;
  patient_name: string;
  symptom: string;
  ward_code: string;
  admitted_at: string;
  otp: string;
}

export type SyncEventType = 'HOSPITAL_UPDATE' | 'BLOOD_UPDATE' | 'HOLD_CREATED' | 'HOLD_VERMITTED' | 'RESET';

export interface SyncPayload {
  type: SyncEventType;
  hospitalId?: string;
  hospitals?: Hospital[];
  message?: string;
  timestamp: number;
}

const STORAGE_KEY = 'pulsegrid_hospital_overrides';
const HOLDS_KEY = 'pulsegrid_active_holds';
const ADMITTED_KEY = 'pulsegrid_admitted_patients';
const CHANNEL_NAME = 'pulsegrid_realtime_sync_v2';

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported or blocked:', e);
  }
}

const listeners: Set<(payload: SyncPayload) => void> = new Set();

if (typeof window !== 'undefined') {
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => {
      notifyListeners(event.data);
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === HOLDS_KEY || e.key === ADMITTED_KEY) {
      notifyListeners({
        type: 'HOSPITAL_UPDATE',
        timestamp: Date.now(),
        message: 'Storage synced from external window',
      });
    }
  });
}

function notifyListeners(payload: SyncPayload) {
  listeners.forEach((cb) => cb(payload));
}

export function subscribeToLiveSync(callback: (payload: SyncPayload) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function broadcastSyncEvent(payload: SyncPayload) {
  notifyListeners(payload);
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(payload);
    } catch (e) {
      console.warn('Broadcast postMessage failed:', e);
    }
  }
}

// Helpers for localStorage persistence
export function getStoredOverrides(): Record<string, AdminHospitalOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveStoredOverrides(overrides: Record<string, AdminHospitalOverride>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.error('Failed to save overrides:', e);
  }
}

export function getActiveHolds(): ActiveHold[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HOLDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveActiveHolds(holds: ActiveHold[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HOLDS_KEY, JSON.stringify(holds));
  } catch (e) {
    console.error('Failed to save active holds:', e);
  }
}

export function getAdmittedPatients(): AdmittedPatient[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ADMITTED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveAdmittedPatients(patients: AdmittedPatient[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMITTED_KEY, JSON.stringify(patients));
  } catch (e) {
    console.error('Failed to save admitted patients:', e);
  }
}

// Helper to create a new hold (when user reserves bed on Citizen app)
export function createBedHold(hospitalId: string, wardCode: string, patientName: string, symptom: string): ActiveHold {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const hold: ActiveHold = {
    hold_id: 'hold_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    hospital_id: hospitalId,
    otp,
    patient_name: patientName || 'Emergency Patient',
    symptom: symptom || 'Acute Triage',
    ward_code: wardCode || 'general_oxygen',
    locked_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
  };

  const currentHolds = getActiveHolds();
  currentHolds.push(hold);
  saveActiveHolds(currentHolds);

  broadcastSyncEvent({
    type: 'HOLD_CREATED',
    hospitalId,
    timestamp: Date.now(),
    message: `New hold created with OTP ${otp}`,
  });

  return hold;
}

// Hospital Admin OTP Verification & Admission Terminal Logic
export function verifyAndAdmitOTP(
  otpInput: string,
  hospitalId: string,
  wardCodeChoice?: string,
  wardLabelChoice?: string
): { success: boolean; message: string; hold?: ActiveHold } {
  const cleanOTP = otpInput.trim();
  if (!cleanOTP || cleanOTP.length < 4) {
    return { success: false, message: 'Please enter a valid 4-digit OTP.' };
  }

  const activeHolds = getActiveHolds();
  // Find matching active hold for this hospital or any hospital
  const matchIndex = activeHolds.findIndex(
    (h) => h.otp === cleanOTP && h.status === 'ACTIVE' && (h.hospital_id === hospitalId || !hospitalId)
  );

  if (matchIndex === -1) {
    return {
      success: false,
      message: `❌ INVALID OTP (${cleanOTP}): No active bed reservation found for this hospital code.`,
    };
  }

  const hold = activeHolds[matchIndex];
  hold.status = 'ADMITTED';
  saveActiveHolds(activeHolds);

  const targetWardCode = wardCodeChoice || hold.ward_code || 'general_ward';
  const targetWardLabel = wardLabelChoice || (targetWardCode === 'cardiac_icu' ? 'Cardiac ICU' : targetWardCode === 'pediatric_icu' ? 'Pediatric ICU' : targetWardCode === 'general_ward' || targetWardCode === 'general_oxygen' ? 'General Ward' : 'Adult ICU');

  // Add to admitted list
  const admitted = getAdmittedPatients();
  const newAdmission: AdmittedPatient = {
    id: 'adm_' + Date.now(),
    hospital_id: hold.hospital_id,
    patient_name: hold.patient_name,
    symptom: hold.symptom,
    ward_code: targetWardCode,
    ward_label: targetWardLabel,
    admitted_at: new Date().toISOString(),
    otp: hold.otp,
  };
  admitted.push(newAdmission);
  saveAdmittedPatients(admitted);

  // Increment occupied count in overrides for this hospital
  const overrides = getStoredOverrides();
  const hospOverride = overrides[hold.hospital_id] || { id: hold.hospital_id };
  hospOverride.occupied_beds = (hospOverride.occupied_beds || 0) + 1;
  overrides[hold.hospital_id] = hospOverride;
  saveStoredOverrides(overrides);

  broadcastSyncEvent({
    type: 'HOLD_VERMITTED',
    hospitalId: hold.hospital_id,
    timestamp: Date.now(),
    message: `OTP ${cleanOTP} verified successfully! Patient ${hold.patient_name} admitted to ${hold.ward_code.toUpperCase()}.`,
  });

  return {
    success: true,
    message: `✅ OTP ${cleanOTP} VERIFIED! Patient ${hold.patient_name} admitted. Occupied bed count updated.`,
    hold,
  };
}

// Calculate ghost beds and merge overrides onto initial hospital list
export function applyAdminOverridesToHospitals(initialHospitals: Hospital[]): Hospital[] {
  const overrides = getStoredOverrides();
  const activeHolds = getActiveHolds();

  return initialHospitals.map((hosp) => {
    const override = overrides[hosp.id];
    let updatedWards = hosp.wards ? [...hosp.wards] : [];

    // Filter holds for this hospital
    const hospHolds = activeHolds.filter((h) => h.hospital_id === hosp.id && h.status === 'ACTIVE');

    if (override || hospHolds.length > 0) {
      if (updatedWards.length > 0) {
        updatedWards = updatedWards.map((w) => {
          const wardHolds = hospHolds.filter((h) => h.ward_code === w.ward_code).length;

          // If override provides physical, occupied, staff count
          const physical = override?.total_physical_beds ?? w.total_physical;
          const occupied = (override?.occupied_beds ?? w.occupied) + (w.ward_code === 'adult_icu' ? 0 : 0);
          const staffCount = override?.staff_count ?? (w.total_staffed * 2); // ratio 1:2
          const nurseRatio = 2; // 1 nurse per 2 patients

          // Formula calculations:
          // Staffed Beds = min(Physical Beds, Staff Count * Nurse Ratio)
          const staffedBeds = Math.min(physical, Math.max(0, Math.floor(staffCount / nurseRatio)));
          // Ghost Beds = max(0, Physical Beds - Staffed Beds)
          const ghostGap = Math.max(0, physical - staffedBeds);
          // Available Beds = max(0, Staffed Beds - Occupied Beds - Holds)
          const available = Math.max(0, staffedBeds - occupied - wardHolds);

          return {
            ...w,
            total_physical: physical,
            total_staffed: staffedBeds,
            occupied,
            held_now: wardHolds,
            available_now: available,
            ghost_gap: ghostGap,
          };
        });
      }
    }

    // Blood stock override
    let updatedBloodStock = hosp.blood_inventory ? { ...hosp.blood_inventory } : {};
    if (override?.blood_stock) {
      updatedBloodStock = { ...updatedBloodStock, ...override.blood_stock };
    }

    return {
      ...hosp,
      wards: updatedWards,
      blood_inventory: updatedBloodStock,
    };
  });
}
