import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, Building, Phone, Mail, Award, Check } from 'lucide-react';
import { CompanyProfile } from '../types';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CompanyProfile;
  onSave: (updated: CompanyProfile) => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [formData, setFormData] = useState<CompanyProfile>(profile);
  const [dragActive, setDragActive] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({ ...prev, logoDataUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoDataUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white m-0">
              Testing Company & Logo Setup
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-xs text-slate-400 m-0">
            Upload your calibration company logo and details. These will be automatically stamped on every PDF certificate and stored in your device's browser.
          </p>

          {/* Logo Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Company Logo (Appears on PDF Report)
            </label>
            
            {formData.logoDataUrl ? (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                <div className="w-28 h-16 bg-white rounded-lg p-2 flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
                  <img
                    src={formData.logoDataUrl}
                    alt="Uploaded Logo Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-emerald-400 flex items-center gap-1.5 m-0">
                    <Check className="w-4 h-4" /> Logo ready for PDF header
                  </p>
                  <p className="text-xs text-slate-400 mt-1 m-0">
                    Will be placed on the upper-left of calibration certificates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  title="Remove logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  dragActive 
                    ? 'border-cyan-400 bg-cyan-950/20' 
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800/70'
                }`}
              >
                <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-200 m-0">
                  Click or drag and drop your company logo here
                </p>
                <p className="text-xs text-slate-500 mt-1 m-0">
                  Supports PNG, JPG, WebP, or SVG (Recommended: Transparent background)
                </p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Company Details Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Company / Service Provider Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. BioMed Veterinary Calibration Services"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+61 400 000 000"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Contact Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="service@biomedvet.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Business Address / Facility
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Biomedical Way, Sydney NSW 2000"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Accreditation / Tech License # (Optional)
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.accreditationNumber}
                  onChange={(e) => setFormData({ ...formData, accreditationNumber: e.target.value })}
                  placeholder="e.g. ISO/IEC 17025 Certified Tech #4928"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold shadow-lg shadow-cyan-600/20 transition"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : (
                'Save Profile & Logo'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
