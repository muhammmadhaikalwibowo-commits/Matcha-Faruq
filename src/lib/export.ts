import { formatRupiah } from './rules';

export interface RekapRow {
  no: number;
  pesananId: string;
  pembeli: string;
  itemRingkas: string;
  total: number;
  statusLabel: string;
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportRekapCSV(rows: RekapRow[], filename = 'rekap-pesanan-matcha.csv'): void {
  const headers = ['No', 'Kode Pesanan', 'Pembeli', 'Item', 'Status', 'Total (Rp)'];
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((r) =>
      [r.no, `#${r.pesananId}`, r.pembeli, r.itemRingkas, r.statusLabel, r.total]
        .map(escapeCsvCell)
        .join(',')
    ),
  ];

  const csvContent = `\uFEFF${lines.join('\n')}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
}

function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/**
 * Menghasilkan file PDF 1.4 valid secara langsung di browser tanpa dependensi eksternal.
 */
export function exportRekapPDF(
  rows: RekapRow[],
  summaryText: string,
  filename = 'rekap-pesanan-matcha.pdf'
): void {
  const lines: string[] = [
    'BT',
    '/F1 16 Tf',
    '40 800 Td',
    `(${escapePdfText('MATCHA - Rekap Pesanan Open PO')}) Tj`,
    '/F1 10 Tf',
    '0 -20 Td',
    `(${escapePdfText(summaryText)}) Tj`,
    '0 -22 Td',
    '(No   Kode        Pembeli               Item                           Total) Tj',
    '0 -10 Td',
    '(-----------------------------------------------------------------------------------) Tj',
  ];

  let yOffset = -16;
  const maxRows = Math.min(rows.length, 38);
  for (let i = 0; i < maxRows; i++) {
    const r = rows[i];
    const noCol = String(r.no).padEnd(4, ' ');
    const codeCol = `#${r.pesananId}`.padEnd(11, ' ');
    const buyerCol = r.pembeli.slice(0, 19).padEnd(21, ' ');
    const itemCol = r.itemRingkas.slice(0, 28).padEnd(30, ' ');
    const totalCol = formatRupiah(r.total);
    const lineText = `${noCol}${codeCol}${buyerCol}${itemCol}${totalCol}`;
    lines.push(`0 ${yOffset} Td`);
    lines.push(`(${escapePdfText(lineText)}) Tj`);
    yOffset = -15;
  }

  lines.push('ET');
  const streamContent = lines.join('\n');

  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
