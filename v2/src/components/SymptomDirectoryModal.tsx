import React, { useState, useMemo } from 'react';
import { DetailedSymptom, Hospital } from '../types';
import { ALL_DETAILED_SYMPTOMS, SYMPTOM_CATEGORIES } from '../data/symptoms';
import {
  Search,
  X,
  Stethoscope,
  Filter,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Building2,
  Navigation,
  HeartPulse,
  Activity,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';

interface SymptomDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymptom: (symptom: DetailedSymptom) => void;
  nearestGovtHospital: Hospital | null;
  nearestGeneralHospital: Hospital | null;
  onDirectRoute: (hospital: Hospital) => void;
}

export const SymptomDirectoryModal: React.FC<SymptomDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectSymptom,
  nearestGovtHospital,
  nearestGeneralHospital,
  onDirectRoute,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  // Filtered symptoms list
  const filteredSymptoms = useMemo(() => {
    return ALL_DETAILED_SYMPTOMS.filter((sym) => {
      // Category filter
      if (selectedCategory !== 'ALL' && sym.category !== selectedCategory) {
        return false;
      }

      // Severity filter
      if (selectedSeverity !== 'ALL' && sym.severity !== selectedSeverity) {
        return false;
      }

      // Search term filter
      if (!searchTerm.trim()) return true;

      const queryTokens = searchTerm.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const textCorpus = [
        sym.name,
        sym.category,
        sym.problem_overview,
        sym.urgency_note,
        sym.target_ward,
        ...(sym.keywords || []),
        ...(sym.possible_conditions || []),
        ...(sym.what_to_check.red_flags || []),
        ...(sym.what_to_check.physical_signs || []),
      ]
        .join(' ')
        .toLowerCase();

      return queryTokens.every((token) => textCorpus.includes(token));
    });
  }, [searchTerm, selectedCategory, selectedSeverity]);

  if (!isOpen) return null;

  return (
    <div
      id="symptom-directory-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-[#0b162c] border border-slate-200 dark:border-[#182b52] rounded-3xl shadow-2xl flex flex-col text-slate-900 dark:text-white overflow-hidden">
        {/* Subtle Top Tiranga Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] tiranga-stripe z-10" />

        {/* Header with Title and Close */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-[#070e1e] border-b border-slate-200 dark:border-[#182b52] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900/60 flex items-center justify-center text-[#FF671F]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-wide">
                  Clinical Symptom & Triage Directory
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FF671F] text-white">
                  Triage Protocol Guide
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Problems, urgency windows, what to check, how to help & immediate triage
              </p>
            </div>
          </div>

          <button
            id="close-symptom-directory-btn"
            type="button"
            onClick={onClose}
            title="Close Directory"
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-[#182b52] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-3 bg-slate-50 dark:bg-[#070e1e] border-b border-slate-200 dark:border-[#182b52] space-y-2 flex-shrink-0">
          {/* Search Box */}
          <div className="relative flex items-center gap-2 bg-white dark:bg-[#0b162c] border border-slate-300 dark:border-[#182b52] focus-within:border-[#FF671F] rounded-xl px-3 py-2 transition-all shadow-sm">
            <Search className="w-4 h-4 text-[#FF671F] flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search symptoms (e.g. chest pain, stroke, seizure, asthma, poisoning)..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Severity & Category Filters Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
            {/* Severity Pill: ALL */}
            <button
              type="button"
              onClick={() => setSelectedSeverity('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex-shrink-0 cursor-pointer ${
                selectedSeverity === 'ALL'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-white dark:bg-[#0b162c] border border-slate-200 dark:border-[#182b52] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Severities
            </button>

            {/* Severity Pill: RED */}
            <button
              type="button"
              onClick={() => setSelectedSeverity(selectedSeverity === 'RED' ? 'ALL' : 'RED')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex-shrink-0 cursor-pointer flex items-center gap-1 ${
                selectedSeverity === 'RED'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              Red (Critical)
            </button>

            {/* Severity Pill: YELLOW */}
            <button
              type="button"
              onClick={() => setSelectedSeverity(selectedSeverity === 'YELLOW' ? 'ALL' : 'YELLOW')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex-shrink-0 cursor-pointer flex items-center gap-1 ${
                selectedSeverity === 'YELLOW'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Yellow (Urgent)
            </button>

            <span className="h-4 w-px bg-slate-200 dark:bg-[#182b52] flex-shrink-0 mx-1" />

            {/* Category: ALL */}
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex-shrink-0 cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#FF671F] text-white shadow-sm'
                  : 'bg-white dark:bg-[#0b162c] border border-slate-200 dark:border-[#182b52] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Categories
            </button>

            {/* Individual Categories */}
            {SYMPTOM_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat ? 'ALL' : cat)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex-shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#FF671F] text-white shadow-sm'
                    : 'bg-white dark:bg-[#0b162c] border border-slate-200 dark:border-[#182b52] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Count & Results Meta */}
        <div className="px-4 py-1.5 bg-slate-50 dark:bg-[#070e1e] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#182b52]">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredSymptoms.length}</strong> medical conditions
          </span>
          <span className="text-[10px] text-[#138808] dark:text-emerald-400 font-bold">Tap condition to expand full guide</span>
        </div>

        {/* Scrollable Symptoms Cards List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
          {filteredSymptoms.length === 0 ? (
            <div className="text-center py-12 px-4">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No symptoms match "{searchTerm}"</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try searching broad terms like "chest", "headache", "fever", "pain", "breathing", or clear filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                  setSelectedSeverity('ALL');
                }}
                className="mt-3 px-3 py-1.5 rounded-xl bg-[#FF671F] text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredSymptoms.map((sym) => {
              const isRed = sym.severity === 'RED';
              return (
                <div
                  key={sym.id}
                  onClick={() => onSelectSymptom(sym)}
                  className="bg-slate-50 dark:bg-[#070e1e] border border-slate-200 dark:border-[#182b52] hover:border-[#FF671F] dark:hover:border-[#FF671F] hover:bg-white dark:hover:bg-[#0e1c38] p-3 rounded-2xl transition-all cursor-pointer text-left group relative shadow-sm"
                >
                  {/* Top line: Severity badge, Category, and Target Ward */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          isRed
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/60'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                        }`}
                      >
                        {sym.severity} • {sym.esi_level.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px] sm:max-w-none">
                        {sym.category}
                      </span>
                    </div>

                    <span className="text-[9px] font-bold text-[#138808] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1">
                      <HeartPulse className="w-2.5 h-2.5" />
                      {sym.target_ward.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>

                  {/* Symptom Title */}
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-[#FF671F] transition-colors leading-tight">
                    {sym.name}
                  </h3>

                  {/* Problem Overview Snippet */}
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                    {sym.problem_overview}
                  </p>

                  {/* What to check red flag snippet */}
                  {sym.what_to_check.red_flags && sym.what_to_check.red_flags.length > 0 && (
                    <div className="mt-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 px-2 py-1 rounded-lg text-[10px] text-red-700 dark:text-red-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="truncate">
                        <strong>Red Flag:</strong> {sym.what_to_check.red_flags[0]}
                      </span>
                    </div>
                  )}

                  {/* Bottom Action strip inside card */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-[#182b52] flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400">
                      {sym.immediate_actions.length} action steps available
                    </span>
                    <div className="flex items-center gap-1 text-[#FF671F] font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>VIEW WHAT TO DO & CHECK</span>
                      <ChevronRight className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Quick 2 Option Hospital Access */}
        <div className="p-2.5 bg-slate-50 dark:bg-[#070e1e] border-t border-slate-200 dark:border-[#182b52] flex items-center justify-between flex-shrink-0">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Directly route to nearest emergency facility:
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {nearestGovtHospital && (
              <button
                type="button"
                onClick={() => {
                  onDirectRoute(nearestGovtHospital);
                  onClose();
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0b162c] border border-[#138808] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[#138808] dark:text-emerald-400 text-xs font-bold cursor-pointer transition-all shadow-sm"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Govt ({nearestGovtHospital.eta_minutes}m)</span>
              </button>
            )}

            {nearestGeneralHospital && (
              <button
                type="button"
                onClick={() => {
                  onDirectRoute(nearestGeneralHospital);
                  onClose();
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF671F] to-[#FF8533] hover:from-[#FF8533] hover:to-[#FF671F] text-white text-xs font-black cursor-pointer transition-all shadow-md"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Nearest ({nearestGeneralHospital.eta_minutes}m)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
