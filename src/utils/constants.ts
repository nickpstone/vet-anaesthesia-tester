import { AgentConfig, AnaestheticAgent, DialPoint, MachineInfo, ToleranceConfig } from '../types';

export const DEFAULT_DIAL_SETTINGS = [0.2, 0.6, 1.0, 2.0, 3.0, 4.0, 5.0];

export const AGENT_CONFIGS: Record<AnaestheticAgent, AgentConfig> = {
  Isoflurane: {
    name: 'Isoflurane',
    color: '#9333ea', // Purple (standard medical color coding)
    badgeBg: 'bg-purple-950/60',
    badgeBorder: 'border-purple-500/40 text-purple-300',
    textColor: 'text-purple-400',
    commonModels: [
      'Datex-Ohmeda Tec 3',
      'Datex-Ohmeda Tec 4',
      'Datex-Ohmeda Tec 5',
      'Datex-Ohmeda Tec 7',
      'Dräger Vapor 19.n',
      'Dräger Vapor 2000',
      'Penlon Sigma Delta',
      'Penlon Sigma Elite',
      'Blease Datum',
      'Vetland VIP 3000',
      'Burtons Compact Iso'
    ],
    maxStandardDial: 5.0
  }
};

export const COMMON_VAPORISER_MODELS = [
  'Datex-Ohmeda Tec 3',
  'Datex-Ohmeda Tec 4',
  'Datex-Ohmeda Tec 5',
  'Datex-Ohmeda Tec 7',
  'Dräger Vapor 19.1',
  'Dräger Vapor 2000',
  'Penlon Sigma Delta',
  'Penlon Sigma Elite',
  'Blease Datum',
  'Vetland VIP 3000',
  'Burtons Compact',
  'Midmark Matrx VIP 3000',
  'Supera M2300',
  'Generic / Custom'
];

export const COMMON_MACHINE_MODELS = [
  'Vetland Landmark V-1000',
  'Vetland Landmark V-2000',
  'Midmark Matrx VMS',
  'Midmark Matrx VMS Plus',
  'Burtons Compact Anaesthetic System',
  'Supera M2300 Mobile',
  'Supera M2500 Tabletop',
  'SurgiVet Classic',
  'VetEquip Lab Anesthesia',
  'Custom Mobile Stand'
];

export const DEFAULT_TOLERANCE_CONFIG: ToleranceConfig = {
  mode: 'iso',
  percentage: 15,    // ISO standard: +/- 15% of dial setting
  absoluteFloor: 0.15 // Absolute +/- 0.15% floor at lower settings (0.2, 0.6)
};

export const createDefaultDialPoints = (): DialPoint[] => {
  return DEFAULT_DIAL_SETTINGS.map((dial) => ({
    id: `dial-${dial}`,
    dialSetting: dial,
    measured: undefined
  }));
};

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getNextYearDateString = (fromDateStr: string): string => {
  try {
    const parts = fromDateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10) + 1;
      return `${year}-${parts[1]}-${parts[2]}`;
    }
  } catch {
    // fallback
  }
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};

export const createInitialMachineInfo = (): MachineInfo => {
  const today = getTodayDateString();
  return {
    ownerCompanyName: '',
    ownerDepartment: 'Operating Theatre 1',
    ownerAddress: '',
    ownerContactPerson: '',
    ownerContactEmail: '',
    ownerContactPhone: '',
    machineManufacturer: 'Vetland Medical',
    machineModel: 'Vetland Landmark V-1000',
    machineSerial: '',
    machineAssetTag: '',
    vaporiserModel: 'Datex-Ohmeda Tec 4',
    vaporiserSerial: '',
    mountType: 'Selectatec',
    agent: 'Isoflurane',
    testDate: today,
    nextDueDate: getNextYearDateString(today),
    technicianName: '',
    gasAnalyserModel: 'Riken FI-8000 Gas Indicator',
    gasAnalyserSerial: '',
    gasAnalyserCalDate: today,
    notes: 'Vaporiser inspected and calibrated using calibrated optical refractometer/gas analyser.',
    clinicName: '',
    clinicAddress: '',
    clinicContact: ''
  };
};
