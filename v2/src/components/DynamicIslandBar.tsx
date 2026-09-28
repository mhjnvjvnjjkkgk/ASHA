import React from 'react';
import { Wifi, Battery, Stethoscope, User, Truck, Sun, Moon } from 'lucide-react';

interface DynamicIslandBarProps {
  activeRole: 'CITIZEN' | 'PARAMEDIC' | 'NURSE';
  onRoleChange: (role: 'CITIZEN' | 'PARAMEDIC' | 'NURSE') => void;
  onOpenDesk: () => void;
  isHolding: boolean;
  holdTimeLeft?: string;
  emergencyCategory?: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const DynamicIslandBar: React.FC<DynamicIslandBarProps> = ({
  activeRole,
  onRoleChange,
  onOpenDesk,
  isHolding,
  holdTimeLeft,
  theme = 'light',
  onToggleTheme,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-auto select-none">
      {/* Top Phone Chrome / Dynamic Island Container */}
      <div className="mx-auto max-w-md px-4 pt-2 pb-1">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-sans mb-1.5 px-2">
          <span className="font-black text-slate-900 dark:text-white text-sm tracking-tight">9:41</span>

          {/* Dynamic Island Capsule with subtle Tiranga indicator */}
          <div className="flex items-center gap-2 liquid-glass-pill px-3.5 py-1.5 rounded-full shadow-md transition-all duration-300 border border-white/60 dark:border-white/15">
            {/* Minimalist Tiranga micro-dots */}
            <div className="flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF671F]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-200 border border-slate-400 dark:border-slate-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#138808]" />
            </div>

            <span className="relative flex h-2 w-2 ml-0.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isHolding ? 'bg-[#ff334b]' : 'bg-[#FF671F]'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isHolding ? 'bg-[#ff334b]' : 'bg-[#FF671F]'}`}></span>
            </span>
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-900 dark:text-white">
              {isHolding ? `HOLD ACTIVE ${holdTimeLeft || '14:59'}` : 'EMERGENCY SOS'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Top Controls: Theme Toggle & Role Controls */}
        <div className="flex items-center justify-between gap-2 mt-1">
          {/* Theme Toggle Button (Light / Dark) */}
          {onToggleTheme && (
            <button
              id="btn-toggle-theme"
              type="button"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer liquid-glass-pill text-slate-800 dark:text-slate-200 hover:border-[#FF671F] dark:hover:border-[#FF671F] shadow-sm active:scale-95 group"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700 group-hover:-rotate-12 transition-transform" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          )}

          {/* Role Switcher Pill / Nurse Desk Shortcut */}
          <div className="flex items-center gap-1 liquid-glass-pill p-1 rounded-full shadow-sm ml-auto">
            <button
              onClick={() => onRoleChange('CITIZEN')}
              title="Citizen Mode"
              className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                activeRole === 'CITIZEN'
                  ? 'liquid-btn-saffron text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="hidden xs:inline">Citizen</span>
              <User className="w-3 h-3 xs:hidden" />
            </button>

            <button
              onClick={() => onRoleChange('PARAMEDIC')}
              title="108 Dispatch Mode"
              className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                activeRole === 'PARAMEDIC'
                  ? 'bg-slate-900/90 dark:bg-white/20 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="hidden xs:inline">108 Unit</span>
              <Truck className="w-3 h-3 xs:hidden" />
            </button>

            <button
              onClick={onOpenDesk}
              title="Open Hospital Nurse Desk"
              className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black liquid-btn-green text-white transition-all cursor-pointer shadow-sm"
            >
              <Stethoscope className="w-3 h-3" />
              <span className="hidden xs:inline">Desk</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
