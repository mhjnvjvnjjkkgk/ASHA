import React, { useState } from 'react';
import { DetailedSymptom, Hospital } from '../types';
import {
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Activity,
  ShieldAlert,
  Building2,
  Navigation,
  ChevronRight,
  Info,
  HeartPulse,
  Share2,
  Check,
} from 'lucide-react';

interface SymptomDetailModalProps {
  symptom: DetailedSymptom | null;
  isOpen: boolean;
  onClose: () => void;
  nearestGovtHospital: Hospital | null;
  nearestGeneralHospital: Hospital | null;
  onSelectHospital: (hospital: Hospital) => void;
}

export const SymptomDetailModal: React.FC<SymptomDetailModalProps> = ({
  symptom,
  isOpen,
  onClose,
  nearestGovtHospital,
  nearestGeneralHospital,
  onSelectHospital,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !symptom) return null;

  const severityColor =
    symptom.severity === 'RED'
      ? 'text-[#ff334b] border-[#ff334b]/40 bg-[#ff334b]/15'
      : symptom.severity === 'YELLOW'
      ? 'text-amber-400 border-amber-500/40 bg-amber-500/15'
      : 'text-emerald-400 border-emerald-500/40 bg-emerald-500/15';

  const severityDot =
    symptom.severity === 'RED'
      ? 'bg-[#ff334b]'
      : symptom.severity === 'YELLOW'
      ? 'bg-amber-400'
      : 'bg-emerald-400';

  const handleShareOrCopy = () => {
    const textToCopy = `[EMERGENCY PROTOCOL: ${symptom.name}]\nSeverity: ${symptom.severity} (${symptom.esi_level})\nOverview: ${symptom.problem_overview}\nUrgency: ${symptom.urgency_note}\nWhat to do:\n${symptom.immediate_actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="symptom-detail-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200 pointer-events-auto"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] liquid-glass sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col text-slate-900 dark:text-white overflow-hidden border border-white/60 dark:border-white/12">
        {/* Subtle Top Tiranga Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] tiranga-stripe z-10" />

        {/* Sticky Header */}
        <div className="flex items-center justify-between px-5 py-3.5 liquid-glass-card border-b border-black/5 dark:border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full ${severityDot} animate-pulse flex-shrink-0`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${severityColor}`}>
                  {symptom.severity} • {symptom.esi_level.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold truncate hidden xs:inline">
                  {symptom.category}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="copy-symptom-guidelines-btn"
              type="button"
              onClick={handleShareOrCopy}
              title="Copy instructions to clipboard"
              className="p-2 rounded-xl liquid-glass-pill text-slate-600 dark:text-slate-200 transition-all cursor-pointer text-xs flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#138808]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-bold hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
            </button>
            <button
              id="close-symptom-detail-modal-btn"
              type="button"
              onClick={onClose}
              title="Close Symptom Details"
              className="p-2 rounded-xl liquid-glass-pill text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Clinical Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-left custom-scrollbar divide-y divide-black/5 dark:divide-white/5">
          {/* Main Title & Key Target Ward */}
          <div className="pt-1">
            <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
              {symptom.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-[#FF671F] font-bold liquid-glass-pill px-2.5 py-1 rounded-xl border border-[#FF671F]/30">
                <HeartPulse className="w-3.5 h-3.5" />
                Target Ward: {symptom.target_ward.toUpperCase().replace('_', ' ')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 liquid-glass-pill px-2.5 py-1 rounded-xl">
                Category: {symptom.category}
              </span>
            </div>
          </div>

          {/* Section 1: What Kind of Problem Are We Facing? */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-[#FF671F]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#FF671F]">
                1. What Kind of Problem Are We Facing? (Overview)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed liquid-glass-card p-3.5 rounded-2xl">
              {symptom.problem_overview}
            </p>
          </div>

          {/* Section 2: Possible Conditions & Differential Diagnoses */}
          {symptom.possible_conditions && symptom.possible_conditions.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-[#FF671F]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#FF671F]">
                  2. Possible Conditions & Differential Diagnoses
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {symptom.possible_conditions.map((cond, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 liquid-glass-card p-3 rounded-2xl text-xs text-slate-700 dark:text-slate-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF671F] mt-1.5 flex-shrink-0" />
                    <span>{cond}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Urgency Note & Golden Hour Windows */}
          {symptom.urgency_note && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-red-600">
                  3. Critical Urgency & Golden Hour Window
                </h3>
              </div>
              <div className="liquid-glass-card border-red-400/40 p-3.5 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {symptom.urgency_note}
                </p>
              </div>
            </div>
          )}

          {/* Section 4: What to Check (Detailed Assessment Checklist) */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-[#FF671F]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#FF671F]">
                4. What to Check (Clinical Assessment)
              </h3>
            </div>

            <div className="space-y-3">
              {/* Vitals */}
              {symptom.what_to_check.vitals && symptom.what_to_check.vitals.length > 0 && (
                <div className="liquid-glass-card p-3.5 rounded-2xl">
                  <span className="block text-[10px] font-black uppercase text-[#FF671F] tracking-wider mb-1.5">
                    VITALS TO MONITOR IMMEDIATELY:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {symptom.what_to_check.vitals.map((v, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF671F] mt-1.5 flex-shrink-0" />
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Red Flags */}
              {symptom.what_to_check.red_flags && symptom.what_to_check.red_flags.length > 0 && (
                <div className="liquid-glass-card border-red-400/40 p-3.5 rounded-2xl">
                  <span className="block text-[10px] font-black uppercase text-red-600 dark:text-red-400 tracking-wider mb-1.5 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-600 dark:text-red-400" />
                    RED FLAG DANGER SIGNS:
                  </span>
                  <ul className="space-y-1.5 text-xs text-red-700 dark:text-red-300">
                    {symptom.what_to_check.red_flags.map((rf, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                        <span className="font-medium">{rf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Physical Signs */}
              {symptom.what_to_check.physical_signs && symptom.what_to_check.physical_signs.length > 0 && (
                <div className="liquid-glass-card p-3.5 rounded-2xl">
                  <span className="block text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider mb-1.5">
                    KEY PHYSICAL SIGNS TO OBSERVE:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {symptom.what_to_check.physical_signs.map((ps, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#138808] mt-1.5 flex-shrink-0" />
                        <span>{ps}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: How to Help & What to Do (Immediate Step-by-Step Actions) */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#138808]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#138808]">
                5. How to Help: Step-by-Step Immediate Actions
              </h3>
            </div>
            <div className="space-y-2">
              {symptom.immediate_actions.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 liquid-glass-card border-emerald-400/30 p-3 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-200"
                >
                  <span className="w-5 h-5 rounded-full liquid-btn-green text-white font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: What NOT to Do (Dangerous Mistakes & Contraindications) */}
          {symptom.what_not_to_do && symptom.what_not_to_do.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-red-600">
                  6. What NOT to Do (Contraindications & Dangerous Mistakes)
                </h3>
              </div>
              <div className="space-y-2">
                {symptom.what_not_to_do.map((wnt, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 liquid-glass-card border-red-400/40 p-3 rounded-2xl text-xs sm:text-sm text-red-700 dark:text-red-300"
                  >
                    <span className="text-red-600 font-black text-sm flex-shrink-0 leading-none mt-0.5">
                      ⚠️
                    </span>
                    <span className="leading-relaxed">{wnt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 7: Home Care & Pre-Hospital Triage */}
          {symptom.home_care_or_triage && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-[#FF671F]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#FF671F]">
                  7. Pre-Hospital / Home Triage Guidance
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed liquid-glass-card p-3.5 rounded-2xl">
                {symptom.home_care_or_triage}
              </p>
            </div>
          )}

          {/* Section 8: Hospital Prep & ER Workflow */}
          {symptom.hospital_prep && (
            <div className="pt-4 pb-2">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-[#FF671F]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#FF671F]">
                  8. Emergency Room Readiness & Hospital Protocol
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed liquid-glass-card p-3.5 rounded-2xl">
                {symptom.hospital_prep}
              </p>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Strip (Direct Route to Hospitals) */}
        <div className="p-3.5 liquid-glass border-t border-black/5 dark:border-white/10 flex-shrink-0">
          <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>ROUTE PATIENT IMMEDIATELY:</span>
            <span className="text-[#138808] dark:text-emerald-400">2 Options (Govt & Private)</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Government Hospital */}
            {nearestGovtHospital && (
              <button
                id="btn-route-govt-from-symptom-detail"
                type="button"
                onClick={() => {
                  onSelectHospital(nearestGovtHospital);
                  onClose();
                }}
                className="flex flex-col text-left p-3 rounded-2xl liquid-glass-card border-2 border-[#FF671F] hover:bg-orange-50/50 dark:hover:bg-orange-950/40 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1 text-[#FF671F]">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      GOVT HOSPITAL
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-[#FF671F]">
                    {nearestGovtHospital.eta_minutes}m
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#FF671F]">
                  {nearestGovtHospital.short_name || nearestGovtHospital.name}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center justify-between">
                  <span>{nearestGovtHospital.distance_km} km away</span>
                  <span className="text-[#FF671F] font-black flex items-center">
                    SELECT <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </span>
              </button>
            )}

            {/* Private Hospital */}
            {nearestGeneralHospital && (
              <button
                id="btn-route-general-from-symptom-detail"
                type="button"
                onClick={() => {
                  onSelectHospital(nearestGeneralHospital);
                  onClose();
                }}
                className="flex flex-col text-left p-3 rounded-2xl liquid-glass-card border-2 border-[#16A34A] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1 text-[#16A34A]">
                    <Navigation className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      PRIVATE HOSPITAL
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-[#16A34A]">
                    {nearestGeneralHospital.eta_minutes}m
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#16A34A]">
                  {nearestGeneralHospital.short_name || nearestGeneralHospital.name}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center justify-between">
                  <span>{nearestGeneralHospital.distance_km} km away</span>
                  <span className="text-[#16A34A] font-black flex items-center">
                    SELECT <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
