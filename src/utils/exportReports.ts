import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  InstansiItem,
  PelayananHarian,
  PengaduanMasyarakat,
  PermasalahanHarian,
  ReportFilter,
  SurveiKepuasan,
  UserRole,
} from '../types/mpp';

export interface ExportPayload {
  filter: ReportFilter;
  instansi: InstansiItem[];
  pelayanan: PelayananHarian[];
  permasalahan: PermasalahanHarian[];
  pengaduan: PengaduanMasyarakat[];
  survei: SurveiKepuasan[];
  printedBy: UserRole;
}

function getInstansiName(instansiList: InstansiItem[], id: string): string {
  return instansiList.find((i) => i.id === id)?.singkatan || id;
}

function getFilteredData(payload: ExportPayload) {
  const { filter, pelayanan, permasalahan, pengaduan, survei } = payload;

  const inRange = (dateStr: string) => {
    if (filter.tanggalMulai && dateStr < filter.tanggalMulai) return false;
    if (filter.tanggalSelesai && dateStr > filter.tanggalSelesai) return false;
    return true;
  };

  const fPelayanan = pelayanan.filter((p) => {
    if (!inRange(p.tanggal)) return false;
    if (filter.instansiId !== 'semua' && p.instansiId !== filter.instansiId) return false;
    return true;
  });

  const fPermasalahan = permasalahan.filter((m) => {
    if (!inRange(m.tanggalLaporan)) return false;
    if (filter.instansiId !== 'semua' && m.instansiId !== filter.instansiId) return false;
    if (filter.kategori !== 'semua' && m.kategoriMasalah !== filter.kategori) return false;
    return true;
  });

  const fPengaduan = pengaduan.filter((a) => {
    if (!inRange(a.tanggal)) return false;
    if (filter.instansiId !== 'semua' && a.instansiId !== filter.instansiId) return false;
    return true;
  });

  const fSurvei = survei.filter((s) => {
    if (!inRange(s.tanggal)) return false;
    if (filter.instansiId !== 'semua' && s.instansiId !== filter.instansiId) return false;
    return true;
  });

  const totalKunjungan = fPelayanan.reduce((acc, p) => acc + p.jumlahPemohon, 0);
  const pelayananSelesai = fPelayanan.reduce((acc, p) => acc + p.pelayananSelesai, 0);
  const pelayananTertunda = fPelayanan.reduce(
    (acc, p) => acc + p.pelayananTertunda + p.pelayananProses,
    0
  );
  const totalMasalah = fPermasalahan.length;
  const masalahSelesai = fPermasalahan.filter(
    (m) => m.status === 'Selesai' || m.status === 'Ditutup'
  ).length;
  const masalahBelumSelesai = totalMasalah - masalahSelesai;
  const avgIkm =
    fSurvei.length > 0
      ? (fSurvei.reduce((acc, s) => acc + s.skor, 0) / fSurvei.length).toFixed(2)
      : '0.00';

  const avgTunggu =
    fPelayanan.length > 0
      ? Math.round(
          fPelayanan.reduce((acc, p) => acc + p.rataRataWaktuTungguMenit, 0) /
            fPelayanan.length
        )
      : 0;

  return {
    fPelayanan,
    fPermasalahan,
    fPengaduan,
    fSurvei,
    summary: {
      totalKunjungan,
      pelayananSelesai,
      pelayananTertunda,
      totalMasalah,
      masalahSelesai,
      masalahBelumSelesai,
      totalPengaduan: fPengaduan.length,
      avgIkm,
      avgTunggu,
    },
  };
}

function buildFileSlug(filter: ReportFilter): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `Laporan_${filter.periode}_MPP_Kendal_${stamp}`;
}

