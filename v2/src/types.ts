export type SeverityLevel = 'RED' | 'YELLOW' | 'GREEN';

export type WardCode = 'adult_icu' | 'pediatric_icu' | 'cardiac_icu' | 'general_oxygen';

export interface WardCapacity {
  ward_code: WardCode;
  label: string;
  total_physical: number;
  total_staffed: number;
  occupied: number;
  held_now: number;
  available_now: number;
  ghost_gap: number;
}

export interface BloodStock {
  blood_group: 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';
  component: 'PRBC' | 'PLATELETS' | 'PLASMA';
  units_free_now: number;
  is_trauma_reserve: boolean;
  requires_replacement_donor: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  short_name: string;
  area: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  emergency_phone: string;
  rating: number;
  is_govt: boolean;
  is_trauma_center: boolean;
  has_blood_bank: boolean;
  has_cath_lab: boolean;
  has_pediatric_icu: boolean;
  trauma_level: string; // e.g. "Level-1 Trauma & Cardiac Bay Ready"
  distance_km: number;
  eta_minutes: number;
  wards: WardCapacity[];
  blood_summary: BloodStock[];
  corridor_name?: string;
}

export interface RapidScanSymptom {
  id: string;
  label: string;
  checked: boolean;
  iconType?: string;
}

export interface ClinicalProtocol {
  category: string;
  esi_acuity: string; // e.g. "🚨 ESI-1 CRITICAL (Immediate Cardiac ICU Triage)"
  priority_code: string; // e.g. "ACS-STEMI-STAT"
  title: string;
  target_ward: WardCode;
  rapid_scan_symptoms: RapidScanSymptom[];
  immediate_action: {
    badge: string;
    title: string;
    instruction: string;
    angle_badge?: string;
  };
  protocol_steps: string[];
  do_nots: string[];
  calming_script: string;
}

export interface LiveHold {
  hold_id: string;
  hospital_id: string;
  hospital_name: string;
  ward_code: WardCode;
  ward_label: string;
  otp_code: string;
  seconds_left: number;
  total_seconds: number;
  hold_type: 'CITIZEN' | 'PARAMEDIC';
  severity: SeverityLevel;
  requester_phone: string;
  requester_name: string;
  created_at: string;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';
  vector_status: 'TOWARD' | 'STATIONARY' | 'AWAY';
  current_lat: number;
  current_lng: number;
  eta_display: string;
}

export interface DetailedSymptom {
  id: string;
  name: string;
  category: string;
  severity: SeverityLevel;
  esi_level: string; // e.g. "ESI-1 (Immediate Resuscitation)", "ESI-2 (Emergent)", "ESI-3 (Urgent)"
  target_ward: WardCode;
  keywords: string[];

  // Diagnostic breakdown - what kind of problem we are facing
  problem_overview: string;
  possible_conditions: string[];
  urgency_note: string;

  // What to check
  what_to_check: {
    vitals: string[];
    red_flags: string[];
    physical_signs: string[];
  };

  // How to help and what to do
  immediate_actions: string[];
  what_not_to_do: string[];
  home_care_or_triage: string;
  hospital_prep: string;
}

export interface AITriageResult {
  query: string;
  detected_symptom: string;
  detected_language?: string;
  english_translation?: string;
  problem_overview: string;
  possible_conditions: string[];
  immediate_solution: string[];
  what_not_to_do?: string[];
  severity: SeverityLevel;
  esi_level: string;
  recommended_ward: WardCode;
  urgency_note?: string;
  matched_symptom_id?: string;
  is_ai_generated?: boolean;
}
