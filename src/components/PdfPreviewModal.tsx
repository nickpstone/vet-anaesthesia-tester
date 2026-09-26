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

  useEffect(() => {
    let active = true;
    if (isOpen) {
      setLoading(true);
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white m-0 truncate">
              PDF Calibration Certificate Preview
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <span className="text-sm font-medium">Generating PDF document...</span>
            </div>
          ) : pdfUrl ? (
            <iframe
              id="pdf-preview-frame"
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Report Preview"
            />
          ) : (
            <div className="text-rose-400 text-sm">Failed to generate PDF preview.</div>
          )}
        </div>

      </div>
    </div>
  );
};