export function exportReportToPdf(payload: ExportPayload): string {
  const { fPelayanan, fPermasalahan, fPengaduan, summary } = getFilteredData(payload);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Kop Resmi
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PEMERINTAH KABUPATEN KENDAL', pageWidth / 2, 16, { align: 'center' });
  doc.setFontSize(14);
  doc.text('MAL PELAYANAN PUBLIK (MPP) KABUPATEN KENDAL', pageWidth / 2, 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    'SIMPEL MPP Kendal — Sistem Informasi Monitoring Pelayanan Publik',
    pageWidth / 2,
    27,
    { align: 'center' }
  );
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.7);
  doc.line(14, 31, pageWidth - 14, 31);

  // Metadata Laporan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(
    `LAPORAN EVALUASI PELAYANAN PUBLIK (${payload.filter.periode.toUpperCase()})`,
    14,
    39
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const instLabel =
    payload.filter.instansiId === 'semua'
      ? 'Seluruh Instansi (10 Kelompok Layanan)'
      : getInstansiName(payload.instansi, payload.filter.instansiId);
  const printedAt = new Date().toLocaleString('id-ID');
  doc.text(`Rentang Tanggal : ${payload.filter.tanggalMulai} s/d ${payload.filter.tanggalSelesai}`, 14, 45);
  doc.text(`Cakupan Instansi : ${instLabel}`, 14, 50);
  doc.text(`Dicetak Oleh : ${payload.printedBy} · Waktu Cetak: ${printedAt}`, 14, 55);

  // Tabel 1: Ringkasan Format Laporan Otomatis (Bab 8.4)
  autoTable(doc, {
    startY: 60,
    head: [['Komponen Laporan Evaluasi', 'Capaian / Jumlah', 'Keterangan']],
    body: [
      ['Total Kunjungan Pemohon', `${summary.totalKunjungan} orang`, 'Jumlah masyarakat yang datang'],
      ['Pelayanan Selesai', `${summary.pelayananSelesai} layanan`, 'Permohonan tuntas diproses'],
      ['Pelayanan Dalam Proses / Tertunda', `${summary.pelayananTertunda} layanan`, 'Dalam antrean atau menunggu kelengkapan'],
      ['Rata-rata Waktu Tunggu', `${summary.avgTunggu} menit`, 'Rata-rata seluruh loket terpantau'],
      ['Total Permasalahan Tercatat', `${summary.totalMasalah} kasus`, 'Kendala operasional yang diinput petugas'],
      ['Permasalahan Selesai / Ditutup', `${summary.masalahSelesai} kasus`, 'Telah ditangani & diverifikasi'],
      ['Permasalahan Belum Selesai', `${summary.masalahBelumSelesai} kasus`, 'Masih proses, ditangani, atau eskalasi'],
      ['Pengaduan Masyarakat', `${summary.totalPengaduan} aduan`, 'Laporan langsung & kanal pengaduan'],
      ['Indeks Kepuasan Masyarakat (IKM)', `${summary.avgIkm} / 5.00`, 'Rata-rata hasil survei kepuasan'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [29, 78, 216], fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
  });

  // Tabel 2: Rekap Pelayanan per Instansi
  const afterSummaryY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 125;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. Rekapitulasi Aktivitas Pelayanan per Instansi', 14, afterSummaryY + 8);

  autoTable(doc, {
    startY: afterSummaryY + 11,
    head: [['Instansi', 'Loket', 'Pemohon', 'Selesai', 'Proses/Tunda', 'Tunggu (Mnt)']],
    body: fPelayanan.map((p) => [
      getInstansiName(payload.instansi, p.instansiId),
      p.loket,
      String(p.jumlahPemohon),
      String(p.pelayananSelesai),
      String(p.pelayananProses + p.pelayananTertunda),
      `${p.rataRataWaktuTungguMenit} mnt`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2.2 },
  });

  // Tabel 3: Daftar Permasalahan Harian & Tindak Lanjut
  const afterPelayananY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 180;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. Identifikasi Permasalahan & Status Tindak Lanjut', 14, afterPelayananY + 8);

  autoTable(doc, {
    startY: afterPelayananY + 11,
    head: [['Kode', 'Tanggal', 'Instansi', 'Kategori & Uraian Masalah', 'Prioritas', 'PIC', 'Status']],
    body:
      fPermasalahan.length > 0
        ? fPermasalahan.map((m) => [
            m.kodeLaporan,
            m.tanggalLaporan,
            getInstansiName(payload.instansi, m.instansiId),
            `${m.kategoriMasalah}: ${m.uraianMasalah}`,
            m.tingkatPrioritas,
            m.picPenanganan,
            m.status,
          ])
        : [['-', '-', '-', 'Tidak ada permasalahan tercatat pada periode ini.', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      3: { cellWidth: 62 },
    },
  });

  // Pengaduan ringkas & Blok Tanda Tangan
  const afterProbY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 230;
  let cursorY = afterProbY + 10;
  if (cursorY > 250) {
    doc.addPage();
    cursorY = 20;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `Ringkasan Evaluasi: Tercatat ${fPengaduan.length} pengaduan masyarakat dengan tingkat penyelesaian masalah ${
      summary.totalMasalah > 0
        ? Math.round((summary.masalahSelesai / summary.totalMasalah) * 100)
        : 100
    }%.`,
    14,
    cursorY
  );

  doc.text(`Kendal, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - 70, cursorY + 12);
  doc.text('Pengelola MPP Kabupaten Kendal', pageWidth - 70, cursorY + 17);
  doc.text('( ........................................... )', pageWidth - 70, cursorY + 34);

  const filename = `${buildFileSlug(payload.filter)}.pdf`;
  doc.save(filename);
  return filename;
}

export function exportReportToExcel(payload: ExportPayload): string {
  const { fPelayanan, fPermasalahan, fPengaduan, fSurvei, summary } = getFilteredData(payload);

  const wb = XLSX.utils.book_new();

  // Sheet 1: Ringkasan Eksekutif (Bab 8.4)
  const ringkasanRows = [
    ['PEMERINTAH KABUPATEN KENDAL — MAL PELAYANAN PUBLIK (MPP)'],
    ['SISTEM INFORMASI MONITORING PELAYANAN PUBLIK (SIMPEL MPP KENDAL)'],
    [`Periode Laporan: ${payload.filter.periode} (${payload.filter.tanggalMulai} s/d ${payload.filter.tanggalSelesai})`],
    [`Dicetak oleh: ${payload.printedBy}`, `Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`],
    [],
    ['Komponen Laporan', 'Nilai', 'Keterangan'],
    ['Total Kunjungan Pemohon', summary.totalKunjungan, 'Jumlah masyarakat yang datang'],
    ['Pelayanan Selesai', summary.pelayananSelesai, 'Jumlah layanan yang selesai'],
    ['Pelayanan Proses / Tertunda', summary.pelayananTertunda, 'Jumlah layanan belum selesai'],
    ['Rata-rata Waktu Tunggu (Menit)', summary.avgTunggu, 'Rata-rata waktu tunggu loket'],
    ['Total Permasalahan Tercatat', summary.totalMasalah, 'Jumlah kendala operasional'],
    ['Permasalahan Selesai', summary.masalahSelesai, 'Jumlah masalah yang diselesaikan'],
    ['Permasalahan Belum Selesai', summary.masalahBelumSelesai, 'Jumlah masalah dalam penanganan'],
    ['Pengaduan Masyarakat', summary.totalPengaduan, 'Jumlah aduan masyarakat'],
    ['Indeks Kepuasan Masyarakat (IKM)', summary.avgIkm, 'Skala 1.00 - 5.00'],
  ];
  const wsRingkasan = XLSX.utils.aoa_to_sheet(ringkasanRows);
  wsRingkasan['!cols'] = [{ wch: 36 }, { wch: 20 }, { wch: 42 }];
  XLSX.utils.book_append_sheet(wb, wsRingkasan, 'Ringkasan_Evaluasi');

  // Sheet 2: Data Pelayanan
  const pelayananRows = fPelayanan.map((p, idx) => ({
    No: idx + 1,
    Tanggal: p.tanggal,
    Instansi: getInstansiName(payload.instansi, p.instansiId),
    Loket: p.loket,
    'Jenis Layanan': p.jenisLayanan,
    'Jumlah Pemohon': p.jumlahPemohon,
    'Pelayanan Selesai': p.pelayananSelesai,
    'Dalam Proses': p.pelayananProses,
    Tertunda: p.pelayananTertunda,
    'Antrean Terakhir': p.nomorAntreanTerakhir,
    'Rata-rata Tunggu (Menit)': p.rataRataWaktuTungguMenit,
    'Pembaruan Terakhir': p.diperbaruiPada,
  }));
  const wsPelayanan = XLSX.utils.json_to_sheet(
    pelayananRows.length > 0
      ? pelayananRows
      : [{ Info: 'Tidak ada data pelayanan pada filter terpilih' }]
  );
  wsPelayanan['!cols'] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 18 },
    { wch: 26 },
    { wch: 32 },
    { wch: 15 },
    { wch: 16 },
    { wch: 13 },
    { wch: 10 },
    { wch: 15 },
    { wch: 22 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPelayanan, 'Data_Pelayanan');

  // Sheet 3: Permasalahan Harian (14 field Bab 5.3)
  const masalahRows = fPermasalahan.map((m, idx) => ({
    No: idx + 1,
    Kode: m.kodeLaporan,
    'Tanggal Laporan': m.tanggalLaporan,
    'Waktu Kejadian': m.waktuKejadian,
    'Nama Instansi': getInstansiName(payload.instansi, m.instansiId),
    'Nama Loket': m.namaLoket,
    'Kategori Masalah': m.kategoriMasalah,
    'Uraian Masalah': m.uraianMasalah,
    Dampak: m.dampak,
    'Tingkat Prioritas': m.tingkatPrioritas,
    'PIC Penanganan': m.picPenanganan,
    'Tindakan Penanganan': m.tindakanPenanganan,
    Status: m.status,
    'Waktu Penyelesaian': m.waktuPenyelesaian || '-',
    'Durasi (Menit)': m.durasiMenit ?? '-',
    'Catatan Evaluasi': m.catatanEvaluasi,
    'Masalah Berulang': m.berulang ? 'Ya' : 'Tidak',
  }));
  const wsMasalah = XLSX.utils.json_to_sheet(
    masalahRows.length > 0
      ? masalahRows
      : [{ Info: 'Tidak ada data permasalahan pada filter terpilih' }]
  );
  wsMasalah['!cols'] = [
    { wch: 5 },
    { wch: 15 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 24 },
    { wch: 22 },
    { wch: 42 },
    { wch: 32 },
    { wch: 14 },
    { wch: 18 },
    { wch: 38 },
    { wch: 12 },
    { wch: 18 },
    { wch: 14 },
    { wch: 35 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMasalah, 'Permasalahan_Harian');

  // Sheet 4: Pengaduan & Survei
  const aduanRows = fPengaduan.map((a, idx) => ({
    No: idx + 1,
    Tanggal: a.tanggal,
    Waktu: a.waktu,
    Pelapor: a.namaPelapor,
    Kontak: a.kontakPelapor,
    Instansi: getInstansiName(payload.instansi, a.instansiId),
    Kanal: a.kanal,
    'Isi Pengaduan': a.isiPengaduan,
    Status: a.status,
    Tanggapan: a.tanggapan || '-',
  }));
  const wsAduan = XLSX.utils.json_to_sheet(
    aduanRows.length > 0 ? aduanRows : [{ Info: 'Belum ada pengaduan pada periode ini' }]
  );
  XLSX.utils.book_append_sheet(wb, wsAduan, 'Pengaduan_Masyarakat');

  const surveiRows = fSurvei.map((s, idx) => ({
    No: idx + 1,
    Tanggal: s.tanggal,
    Instansi: getInstansiName(payload.instansi, s.instansiId),
    'Jenis Layanan': s.jenisLayanan,
    'Skor (1-5)': s.skor,
    'Aspek Terbaik': s.aspekTerbaik,
    Masukan: s.masukan,
  }));
  const wsSurvei = XLSX.utils.json_to_sheet(
    surveiRows.length > 0 ? surveiRows : [{ Info: 'Belum ada data survei' }]
  );
  XLSX.utils.book_append_sheet(wb, wsSurvei, 'Survei_Kepuasan');

  const filename = `${buildFileSlug(payload.filter)}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
}

function makeDocxCell(text: string, bold = false, shaded = false): TableCell {
  return new TableCell({
    shading: shaded ? { fill: 'EFF6FF' } : undefined,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    },
    children: [
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text,
            bold,
            size: 19,
            font: 'Calibri',
          }),
        ],
      }),
    ],
  });
}

