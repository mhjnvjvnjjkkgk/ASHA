import React, { useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Search,
  X,
  MapPin,
  Droplet,
  Building2,
  ArrowRight,
  Globe,
  Sparkles,
} from 'lucide-react';
import { DetailedSymptom } from '../types';

interface VoiceTriageInputProps {
  currentQuery: string;
  onQueryChange: (query: string) => void;
  onSearchSubmit: (query: string, symptom?: DetailedSymptom) => void;
  isListening: boolean;
  onToggleListening: () => void;
  isSearchActive: boolean;
  onClearSearch?: () => void;
  isVisible?: boolean;
  onOpenSymptomDirectory?: () => void;
  voiceLanguage?: 'bn-IN' | 'en-IN';
  onChangeVoiceLanguage?: (lang: 'bn-IN' | 'en-IN') => void;
}

const COMMON_BLOOD_GROUPS = ['O+', 'B+', 'A+', 'AB+', 'O-', 'A-'];

export const VoiceTriageInput: React.FC<VoiceTriageInputProps> = ({
  currentQuery,
  onQueryChange,
  onSearchSubmit,
  isListening,
  onToggleListening,
  isSearchActive,
  onClearSearch,
  isVisible = true,
  voiceLanguage = 'bn-IN',
  onChangeVoiceLanguage,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showBloodPicker, setShowBloodPicker] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentQuery.trim()) {
      onSearchSubmit(currentQuery.trim());
      inputRef.current?.blur();
    }
  };

  const handleBloodGroupSelect = (bg: string) => {
    const query = `${bg} Blood`;
    onQueryChange(query);
    onSearchSubmit(query);
    setShowBloodPicker(false);
  };

  const handleFocusBloodInput = () => {
    setShowBloodPicker((prev) => !prev);
    inputRef.current?.focus();
  };

  const handleNearestHospital = () => {
    onQueryChange('Nearest Hospital');
    onSearchSubmit('Nearest Hospital');
  };

  const handleQuickSampleClick = (phrase: string) => {
    onQueryChange(phrase);
    onSearchSubmit(phrase);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed left-0 right-0 z-40 px-3.5 max-w-md mx-auto pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isSearchActive ? 'top-[4.75rem] sm:top-20' : 'bottom-6'
      }`}
    >
      {/* 70/30 Ratio buttons: 1) TYPE REQUIRED BLOOD GROUP (70% Saffron) 2) NEAREST HOSPITAL (30% Green) */}
      {!isSearchActive && (
        <div className="mb-2.5 flex items-stretch gap-2.5 w-full select-none">
          {/* 1) 70% Ratio: TYPE REQUIRED BLOOD GROUP - Liquid Glass Card */}
          <button
            type="button"
            onClick={handleFocusBloodInput}
            className="w-[70%] flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl liquid-glass-card hover:border-[#FF671F]/70 text-slate-900 dark:text-white transition-all cursor-pointer group active:scale-[0.98]"
          >
            <span className="w-8 h-8 rounded-xl liquid-glass-pill border border-[#FF671F]/40 flex items-center justify-center flex-shrink-0 text-[#FF671F] group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(255,103,31,0.25)]">
              <Droplet className="w-4 h-4 fill-current" />
            </span>
            <div className="text-left min-w-0 flex-1">
              <span className="block text-[10px] font-black text-slate-900 dark:text-white group-hover:text-[#FF671F] tracking-wider uppercase truncate">
                TYPE REQUIRED BLOOD GROUP
              </span>
              <span className="block text-[9px] text-slate-700 dark:text-slate-200 font-semibold truncate">
                Tap to select O+, B+, A+, AB-...
              </span>
            </div>
          </button>

          {/* 2) 30% Ratio: NEAREST HOSPITAL - Liquid Glass Card */}
          <button
            type="button"
            onClick={handleNearestHospital}
            className="w-[30%] flex flex-col items-center justify-center px-2 py-2 rounded-2xl liquid-glass-card border-emerald-400/50 dark:border-emerald-500/40 hover:border-[#138808] text-[#138808] dark:text-emerald-400 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-1 text-[#138808] dark:text-emerald-400 group-hover:scale-110 transition-transform mb-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-black text-[#138808] dark:text-emerald-400 tracking-tight uppercase text-center leading-tight">
              nearest hospital
            </span>
          </button>
        </div>
      )}

      {/* Optional Blood Quick Picker bar if user tapped TYPE REQUIRED BLOOD GROUP */}
      {!isSearchActive && showBloodPicker && (
        <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 px-3 rounded-2xl liquid-glass-bar animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="text-[9px] font-black text-[#FF671F] uppercase px-1 flex-shrink-0 tracking-wider">SELECT:</span>
          {COMMON_BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => handleBloodGroupSelect(bg)}
              className="px-3 py-1 rounded-xl liquid-glass-pill hover:bg-[#FF671F] hover:text-white text-slate-900 dark:text-white text-[10px] font-black tracking-wide transition-all cursor-pointer flex-shrink-0 border border-white/20"
            >
              {bg}
            </button>
          ))}
        </div>
      )}

      {/* Multilingual Voice Listening Status & Instant Prompt */}
      {isListening && (
        <div className="mb-2.5 p-3.5 rounded-3xl liquid-glass-bar border border-red-500/60 shadow-[0_16px_40px_rgba(239,68,68,0.25)] animate-in fade-in slide-in-from-bottom-2 duration-200 text-slate-900 dark:text-white">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping flex-shrink-0" />
              <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wide">
                Listening... (Speak in English or Bengali)
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleListening}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-full liquid-glass-pill cursor-pointer"
            >
              Stop
            </button>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mb-2">
            Speak or type symptoms in English, Bengali (বাংলা), or Benglish:
          </p>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickSampleClick('Chest Pain')}
              className="px-2.5 py-1 rounded-xl liquid-glass-pill text-[10px] font-black text-rose-900 dark:text-rose-200 hover:border-rose-500 transition-colors cursor-pointer flex items-center gap-1"
            >
              🗣️ &ldquo;Chest Pain&rdquo; (English)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSampleClick('বুকে ব্যথা')}
              className="px-2.5 py-1 rounded-xl liquid-glass-pill text-[10px] font-black text-orange-900 dark:text-orange-200 hover:border-[#FF671F] transition-colors cursor-pointer flex items-center gap-1"
            >
              🗣️ &ldquo;বুকে ব্যথা&rdquo; (Bengali)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSampleClick('buke betha korche')}
              className="px-2.5 py-1 rounded-xl liquid-glass-pill text-[10px] font-black text-amber-900 dark:text-amber-200 hover:border-amber-500 transition-colors cursor-pointer flex items-center gap-1"
            >
              🗣️ &ldquo;buke betha&rdquo; (Benglish)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSampleClick('Shortness of Breath')}
              className="px-2.5 py-1 rounded-xl liquid-glass-pill text-[10px] font-black text-blue-900 dark:text-blue-200 hover:border-blue-500 transition-colors cursor-pointer flex items-center gap-1"
            >
              🗣️ &ldquo;Shortness of Breath&rdquo;
            </button>
          </div>
        </div>
      )}

      {/* Main Tiranga Themed Floating Search Bar - Apple Liquid Glass Capsule */}
      <form
        onSubmit={handleSubmit}
        className={`flex items-center rounded-full px-4 transition-all duration-300 gap-2.5 liquid-glass-bar ring-1 ring-slate-900/10 dark:ring-white/10 ${
          isSearchActive
            ? 'h-12 border-[#FF671F]/90 ring-2 ring-[#FF671F]/40 shadow-[0_16px_40px_rgba(255,103,31,0.35)]'
            : 'h-13 shadow-[0_14px_36px_rgba(15,23,42,0.12)] hover:border-[#FF671F]/70'
        }`}
      >
        {/* Saffron Search / Pin Icon with liquid glow */}
        <button
          type="submit"
          className="text-[#FF671F] hover:scale-110 transition-transform flex-shrink-0 flex items-center justify-center cursor-pointer p-1 rounded-full"
          title="Search Emergency Hospital"
        >
          {isSearchActive ? (
            <Search className="w-4.5 h-4.5 text-[#FF671F]" />
          ) : (
            <MapPin className="w-4.5 h-4.5 text-[#FF671F]" />
          )}
        </button>

        {/* Symptoms / Emergency Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={currentQuery}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
          placeholder={
            isSearchActive
              ? 'Type symptoms (Bengali / Benglish / English) & Enter...'
              : 'Type symptoms (e.g. buke betha, rokto, leg bleeding)...'
          }
          className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white font-sans font-semibold placeholder-slate-600 dark:placeholder-slate-300 focus:outline-none"
        />

        {/* Submit Arrow Button - Glowing Liquid Saffron Gem */}
        {currentQuery.trim().length > 0 && (
          <button
            type="submit"
            title="Detect issue with AI & route to hospital"
            className="w-8 h-8 rounded-full liquid-btn-saffron text-white flex items-center justify-center transition-all flex-shrink-0 cursor-pointer active:scale-95 shadow-md"
          >
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        )}

        {/* Clear search button (when active) */}
        {isSearchActive && onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            title="Clear and reset search"
            className="text-slate-400 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white p-1.5 rounded-full transition-colors flex-shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Language selector toggle button */}
        {onChangeVoiceLanguage && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu((p) => !p)}
              title="Select Voice Language"
              className="w-7 h-7 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white liquid-glass-pill transition-colors flex items-center justify-center cursor-pointer border border-white/20"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 bottom-10 z-50 py-2 px-2 liquid-glass-bar rounded-2xl shadow-2xl flex flex-col gap-1 min-w-[160px] text-[10px] font-bold animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    onChangeVoiceLanguage('bn-IN');
                    setShowLangMenu(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    voiceLanguage === 'bn-IN' ? 'liquid-btn-saffron text-white font-black' : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  🇧🇩 / 🇮🇳 বাংলা (Bengali / Benglish)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChangeVoiceLanguage('en-IN');
                    setShowLangMenu(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    voiceLanguage === 'en-IN' ? 'liquid-btn-saffron text-white font-black' : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  🇬🇧 English (Benglish)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Green Glowing Liquid Voice Mic Button */}
        <button
          type="button"
          onClick={onToggleListening}
          title={isListening ? 'Stop Voice Listening' : 'Speak Symptoms in Bengali / Benglish'}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isListening
              ? 'liquid-btn-saffron text-white animate-pulse scale-105 shadow-[0_0_16px_rgba(255,103,31,0.6)]'
              : 'liquid-glass-orb text-[#138808] dark:text-emerald-400 hover:bg-[#138808] hover:text-white border border-emerald-400/40 shadow-sm'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
