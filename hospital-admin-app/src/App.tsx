import React, { useState, useEffect } from 'react';
import {
  getLocalOverrides,
  pushOverridesToCloud,
  verifyAndAdmitOTP,
  getLocalHolds,
  getLocalAdmitted,
  subscribeToCloudDb,
  cancelBedHold,
  dischargePatient,
  resetAndResyncAllData,
  ActiveHold,
  AdmittedPatient,
} from './utils/cloudDb';
import { computeStaffedWardBeds } from './utils/staffingEngine';
import {
  Building2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Activity,
  Droplet,
  BedDouble,
  ShieldAlert,
  ArrowRight,
  LogOut,
  RotateCcw,
  Trash2,
  Zap,
  Plus,
  Minus,
  Clock,
  Settings,
  HeartPulse,
  Baby,
  Stethoscope,
  Sparkles,
  Check,
} from 'lucide-react';

export const HOSPITAL_CREDENTIALS = [
  {
    code: 'ILS-02',
    id: 'hosp-ils-nagerbazar',
    name: 'ILS Hospitals, Dum Dum',
    pass: 'admin123',
    defaults: {
      total_nurses: 24,
      ward_beds: { cardiac_icu: 4, adult_icu: 4, pediatric_icu: 2, general_ward: 6, general_oxygen: 6 },
      blood_stock: { 'O-': 7, 'O+': 14, 'A+': 12, 'B+': 18, 'AB+': 5 },
    },
  },
  {
    code: 'TMC-01',
    id: 'hosp-tmc-newtown',
    name: 'Tata Medical Center, New Town',
    pass: 'admin123',
    defaults: {
      total_nurses: 28,
      ward_beds: { adult_icu: 5, cardiac_icu: 3, pediatric_icu: 4, general_ward: 9, general_oxygen: 9 },
      blood_stock: { 'O-': 4, 'O+': 12, 'A+': 10, 'B+': 14, 'AB+': 5 },
    },
  },
  {
    code: 'CHRN-03',
    id: 'hosp-charnock-vip',
    name: 'Charnock Hospital, VIP Road',
    pass: 'admin123',
    defaults: {
      total_nurses: 30,
      ward_beds: { cardiac_icu: 4, adult_icu: 4, pediatric_icu: 3, general_ward: 7, general_oxygen: 7 },
      blood_stock: { 'O-': 8, 'O+': 16, 'A+': 14, 'B+': 20, 'AB+': 6 },
    },
  },
  {
    code: 'OHIO-04',
    id: 'hosp-ohio-newtown',
    name: 'Ohio Hospital, New Town',
    pass: 'admin123',
    defaults: {
      total_nurses: 20,
      ward_beds: { cardiac_icu: 4, adult_icu: 4, pediatric_icu: 2, general_ward: 8, general_oxygen: 8 },
      blood_stock: { 'O-': 5, 'O+': 10, 'A+': 8, 'B+': 12, 'AB+': 4 },
    },
  },
  {
    code: 'HCG-05',
    id: 'hosp-hcg-newtown',
    name: 'HCG EKO Cancer Centre',
    pass: 'admin123',
    defaults: {
      total_nurses: 18,
      ward_beds: { cardiac_icu: 3, adult_icu: 3, pediatric_icu: 2, general_ward: 6, general_oxygen: 6 },
      blood_stock: { 'O-': 3, 'O+': 8, 'A+': 6, 'B+': 10, 'AB+': 3 },
    },
  },
  {
    code: 'DDM-06',
    id: 'hosp-dumdum-municipal',
    name: 'Dum Dum Municipal Hospital',
    pass: 'admin123',
    defaults: {
      total_nurses: 16,
      ward_beds: { cardiac_icu: 2, adult_icu: 4, pediatric_icu: 1, general_ward: 3, general_oxygen: 3 },
      blood_stock: { 'O-': 3, 'O+': 8, 'A+': 6, 'B+': 10, 'AB+': 3 },
    },
  },
  {
    code: 'NCB-07',
    id: 'hosp-north-city-neuro',
    name: 'North City Hospital & Neuro Institute, Baguiati',
    pass: 'admin123',
    defaults: {
      total_nurses: 22,
      ward_beds: { cardiac_icu: 3, adult_icu: 4, pediatric_icu: 2, general_ward: 6, general_oxygen: 6 },
      blood_stock: { 'O-': 6, 'O+': 11, 'A+': 9, 'B+': 15, 'AB+': 4 },
    },
  },
  {
    code: 'NEO-08',
    id: 'hosp-neotia-newtown',
    name: 'Bhagirathi Neotia Woman & Child Care, New Town',
    pass: 'admin123',
    defaults: {
      total_nurses: 26,
      ward_beds: { cardiac_icu: 2, adult_icu: 3, pediatric_icu: 6, general_ward: 8, general_oxygen: 8 },
      blood_stock: { 'O-': 5, 'O+': 14, 'A+': 10, 'B+': 16, 'AB+': 4 },
    },
  },
  {
    code: 'CNCI-09',
    id: 'hosp-cnci-newtown',
    name: 'Chittaranjan National Cancer Institute (CNCI), New Town',
    pass: 'admin123',
    defaults: {
      total_nurses: 32,
      ward_beds: { cardiac_icu: 4, adult_icu: 5, pediatric_icu: 3, general_ward: 10, general_oxygen: 10 },
      blood_stock: { 'O-': 8, 'O+': 18, 'A+': 14, 'B+': 22, 'AB+': 6 },
    },
  },
  {
    code: 'APO-10',
    id: 'hosp-apollo-gleneagles',
    name: 'Apollo Multispeciality Hospitals',
    pass: 'admin123',
    defaults: {
      total_nurses: 40,
      ward_beds: { cardiac_icu: 6, adult_icu: 8, pediatric_icu: 4, general_ward: 12, general_oxygen: 12 },
      blood_stock: { 'O-': 12, 'O+': 25, 'A+': 20, 'B+': 28, 'AB+': 8 },
    },
  },
  {
    code: 'GLC-11',
    id: 'hosp-glocal-newtown',
    name: 'Glocal Hospital, New Town (Action Area II)',
    pass: 'admin123',
    defaults: {
      total_nurses: 18,
      ward_beds: { cardiac_icu: 2, adult_icu: 3, pediatric_icu: 2, general_ward: 6, general_oxygen: 6 },
      blood_stock: { 'O-': 3, 'O+': 8, 'A+': 7, 'B+': 10, 'AB+': 3 },
    },
  },
  {
    code: 'DAMA-12',
    id: 'hosp-techno-dama',
    name: 'Techno India DAMA Hospital, New Town / Salt Lake',
    pass: 'admin123',
    defaults: {
      total_nurses: 26,
      ward_beds: { cardiac_icu: 3, adult_icu: 5, pediatric_icu: 2, general_ward: 8, general_oxygen: 8 },
      blood_stock: { 'O-': 5, 'O+': 12, 'A+': 10, 'B+': 14, 'AB+': 4 },
    },
  },
  {
    code: 'MANI-13',
    id: 'hosp-columbia-manipal',
    name: 'Manipal Hospital (Columbia Asia), Salt Lake / New Town',
    pass: 'admin123',
    defaults: {
      total_nurses: 34,
      ward_beds: { cardiac_icu: 5, adult_icu: 6, pediatric_icu: 3, general_ward: 10, general_oxygen: 10 },
      blood_stock: { 'O-': 8, 'O+': 20, 'A+': 15, 'B+': 22, 'AB+': 6 },
    },
  },
];

