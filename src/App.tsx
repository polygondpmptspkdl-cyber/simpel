import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileBarChart2,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Map,
  Menu,
  MessageSquareHeart,
  Plus,
  UserCircle2,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { SidebarCallCenterAndMotto } from './components/CivicThemeDecor';
import { DashboardView } from './components/DashboardView';
import { InstansiPengaturanView } from './components/InstansiPengaturanView';
import { LaporanView } from './components/LaporanView';
import { LoginView } from './components/LoginView';
import { PelayananView } from './components/PelayananView';
import { PengaduanSurveiView } from './components/PengaduanSurveiView';
import { PermasalahanView } from './components/PermasalahanView';
import { PetaPermasalahanView } from './components/PetaPermasalahanView';
import { TindakLanjutView } from './components/TindakLanjutView';
import { useMppStore } from './hooks/useMppStore';
import { AuthUser, NavTab, UserRole } from './types/mpp';

const NAV_ITEMS: Array<{
  id: NavTab;
  label: string;
  section: string;
  icon: typeof LayoutDashboard;
}> = [
  {
    id: 'dashboard',
    label: 'Dashboard Real-Time',
    section: 'Pemantauan Utama',
    icon: LayoutDashboard,
  },
  {
    id: 'peta-masalah',
    label: 'Peta Permasalahan MPP',
    section: 'Pemantauan Utama',
    icon: Map,
  },
  {
    id: 'pelayanan',
    label: 'Pelayanan & Antrean',
    section: 'Operasional Harian',
    icon: Users,
  },
  {
    id: 'permasalahan',
    label: 'Permasalahan Harian',
    section: 'Operasional Harian',
    icon: AlertCircle,
  },
  {
    id: 'tindak-lanjut',
    label: 'Tindak Lanjut & Verifikasi',
    section: 'Operasional Harian',
    icon: Wrench,
  },
  {
    id: 'pengaduan-survei',
    label: 'Pengaduan & Survei IKM',
    section: 'Layanan Masyarakat',
    icon: MessageSquareHeart,
  },
  {
    id: 'laporan',
    label: 'Laporan (PDF/Excel/Word)',
    section: 'Pelaporan & Sistem',
    icon: FileBarChart2,
  },
  {
    id: 'instansi-pengaturan',
    label: 'Instansi & Pengaturan',
    section: 'Pelaporan & Sistem',
    icon: Building2,
  },
];

const ROLE_ALLOWED_TABS: Record<UserRole, NavTab[]> = {
  'Admin MPP': [
    'dashboard',
    'peta-masalah',
    'pelayanan',
    'permasalahan',
    'tindak-lanjut',
    'pengaduan-survei',
    'laporan',
    'instansi-pengaturan',
  ],
  'Petugas MPP': [
    'dashboard',
    'pelayanan',
    'permasalahan',
    'pengaduan-survei',
    'laporan',
  ],
  'PIC Instansi': [
    'dashboard',
    'peta-masalah',
    'tindak-lanjut',
    'pengaduan-survei',
    'laporan',
  ],
  Pimpinan: ['dashboard', 'peta-masalah', 'pengaduan-survei', 'laporan'],
};

