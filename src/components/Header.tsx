import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  RotateCcw, 
  Download, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  XCircle, 
  History, 
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { CompanyProfile } from '../types';

interface HeaderProps {
  company: CompanyProfile;
  onOpenCompanyModal: () => void;
  onOpenHistoryModal: () => void;
  onReset: () => void;
  onLoadSample: (type: 'pass' | 'fail') => void;
  isPassed: boolean;
  hasMeasurements: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  onOpenCompanyModal,
  onOpenHistoryModal,
  onReset,
  onLoadSample,
  isPassed,
  hasMeasurements
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="bg-[#0f1a20]/95 border-b border-[#1b323e] sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 min-w-0">
            {company.logoDataUrl ? (
              <div className="h-10 sm:h-12 bg-white rounded-xl px-2 py-1 flex items-center justify-center shadow-md shadow-[#09b0bb]/10 border border-[#1b323e] flex-shrink-0">
                <img src={company.logoDataUrl} alt="Vet1 Logo" className="h-full w-auto object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-[#09b0bb] to-[#038c97] flex items-center justify-center shadow-lg shadow-[#09b0bb]/20 text-white flex-shrink-0">
                <Stethoscope className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white m-0 truncate flex items-center gap-1.5">
                  <span>Vet<span className="text-[#09b0bb]">1</span></span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#09b0bb]/15 text-[#8dd4d9] border border-[#09b0bb]/30 uppercase tracking-wider">
                    Floline Cal
                  </span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#14232b] text-slate-300 border border-[#1b323e]">
                  PWA
                </span>
                {hasMeasurements && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    isPassed 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {isPassed ? 'PASS' : 'FAIL'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate m-0">
                Anaesthesia Machine & Vaporiser Calibration Testing System
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Demo Fillers */}
            <div className="hidden lg:flex items-center bg-[#14232b] rounded-lg p-1 border border-[#1b323e] text-xs">
              <span className="text-slate-400 px-2 flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#09b0bb]" /> Demo:
              </span>
              <button
                type="button"
                onClick={() => onLoadSample('pass')}
                className="px-2.5 py-1 rounded bg-[#0f1a20] hover:bg-emerald-600/30 hover:text-emerald-300 text-slate-200 transition-colors font-medium cursor-pointer"
                title="Fill with passing test data"
              >
                Pass Sample
              </button>
              <button
                type="button"
                onClick={() => onLoadSample('fail')}
                className="px-2.5 py-1 rounded bg-[#0f1a20] hover:bg-rose-600/30 hover:text-rose-300 text-slate-200 transition-colors font-medium ml-1 cursor-pointer"
                title="Fill with failing test data to view red page underline"
              >
                Fail Sample
              </button>
            </div>

            {/* Offline/Online Badge */}
            <div 
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                isOnline 
                  ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300' 
                  : 'bg-amber-950/40 border-amber-800/50 text-amber-300'
              }`}
              title={isOnline ? 'Online - Service worker active' : 'Working offline - All features functional'}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* PWA Install Button */}
            {canInstall && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#09b0bb] hover:bg-[#038c97] text-white text-xs font-semibold shadow-md shadow-[#09b0bb]/20 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}

            {/* History Button */}
            <button
              type="button"
              onClick={onOpenHistoryModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#14232b] hover:bg-[#1a2f3a] text-slate-200 text-xs font-medium border border-[#1b323e] transition cursor-pointer"
              title="Saved Test History"
            >
              <History className="w-4 h-4 text-[#09b0bb]" />
              <span className="hidden md:inline">History</span>
            </button>

            {/* Company Profile / Logo Button */}
            <button
              type="button"
              onClick={onOpenCompanyModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#14232b] hover:bg-[#1a2f3a] text-slate-200 text-xs font-medium border border-[#1b323e] transition cursor-pointer"
              title="Testing Company Logo & Profile"
            >
              {company.logoDataUrl ? (
                <img 
                  src={company.logoDataUrl} 
                  alt="Company Logo" 
                  className="w-5 h-5 object-contain rounded bg-white p-0.5" 
                />
              ) : (
                <Building2 className="w-4 h-4 text-[#09b0bb]" />
              )}
              <span className="hidden md:inline truncate max-w-[120px]">
                {company.companyName ? company.companyName : 'Vet1 Info'}
              </span>
            </button>

            {/* Reset / New Test */}
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#14232b] hover:bg-[#1a2f3a] text-slate-300 hover:text-white text-xs font-medium border border-[#1b323e] transition cursor-pointer"
              title="Start New Test / Clear Form"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">New Test</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
