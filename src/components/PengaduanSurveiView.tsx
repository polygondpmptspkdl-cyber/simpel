import { MessageSquareWarning, Plus, Star } from 'lucide-react';
import { useState } from 'react';
import { TODAY_ISO } from '../data/initialData';
import { InstansiItem, PengaduanMasyarakat, SurveiKepuasan } from '../types/mpp';

interface PengaduanSurveiViewProps {
  instansi: InstansiItem[];
  pengaduan: PengaduanMasyarakat[];
  survei: SurveiKepuasan[];
  onAddPengaduan: (
    payload: Omit<PengaduanMasyarakat, 'id' | 'status' | 'tanggapan'>
  ) => void;
  onUpdatePengaduan: (
    id: string,
    status: PengaduanMasyarakat['status'],
    tanggapan: string
  ) => void;
  onAddSurvei: (payload: Omit<SurveiKepuasan, 'id'>) => void;
}

export function PengaduanSurveiView({
  instansi,
  pengaduan,
  survei,
  onAddPengaduan,
  onUpdatePengaduan,
  onAddSurvei,
}: PengaduanSurveiViewProps) {
  const [activeTab, setActiveTab] = useState<'pengaduan' | 'survei'>('pengaduan');

  // Pengaduan form
  const [showAduanForm, setShowAduanForm] = useState(false);
  const [namaPelapor, setNamaPelapor] = useState('');
  const [kontakPelapor, setKontakPelapor] = useState('');
  const [aduanInstansi, setAduanInstansi] = useState(instansi[0]?.id || '');
  const [kanal, setKanal] = useState<PengaduanMasyarakat['kanal']>('Loket Pengaduan');
  const [isiPengaduan, setIsiPengaduan] = useState('');

  // Tanggapan editor
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyStatus, setReplyStatus] =
    useState<PengaduanMasyarakat['status']>('Ditindaklanjuti');
  const [replyText, setReplyText] = useState('');

  // Survei form
  const [showSurveiForm, setShowSurveiForm] = useState(false);
  const [srvInstansi, setSrvInstansi] = useState(instansi[0]?.id || '');
  const [srvLayanan, setSrvLayanan] = useState(instansi[0]?.contohLayanan || '');
  const [srvSkor, setSrvSkor] = useState(5);
  const [srvAspek, setSrvAspek] = useState('Kecepatan & keramahan petugas');
  const [srvMasukan, setSrvMasukan] = useState('');

  const getInstansiName = (id: string) =>
    instansi.find((i) => i.id === id)?.singkatan || id;

  const avgIkm =
    survei.length > 0
      ? (survei.reduce((acc, s) => acc + s.skor, 0) / survei.length).toFixed(2)
      : '0.00';

  const handleSubmitAduan = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPengaduan({
      tanggal: TODAY_ISO,
      waktu: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      namaPelapor,
      kontakPelapor,
      instansiId: aduanInstansi,
      kanal,
      isiPengaduan,
    });
    setNamaPelapor('');
    setKontakPelapor('');
    setIsiPengaduan('');
    setShowAduanForm(false);
  };

  const handleSaveReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyId) return;
    onUpdatePengaduan(replyId, replyStatus, replyText);
    setReplyId(null);
    setReplyText('');
  };

  const handleSubmitSurvei = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSurvei({
      tanggal: TODAY_ISO,
      instansiId: srvInstansi,
      jenisLayanan: srvLayanan,
      skor: Number(srvSkor),
      aspekTerbaik: srvAspek,
      masukan: srvMasukan,
    });
    setSrvMasukan('');
    setShowSurveiForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Segmented Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('pengaduan')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'pengaduan'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pengaduan Masyarakat ({pengaduan.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('survei')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'survei'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Survei Kepuasan Masyarakat ({survei.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            activeTab === 'pengaduan'
              ? setShowAduanForm((v) => !v)
              : setShowSurveiForm((v) => !v)
          }
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>
            {activeTab === 'pengaduan' ? 'Catat Pengaduan Baru' : 'Input Hasil Survei IKM'}
          </span>
        </button>
      </div>

      {activeTab === 'pengaduan' ? (
        <div className="space-y-5">
          {showAduanForm && (
            <div className="bg-white border border-blue-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Pencatatan Pengaduan Masyarakat
              </h3>
              <form onSubmit={handleSubmitAduan} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nama Pelapor
                  </label>
                  <input
                    type="text"
                    required
                    value={namaPelapor}
                    onChange={(e) => setNamaPelapor(e.target.value)}
                    placeholder="Nama masyarakat pelapor"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nomor HP / Kontak
                  </label>
                  <input
                    type="text"
                    required
                    value={kontakPelapor}
                    onChange={(e) => setKontakPelapor(e.target.value)}
                    placeholder="08xx-xxxx-xxxx"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Instansi Terkait
                  </label>
                  <select
                    value={aduanInstansi}
                    onChange={(e) => setAduanInstansi(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    {instansi.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.singkatan} — {i.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Kanal Pengaduan
                  </label>
                  <select
                    value={kanal}
                    onChange={(e) => setKanal(e.target.value as PengaduanMasyarakat['kanal'])}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Loket Pengaduan">Loket Pengaduan</option>
                    <option value="Portal Resmi">Portal Resmi</option>
                    <option value="WhatsApp MPP">WhatsApp MPP</option>
                    <option value="Kotak Saran">Kotak Saran</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Isi Pengaduan / Keluhan
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={isiPengaduan}
                    onChange={(e) => setIsiPengaduan(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAduanForm(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg cursor-pointer"
                  >
                    Simpan Pengaduan
                  </button>
                </div>
              </form>
            </div>
          )}

          {replyId && (
            <div className="bg-white border border-blue-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Berikan Tanggapan Pengaduan
              </h3>
              <form onSubmit={handleSaveReply} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Status Pengaduan
                    </label>
                    <select
                      value={replyStatus}
                      onChange={(e) =>
                        setReplyStatus(e.target.value as PengaduanMasyarakat['status'])
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="Diterima">Diterima</option>
                      <option value="Ditindaklanjuti">Ditindaklanjuti</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Tanggapan / Solusi yang Diberikan
                    </label>
                    <input
                      type="text"
                      required
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyId(null)}
                    className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 rounded-lg cursor-pointer"
                  >
                    Simpan Tanggapan
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {pengaduan.map((a) => (
              <div
                key={a.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <MessageSquareWarning className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-semibold text-slate-900">{a.namaPelapor}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{a.kontakPelapor}</span>
                    <span aria-hidden="true">·</span>
                    <span>{getInstansiName(a.instansiId)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{a.kanal}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">
                      {a.tanggal} {a.waktu}
                    </span>
                  </div>
                  <p className="text-sm text-slate-900 font-medium">{a.isiPengaduan}</p>
                  {a.tanggapan && (
                    <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      Tanggapan: {a.tanggapan}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`text-xs font-semibold ${
                      a.status === 'Selesai'
                        ? 'text-emerald-700'
                        : a.status === 'Ditindaklanjuti'
                        ? 'text-blue-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {a.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyId(a.id);
                      setReplyStatus(a.status);
                      setReplyText(a.tanggapan);
                    }}
                    className="text-xs font-medium text-blue-700 hover:text-blue-800 cursor-pointer whitespace-nowrap"
                  >
                    {a.tanggapan ? 'Ubah Tanggapan' : 'Tindaklanjuti'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Summary IKM */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">Indeks Kepuasan Rata-rata</div>
              <div className="text-3xl font-bold font-mono tabular-nums text-blue-700 mt-1">
                {avgIkm} <span className="text-sm font-normal text-slate-500">/ 5.00</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">Total Responden Survei</div>
              <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {survei.length}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">Penilaian Sangat Puas (Skor 5)</div>
              <div className="text-3xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                {survei.length > 0
                  ? `${Math.round(
                      (survei.filter((s) => s.skor >= 4).length / survei.length) * 100
                    )}%`
                  : '0%'}
              </div>
            </div>
          </div>

          {showSurveiForm && (
            <div className="bg-white border border-blue-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Input Hasil Survei Kepuasan Masyarakat (IKM)
              </h3>
              <form onSubmit={handleSubmitSurvei} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Instansi yang Dinilai
                  </label>
                  <select
                    value={srvInstansi}
                    onChange={(e) => {
                      setSrvInstansi(e.target.value);
                      const f = instansi.find((i) => i.id === e.target.value);
                      if (f) setSrvLayanan(f.contohLayanan);
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    {instansi.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.singkatan}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Skor Kepuasan (1 - 5)
                  </label>
                  <select
                    value={srvSkor}
                    onChange={(e) => setSrvSkor(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-mono"
                  >
                    <option value={5}>5 — Sangat Puas</option>
                    <option value={4}>4 — Puas</option>
                    <option value={3}>3 — Cukup</option>
                    <option value={2}>2 — Kurang Puas</option>
                    <option value={1}>1 — Tidak Puas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Jenis Layanan
                  </label>
                  <input
                    type="text"
                    required
                    value={srvLayanan}
                    onChange={(e) => setSrvLayanan(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Aspek yang Dinilai Baik
                  </label>
                  <input
                    type="text"
                    value={srvAspek}
                    onChange={(e) => setSrvAspek(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Saran / Masukan Pemohon
                  </label>
                  <input
                    type="text"
                    value={srvMasukan}
                    onChange={(e) => setSrvMasukan(e.target.value)}
                    placeholder="Saran perbaikan layanan..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSurveiForm(false)}
                    className="px-4 py-2 text-xs text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg cursor-pointer"
                  >
                    Simpan Survei
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Instansi & Layanan</th>
                    <th className="py-3 px-4">Skor</th>
                    <th className="py-3 px-4">Aspek Terbaik</th>
                    <th className="py-3 px-4">Masukan Masyarakat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {survei.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {s.tanggal}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {getInstansiName(s.instansiId)}
                        </div>
                        <div className="text-[11px] text-slate-500">{s.jenisLayanan}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-amber-700">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{s.skor}/5</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{s.aspekTerbaik}</td>
                      <td className="py-3 px-4 text-slate-600">{s.masukan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