export async function exportReportToWord(payload: ExportPayload): Promise<string> {
  const { fPelayanan, fPermasalahan, fPengaduan, summary } = getFilteredData(payload);

  const instLabel =
    payload.filter.instansiId === 'semua'
      ? 'Seluruh Instansi (10 Kelompok Layanan)'
      : getInstansiName(payload.instansi, payload.filter.instansiId);

  const summaryTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          makeDocxCell('Komponen Evaluasi', true, true),
          makeDocxCell('Capaian / Jumlah', true, true),
          makeDocxCell('Keterangan', true, true),
        ],
      }),
      new TableRow({
        children: [
          makeDocxCell('Total Kunjungan Pemohon'),
          makeDocxCell(`${summary.totalKunjungan} orang`, true),
          makeDocxCell('Jumlah masyarakat yang datang ke MPP Kendal'),
        ],
      }),
      new TableRow({
        children: [
          makeDocxCell('Pelayanan Selesai'),
          makeDocxCell(`${summary.pelayananSelesai} layanan`, true),
          makeDocxCell('Permohonan yang telah tuntas diproses'),
        ],
      }),
      new TableRow({
        children: [
          makeDocxCell('Pelayanan Proses / Tertunda'),
          makeDocxCell(`${summary.pelayananTertunda} layanan`, true),
          makeDocxCell('Masih dalam proses loket atau menunggu syarat'),
        ],
      }),
      new TableRow({
        children: [
          makeDocxCell('Total Permasalahan Tercatat'),
          makeDocxCell(`${summary.totalMasalah} kasus`, true),
          makeDocxCell(`Selesai: ${summary.masalahSelesai} · Belum Selesai: ${summary.masalahBelumSelesai}`),
        ],
      }),
      new TableRow({
        children: [
          makeDocxCell('Pengaduan & Indeks Kepuasan (IKM)'),
          makeDocxCell(`${summary.totalPengaduan} aduan · IKM ${summary.avgIkm}/5`, true),
          makeDocxCell(`Rata-rata waktu tunggu: ${summary.avgTunggu} menit`),
        ],
      }),
    ],
  });

  const pelayananTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          makeDocxCell('Instansi', true, true),
          makeDocxCell('Loket', true, true),
          makeDocxCell('Pemohon', true, true),
          makeDocxCell('Selesai', true, true),
          makeDocxCell('Proses/Tunda', true, true),
          makeDocxCell('Waktu Tunggu', true, true),
        ],
      }),
      ...fPelayanan.map(
        (p) =>
          new TableRow({
            children: [
              makeDocxCell(getInstansiName(payload.instansi, p.instansiId)),
              makeDocxCell(p.loket),
              makeDocxCell(String(p.jumlahPemohon)),
              makeDocxCell(String(p.pelayananSelesai)),
              makeDocxCell(String(p.pelayananProses + p.pelayananTertunda)),
              makeDocxCell(`${p.rataRataWaktuTungguMenit} menit`),
            ],
          })
      ),
    ],
  });

  const masalahTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          makeDocxCell('Kode & Tanggal', true, true),
          makeDocxCell('Instansi', true, true),
          makeDocxCell('Uraian Permasalahan', true, true),
          makeDocxCell('Prioritas', true, true),
          makeDocxCell('PIC & Status', true, true),
        ],
      }),
      ...(fPermasalahan.length > 0
        ? fPermasalahan.map(
            (m) =>
              new TableRow({
                children: [
                  makeDocxCell(`${m.kodeLaporan}\n${m.tanggalLaporan}`),
                  makeDocxCell(getInstansiName(payload.instansi, m.instansiId)),
                  makeDocxCell(`[${m.kategoriMasalah}] ${m.uraianMasalah}\nTindakan: ${m.tindakanPenanganan || '-'}`),
                  makeDocxCell(m.tingkatPrioritas),
                  makeDocxCell(`${m.picPenanganan}\nStatus: ${m.status}`),
                ],
              })
          )
        : [
            new TableRow({
              children: [
                makeDocxCell('-'),
                makeDocxCell('-'),
                makeDocxCell('Tidak ada permasalahan tercatat pada periode terpilih.'),
                makeDocxCell('-'),
                makeDocxCell('-'),
              ],
            }),
          ]),
    ],
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'PEMERINTAH KABUPATEN KENDAL',
                bold: true,
                size: 26,
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'MAL PELAYANAN PUBLIK (MPP) KABUPATEN KENDAL',
                bold: true,
                size: 28,
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: 'Laporan Evaluasi Pelayanan Publik & Identifikasi Permasalahan (SIMPEL MPP)',
                size: 20,
                italics: true,
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: `LAPORAN MONITORING PERIODE ${payload.filter.periode.toUpperCase()}`,
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `Rentang Tanggal: ${payload.filter.tanggalMulai} s/d ${payload.filter.tanggalSelesai} | Cakupan: ${instLabel} | Dicetak oleh: ${payload.printedBy}`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 120, after: 80 },
            children: [new TextRun({ text: 'A. Ringkasan Eksekutif Pelayanan', bold: true, size: 22 })],
          }),
          summaryTable,
          new Paragraph({
            spacing: { before: 240, after: 80 },
            children: [new TextRun({ text: 'B. Rekapitulasi Pelayanan per Instansi', bold: true, size: 22 })],
          }),
          pelayananTable,
          new Paragraph({
            spacing: { before: 240, after: 80 },
            children: [new TextRun({ text: 'C. Daftar Permasalahan & Tindak Lanjut', bold: true, size: 22 })],
          }),
          masalahTable,
          new Paragraph({
            spacing: { before: 240, after: 80 },
            children: [new TextRun({ text: 'D. Catatan Evaluasi & Pengaduan', bold: true, size: 22 })],
          }),
          new Paragraph({
            spacing: { after: 320 },
            children: [
              new TextRun({
                text: `Tercatat ${fPengaduan.length} pengaduan masyarakat pada periode ini. Pengelola MPP terus mengawal tindak lanjut lintas instansi agar penyelesaian kendala memenuhi target SLA internal.`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Kendal, ${new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 600 },
            children: [
              new TextRun({
                text: 'Pengelola Mal Pelayanan Publik Kabupaten Kendal',
                bold: true,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: '( ..................................................... )',
                size: 20,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${buildFileSlug(payload.filter)}.docx`;
  saveAs(blob, filename);
  return filename;
}
