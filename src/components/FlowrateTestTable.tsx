import React, { useState } from 'react';
import { 
  Wind, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw,
  Sliders
} from 'lucide-react';
import { DialPoint, RunEvaluation, TestRun, ToleranceConfig } from '../types';
import { evaluateRun, evaluatePoint } from '../utils/calculations';

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
  const [editingDialValues, setEditingDialValues] = useState<Record<string, string>>({});

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

  // Adjust dial setting (e.g. changing 0.2 to 0.25, 0.4, 0.5 or 0.6 to 0.5, 0.8)
  const handleUpdateDialSetting = (dialId: string, newSettingValue: number) => {
    if (isNaN(newSettingValue) || newSettingValue <= 0) return;
    const roundedSetting = Math.round(newSettingValue * 100) / 100;

    const point = currentRun.dialPoints.find((p) => p.id === dialId);
    if (!point) return;
    const oldSetting = point.dialSetting;

    if (Math.abs(oldSetting - roundedSetting) < 0.001) {
      setEditingDialValues((prev) => {
        const next = { ...prev };
        delete next[dialId];
        return next;
      });
      return;
    }

    // Check duplicate
    if (currentRun.dialPoints.some((p) => p.id !== dialId && Math.abs(p.dialSetting - roundedSetting) < 0.001)) {
      alert(`Dial setting ${roundedSetting}% already exists in this test run.`);
      return;
    }

    // Update across all runs to keep machine testing synchronized
    const updatedRuns = runs.map((run) => {
      const updatedPoints = run.dialPoints.map((p) => {
        if (p.id === dialId || Math.abs(p.dialSetting - oldSetting) < 0.001) {
          return {
            ...p,
            dialSetting: roundedSetting
          };
        }
        return p;
      });
      return {
        ...run,
        dialPoints: updatedPoints.sort((a, b) => a.dialSetting - b.dialSetting)
      };
    });

    onChangeRuns(updatedRuns);
    setEditingDialValues((prev) => {
      const next = { ...prev };
      delete next[dialId];
      return next;
    });
  };

  const handleDialInputChange = (dialId: string, rawVal: string) => {
    setEditingDialValues((prev) => ({ ...prev, [dialId]: rawVal }));
  };

  const handleDialInputCommit = (dialId: string) => {
    const raw = editingDialValues[dialId];
    if (raw === undefined || raw.trim() === '') {
      setEditingDialValues((prev) => {
        const next = { ...prev };
        delete next[dialId];
        return next;
      });
      return;
    }
    const val = parseFloat(raw);
    if (!isNaN(val) && val > 0) {
      handleUpdateDialSetting(dialId, val);
    } else {
      setEditingDialValues((prev) => {
        const next = { ...prev };
        delete next[dialId];
        return next;
      });
    }
  };

  const handleResetDefaultDials = () => {
    if (window.confirm('Reset dial settings back to standard percentages (0.2%, 0.6%, 1%, 2%, 3%, 4%, 5%)?')) {
      const standardDials = [0.2, 0.6, 1.0, 2.0, 3.0, 4.0, 5.0];
      const updatedRuns = runs.map((run) => ({
        ...run,
        dialPoints: standardDials.map((dial) => {
          const existing = run.dialPoints.find((p) => Math.abs(p.dialSetting - dial) < 0.001);
          return {
            id: existing ? existing.id : `dial-${dial}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            dialSetting: dial,
            measured: existing?.measured
          };
        })
      }));
      onChangeRuns(updatedRuns);
      setEditingDialValues({});
    }
  };

  const handleAddRun = () => {
    const nextFlow = runs.length === 1 ? 4.0 : runs.length === 2 ? 2.0 : 0.5;
    const newRun: TestRun = {
      id: `run-${Date.now()}`,
      flowrate: nextFlow,
      carrierGas: currentRun.carrierGas || '100% Oxygen (O2)',
      // Copy dial setting templates with blank measurements
      dialPoints: currentRun.dialPoints.map((p) => ({
        id: `dial-${p.dialSetting}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
    const rounded = Math.round(val * 100) / 100;
    if (currentRun.dialPoints.some((p) => Math.abs(p.dialSetting - rounded) < 0.001)) {
      alert(`Dial setting ${rounded}% already exists in this run.`);
      return;
    }
    const newPointId = `dial-${rounded}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const updated = runs.map((r) => {
      const newPoint: DialPoint = {
        id: newPointId,
        dialSetting: rounded,
        measured: undefined
      };
      return {
        ...r,
        dialPoints: [...r.dialPoints, newPoint].sort((a, b) => a.dialSetting - b.dialSetting)
      };
    });
    onChangeRuns(updated);
    setCustomDialInput('');
  };

  const handleDeleteDialPoint = (dialId: string) => {
    if (currentRun.dialPoints.length <= 1) return;
    const point = currentRun.dialPoints.find((p) => p.id === dialId);
    if (!point) return;
    const settingToDelete = point.dialSetting;

    const updated = runs.map((r) => ({
      ...r,
      dialPoints: r.dialPoints.filter((p) => p.id !== dialId && Math.abs(p.dialSetting - settingToDelete) >= 0.001)
    }));
    onChangeRuns(updated);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      
      {/* Top Header & Run Navigation */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#09b0bb]/10 text-[#09b0bb] border border-[#09b0bb]/25">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 m-0">
                Vaporiser Output Concentration Testing
              </h2>
              <p className="text-xs text-slate-500 font-medium m-0">
                Dial settings 0.2%, 0.6%, 1%, 2%, 3%, 4%, 5% with ISO ±15% tolerance analysis
              </p>
            </div>
          </div>

          {/* Tolerance Config Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowToleranceSettings(!showToleranceSettings)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition cursor-pointer shadow-2xs"
            >
              <Sliders className="w-3.5 h-3.5 text-[#09b0bb]" />
              <span>Tolerance (±{tolerance.percentage}%)</span>
            </button>
            <button
              type="button"
              onClick={handleClearRunMeasurements}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold border border-slate-300 transition cursor-pointer shadow-2xs"
              title="Clear measured values for this run"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Run</span>
            </button>
          </div>

        </div>

        {/* Collapsible Tolerance Settings */}
        {showToleranceSettings && (
          <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150 shadow-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tolerance Mode
              </label>
              <select
                value={tolerance.mode}
                onChange={(e) => onChangeTolerance({ ...tolerance, mode: e.target.value as any })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#09b0bb]"
              >
                <option value="iso">ISO Standard (Relative % + Absolute Floor)</option>
                <option value="relative">Strict Relative % (No Floor)</option>
                <option value="custom">Custom Threshold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
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
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#09b0bb]"
                />
                <span className="text-xs text-slate-500 font-bold">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Absolute Floor % (for low dials: 0.2, 0.6, etc.)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={tolerance.absoluteFloor}
                  onChange={(e) => onChangeTolerance({ ...tolerance, absoluteFloor: parseFloat(e.target.value) || 0.15 })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#09b0bb]"
                />
                <span className="text-xs text-slate-500 font-bold">%</span>
              </div>
            </div>
          </div>
        )}

        {/* Multi-flowrate Runs Tabs */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200 overflow-x-auto gap-2">
          
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
                        ? 'bg-[#09b0bb]/10 text-[#077a83] border-[#09b0bb] font-bold shadow-2xs'
                        : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <span>Run {idx + 1} ({run.flowrate} L/min)</span>
                    {evalRun.hasMeasurements && (
                      <span className={`w-2 h-2 rounded-full ${evalRun.isPassed ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                    )}
                  </button>
                  {runs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRun(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 ml-1 rounded cursor-pointer"
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#077a83] hover:text-[#09b0bb] text-xs font-semibold border border-dashed border-slate-300 transition cursor-pointer whitespace-nowrap shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Flowrate Run</span>
            </button>
          </div>

          {/* Quick summary badge for current run */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0 text-xs">
            <span className="text-slate-500 font-medium">Run Status:</span>
            {runEvaluation.hasMeasurements ? (
              <span className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1 ${
                runEvaluation.isPassed 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                  : 'bg-rose-50 text-rose-700 border border-rose-300'
              }`}>
                {runEvaluation.isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {runEvaluation.isPassed ? 'RUN PASSED' : 'RUN FAILED'}
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md bg-white text-slate-500 border border-slate-200 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Pending Input
              </span>
            )}
          </div>

        </div>

        {/* Carrier Gas & Flowrate Controls for Active Run */}
        <div className="mt-4 p-3.5 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          
          {/* Flowrate setting */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-[#09b0bb]" /> Carrier Flowrate:
            </span>
            <div className="flex items-center gap-1">
              {standardFlowrates.map((fl) => (
                <button
                  key={fl}
                  type="button"
                  onClick={() => handleUpdateCurrentRunFlowrate(fl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    currentRun.flowrate === fl
                      ? 'bg-[#09b0bb] hover:bg-[#038c97] text-white shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs'
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
                className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 text-center font-mono focus:outline-none focus:ring-1 focus:ring-[#09b0bb]"
              />
              <span className="text-xs text-slate-500 font-medium">L/min</span>
            </div>
          </div>

          {/* Carrier Gas Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-semibold">Carrier Gas:</span>
            <select
              value={currentRun.carrierGas}
              onChange={(e) => handleUpdateCarrierGas(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#09b0bb]"
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
            <tr className="border-b border-slate-200 bg-slate-100 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Dial Setting (%)</th>
              <th className="py-3.5 px-4">Measured Output (%)</th>
              <th className="py-3.5 px-4 hidden md:table-cell">Allowable Range (ISO)</th>
              <th className="py-3.5 px-4">Deviation / Error</th>
              <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
              <th className="py-3.5 px-2 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {currentRun.dialPoints.map((point, idx) => {
              const evalPoint = runEvaluation.evaluations[idx] || evaluatePoint(point.dialSetting, point.measured, tolerance);
              const hasVal = evalPoint.measured !== null;
              const isPass = evalPoint.status === 'PASS';
              const isFail = evalPoint.status === 'FAIL';

              return (
                <tr 
                  key={point.id}
                  className={`transition-colors ${
                    isFail 
                      ? 'bg-rose-50/70 hover:bg-rose-50/90' 
                      : isPass 
                      ? 'hover:bg-slate-50/80' 
                      : 'hover:bg-slate-50/50'
                  }`}
                >
                  
                  {/* Dial Setting Column */}
                  <td className="py-3 px-4 sm:px-6 align-top">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            step="0.05"
                            min="0.05"
                            max="30"
                            value={editingDialValues[point.id] !== undefined ? editingDialValues[point.id] : point.dialSetting}
                            onChange={(e) => handleDialInputChange(point.id, e.target.value)}
                            onBlur={() => handleDialInputCommit(point.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                            }}
                            className="w-16 px-2 py-1 bg-white hover:bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#09b0bb] rounded-lg text-sm font-bold text-[#077a83] font-mono text-center focus:outline-none focus:ring-2 focus:ring-[#09b0bb] transition shadow-2xs"
                            title="Click or type to adjust this dial setting"
                          />
                          <span className="text-xs text-slate-500 font-bold ml-1">%</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSetExact(point.id, point.dialSetting)}
                          className="text-[11px] text-slate-500 hover:text-[#09b0bb] transition cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-100 font-medium"
                          title={`Quick set measured = ${point.dialSetting}%`}
                        >
                          = dial
                        </button>
                      </div>

                      {/* Quick Presets for Slot 1 (Default: 0.2%) */}
                      {idx === 0 && (
                        <div className="flex items-center gap-1 flex-wrap pt-0.5">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">0.2 Options:</span>
                          {[0.1, 0.2, 0.25, 0.4, 0.5].map((pval) => (
                            <button
                              key={pval}
                              type="button"
                              onClick={() => handleUpdateDialSetting(point.id, pval)}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition cursor-pointer ${
                                Math.abs(point.dialSetting - pval) < 0.001
                                  ? 'bg-[#09b0bb]/15 text-[#077a83] font-bold border border-[#09b0bb]/50 shadow-2xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                              title={`Set dial to ${pval}%`}
                            >
                              {pval}%
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Quick Presets for Slot 2 (Default: 0.6%) */}
                      {idx === 1 && (
                        <div className="flex items-center gap-1 flex-wrap pt-0.5">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">0.6 Options:</span>
                          {[0.4, 0.5, 0.6, 0.75, 0.8].map((pval) => (
                            <button
                              key={pval}
                              type="button"
                              onClick={() => handleUpdateDialSetting(point.id, pval)}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition cursor-pointer ${
                                Math.abs(point.dialSetting - pval) < 0.001
                                  ? 'bg-[#09b0bb]/15 text-[#077a83] font-bold border border-[#09b0bb]/50 shadow-2xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                              title={`Set dial to ${pval}%`}
                            >
                              {pval}%
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Measured Concentration Input */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 max-w-[200px]">
                      <button
                        type="button"
                        onClick={() => handleStepValue(point.id, -0.1)}
                        className="w-7 h-8 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs flex items-center justify-center border border-slate-300 transition cursor-pointer shadow-2xs"
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
                            ? 'bg-rose-50 border-rose-400 text-rose-700 focus:ring-rose-400'
                            : isPass
                            ? 'bg-emerald-50/50 border-emerald-400 text-emerald-800 focus:ring-emerald-400'
                            : 'bg-white border-slate-300 text-slate-900 focus:ring-[#09b0bb]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleStepValue(point.id, 0.1)}
                        className="w-7 h-8 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs flex items-center justify-center border border-slate-300 transition cursor-pointer shadow-2xs"
                        title="+0.1%"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* Allowable Range Column */}
                  <td className="py-3.5 px-4 hidden md:table-cell text-xs text-slate-600 font-mono">
                    <span className="text-slate-900 font-bold">
                      {evalPoint.minAllowable.toFixed(2)}%
                    </span>
                    <span className="text-slate-400 mx-1.5">to</span>
                    <span className="text-slate-900 font-bold">
                      {evalPoint.maxAllowable.toFixed(2)}%
                    </span>
                    <span className="text-[10px] text-slate-500 block font-sans">
                      (±{tolerance.percentage}%, floor {tolerance.absoluteFloor}%)
                    </span>
                  </td>

                  {/* Deviation / Error Column */}
                  <td className="py-3.5 px-4 text-xs font-mono">
                    {hasVal && evalPoint.deviationPercent !== null ? (
                      <div className="space-y-0.5">
                        <span className={`font-bold ${
                          isFail ? 'text-rose-600' : Math.abs(evalPoint.deviationPercent) > 10 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {evalPoint.deviationPercent > 0 ? '+' : ''}{evalPoint.deviationPercent.toFixed(1)}%
                        </span>
                        <span className="text-[11px] text-slate-500 block font-sans font-medium">
                          ({evalPoint.deviation! > 0 ? '+' : ''}{evalPoint.deviation!.toFixed(2)}% absolute)
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Status Badge Column */}
                  <td className="py-3.5 px-4 sm:px-6 text-center">
                    {isPass && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                      </span>
                    )}
                    {isFail && (
                      <div className="inline-flex flex-col items-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 animate-pulse">
                          <XCircle className="w-3.5 h-3.5" /> FAIL
                        </span>
                        {evalPoint.reason && (
                          <span className="text-[10px] text-rose-600 font-medium mt-1 max-w-[140px] truncate" title={evalPoint.reason}>
                            {evalPoint.reason}
                          </span>
                        )}
                      </div>
                    )}
                    {!hasVal && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Delete point button */}
                  <td className="py-3 px-2 text-right align-top">
                    {currentRun.dialPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDialPoint(point.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                        title={`Remove ${point.dialSetting}% dial point`}
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

      {/* Add Custom Dial Setting & Reset Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <form onSubmit={handleAddCustomDial} className="flex items-center gap-2">
          <span className="text-slate-700 font-semibold">Add Extra Dial Setting:</span>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="25"
            placeholder="e.g. 6.0"
            value={customDialInput}
            onChange={(e) => setCustomDialInput(e.target.value)}
            className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#09b0bb]"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded-lg bg-white hover:bg-slate-50 text-[#077a83] border border-slate-300 font-semibold transition cursor-pointer shadow-2xs"
          >
            + Add %
          </button>
        </form>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaultDials}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Reset to standard default dial percentages (0.2, 0.6, 1, 2, 3, 4, 5%)"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Reset Standard Dials</span>
          </button>
          <p className="text-[11px] text-slate-500 m-0 hidden sm:block font-medium">
            Tip: Adjust 0.2% and 0.6% using presets or direct input to match your vaporiser.
          </p>
        </div>
      </div>

    </div>
  );
};
