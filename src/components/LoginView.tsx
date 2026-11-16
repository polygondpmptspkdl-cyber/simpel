import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  Home,
  Info,
  LayoutGrid,
  Lock,
  LogIn,
  Mail,
  MessageSquareHeart,
  MessageSquareWarning,
  RefreshCw,
  Send,
  Shield,
  ShieldCheck,
  User,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  AccountCredentialOverride,
  AuthUser,
  InstansiItem,
  PengaduanMasyarakat,
  UserRole,
} from '../types/mpp';
import {
  buildSystemAccounts,
  SystemAccount,
  verifyAccountPassword,
} from '../utils/authAccounts';
import {
  KendalBannerArtwork,
  SidebarCallCenterAndMotto,
} from './CivicThemeDecor';
import {
  PublicAspirationForm,
  PublicAspirationModal,
} from './PublicAspirationModal';

interface RoleCardInfo {
  peran: UserRole;
  jabatan: string;
  hakAkses: string;
  icon: typeof User;
  badgeClass: string;
}

const ROLE_CARDS: RoleCardInfo[] = [
  {
    peran: 'Admin MPP',
    jabatan: 'Administrator & Pengelola MPP',
    hakAkses:
      'Akses penuh kelola instansi, penugasan PIC, verifikasi & ekspor laporan.',
    icon: User,
    badgeClass: 'bg-blue-50 text-blue-600',
  },
  {
    peran: 'Petugas MPP',
    jabatan: 'Petugas Loket & Tenan MPP',
    hakAkses:
      'Input data pemohon, antrean, permasalahan harian, pengaduan & survei tenan.',
    icon: Users,
    badgeClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    peran: 'PIC Instansi',
    jabatan: 'PIC Koordinator Gerai Instansi',
    hakAkses:
      'Pantau peta masalah, perbarui status tindak lanjut & tanggapan instansi.',
    icon: UserCheck,
    badgeClass: 'bg-amber-50 text-amber-600',
  },
  {
    peran: 'Pimpinan',
    jabatan: 'Pimpinan & Pengawas Eksekutif',
    hakAkses:
      'Dashboard monitoring, peta permasalahan, evaluasi IKM & cetak laporan.',
    icon: UserCog,
    badgeClass: 'bg-purple-50 text-purple-600',
  },
];

type PortalNav = 'beranda' | 'layanan' | 'informasi' | 'pengaduan' | 'bantuan';

const PORTAL_NAV_ITEMS: Array<{
  id: PortalNav;
  label: string;
  icon: typeof Home;
}> = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'layanan', label: 'Layanan', icon: FileText },
  { id: 'informasi', label: 'Informasi', icon: Info },
  { id: 'pengaduan', label: 'Pengaduan', icon: MessageSquareWarning },
  { id: 'bantuan', label: 'Bantuan', icon: HelpCircle },
];

interface LoginViewProps {
  instansi: InstansiItem[];
  accountOverrides?: Record<string, AccountCredentialOverride>;
  onLogin: (user: AuthUser) => void;
  onResetPassword: (
    accountId: string,
    newPassword: string,
    email: string,
    peran: UserRole,
    namaLengkap: string
  ) => void;
  onAddPengaduan: (
    payload: Omit<PengaduanMasyarakat, 'id' | 'status' | 'tanggapan'>
  ) => void;
  currentUser?: AuthUser | null;
  onCancel?: () => void;
}

