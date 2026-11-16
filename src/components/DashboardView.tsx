import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquareHeart,
  Pause,
  Play,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { TODAY_ISO } from '../data/initialData';
import {
  InstansiItem,
  NavTab,
  PelayananHarian,
  PengaduanMasyarakat,
  PermasalahanHarian,
  SurveiKepuasan,
  TrenHarianPoint,
  UserRole,
} from '../types/mpp';
import {
  AgencyServiceBarChart,
  ProblemCategoryChart,
  ServiceAndSatisfactionTrendChart,
} from './Charts';
import { KendalBannerArtwork } from './CivicThemeDecor';
import { ExportButtonsBar } from './ExportButtonsBar';
import { PublicAspirationModal } from './PublicAspirationModal';
import { PriorityLabel, StatusLabel } from './StatusLabel';

interface DashboardViewProps {
  instansi: InstansiItem[];
  pelayanan: PelayananHarian[];
  permasalahan: PermasalahanHarian[];
  pengaduan: PengaduanMasyarakat[];
  survei: SurveiKepuasan[];
  trenMingguan: TrenHarianPoint[];
  realtimeEnabled: boolean;
  onToggleRealtime: () => void;
  lastUpdated: string;
  currentRole: UserRole;
  onNavigate: (tab: NavTab) => void;
  onAddPengaduan: (
    payload: Omit<PengaduanMasyarakat, 'id' | 'status' | 'tanggapan'>
  ) => void;
  onExported: (format: 'PDF' | 'Excel' | 'Word', filename: string) => void;
}

