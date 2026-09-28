import { 
  Building, 
  Layers, 
  Flame, 
  Calendar, 
  UserCheck, 
  Gauge, 
  Activity,
  CheckCircle,
  MapPin,
  Mail,
  User,
  Tag,
  SlidersHorizontal,
  Plus,
  Trash2
} from 'lucide-react';
import { MachineInfo, MountType } from '../types';
import { 
  AGENT_CONFIGS, 
  COMMON_MACHINE_MODELS, 
  getNextYearDateString 
} from '../utils/constants';

interface MachineDetailsCardProps {
  machine: MachineInfo;
  onChange: (updated: MachineInfo) => void;
  vaporiserModels: string[];
  onOpenManageModels: () => void;
  onAddModel: (modelName: string) => boolean;
  onRemoveModel: (modelName: string) => void;
}

export const MachineDetailsCard: React.FC<MachineDetailsCardProps> = ({
  machine,
  onChange,
  vaporiserModels,
  onOpenManageModels,
  onAddModel,
  onRemoveModel
}) => {
  const handleFieldChange = (field: keyof MachineInfo, value: any) => {
    const updated = { ...machine, [field]: value };
    // Synchronize legacy and new fields
    if (field === 'ownerCompanyName') updated.clinicName = value;
    if (field === 'clinicName') updated.ownerCompanyName = value;
    if (field === 'ownerAddress') updated.clinicAddress = value;
    if (field === 'clinicAddress') updated.ownerAddress = value;
    if (field === 'ownerContactEmail') updated.clinicContact = value;
    if (field === 'clinicContact') updated.ownerContactEmail = value;

    // If testDate changed, automatically suggest nextDueDate (+1 year)
    if (field === 'testDate') {
      updated.nextDueDate = getNextYearDateString(value);
    }
    onChange(updated);
  };

  const isoConfig = AGENT_CONFIGS.Isoflurane;

  const mountTypes: { type: MountType; label: string; desc: string }[] = [
    { 
      type: 'Selectatec', 
      label: 'Selectatec (Quick-Release)', 
      desc: 'Standard backbar interlock pin system' 
    },
    { 
      type: 'Cagemount', 
      label: 'Cagemount (23mm Taper)', 
      desc: 'Standard screw mount with 23mm male/female cones' 
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#09b0bb]/10 text-[#09b0bb] border border-[#09b0bb]/25">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 m-0">
              Machine Owner & Equipment Specifications
            </h2>
            <p className="text-xs text-slate-500 font-medium m-0">
              Enter the client company details of the machine being tested and equipment metadata
            </p>
          </div>
        </div>

        {/* Selected Agent Quick Pill */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs text-slate-500 font-semibold">Agent:</span>
          <span 
            className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white shadow-xs flex items-center gap-1.5"
            style={{ backgroundColor: AGENT_CONFIGS[machine.agent]?.color || '#9333ea' }}
          >
            <Flame className="w-3.5 h-3.5" />
            {machine.agent}
          </span>
        </div>
      </div>

      {/* 1. MACHINE OWNER / CLIENT COMPANY DETAILS */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-[#077a83] font-bold text-xs uppercase tracking-wider">
          <Building className="w-4 h-4 text-[#09b0bb]" />
          Client / Machine Owner Company Details (Whose machine is being tested)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company / Clinic / Practice Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={machine.ownerCompanyName || machine.clinicName || ''}
              onChange={(e) => handleFieldChange('ownerCompanyName', e.target.value)}
              placeholder="e.g. Riverbend Animal Hospital & Specialty Surgery"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department / Surgery Location
            </label>
            <input
              type="text"
              value={machine.ownerDepartment || ''}
              onChange={(e) => handleFieldChange('ownerDepartment', e.target.value)}
              placeholder="e.g. Operating Theatre 2 / Dental Suite"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" /> Facility Street Address
            </label>
            <input
              type="text"
              value={machine.ownerAddress || machine.clinicAddress || ''}
              onChange={(e) => handleFieldChange('ownerAddress', e.target.value)}
              placeholder="e.g. 450 Parkland Rd, Brisbane QLD 4000"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" /> Client Contact Person
            </label>
            <input
              type="text"
              value={machine.ownerContactPerson || ''}
              onChange={(e) => handleFieldChange('ownerContactPerson', e.target.value)}
              placeholder="e.g. Dr. Sarah Jenkins (Head Vet)"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" /> Client Email (For PDF delivery)
            </label>
            <input
              type="email"
              value={machine.ownerContactEmail || machine.clinicContact || ''}
              onChange={(e) => handleFieldChange('ownerContactEmail', e.target.value)}
              placeholder="e.g. theatre@riverbendvet.com.au"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
            />
          </div>
        </div>
      </div>

      {/* 2. ANAESTHETIC AGENT (Isoflurane Dedicated) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-purple-600" />
            Anaesthetic Agent
          </span>
          <span className="text-[11px] text-purple-600 font-semibold uppercase tracking-wider">Purple Standard Coding</span>
        </label>
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-purple-200 bg-purple-50/60 shadow-2xs">
          <div 
            className="w-5 h-5 rounded-full shadow-xs flex-shrink-0"
            style={{ backgroundColor: isoConfig?.color || '#9333ea' }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Isoflurane</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider">
                Dedicated Agent
              </span>
            </div>
            <p className="text-xs text-slate-500 m-0 mt-0.5 font-medium">
              Calibrated exclusively for Isoflurane (Standard dial range 0.2% – {isoConfig?.maxStandardDial || 5.0}%)
            </p>
          </div>
        </div>
      </div>

      {/* 3. MOUNT SYSTEM SELECTOR (Cagemount vs Selectatec) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#09b0bb]" />
            Vaporiser Mount System
          </span>
          <span className="text-[11px] text-slate-500 font-medium lowercase">Selectatec or Cagemount</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mountTypes.map(({ type, label, desc }) => {
            const isSelected = machine.mountType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleFieldChange('mountType', type)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#09b0bb] bg-[#09b0bb]/10 ring-1 ring-[#09b0bb]/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-full ${isSelected ? 'bg-[#09b0bb] text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-sm font-bold ${isSelected ? 'text-[#077a83]' : 'text-slate-900'}`}>
                    {label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">
                    {desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. HARDWARE SPECIFICS: MACHINE & VAPORISER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
        
        {/* Left Column: Vaporiser Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#077a83] uppercase tracking-wider flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#09b0bb]" /> Vaporiser Under Test
          </h3>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Vaporiser Model
              </label>
              <button
                type="button"
                onClick={onOpenManageModels}
                className="text-xs text-[#09b0bb] hover:text-[#038c97] flex items-center gap-1 font-semibold transition cursor-pointer"
                title="Add, remove, or customize the models list"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Manage Models ({vaporiserModels.length})</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <select
                  value={machine.vaporiserModel}
                  onChange={(e) => handleFieldChange('vaporiserModel', e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
                >
                  <option value="">-- Select Vaporiser Model --</option>
                  {vaporiserModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>

                {machine.vaporiserModel && vaporiserModels.includes(machine.vaporiserModel) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Remove "${machine.vaporiserModel}" from the saved models list?`)) {
                        onRemoveModel(machine.vaporiserModel);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition cursor-pointer"
                    title={`Delete "${machine.vaporiserModel}" from list`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={machine.vaporiserModel}
                  onChange={(e) => handleFieldChange('vaporiserModel', e.target.value)}
                  placeholder="Or type custom model name..."
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
                />

                {machine.vaporiserModel.trim() && !vaporiserModels.some((m) => m.toLowerCase() === machine.vaporiserModel.trim().toLowerCase()) && (
                  <button
                    type="button"
                    onClick={() => onAddModel(machine.vaporiserModel.trim())}
                    className="px-2.5 py-1.5 bg-[#09b0bb]/10 hover:bg-[#09b0bb]/20 text-[#077a83] border border-[#09b0bb]/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer whitespace-nowrap"
                    title={`Save "${machine.vaporiserModel.trim()}" into permanent dropdown list`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save to list</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vaporiser Serial Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={machine.vaporiserSerial}
              onChange={(e) => handleFieldChange('vaporiserSerial', e.target.value)}
              placeholder="e.g. VAP-94812-B"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
            />
          </div>
        </div>

        {/* Right Column: Anaesthesia Machine Hardware */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#077a83] uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#09b0bb]" /> Anaesthesia Machine Details
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Machine Make / Manufacturer
              </label>
              <input
                type="text"
                value={machine.machineManufacturer || ''}
                onChange={(e) => handleFieldChange('machineManufacturer', e.target.value)}
                placeholder="e.g. Vetland Medical"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Machine Model
              </label>
              <input
                type="text"
                list="machine-models"
                value={machine.machineModel}
                onChange={(e) => handleFieldChange('machineModel', e.target.value)}
                placeholder="e.g. Landmark V-1000"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
              />
              <datalist id="machine-models">
                {COMMON_MACHINE_MODELS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Machine Serial #
              </label>
              <input
                type="text"
                value={machine.machineSerial}
                onChange={(e) => handleFieldChange('machineSerial', e.target.value)}
                placeholder="e.g. MC-4028"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-500" /> Asset Tag
              </label>
              <input
                type="text"
                value={machine.machineAssetTag || ''}
                onChange={(e) => handleFieldChange('machineAssetTag', e.target.value)}
                placeholder="e.g. ASSET-2024-08"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
              />
            </div>
          </div>
        </div>

      </div>

      {/* 5. DATES & TECHNICIAN / ANALYSER INFO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-200">
        
        <div>
          <label className="block text-xs text-slate-700 mb-1 flex items-center gap-1 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-[#09b0bb]" />
            Date of Test <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={machine.testDate}
            onChange={(e) => handleFieldChange('testDate', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-700 mb-1 flex items-center gap-1 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Next Calibration Due
          </label>
          <input
            type="date"
            value={machine.nextDueDate}
            onChange={(e) => handleFieldChange('nextDueDate', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-700 mb-1 flex items-center gap-1 font-semibold">
            <UserCheck className="w-3.5 h-3.5 text-[#09b0bb]" />
            Tested By (Technician)
          </label>
          <input
            type="text"
            value={machine.technicianName}
            onChange={(e) => handleFieldChange('technicianName', e.target.value)}
            placeholder="e.g. Nick / Certified Tech"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-700 mb-1 flex items-center gap-1 font-semibold">
            <Gauge className="w-3.5 h-3.5 text-slate-500" />
            Test Gas Analyser Model
          </label>
          <input
            type="text"
            value={machine.gasAnalyserModel}
            onChange={(e) => handleFieldChange('gasAnalyserModel', e.target.value)}
            placeholder="e.g. Riken FI-8000"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#09b0bb] focus:border-[#09b0bb]"
          />
        </div>

      </div>

    </div>
  );
};
