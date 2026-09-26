import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MachineDetailsCard } from './components/MachineDetailsCard';
import { FlowrateTestTable } from './components/FlowrateTestTable';
import { ResultsSummaryCard } from './components/ResultsSummaryCard';
import { FailedFullPageBanner } from './components/FailedFullPageBanner';
import { ActionToolbar } from './components/ActionToolbar';
import { CompanyModal } from './components/CompanyModal';
import { HistoryModal } from './components/HistoryModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { ManageVaporiserModelsModal } from './components/ManageVaporiserModelsModal';

import { 
  CompanyProfile, 
  MachineInfo, 
  OverallEvaluation, 
  SavedReport, 
  TestRun, 
  ToleranceConfig 
} from './types';
import { evaluateOverall } from './utils/calculations';
import { 
  loadCompanyProfile, 
  saveCompanyProfile, 
  loadCurrentDraft, 
  saveCurrentDraft, 
  clearCurrentDraft,
  loadReportsHistory,
  saveReportToHistory,
  deleteReportFromHistory,
  loadVaporiserModels,
  saveVaporiserModels
} from './utils/storage';
import { generateVaporiserPdf } from './utils/pdfGenerator';
import { shareOrEmailReport, downloadPdfBlob } from './utils/emailShare';
import { 
  createDefaultDialPoints, 
  createInitialMachineInfo, 
  DEFAULT_TOLERANCE_CONFIG, 
  getTodayDateString,
  COMMON_VAPORISER_MODELS
} from './utils/constants';

