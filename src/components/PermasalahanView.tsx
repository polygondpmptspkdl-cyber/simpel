import { FileImage, Plus, Search, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { KATALOG_PERMASALAHAN, SLA_RULES, TODAY_ISO } from '../data/initialData';
import {
  AuthUser,
  InstansiItem,
  PermasalahanHarian,
  PriorityLevel,
  ProblemCategory,
  ProblemStatus,
} from '../types/mpp';
import { PriorityLabel, StatusLabel } from './StatusLabel';

interface PermasalahanViewProps {
  instansi: InstansiItem[];
  permasalahan: PermasalahanHarian[];
  authUser: AuthUser | null;
  onAddPermasalahan: (
    payload: Omit<PermasalahanHarian, 'id' | 'kodeLaporan' | 'terverifikasi'>
  ) => void;
}

const CATEGORIES: ProblemCategory[] = [
  'Sistem & Jaringan',
  'Antrean & Waktu Tunggu',
  'Persyaratan & Dokumen',
  'SDM & Petugas',
  'Sarana & Prasarana',
  'Koordinasi & Informasi',
];

export function PermasalahanView({
  instansi,
  permasalahan,
  authUser,
  onAddPermasalahan,
}: PermasalahanViewProps) {
  const userScopedInstansi = authUser?.instansiId
    ? instansi.filter((i) => i.id === authUser.instansiId)
    : instansi;
  const availableFormInstansi =
    userScopedInstansi.length > 0 ? userScopedInstansi : instansi;
  const isLockedToUserInstansi = Boolean(
    authUser?.instansiId && userScopedInstansi.length === 1
  );

  const [search, setSearch] = useState('');
  const [filterInstansi, setFilterInstansi] = useState('semua');
  const [filterKategori, setFilterKategori] = useState('semua');
  const [filterPrioritas, setFilterPrioritas] = useState('semua');
  const [showForm, setShowForm] = useState(false);

  // 14 Fields sesuai Bab 5.3 PDF
  const [tanggalLaporan, setTanggalLaporan] = useState(TODAY_ISO);
  const [waktuKejadian, setWaktuKejadian] = useState(() =>
    new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  );
  const defaultInst = availableFormInstansi[0];
  const [instansiId, setInstansiId] = useState(defaultInst?.id || '');
  const [namaLoket, setNamaLoket] = useState(defaultInst?.loket[0] || '');
  const [kategoriMasalah, setKategoriMasalah] = useState<ProblemCategory>('Sistem & Jaringan');
  const [uraianMasalah, setUraianMasalah] = useState('');
  const [dampak, setDampak] = useState('');
  const [tingkatPrioritas, setTingkatPrioritas] = useState<PriorityLevel>('Sedang');
  const [dokumentasiNama, setDokumentasiNama] = useState<string>('');
  const [dokumentasiUrl, setDokumentasiUrl] = useState<string>('');
  const [picPenanganan, setPicPenanganan] = useState(defaultInst?.picNama || '');
  const [tindakanPenanganan, setTindakanPenanganan] = useState('');
  const [status, setStatus] = useState<ProblemStatus>('Baru');
  const [catatanEvaluasi, setCatatanEvaluasi] = useState('');
  const [berulang, setBerulang] = useState(false);

  useEffect(() => {
    const target = availableFormInstansi[0];
    if (authUser?.instansiId && target) {
      setInstansiId(target.id);
      setNamaLoket(target.loket[0] || '');
      setPicPenanganan(target.picNama);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.instansiId, authUser?.username]);

  const handleInstansiSelect = (id: string) => {
    if (isLockedToUserInstansi) return;
    setInstansiId(id);
    const found = availableFormInstansi.find((i) => i.id === id);
    if (found) {
      setNamaLoket(found.loket[0] || '');
      setPicPenanganan(found.picNama);
    }
  };

  const applyTemplate = (noStr: string) => {
    const no = Number(noStr);
    const tpl = KATALOG_PERMASALAHAN.find((t) => t.no === no);
    if (!tpl) return;
    setKategoriMasalah(tpl.kategori);
    setUraianMasalah(tpl.permasalahan);
    setDampak(tpl.dampak);
    setTindakanPenanganan(tpl.penanganan);
    setTingkatPrioritas(tpl.defaultPrioritas);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDokumentasiNama(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDokumentasiUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveInstansiId =
      isLockedToUserInstansi && availableFormInstansi[0]
        ? availableFormInstansi[0].id
        : instansiId;
    onAddPermasalahan({
      tanggalLaporan,
      waktuKejadian,
      instansiId: effectiveInstansiId,
      namaLoket,
      kategoriMasalah,
      uraianMasalah,
      dampak,
      tingkatPrioritas,
      dokumentasiNama: dokumentasiNama || undefined,
      dokumentasiUrl: dokumentasiUrl || undefined,
      picPenanganan,
      tindakanPenanganan,
      status,
      catatanEvaluasi,
      berulang,
      waktuPenyelesaian:
        status === 'Selesai' || status === 'Ditutup'
          ? `${tanggalLaporan} ${waktuKejadian}`
          : undefined,
      durasiMenit: status === 'Selesai' || status === 'Ditutup' ? 20 : undefined,
    });

    // Reset fields
    setUraianMasalah('');
    setDampak('');
    setTindakanPenanganan('');
    setCatatanEvaluasi('');
    setDokumentasiNama('');
    setDokumentasiUrl('');
    setBerulang(false);
    setShowForm(false);
  };

  const filtered = permasalahan.filter((m) => {
    if (filterInstansi !== 'semua' && m.instansiId !== filterInstansi) return false;
    if (filterKategori !== 'semua' && m.kategoriMasalah !== filterKategori) return false;
    if (filterPrioritas !== 'semua' && m.tingkatPrioritas !== filterPrioritas) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.kodeLaporan.toLowerCase().includes(q) ||
      m.uraianMasalah.toLowerCase().includes(q) ||
      m.picPenanganan.toLowerCase().includes(q) ||
      m.dampak.toLowerCase().includes(q)
    );
  });

  const selectedInstObj = instansi.find((i) => i.id === instansiId);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode, uraian, PIC..."
              className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg w-56 focus:outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={filterInstansi}
            onChange={(e) => setFilterInstansi(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="semua">Semua Instansi</option>
            {instansi.map((i) => (
              <option key={i.id} value={i.id}>
                {i.singkatan}
              </option>
            ))}
          </select>

          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="semua">Semua Kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterPrioritas}
            onChange={(e) => setFilterPrioritas(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="semua">Semua Prioritas</option>
            <option value="Kritis">Kritis</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Tutup Formulir' : 'Input Permasalahan Baru'}</span>
        </button>
      </div>

      {/* Form Input Permasalahan Harian (14 Field sesuai Bab 5.3) */}
      {showForm && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Formulir Input Permasalahan Harian MPP Kendal
              </h3>
              <p className="text-xs text-slate-500">
                Pilih templat kendala cepat atau isi detail kendala secara manual
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-700 shrink-0" />
              <select
                defaultValue=""
                onChange={(e) => applyTemplate(e.target.value)}
                className="px-3 py-1.5 text-xs bg-blue-50 text-blue-900 border border-blue-200 rounded-lg max-w-xs"
              >
                <option value="" disabled>
                  Pilih Templat Cepat (20 Katalog Bab 3.1)...
                </option>
                {KATALOG_PERMASALAHAN.map((t) => (
                  <option key={t.no} value={t.no}>
                    {t.no}. {t.permasalahan}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                1. Tanggal Laporan
              </label>
              <input
                type="date"
                required
                value={tanggalLaporan}
                onChange={(e) => setTanggalLaporan(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                2. Waktu Kejadian
              </label>
              <input
                type="time"
                required
                value={waktuKejadian}
                onChange={(e) => setWaktuKejadian(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                3. Nama Instansi
              </label>
              <select
                value={instansiId}
                onChange={(e) => handleInstansiSelect(e.target.value)}
                disabled={isLockedToUserInstansi}
                className={`w-full px-3 py-2 text-xs border border-slate-200 rounded-lg ${
                  isLockedToUserInstansi ? 'bg-slate-50 text-slate-800 font-medium cursor-not-allowed' : 'bg-white'
                }`}
              >
                {availableFormInstansi.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.singkatan} — {i.nama}
                  </option>
                ))}
              </select>
              {isLockedToUserInstansi && authUser && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Otomatis sesuai akun masuk ({authUser.namaLengkap})
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                4. Nama Loket
              </label>
              <select
                value={namaLoket}
                onChange={(e) => setNamaLoket(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                {(selectedInstObj?.loket || [namaLoket]).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                5. Kategori Masalah
              </label>
              <select
                value={kategoriMasalah}
                onChange={(e) => setKategoriMasalah(e.target.value as ProblemCategory)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                8. Tingkat Prioritas ({SLA_RULES[tingkatPrioritas].target})
              </label>
              <select
                value={tingkatPrioritas}
                onChange={(e) => setTingkatPrioritas(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="Rendah">Rendah — Maks. 1 hari kerja</option>
                <option value="Sedang">Sedang — Maks. 4 jam kerja</option>
                <option value="Tinggi">Tinggi — Maks. 1 jam kerja</option>
                <option value="Kritis">Kritis — Segera dieskalasikan</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                6. Uraian Masalah
              </label>
              <textarea
                required
                rows={2}
                value={uraianMasalah}
                onChange={(e) => setUraianMasalah(e.target.value)}
                placeholder="Jelaskan kendala operasional yang terjadi di loket atau sistem..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                7. Dampak Terhadap Pelayanan
              </label>
              <textarea
                required
                rows={2}
                value={dampak}
                onChange={(e) => setDampak(e.target.value)}
                placeholder="Contoh: Waktu tunggu bertambah / layanan tertunda..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                10. PIC Penanganan
              </label>
              <input
                type="text"
                required
                value={picPenanganan}
                onChange={(e) => setPicPenanganan(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                12. Status Awal
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProblemStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="Baru">Baru</option>
                <option value="Proses">Proses</option>
                <option value="Ditangani">Ditangani</option>
                <option value="Eskalasi">Eskalasi</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                9. Unggah Foto / Dokumentasi (Opsional)
              </label>
              <label className="flex items-center gap-2 px-3 py-2 text-xs border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                <FileImage className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate text-slate-600">
                  {dokumentasiNama || 'Pilih foto atau dokumen...'}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                11. Tindakan Penanganan Awal
              </label>
              <input
                type="text"
                value={tindakanPenanganan}
                onChange={(e) => setTindakanPenanganan(e.target.value)}
                placeholder="Langkah perbaikan atau solusi sementara yang dilakukan..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                14. Catatan Evaluasi
              </label>
              <input
                type="text"
                value={catatanEvaluasi}
                onChange={(e) => setCatatanEvaluasi(e.target.value)}
                placeholder="Catatan pencegahan agar tidak berulang..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={berulang}
                  onChange={(e) => setBerulang(e.target.checked)}
                  className="rounded border-slate-300 text-blue-700"
                />
                <span>Tandai sebagai permasalahan berulang (masuk radar Peta Permasalahan)</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                >
                  Simpan Laporan Permasalahan
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Permasalahan */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Daftar Permasalahan Operasional Harian
            </h3>
            <p className="text-xs text-slate-500">
              Menampilkan {filtered.length} dari {permasalahan.length} catatan kendala
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Tidak ada permasalahan yang cocok dengan filter pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <th className="py-3 px-4">Kode & Waktu</th>
                  <th className="py-3 px-4">Instansi & Loket</th>
                  <th className="py-3 px-4">Uraian & Dampak</th>
                  <th className="py-3 px-4">Prioritas</th>
                  <th className="py-3 px-4">PIC</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((item) => {
                  const inst = instansi.find((i) => i.id === item.instansiId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="font-mono font-semibold text-slate-900">
                          {item.kodeLaporan}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {item.tanggalLaporan} · {item.waktuKejadian}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {inst?.singkatan || item.instansiId}
                        </div>
                        <div className="text-[11px] text-slate-500">{item.namaLoket}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.kategoriMasalah}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-top max-w-md">
                        <div className="font-medium text-slate-900">{item.uraianMasalah}</div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Dampak: {item.dampak}
                        </div>
                        {item.tindakanPenanganan && (
                          <div className="text-[11px] text-slate-600 mt-1">
                            Tindakan: {item.tindakanPenanganan}
                          </div>
                        )}
                        {item.dokumentasiNama && (
                          <div className="text-[11px] text-blue-700 mt-1 inline-flex items-center gap-1">
                            <FileImage className="w-3 h-3" />
                            <span>Lampiran: {item.dokumentasiNama}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 align-top">
                        <PriorityLabel level={item.tingkatPrioritas} />
                        {item.berulang && (
                          <div className="text-[11px] text-amber-700 mt-1 font-medium">
                            Berulang
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 align-top whitespace-nowrap text-slate-700 font-medium">
                        {item.picPenanganan}
                      </td>
                      <td className="py-3.5 px-4 align-top">
                        <StatusLabel status={item.status} />
                        {item.terverifikasi && (
                          <div className="text-[11px] text-emerald-700 mt-1">
                            Terverifikasi
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
