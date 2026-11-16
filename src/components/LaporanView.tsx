import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { TODAY_ISO } from '../data/initialData';
import {
  InstansiItem,
  PelayananHarian,
  PengaduanMasyarakat,
  PermasalahanHarian,
  ReportFilter,
  SurveiKepuasan,
  UserRole,
} from '../types/mpp';
import { ExportButtonsBar } from './ExportButtonsBar';
import { PriorityLabel, StatusLabel } from './StatusLabel';

interface LaporanViewProps {
  instansi: InstansiItem[];
  pelayanan: PelayananHarian[];
  permasalahan: PermasalahanHarian[];
  pengaduan: PengaduanMasyarakat[];
  survei: SurveiKepuasan[];
  currentRole: UserRole;
  onExported: (format: 'PDF' | 'Excel' | 'Word', filename: string) => void;
}

function getDateNDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function LaporanView({
  instansi,
  pelayanan,
  permasalahan,
  pengaduan,
  survei,
  currentRole,
  onExported,
}: LaporanViewProps) {
  const [periode, setPeriode] = useState<'Harian' | 'Mingguan' | 'Bulanan'>('Harian');
  const [tanggalMulai, setTanggalMulai] = useState(TODAY_ISO);
  const [tanggalSelesai, setTanggalSelesai] = useState(TODAY_ISO);
  const [instansiId, setInstansiId] = useState('semua');
  const [kategori, setKategori] = useState('semua');

  const handlePeriodeSwitch = (next: 'Harian' | 'Mingguan' | 'Bulanan') => {
    setPeriode(next);
    if (next === 'Harian') {
      setTanggalMulai(TODAY_ISO);
      setTanggalSelesai(TODAY_ISO);
    } else if (next === 'Mingguan') {
      setTanggalMulai(getDateNDaysAgo(7));
      setTanggalSelesai(TODAY_ISO);
    } else {
      setTanggalMulai(getDateNDaysAgo(30));
      setTanggalSelesai(TODAY_ISO);
    }
  };

  const filter: ReportFilter = {
    periode,
    tanggalMulai,
    tanggalSelesai,
    instansiId,
    kategori,
  };

  const inRange = (d: string) => d >= tanggalMulai && d <= tanggalSelesai;

  const fPelayanan = pelayanan.filter(
    (p) => inRange(p.tanggal) && (instansiId === 'semua' || p.instansiId === instansiId)
  );
  const fPermasalahan = permasalahan.filter(
    (m) =>
      inRange(m.tanggalLaporan) &&
      (instansiId === 'semua' || m.instansiId === instansiId) &&
      (kategori === 'semua' || m.kategoriMasalah === kategori)
  );
  const fPengaduan = pengaduan.filter(
    (a) => inRange(a.tanggal) && (instansiId === 'semua' || a.instansiId === instansiId)
  );
  const fSurvei = survei.filter(
    (s) => inRange(s.tanggal) && (instansiId === 'semua' || s.instansiId === instansiId)
  );

  const totalKunjungan = fPelayanan.reduce((acc, p) => acc + p.jumlahPemohon, 0);
  const pelayananSelesai = fPelayanan.reduce((acc, p) => acc + p.pelayananSelesai, 0);
  const pelayananTertunda = fPelayanan.reduce(
    (acc, p) => acc + p.pelayananProses + p.pelayananTertunda,
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

  const getInstansiName = (id: string) =>
    instansi.find((i) => i.id === id)?.singkatan || id;

  return (
    <div className="space-y-6">
      {/* Filter & Export Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Pusat Pelaporan & Ekspor Evaluasi MPP Kendal
            </h2>
            <p className="text-xs text-slate-500">
              Pilih periode dan filter untuk mengunduh laporan resmi dalam format PDF, Excel (.xlsx), atau Word (.docx)
            </p>
          </div>
          <ExportButtonsBar
            filter={filter}
            instansi={instansi}
            pelayanan={pelayanan}
            permasalahan={permasalahan}
            pengaduan={pengaduan}
            survei={survei}
            printedBy={currentRole}
            onExported={onExported}
            showPrint
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Jenis Periode
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {(['Harian', 'Mingguan', 'Bulanan'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePeriodeSwitch(p)}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    periode === p ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Dari Tanggal
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Sampai Tanggal
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Instansi
            </label>
            <select
              value={instansiId}
              onChange={(e) => setInstansiId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="semua">Semua Instansi</option>
              {instansi.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.singkatan}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Kategori Masalah
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="semua">Semua Kategori</option>
              <option value="Sistem & Jaringan">Sistem & Jaringan</option>
              <option value="Antrean & Waktu Tunggu">Antrean & Waktu Tunggu</option>
              <option value="Persyaratan & Dokumen">Persyaratan & Dokumen</option>
              <option value="SDM & Petugas">SDM & Petugas</option>
              <option value="Sarana & Prasarana">Sarana & Prasarana</option>
              <option value="Koordinasi & Informasi">Koordinasi & Informasi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pratinjau Dokumen Laporan Resmi (Format Bab 8.4) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6">
        <div className="text-center border-b-2 border-slate-900 pb-4">
          <div className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
            Pemerintah Kabupaten Kendal
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            MAL PELAYANAN PUBLIK (MPP) KABUPATEN KENDAL
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Laporan Evaluasi Pelayanan Publik Periode {periode} ({tanggalMulai} s/d {tanggalSelesai})
          </p>
        </div>

        {/* Format Laporan Otomatis Bab 8.4 */}
        <div>
          <h4 className="text-xs font-semibold text-slate-900 mb-3">
            A. Ringkasan Komponen Laporan Otomatis
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                  <th className="py-2.5 px-4">Komponen Laporan</th>
                  <th className="py-2.5 px-4">Capaian</th>
                  <th className="py-2.5 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-900">Periode Tanggal</td>
                  <td className="py-2.5 px-4 font-mono">
                    {tanggalMulai} s/d {tanggalSelesai}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">Laporan evaluasi {periode.toLowerCase()}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-900">Total Kunjungan</td>
                  <td className="py-2.5 px-4 font-mono font-semibold">{totalKunjungan} pemohon</td>
                  <td className="py-2.5 px-4 text-slate-500">Jumlah masyarakat yang datang</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-900">Pelayanan Selesai</td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-emerald-700">
                    {pelayananSelesai} layanan
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">Jumlah layanan yang selesai diproses</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-900">Pelayanan Tertunda / Proses</td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-amber-700">
                    {pelayananTertunda} layanan
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">Jumlah layanan dalam antrean atau tertunda</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-900">Total Masalah Tercatat</td>
                  <td className="py-2.5 px-4 font-mono font-semibold">{totalMasalah} kasus</td>
                  <td className="py-2.5 px-4 text-slate-500">Kendala operasional yang diinput petugas</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-900">Masalah Selesai</td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-emerald-700">
                    {masalahSelesai} kasus
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">Telah diselesaikan dan diverifikasi</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-900">Masalah Belum Selesai</td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-rose-700">
                    {masalahBelumSelesai} kasus
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">Masih dalam penanganan atau eskalasi</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-900">Pengaduan & IKM</td>
                  <td className="py-2.5 px-4 font-mono font-semibold">
                    {fPengaduan.length} aduan · IKM {avgIkm}/5.00
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">Ringkasan kanal pengaduan dan survei</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Rincian Permasalahan Periode Ini */}
        <div>
          <h4 className="text-xs font-semibold text-slate-900 mb-3">
            B. Rincian Permasalahan & Tindak Lanjut ({fPermasalahan.length} Kasus)
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Instansi</th>
                  <th className="py-2.5 px-3">Permasalahan</th>
                  <th className="py-2.5 px-3">Prioritas</th>
                  <th className="py-2.5 px-3">PIC</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fPermasalahan.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-5 text-center text-slate-500">
                      Tidak ada catatan permasalahan pada filter tanggal dan instansi ini.
                    </td>
                  </tr>
                ) : (
                  fPermasalahan.map((m) => (
                    <tr key={m.id}>
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">{m.kodeLaporan}</td>
                      <td className="py-2.5 px-3 font-medium">
                        {getInstansiName(m.instansiId)}
                      </td>
                      <td className="py-2.5 px-3">{m.uraianMasalah}</td>
                      <td className="py-2.5 px-3">
                        <PriorityLabel level={m.tingkatPrioritas} />
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">{m.picPenanganan}</td>
                      <td className="py-2.5 px-3">
                        <StatusLabel status={m.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