export const WARDS = [
  { code: 'adult_icu', label: 'Adult ICU', icon: Activity, default: 5, color: 'from-amber-500/20 to-orange-500/20' },
  { code: 'cardiac_icu', label: 'Cardiac ICU', icon: HeartPulse, default: 3, color: 'from-rose-500/20 to-pink-500/20' },
  { code: 'pediatric_icu', label: 'Pediatric ICU', icon: Baby, default: 2, color: 'from-cyan-500/20 to-blue-500/20' },
  { code: 'general_ward', label: 'General Ward', icon: Stethoscope, default: 4, color: 'from-emerald-500/20 to-teal-500/20' },
];

export default function App() {
  // Persistent Login & Station State across refreshes
  const [selectedCode, setSelectedCode] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('pulsegrid_admin_selected_code');
        if (saved && HOSPITAL_CREDENTIALS.some((c) => c.code === saved)) {
          return saved;
        }
      }
    } catch {}
    return 'ILS-02';
  });

  const [password, setPassword] = useState('admin123');

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('pulsegrid_admin_is_logged_in') === 'true';
      }
    } catch {}
    return false;
  });
  const [loginError, setLoginError] = useState('');

  const activeHospMeta = HOSPITAL_CREDENTIALS.find((c) => c.code === selectedCode) || HOSPITAL_CREDENTIALS[0];

  // 5 Tabs: 'beds' | 'blood' | 'admitted' | 'holds' | 'station'
  const [activeTab, setActiveTab] = useState<'beds' | 'blood' | 'admitted' | 'holds' | 'station'>('beds');

  // Simple Bed State
  const [totalNurses, setTotalNurses] = useState(24);
  const [wardBeds, setWardBeds] = useState<Record<string, number>>({
    cardiac_icu: 4,
    adult_icu: 4,
    pediatric_icu: 2,
    general_ward: 6,
  });

  const [activeHoldsList, setActiveHoldsList] = useState<ActiveHold[]>([]);
  const [admittedList, setAdmittedList] = useState<AdmittedPatient[]>([]);

  // Total Available Beds = sum of ward beds
  const totalBaseBeds = WARDS.reduce((sum, w) => sum + (wardBeds[w.code] ?? wardBeds[w.code === 'general_ward' ? 'general_oxygen' : 'general_ward'] ?? 0), 0);
  const activeHoldsCount = (activeHoldsList || []).filter((h) => h && h.status === 'ACTIVE').length;
  const totalAvailableBeds = Math.max(0, totalBaseBeds - activeHoldsCount);

  const defBeds = activeHospMeta?.defaults?.ward_beds || {
    cardiac_icu: 4,
    adult_icu: 4,
    pediatric_icu: 2,
    general_ward: 8,
  };
  const physCapacity = {
    adult_icu: defBeds.adult_icu ?? 2,
    cardiac_icu: defBeds.cardiac_icu ?? 1,
    pediatric_icu: defBeds.pediatric_icu ?? 1,
    general_ward: defBeds.general_ward ?? 7,
  };
  const currentStaffing = computeStaffedWardBeds(totalNurses, physCapacity);

  // Blood Stock State
  const [bloodStock, setBloodStock] = useState<Record<string, number>>({
    'O-': 6,
    'O+': 14,
    'A+': 12,
    'B+': 18,
    'AB+': 5,
  });

  // Persistent OTP Terminal State (bottom of each tab)
  const lastUserTapRef = React.useRef<number>(0);
  const [otpInput, setOtpInput] = useState('');
  const [selectedWardForAdmit, setSelectedWardForAdmit] = useState('adult_icu');
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [lastUpdatedKey, setLastUpdatedKey] = useState<string | null>(null);

  const loadDataFromCloudDb = () => {
    // If user tapped + or - in the last 2 seconds, do not overwrite local smooth UI state with cloud poll
    if (Date.now() - lastUserTapRef.current < 2000) {
      const holds = getLocalHolds().filter(
        (h) => h.hospital_id === activeHospMeta.id && h.status === 'ACTIVE' && new Date(h.expires_at).getTime() > Date.now()
      );
      setActiveHoldsList(holds);
      const admitted = getLocalAdmitted().filter((a) => a.hospital_id === activeHospMeta.id);
      setAdmittedList(admitted);
      return;
    }

    const overrides = getLocalOverrides();
    const existing = overrides[activeHospMeta.id];
    const defs = activeHospMeta.defaults;

    if (existing) {
      if (existing.total_nurses !== undefined) setTotalNurses(existing.total_nurses);
      else if (defs) setTotalNurses(defs.total_nurses);

      if (existing.ward_beds) setWardBeds({ ...defs.ward_beds, ...existing.ward_beds });
      else if (defs) setWardBeds(defs.ward_beds);

      if (existing.blood_stock) setBloodStock({ ...defs.blood_stock, ...existing.blood_stock });
      else if (defs) setBloodStock(defs.blood_stock);
    } else if (defs) {
      setTotalNurses(defs.total_nurses);
      setWardBeds(defs.ward_beds);
      setBloodStock(defs.blood_stock);
    }

    const holds = getLocalHolds().filter(
      (h) => h.hospital_id === activeHospMeta.id && h.status === 'ACTIVE' && new Date(h.expires_at).getTime() > Date.now()
    );
    setActiveHoldsList(holds);

    const admitted = getLocalAdmitted().filter((a) => a.hospital_id === activeHospMeta.id);
    setAdmittedList(admitted);
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    loadDataFromCloudDb();

    const unsubscribe = subscribeToCloudDb(() => {
      loadDataFromCloudDb();
    });

    return unsubscribe;
  }, [isLoggedIn, selectedCode]);

  // Auto-detect and preselect ward from matching hold when OTP is typed
  useEffect(() => {
    const cleanOtp = otpInput.trim();
    if (cleanOtp.length === 4) {
      const matchingHold = activeHoldsList.find(
        (h) => h && h.status === 'ACTIVE' && h.otp === cleanOtp && (h.hospital_id === activeHospMeta.id || !h.hospital_id)
      );
      if (matchingHold && matchingHold.ward_code) {
        const targetCode = matchingHold.ward_code === 'general_oxygen' ? 'general_ward' : matchingHold.ward_code;
        if (WARDS.some((w) => w.code === targetCode)) {
          setSelectedWardForAdmit(targetCode);
        }
      }
    }
  }, [otpInput, activeHoldsList, activeHospMeta.id]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const match = HOSPITAL_CREDENTIALS.find((c) => c.code === selectedCode);
    if (match && password === match.pass) {
      setIsLoggedIn(true);
      setLoginError('');
      try {
        localStorage.setItem('pulsegrid_admin_is_logged_in', 'true');
        localStorage.setItem('pulsegrid_admin_selected_code', selectedCode);
      } catch {}
    } else {
      setLoginError('Invalid Password! Default station password is "admin123".');
    }
  };

  // Instant Cloud Sync Helper
  const autoSyncToCloudDb = async (
    newNurses = totalNurses,
    newWards = wardBeds,
    newBlood = bloodStock,
    updatedLabel = 'Resource'
  ) => {
    const overrides = getLocalOverrides();
    const sumAvail = WARDS.reduce((sum, w) => sum + (newWards[w.code] ?? newWards[w.code === 'general_ward' ? 'general_oxygen' : 'general_ward'] ?? 0), 0);

    overrides[activeHospMeta.id] = {
      id: activeHospMeta.id,
      available_beds: sumAvail,
      total_nurses: newNurses,
      ward_beds: newWards,
      blood_stock: newBlood,
      updated_at: Date.now(),
    };

    await pushOverridesToCloud(overrides);

    setLastUpdatedKey(updatedLabel);
    setTimeout(() => setLastUpdatedKey(null), 1500);

    setStatusMessage({
      success: true,
      text: `⚡ Auto-Synced! ${updatedLabel} updated (${sumAvail} free beds total). Synced to Website 1 live.`,
    });
  };

  // TAB 1: BEDS Handlers
  const adjustNurses = (delta: number) => {
    lastUserTapRef.current = Date.now();
    const newNurses = Math.max(0, totalNurses + delta);
    setTotalNurses(newNurses);

    const defBeds = activeHospMeta?.defaults?.ward_beds || {
      cardiac_icu: 4,
      adult_icu: 4,
      pediatric_icu: 2,
      general_ward: 8,
    };
    const physCapacity = {
      adult_icu: defBeds.adult_icu ?? 2,
      cardiac_icu: defBeds.cardiac_icu ?? 1,
      pediatric_icu: defBeds.pediatric_icu ?? 1,
      general_ward: defBeds.general_ward ?? 7,
    };

    const staffing = computeStaffedWardBeds(newNurses, physCapacity);
    const updated = {
      ...wardBeds,
      adult_icu: staffing.adult_icu,
      cardiac_icu: staffing.cardiac_icu,
      pediatric_icu: staffing.pediatric_icu,
      general_ward: staffing.general_ward,
      general_oxygen: staffing.general_ward,
    };
    setWardBeds(updated);
    autoSyncToCloudDb(newNurses, updated, bloodStock, 'Nurses');
  };

  const adjustWardBeds = (wardCode: string, delta: number) => {
    lastUserTapRef.current = Date.now();
    const currentVal = wardBeds[wardCode] || 0;
    const newVal = Math.max(0, currentVal + delta);
    const updated = {
      ...wardBeds,
      [wardCode]: newVal,
    };
    if (wardCode === 'general_ward' || wardCode === 'general_oxygen') {
      updated.general_ward = newVal;
      updated.general_oxygen = newVal;
    }
    setWardBeds(updated);
    const wardObj = WARDS.find((w) => w.code === wardCode);
    autoSyncToCloudDb(totalNurses, updated, bloodStock, wardObj?.label || 'Beds');
  };

  // TAB 2: BLOOD Handler
  const adjustBloodGroup = (group: string, delta: number) => {
    lastUserTapRef.current = Date.now();
    const updated = {
      ...bloodStock,
      [group]: Math.max(0, (bloodStock[group] || 0) + delta),
    };
    setBloodStock(updated);
    autoSyncToCloudDb(totalNurses, wardBeds, updated, `Blood ${group}`);
  };

  // OTP Admission Handler (With Selected Ward Choice)
    const handleResetAndResync = async () => {
    if (!window.confirm(`Are you sure you want to reset all admitted logs, release active holds, and restore station defaults for ${activeHospMeta.name}?`)) {
      return;
    }
    const defs = activeHospMeta.defaults;
    if (defs) {
      setTotalNurses(defs.total_nurses);
      setWardBeds(defs.ward_beds);
      setBloodStock(defs.blood_stock);
    }
    await resetAndResyncAllData(activeHospMeta.id);
    setAdmittedList([]);
    setActiveHoldsList([]);
    setStatusMessage({
      success: true,
      text: `⚡ Station Data & Admitted Logs Reset & Re-synced Cleanly! Capacity restored to baseline.`,
    });
  };

  const [admitSuccessModal, setAdmitSuccessModal] = useState<{
    show: boolean;
    patientName: string;
    otp: string;
    wardLabel: string;
    hospitalName: string;
  } | null>(null);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpInput.trim();
    const matchingHold = activeHoldsList.find(
      (h) => h && h.status === 'ACTIVE' && h.otp === cleanOtp && (h.hospital_id === activeHospMeta.id || !h.hospital_id)
    );

    let chosenWardCode = selectedWardForAdmit;
    if (matchingHold && matchingHold.ward_code) {
      const matchingHoldWard = matchingHold.ward_code === 'general_oxygen' ? 'general_ward' : matchingHold.ward_code;
      if (!selectedWardForAdmit || selectedWardForAdmit === 'adult_icu') {
        chosenWardCode = matchingHoldWard;
      }
    }

    const wardObj = WARDS.find((w) => w.code === chosenWardCode) || WARDS.find((w) => w.code === selectedWardForAdmit) || WARDS[0];
    const res = await verifyAndAdmitOTP(otpInput, activeHospMeta.id, wardObj.code, wardObj.label);

    setStatusMessage({ success: res.success, text: res.message });
    if (res.success) {
      setAdmitSuccessModal({
        show: true,
        patientName: res.hold?.patient_name || matchingHold?.patient_name || 'Emergency Patient',
        otp: cleanOtp,
        wardLabel: wardObj.label,
        hospitalName: activeHospMeta.name,
      });
      setOtpInput('');
      loadDataFromCloudDb();
    }
  };

  // ----------------------------------------------------
  // LOGIN SCREEN (ANIMATED & SLEEK)
  // ----------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#060d1b] text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-sans selection:bg-[#FF671F] selection:text-white">
        <div className="w-full max-w-md bg-[#0b162c]/95 border border-[#182b52] rounded-[32px] p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#FF671F]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Tiranga Header Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF671F] via-white to-[#138808]" />

          <div className="flex items-center space-x-3.5 mb-8 pt-2">
            <div className="p-3 bg-gradient-to-tr from-[#FF671F] to-orange-600 rounded-2xl shadow-lg shadow-[#FF671F]/20 transform transition-transform hover:scale-105">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none">PulseGrid ER Desk</h1>
              <p className="text-xs text-slate-400 font-medium mt-1">Hospital Portal • Shared Database Command</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-widest mb-2">
                Select Hospital Station
              </label>
              <select
                value={selectedCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCode(val);
                  try {
                    localStorage.setItem('pulsegrid_admin_selected_code', val);
                  } catch {}
                }}
                className="w-full bg-[#070e1e] border border-[#182b52] rounded-2xl px-4 py-3.5 text-sm text-white font-bold focus:outline-none focus:border-[#FF671F] transition-all duration-200 shadow-inner"
              >
                {HOSPITAL_CREDENTIALS.map((cred) => (
                  <option key={cred.code} value={cred.code}>
                    {cred.code} — {cred.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-widest mb-2">
                Station Access Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter hospital password"
                  className="w-full bg-[#070e1e] border border-[#182b52] rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#FF671F] transition-all duration-200 font-mono shadow-inner"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-medium flex items-center space-x-1">
                <span>Default station password:</span>
                <code className="text-[#FF671F] font-bold bg-[#FF671F]/10 px-1.5 py-0.5 rounded border border-[#FF671F]/20">admin123</code>
              </p>
            </div>

            {loginError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center space-x-2.5 animate-in slide-in-from-top-2 duration-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 liquid-btn-saffron text-white font-black rounded-2xl text-sm tracking-wide transition-all duration-200 shadow-lg shadow-[#FF671F]/25 flex justify-center items-center space-x-2 cursor-pointer active:scale-98 hover:brightness-110"
            >
              <span>ENTER HOSPITAL DESK</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN DASHBOARD (CLEAN, ANIMATED, 5 SIMPLE TABS + PERSISTENT OTP PANEL)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#060d1b] text-slate-100 flex flex-col font-sans selection:bg-[#FF671F] selection:text-white">
      {/* Tiranga Top Stripe Accent */}
      <div className="h-1 bg-gradient-to-r from-[#FF671F] via-white to-[#138808] z-50 sticky top-0" />

      {/* Header */}
      <header className="bg-[#0b162c]/90 border-b border-[#182b52] backdrop-blur-xl sticky top-1 z-40 px-4 lg:px-8 py-3.5 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-gradient-to-tr from-[#FF671F] to-orange-600 rounded-2xl shadow-md shadow-[#FF671F]/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-black text-white tracking-tight">{activeHospMeta.name}</h1>
                <span className="bg-[#FF671F]/20 text-[#FF671F] text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-[#FF671F]/30 shadow-sm">
                  {selectedCode}
                </span>
              </div>
              <p className="text-xs text-emerald-400 font-bold flex items-center space-x-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>⚡ Auto-Sync Active • Every tap updates Website 1 live</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetAndResync}
              className="p-2.5 bg-[#182b52] hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 rounded-2xl transition-all duration-200 flex items-center space-x-1.5 text-xs font-extrabold cursor-pointer border border-[#182b52] active:scale-95 shadow-sm"
              title="Reset & Re-sync Station Data"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Reset & Re-Sync</span>
            </button>

            <button
              onClick={() => {
                setIsLoggedIn(false);
                try {
                  localStorage.removeItem('pulsegrid_admin_is_logged_in');
                } catch {}
              }}
              className="p-2.5 bg-[#182b52] hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 rounded-2xl transition-all duration-200 flex items-center space-x-1.5 text-xs font-extrabold cursor-pointer border border-[#182b52] active:scale-95"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Status Notification Banner */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between space-x-3 text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
              statusMessage.success
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-lg shadow-rose-500/10'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {statusMessage.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-xs opacity-70 hover:opacity-100 transition-opacity">
              ✕
            </button>
          </div>
        )}

        {/* 5 SIMPLE TABS NAVIGATION */}
        <div className="flex border-b border-[#182b52] space-x-3 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveTab('beds')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all duration-200 shrink-0 cursor-pointer ${
              activeTab === 'beds'
                ? 'bg-[#FF671F] text-white shadow-lg shadow-[#FF671F]/25 scale-102'
                : 'bg-[#0b162c] text-slate-400 hover:text-white hover:bg-[#182b52] border border-[#182b52]'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>1. BEDS</span>
          </button>

          <button
            onClick={() => setActiveTab('blood')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all duration-200 shrink-0 cursor-pointer ${
              activeTab === 'blood'
                ? 'bg-[#FF671F] text-white shadow-lg shadow-[#FF671F]/25 scale-102'
                : 'bg-[#0b162c] text-slate-400 hover:text-white hover:bg-[#182b52] border border-[#182b52]'
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span>2. BLOOD</span>
          </button>

          <button
            onClick={() => setActiveTab('admitted')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all duration-200 shrink-0 cursor-pointer ${
              activeTab === 'admitted'
                ? 'bg-[#FF671F] text-white shadow-lg shadow-[#FF671F]/25 scale-102'
                : 'bg-[#0b162c] text-slate-400 hover:text-white hover:bg-[#182b52] border border-[#182b52]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>3. ADMITTED LOG ({admittedList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('holds')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all duration-200 shrink-0 cursor-pointer ${
              activeTab === 'holds'
                ? 'bg-[#FF671F] text-white shadow-lg shadow-[#FF671F]/25 scale-102'
                : 'bg-[#0b162c] text-slate-400 hover:text-white hover:bg-[#182b52] border border-[#182b52]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>4. ACTIVE HOLDS ({activeHoldsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('station')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all duration-200 shrink-0 cursor-pointer ${
              activeTab === 'station'
                ? 'bg-[#FF671F] text-white shadow-lg shadow-[#FF671F]/25 scale-102'
                : 'bg-[#0b162c] text-slate-400 hover:text-white hover:bg-[#182b52] border border-[#182b52]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>5. STATION INFO</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: 🛏️ BEDS */}
        {/* ========================================================================= */}
        {activeTab === 'beds' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top 2 Hero Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* TOTAL AVAILABLE BEDS CARD */}
              <div className="liquid-glass-card rounded-[28px] p-6 border border-emerald-500/40 flex items-center justify-between shadow-xl relative overflow-hidden transition-all duration-200 hover:border-emerald-500/70">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <span className="text-xs text-emerald-400 font-black uppercase tracking-wider block">
                    TOTAL AVAILABLE BEDS
                  </span>
                  <span className="text-5xl font-black text-white mt-1 block tracking-tight">{totalAvailableBeds}</span>
                  <span className="text-[11px] text-slate-400 font-semibold mt-1 block">Live on Website 1</span>
                </div>

                <div className="flex items-center space-x-3 z-10">
                  <button
                    type="button"
                    onClick={() => adjustWardBeds('general_ward', -1)}
                    className="w-14 h-14 rounded-2xl bg-[#182b52] hover:bg-slate-700 text-white font-black text-2xl flex justify-center items-center transition-all duration-150 cursor-pointer active:scale-90 shadow-md border border-slate-700"
                  >
                    <Minus className="w-7 h-7 stroke-[3]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustWardBeds('general_ward', 1)}
                    className="w-14 h-14 rounded-2xl liquid-btn-saffron text-white font-black text-2xl flex justify-center items-center transition-all duration-150 cursor-pointer active:scale-90 shadow-lg shadow-[#FF671F]/30"
                  >
                    <Plus className="w-7 h-7 stroke-[3]" />
                  </button>
                </div>
              </div>

              {/* TOTAL AVAILABLE NURSES CARD */}
              <div className="liquid-glass-card rounded-[28px] p-6 border border-cyan-500/40 flex items-center justify-between shadow-xl relative overflow-hidden transition-all duration-200 hover:border-cyan-500/70">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <span className="text-xs text-cyan-400 font-black uppercase tracking-wider block">
                    AVAILABLE NURSES ON SHIFT
                  </span>
                  <span className="text-5xl font-black text-cyan-400 mt-1 block tracking-tight">{totalNurses}</span>
                  <span className="text-[11px] text-slate-400 font-semibold mt-1 block">Active duty staff</span>
                </div>

                <div className="flex items-center space-x-3 z-10">
                  <button
                    type="button"
                    onClick={() => adjustNurses(-1)}
                    className="w-14 h-14 rounded-2xl bg-[#182b52] hover:bg-slate-700 text-white font-black text-2xl flex justify-center items-center transition-all duration-150 cursor-pointer active:scale-90 shadow-md border border-slate-700"
                  >
                    <Minus className="w-7 h-7 stroke-[3]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustNurses(1)}
                    className="w-14 h-14 rounded-2xl liquid-btn-saffron text-white font-black text-2xl flex justify-center items-center transition-all duration-150 cursor-pointer active:scale-90 shadow-lg shadow-[#FF671F]/30"
                  >
                    <Plus className="w-7 h-7 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>


            {/* Individual ICU & Ward Bed Breakdown */}
            <div className="liquid-glass-card rounded-[32px] p-6 border border-[#182b52] space-y-5 shadow-xl">
              <h2 className="text-base font-black text-white flex items-center space-x-2 border-b border-[#182b52] pb-4">
                <Activity className="w-5 h-5 text-[#FF671F]" />
                <span>Individual ICU & Ward Bed Availability</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WARDS.map((w) => {
                  const IconComponent = w.icon;
                  const baseCount = wardBeds[w.code] || 0;

                  // Count active holds reserved for this specific ward
                  const wardHoldsCount = (activeHoldsList || []).filter(
                    (h) =>
                      h &&
                      h.status === 'ACTIVE' &&
                      new Date(h.expires_at).getTime() > Date.now() &&
                      (h.ward_code === w.code ||
                        (w.code === 'general_ward' && h.ward_code === 'general_oxygen') ||
                        (w.code === 'general_oxygen' && h.ward_code === 'general_ward'))
                  ).length;

                  const netFreeBeds = Math.max(0, baseCount - wardHoldsCount);
                  const isUpdated = lastUpdatedKey === w.label;

                  return (
                    <div
                      key={w.code}
                      className={`p-4 rounded-2xl border transition-all duration-200 flex justify-between items-center ${
                        isUpdated
                          ? 'bg-emerald-500/20 border-emerald-500 scale-102 shadow-lg shadow-emerald-500/20'
                          : 'bg-[#070e1e] border-[#182b52] hover:border-[#FF671F]/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className={`p-3 bg-gradient-to-tr ${w.color} text-white rounded-2xl border border-white/10 shadow-sm`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-white uppercase block tracking-wide">{w.label}</span>
                            {wardHoldsCount > 0 && (
                              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-500/40 flex items-center space-x-1 shadow-sm">
                                <Lock className="w-3 h-3 text-amber-400" />
                                <span>{wardHoldsCount} Reserved</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">
                            {netFreeBeds} Beds Available {wardHoldsCount > 0 && <span className="text-slate-400 text-[10px] font-normal">({baseCount} base)</span>}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => adjustWardBeds(w.code, -1)}
                          className="w-11 h-11 rounded-xl bg-[#182b52] hover:bg-slate-700 text-white font-black text-xl flex justify-center items-center transition-all duration-150 cursor-pointer active:scale-90 border border-slate-700"
                        >
                          <Minus className="w-5 h-5 stroke-[3]" />
                        </button>
                        <span className="w-8 text-center text-2xl font-black font-mono text-white">{netFreeBeds}</span>
                        <button
                          type="button"
                          onClick={() => adjustWardBeds(w.code, 1)}
                          className="w-11 h-11 rounded-xl liquid-btn-saffron text-white font-black text-xl flex justify-center items-center transition-all duration-150 cursor-pointer active:scale-90 shadow-md"
                        >
                          <Plus className="w-5 h-5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 🩸 BLOOD */}
        {/* ========================================================================= */}
        {activeTab === 'blood' && (
          <div className="liquid-glass-card rounded-[32px] p-6 border border-[#182b52] space-y-5 shadow-xl animate-in fade-in duration-300">
            <div className="flex items-center space-x-3 border-b border-[#182b52] pb-4">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
                <Droplet className="w-6 h-6 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h2 className="text-[#FF671F] font-black text-base">Blood Bank Inventory</h2>
                <p className="text-xs text-slate-400 font-medium">Increase or decrease PRBC units (Auto-synced on tap)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(bloodStock).map(([group, count]) => {
                const isUpdated = lastUpdatedKey === `Blood ${group}`;
                return (
                  <div
                    key={group}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex justify-between items-center ${
                      isUpdated
                        ? 'bg-rose-500/20 border-rose-500 scale-102 shadow-lg shadow-rose-500/20'
                        : 'bg-[#070e1e] border-[#182b52] hover:border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <span className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 font-black font-mono text-base flex justify-center items-center border border-rose-500/30 shadow-sm">
                        {group}
                      </span>
                      <div>
                        <span className="text-sm text-white font-black block">{group} PRBC Units</span>
                        <span className="text-[11px] text-emerald-400 font-bold">{count} Units Ready</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => adjustBloodGroup(group, -1)}
                        className="w-11 h-11 rounded-xl bg-[#182b52] hover:bg-slate-700 text-white font-black text-xl flex justify-center items-center transition-all duration-150 cursor-pointer active:scale-90 border border-slate-700"
                      >
                        <Minus className="w-5 h-5 stroke-[3]" />
                      </button>
                      <span className="w-8 text-center text-2xl font-black font-mono text-white">{count}</span>
                      <button
                        type="button"
                        onClick={() => adjustBloodGroup(group, 1)}
                        className="w-11 h-11 rounded-xl liquid-btn-saffron text-white font-black text-xl flex justify-center items-center transition-all duration-150 cursor-pointer active:scale-90 shadow-md"
                      >
                        <Plus className="w-5 h-5 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 📋 ADMITTED PATIENT LOG */}
        {/* ========================================================================= */}
        {activeTab === 'admitted' && (
          <div className="liquid-glass-card rounded-[32px] p-6 border border-[#182b52] space-y-4 shadow-xl animate-in fade-in duration-300">
            <h2 className="text-base font-black text-white">Admitted Emergency Patient Log</h2>
            {admittedList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#182b52] rounded-2xl text-slate-500 text-xs font-medium">
                No verified admissions logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#182b52]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070e1e] text-slate-400 border-b border-[#182b52] font-black uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Patient Name</th>
                      <th className="p-3.5">Symptom</th>
                      <th className="p-3.5">Occupied Ward</th>
                      <th className="p-3.5">Verified OTP</th>
                      <th className="p-3.5">Admitted At</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#182b52]">
                    {admittedList.map((pat) => (
                      <tr key={pat.id} className="hover:bg-[#182b52]/40 transition-colors">
                        <td className="p-3.5 font-bold text-white">{pat.patient_name}</td>
                        <td className="p-3.5 text-slate-300 font-medium">{pat.symptom}</td>
                        <td className="p-3.5 font-mono text-[#FF671F] font-bold">{pat.ward_label || pat.ward_code.toUpperCase()}</td>
                        <td className="p-3.5 font-mono text-emerald-400 font-bold">{pat.otp}</td>
                        <td className="p-3.5 text-slate-400 font-medium">{new Date(pat.admitted_at).toLocaleTimeString()}</td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`Discharge patient ${pat.patient_name} and restore 1 bed to ${pat.ward_label || pat.ward_code}?`)) {
                                const res = await dischargePatient(pat.id, pat.hospital_id, pat.ward_code);
                                setStatusMessage({ success: res.success, text: res.message });
                                loadDataFromCloudDb();
                              }
                            }}
                            className="px-3.5 py-2 bg-emerald-500/25 hover:bg-emerald-500 text-emerald-300 hover:text-white text-xs font-black rounded-xl border border-emerald-500/50 transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center space-x-2 ml-auto active:scale-95 uppercase tracking-wide"
                          >
                            <LogOut className="w-4 h-4 stroke-[2.5]" />
                            <span>DISCHARGE PATIENT (UNLOCK BED)</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ⏳ ACTIVE HOLDS */}
        {/* ========================================================================= */}
        {activeTab === 'holds' && (
          <div className="liquid-glass-card rounded-[32px] p-6 border border-[#182b52] space-y-4 shadow-xl animate-in fade-in duration-300">
            <h3 className="text-[#FF671F] font-black text-base flex justify-between items-center">
              <span>Active 15-Minute Bed Holds ({activeHoldsList.length})</span>
              <span className="text-xs text-slate-400 font-normal">Auto-synced from Website 1</span>
            </h3>

            {activeHoldsList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#182b52] rounded-2xl text-slate-500 text-xs font-medium">
                No active bed reservations pending at this station.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeHoldsList.map((hold) => (
                  <div key={hold.hold_id} className="bg-[#070e1e] p-4 rounded-2xl border border-[#182b52] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        {hold.patient_name}
                      </span>
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-300 font-mono font-bold text-xs rounded-xl border border-amber-500/30 flex items-center gap-1">
                        🔑 OTP: <strong className="text-amber-400 text-sm tracking-wider">{hold.otp}</strong>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Symptom: <strong className="text-slate-200">{hold.symptom}</strong> • Ward: <strong className="text-cyan-400">{hold.ward_code === 'general_oxygen' || hold.ward_code === 'general_ward' ? 'GENERAL WARD' : hold.ward_code.toUpperCase().replace('_', ' ')}</strong>
                    </p>
                    <div className="pt-2 border-t border-[#182b52] flex justify-end items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpInput(hold.otp);
                          const targetCode = hold.ward_code === 'general_oxygen' ? 'general_ward' : hold.ward_code;
                          setSelectedWardForAdmit(targetCode);
                          const el = document.getElementById('admin-otp-input');
                          if (el) el.focus();
                        }}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white text-xs font-bold rounded-xl border border-emerald-500/40 transition-colors cursor-pointer"
                      >
                        SELECT FOR ADMISSION
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const targetOtp = hold.otp;
                          const targetHoldId = hold.hold_id;
                          setActiveHoldsList((prev) => prev.filter((h) => h.otp !== targetOtp && h.hold_id !== targetHoldId));
                          await cancelBedHold(targetOtp || targetHoldId, hold.hospital_id);
                          loadDataFromCloudDb();
                          setStatusMessage({ success: true, text: `⚡ Hold released for patient ${hold.patient_name}. Bed returned to available pool!` });
                        }}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-bold rounded-xl border border-rose-500/40 transition-colors cursor-pointer"
                      >
                        RELEASE / CANCEL HOLD
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ⚙️ STATION SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'station' && (
          <div className="liquid-glass-card rounded-[32px] p-6 border border-[#182b52] space-y-4 shadow-xl animate-in fade-in duration-300">
            <h2 className="text-base font-black text-white">Hospital Station Details</h2>
            <div className="bg-[#070e1e] p-5 rounded-2xl border border-[#182b52] space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-[#182b52] pb-3">
                <span className="text-slate-400 font-medium">Station Name:</span>
                <span className="font-extrabold text-white">{activeHospMeta.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#182b52] pb-3">
                <span className="text-slate-400 font-medium">Station Code:</span>
                <span className="font-mono text-[#FF671F] font-black">{selectedCode}</span>
              </div>
              <div className="flex justify-between border-b border-[#182b52] pb-3">
                <span className="text-slate-400 font-medium">Total Physical Infrastructure:</span>
                <span className="font-bold text-white">30 Physical Furniture Beds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Emergency Hotline:</span>
                <span className="font-mono text-emerald-400 font-black">108 / 033-6605-7000</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 🛡️ PERSISTENT OTP VERIFICATION PANEL (RENDERED BELOW EVERY TAB) */}
        {/* ========================================================================= */}
        <div className="liquid-glass-card rounded-[32px] p-6 border-2 border-[#FF671F]/60 shadow-[0_20px_50px_rgba(255,103,31,0.15)] space-y-5 relative overflow-hidden">
          <div className="flex items-center space-x-3.5 border-b border-[#182b52] pb-4">
            <div className="p-3 bg-[#FF671F]/20 text-[#FF671F] rounded-2xl border border-[#FF671F]/30 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wide flex items-center space-x-2">
                <span>Patient Check-in & Bed Admission Terminal</span>
                <Sparkles className="w-4 h-4 text-[#FF671F]" />
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Enter patient 4-digit OTP and select which ward bed they are occupying upon arrival.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Step 1: 4-Digit OTP Input */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-widest mb-2">
                  1. Enter Patient Reservation OTP
                </label>
                <input
                  id="admin-otp-input"
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="e.g. 4892"
                  className="w-full bg-[#070e1e] border border-[#182b52] rounded-2xl px-4 py-3.5 text-3xl font-mono tracking-widest text-[#FF671F] font-black text-center focus:outline-none focus:border-[#FF671F] transition-colors shadow-inner"
                />
              </div>

              {/* Step 2: Select Ward to Occupy */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-widest mb-2">
                  2. Select Ward Bed to Occupy
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WARDS.map((w) => {
                    const isSelected = selectedWardForAdmit === w.code;
                    return (
                      <button
                        key={w.code}
                        type="button"
                        onClick={() => setSelectedWardForAdmit(w.code)}
                        className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center space-x-1.5 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-[#FF671F] text-white border-[#FF671F] shadow-lg shadow-[#FF671F]/30 scale-102'
                            : 'bg-[#070e1e] text-slate-300 border-[#182b52] hover:border-[#FF671F]/50 hover:text-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span className="truncate">{w.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 liquid-btn-saffron text-white font-black rounded-2xl text-sm shadow-xl flex justify-center items-center space-x-2 cursor-pointer active:scale-98 hover:brightness-110 tracking-wide"
            >
              <UserCheck className="w-5 h-5" />
              <span>VERIFY OTP & ADMIT PATIENT TO SELECTED WARD</span>
            </button>
          </form>
        </div>
      </main>

      {/* 🟢 PATIENT ADMISSION SUCCESS POPUP MODAL */}
      {admitSuccessModal && admitSuccessModal.show && (
        <div className="fixed inset-0 z-[9999] bg-[#040814]/90 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0b162c] border-2 border-emerald-500/50 rounded-[32px] p-6 text-center shadow-[0_0_90px_rgba(16,185,129,0.35)] relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 animate-bounce border-2 border-white/20">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <h3 className="text-2xl font-black text-white tracking-wide uppercase">
              PATIENT SUCCESSFULLY ADMITTED!
            </h3>
            <div className="inline-flex items-center space-x-1.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 px-3.5 py-1 rounded-full text-[11px] font-mono font-extrabold uppercase tracking-widest mt-2 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>BED RESERVED & HARD-LOCKED</span>
            </div>

            <div className="my-5 p-4 rounded-2xl bg-[#070e1e] border border-[#182b52] text-left space-y-2.5 shadow-inner">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Patient Name:</span>
                <span className="text-white font-black">{admitSuccessModal.patientName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Reservation OTP:</span>
                <span className="text-amber-400 font-mono font-black text-sm">{admitSuccessModal.otp}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Assigned Ward:</span>
                <span className="text-emerald-400 font-black uppercase text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                  {admitSuccessModal.wardLabel}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-[#182b52]">
                <span className="text-slate-400 font-medium">Hospital Station:</span>
                <span className="text-slate-200 font-bold">{admitSuccessModal.hospitalName}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-5">
              ⚡ Patient check-in logged. The bed is now marked as occupied and live-synced to Website 1.
            </p>

            <button
              type="button"
              onClick={() => setAdmitSuccessModal(null)}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-emerald-500/30 cursor-pointer active:scale-95 transition-all duration-200"
            >
              CONFIRM & CLOSE ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
