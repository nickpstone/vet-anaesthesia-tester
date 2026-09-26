import React, { useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  ClipboardCheck, 
  AlertCircle,
  Percent
} from 'lucide-react';
import { OverallEvaluation, ToleranceConfig } from '../types';

interface ResultsSummaryCardProps {
  evaluation: OverallEvaluation;
  tolerance: ToleranceConfig;
  notes: string;
  onChangeNotes: (notes: string) => void;
}

interface MaxDevInfo {
  percent: number;
  dial: number;
}

export const ResultsSummaryCard: React.FC<ResultsSummaryCardProps> = ({
  evaluation,
  tolerance,
  notes,
  onChangeNotes
}) => {
  // Calculate max deviation observed
  const maxDevInfo = useMemo<MaxDevInfo | null>(() => {
    let maxDev: number | null = null;
    let maxDial: number | null = null;

    evaluation.runs.forEach((r) => {
      r.evaluations.forEach((p) => {
        if (p.deviationPercent !== null) {
          if (maxDev === null || Math.abs(p.deviationPercent) > Math.abs(maxDev)) {
            maxDev = p.deviationPercent;
            maxDial = p.dialSetting;
          }
        }
      });
    });

    if (maxDev !== null && maxDial !== null) {
      return { percent: maxDev, dial: maxDial };
    }
    return null;
  }, [evaluation.runs]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200">
        <div className="p-2 rounded-xl bg-[#09b0bb]/10 text-[#09b0bb] border border-[#09b0bb]/25">
          <ClipboardCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 m-0">
            Calibration Summary & Final Assessment
          </h2>
          <p className="text-xs text-slate-500 font-medium m-0">
            Overall status based on ISO 8835-4 tolerance standards (±{tolerance.percentage}%)
          </p>
        </div>
      </div>

      {/* Primary Status Card */}
      <div className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        !evaluation.hasMeasurements
          ? 'bg-slate-50 border-slate-200 text-slate-800'
          : evaluation.isPassed
          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
          : 'bg-rose-50/80 border-rose-300 text-rose-950'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl ${
            !evaluation.hasMeasurements
              ? 'bg-white text-slate-500 border border-slate-200 shadow-2xs'
              : evaluation.isPassed
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-2xs'
              : 'bg-rose-100 text-rose-700 border border-rose-300 shadow-2xs'
          }`}>
            {!evaluation.hasMeasurements ? (
              <Clock className="w-7 h-7" />
            ) : evaluation.isPassed ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : (
              <XCircle className="w-7 h-7" />
            )}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-bold opacity-75">
              Overall Vaporiser Performance Status
            </div>
            <div className="text-xl sm:text-2xl font-black tracking-tight">
              {!evaluation.hasMeasurements
                ? 'AWAITING TEST MEASUREMENTS'
                : evaluation.isPassed
                ? 'PASSED - APPROVED FOR CLINICAL USE'
                : 'FAILED - OUT OF SPECIFICATION'}
            </div>
            <div className="text-xs mt-1 text-slate-600 font-medium">
              {evaluation.summaryMessage}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex items-center gap-3 sm:border-l sm:border-slate-200 sm:pl-6">
          <div className="text-center">
            <div className="text-xs text-slate-500 font-semibold">Passed</div>
            <div className="text-lg font-bold text-emerald-600 font-mono">
              {evaluation.passedCount}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500 font-semibold">Failed</div>
            <div className="text-lg font-bold text-rose-600 font-mono">
              {evaluation.failedCount}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500 font-semibold">Pending</div>
            <div className="text-lg font-bold text-slate-600 font-mono">
              {evaluation.pendingCount}
            </div>
          </div>
        </div>
      </div>

      {/* Max Deviation & Standard Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="text-xs text-slate-600 flex items-center gap-1.5 font-semibold">
            <Percent className="w-3.5 h-3.5 text-[#09b0bb]" />
            Maximum Recorded Deviation
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            {maxDevInfo ? (
              <span className={Math.abs(maxDevInfo.percent) > tolerance.percentage ? 'text-rose-600' : 'text-emerald-600'}>
                {maxDevInfo.percent > 0 ? '+' : ''}{maxDevInfo.percent.toFixed(1)}%
                <span className="text-xs text-slate-500 font-sans font-medium ml-2">
                  (at {maxDevInfo.dial}% dial)
                </span>
              </span>
            ) : (
              <span className="text-slate-400 text-sm font-sans">No measurements</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Allowable limit: ±{tolerance.percentage}% (Absolute floor: ±{tolerance.absoluteFloor}%)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="text-xs text-slate-600 flex items-center gap-1.5 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-[#09b0bb]" />
            Standard Compliance
          </div>
          <div className="text-sm font-bold text-slate-900">
            ISO 8835-4 & ASTM F1161
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Veterinary Anaesthetic Gas Delivery Systems & Vaporiser Output Verification
          </div>
        </div>

      </div>

      {/* Technician Notes & Recommendations */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#09b0bb]" />
          Technician Inspection Remarks & Recommendations
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          placeholder="Enter notes on vaporiser leak check, interlock mechanism, wick/sight glass condition, zero-lock engage, or recommendations..."
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {[
            'Passed pressure leak test at 30 cmH2O.',
            'Selectatec interlock pins engage smoothly.',
            'Cagemount tapered fittings sealed tightly.',
            'Recalibration required: output concentration high.',
            'Vaporiser sight glass clear, zero-lock operational.'
          ].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                const updated = notes ? `${notes} ${preset}` : preset;
                onChangeNotes(updated);
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition cursor-pointer font-medium"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
