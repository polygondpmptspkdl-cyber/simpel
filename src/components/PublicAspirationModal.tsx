import { CheckCircle2, MessageSquareHeart, Send, X } from 'lucide-react';
import { useState } from 'react';
import { TODAY_ISO } from '../data/initialData';
import { InstansiItem, PengaduanMasyarakat } from '../types/mpp';

interface PublicAspirationFormProps {
  instansi: InstansiItem[];
  onSubmitPengaduan: (
    payload: Omit<PengaduanMasyarakat, 'id' | 'status' | 'tanggapan'>
  ) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function PublicAspirationForm({
  instansi,
  onSubmitPengaduan,
  onCancel,
  submitLabel = 'Kirim Aspirasi & Pengaduan',
}: PublicAspirationFormProps) {
  const [namaPelapor, setNamaPelapor] = useState('');
  const [kontakPelapor, setKontakPelapor] = useState('');
  const [instansiId, setInstansiId] = useState(instansi[0]?.id || '');
  const [kanal, setKanal] = useState<PengaduanMasyarakat['kanal']>('Portal Resmi');
  const [isiPengaduan, setIsiPengaduan] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNama = namaPelapor.trim();
    const cleanHp = kontakPelapor.trim();
    const cleanIsi = isiPengaduan.trim();
    if (!cleanNama || !cleanHp || !cleanIsi) return;

    onSubmitPengaduan({
      tanggal: TODAY_ISO,
      waktu: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      namaPelapor: cleanNama,
      kontakPelapor: cleanHp,
      instansiId,
      kanal,
      isiPengaduan: cleanIsi,
    });

    const selectedName =
      instansi.find((i) => i.id === instansiId)?.singkatan || 'instansi terkait';
    setSubmittedNotice(
      `Terima kasih ${cleanNama}. Tanggapan/pengaduan untuk ${selectedName} telah masuk ke menu Pencatatan Pengaduan Masyarakat.`
    );
    setNamaPelapor('');
    setKontakPelapor('');
    setIsiPengaduan('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submittedNotice && (
        <div className="p-3.5 text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{submittedNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Nama Pelapor
          </label>
          <input
            type="text"
            required
            value={namaPelapor}
            onChange={(e) => setNamaPelapor(e.target.value)}
            placeholder="Masukkan nama lengkap Anda"
            className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b5ed7]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Nomor HP
          </label>
          <input
            type="tel"
            required
            value={kontakPelapor}
            onChange={(e) => setKontakPelapor(e.target.value)}
            placeholder="08xx-xxxx-xxxx"
            className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#0b5ed7]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Instansi Terkait
          </label>
          <select
            value={instansiId}
            onChange={(e) => setInstansiId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#0b5ed7]"
          >
            {instansi.map((i) => (
              <option key={i.id} value={i.id}>
                {i.singkatan} — {i.nama}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Kanal Pengaduan
          </label>
          <select
            value={kanal}
            onChange={(e) => setKanal(e.target.value as PengaduanMasyarakat['kanal'])}
            className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#0b5ed7]"
          >
            <option value="Portal Resmi">Portal Resmi</option>
            <option value="Loket Pengaduan">Loket Pengaduan</option>
            <option value="WhatsApp MPP">WhatsApp MPP</option>
            <option value="Kotak Saran">Kotak Saran</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
            Isi Pengaduan / Saran / Kritik / Tanggapan
          </label>
          <textarea
            required
            rows={3}
            value={isiPengaduan}
            onChange={(e) => setIsiPengaduan(e.target.value)}
            placeholder="Sampaikan tanggapan, saran perbaikan, kritik, atau pengaduan pelayanan MPP Kendal..."
            className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b5ed7]"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        )}
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0b5ed7] hover:bg-blue-800 rounded-xl transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}

interface PublicAspirationModalProps {
  instansi: InstansiItem[];
  onClose: () => void;
  onSubmitPengaduan: (
    payload: Omit<PengaduanMasyarakat, 'id' | 'status' | 'tanggapan'>
  ) => void;
}

export function PublicAspirationModal({
  instansi,
  onClose,
  onSubmitPengaduan,
}: PublicAspirationModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-aspirasi-masyarakat-title"
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="modal-aspirasi-masyarakat-title"
                className="text-sm font-bold text-slate-900 truncate"
              >
                Aspirasi, Saran, Kritik & Pengaduan Masyarakat
              </h2>
              <p className="text-[11px] text-slate-500 truncate">
                Tanggapan Anda langsung masuk ke daftar Pencatatan Pengaduan Masyarakat MPP Kendal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            aria-label="Tutup formulir aspirasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <PublicAspirationForm
            instansi={instansi}
            onSubmitPengaduan={onSubmitPengaduan}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
