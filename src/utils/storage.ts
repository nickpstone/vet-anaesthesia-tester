import { CompanyProfile, MachineInfo, SavedReport, TestRun, ToleranceConfig } from '../types';
import { 
  createDefaultDialPoints, 
  createInitialMachineInfo, 
  DEFAULT_TOLERANCE_CONFIG,
  COMMON_VAPORISER_MODELS
} from './constants';

const KEYS = {
  DRAFT_MACHINE: 'vetvap_draft_machine',
  DRAFT_RUNS: 'vetvap_draft_runs',
  DRAFT_TOLERANCE: 'vetvap_draft_tolerance',
  COMPANY_PROFILE: 'vetvap_company_profile',
  REPORTS_HISTORY: 'vetvap_reports_history',
  VAPORISER_MODELS: 'vetvap_vaporiser_models'
};

import { VET1_DEFAULT_LOGO } from './defaultLogo';

export const defaultCompanyProfile: CompanyProfile = {
  companyName: 'Vet1 Pty Ltd',
  address: 'National Technical Service Centre, 6 Louis Court, Coomera QLD 4209',
  phone: '1300 378 713',
  email: 'service@vet1.com.au',
  website: 'www.vet1.com.au',
  accreditationNumber: 'Vet1 Biomedical Service & Calibration Division',
  logoDataUrl: VET1_DEFAULT_LOGO
};

export const createInitialRuns = (): TestRun[] => {
  return [
    {
      id: 'run-1',
      flowrate: 1.0,
      carrierGas: '100% Oxygen (O2)',
      dialPoints: createDefaultDialPoints()
    }
  ];
};

export function saveCurrentDraft(
  machine: MachineInfo,
  runs: TestRun[],
  tolerance: ToleranceConfig
): void {
  try {
    localStorage.setItem(KEYS.DRAFT_MACHINE, JSON.stringify(machine));
    localStorage.setItem(KEYS.DRAFT_RUNS, JSON.stringify(runs));
    localStorage.setItem(KEYS.DRAFT_TOLERANCE, JSON.stringify(tolerance));
  } catch (err) {
    console.warn('Failed to save draft to localStorage', err);
  }
}

export function loadCurrentDraft(): {
  machine: MachineInfo;
  runs: TestRun[];
  tolerance: ToleranceConfig;
} {
  let machine = createInitialMachineInfo();
  let runs = createInitialRuns();
  let tolerance = DEFAULT_TOLERANCE_CONFIG;

  try {
    const rawMachine = localStorage.getItem(KEYS.DRAFT_MACHINE);
    if (rawMachine) {
      machine = { ...machine, ...JSON.parse(rawMachine) };
    }

    const rawRuns = localStorage.getItem(KEYS.DRAFT_RUNS);
    if (rawRuns) {
      const parsed = JSON.parse(rawRuns);
      if (Array.isArray(parsed) && parsed.length > 0) {
        runs = parsed;
      }
    }

    const rawTolerance = localStorage.getItem(KEYS.DRAFT_TOLERANCE);
    if (rawTolerance) {
      tolerance = { ...tolerance, ...JSON.parse(rawTolerance) };
    }
  } catch (err) {
    console.warn('Failed to load draft from localStorage', err);
  }

  return { machine, runs, tolerance };
}

export function clearCurrentDraft(): void {
  try {
    localStorage.removeItem(KEYS.DRAFT_MACHINE);
    localStorage.removeItem(KEYS.DRAFT_RUNS);
    localStorage.removeItem(KEYS.DRAFT_TOLERANCE);
  } catch (err) {
    console.warn('Failed to clear draft', err);
  }
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  try {
    localStorage.setItem(KEYS.COMPANY_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to save company profile', err);
  }
}

export function loadCompanyProfile(): CompanyProfile {
  try {
    const raw = localStorage.getItem(KEYS.COMPANY_PROFILE);
    if (raw) {
      return { ...defaultCompanyProfile, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Failed to load company profile', err);
  }
  return defaultCompanyProfile;
}

export function saveReportToHistory(report: SavedReport): void {
  try {
    const existing = loadReportsHistory();
    // Prepend new report and keep up to 100 recent reports
    const updated = [report, ...existing.filter((r) => r.id !== report.id)].slice(0, 100);
    localStorage.setItem(KEYS.REPORTS_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save report to history', err);
  }
}

export function loadReportsHistory(): SavedReport[] {
  try {
    const raw = localStorage.getItem(KEYS.REPORTS_HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load reports history', err);
  }
  return [];
}

export function deleteReportFromHistory(id: string): void {
  try {
    const existing = loadReportsHistory();
    const updated = existing.filter((r) => r.id !== id);
    localStorage.setItem(KEYS.REPORTS_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to delete report', err);
  }
}

export function loadVaporiserModels(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.VAPORISER_MODELS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load vaporiser models', err);
  }
  return [...COMMON_VAPORISER_MODELS];
}

export function saveVaporiserModels(models: string[]): void {
  try {
    localStorage.setItem(KEYS.VAPORISER_MODELS, JSON.stringify(models));
  } catch (err) {
    console.warn('Failed to save vaporiser models', err);
  }
}