export const App: React.FC = () => {
  // Load initial state
  const initialDraft = loadCurrentDraft();
  const [machine, setMachine] = useState<MachineInfo>(initialDraft.machine);
  const [runs, setRuns] = useState<TestRun[]>(initialDraft.runs);
  const [tolerance, setTolerance] = useState<ToleranceConfig>(initialDraft.tolerance);
  const [company, setCompany] = useState<CompanyProfile>(loadCompanyProfile);
  const [vaporiserModels, setVaporiserModels] = useState<string[]>(loadVaporiserModels);

  // Modals
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [isManageModelsOpen, setIsManageModelsOpen] = useState(false);
  const [reports, setReports] = useState<SavedReport[]>(loadReportsHistory);

  // Status & Loaders
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Overall Evaluation
  const evaluation: OverallEvaluation = evaluateOverall(runs, tolerance);

  // Autosave draft on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveCurrentDraft(machine, runs, tolerance);
    }, 400);
    return () => clearTimeout(timer);
  }, [machine, runs, tolerance]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Company Profile Update
  const handleSaveCompany = (updated: CompanyProfile) => {
    setCompany(updated);
    saveCompanyProfile(updated);
    showToast('Company details & logo saved.');
  };

  // Vaporiser Models Management
  const handleAddVaporiserModel = (modelName: string): boolean => {
    const trimmed = modelName.trim();
    if (!trimmed) return false;
    if (vaporiserModels.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`Model "${trimmed}" is already in the list.`);
      return false;
    }
    const updated = [...vaporiserModels, trimmed];
    setVaporiserModels(updated);
    saveVaporiserModels(updated);
    showToast(`Added "${trimmed}" to vaporiser models.`);
    return true;
  };

  const handleRemoveVaporiserModel = (modelName: string) => {
    const updated = vaporiserModels.filter((m) => m.toLowerCase() !== modelName.toLowerCase());
    setVaporiserModels(updated);
    saveVaporiserModels(updated);
    if (machine.vaporiserModel.toLowerCase() === modelName.toLowerCase()) {
      setMachine((prev) => ({ ...prev, vaporiserModel: updated[0] || '' }));
    }
    showToast(`Removed "${modelName}" from vaporiser models.`);
  };

  const handleResetVaporiserModels = () => {
    const defaults = [...COMMON_VAPORISER_MODELS];
    setVaporiserModels(defaults);
    saveVaporiserModels(defaults);
    showToast('Reset vaporiser models to standard defaults.');
  };

  // Reset / New Test
  const handleReset = () => {
    if (window.confirm('Start a new test? This will reset the current form fields.')) {
      clearCurrentDraft();
      const freshMachine = createInitialMachineInfo();
      const freshRuns: TestRun[] = [
        {
          id: 'run-1',
          flowrate: 1.0,
          carrierGas: '100% Oxygen (O2)',
          dialPoints: createDefaultDialPoints()
        }
      ];
      setMachine(freshMachine);
      setRuns(freshRuns);
      setTolerance(DEFAULT_TOLERANCE_CONFIG);
      showToast('Form reset. Ready for a new test.');
    }
  };

  // Load Samples for instant verification
  const handleLoadSample = (type: 'pass' | 'fail') => {
    const today = getTodayDateString();
    if (type === 'pass') {
      setMachine({
        ownerCompanyName: 'All Creatures Veterinary Specialty Hospital',
        ownerDepartment: 'Operating Theatre 1 (Soft Tissue)',
        ownerAddress: '450 Parkland Rd, Brisbane QLD 4000',
        ownerContactPerson: 'Dr. Michael Smith BVSc (Head Surgeon)',
        ownerContactEmail: 'dr.smith@allcreaturesvet.com.au',
        ownerContactPhone: '+61 7 3840 1122',
        machineManufacturer: 'Vetland Medical Systems',
        machineModel: 'Vetland Landmark V-1000',
        machineSerial: 'VLM-2041',
        machineAssetTag: 'ASSET-BRIS-014',
        vaporiserModel: 'Datex-Ohmeda Tec 4',
        vaporiserSerial: 'VAP-8841-ISO',
        mountType: 'Selectatec',
        agent: 'Isoflurane',
        testDate: today,
        nextDueDate: '2027-09-26',
        technicianName: 'Nick (Senior Biomedical Engineer)',
        gasAnalyserModel: 'Riken FI-8000 Optical Analyser',
        gasAnalyserSerial: 'RK-99120',
        gasAnalyserCalDate: today,
        notes: 'Annual routine compliance testing. Selectatec interlocks engage smoothly, zero-lock working normally, pressure tested to 30 cmH2O without decay.',
        clinicName: 'All Creatures Veterinary Specialty Hospital',
        clinicAddress: '450 Parkland Rd, Brisbane QLD 4000',
        clinicContact: 'dr.smith@allcreaturesvet.com.au'
      });

      // Pass values within +/- 4% to 8%
      const passPoints = [
        { id: 'dial-0.2', dialSetting: 0.2, measured: 0.22 },
        { id: 'dial-0.6', dialSetting: 0.6, measured: 0.63 },
        { id: 'dial-1', dialSetting: 1.0, measured: 1.04 },
        { id: 'dial-2', dialSetting: 2.0, measured: 2.08 },
        { id: 'dial-3', dialSetting: 3.0, measured: 3.06 },
        { id: 'dial-4', dialSetting: 4.0, measured: 3.95 },
        { id: 'dial-5', dialSetting: 5.0, measured: 4.90 }
      ];

      setRuns([
        {
          id: 'run-1',
          flowrate: 1.0,
          carrierGas: '100% Oxygen (O2)',
          dialPoints: passPoints
        }
      ]);
      showToast('Loaded PASS demo data (all points within ISO ±15% tolerance).');
    } else {
      setMachine({
        ownerCompanyName: 'Bayside Veterinary Emergency Centre',
        ownerDepartment: 'Emergency Theatre 2',
        ownerAddress: '12 Marine Parade, Melbourne VIC 3000',
        ownerContactPerson: 'Dr. Emily Watson (Clinical Director)',
        ownerContactEmail: 'theatre@baysidevet.com.au',
        ownerContactPhone: '+61 3 9550 4400',
        machineManufacturer: 'Burtons Medical UK',
        machineModel: 'Burtons Compact Anaesthesia Unit',
        machineSerial: 'BC-9941',
        machineAssetTag: 'ASSET-MELB-089',
        vaporiserModel: 'Penlon Sigma Delta Sevo',
        vaporiserSerial: 'VAP-5520-SEV',
        mountType: 'Cagemount',
        agent: 'Sevoflurane',
        testDate: today,
        nextDueDate: '2027-09-26',
        technicianName: 'Nick (Senior Biomedical Engineer)',
        gasAnalyserModel: 'Datex-Ohmeda Capnomac Ultima',
        gasAnalyserSerial: 'DX-4410',
        gasAnalyserCalDate: today,
        notes: 'Vaporiser delivering dangerously high output at 2.0% and 4.0% dial settings. Wick or temperature compensation bypass valve failed. REMOVED FROM CLINICAL ROTATION.',
        clinicName: 'Bayside Veterinary Emergency Centre',
        clinicAddress: '12 Marine Parade, Melbourne VIC 3000',
        clinicContact: 'theatre@baysidevet.com.au'
      });

      // Fail values exceeding tolerance
      const failPoints = [
        { id: 'dial-0.2', dialSetting: 0.2, measured: 0.21 },
        { id: 'dial-0.6', dialSetting: 0.6, measured: 0.65 },
        { id: 'dial-1', dialSetting: 1.0, measured: 1.12 },
        { id: 'dial-2', dialSetting: 2.0, measured: 2.75 }, // FAIL: +37.5% deviation!
        { id: 'dial-3', dialSetting: 3.0, measured: 3.90 }, // FAIL: +30% deviation!
        { id: 'dial-4', dialSetting: 4.0, measured: 5.30 }, // FAIL: +32.5% deviation!
        { id: 'dial-5', dialSetting: 5.0, measured: 6.40 }  // FAIL: +28% deviation!
      ];

      setRuns([
        {
          id: 'run-1',
          flowrate: 1.0,
          carrierGas: '100% Oxygen (O2)',
          dialPoints: failPoints
        }
      ]);
      showToast('Loaded FAIL demo data. Red underline and failure banner displayed.');
    }
  };

  // Primary Email Action
  const handleEmail = async () => {
    setIsGeneratingPdf(true);
    try {
      const result = await shareOrEmailReport({
        machine,
        runs,
        evaluation,
        tolerance,
        company
      });
      showToast(result.message);
    } catch (err) {
      console.error('Email/Share failed', err);
      showToast('Failed to share PDF. Please try Download PDF instead.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download PDF Action
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = await generateVaporiserPdf({
        machine,
        runs,
        evaluation,
        tolerance,
        company
      });
      const blob = doc.output('blob');
      const safeClinic = (machine.clinicName || 'Clinic').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeSerial = (machine.vaporiserSerial || 'Vap').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Vaporiser_Report_${safeClinic}_${safeSerial}_${machine.testDate}.pdf`;
      downloadPdfBlob(blob, filename);
      showToast(`Downloaded ${filename}`);
    } catch (err) {
      console.error('Download PDF error', err);
      showToast('Error generating PDF download.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Save Report to History
  const handleSaveReport = () => {
    const newReport: SavedReport = {
      id: `report-${Date.now()}`,
      timestamp: Date.now(),
      machineInfo: { ...machine },
      runs: JSON.parse(JSON.stringify(runs)),
      toleranceConfig: { ...tolerance },
      overallPassed: evaluation.isPassed
    };
    saveReportToHistory(newReport);
    setReports(loadReportsHistory());
    showToast('Calibration record saved to History.');
  };

  // Load from History
  const handleLoadReport = (saved: SavedReport) => {
    setMachine(saved.machineInfo);
    setRuns(saved.runs);
    setTolerance(saved.toleranceConfig);
    showToast(`Loaded test record for ${saved.machineInfo.clinicName || 'Clinic'}.`);
  };

  // Delete from History
  const handleDeleteReport = (id: string) => {
    deleteReportFromHistory(id);
    setReports(loadReportsHistory());
    showToast('Report deleted from history.');
  };

  const getPdfDocPromise = useCallback(() => {
    return generateVaporiserPdf({
      machine,
      runs,
      evaluation,
      tolerance,
      company
    });
  }, [machine, runs, evaluation, tolerance, company]);

  const pdfFilename = `Vaporiser_Report_${(machine.clinicName || 'Clinic').replace(/[^a-zA-Z0-9_-]/g, '_')}_${machine.testDate}.pdf`;

  const isFailed = evaluation.hasMeasurements && !evaluation.isPassed;

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 ${isFailed ? 'failed-watermark-overlay' : ''}`}>
      
      {/* Top Header */}
      <Header
        company={company}
        onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onReset={handleReset}
        onLoadSample={handleLoadSample}
        isPassed={evaluation.isPassed}
        hasMeasurements={evaluation.hasMeasurements}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* CRITICAL REQUIREMENT: "if the vaporiser fails place failed with an underline over the entire page in red" */}
        <FailedFullPageBanner evaluation={evaluation} />

        {/* 1. Machine & Vaporiser Details Card */}
        <MachineDetailsCard
          machine={machine}
          onChange={setMachine}
          vaporiserModels={vaporiserModels}
          onOpenManageModels={() => setIsManageModelsOpen(true)}
          onAddModel={handleAddVaporiserModel}
          onRemoveModel={handleRemoveVaporiserModel}
        />

        {/* 2. Flowrate & Dial Settings Test Table */}
        <FlowrateTestTable
          runs={runs}
          onChangeRuns={setRuns}
          tolerance={tolerance}
          onChangeTolerance={setTolerance}
        />

        {/* 3. Summary Assessment & Notes */}
        <ResultsSummaryCard
          evaluation={evaluation}
          tolerance={tolerance}
          notes={machine.notes}
          onChangeNotes={(notes) => setMachine({ ...machine, notes })}
        />

      </main>

      {/* Sticky Bottom Actions Toolbar */}
      <ActionToolbar
        onEmail={handleEmail}
        onDownloadPdf={handleDownloadPdf}
        onPreviewPdf={() => setIsPdfPreviewOpen(true)}
        onSaveReport={handleSaveReport}
        evaluation={evaluation}
        isGeneratingPdf={isGeneratingPdf}
      />

      {/* Modals */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        profile={company}
        onSave={handleSaveCompany}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        reports={reports}
        onLoadReport={handleLoadReport}
        onDeleteReport={handleDeleteReport}
      />

      <PdfPreviewModal
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        pdfDocPromise={getPdfDocPromise}
        filename={pdfFilename}
      />

      <ManageVaporiserModelsModal
        isOpen={isManageModelsOpen}
        onClose={() => setIsManageModelsOpen(false)}
        models={vaporiserModels}
        onAddModel={handleAddVaporiserModel}
        onRemoveModel={handleRemoveVaporiserModel}
        onResetModels={handleResetVaporiserModels}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-white border border-[#09b0bb] text-slate-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 text-xs sm:text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-[#09b0bb] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};

export default App;
