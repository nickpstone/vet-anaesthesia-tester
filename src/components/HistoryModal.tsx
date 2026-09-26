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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#09b0bb]" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 m-0">
              Saved Calibration Records ({reports.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Reports */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <History className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">No saved test reports yet.</p>
              <p className="text-xs text-slate-500 mt-1">
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
                  className="bg-slate-50 border border-slate-200 hover:border-[#09b0bb]/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                        overallPassed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-rose-50 text-rose-700 border border-rose-300'
                      }`}>
                        {overallPassed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {overallPassed ? 'PASS' : 'FAIL'}
                      </span>
                      <span className="font-bold text-sm text-slate-900">
                        {machineInfo.clinicName || 'Unnamed Clinic'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Vap: <strong className="text-slate-800">{machineInfo.vaporiserModel}</strong> (S/N: {machineInfo.vaporiserSerial || 'N/A'})</span>
                      <span>Agent: <strong className="text-slate-800">{machineInfo.agent}</strong></span>
                      <span>Mount: <strong className="text-slate-800">{machineInfo.mountType}</strong></span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> Tested: {machineInfo.testDate || date}
                      </span>
                      {machineInfo.technicianName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" /> {machineInfo.technicianName}
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
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#09b0bb]/10 hover:bg-[#09b0bb]/20 text-[#077a83] border border-[#09b0bb]/30 text-xs font-bold transition cursor-pointer"
                    >
                      <span>Load</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteReport(report.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
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
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
