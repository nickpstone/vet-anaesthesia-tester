import React from 'react';
import { 
  Building, 
  Layers, 
  Flame, 
  Calendar, 
  UserCheck, 
  Gauge, 
  Activity,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { AnaestheticAgent, MachineInfo, MountType } from '../types';
import { 
  AGENT_CONFIGS, 
  COMMON_MACHINE_MODELS, 
  COMMON_VAPORISER_MODELS, 
  getNextYearDateString 
} from '../utils/constants';

interface MachineDetailsCardProps {
  machine: MachineInfo;
  onChange: (updated: MachineInfo) => void;
}

export const MachineDetailsCard: React.FC<MachineDetailsCardProps> = ({
  machine,
  onChange
}) => {
  const handleFieldChange = (field: keyof MachineInfo, value: any) => {
    const updated = { ...machine, [field]: value };
    // If testDate changed, automatically suggest nextDueDate (+1 year)
    if (field === 'testDate') {
      updated.nextDueDate = getNextYearDateString(value);
    }
    onChange(updated);
  };

  const handleAgentChange = (newAgent: AnaestheticAgent) => {
    const updated = { ...machine, agent: newAgent };
    // If vaporiserModel was blank or default, suggest matching model
    const agentConfig = AGENT_CONFIGS[newAgent];
    if (agentConfig && agentConfig.commonModels.length > 0) {
      if (!machine.vaporiserModel || COMMON_VAPORISER_MODELS.includes(machine.vaporiserModel)) {
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
              Veterinary Equipment & Machine Profile
            </h2>
            <p className="text-xs text-slate-400 m-0">
              Enter machine details, vaporiser mounting, agent, and inspection date
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

      {/* 1. ANAESTHETIC AGENT SELECTOR */}
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

      {/* 2. MOUNT SYSTEM SELECTOR (Cagemount vs Selectatec) */}
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

      {/* 3. VAPORISER & MACHINE SPECIFICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
        
        {/* Left Column: Vaporiser Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5" /> Vaporiser Details
          </h3>

          <div>
            <label className="block text-xs text-slate-300 mb-1">
              Vaporiser Model
            </label>
            <div className="space-y-1.5">
              <select
                value={machine.vaporiserModel}
                onChange={(e) => handleFieldChange('vaporiserModel', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">-- Select Vaporiser Model --</option>
                {COMMON_VAPORISER_MODELS.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              <input
                type="text"
                value={machine.vaporiserModel}
                onChange={(e) => handleFieldChange('vaporiserModel', e.target.value)}
                placeholder="Or type custom model..."
                className="w-full px-3 py-1.5 bg-slate-800/60 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
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

        {/* Right Column: Anaesthesia Machine & Clinic */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" /> Anaesthesia Machine & Clinic
          </h3>

          <div>
            <label className="block text-xs text-slate-300 mb-1">
              Veterinary Clinic Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={machine.clinicName}
              onChange={(e) => handleFieldChange('clinicName', e.target.value)}
              placeholder="e.g. Riverbend Veterinary Hospital"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Machine Model
              </label>
              <input
                type="text"
                list="machine-models"
                value={machine.machineModel}
                onChange={(e) => handleFieldChange('machineModel', e.target.value)}
                placeholder="e.g. Vetland Landmark"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <datalist id="machine-models">
                {COMMON_MACHINE_MODELS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Machine S/N
              </label>
              <input
                type="text"
                value={machine.machineSerial}
                onChange={(e) => handleFieldChange('machineSerial', e.target.value)}
                placeholder="e.g. MC-4028"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

      </div>

      {/* 4. DATES & TECHNICIAN / ANALYSER INFO */}
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
