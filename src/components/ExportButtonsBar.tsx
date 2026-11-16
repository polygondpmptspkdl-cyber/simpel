import { FileSpreadsheet, FileText, FileType2, Printer } from 'lucide-react';
import { useState } from 'react';
import {
  InstansiItem,
  PelayananHarian,
  PengaduanMasyarakat,
  PermasalahanHarian,
  ReportFilter,
  SurveiKepuasan,
  UserRole,
} from '../types/mpp';
import {
  exportReportToExcel,
  exportReportToPdf,
  exportReportToWord,
} from '../utils/exportReports';

interface ExportButtonsBarProps {
  filter: ReportFilter;
  instansi: InstansiItem[];
  pelayanan: PelayananHarian[];
  permasalahan: PermasalahanHarian[];
  pengaduan: PengaduanMasyarakat[];
  survei: SurveiKepuasan[];
  printedBy: UserRole;
  onExported: (format: 'PDF' | 'Excel' | 'Word', filename: string) => void;
  showPrint?: boolean;
}

export function ExportButtonsBar({
  filter,
  instansi,
  pelayanan,
  permasalahan,
  pengaduan,
  survei,
  printedBy,
  onExported,
  showPrint = false,
}: ExportButtonsBarProps) {
  const [exportingWord, setExportingWord] = useState(false);

  const payload = {
    filter,
    instansi,
    pelayanan,
    permasalahan,
    pengaduan,
    survei,
    printedBy,
  };

  const handlePdf = () => {
    const filename = exportReportToPdf(payload);
    onExported('PDF', filename);
  };

  const handleExcel = () => {
    const filename = exportReportToExcel(payload);
    onExported('Excel', filename);
  };

  const handleWord = async () => {
    try {
      setExportingWord(true);
      const filename = await exportReportToWord(payload);
      onExported('Word', filename);
    } finally {
      setExportingWord(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 no-print">
      <button
        type="button"
        onClick={handlePdf}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
      >
        <FileText className="w-4 h-4 shrink-0" />
        <span>Cetak PDF</span>
      </button>

      <button
        type="button"
        onClick={handleExcel}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        <FileSpreadsheet className="w-4 h-4 shrink-0" />
        <span>Ekspor Excel</span>
      </button>

      <button
        type="button"
        onClick={handleWord}
        disabled={exportingWord}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        <FileType2 className="w-4 h-4 shrink-0" />
        <span>{exportingWord ? 'Menyiapkan Word...' : 'Ekspor Word'}</span>
      </button>

      {showPrint && (
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Printer className="w-4 h-4 shrink-0" />
          <span>Cetak Layar</span>
        </button>
      )}
    </div>
  );
}
