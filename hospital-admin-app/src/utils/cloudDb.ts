import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Hospital } from '../types';

// ─── Supabase Client ────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://bvdxpticernfggvaczdb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ELEmxIw9Nde-WWvhhj4CZg_4Mh4QdTZ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Types ──────────────────────────────────────────────────────────────────
export interface AdminHospitalOverride {
  id: string;
  available_beds?: number;
  total_nurses?: number;
  ward_beds?: Record<string, number>;
  blood_stock?: Record<string, number>;
  updated_at?: number;
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
  ward_label?: string;
  admitted_at: string;
  otp: string;
}

// ─── Local Cache (for instant UI updates before round-trip) ─────────────────

// ─── Local Storage Persistence Helpers ─────────────────────────────────────
const ADMITTED_PATIENTS_KEY = 'pulsegrid_admitted_patients_v2';
const ACTIVE_HOLDS_CACHE_KEY = 'pulsegrid_active_holds_cache_v2';
const OVERRIDES_CACHE_KEY = 'pulsegrid_overrides_cache_v2';

function loadOverridesFromStorage(): Record<string, AdminHospitalOverride> {
  try {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(OVERRIDES_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveOverridesToStorage(map: Record<string, AdminHospitalOverride>): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(OVERRIDES_CACHE_KEY, JSON.stringify(map));
    }
  } catch {}
}

function loadAdmittedFromStorage(): AdmittedPatient[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(ADMITTED_PATIENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAdmittedToStorage(list: AdmittedPatient[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMITTED_PATIENTS_KEY, JSON.stringify(list));
    }
  } catch {}
}

function loadHoldsFromStorage(): ActiveHold[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(ACTIVE_HOLDS_CACHE_KEY);
    if (!raw) return [];
    const parsed: ActiveHold[] = JSON.parse(raw);
    const now = Date.now();
    return parsed.filter((h) => h.status === 'ACTIVE' && new Date(h.expires_at).getTime() > now);
  } catch {
    return [];
  }
}

function saveHoldsToStorage(list: ActiveHold[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_HOLDS_CACHE_KEY, JSON.stringify(list));
    }
  } catch {}
}

let _localOverrides: Record<string, AdminHospitalOverride> = loadOverridesFromStorage();
let _localHolds: ActiveHold[] = loadHoldsFromStorage();
let _localAdmitted: AdmittedPatient[] = loadAdmittedFromStorage();

const listeners: Set<() => void> = new Set();
let realtimeChannel: RealtimeChannel | null = null;

function notifyListeners() {
  listeners.forEach((cb) => cb());
}

// ─── Realtime Subscription ──────────────────────────────────────────────────
function setupRealtime() {
  if (realtimeChannel) return;

  realtimeChannel = supabase
    .channel('pulsegrid_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'hospital_overrides' }, () => {
      fetchAllFromCloud().then(() => notifyListeners());
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'active_holds' }, () => {
      fetchAllFromCloud().then(() => notifyListeners());
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'admitted_patients' }, () => {
      fetchAllFromCloud().then(() => notifyListeners());
    })
    .subscribe();
}

