import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleClearData = () => {
    try {
      localStorage.removeItem('pulsegrid_active_hold_v2');
      localStorage.removeItem('pulsegrid_active_holds_cache_v2');
      localStorage.removeItem('pulsegrid_overrides_cache_v2');
      localStorage.removeItem('pulsegrid_admitted_patients_v2');
    } catch {}
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#ff334b]/20 border-2 border-[#ff334b] flex items-center justify-center mb-5 text-[#ff334b] shadow-[0_0_30px_rgba(255,51,75,0.4)]">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white mb-2">
            PULSEGRID EMERGENCY RECOVERY
          </h1>
          <p className="text-xs text-[#AAAAAA] max-w-sm mb-3 leading-relaxed">
            The emergency visual interface recovered from an unexpected rendering pause.
          </p>

          {this.state.error && (
            <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 max-w-md w-full mb-5 text-left overflow-auto max-h-32">
              <span className="text-[11px] font-mono text-red-400 block font-bold">Error details:</span>
              <code className="text-[10px] font-mono text-red-300 block break-words mt-1">
                {this.state.error.toString()}
              </code>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-full bg-[#E2FF4D] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              Resume Telemetry
            </button>
            <button
              onClick={this.handleClearData}
              className="px-4 py-2.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset App Cache
            </button>
            <button
              onClick={this.handleReload}
              className="px-4 py-2.5 rounded-full bg-[#1A1A1A] border border-[#333333] text-white font-bold text-xs flex items-center gap-1.5 hover:border-[#E2FF4D] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
