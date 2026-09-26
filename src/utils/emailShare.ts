import { generateVaporiserPdf, GeneratePdfOptions } from './pdfGenerator';

export interface EmailShareResult {
  method: 'native-share' | 'download-and-mailto';
  success: boolean;
  message: string;
}

export async function shareOrEmailReport(options: GeneratePdfOptions): Promise<EmailShareResult> {
  const { machine, evaluation } = options;

  // 1. Generate PDF
  const doc = await generateVaporiserPdf(options);
  const pdfBlob = doc.output('blob');
  const safeClinicName = (machine.clinicName || 'Clinic').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeSerial = (machine.vaporiserSerial || 'Vap').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Vaporiser_Report_${safeClinicName}_${safeSerial}_${machine.testDate}.pdf`;

  const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

  const statusText = evaluation.isPassed ? 'PASSED' : 'FAILED (OUT OF TOLERANCE)';
  const subject = `Vaporiser Test Report: ${machine.clinicName || 'Clinic'} - ${machine.agent} ${machine.vaporiserModel} (S/N: ${machine.vaporiserSerial}) - ${statusText}`;

  const bodyText = [
    `Dear Veterinary Team,`,
    ``,
    `Please find the calibration and performance test report for the following anaesthesia equipment:`,
    ``,
    `• Clinic: ${machine.clinicName || 'N/A'}`,
    `• Machine Model: ${machine.machineModel || 'N/A'} (S/N: ${machine.machineSerial || 'N/A'})`,
    `• Vaporiser: ${machine.vaporiserModel || 'N/A'} (S/N: ${machine.vaporiserSerial || 'N/A'})`,
    `• Mount System: ${machine.mountType}`,
    `• Anaesthetic Agent: ${machine.agent}`,
    `• Test Date: ${machine.testDate}`,
    `• Next Calibration Due: ${machine.nextDueDate}`,
    `• Overall Test Status: ${statusText}`,
    ``,
    evaluation.isPassed
      ? `The vaporiser satisfies all allowable ISO concentration accuracy criteria across all tested flow rates.`
      : `WARNING: The vaporiser has FAILED calibration tolerance checks. Do not use for clinical procedures until serviced and recalibrated.`,
    ``,
    `Tested By: ${machine.technicianName || 'Certified Technician'}`,
    `Instrumentation: ${machine.gasAnalyserModel} (S/N: ${machine.gasAnalyserSerial || 'N/A'})`,
    ``,
    `The full official PDF certificate is attached.`,
    ``,
    `Best regards,`,
    `${options.company.companyName || 'Biomedical Service Team'}`
  ].join('\n');

  // Check if Web Share API with files is supported
  const nav = navigator as unknown as {
    canShare?: (data: { files: File[] }) => boolean;
    share?: (data: { title: string; text: string; files: File[] }) => Promise<void>;
  };

  if (nav.canShare && nav.canShare({ files: [pdfFile] }) && nav.share) {
    try {
      await nav.share({
        title: subject,
        text: bodyText,
        files: [pdfFile]
      });
      return {
        method: 'native-share',
        success: true,
        message: 'Shared directly via device email/messaging app.'
      };
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        return {
          method: 'native-share',
          success: false,
          message: 'Share sheet was closed.'
        };
      }
      // If native share fails or was cancelled, fall back to download + mailto
      console.warn('Native share failed, using fallback', err);
    }
  }

  // Fallback: Download PDF directly and open mailto
  downloadPdfBlob(pdfBlob, filename);

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(
    bodyText + '\n\n[Note: The calibration PDF has been saved to your downloads folder. Please attach it to this email.]'
  );

  const mailtoUrl = `mailto:${encodeURIComponent(machine.clinicContact || '')}?subject=${encodedSubject}&body=${encodedBody}`;

  // Open mailto link
  const a = document.createElement('a');
  a.href = mailtoUrl;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  return {
    method: 'download-and-mailto',
    success: true,
    message: 'PDF downloaded! Opening your email client draft with pre-filled details.'
  };
}

export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