// ─── Subscribe (called from components) ─────────────────────────────────────
export function subscribeToCloudDb(callback: () => void): () => void {
  listeners.add(callback);
  setupRealtime();

  // Initial load
  fetchAllFromCloud().then(() => notifyListeners());

  // Fallback polling every 2s in case WebSocket misses an update
  const timer = setInterval(() => {
    fetchAllFromCloud().then(() => notifyListeners());
  }, 2000);

  return () => {
    listeners.delete(callback);
    clearInterval(timer);
    if (listeners.size === 0 && realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  };
}

// ─── Helper to handle general_ward vs general_oxygen key alias ────────────────
function normalizeWardBeds(wardBeds: Record<string, number> = {}): Record<string, number> {
  const normalized = { ...wardBeds };
  if (normalized.general_ward !== undefined) {
    normalized.general_oxygen = normalized.general_ward;
  } else if (normalized.general_oxygen !== undefined) {
    normalized.general_ward = normalized.general_oxygen;
  }
  return normalized;
}

// ─── Fetch Everything From Supabase ─────────────────────────────────────────
async function fetchAllFromCloud(): Promise<void> {
  try {
    const [ovRes, hdRes, adRes] = await Promise.all([
      supabase.from('hospital_overrides').select('*'),
      supabase.from('active_holds').select('*').eq('status', 'ACTIVE').order('locked_at', { ascending: false }).limit(100),
      supabase.from('admitted_patients').select('*').order('admitted_at', { ascending: false }).limit(100),
    ]);

    if (ovRes.data && ovRes.data.length > 0) {
      _localOverrides = {};
      for (const row of ovRes.data) {
        _localOverrides[row.hospital_id] = {
          id: row.hospital_id,
          total_nurses: row.total_nurses,
          ward_beds: normalizeWardBeds(row.ward_beds || {}),
          blood_stock: row.blood_stock || {},
          updated_at: new Date(row.updated_at).getTime(),
        };
      }
      saveOverridesToStorage(_localOverrides);
    } else {
      _localOverrides = loadOverridesFromStorage();
    }

    const now = Date.now();
    if (hdRes.data) {
      const cloudHolds = hdRes.data
        .map((r) => ({
          hold_id: r.hold_id,
          hospital_id: r.hospital_id,
          otp: String(r.otp || ''),
          patient_name: r.patient_name,
          symptom: r.symptom,
          ward_code: r.ward_code,
          locked_at: r.locked_at,
          expires_at: r.expires_at,
          status: r.status as 'ACTIVE' | 'ADMITTED' | 'EXPIRED' | 'CANCELLED',
        }))
        .filter((h) => h.status === 'ACTIVE' && new Date(h.expires_at).getTime() > now);

      _localHolds = cloudHolds;
      saveHoldsToStorage(_localHolds);
    } else {
      _localHolds = loadHoldsFromStorage();
    }

    if (adRes.data && adRes.data.length > 0) {
      const cloudAdmitted: AdmittedPatient[] = adRes.data.map((r) => ({
        id: r.id,
        hospital_id: r.hospital_id,
        patient_name: r.patient_name,
        symptom: r.symptom,
        ward_code: r.ward_code,
        ward_label: r.ward_label,
        admitted_at: r.admitted_at,
        otp: String(r.otp || ''),
      }));

      const map = new Map<string, AdmittedPatient>();
      loadAdmittedFromStorage().forEach((a) => map.set(a.id, a));
      cloudAdmitted.forEach((a) => map.set(a.id, a));
      _localAdmitted = Array.from(map.values()).sort(
        (a, b) => new Date(b.admitted_at).getTime() - new Date(a.admitted_at).getTime()
      );
      saveAdmittedToStorage(_localAdmitted);
    } else {
      _localAdmitted = loadAdmittedFromStorage();
    }
    notifyListeners();
  } catch (e) {
    console.warn('Supabase fetch failed:', e);
    _localHolds = loadHoldsFromStorage();
    _localAdmitted = loadAdmittedFromStorage();
    notifyListeners();
  }
}

// ─── Local Getters ───────────────────────────────────────────────────────────
export function getLocalOverrides(): Record<string, AdminHospitalOverride> {
  return _localOverrides;
}

export function getLocalHolds(): ActiveHold[] {
  return _localHolds;
}

export function getLocalAdmitted(): AdmittedPatient[] {
  return _localAdmitted;
}

// Legacy aliases for compatibility
export const saveLocalOverrides = (_: Record<string, AdminHospitalOverride>) => {};
export const saveLocalHolds = (_: ActiveHold[]) => {};
export const saveLocalAdmitted = (_: AdmittedPatient[]) => {};

// ─── Push Overrides (Beds / Blood / Nurses) ──────────────────────────────────
export async function pushOverridesToCloud(
  overrides: Record<string, AdminHospitalOverride>
): Promise<void> {
  _localOverrides = overrides;
  saveOverridesToStorage(_localOverrides);
  notifyListeners();

  for (const [hospitalId, data] of Object.entries(overrides)) {
    try {
      const wardBeds = normalizeWardBeds(data.ward_beds || {});
      await supabase.from('hospital_overrides').upsert({
        hospital_id: hospitalId,
        total_nurses: data.total_nurses,
        ward_beds: wardBeds,
        blood_stock: data.blood_stock || {},
        updated_at: new Date().toISOString(),
      }, { onConflict: 'hospital_id' });
    } catch (e) {
      console.warn('Failed to push override:', e);
    }
  }
}

// ─── Create a Bed Hold (Citizen reserves a bed) ──────────────────────────────
export async function createBedHold(
  hospitalId: string,
  wardCode: string,
  patientName: string,
  symptom: string,
  customOtp?: string
): Promise<ActiveHold> {
  const otp = customOtp || Math.floor(1000 + Math.random() * 9000).toString();

  const hold: ActiveHold = {
    hold_id: 'hold_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    hospital_id: hospitalId,
    otp,
    patient_name: patientName || 'Emergency Patient',
    symptom: symptom || 'Acute Triage',
    ward_code: wardCode || 'adult_icu',
    locked_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
  };

  // Insert into Supabase
  try {
    await supabase.from('active_holds').insert({
      hold_id: hold.hold_id,
      hospital_id: hold.hospital_id,
      otp: hold.otp,
      patient_name: hold.patient_name,
      symptom: hold.symptom,
      ward_code: hold.ward_code,
      locked_at: hold.locked_at,
      expires_at: hold.expires_at,
      status: 'ACTIVE',
    });
  } catch (e) {
    console.warn('Failed to push hold to Supabase:', e);
  }

  // Update local cache & decrement ward bed count in overrides
  _localHolds = [..._localHolds, hold];
  saveHoldsToStorage(_localHolds);
  notifyListeners();
  return hold;

  const hospOverride = _localOverrides[hospitalId] || { id: hospitalId, ward_beds: {} };
  const currentWardBeds = normalizeWardBeds(hospOverride.ward_beds || {});
  
  const currentVal = currentWardBeds[wardCode] !== undefined 
    ? currentWardBeds[wardCode] 
    : (wardCode === 'general_oxygen' ? (currentWardBeds['general_ward'] ?? 4) : 4);

  const newVal = Math.max(0, currentVal - 1);
  currentWardBeds[wardCode] = newVal;
  if (wardCode === 'general_oxygen' || wardCode === 'general_ward') {
    currentWardBeds.general_ward = newVal;
    currentWardBeds.general_oxygen = newVal;
  }

  const updatedOverride = { ...hospOverride, ward_beds: currentWardBeds };
  _localOverrides = { ..._localOverrides, [hospitalId]: updatedOverride };

  try {
    await supabase.from('hospital_overrides').upsert({
      hospital_id: hospitalId,
      total_nurses: updatedOverride.total_nurses,
      ward_beds: currentWardBeds,
      blood_stock: updatedOverride.blood_stock || {},
      updated_at: new Date().toISOString(),
    }, { onConflict: 'hospital_id' });
  } catch (e) {
    console.warn('Failed to update ward beds after hold:', e);
  }

  notifyListeners();
  return hold;
}

// ─── OTP Verification & Admission ────────────────────────────────────────────
export async function verifyAndAdmitOTP(
  otpInput: string,
  hospitalId: string,
  wardCodeChoice?: string,
  wardLabelChoice?: string
): Promise<{ success: boolean; message: string; hold?: ActiveHold }> {
  const cleanOTP = otpInput.trim();
  if (!cleanOTP || cleanOTP.length < 4) {
    return { success: false, message: 'Please enter a valid 4-digit OTP.' };
  }

  // Fetch latest holds from Supabase
  await fetchAllFromCloud();

  const matchIndex = _localHolds.findIndex(
    (h) => h.otp === cleanOTP && h.status === 'ACTIVE' &&
      (h.hospital_id === hospitalId || !hospitalId)
  );

  if (matchIndex === -1) {
    return {
      success: false,
      message: `❌ OTP ${cleanOTP}: No active bed reservation found at this station.`,
    };
  }

  const hold = _localHolds[matchIndex];
  const targetWardCode = wardCodeChoice || hold.ward_code || 'general_oxygen';
  const targetWardLabel = wardLabelChoice
    ? wardLabelChoice
    : (targetWardCode === 'cardiac_icu'
        ? 'Cardiac ICU'
        : targetWardCode === 'pediatric_icu'
        ? 'Pediatric ICU'
        : targetWardCode === 'adult_icu'
        ? 'Adult ICU'
        : 'General Ward');

  // Mark hold as ADMITTED in Supabase and sync ward_code
  try {
    await supabase.from('active_holds')
      .update({ status: 'ADMITTED', ward_code: targetWardCode })
      .eq('hold_id', hold.hold_id);
  } catch (e) {
    console.warn('Failed to update hold status:', e);
  }

  // Add to admitted_patients
  const admission: AdmittedPatient = {
    id: 'adm_' + Date.now(),
    hospital_id: hold.hospital_id,
    patient_name: hold.patient_name,
    symptom: hold.symptom,
    ward_code: targetWardCode,
    ward_label: targetWardLabel,
    admitted_at: new Date().toISOString(),
    otp: hold.otp,
  };

  try {
    await supabase.from('admitted_patients').insert({
      id: admission.id,
      hospital_id: admission.hospital_id,
      patient_name: admission.patient_name,
      symptom: admission.symptom,
      ward_code: admission.ward_code,
      ward_label: admission.ward_label,
      admitted_at: admission.admitted_at,
      otp: admission.otp,
    });
  } catch (e) {
    console.warn('Failed to insert admitted patient:', e);
  }

  // DECREMENT WARD BED CAPACITY PERMANENTLY UPON ADMISSION
  const hospId = hold.hospital_id;
  const existingOverride = _localOverrides[hospId] || { id: hospId, ward_beds: {} };
  const currentWardBeds = normalizeWardBeds(existingOverride.ward_beds || {});

  const DEFAULT_WARD_CAPACITIES: Record<string, number> = {
    cardiac_icu: 4,
    adult_icu: 4,
    pediatric_icu: 2,
    general_ward: 6,
    general_oxygen: 6,
  };

  let currentVal = currentWardBeds[targetWardCode];
  if (currentVal === undefined) {
    currentVal = DEFAULT_WARD_CAPACITIES[targetWardCode] ?? 4;
  }

  const newVal = Math.max(0, currentVal - 1);
  currentWardBeds[targetWardCode] = newVal;
  if (targetWardCode === 'general_oxygen' || targetWardCode === 'general_ward') {
    currentWardBeds.general_ward = newVal;
    currentWardBeds.general_oxygen = newVal;
  }

  const updatedOverride: AdminHospitalOverride = {
    ...existingOverride,
    id: hospId,
    ward_beds: currentWardBeds,
    updated_at: Date.now(),
  };
  _localOverrides[hospId] = updatedOverride;
  saveOverridesToStorage(_localOverrides);

  try {
    await supabase.from('hospital_overrides').upsert({
      hospital_id: hospId,
      total_nurses: updatedOverride.total_nurses,
      ward_beds: currentWardBeds,
      blood_stock: updatedOverride.blood_stock || {},
      updated_at: new Date().toISOString(),
    }, { onConflict: 'hospital_id' });
  } catch (e) {
    console.warn('Failed to update ward beds after admission:', e);
  }

  // Update local cache
  _localHolds = _localHolds.filter((h) => h.hold_id !== hold.hold_id && h.otp !== hold.otp);
  saveHoldsToStorage(_localHolds);

  _localAdmitted = [admission, ..._localAdmitted.filter((a) => a.id !== admission.id)];
  saveAdmittedToStorage(_localAdmitted);
  notifyListeners();

  return {
    success: true,
    message: `✅ OTP ${cleanOTP} VERIFIED! Patient ${hold.patient_name} admitted to ${admission.ward_label}.`,
    hold,
  };
}

// ─── Apply Overrides to Hospital List (for map rendering) ────────────────────
export function applyAdminOverridesToHospitals(initialHospitals: Hospital[]): Hospital[] {
  const overrides = _localOverrides;
  const holds = _localHolds;
  const now = Date.now();

  const validHolds = holds.filter(
    (h) => h.status === 'ACTIVE' && new Date(h.expires_at).getTime() > now
  );

  return initialHospitals.map((hosp) => {
    const override = overrides[hosp.id];
    let updatedWards = hosp.wards ? [...hosp.wards] : [];

    const hospHolds = validHolds.filter((h) => h.hospital_id === hosp.id);

    updatedWards = updatedWards.map((w) => {
      const wardHoldsCount = hospHolds.filter(
        (h) =>
          h.ward_code === w.ward_code ||
          (w.ward_code === 'general_oxygen' && h.ward_code === 'general_ward') ||
          (w.ward_code === 'general_ward' && h.ward_code === 'general_oxygen')
      ).length;

      let baseCapacity = w.available_now !== undefined ? w.available_now : 4;
      const overrideWardBeds = normalizeWardBeds(override?.ward_beds || {});

      if (overrideWardBeds[w.ward_code] !== undefined) {
        baseCapacity = overrideWardBeds[w.ward_code];
      }

      const netAvailable = Math.max(0, baseCapacity - wardHoldsCount);

      return {
        ...w,
        available_now: netAvailable,
        held_now: wardHoldsCount,
      };
    });

    let updatedBloodSummary = hosp.blood_summary ? hosp.blood_summary.map((b) => ({ ...b })) : [];
    if (override?.blood_stock) {
      const stockMap = override.blood_stock;
      updatedBloodSummary = updatedBloodSummary.map((b) => {
        if (stockMap[b.blood_group] !== undefined) {
          return { ...b, units_free_now: stockMap[b.blood_group] };
        }
        return b;
      });

      for (const [bg, units] of Object.entries(stockMap)) {
        if (!updatedBloodSummary.some((b) => b.blood_group === bg)) {
          updatedBloodSummary.push({
            blood_group: bg as any,
            component: 'PRBC',
            units_free_now: units,
            is_trauma_reserve: bg === 'O-' || bg === 'O+',
            requires_replacement_donor: false,
          });
        }
      }
    }

    return {
      ...hosp,
      wards: updatedWards,
      blood_summary: updatedBloodSummary,
      blood_inventory: override?.blood_stock || hosp.blood_inventory,
    };
  });
}

// ─── Legacy sync from cloud (used in some components) ───────────────────────
export async function syncFromCloud(): Promise<boolean> {
  await fetchAllFromCloud();
  notifyListeners();
  return true;
}


// ─── Cancel a Bed Hold (Citizen releases a bed) ─────────────────────────────
export async function cancelBedHold(otpOrHoldId: string, hospitalId?: string): Promise<void> {
  if (!otpOrHoldId && !hospitalId) return;

  const clean = String(otpOrHoldId || '').trim();

  // Instant local status update & listener notification: remove cancelled hold immediately
  _localHolds = _localHolds.filter((h) => {
    if (!h) return false;
    const hOtp = String(h.otp || '').trim();
    const hId = String(h.hold_id || '').trim();
    if (clean && (hOtp === clean || hId === clean)) return false;
    if (hospitalId && clean && h.hospital_id === hospitalId && (hOtp === clean || hId === clean)) return false;
    return h.status === 'ACTIVE' && new Date(h.expires_at).getTime() > Date.now();
  });
  saveHoldsToStorage(_localHolds);
  notifyListeners();

  // Remove/Cancel hold in Supabase
  try {
    if (clean) {
      await Promise.all([
        supabase.from('active_holds').delete().eq('otp', clean),
        supabase.from('active_holds').delete().eq('hold_id', clean),
      ]);
    }
    if (hospitalId && clean) {
      await supabase.from('active_holds').delete().eq('hospital_id', hospitalId).eq('otp', clean);
    }
  } catch (e) {
    console.warn('Failed to delete hold in Supabase:', e);
  }
}


// ─── Reset & Re-sync All Data ────────────────────────────────────────────────
export async function resetAndResyncAllData(hospitalId?: string): Promise<void> {
  if (hospitalId) {
    _localAdmitted = _localAdmitted.filter((a) => a.hospital_id !== hospitalId);
    _localHolds = _localHolds.filter((h) => h.hospital_id !== hospitalId);
    delete _localOverrides[hospitalId];
  } else {
    _localAdmitted = [];
    _localHolds = [];
    _localOverrides = {};
  }
  saveOverridesToStorage(_localOverrides);

  saveAdmittedToStorage(_localAdmitted);
  saveHoldsToStorage(_localHolds);

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('pulsegrid_active_hold_v2');
      localStorage.removeItem('pulsegrid_active_holds_cache_v2');
      localStorage.removeItem('pulsegrid_admitted_patients_v2');
    } catch {}
  }

  try {
    if (hospitalId) {
      await supabase.from('admitted_patients').delete().eq('hospital_id', hospitalId);
      await supabase.from('active_holds').update({ status: 'CANCELLED' }).eq('hospital_id', hospitalId);
      await supabase.from('hospital_overrides').delete().eq('hospital_id', hospitalId);
    } else {
      await supabase.from('admitted_patients').delete().neq('id', '0');
      await supabase.from('active_holds').update({ status: 'CANCELLED' }).neq('hold_id', '0');
      await supabase.from('hospital_overrides').delete().neq('hospital_id', '0');
    }
  } catch (e) {
    console.warn('Supabase reset exception:', e);
  }

  notifyListeners();
}

