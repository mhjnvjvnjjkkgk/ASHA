import React from 'react';
import { Hospital, DetailedSymptom } from '../types';
import { Building2, Navigation, X, Check, ArrowRight, Zap, BookOpen } from 'lucide-react';

interface SymptomTriageMenuProps {
  isOpen: boolean;
  onClose: () => void;
  symptomQuery: string;
  nearestGovtHospital: Hospital | null;
  nearestGeneralHospital: Hospital | null;
  selectedHospitalId?: string | null;
  onSelectHospital: (hospital: Hospital) => void;
  onConfirmAndOpenDrawer: (hospital: Hospital) => void;
  matchedSymptom?: DetailedSymptom | null;
  onOpenSymptomDetail?: () => void;
  translatedSummary?: string | null;
  detectedLanguage?: string | null;
}

export const SymptomTriageMenu: React.FC<SymptomTriageMenuProps> = ({
  isOpen,
  onClose,
  symptomQuery,
  nearestGovtHospital,
  nearestGeneralHospital,
  selectedHospitalId,
  onSelectHospital,
  onConfirmAndOpenDrawer,
  matchedSymptom,
  onOpenSymptomDetail,
  translatedSummary,
  detectedLanguage,
}) => {
  if (!isOpen) return null;

  // Determine which hospital has the absolute lowest ETA / distance
  const isGovtNearestOverall =
    nearestGovtHospital &&
    nearestGeneralHospital &&
    nearestGovtHospital.distance_km <= nearestGeneralHospital.distance_km;
  const isPrivateNearestOverall =
    nearestGovtHospital &&
    nearestGeneralHospital &&
    nearestGeneralHospital.distance_km < nearestGovtHospital.distance_km;

  const renderHospitalCard = (
    hospital: Hospital | null,
    category: 'govt' | 'private'
  ) => {
    if (!hospital) return null;

    const isSelected = selectedHospitalId === hospital.id;
    const availableBeds = hospital.wards.reduce((sum, w) => sum + (w.available_now || 0), 0);

    const isGovt = category === 'govt' || hospital.is_govt;
    const isOverallNearest = isGovt ? isGovtNearestOverall : isPrivateNearestOverall;

    return (
      <div
        id={isGovt ? 'option-government-hospital' : 'option-private-hospital'}
        key={hospital.id}
        onClick={() => {
          onSelectHospital(hospital);
        }}
        className={`relative flex flex-col justify-between p-3 rounded-2xl cursor-pointer transition-all duration-300 select-none text-left min-h-[150px] liquid-glass-card ${
          isSelected
            ? isGovt
              ? 'border-2 border-[#FF671F] shadow-[0_12px_36px_rgba(255,103,31,0.3)] ring-2 ring-[#FF671F]/30 scale-[1.02]'
              : 'border-2 border-[#16A34A] shadow-[0_12px_36px_rgba(22,163,74,0.3)] ring-2 ring-[#16A34A]/30 scale-[1.02]'
            : 'border border-white/60 dark:border-white/10 hover:border-slate-400/50 hover:shadow-lg'
        }`}
      >
        {/* Active Selected Corner Checkmark */}
        {isSelected && (
          <span
            className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center font-black shadow-md text-white z-10 animate-in zoom-in-50 duration-200 ${
              isGovt ? 'liquid-btn-saffron' : 'liquid-btn-green'
            }`}
          >
            <Check className="w-3 h-3 stroke-[3]" />
          </span>
        )}

        {/* Top Header Row: Explicit GOVT vs PRIVATE Badge & ETA/Distance */}
        <div>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center gap-1 min-w-0">
              {isGovt ? (
                <Building2 className="w-3.5 h-3.5 text-[#FF671F] flex-shrink-0" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-[#16A34A] flex-shrink-0" />
              )}
              <span
                className={`text-[10px] font-black tracking-wider uppercase truncate ${
                  isGovt ? 'text-[#FF671F]' : 'text-[#16A34A]'
                }`}
              >
                {isGovt ? 'GOVT HOSPITAL' : 'PRIVATE'}
              </span>
              {isOverallNearest && (
                <span className="text-[8px] font-black uppercase px-1 py-0.5 rounded-md liquid-glass-pill text-slate-800 dark:text-slate-200 flex-shrink-0">
                  FASTEST
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 liquid-glass-pill px-1.5 py-0.5 rounded-lg flex-shrink-0">
              <Zap className={`w-2.5 h-2.5 fill-current ${isGovt ? 'text-[#FF671F]' : 'text-[#16A34A]'}`} />
              <span className={`text-[10px] font-black ${isGovt ? 'text-[#FF671F]' : 'text-[#16A34A]'}`}>
                {hospital.eta_minutes}m
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400">
                ({hospital.distance_km}km)
              </span>
            </div>
          </div>

          {/* Hospital Name */}
          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate leading-tight">
            {hospital.short_name || hospital.name}
          </h4>

          {/* Type Badge & Beds Available */}
          <div className="flex items-center justify-between gap-1 mt-1.5">
            <span
              className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                isGovt
                  ? 'text-[#FF671F] border-[#FF671F]/30 bg-orange-50/60 dark:bg-orange-950/40'
                  : 'text-[#16A34A] border-[#16A34A]/30 bg-emerald-50/60 dark:bg-emerald-950/40'
              }`}
            >
              {isGovt ? 'Govt / Free' : 'Private ER'}
            </span>

            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-600 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              <span className="font-bold">
                <strong className="text-slate-900 dark:text-white font-black">{availableBeds}</strong> beds
              </span>
            </div>
          </div>
        </div>

        {/* Prominent Liquid Glass Choose Button */}
        <button
          id={`btn-choose-${category}-hospital`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onConfirmAndOpenDrawer(hospital);
          }}
          className={`w-full mt-2.5 py-2 px-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 text-white transition-all cursor-pointer ${
            isGovt ? 'liquid-btn-saffron' : 'liquid-btn-green'
          }`}
        >
          <span>{isSelected ? 'CHOSEN • ROUTE ➔' : `CHOOSE ${isGovt ? 'GOVT' : 'PRIVATE'} ➔`}</span>
        </button>
      </div>
    );
  };

  return (
    <div
      id="symptom-triage-popup"
      className="fixed left-0 right-0 bottom-0 z-40 max-w-md mx-auto pointer-events-auto liquid-glass rounded-t-[32px] border-t border-x border-white/70 dark:border-white/12 shadow-[0_-24px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_-24px_70px_rgba(0,0,0,0.85)] flex flex-col p-3.5 pb-6 text-slate-900 dark:text-white transition-all duration-300 animate-in slide-in-from-bottom-6 max-h-[54vh] overflow-y-auto"
    >
      {/* Subtle Top Tiranga Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] tiranga-stripe" />

      {/* Top Bar with Triage Query, Translation subtitle, What To Do Button, and Dismiss (X) */}
      <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10 flex-shrink-0 gap-2">
        <div className="flex flex-col min-w-0 pr-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#FF671F] animate-ping flex-shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-black text-[#FF671F] uppercase tracking-wider truncate">
              {symptomQuery ? `CHOOSE HOSPITAL FOR: "${symptomQuery}"` : 'CHOOSE EMERGENCY DESTINATION'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onOpenSymptomDetail && (
            <button
              id="triage-menu-what-to-do"
              type="button"
              onClick={onOpenSymptomDetail}
              className="px-2.5 py-1.5 rounded-xl liquid-btn-green text-white text-[10px] font-black tracking-wide flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md shadow-emerald-600/30 ring-1 ring-white/30"
              title="View immediate medical guidance"
            >
              <BookOpen className="w-3 h-3 stroke-[2.5]" />
              <span>WHAT TO DO</span>
            </button>
          )}

          <button
            id="close-symptom-triage-button"
            type="button"
            onClick={onClose}
            title="Close triage menu"
            className="p-1.5 rounded-xl liquid-glass-pill text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Two Explicit Visible Options: 1) Government Hospital  2) Private Hospital */}
      <div className="grid grid-cols-2 gap-2.5 pt-2.5">
        {renderHospitalCard(nearestGovtHospital, 'govt')}
        {renderHospitalCard(nearestGeneralHospital, 'private')}
      </div>
    </div>
  );
};
