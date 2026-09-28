import React, { useState, useRef } from 'react';
import { Hospital, LiveHold, ClinicalProtocol, DetailedSymptom, AITriageResult } from '../types';
import {
  CheckCircle2,
  Lock,
  Phone,
  Truck,
  Navigation,
  Droplet,
  ShieldAlert,
  AlertOctagon,
  Copy,
  Check,
  X,
  Building2,
  BookOpen,
  Clock,
  XCircle,
  Stethoscope,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface HospitalPeekDrawerProps {
  hospital?: Hospital | null;
  onBookSlot: () => void;
  isHolding: boolean;
  activeHold?: LiveHold | null;
  onCancelHold?: () => void;
  onSimulateRedeem?: () => void;
  onOpenProtocolView: () => void;
  protocol: ClinicalProtocol;
  matchedSymptom?: DetailedSymptom | null;
  aiTriageResult?: AITriageResult | null;
  isAiAnalyzing?: boolean;
  userQuery?: string;
  nearestGovtHospital?: Hospital | null;
  nearestGeneralHospital?: Hospital | null;
  onSelectHospital?: (hospital: Hospital) => void;
  onOpenSymptomDetail?: () => void;
  drawerExpanded: boolean;
  onDrawerExpandedChange: (expanded: boolean) => void;
  isVisible?: boolean;
  triageExplanation?: string;
  onClose?: () => void;
  onReopenSymptomMenu?: () => void;
}

export const HospitalPeekDrawer: React.FC<HospitalPeekDrawerProps> = ({
  hospital,
  onBookSlot,
  isHolding,
  activeHold,
  onCancelHold,
  onOpenProtocolView,
  protocol,
  matchedSymptom,
  aiTriageResult,
  isAiAnalyzing,
  userQuery,
  nearestGovtHospital,
  nearestGeneralHospital,
  onSelectHospital,
  onOpenSymptomDetail,
  drawerExpanded,
  onDrawerExpandedChange,
  isVisible = true,
  triageExplanation,
  onClose,
}) => {
  const [copiedOtp, setCopiedOtp] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number>(0);
  const lastScrollTopRef = useRef<number>(0);

  if (!hospital || !isVisible) {
    return null;
  }

  const availableBeds = hospital.wards.reduce((acc, w) => acc + w.available_now, 0);
  const primaryWard = hospital.wards.find((w) => w.ward_code === protocol.target_ward) || hospital.wards[0];

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard?.writeText(otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Touch tracking for drawer gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartYRef.current;

    // Swiping upward -> expand to 72%
    if (!drawerExpanded && deltaY < -15) {
      onDrawerExpandedChange(true);
    }
    // Swiping downward when at top -> collapse to peek
    else if (drawerExpanded && deltaY > 25) {
      if (!scrollContainerRef.current || scrollContainerRef.current.scrollTop <= 5) {
        onDrawerExpandedChange(false);
      }
    }
  };

  // Wheel tracking (mouse / trackpad) for expand and collapse
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 8 && !drawerExpanded) {
      onDrawerExpandedChange(true);
    } else if (e.deltaY < -8 && drawerExpanded) {
      if (!scrollContainerRef.current || scrollContainerRef.current.scrollTop <= 5) {
        onDrawerExpandedChange(false);
      }
    }
  };

  // Scroll listener inside container
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentTop = e.currentTarget.scrollTop;
    if (!drawerExpanded && currentTop > 8) {
      onDrawerExpandedChange(true);
    }
    lastScrollTopRef.current = currentTop;
  };

  // Clinical Details & Help Information prioritized by AI Triage Result & Matched Symptom
  const conditionTitle =
    aiTriageResult?.detected_symptom ||
    matchedSymptom?.name ||
    protocol.title;

  const acuityBadge =
    aiTriageResult?.esi_level ||
    matchedSymptom?.esi_level ||
    protocol.esi_acuity;

  const problemExplanation =
    aiTriageResult?.problem_overview ||
    matchedSymptom?.problem_overview ||
    triageExplanation ||
    protocol.calming_script ||
    'Urgent emergency assessment: Presentation requires rapid clinical stabilization, monitoring, and prioritized intervention.';

  const possibleConditions =
    aiTriageResult?.possible_conditions ||
    matchedSymptom?.possible_conditions ||
    [];

  const urgencyNote =
    aiTriageResult?.urgency_note ||
    matchedSymptom?.urgency_note;

  // Step-by-step immediate first aid actions
  const immediateSteps =
    aiTriageResult?.immediate_solution && aiTriageResult.immediate_solution.length > 0
      ? aiTriageResult.immediate_solution
      : matchedSymptom?.immediate_actions && matchedSymptom.immediate_actions.length > 0
      ? matchedSymptom.immediate_actions
      : protocol.protocol_steps || [];

  // Contraindications / What NOT to do
  const contraindications =
    aiTriageResult?.what_not_to_do && aiTriageResult.what_not_to_do.length > 0
      ? aiTriageResult.what_not_to_do
      : matchedSymptom?.what_not_to_do && matchedSymptom.what_not_to_do.length > 0
      ? matchedSymptom.what_not_to_do
      : protocol.do_nots || [];

  // Red flags
  const redFlags =
    matchedSymptom?.what_to_check?.red_flags && matchedSymptom.what_to_check.red_flags.length > 0
      ? matchedSymptom.what_to_check.red_flags
      : [
          'Sudden severe worsening of pain or loss of consciousness',
          'Pale, cold extremity or absent pedal pulse',
          'Acute shortness of breath, dizziness, or confusion',
        ];

  const handleOpenWhatToDo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!drawerExpanded) {
      onDrawerExpandedChange(true);
    } else if (onOpenSymptomDetail) {
      onOpenSymptomDetail();
    } else {
      onOpenProtocolView();
    }
  };

  return (
    <div
      className={`fixed left-0 right-0 bottom-0 z-40 max-w-md mx-auto pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{
          height: drawerExpanded ? '72vh' : '30vh',
          maxHeight: '74vh',
          transition: 'height 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="liquid-glass rounded-t-[36px] border-t border-x border-white/70 dark:border-white/12 shadow-[0_-24px_70px_rgba(0,0,0,0.18)] dark:shadow-[0_-30px_80px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden relative text-slate-900 dark:text-white"
      >
        {/* Subtle Top Tiranga Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] tiranga-stripe z-10" />

        {/* Sleek Apple Liquid Drag Handle Pill (Tap or swipe to expand/minimize) */}
        <div
          onClick={() => onDrawerExpandedChange(!drawerExpanded)}
          className="w-full pt-3 pb-2 flex-shrink-0 cursor-pointer flex items-center justify-center group touch-none select-none"
        >
          <div className="w-12 h-1.5 rounded-full liquid-glass-pill group-hover:bg-[#FF671F] transition-all shadow-sm group-hover:scale-105" />
        </div>

        {/* Scrollable Content Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            overscrollBehaviorY: 'contain',
          }}
          className="flex-1 px-4 pt-0 pb-3 overflow-y-auto no-scrollbar select-text space-y-3"
        >
          {/* Header Row: Hospital Name, ETA & Distance */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 truncate">
                <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight uppercase italic leading-tight truncate">
                  {hospital.short_name || hospital.name}
                </h2>
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] fill-[#16A34A]/20 flex-shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                {hospital.corridor_name || hospital.address}
              </p>
            </div>

            {/* Live Metrics Pill & Close Button */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="px-2.5 py-1 rounded-xl liquid-glass-pill text-[10px] font-black text-[#FF671F] flex items-center gap-1 shadow-sm">
                <Navigation className="w-3 h-3" />
                {hospital.eta_minutes} MIN
              </span>
              <span className="px-2.5 py-1 rounded-xl liquid-glass-pill text-[10px] font-black text-slate-800 dark:text-slate-200 shadow-sm">
                {hospital.distance_km} KM
              </span>
              {onClose && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  title="Deselect Hospital"
                  className="p-1.5 rounded-xl liquid-glass-pill hover:bg-red-500 hover:text-white text-slate-400 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Optional Quick Hospital Switcher (Govt vs Private) */}
          {nearestGovtHospital && nearestGeneralHospital && onSelectHospital && (
            <div className="grid grid-cols-2 gap-1.5 p-1 liquid-glass-card rounded-2xl">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHospital(nearestGovtHospital);
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[10px] font-black tracking-tight transition-all cursor-pointer ${
                  hospital.id === nearestGovtHospital.id
                    ? 'liquid-glass text-[#FF671F] shadow-sm border border-[#FF671F]/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-3 h-3 text-[#FF671F]" />
                <span className="truncate">🏛️ GOVT ({nearestGovtHospital.eta_minutes}M)</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHospital(nearestGeneralHospital);
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[10px] font-black tracking-tight transition-all cursor-pointer ${
                  hospital.id === nearestGeneralHospital.id
                    ? 'liquid-glass text-[#16A34A] shadow-sm border border-[#16A34A]/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3 h-3 text-[#16A34A]" />
                <span className="truncate">🏥 PRIVATE ({nearestGeneralHospital.eta_minutes}M)</span>
              </button>
            </div>
          )}

          {/* Condition, Bed Tag, Clear Ownership Badge, and Prominent WHAT TO DO Button */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Clear Government vs Private Distinction */}
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wide uppercase border flex items-center gap-1 ${
                hospital.is_govt
                  ? 'bg-orange-50/80 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/60 text-[#FF671F]'
                  : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-[#16A34A]'
              }`}
            >
              {hospital.is_govt ? (
                <Building2 className="w-3 h-3" />
              ) : (
                <ShieldAlert className="w-3 h-3" />
              )}
              <span>{hospital.is_govt ? 'GOVT HOSPITAL' : 'PRIVATE HOSPITAL'}</span>
            </span>

            <span className="px-2 py-0.5 rounded-lg bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-[10px] font-black tracking-wide uppercase">
              {protocol.priority_code}
            </span>

            <span className="px-2 py-0.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-[#138808] dark:text-emerald-400 text-[10px] font-bold">
              {primaryWard.label}: {primaryWard.available_now} Beds Available
            </span>

            {/* Expand / Collapse Medical Info Button */}
            <button
              id="drawer-what-to-do-btn"
              type="button"
              onClick={handleOpenWhatToDo}
              className="px-3 py-1 rounded-xl liquid-btn-green text-white text-[10px] font-black tracking-wide flex items-center gap-1 transition-all cursor-pointer active:scale-95 ml-auto"
              title="View full medical guide and step-by-step help"
            >
              <BookOpen className="w-3 h-3" />
              <span>{drawerExpanded ? 'FULL PROTOCOL' : 'WHAT TO DO & MEDICAL HELP'}</span>
              {drawerExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          </div>

          {/* If HOLD IS ACTIVE & Drawer is Expanded: Detailed GPS Soft-Lock Card */}
          {isHolding && activeHold && drawerExpanded && (
            <div className="bg-orange-50/90 dark:bg-orange-950/40 border-2 border-[#FF671F] rounded-2xl p-3 shadow-md">
              <div className="flex items-center justify-between border-b border-orange-200 dark:border-orange-900/60 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF671F] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF671F]"></span>
                  </span>
                  <div>
                    <span className="text-[11px] font-black text-[#FF671F] tracking-wider uppercase block">
                      15-MIN GPS SOFT LOCK ACTIVE
                    </span>
                    <span className="text-[9px] text-slate-600 dark:text-slate-300 font-bold">
                      Ward: {activeHold.ward_label} • Bed Reserved
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-base font-black text-slate-900 dark:text-white">
                    {Math.floor(activeHold.seconds_left / 60)}:
                    {(activeHold.seconds_left % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-[8px] font-bold text-[#FF671F] block uppercase">
                    GPS TRACKED
                  </span>
                </div>
              </div>

              {/* Pause notice text below timer */}
              <div className="mb-2 text-[9.5px] font-bold text-[#138808] dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 px-2 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-[#138808] dark:bg-emerald-400 animate-pulse flex-shrink-0" />
                <span>Timer pauses automatically when moving towards the hospital</span>
              </div>

              {/* 4-Digit Gate OTP Display */}
              <div className="flex items-center justify-between bg-white dark:bg-[#070e1e] border border-orange-200 dark:border-orange-900/60 rounded-xl p-2.5 shadow-sm">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                    GATE CHECK-IN CODE (OTP)
                  </span>
                  <span className="text-[9px] text-[#138808] dark:text-emerald-400 font-bold">
                    Show to ER Nurse upon arrival
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex gap-1 font-mono text-lg font-black text-slate-900 dark:text-white bg-orange-50 dark:bg-orange-950/40 px-2.5 py-0.5 rounded-lg border border-orange-300 dark:border-orange-800 tracking-widest">
                    {activeHold.otp_code.split('').map((digit, i) => (
                      <span key={i}>{digit}</span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyOtp(activeHold.otp_code)}
                    className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50 hover:bg-[#FF671F] hover:text-white text-[#FF671F] transition-colors cursor-pointer"
                    title="Copy OTP"
                  >
                    {copiedOtp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PEEK VIEW (30vh): Quick Issue Summary, AI Insights & Expand Button */}
          {!drawerExpanded && (
            <div
              onClick={() => onDrawerExpandedChange(true)}
              className="bg-slate-50 dark:bg-[#070e1e] border border-slate-200 dark:border-[#182b52] rounded-2xl p-2.5 space-y-2 cursor-pointer hover:border-[#FF671F]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF671F] flex-shrink-0" />
                  <span className="text-[10px] font-black text-[#FF671F] uppercase tracking-wider">
                    SIMPLE AI CLINICAL TRIAGE
                  </span>
                </div>
                <span className="text-[9px] font-bold text-[#FF671F] uppercase bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-900/60">
                  {acuityBadge.split(' ')[0]}
                </span>
              </div>

              <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                {conditionTitle}
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-snug">
                {problemExplanation}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-[#182b52] text-[10px] font-bold text-[#138808] dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Scroll or tap for full medical triage & first aid (70%)</span>
                </span>
                <span className="text-[#FF671F] font-black flex items-center gap-0.5">
                  Expand ⮝
                </span>
              </div>
            </div>
          )}

          {/* EXPANDED SECTION (72vh): Comprehensive Issue Assessment, Simple AI, What to Do, Contraindications, & Wards */}
          {drawerExpanded && (
            <div className="pt-2 border-t border-black/5 dark:border-white/10 space-y-3.5 select-text">
              {/* 1. LIVE BEDS, ICU WARD CAPACITY BREAKDOWN & BLOOD BANK STOCK (GIVEN FIRST) */}
              <div className="liquid-glass-card border-emerald-400/40 rounded-3xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#138808] dark:text-[#22C55E]" />
                    <span className="text-xs font-black text-[#138808] dark:text-[#22C55E] uppercase tracking-wide">
                      LIVE BED, ICU & BLOOD BANK TELEMETRY
                    </span>
                  </div>
                  <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 liquid-glass-pill px-2.5 py-1 rounded-xl flex items-center gap-1 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE SYNC
                  </span>
                </div>

                {/* Availability Highlights 3-Grid */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="liquid-glass-card rounded-2xl p-2.5">
                    <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase block">
                      TARGET WARD
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block my-0.5">
                      {primaryWard.available_now} Free Beds
                    </span>
                    <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase truncate block">
                      {primaryWard.label}
                    </span>
                  </div>

                  <div className="liquid-glass-card rounded-2xl p-2.5">
                    <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase block">
                      TOTAL AVAILABLE BEDS
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#138808] dark:text-emerald-400 block my-0.5">
                      {availableBeds} Free
                    </span>
                    <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase block">
                      All Wards
                    </span>
                  </div>

                  <div className="liquid-glass-card rounded-2xl p-2.5">
                    <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase block">
                      TRAUMA BAY
                    </span>
                    <span className="text-[10px] font-black text-slate-900 dark:text-white block my-0.5 truncate">
                      {hospital.is_trauma_center ? 'Level-1 Ready' : 'Civic Unit'}
                    </span>
                    <span className="text-[8px] text-[#FF671F] font-bold uppercase block">Verified</span>
                  </div>
                </div>

                {/* Ward Capacity Breakdown */}
                <div className="pt-2">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider block mb-1.5 px-1">
                    INDIVIDUAL ICU & WARD BED BREAKDOWN
                  </span>
                  <div className="space-y-1.5">
                    {hospital.wards.map((ward) => (
                      <div
                        key={ward.ward_code}
                        className="flex items-center justify-between liquid-glass-card rounded-2xl px-3.5 py-2.5 text-xs"
                      >
                        <div>
                          <div className="text-slate-900 dark:text-white font-bold text-xs uppercase">
                            {ward.label}
                          </div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400">
                            Staffed Capacity: {ward.total_staffed} Beds
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-xs font-black ${
                              ward.available_now > 0
                                ? 'text-[#138808] dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {ward.available_now} Beds Free
                          </span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-bold">
                            {ward.held_now} Reserved
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blood Bank Stock */}
                {hospital.blood_summary && hospital.blood_summary.length > 0 && (
                  <div className="pt-2 border-t border-black/5 dark:border-white/10">
                    <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider block mb-1.5 px-1">
                      BLOOD BANK STOCK
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {hospital.blood_summary.map((blood, idx) => (
                        <div
                          key={idx}
                          className="liquid-glass-card rounded-2xl p-2.5 text-xs flex items-center justify-between"
                        >
                          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                            <Droplet className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                            <span className="font-bold text-[11px]">
                              {blood.blood_group} {blood.component}
                            </span>
                          </div>
                          <span className="text-[#138808] dark:text-emerald-400 font-black text-xs">
                            {blood.units_free_now} Units
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. SIMPLE AI CLINICAL ASSESSMENT & ISSUE EXPLANATION */}
              <div className="liquid-glass-card rounded-3xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl liquid-btn-saffron flex items-center justify-center text-white shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                        SIMPLE AI CLINICAL ASSESSMENT
                        {isAiAnalyzing && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF671F] animate-ping" />
                        )}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-[#FF671F] liquid-glass-pill px-2.5 py-1 rounded-xl flex items-center gap-1 border border-[#FF671F]/30">
                    <AlertOctagon className="w-3 h-3" />
                    LIVE TRIAGE
                  </span>
                </div>

                {/* Multilingual Translation Banner */}
                {aiTriageResult && (aiTriageResult.detected_language || aiTriageResult.english_translation) && (
                  <div className="liquid-glass-card border-blue-400/40 rounded-2xl p-3 text-[11px] text-blue-950 dark:text-blue-200 flex items-start gap-2.5">
                    <span className="text-base">🌐</span>
                    <div className="leading-snug">
                      <span className="font-black block text-[10px] uppercase tracking-wider text-blue-700 dark:text-blue-300">
                        Input Detected: {aiTriageResult.detected_language || 'Multilingual Voice/Text'}
                      </span>
                      <span className="font-medium">{aiTriageResult.english_translation}</span>
                    </div>
                  </div>
                )}

                {/* Primary Condition Title & Acuity */}
                <div>
                  <div className="text-sm font-black text-[#FF671F] dark:text-[#FF7A00] mb-1 leading-snug">
                    {conditionTitle} • <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{acuityBadge}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {problemExplanation}
                  </p>
                </div>

                {/* Differential Diagnosis */}
                {possibleConditions.length > 0 && (
                  <div className="liquid-glass-card rounded-2xl p-3 space-y-1.5 border-black/5 dark:border-white/10">
                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block tracking-wider">
                      Possible Underlying Conditions (Differential Analysis)
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {possibleConditions.map((cond, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-bold liquid-glass-pill text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-xl"
                        >
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Therapeutic Window */}
                {urgencyNote && (
                  <div className="flex items-start gap-2.5 liquid-glass-card border-amber-400/40 rounded-2xl p-3 text-[11px] text-amber-900 dark:text-amber-300">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black block uppercase text-[10px]">
                        CRITICAL THERAPEUTIC WINDOW
                      </span>
                      <span className="leading-snug font-medium">{urgencyNote}</span>
                    </div>
                  </div>
                )}

                {/* Red Flags */}
                {redFlags.length > 0 && (
                  <div className="liquid-glass-card border-red-500/40 rounded-2xl p-3 text-[11px] text-red-700 dark:text-red-300">
                    <span className="font-black text-[10px] uppercase text-red-600 dark:text-red-400 block mb-1">
                      ⚠️ IMMEDIATE DANGER SIGNS (RED FLAGS)
                    </span>
                    <ul className="space-y-1 pl-1">
                      {redFlags.slice(0, 3).map((ds, idx) => (
                        <li key={idx} className="flex items-start gap-2 font-medium">
                          <span className="text-red-500 font-bold">•</span>
                          <span>{ds}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Why this hospital */}
                <div className="liquid-glass-card rounded-2xl p-3 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="text-slate-900 dark:text-white font-bold block mb-0.5">
                    Why {hospital.short_name || hospital.name}?
                  </span>
                  Confirmed {primaryWard.available_now} staffed bed(s) in {primaryWard.label}.{' '}
                  {hospital.has_cath_lab ? 'Active 24/7 Cath Lab.' : ''}{' '}
                  {hospital.is_trauma_center ? 'Level-1 Trauma bay ready.' : ''}{' '}
                  ETA is only {hospital.eta_minutes} mins ({hospital.distance_km} km).
                </div>
              </div>

              {/* 3. WHAT TO DO & HOW TO HELP (IMMEDIATE STEP-BY-STEP ACTIONS) */}
              <div className="liquid-glass-card border-emerald-400/40 rounded-3xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#138808] dark:text-[#22C55E]" />
                    <span className="text-xs font-black text-[#138808] dark:text-[#22C55E] uppercase tracking-wide">
                      HOW TO HELP: WHAT TO DO NOW
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenWhatToDo}
                    className="text-[10px] font-bold text-[#138808] dark:text-[#22C55E] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Full Clinical Protocol</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {protocol.immediate_action && (
                  <div className="liquid-glass-card border-emerald-300/40 rounded-2xl p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-[#FF671F] uppercase">
                        {protocol.immediate_action.title}
                      </span>
                      {protocol.immediate_action.angle_badge && (
                        <span className="text-[9px] font-black text-white liquid-btn-saffron px-2.5 py-0.5 rounded-full">
                          {protocol.immediate_action.angle_badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {protocol.immediate_action.instruction}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {immediateSteps.map((act, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 liquid-glass-card p-3 rounded-2xl text-[11px] text-slate-800 dark:text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full liquid-btn-green text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. WHAT NOT TO DO (CRITICAL MISTAKES TO AVOID) */}
              {contraindications.length > 0 && (
                <div className="liquid-glass-card border-red-400/40 rounded-3xl p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 border-b border-black/5 dark:border-white/10 pb-2">
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wide">
                      WHAT NOT TO DO (CRITICAL MISTAKES TO AVOID)
                    </span>
                  </div>
                  <div className="space-y-2 text-[11px] text-red-700 dark:text-red-300">
                    {contraindications.map((dn, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 liquid-glass-card p-2.5 rounded-2xl border-red-200/50 dark:border-red-900/40"
                      >
                        <span className="text-red-500 font-black text-xs flex-shrink-0 mt-0.5">✕</span>
                        <span className="leading-relaxed font-medium">{dn.replace(/^❌\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. PRE-HOSPITAL GUIDANCE & ER READINESS */}
              {(matchedSymptom?.home_care_or_triage || matchedSymptom?.hospital_prep) && (
                <div className="liquid-glass-card rounded-3xl p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 border-b border-black/5 dark:border-white/10 pb-2">
                    <Stethoscope className="w-4 h-4 text-[#FF671F]" />
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">
                      PRE-HOSPITAL & EMERGENCY ROOM PREP
                    </span>
                  </div>
                  {matchedSymptom.home_care_or_triage && (
                    <div className="liquid-glass-card p-3 rounded-2xl text-[11px] text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-white block mb-0.5">
                        Pre-Hospital Advice:
                      </strong>
                      {matchedSymptom.home_care_or_triage}
                    </div>
                  )}
                  {matchedSymptom.hospital_prep && (
                    <div className="liquid-glass-card p-3 rounded-2xl text-[11px] text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-white block mb-0.5">
                        What to Bring to ER:
                      </strong>
                      {matchedSymptom.hospital_prep}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {/* STICKY FOOTER ACTION BAR - Apple Liquid Glass Container */}
        <div className="flex-shrink-0 px-4 pt-2.5 pb-4 liquid-glass border-t border-white/60 dark:border-white/12 shadow-[0_-12px_32px_rgba(0,0,0,0.12)]">
          {isHolding && activeHold ? (
            /* When Soft Lock is Active */
            !drawerExpanded ? (
              <div className="flex items-center justify-between liquid-glass-card border-2 border-[#FF671F] rounded-2xl p-3 shadow-lg shadow-[#FF671F]/20">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF671F] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF671F]"></span>
                    </span>
                    <span className="text-[11px] font-black text-[#FF671F] uppercase tracking-wider">
                      {protocol.priority_code} • {Math.floor(activeHold.seconds_left / 60)}:
                      {(activeHold.seconds_left % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-600 dark:text-slate-300 font-bold block mt-0.5">
                    {hospital.short_name || hospital.name} • OTP:{' '}
                    <strong className="text-slate-900 dark:text-white tracking-widest font-mono">
                      {activeHold.otp_code}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyOtp(activeHold.otp_code)}
                    className="p-2 rounded-xl liquid-glass-pill text-xs font-bold text-[#FF671F] hover:bg-[#FF671F] hover:text-white transition-all cursor-pointer"
                    title="Copy OTP"
                  >
                    {copiedOtp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {onCancelHold && (
                    <button
                      type="button"
                      onClick={onCancelHold}
                      className="py-2 px-3 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-[10px] font-black hover:bg-red-600 hover:text-white transition-all uppercase cursor-pointer"
                    >
                      RELEASE
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* When in 72% view: Sticky bottom has Open Google Maps, Release and Call buttons */
              <div className="space-y-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}&destination_place_id=${encodeURIComponent(hospital.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-black text-xs sm:text-sm tracking-tight transition-all flex items-center justify-center gap-2 uppercase cursor-pointer shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.01] active:scale-[0.98] border border-blue-400/40"
                >
                  <Navigation className="w-4 h-4 text-white animate-pulse" />
                  <span>OPEN IN GOOGLE MAPS ➔</span>
                </a>

                <div className="flex gap-2">
                  {onCancelHold && (
                    <button
                      type="button"
                      onClick={onCancelHold}
                      className="flex-1 py-3 px-4 rounded-2xl liquid-glass-pill border-red-400/40 text-red-600 dark:text-red-400 text-xs font-black tracking-wider hover:bg-red-600 hover:text-white transition-all uppercase cursor-pointer text-center"
                    >
                      RELEASE 15-MIN HOLD
                    </button>
                  )}
                  <a
                    href={`tel:${hospital.phone.replace(/[^0-9+]/g, '')}`}
                    className="py-3 px-5 rounded-2xl liquid-btn-saffron text-white text-xs font-black tracking-tight uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                    <span>CALL ER</span>
                  </a>
                </div>
              </div>
            )
          ) : (
            /* When Hold is NOT Active: Sticky Book My Slot & Action Buttons */
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onBookSlot()}
                className="w-full py-3 px-4 rounded-full liquid-btn-saffron text-white font-black text-xs sm:text-sm tracking-tight transition-all flex items-center justify-center gap-2 uppercase cursor-pointer active:scale-[0.98]"
              >
                <Lock className="w-3.5 h-3.5 text-white" />
                <span>BOOK MY SLOT AND START ➔</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Ambulance 108 */}
                <a
                  href="tel:108"
                  className="py-2.5 px-3 rounded-2xl liquid-glass-card border-red-400/40 hover:bg-red-600 hover:border-red-600 hover:text-white text-red-600 dark:text-red-400 font-black text-[11px] uppercase tracking-tight flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Ambulance (108)</span>
                </a>

                {/* Call Hospital */}
                <a
                  href={`tel:${hospital.phone.replace(/[^0-9+]/g, '')}`}
                  className="py-2.5 px-3 rounded-2xl liquid-glass-card border-emerald-400/40 hover:bg-[#138808] hover:border-[#138808] hover:text-white text-[#138808] dark:text-emerald-400 font-black text-[11px] uppercase tracking-tight flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#138808] dark:text-emerald-400" />
                  <span>Call Hospital</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
