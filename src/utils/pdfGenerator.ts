import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CompanyProfile, MachineInfo, OverallEvaluation, TestRun, ToleranceConfig } from '../types';

export interface GeneratePdfOptions {
  machine: MachineInfo;
  runs: TestRun[];
  evaluation: OverallEvaluation;
  tolerance: ToleranceConfig;
  company: CompanyProfile;
}

export async function generateVaporiserPdf({
  machine,
  runs,
  evaluation,
  tolerance,
  company
}: GeneratePdfOptions): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const leftMargin = 14;
  const rightMargin = 14;
  const contentWidth = pageWidth - leftMargin - rightMargin;

  let currentY = 14;

  // 1. Watermark background if FAILED
  if (evaluation.hasMeasurements && !evaluation.isPassed) {
    doc.saveGraphicsState();
    // Diagonal bold FAILED watermark
    doc.setTextColor(239, 68, 68); // Red
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(54);
    
    // Low opacity for background watermark
    // jsPDF supports setGState in modern versions
    try {
      // @ts-expect-error jsPDF gstate
      doc.setGState(new doc.GState({ opacity: 0.08 }));
    } catch {
      // fallback
    }

    doc.text('FAILED - OUT OF TOLERANCE', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45
    });

    try {
      // @ts-expect-error jsPDF gstate
      doc.setGState(new doc.GState({ opacity: 1.0 }));
    } catch {
      // fallback
    }
    doc.restoreGraphicsState();
  }

  // 2. Company Logo / Header
  let logoRendered = false;
  if (company.logoDataUrl && company.logoDataUrl.startsWith('data:image')) {
    try {
      const img = new Image();
      img.src = company.logoDataUrl;
      await new Promise((resolve) => {
        if (img.complete) resolve(true);
        else {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
        }
      });

      const maxLogoW = 48;
      const maxLogoH = 20;
      let imgW = maxLogoW;
      let imgH = (img.height / img.width) * maxLogoW;
      if (imgH > maxLogoH) {
        imgH = maxLogoH;
        imgW = (img.width / img.height) * maxLogoH;
      }

      doc.addImage(company.logoDataUrl, leftMargin, currentY, imgW, imgH);
      logoRendered = true;
    } catch (e) {
      console.warn('Could not add logo to PDF', e);
    }
  }

  // Company details on the left (below or beside logo)
  if (!logoRendered) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(company.companyName || 'VETERINARY SERVICE & CALIBRATION', leftMargin, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(company.address || '', leftMargin, currentY + 10);
    doc.text(`Phone: ${company.phone || 'N/A'} | Email: ${company.email || 'N/A'}`, leftMargin, currentY + 14);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(company.companyName, leftMargin, currentY + 24);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${company.phone} | ${company.email}`, leftMargin, currentY + 28);
  }

  // Document Title & Reference on Right
  const rightX = pageWidth - rightMargin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('CALIBRATION CERTIFICATE', rightX, currentY + 4, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const certId = `CERT-VAP-${(machine.vaporiserSerial || '0000').slice(-6)}-${machine.testDate.replace(/-/g, '')}`;
  doc.text(`Cert Ref: ${certId}`, rightX, currentY + 9, { align: 'right' });
  doc.text(`Test Date: ${machine.testDate}`, rightX, currentY + 14, { align: 'right' });
  doc.text(`Next Due: ${machine.nextDueDate}`, rightX, currentY + 19, { align: 'right' });
  if (company.accreditationNumber) {
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Accreditation: ${company.accreditationNumber}`, rightX, currentY + 24, { align: 'right' });
  }

  currentY = logoRendered ? currentY + 32 : currentY + 22;

  // Top brand divider line (Vet1 Teal)
  doc.setDrawColor(9, 176, 187);
  doc.setLineWidth(0.8);
  doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY);
  currentY += 4;

  // 3. CRITICAL REQUIREMENT: "if the vaporiser fails place failed with an underline over the entire page in red"
  if (evaluation.hasMeasurements && !evaluation.isPassed) {
    // Top Emergency Failure Banner
    doc.setFillColor(254, 242, 242); // Red-50
    doc.setDrawColor(239, 68, 68); // Red-500
    doc.setLineWidth(1.2);
    doc.roundedRect(leftMargin, currentY, contentWidth, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(220, 38, 38); // Red-600
    doc.text('FAILED', pageWidth / 2, currentY + 9, { align: 'center' });

    doc.setFontSize(8.5);
    doc.text('ACCURACY OUT OF SPECIFICATION - NOT SAFE FOR CLINICAL USE', pageWidth / 2, currentY + 13.5, { align: 'center' });

    currentY += 19;

    // THE PROMINENT RED UNDERLINE OVER THE ENTIRE PAGE WIDTH
    doc.setDrawColor(220, 38, 38); // Bold Red
    doc.setLineWidth(1.8);
    // Draw across the entire width of the page
    doc.line(leftMargin, currentY, pageWidth - rightMargin, currentY);

    currentY += 4;
  } else if (evaluation.hasMeasurements && evaluation.isPassed) {
    // Passed Banner
    doc.setFillColor(240, 253, 244); // Green-50
    doc.setDrawColor(34, 197, 94); // Green-500
    doc.setLineWidth(0.8);
    doc.roundedRect(leftMargin, currentY, contentWidth, 12, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(22, 101, 52); // Green-800
    doc.text('PASSED - MEETS ACCURACY TOLERANCE SPECIFICATIONS', pageWidth / 2, currentY + 5.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(21, 128, 61);
    doc.text(`Complies with ISO 8835-4 standard (±${tolerance.percentage}% of dial setting / floor ±${tolerance.absoluteFloor}%)`, pageWidth / 2, currentY + 9.5, { align: 'center' });

    currentY += 15;
  } else {
    currentY += 2;
  }

  // 4. Equipment & Facility Information Box (Two-column layout)
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  const infoBoxHeight = 42;
  doc.roundedRect(leftMargin, currentY, contentWidth, infoBoxHeight, 1.5, 1.5, 'FD');

  const col1X = leftMargin + 4;
  const col2X = leftMargin + (contentWidth / 2) + 4;
  let infoY = currentY + 5;

  // Column 1: Client & Facility Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('CLIENT / MACHINE OWNER COMPANY', col1X, infoY);
  infoY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const clientCompany = machine.ownerCompanyName || machine.clinicName || 'Not specified';
  doc.text(`Company/Clinic: ${clientCompany}`, col1X, infoY);
  infoY += 3.8;
  if (machine.ownerDepartment) {
    doc.text(`Department/Room: ${machine.ownerDepartment}`, col1X, infoY);
    infoY += 3.8;
  }
  const clientAddr = machine.ownerAddress || machine.clinicAddress || 'Not specified';
  doc.text(`Facility Address: ${clientAddr}`, col1X, infoY);
  infoY += 3.8;
  if (machine.ownerContactPerson) {
    doc.text(`Contact: ${machine.ownerContactPerson}`, col1X, infoY);
    infoY += 3.8;
  }
  const clientEmail = machine.ownerContactEmail || machine.clinicContact || '';
  if (clientEmail) {
    doc.text(`Email: ${clientEmail}`, col1X, infoY);
    infoY += 3.8;
  }
  doc.text(`Tested By Tech: ${machine.technicianName || 'Certified Technician'}`, col1X, infoY);

  // Column 2: Equipment & Vaporiser Under Test
  infoY = currentY + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('EQUIPMENT & VAPORISER DETAILS', col2X, infoY);
  infoY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const machName = `${machine.machineManufacturer ? machine.machineManufacturer + ' ' : ''}${machine.machineModel || 'N/A'}`;
  doc.text(`Machine: ${machName} (S/N: ${machine.machineSerial || 'N/A'})`, col2X, infoY);
  infoY += 3.8;
  if (machine.machineAssetTag) {
    doc.text(`Asset Tag #: ${machine.machineAssetTag}`, col2X, infoY);
    infoY += 3.8;
  }
  doc.text(`Vaporiser Model: ${machine.vaporiserModel || 'N/A'}`, col2X, infoY);
  infoY += 3.8;
  doc.text(`Vaporiser S/N: ${machine.vaporiserSerial || 'N/A'}`, col2X, infoY);
  infoY += 3.8;
  
  // Highlight Mount Type & Agent
  doc.setFont('helvetica', 'bold');
  doc.text(`Mount System: ${machine.mountType} | Agent: ${machine.agent}`, col2X, infoY);
  infoY += 3.8;
  doc.setFont('helvetica', 'normal');
  doc.text(`Gas Analyser: ${machine.gasAnalyserModel} (S/N: ${machine.gasAnalyserSerial || 'N/A'})`, col2X, infoY);

  currentY += infoBoxHeight + 6;

  // 5. Test Results Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(7, 115, 122); // Vet1 Teal
  doc.text('CONCENTRATION OUTPUT MEASUREMENTS', leftMargin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Standard Tolerance: ±${tolerance.percentage}% (Absolute Floor ±${tolerance.absoluteFloor}%)`, pageWidth - rightMargin, currentY, { align: 'right' });

  currentY += 3;

  // Prepare table data from all runs
  const tableRows: (string | number)[][] = [];

  for (let rIdx = 0; rIdx < runs.length; rIdx++) {
    const run = runs[rIdx];
    const runEval = evaluation.runs.find((e) => e.runId === run.id);

    run.dialPoints.forEach((point) => {
      const evalPoint = runEval?.evaluations.find((p) => p.dialSetting === point.dialSetting);
      const measuredStr = point.measured !== undefined && point.measured !== null
        ? `${Number(point.measured).toFixed(2)}%`
        : 'Pending';

      const devStr = evalPoint && evalPoint.deviationPercent !== null
        ? `${evalPoint.deviationPercent > 0 ? '+' : ''}${evalPoint.deviationPercent.toFixed(1)}% (${evalPoint.deviation! > 0 ? '+' : ''}${evalPoint.deviation!.toFixed(2)}%)`
        : '-';

      const rangeStr = evalPoint
        ? `${evalPoint.minAllowable.toFixed(2)}% - ${evalPoint.maxAllowable.toFixed(2)}%`
        : '-';

      const statusStr = evalPoint ? evalPoint.status : 'PENDING';

      tableRows.push([
        `Run ${rIdx + 1} (${run.flowrate} L/min)`,
        `${point.dialSetting.toFixed(1)}%`,
        measuredStr,
        rangeStr,
        devStr,
        statusStr
      ]);
    });
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Test Run / Flowrate', 'Set Dial (%)', 'Measured (%)', 'Allowable Range', 'Deviation (%)', 'Status']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [7, 115, 122], // Vet1 Medical Teal
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      halign: 'center',
      cellPadding: 2.2
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold', cellWidth: 38 },
      1: { cellWidth: 26 },
      2: { cellWidth: 28, fontStyle: 'bold' },
      3: { cellWidth: 34 },
      4: { cellWidth: 34 },
      5: { cellWidth: 22, fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      // Color-code the status and measured column
      if (data.section === 'body') {
        const rowData = tableRows[data.row.index];
        const status = rowData[5];
        if (status === 'FAIL') {
          data.cell.styles.fillColor = [254, 242, 242]; // Light red
          if (data.column.index === 5) {
            data.cell.styles.textColor = [220, 38, 38]; // Bold red
          }
        } else if (status === 'PASS' && data.column.index === 5) {
          data.cell.styles.textColor = [22, 101, 52]; // Green
        }
      }
    }
  });

  // @ts-expect-error autotable lastAutoTable
  currentY = doc.lastAutoTable.finalY + 6;

  // 6. Notes & Comments Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(7, 115, 122); // Vet1 Teal
  doc.text('TECHNICIAN INSPECTION REMARKS & OBSERVATIONS', leftMargin, currentY);
  currentY += 3;

  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  const notesHeight = 18;
  doc.roundedRect(leftMargin, currentY, contentWidth, notesHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const splitNotes = doc.splitTextToSize(
    machine.notes || 'Vaporiser calibration test completed. Seals, interlock/mounting mechanism, and zero-lock inspected.',
    contentWidth - 6
  );
  doc.text(splitNotes, leftMargin + 3, currentY + 4.5);

  currentY += notesHeight + 6;

  // 7. Overall Certification Sign-off Section
  const signBoxHeight = 26;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(leftMargin, currentY, contentWidth, signBoxHeight, 1.5, 1.5, 'FD');

  const signCol1 = leftMargin + 4;
  const signCol2 = leftMargin + (contentWidth / 3) + 4;
  const signCol3 = leftMargin + ((contentWidth / 3) * 2) + 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TEST CONDUCTED BY:', signCol1, currentY + 5);
  doc.text('DATE OF INSPECTION:', signCol2, currentY + 5);
  doc.text('AUTHORIZED SIGNATURE:', signCol3, currentY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(machine.technicianName || 'Certified Technician', signCol1, currentY + 12);
  doc.text(machine.testDate, signCol2, currentY + 12);

  // Signature line
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(signCol3, currentY + 18, rightX - 6, currentY + 18);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Signature of Certified Biomedical Engineer', signCol3, currentY + 22);

  // 8. Footer (ISO standard note)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This certificate certifies the accuracy of the specified anaesthetic vaporiser under controlled test conditions using calibrated instrumentation. Compliant with ISO 8835-4 and AS 4187 standards.',
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  return doc;
}