export function DashboardView({
  instansi,
  pelayanan,
  permasalahan,
  pengaduan,
  survei,
  trenMingguan,
  realtimeEnabled,
  onToggleRealtime,
  lastUpdated,
  currentRole,
  onNavigate,
  onAddPengaduan,
  onExported,
}: DashboardViewProps) {
  const [showAspirationModal, setShowAspirationModal] = useState(false);
  const todayServices = pelayanan.filter((p) => p.tanggal === TODAY_ISO);
  const totalPemohon = todayServices.reduce((acc, cur) => acc + cur.jumlahPemohon, 0);
  const totalSelesai = todayServices.reduce((acc, cur) => acc + cur.pelayananSelesai, 0);
  const totalDalamProses = todayServices.reduce(
    (acc, cur) => acc + cur.pelayananProses + cur.pelayananTertunda,
    0
  );
  const pctSelesai = totalPemohon > 0 ? Math.round((totalSelesai / totalPemohon) * 100) : 100;
  const avgTunggu =
    todayServices.length > 0
      ? Math.round(
          todayServices.reduce((acc, cur) => acc + cur.rataRataWaktuTungguMenit, 0) /
            todayServices.length
        )
      : 0;

  const totalMasalah = permasalahan.length;
  const masalahBelumSelesai = permasalahan.filter(
    (m) => m.status !== 'Selesai' && m.status !== 'Ditutup'
  );
  const masalahPrioritasTinggi = masalahBelumSelesai.filter(
    (m) => m.tingkatPrioritas === 'Tinggi' || m.tingkatPrioritas === 'Kritis'
  );
  const belumDitindaklanjuti = permasalahan.filter((m) => m.status === 'Baru' || m.status === 'Proses');

  const avgIkm =
    survei.length > 0
      ? (survei.reduce((acc, s) => acc + s.skor, 0) / survei.length).toFixed(2)
      : '0.00';

  const getInstansiName = (id: string) =>
    instansi.find((i) => i.id === id)?.singkatan || id;

  return (
    <div className="space-y-6">
      {/* Blue Civic Hero Banner matching SIMPEL MPP Kendal Design */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a4ab8] via-[#1363df] to-[#1e88e5] text-white shadow-sm">
        <div className="absolute inset-y-0 right-0 w-full md:w-[60%] pointer-events-none">
          <KendalBannerArtwork />
        </div>

        <div className="relative z-10 p-6 sm:p-7 max-w-2xl space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-balance">
            Pelayanan Publik Lebih Mudah,{' '}
            <span className="text-amber-300">Transparan dan Akuntabel</span>
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-lg">
            Melalui SIMPEL MPP, pantau dan akses layanan publik Kabupaten Kendal secara real-time.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAspirationModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-xs whitespace-nowrap cursor-pointer"
            >
              <MessageSquareHeart className="w-4 h-4 shrink-0" />
              <span>Aspirasi & Pengaduan Masyarakat</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onNavigate(
                  currentRole === 'Pimpinan'
                    ? 'peta-masalah'
                    : currentRole === 'PIC Instansi'
                    ? 'tindak-lanjut'
                    : 'permasalahan'
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>
                {currentRole === 'Pimpinan'
                  ? 'Lihat Peta Permasalahan'
                  : currentRole === 'PIC Instansi'
                  ? 'Kelola Tindak Lanjut'
                  : 'Catat Permasalahan'}
              </span>
            </button>

            <button
              type="button"
              onClick={onToggleRealtime}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                realtimeEnabled
                  ? 'bg-white/15 text-white border-white/25 hover:bg-white/25'
                  : 'bg-slate-900/30 text-blue-100 border-white/20 hover:bg-slate-900/45'
              }`}
            >
              {realtimeEnabled ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <span>Live Stream Aktif</span>
                  <Pause className="w-3 h-3 ml-0.5" />
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  <span>Live Stream Dijeda</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Control Strip & Quick Export Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900">
            Pemantauan Operasional Real-Time MPP Kendal
          </h3>
          <p className="text-xs text-slate-500 font-mono tabular-nums">
            Pembaruan terakhir: {lastUpdated} WIB · {instansi.filter((i) => i.aktif).length} instansi aktif · IKM rata-rata {avgIkm}/5.00
          </p>
        </div>

        <ExportButtonsBar
          filter={{
            periode: 'Harian',
            tanggalMulai: TODAY_ISO,
            tanggalSelesai: TODAY_ISO,
            instansiId: 'semua',
            kategori: 'semua',
          }}
          instansi={instansi}
          pelayanan={pelayanan}
          permasalahan={permasalahan}
          pengaduan={pengaduan}
          survei={survei}
          printedBy={currentRole}
          onExported={onExported}
        />
      </div>

      {/* 4 Primary KPI Cards (sesuai PRD 6.5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Jumlah Pemohon Hari Ini</span>
            <Users className="w-4 h-4 text-blue-700" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
              {totalPemohon}
            </div>
            <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              Rata-rata waktu tunggu {avgTunggu} menit · {totalDalamProses} sedang dilayani
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Pelayanan Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
              {totalSelesai}
            </div>
            <p className="mt-1 text-xs text-emerald-700 font-medium font-mono tabular-nums">
              {pctSelesai}% tingkat penyelesaian layanan hari ini
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Permasalahan Tercatat</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
              {totalMasalah}
            </div>
            <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              {totalMasalah - masalahBelumSelesai.length} selesai ·{' '}
              {permasalahan.filter((m) => m.berulang).length} kendala berulang
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Belum Selesai</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono tabular-nums text-rose-700">
              {masalahBelumSelesai.length}
            </div>
            <p className="mt-1 text-xs text-rose-700 font-medium font-mono tabular-nums">
              {masalahPrioritasTinggi.length} prioritas Tinggi/Kritis · {pengaduan.filter((p) => p.status !== 'Selesai').length} aduan aktif
            </p>
          </div>
        </div>
      </div>

      {/* Visual Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Grafik Jumlah Pelayanan per Instansi
              </h3>
              <p className="text-xs text-slate-500">
                Perbandingan layanan selesai dan antrean aktif hari ini
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('pelayanan')}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Input Pelayanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <AgencyServiceBarChart instansi={instansi} pelayanan={todayServices} />
        </div>

        <div className="xl:col-span-5 flex flex-col gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Permasalahan Berdasarkan Kategori
                </h3>
                <p className="text-xs text-slate-500">
                  Distribusi kendala operasional seluruh instansi
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('peta-masalah')}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Peta Masalah</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <ProblemCategoryChart permasalahan={permasalahan} />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex-1">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Tren Pelayanan & Kepuasan 7 Hari
                </h3>
                <p className="text-xs text-slate-500">
                  Arahkan kursor ke titik tanggal untuk detail harian
                </p>
              </div>
            </div>
            <ServiceAndSatisfactionTrendChart data={trenMingguan} />
          </div>
        </div>
      </div>

      {/* Priority & Unresolved Operations Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Daftar Permasalahan Prioritas Tinggi & Kritis */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Permasalahan Prioritas Tinggi & Kritis
              </h3>
              <p className="text-xs text-slate-500">
                Memerlukan penanganan segera sesuai target SLA internal
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('tindak-lanjut')}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Kelola Tindak Lanjut →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {masalahPrioritasTinggi.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Seluruh permasalahan prioritas Tinggi dan Kritis telah tertangani.
              </div>
            ) : (
              masalahPrioritasTinggi.map((item) => (
                <div
                  key={item.id}
                  className="px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-slate-800">
                        {item.kodeLaporan}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-slate-700">
                        {getInstansiName(item.instansiId)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{item.waktuKejadian}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 line-clamp-2">
                      {item.uraianMasalah}
                    </p>
                    <p className="text-xs text-slate-500">
                      PIC: <span className="text-slate-700 font-medium">{item.picPenanganan}</span> · {item.kategoriMasalah}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <PriorityLabel level={item.tingkatPrioritas} />
                    <StatusLabel status={item.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Daftar Laporan Belum Ditindaklanjuti / Menunggu Verifikasi */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Laporan Menunggu Penyelesaian & Verifikasi
              </h3>
              <p className="text-xs text-slate-500">
                Rekapitulasi laporan aktif yang belum berstatus selesai
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('permasalahan')}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              + Catat Masalah
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                  <th className="py-2.5 px-4">Instansi & Loket</th>
                  <th className="py-2.5 px-4">Ringkasan Kendala</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {(belumDitindaklanjuti.length > 0 ? belumDitindaklanjuti : permasalahan.slice(0, 5)).map(
                  (item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {getInstansiName(item.instansiId)}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          {item.namaLoket}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <div className="text-slate-800 line-clamp-2">{item.uraianMasalah}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>PIC: {item.picPenanganan}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <StatusLabel status={item.status} />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showAspirationModal && (
        <PublicAspirationModal
          instansi={instansi}
          onClose={() => setShowAspirationModal(false)}
          onSubmitPengaduan={onAddPengaduan}
        />
      )}
    </div>
  );
}
