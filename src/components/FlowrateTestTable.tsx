import React, { useState } from 'react';
import { 
  Wind, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RotateCcw,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { DialPoint, RunEvaluation, TestRun, ToleranceConfig } from '../types';
import { evaluateRun } from '../utils/calculations';

interface FlowrateTestTableProps {
  runs: TestRun[];
  onChangeRuns: (updatedRuns: TestRun[]) => void;
  tolerance: ToleranceConfig;
  onChangeTolerance: (updatedTolerance: ToleranceConfig) => void;
}

export const FlowrateTestTable: React.FC<FlowrateTestTableProps> = ({
  runs,
  onChangeRuns,
  tolerance,
  onChangeTolerance
}) => {
  const [activeRunIndex, setActiveRunIndex] = useState(0);
  const [showToleranceSettings, setShowToleranceSettings] = useState(false);
  const [customDialInput, setCustomDialInput] = useState('');

  const currentRun = runs[activeRunIndex] || runs[0];
  const runEvaluation: RunEvaluation = evaluateRun(currentRun, tolerance);

  // Common carrier flowrate presets
  const standardFlowrates = [0.5, 1.0, 2.0, 4.0, 5.0, 8.0];

  const handleUpdateCurrentRunFlowrate = (flow: number) => {
    const updated = runs.map((r, i) => (i === activeRunIndex ? { ...r, flowrate: flow } : r));
    onChangeRuns(updated);
  };

  const handleUpdateCarrierGas = (carrier: string) => {
    const updated = runs.map((r, i) => (i === activeRunIndex ? { ...r, carrierGas: carrier } : r));
    onChangeRuns(updated);
  };

  const handleUpdateMeasurement = (dialId: string, value: string) => {
    const numericValue = value === '' ? undefined : parseFloat(value);
    const updatedPoints = currentRun.dialPoints.map((p) =>
      p.id === dialId ? { ...p, measured: isNaN(numericValue as number) ? undefined : numericValue } : p
    );

    const updated = runs.map((r, i) => (i === activeRunIndex ? { ...r, dialPoints: updatedPoints } : r));
    onChangeRuns(updated);
  };

  const handleStepValue = (dialId: string, delta: number) => {
    const point = currentRun.dialPoints.find((p) => p.id === dialId);
    if (!point) return;
    const currentVal = point.measured ?? point.dialSetting;
    const newVal = Math.max(0, Math.round((currentVal + delta) * 100) / 100);
    handleUpdateMeasurement(dialId, newVal.toString());
  };

  const handleSetExact = (dialId: string, exactVal: number) => {
    handleUpdateMeasurement(dialId, exactVal.toString());
  };

  const handleAddRun = () => {
    const nextFlow = runs.length === 1 ? 4.0 : runs.length === 2 ? 2.0 : 0.5;
    const newRun: TestRun = {
      id: `run-${Date.now()}`,
      flowrate: nextFlow,
      carrierGas: currentRun.carrierGas || '100% Oxygen (O2)',
      // Copy dial setting templates with blank measurements
      dialPoints: currentRun.dialPoints.map((p) => ({
        id: `dial-${p.dialSetting}-${Date.now()}`,
        dialSetting: p.dialSetting,
        measured: undefined
      }))
    };
    const updated = [...runs, newRun];
    onChangeRuns(updated);
    setActiveRunIndex(updated.length - 1);
  };

  const handleRemoveRun = (index: number) => {
    if (runs.length <= 1) return;
    const updated = runs.filter((_, i) => i !== index);
    onChangeRuns(updated);
    setActiveRunIndex(Math.max(0, index - 1));
  };

  const handleClearRunMeasurements = () => {
    const updatedPoints = currentRun.dialPoints.map((p) => ({ ...p, measured: undefined }));
    const updated = runs.map((r, i) => (i === activeRunIndex ? { ...r, dialPoints: updatedPoints } : r));
    onChangeRuns(updated);
  };

  const handleAddCustomDial = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customDialInput);
    if (isNaN(val) || val <= 0) return;
    if (currentRun.dialPoints.some((p) => p.dialSetting === val)) {
      alert(`Dial setting ${val}% already exists in this run.`);
      return;
    }
    const newPoint: DialPoint = {
      id: `dial-${val}-${Date.now()}`,
      dialSetting: val,
      measured: undefined
    };
    // Insert sorted
    const updatedPoints = [...currentRun.dialPoints, newPoint].sort(
      (a, b) => a.dialSetting - b.dialSetting
    );
    const updated = runs.map((r, i) => (i === activeRunIndex ? { ...r, dialPoints: updatedPoints } : r));
    onChangeRuns(updated);
    setCustomDialInput('');
  };

  const handleDeleteDialPoint = (dialId: string) => {
    if (currentRun.dialPoints.length <= 1) return;
    const updatedPoints = currentRun.dialPoints.filter((p) => p.id !== dialId);
    const updated = runs.map((r, i) => (i === activeRunIndex ? { ...r, dialPoints: updatedPoints } : r));
    onChangeRuns(updated);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      
      {/* Top Header & Run Navigation */}
      <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white m-0">
                Vaporiser Output Concentration Testing
              </h2>
              <p className="text-xs text-slate-400 m-0">
                Dial settings 0.2%, 0.6%, 1%, 2%, 3%, 4%, 5% with ISO ±15% tolerance analysis
              </p>
            </div>
          </div>

          {/* Tolerance Config Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowToleranceSettings(!showToleranceSettings)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tolerance (±{tolerance.percentage}%)</span>
            </button>
            <button
              type="button"
              onClick={handleClearRunMeasurements}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-medium border border-slate-700/80 transition cursor-pointer"
              title="Clear measured values for this run"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Run</span>
            </button>
          </div>

        </div>

        {/* Collapsible Tolerance Settings */}
        {showToleranceSettings && (
          <div className="mt-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Tolerance Mode
              </label>
              <select
                value={tolerance.mode}
                onChange={(e) => onChangeTolerance({ ...tolerance, mode: e.target.value as any })}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="iso">ISO Standard (Relative % + Absolute Floor)</option>
                <option value="relative">Strict Relative % (No Floor)</option>
                <option value="custom">Custom Threshold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Allowable Tolerance % (Default: ±15%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={tolerance.percentage}
                  onChange={(e) => onChangeTolerance({ ...tolerance, percentage: parseFloat(e.target.value) || 15 })}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
                <span className="text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Absolute Floor % (for 0.2 / 0.6)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={tolerance.absoluteFloor}
                  onChange={(e) => onChangeTolerance({ ...tolerance, absoluteFloor: parseFloat(e.target.value) || 0.15 })}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
                <span className="text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>
        )}

        {/* Multi-flowrate Runs Tabs */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-800/80 overflow-x-auto gap-2">
          
          <div className="flex items-center gap-2">
            {runs.map((run, idx) => {
              const evalRun = evaluateRun(run, tolerance);
              const isActive = idx === activeRunIndex;
              return (
                <div key={run.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setActiveRunIndex(idx)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <span>Run {idx + 1} ({run.flowrate} L/min)</span>
                    {evalRun.hasMeasurements && (
                      <span className={`w-2 h-2 rounded-full ${evalRun.isPassed ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'}`} />
                    )}
                  </button>
                  {runs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRun(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 ml-1 rounded"
                      title="Remove this flowrate run"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add Flowrate Run Button */}
            <button
              type="button"
              onClick={handleAddRun}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 text-xs font-medium border border-dashed border-slate-700 transition cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Flowrate Run</span>
            </button>
          </div>

          {/* Quick summary badge for current run */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0 text-xs">
            <span className="text-slate-400">Run Status:</span>
            {runEvaluation.hasMeasurements ? (
              <span className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1 ${
                runEvaluation.isPassed 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}>
                {runEvaluation.isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {runEvaluation.isPassed ? 'RUN PASSED' : 'RUN FAILED'}
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Pending Input
              </span>
            )}
          </div>

        </div>

        {/* Carrier Gas & Flowrate Controls for Active Run */}
        <div className="mt-4 p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          
          {/* Flowrate setting */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-cyan-400" /> Carrier Flowrate:
            </span>
            <div className="flex items-center gap-1">
              {standardFlowrates.map((fl) => (
                <button
                  key={fl}
                  type="button"
                  onClick={() => handleUpdateCurrentRunFlowrate(fl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    currentRun.flowrate === fl
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {fl} L/min
                </button>
              ))}
            </div>
            
            {/* Custom flowrate numeric */}
            <div className="flex items-center gap-1 ml-1">
              <input
                type="number"
                min="0.1"
                max="20"
                step="0.1"
                value={currentRun.flowrate}
                onChange={(e) => handleUpdateCurrentRunFlowrate(parseFloat(e.target.value) || 1.0)}
                className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white text-center font-mono"
              />
              <span className="text-xs text-slate-400">L/min</span>
            </div>
          </div>

          {/* Carrier Gas Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Carrier Gas:</span>
            <select
              value={currentRun.carrierGas}
              onChange={(e) => handleUpdateCarrierGas(e.target.value)}
              className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
            >
              <option value="100% Oxygen (O2)">100% Oxygen (O2)</option>
              <option value="Medical Air">Medical Air</option>
              <option value="50% O2 / 50% N2O">50% O2 / 50% N2O</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Dial Setting (%)</th>
              <th className="py-3.5 px-4">Measured Output (%)</th>
              <th className="py-3.5 px-4 hidden md:table-cell">Allowable Range (ISO)</th>
              <th className="py-3.5 px-4">Deviation / Error</th>
              <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
              <th className="py-3.5 px-2 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {runEvaluation.evaluations.map((evalPoint) => {
              const point = currentRun.dialPoints.find((p) => p.dialSetting === evalPoint.dialSetting)!;
              const hasVal = evalPoint.measured !== null;
              const isPass = evalPoint.status === 'PASS';
              const isFail = evalPoint.status === 'FAIL';

              return (
                <tr 
                  key={point.id}
                  className={`transition-colors ${
                    isFail 
                      ? 'bg-rose-950/20 hover:bg-rose-950/30' 
                      : isPass 
                      ? 'hover:bg-slate-800/30' 
                      : 'hover:bg-slate-800/20'
                  }`}
                >
                  
                  {/* Dial Setting Column */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-12 py-1 rounded-lg bg-slate-800 border border-slate-700 text-sm font-bold text-cyan-400 font-mono">
                        {point.dialSetting.toFixed(point.dialSetting < 1 ? 1 : 1)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSetExact(point.id, point.dialSetting)}
                        className="text-[11px] text-slate-500 hover:text-cyan-400 transition"
                        title={`Quick set measured = ${point.dialSetting}%`}
                      >
                        = dial
                      </button>
                    </div>
                  </td>

                  {/* Measured Concentration Input */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 max-w-[200px]">
                      <button
                        type="button"
                        onClick={() => handleStepValue(point.id, -0.1)}
                        className="w-7 h-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center justify-center border border-slate-700 transition"
                        title="-0.1%"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="30"
                        placeholder="e.g. 0.00"
                        value={point.measured !== undefined ? point.measured : ''}
                        onChange={(e) => handleUpdateMeasurement(point.id, e.target.value)}
                        className={`w-24 px-2 py-1.5 rounded-lg border text-sm font-mono font-bold text-center transition focus:outline-none focus:ring-2 ${
                          isFail
                            ? 'bg-rose-950/40 border-rose-500 text-rose-300 focus:ring-rose-500'
                            : isPass
                            ? 'bg-slate-800 border-emerald-500/60 text-emerald-300 focus:ring-emerald-500'
                            : 'bg-slate-800 border-slate-700 text-white focus:ring-cyan-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleStepValue(point.id, 0.1)}
                        className="w-7 h-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center justify-center border border-slate-700 transition"
                        title="+0.1%"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* Allowable Range Column */}
                  <td className="py-3.5 px-4 hidden md:table-cell text-xs text-slate-400 font-mono">
                    <span className="text-slate-300 font-medium">
                      {evalPoint.minAllowable.toFixed(2)}%
                    </span>
                    <span className="text-slate-600 mx-1.5">to</span>
                    <span className="text-slate-300 font-medium">
                      {evalPoint.maxAllowable.toFixed(2)}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      (±{tolerance.percentage}%, floor {tolerance.absoluteFloor}%)
                    </span>
                  </td>

                  {/* Deviation / Error Column */}
                  <td className="py-3.5 px-4 text-xs font-mono">
                    {hasVal && evalPoint.deviationPercent !== null ? (
                      <div className="space-y-0.5">
                        <span className={`font-bold ${
                          isFail ? 'text-rose-400' : Math.abs(evalPoint.deviationPercent) > 10 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {evalPoint.deviationPercent > 0 ? '+' : ''}{evalPoint.deviationPercent.toFixed(1)}%
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          ({evalPoint.deviation! > 0 ? '+' : ''}{evalPoint.deviation!.toFixed(2)}% absolute)
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>

                  {/* Status Badge Column */}
                  <td className="py-3.5 px-4 sm:px-6 text-center">
                    {isPass && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                      </span>
                    )}
                    {isFail && (
                      <div className="inline-flex flex-col items-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                          <XCircle className="w-3.5 h-3.5" /> FAIL
                        </span>
                        {evalPoint.reason && (
                          <span className="text-[10px] text-rose-400 mt-1 max-w-[140px] truncate" title={evalPoint.reason}>
                            {evalPoint.reason}
                          </span>
                        )}
                      </div>
                    )}
                    {!hasVal && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-500 border border-slate-700">
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Delete custom point button (only if not standard) */}
                  <td className="py-3.5 px-2 text-right">
                    {![0.2, 0.6, 1, 2, 3, 4, 5].includes(point.dialSetting) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDialPoint(point.id)}
                        className="p-1 text-slate-600 hover:text-rose-400 rounded transition"
                        title="Remove custom dial point"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Custom Dial Setting Footer */}
      <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <form onSubmit={handleAddCustomDial} className="flex items-center gap-2">
          <span className="text-slate-400">Add Extra Dial Setting:</span>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="25"
            placeholder="e.g. 6.0"
            value={customDialInput}
            onChange={(e) => setCustomDialInput(e.target.value)}
            className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-medium transition cursor-pointer"
          >
            + Add %
          </button>
        </form>

        <p className="text-[11px] text-slate-500 m-0">
          Tip: Standard dial percentages (0.2, 0.6, 1, 2, 3, 4, 5) are preserved.
        </p>
      </div>

    </div>
  );
};
