import React from 'react';
import { AITriageResult, Hospital } from '../types';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  Navigation,
  ChevronRight,
  X,
  Stethoscope,
  Clock,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';

interface AITriageSolutionCardProps {
  result: AITriageResult | null;
  isLoading?: boolean;
  onClose: () => void;
  onOpenFullProtocol: () => void;
  nearestGovtHospital: Hospital | null;
  nearestGeneralHospital: Hospital | null;
  onSelectHospital: (hospital: Hospital) => void;
}

export const AITriageSolutionCard: React.FC<AITriageSolutionCardProps> = ({
  result,
  isLoading,
  onClose,
  onOpenFullProtocol,
  nearestGovtHospital,
  nearestGeneralHospital,
  onSelectHospital,
}) => {
  if (!result && !isLoading) return null;

  const severityColor =
    result?.severity === 'RED'
      ? 'border-[#ff334b] bg-red-500/10 text-red-600 dark:text-red-400'
      : result?.severity === 'YELLOW'
      ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
      : 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';

  const severityBadgeBg =
    result?.severity === 'RED'
      ? 'bg-[#ff334b] text-white'
      : result?.severity === 'YELLOW'
      ? 'bg-amber-500 text-black'
      : 'bg-emerald-600 text-white';

  return (
    <div
      id="ai-triage-solution-card"
      className="w-full max-w-2xl mx-auto mb-3 liquid-glass rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-3 duration-250 transition-colors border border-white/60 dark:border-white/15"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 liquid-glass-card border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-xl liquid-btn-saffron text-white shadow-sm flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black tracking-wider uppercase text-[#FF671F]">
                AI Clinical Triage & Solution
              </span>
              {result?.detected_language && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full liquid-glass-pill text-orange-800 dark:text-orange-300">
                  {result.detected_language}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {result && (
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${severityBadgeBg}`}>
              {result.severity} • {result.esi_level.split(' ')[0]}
            </span>
          )}
          <button
            id="close-ai-triage-solution-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl liquid-glass-pill text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            title="Dismiss AI Triage"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[#FF671F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Analyzing symptoms with Multilingual Medical AI...
          </p>
        </div>
      ) : result ? (
        <div className="p-4 space-y-3.5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Detected Problem Overview */}
          <div className="liquid-glass-card p-3.5 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white mb-1">
              <Stethoscope className="w-4 h-4 text-[#FF671F]" />
              <span className="text-sm font-extrabold text-[#FF671F]">
                {result.detected_symptom}
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {result.problem_overview}
            </p>

            {/* Differential diagnoses pills */}
            {result.possible_conditions && result.possible_conditions.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/10">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Possible Conditions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.possible_conditions.map((cond, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold liquid-glass-pill text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-xl"
                    >
                      {cond}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Urgent Golden Window Warning */}
          {result.urgency_note && (
            <div className="liquid-glass-card border-red-400/40 p-3 rounded-2xl flex items-start gap-2.5 text-red-800 dark:text-red-300">
              <Clock className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-relaxed">{result.urgency_note}</p>
            </div>
          )}

          {/* Life-Saving Immediate Solution Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#16A34A] dark:text-emerald-400">
                  Immediate Solution & What To Do RIGHT NOW:
                </h4>
              </div>
              <button
                id="btn-open-full-protocol-from-card"
                type="button"
                onClick={onOpenFullProtocol}
                className="text-[11px] font-black text-[#FF671F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Full Clinical Protocol
              </button>
            </div>

            <div className="space-y-2">
              {result.immediate_solution.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 liquid-glass-card border-emerald-400/30 p-3 rounded-2xl text-xs sm:text-[13px] text-slate-800 dark:text-slate-200"
                >
                  <span className="w-5 h-5 rounded-full liquid-btn-green text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    {idx + 1}
                  </span>
                  <span className="font-medium leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What NOT to Do Warnings */}
          {result.what_not_to_do && result.what_not_to_do.length > 0 && (
            <div className="liquid-glass-card border-red-400/40 p-3 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs font-black text-red-700 dark:text-red-400 mb-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                <span>WHAT NOT TO DO:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-red-700 dark:text-red-300 font-medium">
                {result.what_not_to_do.map((mistake, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Direct Routing Buttons: Govt vs Private */}
          <div className="pt-2 border-t border-black/5 dark:border-white/10">
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">
              <span>ROUTE TO NEAREST EQUIPPED HOSPITAL:</span>
              <span className="text-[#FF671F]">
                Ward: {result.recommended_ward.toUpperCase().replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {nearestGovtHospital && (
                <button
                  id="btn-route-govt-from-ai-card"
                  type="button"
                  onClick={() => onSelectHospital(nearestGovtHospital)}
                  className="flex flex-col text-left p-3 rounded-2xl liquid-glass-card border-2 border-[#FF671F] hover:bg-orange-50/50 dark:hover:bg-orange-950/40 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#FF671F] flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> GOVT HOSPITAL
                    </span>
                    <span className="text-[10px] font-black text-[#FF671F]">
                      {nearestGovtHospital.eta_minutes}m
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {nearestGovtHospital.short_name || nearestGovtHospital.name}
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                    <span>{nearestGovtHospital.distance_km} km away</span>
                    <span className="text-[#FF671F] font-black flex items-center">
                      CHOOSE <ChevronRight className="w-2.5 h-2.5" />
                    </span>
                  </span>
                </button>
              )}

              {nearestGeneralHospital && (
                <button
                  id="btn-route-private-from-ai-card"
                  type="button"
                  onClick={() => onSelectHospital(nearestGeneralHospital)}
                  className="flex flex-col text-left p-3 rounded-2xl liquid-glass-card border-2 border-[#16A34A] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#16A34A] flex items-center gap-1">
                      <Navigation className="w-3 h-3" /> PRIVATE HOSPITAL
                    </span>
                    <span className="text-[10px] font-black text-[#16A34A]">
                      {nearestGeneralHospital.eta_minutes}m
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {nearestGeneralHospital.short_name || nearestGeneralHospital.name}
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                    <span>{nearestGeneralHospital.distance_km} km away</span>
                    <span className="text-[#16A34A] font-black flex items-center">
                      CHOOSE <ChevronRight className="w-2.5 h-2.5" />
                    </span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
