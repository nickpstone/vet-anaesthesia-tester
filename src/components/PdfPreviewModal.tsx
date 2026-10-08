import React, { useEffect, useState } from 'react';
import { X, Download, Printer, Loader2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { downloadPdfBlob } from '../utils/emailShare';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDocPromise: () => Promise<jsPDF>;
  filename: string;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  pdfDocPromise,
  filename
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (isOpen) {
      setLoading(true);
      setError('');
      pdfDocPromise()
        .then((doc) => {
          if (!active) return;
          const outputBlob = doc.output('blob');
          const url = URL.createObjectURL(outputBlob);
          setBlob(outputBlob);
          setPdfUrl(url);
          setLoading(false);
        })
        .catch((err) => {
          if (!active) return;
          setError(err instanceof Error ? err.message : 'Failed to generate PDF preview.');
          console.error('Failed to render PDF preview', err);
          setLoading(false);
        });
    }

    return () => {
      active = false;
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (blob) {
      downloadPdfBlob(blob, filename);
    }
  };

  const handlePrint = () => {
    const iframe = document.getElementById('pdf-preview-frame') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#09b0bb]" />
            <h2 className="text-base font-bold text-slate-900 m-0 truncate">
              PDF Calibration Certificate Preview
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#09b0bb] hover:bg-[#038c97] text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-200 relative overflow-hidden flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-slate-600">
              <Loader2 className="w-8 h-8 text-[#09b0bb] animate-spin" />
              <span className="text-sm font-semibold">Generating PDF document...</span>
            </div>
          ) : pdfUrl ? (
            <iframe
              id="pdf-preview-frame"
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Report Preview"
            />
          ) : (
            <div className="text-rose-600 text-sm font-semibold">{error || 'Failed to generate PDF preview.'}</div>
          )}
        </div>

      </div>
    </div>
  );
};
