import React, { useState } from 'react';
import { 
  Mail, 
  Download, 
  Eye, 
  BookmarkCheck, 
  Loader2, 
  Share2, 
  Printer,
  Sparkles,
  Check
} from 'lucide-react';
import { OverallEvaluation } from '../types';

interface ActionToolbarProps {
  onEmail: () => Promise<void>;
  onDownloadPdf: () => Promise<void>;
  onPreviewPdf: () => void;
  onSaveReport: () => void;
  evaluation: OverallEvaluation;
  isGeneratingPdf: boolean;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onEmail,
  onDownloadPdf,
  onPreviewPdf,
  onSaveReport,
  evaluation,
  isGeneratingPdf
}) => {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    onSaveReport();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="sticky bottom-0 z-30 bg-white/95 border-t border-slate-200 p-4 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Status Reminder */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Current Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              !evaluation.hasMeasurements
                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                : evaluation.isPassed
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-rose-50 text-rose-700 border border-rose-300'
            }`}>
              {!evaluation.hasMeasurements
                ? 'Pending Input'
                : evaluation.isPassed
                ? 'PASSED'
                : 'FAILED'}
            </span>
          </div>
          
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition cursor-pointer shadow-2xs"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Saved!</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-[#09b0bb]" />
                <span>Save to History</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Primary PDF & Email Actions */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end flex-wrap">
          
          {/* Preview Button */}
          <button
            type="button"
            onClick={onPreviewPdf}
            disabled={isGeneratingPdf}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-300 transition cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Preview formatted PDF certificate"
          >
            <Eye className="w-4 h-4 text-[#09b0bb]" />
            <span>Preview PDF</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-300 transition cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Download PDF to computer / device"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download PDF</span>
          </button>

          {/* THE PRIMARY EMAIL ACTION */}
          <button
            type="button"
            onClick={onEmail}
            disabled={isGeneratingPdf}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-lg transition cursor-pointer disabled:opacity-50 ${
              !evaluation.isPassed && evaluation.hasMeasurements
                ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-600/30'
                : 'bg-gradient-to-r from-[#09b0bb] to-[#038c97] hover:from-[#0abecb] hover:to-[#049ca8] shadow-[#09b0bb]/25'
            }`}
            title="Generate formatted PDF certificate and open Email / Share sheet"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing PDF...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Email PDF Report</span>
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
};