// ─── Discharge Patient & Restore Bed Capacity ───────────────────────────────
export async function dischargePatient(
  admissionId: string,
  hospitalId: string,
  wardCode: string
): Promise<{ success: boolean; message: string }> {
  if (!admissionId) return { success: false, message: 'Invalid admission ID.' };

  // Remove from Supabase admitted_patients
  try {
    await supabase.from('admitted_patients').delete().eq('id', admissionId);
  } catch (e) {
    console.warn('Failed to remove admitted patient from Supabase:', e);
  }

  // Restore physical capacity (+1 bed) in overrides
  const hospId = hospitalId;
  const existingOverride = _localOverrides[hospId] || { id: hospId, ward_beds: {} };
  const currentWardBeds = normalizeWardBeds(existingOverride.ward_beds || {});

  const DEFAULT_WARD_CAPACITIES: Record<string, number> = {
    cardiac_icu: 4,
    adult_icu: 4,
    pediatric_icu: 2,
    general_ward: 6,
    general_oxygen: 6,
  };

  let currentVal = currentWardBeds[wardCode];
  if (currentVal === undefined) {
    currentVal = DEFAULT_WARD_CAPACITIES[wardCode] ?? 4;
  }

  const newVal = currentVal + 1;
  currentWardBeds[wardCode] = newVal;
  if (wardCode === 'general_oxygen' || wardCode === 'general_ward') {
    currentWardBeds.general_ward = newVal;
    currentWardBeds.general_oxygen = newVal;
  }

  const updatedOverride: AdminHospitalOverride = {
    ...existingOverride,
    id: hospId,
    ward_beds: currentWardBeds,
    updated_at: Date.now(),
  };

  _localOverrides[hospId] = updatedOverride;
  saveOverridesToStorage(_localOverrides);

  try {
    await supabase.from('hospital_overrides').upsert({
      hospital_id: hospId,
      total_nurses: updatedOverride.total_nurses,
      ward_beds: currentWardBeds,
      blood_stock: updatedOverride.blood_stock || {},
      updated_at: new Date().toISOString(),
    }, { onConflict: 'hospital_id' });
  } catch (e) {
    console.warn('Failed to update ward beds after discharge:', e);
  }

  _localAdmitted = _localAdmitted.filter((a) => a.id !== admissionId);
  saveAdmittedToStorage(_localAdmitted);
  notifyListeners();

  return {
    success: true,
    message: `✅ Patient Discharged! 1 bed restored to ${wardCode.toUpperCase()} available inventory.`,
  };
}
