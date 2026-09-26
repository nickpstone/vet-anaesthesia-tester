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

/**
 * Details of the Machine and the Client / Company whose machine is being tested
 */
export interface MachineInfo {
  // Client / Machine Owner Company Details
  ownerCompanyName: string;       // e.g. 'Riverbend Animal Hospital & Referral Centre'
  ownerDepartment: string;        // e.g. 'Operating Theatre 2 / Dental Surgery'
  ownerAddress: string;           // e.g. '450 Parkland Rd, Brisbane QLD 4000'
  ownerContactPerson: string;     // e.g. 'Dr. Sarah Jenkins BVSc'
  ownerContactEmail: string;      // e.g. 'theatre@riverbendvet.com.au'
  ownerContactPhone: string;      // e.g. '+61 7 3000 1234'
  
  // Machine Details
  machineManufacturer: string;    // e.g. 'Vetland Medical'
  machineModel: string;           // e.g. 'Landmark V-1000'
  machineSerial: string;          // e.g. 'VLM-2041'
  machineAssetTag: string;        // e.g. 'ASSET-2024-08'
  
  // Vaporiser Details
  vaporiserModel: string;         // e.g. 'Datex-Ohmeda Tec 4'
  vaporiserSerial: string;        // e.g. 'VAP-8841-ISO'
  mountType: MountType;           // 'Selectatec' | 'Cagemount'
  agent: AnaestheticAgent;        // 'Isoflurane' | 'Sevoflurane' | etc.
  
  // Testing Dates & Tech
  testDate: string;               // YYYY-MM-DD
  nextDueDate: string;            // YYYY-MM-DD
  technicianName: string;         // e.g. 'Nick (Certified Biomedical Tech)'
  gasAnalyserModel: string;       // e.g. 'Riken FI-8000 Optical Gas Indicator'
  gasAnalyserSerial: string;      // e.g. 'RK-99120'
  gasAnalyserCalDate: string;     // YYYY-MM-DD
  notes: string;                  // Inspection remarks

  // Compatibility aliases
  clinicName?: string;
  clinicAddress?: string;
  clinicContact?: string;
}

/**
 * Details of the Testing / Calibration Service Provider Company
 */
export interface CompanyProfile {
  companyName: string;            // e.g. 'BioMed Veterinary Calibration & Engineering Services'
  address: string;                // e.g. '123 Medical Parkway, Suite 400, Sydney NSW 2000'
  phone: string;                  // e.g. '+61 400 123 456'
  email: string;                  // e.g. 'service@biomedvet.com.au'
  website: string;                // e.g. 'www.biomedvet.com.au'
  accreditationNumber: string;    // e.g. 'ISO/IEC 17025 Biomedical Accreditation #4928'
  logoDataUrl: string;            // Base64 image
}

export type ToleranceMode = 'iso' | 'relative' | 'custom';

export interface ToleranceConfig {
  mode: ToleranceMode;
  percentage: number;             // default 15 (%)
  absoluteFloor: number;          // default 0.15 (%)
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
