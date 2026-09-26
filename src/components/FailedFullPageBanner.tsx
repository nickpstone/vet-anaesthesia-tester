import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldAlert } from 'lucide-react';
import { OverallEvaluation } from '../types';

interface FailedFullPageBannerProps {
  evaluation: OverallEvaluation;
}

export const FailedFullPageBanner: React.FC<FailedFullPageBannerProps> = ({ evaluation }) => {
  if (!evaluation.hasMeasurements || evaluation.isPassed) {
    return null;
  }

  // Find all failed points across all runs
  const failedItems: { runFlow: number; dial: number; measured: number; reason?: string }[] = [];
  evaluation.runs.forEach((r) => {
    r.evaluations.forEach((p) => {
      if (p.status === 'FAIL') {
        failedItems.push({
          runFlow: r.flowrate,
          dial: p.dialSetting,
          measured: p.measured || 0,
          reason: p.reason
        });
      }
    });
  });

  return (
    <div className="w-full my-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Top Warning Strip */}
      <div className="bg-rose-600 text-white px-4 py-2 rounded-t-2xl flex items-center justify-between text-xs font-bold uppercase tracking-wider shadow-lg">
        <span className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4" />
          Critical Warning: Anaesthesia Vaporiser Calibration Failed
        </span>
        <span className="bg-black/20 px-2 py-0.5 rounded text-[11px]">
          {evaluation.failedCount} Point(s) Out of Specification
        </span>
      </div>

      {/* Main Failed Banner Card */}
      <div className="bg-slate-900 border-2 border-rose-600/80 rounded-b-2xl p-6 sm:p-8 shadow-2xl shadow-rose-950/50 relative overflow-hidden">
        
        {/* Subtle background diagonal red accent pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[repeating-linear-gradient(45deg,#ef4444_0,#ef4444_20px,transparent_20px,transparent_40px)]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4" />
            Biomedical Testing Protocol Failure
          </div>

          {/* THE GIANT "FAILED" WITH THE RED UNDERLINE SPANNING OVER THE ENTIRE PAGE */}
          <div className="py-2">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-rose-500 tracking-tight uppercase m-0 drop-shadow-sm select-none">
              FAILED
            </h1>
            
            {/* The Red Underline Spanning Across the Entire Page / Container */}
            <div className="w-full mt-3 sm:mt-4 flex items-center justify-center">
              <div className="w-full h-1.5 sm:h-2 bg-gradient-to-r from-rose-700 via-rose-500 to-rose-700 rounded-full shadow-lg shadow-rose-500/50" />
            </div>
            
            <p className="text-xs sm:text-sm font-bold text-rose-400 uppercase tracking-widest mt-2">
              Vaporiser Output Exceeds Allowable ISO Accuracy Limits
            </p>
          </div>

          {/* Specific Failure Points Summary */}
          <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-4 text-left">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Failed Output Readings:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {failedItems.map((item, idx) => (
                <div key={idx} className="bg-slate-900/90 border border-rose-800/60 rounded-lg p-2.5 text-xs">
                  <div className="font-semibold text-white flex justify-between">
                    <span>Flow @ {item.runFlow} L/min</span>
                    <span className="text-rose-400 font-mono font-bold">FAIL</span>
                  </div>
                  <div className="text-slate-300 mt-1 flex justify-between font-mono">
                    <span>Set: {item.dial}%</span>
                    <span className="text-rose-400 font-bold">Act: {item.measured}%</span>
                  </div>
                  {item.reason && (
                    <div className="text-[10px] text-rose-400/90 mt-1 truncate" title={item.reason}>
                      {item.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Clinical advisory notice */}
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mx-auto m-0">
            <strong>Clinical Safety Advisory:</strong> Inaccurate vaporiser output creates high risks of patient awareness or lethal overdose during veterinary surgery. This machine must not be used on patients until serviced, cleaned, and recalibrated by an authorized technician.
          </p>

        </div>

      </div>

    </div>
  );
};
