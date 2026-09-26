import React, { useState } from 'react';
import { X, Plus, Trash2, RotateCcw, Gauge, Check, AlertCircle } from 'lucide-react';
import { COMMON_VAPORISER_MODELS } from '../utils/constants';

interface ManageVaporiserModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: string[];
  onAddModel: (modelName: string) => boolean;
  onRemoveModel: (modelName: string) => void;
  onResetModels: () => void;
}

export const ManageVaporiserModelsModal: React.FC<ManageVaporiserModelsModalProps> = ({
  isOpen,
  onClose,
  models,
  onAddModel,
  onRemoveModel,
  onResetModels
}) => {
  const [newModelInput, setNewModelInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newModelInput.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a vaporiser model name.');
      return;
    }

    if (models.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg(`"${trimmed}" is already in the list.`);
      return;
    }

    const success = onAddModel(trimmed);
    if (success) {
      setNewModelInput('');
      setErrorMsg(null);
      setSuccessMsg(`Added "${trimmed}" to vaporiser models.`);
      setTimeout(() => setSuccessMsg(null), 2500);
    }
  };

  const handleRemove = (model: string) => {
    if (models.length <= 1) {
      setErrorMsg('You must have at least one vaporiser model in the list.');
      return;
    }
    onRemoveModel(model);
    setErrorMsg(null);
  };

  const handleReset = () => {
    if (window.confirm('Reset the vaporiser models list back to standard factory defaults?')) {
      onResetModels();
      setSuccessMsg('Restored factory default vaporiser models.');
      setTimeout(() => setSuccessMsg(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#09b0bb]/10 text-[#09b0bb] border border-[#09b0bb]/25">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 m-0">
                Manage Vaporiser Models
              </h2>
              <p className="text-xs text-slate-500 font-medium m-0">
                Add, remove, and customize vaporiser models ({models.length} available)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Add New Model Form */}
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Add New Vaporiser Model
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newModelInput}
                onChange={(e) => {
                  setNewModelInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="e.g. Dräger Vapor 3000, Penlon Sigma Plus..."
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#09b0bb] hover:bg-[#038c97] text-white rounded-lg text-sm font-semibold shadow-xs transition cursor-pointer flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1 m-0">
                <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-1 m-0">
                <Check className="w-3.5 h-3.5" /> {successMsg}
              </p>
            )}
          </form>

          {/* Current Models List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Current Models List ({models.length})
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-[#09b0bb] font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Restore default manufacturer models"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reset to Defaults</span>
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-2xs">
              {models.map((model) => {
                const isDefault = COMMON_VAPORISER_MODELS.includes(model);
                return (
                  <div
                    key={model}
                    className="flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-slate-800 truncate">
                        {model}
                      </span>
                      {isDefault && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                          Standard
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(model)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                      title={`Remove "${model}"`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Changes are saved automatically to device storage.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-semibold border border-slate-300 transition cursor-pointer shadow-2xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