export function LoginView({
  instansi,
  accountOverrides = {},
  onLogin,
  onResetPassword,
  onAddPengaduan,
  currentUser,
  onCancel,
}: LoginViewProps) {
  const [portalNav, setPortalNav] = useState<PortalNav>('beranda');
  const [showAspirationModal, setShowAspirationModal] = useState(false);
  const loginCardRef = useRef<HTMLDivElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    currentUser?.peran || 'Admin MPP'
  );
  // Username dan kata sandi selalu dimulai kosong tanpa simpan otomatis
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTenanId, setSelectedTenanId] = useState(
    currentUser?.instansiId || instansi[0]?.id || ''
  );
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // State untuk menu Lupa Password terhubung email pengguna
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [targetResetAccount, setTargetResetAccount] = useState<SystemAccount | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const allAccounts = buildSystemAccounts(instansi, accountOverrides);
  const petugasAccounts = allAccounts.filter((a) => a.peran === 'Petugas MPP');

  useEffect(() => {
    if (mode !== 'forgot' || forgotStep !== 2 || !otpExpiresAt) {
      return;
    }
    const updateTick = () => {
      const diff = Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 1000));
      setRemainingSeconds(diff);
    };
    updateTick();
    const timer = setInterval(updateTick, 1000);
    return () => clearInterval(timer);
  }, [mode, forgotStep, otpExpiresAt]);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setUsername('');
    setPassword('');
    setForgotUsername('');
    setForgotEmail('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const openForgotMode = () => {
    setPortalNav('beranda');
    setMode('forgot');
    setForgotStep(1);
    setForgotUsername(username.trim());
    setForgotEmail('');
    setTargetResetAccount(null);
    setGeneratedOtp('');
    setOtpInput('');
    setNewPassword('');
    setConfirmNewPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const backToLoginMode = () => {
    setMode('login');
    setForgotStep(1);
    setTargetResetAccount(null);
    setGeneratedOtp('');
    setOtpInput('');
    setNewPassword('');
    setConfirmNewPassword('');
    setUsername('');
    setPassword('');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUsername = username.trim().toLowerCase();
    const matched = allAccounts.find(
      (a) => a.peran === selectedRole && a.username.toLowerCase() === cleanUsername
    );

    if (!matched || !verifyAccountPassword(matched, password, accountOverrides)) {
      setErrorMsg(
        `Username atau kata sandi tidak sesuai untuk peran ${selectedRole}. Silakan periksa kembali.`
      );
      return;
    }

    const selectedInst = instansi.find((i) => i.id === selectedTenanId);
    const resolvedUser: AuthUser = {
      id: matched.id,
      username: matched.username,
      namaLengkap:
        matched.peran === 'PIC Instansi' && selectedInst
          ? selectedInst.picNama
          : matched.namaLengkap,
      peran: matched.peran,
      jabatan:
        matched.peran === 'PIC Instansi' && selectedInst
          ? `PIC ${selectedInst.singkatan}`
          : matched.jabatan,
      email: matched.email,
      instansiId:
        matched.peran === 'Petugas MPP'
          ? matched.instansiId
          : matched.peran === 'PIC Instansi'
          ? selectedTenanId
          : undefined,
    };

    // Kosongkan input setelah autentikasi berhasil
    setUsername('');
    setPassword('');
    onLogin(resolvedUser);
  };

  const issueOtpForAccount = (account: SystemAccount) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setTargetResetAccount(account);
    setGeneratedOtp(code);
    setOtpExpiresAt(Date.now() + 5 * 60 * 1000);
    setRemainingSeconds(300);
    setOtpInput('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotStep(2);
    setErrorMsg('');
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = forgotUsername.trim().toLowerCase();
    const cleanEmail = forgotEmail.trim().toLowerCase();

    const matched = allAccounts.find(
      (a) =>
        a.peran === selectedRole &&
        a.username.toLowerCase() === cleanUser &&
        a.email.toLowerCase() === cleanEmail
    );

    if (!matched) {
      setErrorMsg(
        `Username dan email terhubung tidak cocok untuk peran ${selectedRole}. Periksa kembali email terdaftar Anda.`
      );
      return;
    }

    issueOtpForAccount(matched);
  };

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!targetResetAccount) {
      setErrorMsg('Sesi pemulihan tidak ditemukan. Silakan ulangi verifikasi email.');
      setForgotStep(1);
      return;
    }
    if (Date.now() > otpExpiresAt) {
      setErrorMsg('Kode verifikasi sudah kedaluwarsa. Klik "Kirim Ulang Kode" untuk kode baru.');
      return;
    }
    if (otpInput.trim() !== generatedOtp) {
      setErrorMsg('Kode verifikasi (OTP) tidak sesuai dengan yang dikirim ke email.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Kata sandi baru minimal harus terdiri dari 6 karakter.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    onResetPassword(
      targetResetAccount.id,
      newPassword,
      targetResetAccount.email,
      targetResetAccount.peran,
      targetResetAccount.namaLengkap
    );

    const recoveredEmail = targetResetAccount.email;
    const recoveredUsername = targetResetAccount.username;
    backToLoginMode();
    setSuccessMsg(
      `Kata sandi akun ${recoveredUsername} berhasil diperbarui melalui verifikasi email ${recoveredEmail}. Silakan masuk dengan kata sandi baru Anda.`
    );
  };

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleHeaderLoginClick = () => {
    setPortalNav('beranda');
    setMode('login');
    setTimeout(() => {
      loginCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      usernameInputRef.current?.focus();
    }, 60);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] via-[#f6f9ff] to-[#e4efff] text-slate-900 flex">
      {/* Left Civic Sidebar */}
      <aside className="hidden lg:flex w-64 bg-gradient-to-b from-white via-[#f8fbff] to-[#edf4ff] border-r border-slate-200/80 flex-col justify-between shrink-0">
        <div className="p-5 space-y-6">
          {/* Centered Brand Logo */}
          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-20 h-20 rounded-2xl bg-white border border-slate-100 shadow-xs overflow-hidden flex items-center justify-center p-1.5">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_pumnsrpumnsrpumn_1__1__1518cbe0.jpg"
                alt="Logo SIMPEL MPP Kabupaten Kendal"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="mt-3">
              <div className="text-sm font-bold text-slate-900 tracking-tight">
                Simpel MPP
              </div>
              <div className="text-xs font-semibold text-slate-700">
                Kabupaten Kendal
              </div>
            </div>
          </div>

          {/* Portal Navigation */}
          <nav className="space-y-1.5" aria-label="Navigasi Portal">
            {PORTAL_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = portalNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPortalNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#0b5ed7] text-white shadow-sm shadow-blue-700/20'
                      : 'text-slate-700 hover:bg-blue-50/80 hover:text-blue-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <SidebarCallCenterAndMotto />
      </aside>

      {/* Main Portal Workspace */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col gap-5 max-w-[1380px] mx-auto w-full">
        {/* Top White Rounded Header */}
        <header className="bg-white border border-slate-200/80 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 p-1">
              <img
                src="/assets/aistudio/Kendal_Regency_Emblem_-_Colored_-_2048x2048_-_zonalogo.com__1__81833860.png"
                alt="Lambang Kabupaten Kendal"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                SIMPEL MPP Kabupaten Kendal
              </h1>
              <p className="text-xs text-slate-500 truncate">
                Sistem Informasi Monitoring Pelayanan Publik — Portal Masuk Pengguna
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0">
            {/* Compact Mobile Nav Switcher */}
            <div className="flex lg:hidden items-center gap-1 overflow-x-auto max-w-full">
              {PORTAL_NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPortalNav(item.id)}
                  className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg whitespace-nowrap cursor-pointer ${
                    portalNav === item.id
                      ? 'bg-[#0b5ed7] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
              <User className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span className="font-medium whitespace-nowrap">
                {currentUser ? currentUser.namaLengkap : 'Pengguna Portal'}
              </span>
            </div>

            {!currentUser && (
              <button
                type="button"
                onClick={handleHeaderLoginClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>Log In</span>
              </button>
            )}

            {onCancel && currentUser && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0b5ed7] hover:bg-blue-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Kembali ke Dashboard
              </button>
            )}
          </div>
        </header>

        {/* Blue Civic Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a4ab8] via-[#1363df] to-[#1e88e5] text-white shadow-sm">
          <div className="absolute inset-y-0 right-0 w-full md:w-[62%] pointer-events-none">
            <KendalBannerArtwork />
          </div>

          <div className="relative z-10 p-6 sm:p-8 max-w-2xl space-y-3">
            <h2 className="text-2xl sm:text-[28px] font-bold leading-tight tracking-tight text-balance">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-xs whitespace-nowrap cursor-pointer"
              >
                <MessageSquareHeart className="w-4 h-4 shrink-0" />
                <span>Aspirasi, Saran & Pengaduan Masyarakat</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setPortalNav(portalNav === 'beranda' ? 'informasi' : 'beranda')
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>
                  {portalNav === 'beranda' ? 'Pelajari Lebih Lanjut' : 'Kembali ke Form Masuk'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Active Portal View */}
        {portalNav === 'beranda' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Card: Pilih Peran Pengguna (Hak Akses Sistem) */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0b5ed7] flex items-center justify-center shrink-0">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Pilih Peran Pengguna (Hak Akses Sistem)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pilih peran Anda untuk mengakses layanan sesuai dengan kewenangan.
                    </p>
                  </div>
                </div>

                {/* Role Selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {ROLE_CARDS.map((card) => {
                    const Icon = card.icon;
                    const isSelected = selectedRole === card.peran;
                    const roleEmail =
                      card.peran === 'Petugas MPP'
                        ? 'petugas.<tenan>@kendalkab.go.id'
                        : allAccounts.find((a) => a.peran === card.peran)?.email || '';

                    return (
                      <div
                        key={card.peran}
                        onClick={() => handleSelectRole(card.peran)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectRole(card.peran);
                          }
                        }}
                        className={`rounded-xl border p-4 transition-all cursor-pointer flex flex-col justify-between gap-3.5 ${
                          isSelected
                            ? 'border-[#0b5ed7] bg-blue-50/35 ring-1 ring-[#0b5ed7]/20'
                            : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.badgeClass}`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-900">
                              {card.peran}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {card.hakAkses}
                          </p>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-200/70 rounded-lg px-2.5 py-1.5">
                            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-mono truncate">{roleEmail}</span>
                          </div>
                        </div>

                        <div
                          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                            isSelected
                              ? 'bg-[#0b5ed7] text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        >
                          <span>
                            {isSelected ? `Masuk sebagai ${card.peran}` : 'Pilih'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daftar Username & Email Petugas MPP per Tenan (tanpa kata sandi) */}
              {selectedRole === 'Petugas MPP' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <Building2 className="w-4 h-4 text-[#0b5ed7] shrink-0" />
                      <span>Akun Petugas Tenan MPP ({petugasAccounts.length} Tenan)</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Klik tenan untuk salin username
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                    {petugasAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          if (mode === 'forgot') {
                            setForgotUsername(acc.username);
                            setForgotStep(1);
                          } else {
                            setUsername(acc.username);
                            setPassword('');
                          }
                          if (acc.instansiId) setSelectedTenanId(acc.instansiId);
                          setErrorMsg('');
                        }}
                        className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                          (mode === 'forgot' ? forgotUsername : username) === acc.username
                            ? 'bg-blue-50 border-[#0b5ed7] text-blue-900'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span className="truncate font-semibold">
                            {acc.tenanLabel || acc.jabatan}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500 shrink-0">
                            {acc.username}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500 truncate">
                          {acc.email}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedRole === 'PIC Instansi' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Building2 className="w-4 h-4 text-[#0b5ed7] shrink-0" />
                    <span className="font-semibold">Pilih Gerai Instansi PIC:</span>
                  </div>
                  <select
                    value={selectedTenanId}
                    onChange={(e) => setSelectedTenanId(e.target.value)}
                    className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                  >
                    {instansi.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.singkatan} — {inst.picNama}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right Card: Masuk dengan Akun / Lupa Password */}
            <div
              ref={loginCardRef}
              className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between"
            >
              {mode === 'login' ? (
                <div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0b5ed7] flex items-center justify-center shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Masuk dengan Akun
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Masuk menggunakan akun Anda untuk mengakses seluruh layanan sistem.
                      </p>
                    </div>
                  </div>

                  {successMsg && (
                    <div className="mt-4 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} autoComplete="off" className="mt-5 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                        Peran Terpilih
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => handleSelectRole(e.target.value as UserRole)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-[#0b5ed7]"
                      >
                        {ROLE_CARDS.map((a) => (
                          <option key={a.peran} value={a.peran}>
                            {a.peran} — {a.jabatan}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                        Username
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          ref={usernameInputRef}
                          type="text"
                          name="simpel_username_manual"
                          required
                          autoComplete="off"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Masukkan Username"
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#0b5ed7]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <label className="block text-xs font-semibold text-slate-800">
                          Kata Sandi
                        </label>
                        <button
                          type="button"
                          onClick={openForgotMode}
                          className="text-xs font-semibold text-[#0b5ed7] hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          Lupa Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="simpel_password_manual"
                          required
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Masukkan kata sandi"
                          className="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#0b5ed7]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white bg-[#0b5ed7] hover:bg-blue-800 rounded-xl transition-colors shadow-sm shadow-blue-700/20 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Masuk sebagai {selectedRole}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 text-slate-900">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0b5ed7] flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <h2 className="text-base font-bold">Lupa Kata Sandi (Via Email)</h2>
                    </div>
                    <button
                      type="button"
                      onClick={backToLoginMode}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Kembali</span>
                    </button>
                  </div>

                  {forgotStep === 1 ? (
                    <>
                      <p className="text-xs text-slate-500 mt-2">
                        Masukkan username dan email terhubung sesuai peran hak akses untuk menerima kode verifikasi pemulihan sandi.
                      </p>

                      <form onSubmit={handleRequestOtp} autoComplete="off" className="mt-5 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                            Peran Pengguna
                          </label>
                          <select
                            value={selectedRole}
                            onChange={(e) => handleSelectRole(e.target.value as UserRole)}
                            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-[#0b5ed7]"
                          >
                            {ROLE_CARDS.map((a) => (
                              <option key={a.peran} value={a.peran}>
                                {a.peran} — {a.jabatan}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                            Username
                          </label>
                          <input
                            type="text"
                            required
                            autoComplete="off"
                            value={forgotUsername}
                            onChange={(e) => setForgotUsername(e.target.value)}
                            placeholder="Contoh: admin atau petugas.dpmptsp"
                            className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#0b5ed7]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                            Email Terhubung Akun
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              required
                              autoComplete="off"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              placeholder="nama@kendalkab.go.id"
                              className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#0b5ed7]"
                            />
                          </div>
                        </div>

                        {errorMsg && (
                          <div className="p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
                            {errorMsg}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white bg-[#0b5ed7] hover:bg-blue-800 rounded-xl transition-colors cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>Kirim Kode Verifikasi ke Email</span>
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-slate-500 mt-2">
                        Masukkan kode verifikasi 6 digit yang dikirim ke{' '}
                        <span className="font-mono font-semibold text-slate-800">
                          {targetResetAccount?.email}
                        </span>{' '}
                        lalu buat kata sandi baru.
                      </p>

                      {targetResetAccount && (
                        <div className="mt-4 bg-blue-50/70 border border-blue-200 rounded-xl p-3 space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-blue-900">
                              Email Verifikasi Terkirim
                            </span>
                            <span className="font-mono tabular-nums text-[11px] font-semibold text-[#0b5ed7]">
                              Berlaku {formatCountdown(remainingSeconds)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600">
                            Tujuan:{' '}
                            <span className="font-mono text-slate-900">
                              {targetResetAccount.email}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 bg-white border border-blue-200 rounded-lg px-3 py-2">
                            <span className="text-[11px] text-slate-500">Kode OTP Email:</span>
                            <span className="font-mono tabular-nums text-sm font-bold tracking-widest text-blue-800">
                              {generatedOtp}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <a
                              href={`mailto:${encodeURIComponent(
                                targetResetAccount.email
                              )}?subject=${encodeURIComponent(
                                'Kode Verifikasi Reset Kata Sandi SIMPEL MPP Kendal'
                              )}&body=${encodeURIComponent(
                                `Yth. ${targetResetAccount.namaLengkap} (${targetResetAccount.peran}),\n\nBerikut kode verifikasi OTP untuk pemulihan kata sandi akun ${targetResetAccount.username}: ${generatedOtp}\nKode berlaku selama 5 menit.`
                              )}`}
                              className="text-[11px] font-semibold text-[#0b5ed7] hover:underline"
                            >
                              Buka Aplikasi Email
                            </a>
                            <button
                              type="button"
                              onClick={() => issueOtpForAccount(targetResetAccount)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Kirim Ulang Kode</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <form
                        onSubmit={handleConfirmResetPassword}
                        autoComplete="off"
                        className="mt-4 space-y-3.5"
                      >
                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1">
                            Kode Verifikasi Email (6 Digit)
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            required
                            autoComplete="off"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                            placeholder="Masukkan 6 digit kode OTP"
                            className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl font-mono tabular-nums tracking-widest focus:outline-none focus:border-[#0b5ed7]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1">
                            Kata Sandi Baru (min. 6 karakter)
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              name="simpel_reset_new_password"
                              required
                              minLength={6}
                              autoComplete="new-password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Masukkan kata sandi baru"
                              className="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#0b5ed7]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                              aria-label={showNewPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                            >
                              {showNewPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1">
                            Konfirmasi Kata Sandi Baru
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              name="simpel_reset_confirm_password"
                              required
                              minLength={6}
                              autoComplete="new-password"
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              placeholder="Ulangi kata sandi baru"
                              className="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#0b5ed7]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                              aria-label={showConfirmPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {errorMsg && (
                          <div className="p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
                            {errorMsg}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white bg-[#0b5ed7] hover:bg-blue-800 rounded-xl transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Simpan Kata Sandi Baru</span>
                        </button>
                      </form>
                    </>
                  )}
                </div>
              )}

              <div className="mt-5 bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-700">
                <Info className="w-4 h-4 text-[#0b5ed7] shrink-0 mt-0.5" />
                <span>
                  Pastikan Anda menggunakan akun yang sesuai dengan peran dan kewenangan yang diberikan. Kata sandi tidak disimpan otomatis di peramban.
                </span>
              </div>
            </div>
          </div>
        ) : portalNav === 'layanan' ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Daftar Gerai Instansi & Layanan Terpadu MPP Kendal
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {instansi.filter((i) => i.aktif).length} gerai instansi beroperasi melayani masyarakat Kabupaten Kendal
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPortalNav('beranda')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0b5ed7] rounded-xl cursor-pointer whitespace-nowrap"
              >
                Masuk ke Sistem
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {instansi.map((inst) => (
                <div
                  key={inst.id}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">{inst.singkatan}</span>
                    <span className="text-[11px] font-mono text-[#0b5ed7] font-semibold">
                      SLA {inst.standarWaktuMenit} menit
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-700">{inst.nama}</div>
                  <p className="text-xs text-slate-500">{inst.contohLayanan}</p>
                  <div className="text-[11px] text-slate-600 pt-1">
                    {inst.loket.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : portalNav === 'informasi' ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-bold text-slate-900">
                Informasi Operasional & Standar Layanan MPP Kendal
              </h2>
              <button
                type="button"
                onClick={() => setPortalNav('beranda')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0b5ed7] rounded-xl cursor-pointer whitespace-nowrap"
              >
                Kembali ke Beranda
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-slate-900">Jam Operasional Loket</div>
                <p className="text-slate-600 leading-relaxed">
                  Senin – Kamis: 08.00 – 15.00 WIB · Jumat: 08.00 – 11.30 WIB (Call Center MPP sampai 15.00 WIB).
                </p>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-slate-900">Pemantauan Real-Time</div>
                <p className="text-slate-600 leading-relaxed">
                  SIMPEL MPP memantau jumlah pemohon, penyelesaian layanan, kendala loket, dan tindak lanjut SLA secara langsung.
                </p>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-slate-900">Pelaporan Terstandar</div>
                <p className="text-slate-600 leading-relaxed">
                  Laporan harian, mingguan, dan bulanan tersedia dalam format PDF, Excel (.xlsx), dan Word (.docx).
                </p>
              </div>
            </div>
          </div>
        ) : portalNav === 'pengaduan' ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Formulir Aspirasi, Saran, Kritik & Pengaduan Masyarakat
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tanggapan Anda langsung tercatat ke dalam menu Pencatatan Pengaduan Masyarakat MPP Kendal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPortalNav('beranda')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0b5ed7] rounded-xl cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                Kembali ke Beranda
              </button>
            </div>

            <PublicAspirationForm
              instansi={instansi}
              onSubmitPengaduan={onAddPengaduan}
            />
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-bold text-slate-900">
                Panduan Masuk & Pemulihan Kata Sandi
              </h2>
              <button
                type="button"
                onClick={() => setPortalNav('beranda')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0b5ed7] rounded-xl cursor-pointer whitespace-nowrap"
              >
                Ke Form Login
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
              <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-slate-900">Cara Masuk Sistem</div>
                <p>
                  Pilih peran hak akses Anda (Admin MPP, Petugas MPP sesuai tenan, PIC Instansi, atau Pimpinan), lalu ketikkan username dan kata sandi secara manual.
                </p>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-slate-900">Lupa Kata Sandi & Email Terhubung</div>
                <p>
                  Klik tautan <strong>Lupa Password?</strong> pada formulir masuk, masukkan username dan email terhubung akun Anda untuk mendapatkan kode OTP pemulihan sandi.
                </p>
              </div>
            </div>
          </div>
        )}
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