export function App() {
  const store = useMppStore();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const allowedTabs = ROLE_ALLOWED_TABS[store.currentRole];
  const effectiveTab: NavTab = allowedTabs.includes(activeTab) ? activeTab : 'dashboard';
  const activeNav = NAV_ITEMS.find((item) => item.id === effectiveTab) || NAV_ITEMS[0];
  const unresolvedCount = store.permasalahan.filter(
    (m) => m.status !== 'Selesai' && m.status !== 'Ditutup'
  ).length;

  const handleExported = (format: 'PDF' | 'Excel' | 'Word', filename: string) => {
    store.pushToast(
      `Laporan ${format} berhasil dibuat`,
      `Berkas ${filename} telah diunduh.`
    );
  };

  const navigateTo = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    store.loginUser(user);
    setShowChangePassword(false);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    store.logoutUser();
    setShowChangePassword(false);
    setMobileMenuOpen(false);
  };

  const toastLayer =
    store.toasts.length > 0 ? (
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full px-4 sm:px-0 no-print">
        {store.toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-slate-900 text-white border border-slate-700 rounded-xl p-3.5 shadow-lg flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-xs font-semibold">{toast.title}</div>
                {toast.description && (
                  <div className="text-[11px] text-slate-300 mt-0.5">{toast.description}</div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => store.dismissToast(toast.id)}
              className="text-slate-400 hover:text-white cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    ) : null;

  if (!store.authUser) {
    return (
      <>
        <LoginView
          instansi={store.instansi}
          accountOverrides={store.accountOverrides}
          onLogin={handleLoginSuccess}
          onResetPassword={store.resetPasswordViaEmail}
          onAddPengaduan={(payload) =>
            store.addPengaduan(payload, 'Masyarakat (Portal Publik)')
          }
          currentUser={store.authUser}
        />
        {toastLayer}
      </>
    );
  }

  const sections = ['Pemantauan Utama', 'Operasional Harian', 'Layanan Masyarakat', 'Pelaporan & Sistem'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] via-[#f6f9ff] to-[#e4efff] text-slate-900 flex">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Navigation Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-white via-[#f8fbff] to-[#edf4ff] text-slate-900 border-r border-slate-200/80 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-4 bg-white border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-100 shadow-xs overflow-hidden flex items-center justify-center shrink-0 p-1">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_pumnsrpumnsrpumn_1__1__1518cbe0.jpg"
                alt="Logo SIMPEL MPP Kabupaten Kendal"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold tracking-tight text-slate-900 truncate">
                Simpel MPP
              </div>
              <div className="text-[11px] font-medium text-slate-500 truncate">
                Kabupaten Kendal
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 bg-transparent">
          {sections.map((sectionName) => {
            const items = NAV_ITEMS.filter(
              (i) => i.section === sectionName && allowedTabs.includes(i.id)
            );
            if (items.length === 0) return null;
            return (
              <div key={sectionName}>
                <div className="px-3 mb-1.5 text-[11px] font-semibold text-slate-500">
                  {sectionName}
                </div>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = effectiveTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateTo(item.id)}
                        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#0b5ed7] text-white shadow-sm shadow-blue-700/20'
                            : 'text-slate-700 hover:bg-blue-50/80 hover:text-blue-800'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.id === 'tindak-lanjut' && unresolvedCount > 0 && (
                          <span
                            className={`font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                              isActive
                                ? 'bg-blue-800 text-white'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {unresolvedCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Active Account & Login Menu Footer */}
        <div className="p-4 border-t border-slate-200 space-y-2.5 bg-transparent">
          <div className="flex items-start gap-2.5">
            <UserCircle2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {store.authUser.namaLengkap}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {store.authUser.peran} · {store.authUser.jabatan}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 mt-0.5 truncate">
                <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                <span className="truncate">{store.authUser.email}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowChangePassword(true);
              setMobileMenuOpen(false);
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50/70 border border-blue-200 hover:bg-blue-100/70 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 shrink-0" />
            <span>Ubah Kata Sandi & Email</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-rose-700 bg-white border border-slate-200 hover:bg-rose-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>

        <SidebarCallCenterAndMotto />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb/Title left + Actions right */}
        <header className="px-4 lg:px-8 pt-4 sticky top-0 z-20">
          <div className="max-w-[1440px] mx-auto bg-white border border-slate-200/80 rounded-2xl px-4 lg:px-5 py-3 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                aria-label="Buka menu navigasi"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex w-9 h-9 rounded-lg bg-white border border-slate-200 p-0.5 items-center justify-center shrink-0">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_pumnsrpumnsrpumn_1__1__1518cbe0.jpg"
                  alt="Logo SIMPEL MPP Kabupaten Kendal"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <span className="text-slate-600 font-semibold hidden md:inline whitespace-nowrap truncate max-w-xs lg:max-w-sm xl:max-w-lg">
                    SIMPEL MPP Kendal (Sistem Informasi Monitoring Pelayanan Publik Kabupaten Kendal)
                  </span>
                  <span className="text-slate-300 hidden md:inline" aria-hidden="true">
                    /
                  </span>
                  <h1 className="font-bold text-slate-900 truncate">{activeNav.label}</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {allowedTabs.includes('permasalahan') ? (
                <button
                  type="button"
                  onClick={() => navigateTo('permasalahan')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Catat Masalah</span>
                </button>
              ) : allowedTabs.includes('tindak-lanjut') ? (
                <button
                  type="button"
                  onClick={() => navigateTo('tindak-lanjut')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Wrench className="w-4 h-4 shrink-0" />
                  <span>Tindak Lanjut</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigateTo('laporan')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <FileBarChart2 className="w-4 h-4 shrink-0" />
                  <span>Cetak Laporan</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-4 lg:p-8 max-w-[1440px] w-full mx-auto">
          {effectiveTab === 'dashboard' && (
            <DashboardView
              instansi={store.instansi}
              pelayanan={store.pelayanan}
              permasalahan={store.permasalahan}
              pengaduan={store.pengaduan}
              survei={store.survei}
              trenMingguan={store.trenMingguan}
              realtimeEnabled={store.realtimeEnabled}
              onToggleRealtime={() => store.setRealtimeEnabled((v) => !v)}
              lastUpdated={store.lastUpdated}
              currentRole={store.currentRole}
              onNavigate={navigateTo}
              onAddPengaduan={store.addPengaduan}
              onExported={handleExported}
            />
          )}

          {effectiveTab === 'peta-masalah' && (
            <PetaPermasalahanView
              instansi={store.instansi}
              permasalahan={store.permasalahan}
            />
          )}

          {effectiveTab === 'pelayanan' && (
            <PelayananView
              instansi={store.instansi}
              pelayanan={store.pelayanan}
              onSavePelayanan={store.addOrUpdatePelayanan}
            />
          )}

          {effectiveTab === 'permasalahan' && (
            <PermasalahanView
              instansi={store.instansi}
              permasalahan={store.permasalahan}
              authUser={store.authUser}
              onAddPermasalahan={store.addPermasalahan}
            />
          )}

          {effectiveTab === 'tindak-lanjut' && (
            <TindakLanjutView
              instansi={store.instansi}
              permasalahan={store.permasalahan}
              currentRole={store.currentRole}
              onUpdateStatus={store.updatePermasalahanStatus}
            />
          )}

          {effectiveTab === 'pengaduan-survei' && (
            <PengaduanSurveiView
              instansi={store.instansi}
              pengaduan={store.pengaduan}
              survei={store.survei}
              onAddPengaduan={store.addPengaduan}
              onUpdatePengaduan={store.updatePengaduan}
              onAddSurvei={store.addSurvei}
            />
          )}

          {effectiveTab === 'laporan' && (
            <LaporanView
              instansi={store.instansi}
              pelayanan={store.pelayanan}
              permasalahan={store.permasalahan}
              pengaduan={store.pengaduan}
              survei={store.survei}
              currentRole={store.currentRole}
              onExported={handleExported}
            />
          )}

          {effectiveTab === 'instansi-pengaturan' && (
            <InstansiPengaturanView
              instansi={store.instansi}
              accountOverrides={store.accountOverrides}
              auditLog={store.auditLog}
              currentRole={store.currentRole}
              onAddInstansi={store.addInstansi}
              onToggleAktif={store.toggleInstansiAktif}
              onUpdateAccountEmail={store.updateAccountEmail}
              onResetDemo={store.resetToDemoData}
            />
          )}
        </main>
      </div>

      {/* Modal Ubah Kata Sandi & Email Terhubung */}
      {showChangePassword && store.authUser && (
        <ChangePasswordModal
          user={store.authUser}
          onClose={() => setShowChangePassword(false)}
          onChangePassword={store.changeOwnPassword}
          onUpdateEmail={store.updateAccountEmail}
        />
      )}

      {/* Toast Notifications */}
      {toastLayer}
    </div>
  );
}

export default App;
