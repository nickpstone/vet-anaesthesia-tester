export type MountType = 'Selectatec' | 'Cagemount';

export type AnaestheticAgent = 
  | 'Isoflurane' 
  | 'Sevoflurane' 
  | 'Halothane' 
  | 'Desflurane' 
  | 'Enflurane';

export interface AgentConfig {
  name: AnaestheticAgent;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  commonModels: string[];
  maxStandardDial: number;
}

export interface DialPoint {
  id: string;
  dialSetting: number; // e.g. 0.2, 0.6, 1, 2, 3, 4, 5
  measured?: number;    // actual reading from gas analyser
}

export interface TestRun {
  id: string;
  flowrate: number;    // e.g. 1.0, 2.0, 4.0 L/min
  carrierGas: string;  // e.g. '100% Oxygen (O2)', 'Medical Air'
  dialPoints: DialPoint[];
}

export interface MachineInfo {
  clinicName: string;
  clinicAddress: string;
  clinicContact: string;
  machineModel: string;
  machineSerial: string;
  vaporiserModel: string;
  vaporiserSerial: string;
  mountType: MountType;
  agent: AnaestheticAgent;
  testDate: string;        // YYYY-MM-DD
  nextDueDate: string;     // YYYY-MM-DD
  technicianName: string;
  gasAnalyserModel: string;
  gasAnalyserSerial: string;
  gasAnalyserCalDate: string;
  notes: string;
}

export interface CompanyProfile {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  accreditationNumber: string;
  logoDataUrl: string; // Base64
}

export type ToleranceMode = 'iso' | 'relative' | 'custom';

export interface ToleranceConfig {
  mode: ToleranceMode;
  percentage: number;   // default 15 (%)
  absoluteFloor: number; // default 0.15 (%)
}

export interface PointEvaluation {
  dialSetting: number;
  measured: number | null;
  minAllowable: number;
  maxAllowable: number;
  deviation: number | null;
  deviationPercent: number | null;
  status: 'PASS' | 'FAIL' | 'PENDING';
  reason?: string;
}

export interface RunEvaluation {
  runId: string;
  flowrate: number;
  carrierGas: string;
  evaluations: PointEvaluation[];
  isPassed: boolean;
  hasMeasurements: boolean;
}

export interface OverallEvaluation {
  isPassed: boolean;
  hasMeasurements: boolean;
  failedCount: number;
  passedCount: number;
  pendingCount: number;
  runs: RunEvaluation[];
  summaryMessage: string;
}

export interface SavedReport {
  id: string;
  timestamp: number;
  machineInfo: MachineInfo;
  runs: TestRun[];
  toleranceConfig: ToleranceConfig;
  overallPassed: boolean;
}
