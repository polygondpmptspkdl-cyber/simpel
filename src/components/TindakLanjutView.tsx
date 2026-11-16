import { ArrowRight, CheckCircle2, ShieldAlert, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { InstansiItem, PermasalahanHarian, ProblemStatus, UserRole } from '../types/mpp';
import { PriorityLabel, StatusLabel } from './StatusLabel';

interface TindakLanjutViewProps {
  instansi: InstansiItem[];
  permasalahan: PermasalahanHarian[];
  currentRole: UserRole;
  onUpdateStatus: (
    id: string,
    updates: {
      status: ProblemStatus;
      picPenanganan?: string;
      tindakanPenanganan?: string;
      catatanEvaluasi?: string;
      terverifikasi?: boolean;
    }
  ) => void;
}

export function TindakLanjutView({
  instansi,
  permasalahan,
  currentRole,
  onUpdateStatus,
}: TindakLanjutViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [picInput, setPicInput] = useState('');
  const [tindakanInput, setTindakanInput] = useState('');
  const [evaluasiInput, setEvaluasiInput] = useState('');
  const [statusInput, setStatusInput] = useState<ProblemStatus>('Ditangani');
  const [filterTab, setFilterTab] = useState<'aktif' | 'verifikasi' | 'semua'>('aktif');

  const openEditor = (item: PermasalahanHarian) => {
    setSelectedId(item.id);
    setPicInput(item.picPenanganan);
    setTindakanInput(item.tindakanPenanganan);
    setEvaluasiInput(item.catatanEvaluasi);
    setStatusInput(item.status);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    const isVerified = statusInput === 'Selesai' || statusInput === 'Ditutup';
    onUpdateStatus(selectedId, {
      status: statusInput,
      picPenanganan: picInput,
      tindakanPenanganan: tindakanInput,
      catatanEvaluasi: evaluasiInput,
      terverifikasi: isVerified,
    });
    setSelectedId(null);
  };

  const counts = {
    baruProses: permasalahan.filter((m) => m.status === 'Baru' || m.status === 'Proses').length,
    ditangani: permasalahan.filter((m) => m.status === 'Ditangani').length,
    eskalasi: permasalahan.filter((m) => m.status === 'Eskalasi').length,
    selesai: permasalahan.filter((m) => m.status === 'Selesai' || m.status === 'Ditutup').length,
  };

  const list = permasalahan.filter((m) => {
    if (filterTab === 'aktif') {
      return m.status !== 'Selesai' && m.status !== 'Ditutup';
    }
    if (filterTab === 'verifikasi') {
      return m.status === 'Ditangani' || (m.status === 'Selesai' && !m.terverifikasi);
    }
    return true;
  });

  const getInstansiName = (id: string) =>
    instansi.find((i) => i.id === id)?.singkatan || id;

  return (
    <div className="space-y-6">
      {/* Alur Penanganan Sesuai Bab 3.3 & 5.5 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Alur Penanganan & Verifikasi Tindak Lanjut
            </h2>
            <p className="text-xs text-slate-500">
              Progres terstruktur dari penugasan PIC instansi hingga verifikasi penyelesaian oleh Pengelola MPP
            </p>
          </div>
          <span className="text-xs text-slate-500">
            Peran aktif: <strong className="text-slate-900">{currentRole}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
            <div className="text-xs text-slate-500">1. Baru / Proses</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-700 mt-1">
              {counts.baruProses}
            </div>
          </div>
          <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
            <div className="text-xs text-slate-500">2. Ditangani PIC</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-blue-700 mt-1">
              {counts.ditangani}
            </div>
          </div>
          <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
            <div className="text-xs text-slate-500">3. Eskalasi Lintas Instansi</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-rose-700 mt-1">
              {counts.eskalasi}
            </div>
          </div>
          <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
            <div className="text-xs text-slate-500">4. Verifikasi Selesai</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
              {counts.selesai}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Segmented Control */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          <button
            type="button"
            onClick={() => setFilterTab('aktif')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterTab === 'aktif'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Perlu Penanganan ({permasalahan.filter((m) => m.status !== 'Selesai' && m.status !== 'Ditutup').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('verifikasi')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterTab === 'verifikasi'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Siap Verifikasi ({counts.ditangani})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('semua')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterTab === 'semua'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Riwayat ({permasalahan.length})
          </button>
        </div>
      </div>

      {/* Editor Modal / Inline Drawer */}
      {selectedId && (
        <div className="bg-white border border-blue-200 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              Perbarui Tindak Lanjut & Verifikasi Penyelesaian
            </h3>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Tutup
            </button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Penanggung Jawab (PIC)
              </label>
              <input
                type="text"
                required
                value={picInput}
                onChange={(e) => setPicInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Status Penanganan
              </label>
              <select
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value as ProblemStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="Baru">Baru (Menunggu Penugasan)</option>
                <option value="Proses">Proses (Sedang Dikerjakan)</option>
                <option value="Ditangani">Ditangani (Menunggu Verifikasi)</option>
                <option value="Eskalasi">Eskalasi (Koordinasi Lintas Instansi)</option>
                <option value="Selesai">Selesai & Terverifikasi</option>
                <option value="Ditutup">Ditutup</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tindakan Penanganan yang Dilakukan
              </label>
              <textarea
                rows={2}
                required
                value={tindakanInput}
                onChange={(e) => setTindakanInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Catatan Evaluasi & Pencegahan
              </label>
              <input
                type="text"
                value={evaluasiInput}
                onChange={(e) => setEvaluasiInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                Simpan Perubahan Status
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Tindak Lanjut */}
      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
            Tidak ada laporan dalam kategori filter ini.
          </div>
        ) : (
          list.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                  <span className="font-mono font-semibold text-slate-900">
                    {item.kodeLaporan}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-slate-800">
                    {getInstansiName(item.instansiId)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{item.namaLoket}</span>
                  <span aria-hidden="true">·</span>
                  <PriorityLabel level={item.tingkatPrioritas} />
                  <span aria-hidden="true">·</span>
                  <StatusLabel status={item.status} />
                </div>

                <h4 className="text-sm font-semibold text-slate-900">{item.uraianMasalah}</h4>

                <p className="text-xs text-slate-600">
                  <span className="font-medium text-slate-800">PIC: {item.picPenanganan}</span> —{' '}
                  {item.tindakanPenanganan || 'Belum ada catatan tindakan penanganan.'}
                </p>

                {item.waktuPenyelesaian && (
                  <p className="text-[11px] font-mono text-emerald-700">
                    Diselesaikan pada {item.waktuPenyelesaian} ({item.durasiMenit} menit)
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {item.status !== 'Selesai' && item.status !== 'Ditutup' && (
                  <>
                    {item.status !== 'Ditangani' && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateStatus(item.id, {
                            status: 'Ditangani',
                            tindakanPenanganan:
                              item.tindakanPenanganan || 'Sedang ditangani oleh PIC instansi.',
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Tandai Ditangani</span>
                      </button>
                    )}

                    {item.status !== 'Eskalasi' && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateStatus(item.id, {
                            status: 'Eskalasi',
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Eskalasi</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateStatus(item.id, {
                          status: 'Selesai',
                          terverifikasi: true,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verifikasi Selesai</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => openEditor(item)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>Ubah Detail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
