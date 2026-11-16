import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { AuthUser } from '../types/mpp';

interface ChangePasswordModalProps {
  user: AuthUser;
  onClose: () => void;
  onChangePassword: (
    accountId: string,
    currentPassword: string,
    newPassword: string,
    notifyEmail: boolean
  ) => { ok: boolean; error?: string };
  onUpdateEmail: (accountId: string, newEmail: string) => void;
}

export function ChangePasswordModal({
  user,
  onClose,
  onChangePassword,
  onUpdateEmail,
}: ChangePasswordModalProps) {
  const [activeTab, setActiveTab] = useState<'password' | 'email'>('password');

  // Password form state (selalu kosong, tanpa auto-save)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Email form state
  const [emailInput, setEmailInput] = useState(user.email);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword.length < 6) {
      setPwdError('Kata sandi baru minimal harus terdiri dari 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    const result = onChangePassword(user.id, currentPassword, newPassword, notifyEmail);
    if (!result.ok) {
      setPwdError(result.error || 'Gagal mengubah kata sandi.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPwdSuccess(
      notifyEmail
        ? `Kata sandi berhasil diperbarui. Pemberitahuan keamanan telah dikirim ke ${user.email}.`
        : 'Kata sandi baru berhasil disimpan dan langsung aktif.'
    );
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    const trimmed = emailInput.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isValidEmail) {
      setEmailError('Masukkan alamat email yang valid (contoh: nama@kendalkab.go.id).');
      return;
    }

    onUpdateEmail(user.id, trimmed);
    setEmailInput(trimmed);
    setEmailSuccess(
      `Email ${trimmed} berhasil dihubungkan ke akun ${user.username} untuk pemulihan kata sandi.`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-ubah-sandi-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2
                id="modal-ubah-sandi-title"
                className="text-sm font-semibold text-slate-900 truncate"
              >
                Keamanan Akun & Email Terhubung
              </h2>
              <p className="text-[11px] text-slate-500 truncate">
                {user.namaLengkap} ({user.peran}) ·{' '}
                <span className="font-mono">{user.username}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            aria-label="Tutup jendela"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Linked Email Summary Banner */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0 text-slate-700">
            <Mail className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span className="text-slate-500 shrink-0">Email Terhubung:</span>
            <span className="font-mono font-medium text-slate-900 truncate">
              {user.email}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'email' ? 'password' : 'email')}
            className="text-[11px] font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {activeTab === 'email' ? 'Ke Ubah Sandi' : 'Ubah Email'}
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="px-5 pt-4 flex gap-2 border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setPwdError('');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'password'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Ubah Kata Sandi
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('email');
              setEmailError('');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'email'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Email Pemulihan Akun
          </button>
        </div>

        {activeTab === 'password' ? (
          <form onSubmit={handlePasswordSubmit} autoComplete="off" className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kata Sandi Saat Ini
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  name="simpel_current_password"
                  required
                  autoComplete="new-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-blue-700"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label={showCurrent ? 'Sembunyikan sandi' : 'Lihat sandi'}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kata Sandi Baru (minimal 6 karakter)
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showNew ? 'text' : 'password'}
                  name="simpel_new_password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru"
                  className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-blue-700"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label={showNew ? 'Sembunyikan sandi' : 'Lihat sandi'}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="simpel_confirm_password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-blue-700"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label={showConfirm ? 'Sembunyikan sandi' : 'Lihat sandi'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
              />
              <span>
                Kirim pemberitahuan keamanan perubahan sandi ke email terhubung (
                <span className="font-mono text-slate-900">{user.email}</span>)
              </span>
            </label>

            {pwdError && (
              <div className="p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-lg">
                {pwdError}
              </div>
            )}

            {pwdSuccess && (
              <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Simpan Kata Sandi Baru</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleEmailSubmit} autoComplete="off" className="p-5 space-y-4">
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-slate-700 leading-relaxed">
              Email yang dihubungkan ke akun <span className="font-mono font-semibold">{user.username}</span>{' '}
              digunakan untuk verifikasi menu <strong>Lupa Password</strong> dan menerima pemberitahuan perubahan sandi.
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Alamat Email Pengguna ({user.peran})
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="nama@kendalkab.go.id"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-blue-700"
                />
              </div>
            </div>

            {emailError && (
              <div className="p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-lg">
                {emailError}
              </div>
            )}

            {emailSuccess && (
              <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{emailSuccess}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Hubungkan Email</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
