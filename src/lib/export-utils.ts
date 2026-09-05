import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportCandidateData {
  rank?: number | string;
  name: string;
  rollNo: string;
  branch: string;
  section: string;
  year: string;
  gender: string;
  primaryDomain: string;
  email: string;
  contactNo: string;
  piScore?: number;
  finalScore?: number;
  selectionStatus: string;
  recommendation?: string;
}

export function generateCSV(data: ExportCandidateData[]): string {
  if (!data || data.length === 0) return '';
  const worksheet = XLSX.utils.json_to_sheet(data);
  return XLSX.utils.sheet_to_csv(worksheet);
}

export function generateExcelBuffer(data: ExportCandidateData[], sheetName = 'Recruitment Candidates'): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export function generatePDFBuffer(
  data: ExportCandidateData[],
  title = 'BINARY CLUB — RECRUITMENT SELECTION REPORT'
): Buffer {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  // Header Banner - Ocean Blue #3B1EFF (RGB: 59, 30, 255)
  doc.setFillColor(59, 30, 255);
  doc.rect(0, 0, 842, 60, 'F');

  // Title Text - Cool White #D7E8FA
  doc.setTextColor(215, 232, 250);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 40, 38);

  // Date Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Total Candidates: ${data.length}`, 600, 38);

  // Table columns
  const head = [['Rank', 'Name', 'Roll No', 'Branch', 'Sec', 'Year', 'Domain', 'PI Score', 'Final Score', 'Status']];
  
  const body = data.map((item, idx) => [
    item.rank || idx + 1,
    item.name,
    item.rollNo,
    item.branch,
    item.section,
    item.year,
    item.primaryDomain,
    item.piScore != null ? item.piScore.toFixed(1) : '-',
    item.finalScore != null ? item.finalScore.toFixed(1) : '-',
    item.selectionStatus,
  ]);

  autoTable(doc, {
    head: head,
    body: body,
    startY: 75,
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [35, 31, 26], textColor: [93, 251, 194], fontStyle: 'bold' }, // Dark surface & Lime Green text
    alternateRowStyles: { fillColor: [245, 248, 252] },
    margin: { left: 40, right: 40 },
  });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
