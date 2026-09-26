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
import { AnaestheticAgent, MachineInfo, MountType } from '../types';
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

  const handleAgentChange = (newAgent: AnaestheticAgent) => {
    const updated = { ...machine, agent: newAgent };
    const agentConfig = AGENT_CONFIGS[newAgent];
    if (agentConfig && agentConfig.commonModels.length > 0) {
      if (!machine.vaporiserModel || vaporiserModels.includes(machine.vaporiserModel)) {
        updated.vaporiserModel = agentConfig.commonModels[0];
      }
    }
    onChange(updated);
  };

  const agents: AnaestheticAgent[] = [
    'Isoflurane',
    'Sevoflurane',
    'Halothane',
    'Desflurane',
    'Enflurane'
  ];

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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white m-0">
              Machine Owner & Equipment Specifications
            </h2>
            <p className="text-xs text-slate-400 m-0">
              Enter the client company details of the machine being tested and equipment metadata
            </p>
          </div>
        </div>

        {/* Selected Agent Quick Pill */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs text-slate-400">Agent:</span>
          <span 
            className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white shadow-sm flex items-center gap-1.5"
            style={{ backgroundColor: AGENT_CONFIGS[machine.agent]?.color || '#9333ea' }}
          >
            <Flame className="w-3.5 h-3.5" />
            {machine.agent}
          </span>
        </div>
      </div>

      {/* 1. MACHINE OWNER / CLIENT COMPANY DETAILS */}
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/60 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Building className="w-4 h-4" />
          Client / Machine Owner Company Details (Whose machine is being tested)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Company / Clinic / Practice Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={machine.ownerCompanyName || machine.clinicName || ''}
              onChange={(e) => handleFieldChange('ownerCompanyName', e.target.value)}
              placeholder="e.g. Riverbend Animal Hospital & Specialty Surgery"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Department / Surgery Location
            </label>
            <input
              type="text"
              value={machine.ownerDepartment || ''}
              onChange={(e) => handleFieldChange('ownerDepartment', e.target.value)}
              placeholder="e.g. Operating Theatre 2 / Dental Suite"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Facility Street Address
            </label>
            <input
              type="text"
              value={machine.ownerAddress || machine.clinicAddress || ''}
              onChange={(e) => handleFieldChange('ownerAddress', e.target.value)}
              placeholder="e.g. 450 Parkland Rd, Brisbane QLD 4000"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" /> Client Contact Person
            </label>
            <input
              type="text"
              value={machine.ownerContactPerson || ''}
              onChange={(e) => handleFieldChange('ownerContactPerson', e.target.value)}
              placeholder="e.g. Dr. Sarah Jenkins (Head Vet)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Client Email (For PDF delivery)
            </label>
            <input
              type="email"
              value={machine.ownerContactEmail || machine.clinicContact || ''}
              onChange={(e) => handleFieldChange('ownerContactEmail', e.target.value)}
              placeholder="e.g. theatre@riverbendvet.com.au"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* 2. ANAESTHETIC AGENT SELECTOR */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-cyan-400" />
          Anaesthetic Agent
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {agents.map((agent) => {
            const config = AGENT_CONFIGS[agent];
            const isSelected = machine.agent === agent;
            return (
              <button
                key={agent}
                type="button"
                onClick={() => handleAgentChange(agent)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-white/40 ring-2 ring-cyan-400/80 bg-slate-800 shadow-lg'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div 
                  className="w-4 h-4 rounded-full mb-1.5 shadow-sm"
                  style={{ backgroundColor: config.color }}
                />
                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {agent}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Max: {config.maxStandardDial}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MOUNT SYSTEM SELECTOR (Cagemount vs Selectatec) */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            Vaporiser Mount System
          </span>
          <span className="text-[11px] text-slate-500 font-normal lowercase">Selectatec or Cagemount</span>
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
                    ? 'border-cyan-500/60 bg-cyan-950/20 ring-1 ring-cyan-500/50 shadow-md'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-full ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {label}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. HARDWARE SPECIFICS: MACHINE & VAPORISER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
        
        {/* Left Column: Vaporiser Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5" /> Vaporiser Under Test
          </h3>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-300">
                Vaporiser Model
              </label>
              <button
                type="button"
                onClick={onOpenManageModels}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition cursor-pointer"
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
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-slate-700 transition cursor-pointer"
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
                  className="flex-1 px-3 py-1.5 bg-slate-800/60 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />

                {machine.vaporiserModel.trim() && !vaporiserModels.some((m) => m.toLowerCase() === machine.vaporiserModel.trim().toLowerCase()) && (
                  <button
                    type="button"
                    onClick={() => onAddModel(machine.vaporiserModel.trim())}
                    className="px-2.5 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer whitespace-nowrap"
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
            <label className="block text-xs text-slate-300 mb-1">
              Vaporiser Serial Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={machine.vaporiserSerial}
              onChange={(e) => handleFieldChange('vaporiserSerial', e.target.value)}
              placeholder="e.g. VAP-94812-B"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Right Column: Anaesthesia Machine Hardware */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" /> Anaesthesia Machine Details
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Machine Make / Manufacturer
              </label>
              <input
                type="text"
                value={machine.machineManufacturer || ''}
                onChange={(e) => handleFieldChange('machineManufacturer', e.target.value)}
                placeholder="e.g. Vetland Medical"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Machine Model
              </label>
              <input
                type="text"
                list="machine-models"
                value={machine.machineModel}
                onChange={(e) => handleFieldChange('machineModel', e.target.value)}
                placeholder="e.g. Landmark V-1000"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
              <label className="block text-xs text-slate-300 mb-1">
                Machine Serial #
              </label>
              <input
                type="text"
                value={machine.machineSerial}
                onChange={(e) => handleFieldChange('machineSerial', e.target.value)}
                placeholder="e.g. MC-4028"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" /> Hospital Asset Tag #
              </label>
              <input
                type="text"
                value={machine.machineAssetTag || ''}
                onChange={(e) => handleFieldChange('machineAssetTag', e.target.value)}
                placeholder="e.g. ASSET-2024-08"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

      </div>

      {/* 5. DATES & TECHNICIAN / ANALYSER INFO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/60">
        
        <div>
          <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Date of Test <span className="text-rose-400">*</span>
          </label>
          <input
            type="date"
            required
            value={machine.testDate}
            onChange={(e) => handleFieldChange('testDate', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Next Calibration Due
          </label>
          <input
            type="date"
            value={machine.nextDueDate}
            onChange={(e) => handleFieldChange('nextDueDate', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            Tested By (Technician)
          </label>
          <input
            type="text"
            value={machine.technicianName}
            onChange={(e) => handleFieldChange('technicianName', e.target.value)}
            placeholder="e.g. Nick / Certified Tech"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
            Test Gas Analyser Model
          </label>
          <input
            type="text"
            value={machine.gasAnalyserModel}
            onChange={(e) => handleFieldChange('gasAnalyserModel', e.target.value)}
            placeholder="e.g. Riken FI-8000"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

      </div>

    </div>
  );
};
