import React, { useState, useEffect } from 'react';
import { Hospital } from '../types';
import { INITIAL_HOSPITALS } from '../data/hospitals';
import {
  getStoredOverrides,
  saveStoredOverrides,
  verifyAndAdmitOTP,
  getActiveHolds,
  getAdmittedPatients,
  broadcastSyncEvent,
  ActiveHold,
  AdmittedPatient,
} from '../utils/syncEngine';
import {
  Building2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Activity,
  Droplet,
  Users,
  BedDouble,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface HospitalAdminPortalProps {
  onReturnToCitizenApp?: () => void;
}

export const HOSPITAL_CREDENTIALS = [
  { code: 'ILS-02', id: 'hosp-ils-nagerbazar', name: 'ILS Hospitals, Dum Dum', pass: 'admin123' },
  { code: 'TMC-01', id: 'hosp-tmc-newtown', name: 'Tata Medical Center, New Town', pass: 'admin123' },
  { code: 'CHRN-03', id: 'hosp-charnock-vip', name: 'Charnock Hospital, VIP Road', pass: 'admin123' },
  { code: 'OHIO-04', id: 'hosp-ohio-newtown', name: 'Ohio Hospital, New Town', pass: 'admin123' },
  { code: 'HCG-05', id: 'hosp-hcg-newtown', name: 'HCG EKO Cancer Centre', pass: 'admin123' },
  { code: 'DDM-06', id: 'hosp-dumdum-municipal', name: 'Dum Dum Municipal Hospital', pass: 'admin123' },
  { code: 'NCB-07', id: 'hosp-north-city-neuro', name: 'North City Hospital & Neuro Institute, Baguiati', pass: 'admin123' },
  { code: 'NEO-08', id: 'hosp-neotia-newtown', name: 'Bhagirathi Neotia Woman & Child Care, New Town', pass: 'admin123' },
  { code: 'CNCI-09', id: 'hosp-cnci-newtown', name: 'Chittaranjan National Cancer Institute (CNCI), New Town', pass: 'admin123' },
  { code: 'APO-10', id: 'hosp-apollo-gleneagles', name: 'Apollo Multispeciality Hospitals', pass: 'admin123' },
  { code: 'GLC-11', id: 'hosp-glocal-newtown', name: 'Glocal Hospital, New Town (Action Area II)', pass: 'admin123' },
  { code: 'DAMA-12', id: 'hosp-techno-dama', name: 'Techno India DAMA Hospital, New Town / Salt Lake', pass: 'admin123' },
  { code: 'MANI-13', id: 'hosp-columbia-manipal', name: 'Manipal Hospital (Columbia Asia), Salt Lake / New Town', pass: 'admin123' },
];

export const HospitalAdminPortal: React.FC<HospitalAdminPortalProps> = ({ onReturnToCitizenApp }) => {
  // Login State
  const [selectedCode, setSelectedCode] = useState('TMC-01');
  const [password, setPassword] = useState('admin123');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active Selected Hospital
  const activeHospMeta = HOSPITAL_CREDENTIALS.find((c) => c.code === selectedCode) || HOSPITAL_CREDENTIALS[0];
  const initialHospData = INITIAL_HOSPITALS.find((h) => h.id === activeHospMeta.id) || INITIAL_HOSPITALS[0];

  // Active Tab: 'inventory' | 'otp' | 'patients'
  const [activeTab, setActiveTab] = useState<'inventory' | 'otp' | 'patients'>('inventory');

  // Live Inventory State
  const [physicalBeds, setPhysicalBeds] = useState(26);
  const [occupiedBeds, setOccupiedBeds] = useState(16);
  const [staffCount, setStaffCount] = useState(44); // 44 staff = 22 staffed beds (1:2 ratio)
  const [bloodStock, setBloodStock] = useState<Record<string, number>>({
    'O-': 6,
    'O+': 14,
    'A+': 12,
    'B+': 18,
    'AB+': 5,
  });

  // OTP Terminal State
  const [otpInput, setOtpInput] = useState('');
  const [otpResult, setOtpResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeHoldsList, setActiveHoldsList] = useState<ActiveHold[]>([]);
  const [admittedList, setAdmittedList] = useState<AdmittedPatient[]>([]);

  // Load existing overrides on login/hospital change
  useEffect(() => {
    if (!isLoggedIn) return;

    const overrides = getStoredOverrides();
    const existing = overrides[activeHospMeta.id];

    if (existing) {
      if (existing.total_physical_beds !== undefined) setPhysicalBeds(existing.total_physical_beds);
      if (existing.occupied_beds !== undefined) setOccupiedBeds(existing.occupied_beds);
      if (existing.staff_count !== undefined) setStaffCount(existing.staff_count);
      if (existing.blood_stock) setBloodStock((prev) => ({ ...prev, ...existing.blood_stock }));
    } else {
      const mainWard = initialHospData.wards?.[0];
      if (mainWard) {
        setPhysicalBeds(mainWard.total_physical);
        setOccupiedBeds(mainWard.occupied);
        setStaffCount(mainWard.total_staffed * 2);
      }
      if (initialHospData.blood_inventory) {
        setBloodStock(initialHospData.blood_inventory);
      }
    }

    refreshHoldsAndPatients();
  }, [isLoggedIn, selectedCode]);

  const refreshHoldsAndPatients = () => {
    const holds = getActiveHolds().filter((h) => h.hospital_id === activeHospMeta.id);
    setActiveHoldsList(holds);

    const admitted = getAdmittedPatients().filter((a) => a.hospital_id === activeHospMeta.id);
    setAdmittedList(admitted);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const match = HOSPITAL_CREDENTIALS.find((c) => c.code === selectedCode);
    if (match && password === match.pass) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Password! Default password is "admin123".');
    }
  };

  // Formula Calculations
  const nurseRatio = 2; // 1 nurse per 2 ICU beds
  const staffedBeds = Math.min(physicalBeds, Math.max(0, Math.floor(staffCount / nurseRatio)));
  const ghostBeds = Math.max(0, physicalBeds - staffedBeds);
  const activeHoldsCount = activeHoldsList.filter((h) => h.status === 'ACTIVE').length;
  const availableBeds = Math.max(0, staffedBeds - occupiedBeds - activeHoldsCount);

  // Save changes to localStorage & trigger Live Sync
  const handleSaveInventory = () => {
    const overrides = getStoredOverrides();
    overrides[activeHospMeta.id] = {
      id: activeHospMeta.id,
      total_physical_beds: physicalBeds,
      occupied_beds: occupiedBeds,
      staff_count: staffCount,
      blood_stock: bloodStock,
    };
    saveStoredOverrides(overrides);

    broadcastSyncEvent({
      type: 'HOSPITAL_UPDATE',
      hospitalId: activeHospMeta.id,
      timestamp: Date.now(),
      message: `Updated inventory for ${activeHospMeta.name}`,
    });

    setOtpResult({
      success: true,
      message: `⚡ Live Database Updated! ${activeHospMeta.name} changes synced instantly to Citizen App.`,
    });
  };

  const handleAdjustBlood = (group: string, delta: number) => {
    const newStock = {
      ...bloodStock,
      [group]: Math.max(0, (bloodStock[group] || 0) + delta),
    };
    setBloodStock(newStock);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const res = verifyAndAdmitOTP(otpInput, activeHospMeta.id);
    setOtpResult(res);
    if (res.success) {
      setOtpInput('');
      setOccupiedBeds((prev) => prev + 1);
      refreshHoldsAndPatients();
    }
  };

  // ----------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">PulseGrid ER Desk</h1>
              <p className="text-xs text-slate-400">Hospital Admin Portal • Live Database Sync</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Select Hospital Station Code
              </label>
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {HOSPITAL_CREDENTIALS.map((cred) => (
                  <option key={cred.code} value={cred.code}>
                    {cred.code} — {cred.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Station Access Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter hospital password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Default password for all hospitals: <code className="text-cyan-400">admin123</code>
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-cyan-500/25 flex justify-center items-center space-x-2"
            >
              <span>Access ER Command Desk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {onReturnToCitizenApp && (
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <button
                onClick={onReturnToCitizenApp}
                className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex justify-center items-center space-x-1.5 mx-auto"
              >
                <span>Switch to Citizen Mobile Web App 🚑</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN HOSPITAL ADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-white tracking-tight">{activeHospMeta.name}</h1>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {selectedCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Database Sync Active • Kolkata ER Network</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 self-end sm:self-auto">
            {onReturnToCitizenApp && (
              <button
                onClick={onReturnToCitizenApp}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 text-cyan-300 transition-colors flex items-center space-x-1.5"
              >
                <span>Citizen App 🚑</span>
              </button>
            )}
            <button
              onClick={() => setIsLoggedIn(false)}
              className="p-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Sync Result Banner */}
        {otpResult && (
          <div
            className={`p-4 rounded-2xl border flex items-start justify-between space-x-3 text-sm transition-all ${
              otpResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {otpResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>{otpResult.message}</span>
            </div>
            <button onClick={() => setOtpResult(null)} className="text-xs opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'inventory'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>1. Ward Beds & Blood Stock</span>
          </button>
          <button
            onClick={() => setActiveTab('otp')}
            className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'otp'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>2. OTP Check-in Terminal ({activeHoldsCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'patients'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>3. Admitted Patient Log ({admittedList.length})</span>
          </button>
        </div>

        {/* TAB 1: INVENTORY & GHOST BEDS */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Metrics Summary */}
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400 font-medium">Physical Infrastructure Beds</span>
                <p className="text-2xl font-bold text-white mt-1">{physicalBeds}</p>
                <span className="text-[11px] text-slate-500">Total hospital capacity</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400 font-medium">Staffed Beds (1:2 Nurse Ratio)</span>
                <p className="text-2xl font-bold text-cyan-400 mt-1">{staffedBeds}</p>
                <span className="text-[11px] text-slate-500">Based on {staffCount} active staff</span>
              </div>
              <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4">
                <span className="text-xs text-amber-400 font-medium flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Ghost Bed Gap</span>
                </span>
                <p className="text-2xl font-bold text-amber-400 mt-1">{ghostBeds}</p>
                <span className="text-[11px] text-slate-500">Unstaffed beds (Filtered out)</span>
              </div>
              <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4">
                <span className="text-xs text-emerald-400 font-medium">Net Live Available Beds</span>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">{availableBeds}</p>
                <span className="text-[11px] text-slate-500">Visible to citizen triage</span>
              </div>
            </div>

            {/* Ward Bed Controls */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <span>Real-time Bed & Staff Ratio Controls</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modifying these values instantly recalculates ghost beds and updates the citizen app live.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-300">Total Physical Beds ({physicalBeds})</span>
                    <span className="text-slate-500">Physical furniture</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={physicalBeds}
                    onChange={(e) => setPhysicalBeds(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-950 rounded-lg cursor-pointer h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-300">Occupied Beds ({occupiedBeds})</span>
                    <span className="text-slate-500">Patients currently in bed</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={physicalBeds}
                    value={occupiedBeds}
                    onChange={(e) => setOccupiedBeds(Number(e.target.value))}
                    className="w-full accent-blue-500 bg-slate-950 rounded-lg cursor-pointer h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-300">Active Duty Nurses & Paramedics ({staffCount})</span>
                    <span className="text-cyan-400 font-mono">1 Nurse per 2 Beds</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="120"
                    value={staffCount}
                    onChange={(e) => setStaffCount(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-950 rounded-lg cursor-pointer h-2"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <div className="text-xs text-slate-400 space-y-1">
                  <p>
                    <strong className="text-slate-200">Ghost Bed Formula:</strong> Physical ({physicalBeds}) - Staffed ({staffedBeds}) = <span className="text-amber-400 font-bold">{ghostBeds} Ghost Beds</span>
                  </p>
                  <p>
                    <strong className="text-slate-200">Net Citizen Availability:</strong> Staffed ({staffedBeds}) - Occupied ({occupiedBeds}) - Holds ({activeHoldsCount}) = <span className="text-emerald-400 font-bold">{availableBeds} Free</span>
                  </p>
                </div>
                <button
                  onClick={handleSaveInventory}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sync Live to Database</span>
                </button>
              </div>
            </div>

            {/* Blood Stock Controls */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Droplet className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-bold text-white">Live Blood Inventory</h3>
              </div>

              <div className="space-y-3">
                {Object.entries(bloodStock).map(([group, count]) => (
                  <div key={group} className="flex justify-between items-center bg-slate-950/80 p-3 rounded-xl border border-slate-850">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 font-bold font-mono text-xs flex justify-center items-center border border-rose-500/30">
                        {group}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">PRBC Units</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAdjustBlood(group, -1)}
                        className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-mono font-bold text-white">{count}</span>
                      <button
                        onClick={() => handleAdjustBlood(group, 1)}
                        className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveInventory}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex justify-center items-center space-x-2 border border-slate-700"
              >
                <span>Save & Sync Blood Stock</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: OTP CHECK-IN TERMINAL */}
        {activeTab === 'otp' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OTP Form */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Patient Arrival OTP Verification</h2>
                  <p className="text-xs text-slate-400">Validate 4-digit bed hold code generated on citizen app</p>
                </div>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Enter 4-Digit Reservation OTP
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="e.g. 4892"
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-2xl font-mono tracking-widest text-cyan-400 font-bold text-center focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex justify-center items-center space-x-2"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>Verify OTP & Admit Patient</span>
                </button>
              </form>
            </div>

            {/* Pending Holds List */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex justify-between items-center">
                <span>Active 15-Minute Holds ({activeHoldsList.length})</span>
                <span className="text-xs text-cyan-400 font-normal">Auto-reverts on expiry</span>
              </h3>

              {activeHoldsList.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                  No active bed reservations pending at this hospital station.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {activeHoldsList.map((hold) => (
                    <div key={hold.hold_id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">{hold.patient_name}</span>
                        <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs rounded-lg border border-cyan-500/30">
                          OTP: {hold.otp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Symptom: <strong className="text-slate-200">{hold.symptom}</strong> • Ward: <strong className="text-cyan-400">{hold.ward_code.toUpperCase()}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ADMITTED LOG */}
        {activeTab === 'patients' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Admitted Emergency Patients</h2>
            {admittedList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                No verified admissions logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Patient Name</th>
                      <th className="p-3">Symptom</th>
                      <th className="p-3">Ward</th>
                      <th className="p-3">Verified OTP</th>
                      <th className="p-3">Admitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {admittedList.map((pat) => (
                      <tr key={pat.id} className="hover:bg-slate-850">
                        <td className="p-3 font-semibold text-white">{pat.patient_name}</td>
                        <td className="p-3 text-slate-300">{pat.symptom}</td>
                        <td className="p-3 font-mono text-cyan-400">{pat.ward_code.toUpperCase()}</td>
                        <td className="p-3 font-mono text-emerald-400">{pat.otp}</td>
                        <td className="p-3 text-slate-400">{new Date(pat.admitted_at).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
