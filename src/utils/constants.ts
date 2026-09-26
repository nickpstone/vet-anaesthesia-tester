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
  },
  Sevoflurane: {
    name: 'Sevoflurane',
    color: '#eab308', // Yellow (standard medical color coding)
    badgeBg: 'bg-amber-950/60',
    badgeBorder: 'border-amber-500/40 text-amber-300',
    textColor: 'text-amber-400',
    commonModels: [
      'Datex-Ohmeda Tec 4 Sevo',
      'Datex-Ohmeda Tec 5 Sevo',
      'Datex-Ohmeda Tec 7 Sevo',
      'Dräger Vapor 2000 Sevo',
      'Penlon Sigma Delta Sevo',
      'Blease Datum Sevo',
      'Vetland VIP 3000 Sevo'
    ],
    maxStandardDial: 8.0
  },
  Halothane: {
    name: 'Halothane',
    color: '#ef4444', // Red (standard medical color coding)
    badgeBg: 'bg-rose-950/60',
    badgeBorder: 'border-rose-500/40 text-rose-300',
    textColor: 'text-rose-400',
    commonModels: [
      'Datex-Ohmeda Tec 3 Halothane',
      'Datex-Ohmeda Tec 4 Halothane',
      'Dräger Vapor 19.n Halothane',
      'Penlon Sigma Delta Halothane'
    ],
    maxStandardDial: 5.0
  },
  Desflurane: {
    name: 'Desflurane',
    color: '#3b82f6', // Blue (standard medical color coding)
    badgeBg: 'bg-blue-950/60',
    badgeBorder: 'border-blue-500/40 text-blue-300',
    textColor: 'text-blue-400',
    commonModels: [
      'Datex-Ohmeda Tec 6 / Tec 6 Plus',
      'Dräger D-Vapor'
    ],
    maxStandardDial: 18.0
  },
  Enflurane: {
    name: 'Enflurane',
    color: '#f97316', // Orange (standard medical color coding)
    badgeBg: 'bg-orange-950/60',
    badgeBorder: 'border-orange-500/40 text-orange-300',
    textColor: 'text-orange-400',
    commonModels: [
      'Datex-Ohmeda Tec 4 Enflurane',
      'Dräger 19.n Enflurane'
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
    clinicName: '',
    clinicAddress: '',
    clinicContact: '',
    machineModel: 'Vetland Landmark V-1000',
    machineSerial: '',
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
    notes: 'Vaporiser inspected and calibrated using calibrated optical refractometer/gas analyser.'
  };
};
