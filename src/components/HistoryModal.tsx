import React from 'react';
import { X, History, CheckCircle2, XCircle, Trash2, ArrowUpRight, Calendar, User } from 'lucide-react';
import { SavedReport } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: SavedReport[];
  onLoadReport: (report: SavedReport) => void;
  onDeleteReport: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  reports,
  onLoadReport,
  onDeleteReport
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white m-0">
              Saved Calibration Records ({reports.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Reports */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No saved test reports yet.</p>
              <p className="text-xs text-slate-600 mt-1">
                Completed tests can be saved using the "Save to History" button.
              </p>
            </div>
          ) : (
            reports.map((report) => {
              const { machineInfo, overallPassed, runs } = report;
              const date = new Date(report.timestamp).toLocaleDateString();

              return (
                <div
                  key={report.id}
                  className="bg-slate-800/50 border border-slate-700/80 hover:border-slate-600 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                        overallPassed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}>
                        {overallPassed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {overallPassed ? 'PASS' : 'FAIL'}
                      </span>
                      <span className="font-bold text-sm text-white">
                        {machineInfo.clinicName || 'Unnamed Clinic'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Vap: <strong>{machineInfo.vaporiserModel}</strong> (S/N: {machineInfo.vaporiserSerial || 'N/A'})</span>
                      <span>Agent: <strong>{machineInfo.agent}</strong></span>
                      <span>Mount: <strong>{machineInfo.mountType}</strong></span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Tested: {machineInfo.testDate || date}
                      </span>
                      {machineInfo.technicianName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {machineInfo.technicianName}
                        </span>
                      )}
                      <span>{runs.length} Run(s)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadReport(report);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition cursor-pointer"
                    >
                      <span>Load</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteReport(report.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
