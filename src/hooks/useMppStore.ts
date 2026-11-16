import { useCallback, useEffect, useState } from 'react';
import {
  INITIAL_AUDIT_LOG,
  INITIAL_INSTANSI,
  INITIAL_PELAYANAN,
  INITIAL_PENGADUAN,
  INITIAL_PERMASALAHAN,
  INITIAL_SURVEI,
  INITIAL_TREN_MINGGUAN,
  TODAY_ISO,
} from '../data/initialData';
import {
  AccountCredentialOverride,
  AuditLogEntry,
  AuthUser,
  InstansiItem,
  PelayananHarian,
  PengaduanMasyarakat,
  PermasalahanHarian,
  ProblemStatus,
  SurveiKepuasan,
  TrenHarianPoint,
  UserRole,
} from '../types/mpp';
import {
  buildSystemAccounts,
  hashPassword,
  verifyAccountPassword,
} from '../utils/authAccounts';

const STORAGE_KEY = 'simpel_mpp_kendal_v1';
const AUTH_STORAGE_KEY = 'simpel_mpp_auth_v1';

interface MppStorageState {
  instansi: InstansiItem[];
  pelayanan: PelayananHarian[];
  permasalahan: PermasalahanHarian[];
  pengaduan: PengaduanMasyarakat[];
  survei: SurveiKepuasan[];
  trenMingguan: TrenHarianPoint[];
  auditLog: AuditLogEntry[];
  accountOverrides: Record<string, AccountCredentialOverride>;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone: 'success' | 'info' | 'warning';
}

function getInitialState(): MppStorageState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MppStorageState;
      if (parsed && Array.isArray(parsed.instansi) && Array.isArray(parsed.permasalahan)) {
        return {
          ...parsed,
          accountOverrides: parsed.accountOverrides || {},
        };
      }
    }
  } catch {
    // Fallback to initial data
  }
  return {
    instansi: INITIAL_INSTANSI,
    pelayanan: INITIAL_PELAYANAN,
    permasalahan: INITIAL_PERMASALAHAN,
    pengaduan: INITIAL_PENGADUAN,
    survei: INITIAL_SURVEI,
    trenMingguan: INITIAL_TREN_MINGGUAN,
    auditLog: INITIAL_AUDIT_LOG,
    accountOverrides: {},
  };
}

function nowTimeStr(): string {
  return new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function nowHmStr(): string {
  return new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getInitialAuthUser(
  initialState: MppStorageState
): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AuthUser>;
      if (parsed && parsed.peran && parsed.username) {
        const accounts = buildSystemAccounts(
          initialState.instansi,
          initialState.accountOverrides
        );
        const matched = accounts.find(
          (a) =>
            a.username.toLowerCase() === parsed.username!.toLowerCase() &&
            a.peran === parsed.peran
        );
        const resolvedId = parsed.id || matched?.id || `acc-${parsed.username}`;
        const resolvedEmail =
          initialState.accountOverrides[resolvedId]?.email ||
          parsed.email ||
          matched?.email ||
          `${parsed.username}@kendalkab.go.id`;
        const resolvedNama =
          parsed.peran === 'Admin MPP' && parsed.username === 'admin'
            ? 'Restu Setiardi, SE'
            : parsed.namaLengkap || matched?.namaLengkap || parsed.username;

        return {
          id: resolvedId,
          username: parsed.username,
          namaLengkap: resolvedNama,
          peran: parsed.peran,
          jabatan: parsed.jabatan || matched?.jabatan || parsed.peran,
          email: resolvedEmail,
          instansiId: parsed.instansiId || matched?.instansiId,
        };
      }
    }
  } catch {
    // Fallback to null
  }
  return null;
}

export function useMppStore() {
  const [state, setState] = useState<MppStorageState>(getInitialState);
  const [authUser, setAuthUser] = useState<AuthUser | null>(() =>
    getInitialAuthUser(getInitialState())
  );
  const currentRole: UserRole = authUser?.peran || 'Admin MPP';
  const [realtimeEnabled, setRealtimeEnabled] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>(nowTimeStr);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback(
    (title: string, description?: string, tone: ToastMessage['tone'] = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, description, tone }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Persist to localStorage + broadcast across tabs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }, [state]);

  // Real-time stream simulation every 5 seconds when active
  useEffect(() => {
    if (!realtimeEnabled) return;
    const timer = setInterval(() => {
      setState((prev) => {
        const todayRecords = prev.pelayanan.filter((p) => p.tanggal === TODAY_ISO);
        if (todayRecords.length === 0) return prev;
        const randomIndex = Math.floor(Math.random() * todayRecords.length);
        const target = todayRecords[randomIndex];
        const addApplicant = Math.random() > 0.35 ? 1 : 0;
        const finishService = target.pelayananProses > 0 && Math.random() > 0.3 ? 1 : 0;

        const nextPelayanan = prev.pelayanan.map((item) => {
          if (item.id !== target.id) return item;
          const nextPemohon = item.jumlahPemohon + addApplicant;
          const nextSelesai = Math.min(nextPemohon, item.pelayananSelesai + finishService);
          const nextProses = Math.max(
            0,
            nextPemohon - nextSelesai - item.pelayananTertunda
          );
          const queuePrefix = item.nomorAntreanTerakhir.split('-')[0] || 'A';
          const queueNum = parseInt(item.nomorAntreanTerakhir.split('-')[1] || '1', 10) + addApplicant;
          return {
            ...item,
            jumlahPemohon: nextPemohon,
            pelayananSelesai: nextSelesai,
            pelayananProses: nextProses,
            nomorAntreanTerakhir: `${queuePrefix}-${String(queueNum).padStart(3, '0')}`,
            diperbaruiPada: nowHmStr(),
          };
        });

        const totalPemohonToday = nextPelayanan
          .filter((p) => p.tanggal === TODAY_ISO)
          .reduce((acc, cur) => acc + cur.jumlahPemohon, 0);
        const totalSelesaiToday = nextPelayanan
          .filter((p) => p.tanggal === TODAY_ISO)
          .reduce((acc, cur) => acc + cur.pelayananSelesai, 0);

        const nextTren = prev.trenMingguan.map((pt) =>
          pt.tanggal === TODAY_ISO
            ? {
                ...pt,
                totalPemohon: totalPemohonToday,
                pelayananSelesai: totalSelesaiToday,
              }
            : pt
        );

        return {
          ...prev,
          pelayanan: nextPelayanan,
          trenMingguan: nextTren,
        };
      });
      setLastUpdated(nowTimeStr());
    }, 5000);

    return () => clearInterval(timer);
  }, [realtimeEnabled]);

  const appendAudit = (
    prevAudit: AuditLogEntry[],
    modul: string,
    aktivitas: string,
    role: UserRole,
    actorName?: string
  ): AuditLogEntry[] => {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      waktu: nowHmStr(),
      pengguna: actorName || authUser?.namaLengkap || (role === 'Admin MPP' ? 'Pengelola MPP Kendal' : role),
      peran: role,
      modul,
      aktivitas,
    };
    return [entry, ...prevAudit].slice(0, 60);
  };

  const loginUser = useCallback(
    (user: AuthUser) => {
      setAuthUser(user);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } catch {
        // Ignore storage error
      }
      setState((prev) => ({
        ...prev,
        auditLog: appendAudit(
          prev.auditLog,
          'Autentikasi',
          `Masuk ke sistem sebagai ${user.peran} (${user.namaLengkap})`,
          user.peran,
          user.namaLengkap
        ),
      }));
      setLastUpdated(nowTimeStr());
      pushToast(`Selamat datang, ${user.namaLengkap}`, `Anda masuk dengan hak akses ${user.peran}.`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pushToast]
  );

  const logoutUser = useCallback(() => {
    const prevUser = authUser;
    setAuthUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
    if (prevUser) {
      setState((prev) => ({
        ...prev,
        auditLog: appendAudit(
          prev.auditLog,
          'Autentikasi',
          `Keluar dari sesi (${prevUser.namaLengkap})`,
          prevUser.peran,
          prevUser.namaLengkap
        ),
      }));
      pushToast('Sesi berakhir', 'Silakan pilih akun atau masuk kembali.', 'info');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, pushToast]);

  const updateAccountEmail = useCallback(
    (accountId: string, newEmail: string) => {
      const cleanEmail = newEmail.trim().toLowerCase();
      if (!cleanEmail) return;
      const nowFull = `${TODAY_ISO} ${nowHmStr()}`;
      const accounts = buildSystemAccounts(state.instansi, state.accountOverrides);
      const targetAcc = accounts.find((a) => a.id === accountId);

      setState((prev) => ({
        ...prev,
        accountOverrides: {
          ...prev.accountOverrides,
          [accountId]: {
            ...prev.accountOverrides[accountId],
            email: cleanEmail,
            updatedAt: nowFull,
          },
        },
        auditLog: appendAudit(
          prev.auditLog,
          'Pengaturan Akun',
          `Menghubungkan email ${cleanEmail} ke akun ${targetAcc?.username || accountId} (${targetAcc?.peran || 'Pengguna'})`,
          currentRole
        ),
      }));

      if (authUser && authUser.id === accountId) {
        const updatedAuth: AuthUser = { ...authUser, email: cleanEmail };
        setAuthUser(updatedAuth);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedAuth));
        } catch {
          // Ignore storage error
        }
      }

      setLastUpdated(nowTimeStr());
      pushToast(
        'Email pengguna diperbarui',
        `Email ${cleanEmail} terhubung ke akun ${targetAcc?.username || ''}.`
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authUser, currentRole, pushToast, state.accountOverrides, state.instansi]
  );

  const resetPasswordViaEmail = useCallback(
    (
      accountId: string,
      newPassword: string,
      email: string,
      peran: UserRole,
      namaLengkap: string
    ) => {
      const nowFull = `${TODAY_ISO} ${nowHmStr()}`;
      const newHash = hashPassword(newPassword);

      setState((prev) => ({
        ...prev,
        accountOverrides: {
          ...prev.accountOverrides,
          [accountId]: {
            ...prev.accountOverrides[accountId],
            passwordHash: newHash,
            updatedAt: nowFull,
          },
        },
        auditLog: appendAudit(
          prev.auditLog,
          'Autentikasi',
          `Reset kata sandi melalui verifikasi email (${email}) untuk ${namaLengkap}`,
          peran,
          namaLengkap
        ),
      }));

      setLastUpdated(nowTimeStr());
      pushToast(
        'Kata sandi berhasil diatur ulang',
        `Notifikasi pemulihan dicatat untuk email ${email}. Silakan masuk dengan kata sandi baru.`
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pushToast]
  );

  const changeOwnPassword = useCallback(
    (
      accountId: string,
      currentPassword: string,
      newPassword: string,
      notifyEmail: boolean
    ): { ok: boolean; error?: string } => {
      const accounts = buildSystemAccounts(state.instansi, state.accountOverrides);
      const targetAcc = accounts.find((a) => a.id === accountId);
      if (!targetAcc) {
        return { ok: false, error: 'Akun pengguna tidak ditemukan.' };
      }
      if (!verifyAccountPassword(targetAcc, currentPassword, state.accountOverrides)) {
        return { ok: false, error: 'Kata sandi saat ini tidak sesuai.' };
      }
      if (newPassword.length < 6) {
        return { ok: false, error: 'Kata sandi baru minimal terdiri dari 6 karakter.' };
      }
      if (currentPassword === newPassword) {
        return { ok: false, error: 'Kata sandi baru harus berbeda dari kata sandi saat ini.' };
      }

      const nowFull = `${TODAY_ISO} ${nowHmStr()}`;
      const newHash = hashPassword(newPassword);

      setState((prev) => ({
        ...prev,
        accountOverrides: {
          ...prev.accountOverrides,
          [accountId]: {
            ...prev.accountOverrides[accountId],
            passwordHash: newHash,
            updatedAt: nowFull,
          },
        },
        auditLog: appendAudit(
          prev.auditLog,
          'Keamanan Akun',
          `Mengubah kata sandi akun ${targetAcc.username}${
            notifyEmail ? ` & mengirim notifikasi ke ${targetAcc.email}` : ''
          }`,
          targetAcc.peran,
          authUser?.namaLengkap || targetAcc.namaLengkap
        ),
      }));

      setLastUpdated(nowTimeStr());
      pushToast(
        'Kata sandi berhasil diubah',
        notifyEmail
          ? `Pemberitahuan perubahan dikirim ke ${targetAcc.email}.`
          : 'Kata sandi baru langsung aktif.'
      );
      return { ok: true };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authUser, pushToast, state.accountOverrides, state.instansi]
  );

  // CRUD: Pelayanan Harian
  const addOrUpdatePelayanan = useCallback(
    (payload: Omit<PelayananHarian, 'id' | 'diperbaruiPada'>, existingId?: string) => {
      setState((prev) => {
        const inst = prev.instansi.find((i) => i.id === payload.instansiId);
        const updatedRecord: PelayananHarian = {
          ...payload,
          id: existingId || `pel-${Date.now()}`,
          diperbaruiPada: nowHmStr(),
        };
        const nextPelayanan = existingId
          ? prev.pelayanan.map((p) => (p.id === existingId ? updatedRecord : p))
          : [updatedRecord, ...prev.pelayanan];

        return {
          ...prev,
          pelayanan: nextPelayanan,
          auditLog: appendAudit(
            prev.auditLog,
            'Data Pelayanan',
            `${existingId ? 'Memperbarui' : 'Mencatat'} data pelayanan ${inst?.singkatan || ''} (${payload.jumlahPemohon} pemohon)`,
            currentRole
          ),
        };
      });
      setLastUpdated(nowTimeStr());
      pushToast(
        existingId ? 'Data pelayanan diperbarui' : 'Data pelayanan berhasil dicatat',
        'Ringkasan dashboard dan laporan otomatis telah diperbarui.'
      );
    },
    [currentRole, pushToast]
  );

  // CRUD: Permasalahan Harian
  const addPermasalahan = useCallback(
    (
      payload: Omit<
        PermasalahanHarian,
        'id' | 'kodeLaporan' | 'terverifikasi'
      >
    ) => {
      setState((prev) => {
        const nextNum = prev.permasalahan.length + 1;
        const kode = `MPP-2026-${String(nextNum).padStart(3, '0')}`;
        const inst = prev.instansi.find((i) => i.id === payload.instansiId);
        const newItem: PermasalahanHarian = {
          ...payload,
          id: `prob-${Date.now()}`,
          kodeLaporan: kode,
          terverifikasi: payload.status === 'Selesai' || payload.status === 'Ditutup',
        };
        const nextTren = prev.trenMingguan.map((pt) =>
          pt.tanggal === TODAY_ISO
            ? { ...pt, masalahTercatat: pt.masalahTercatat + 1 }
            : pt
        );
        return {
          ...prev,
          permasalahan: [newItem, ...prev.permasalahan],
          trenMingguan: nextTren,
          auditLog: appendAudit(
            prev.auditLog,
            'Permasalahan Harian',
            `Menambahkan laporan ${kode} pada ${inst?.singkatan || ''} (Prioritas: ${payload.tingkatPrioritas})`,
            currentRole
          ),
        };
      });
      setLastUpdated(nowTimeStr());
      pushToast(
        'Permasalahan harian tercatat',
        'Laporan masuk ke antrean pemantauan & penugasan PIC.'
      );
    },
    [currentRole, pushToast]
  );

  const updatePermasalahanStatus = useCallback(
    (
      id: string,
      updates: {
        status: ProblemStatus;
        picPenanganan?: string;
        tindakanPenanganan?: string;
        catatanEvaluasi?: string;
        terverifikasi?: boolean;
      }
    ) => {
      setState((prev) => {
        const target = prev.permasalahan.find((p) => p.id === id);
        if (!target) return prev;
        const isResolved = updates.status === 'Selesai' || updates.status === 'Ditutup';
        const nowFull = `${TODAY_ISO} ${nowHmStr()}`;
        const computedDurasi =
          isResolved && !target.durasiMenit
            ? Math.max(15, Math.floor(Math.random() * 45) + 20)
            : target.durasiMenit;

        const nextPermasalahan = prev.permasalahan.map((item) =>
          item.id === id
            ? {
                ...item,
                ...updates,
                waktuPenyelesaian: isResolved ? item.waktuPenyelesaian || nowFull : undefined,
                durasiMenit: isResolved ? computedDurasi : undefined,
              }
            : item
        );

        return {
          ...prev,
          permasalahan: nextPermasalahan,
          auditLog: appendAudit(
            prev.auditLog,
            'Tindak Lanjut',
            `Memperbarui status ${target.kodeLaporan} menjadi ${updates.status}${updates.terverifikasi ? ' (Terverifikasi)' : ''}`,
            currentRole
          ),
        };
      });
      setLastUpdated(nowTimeStr());
      pushToast(
        'Status tindak lanjut diperbarui',
        'Perubahan langsung tercatat di riwayat & peta permasalahan.'
      );
    },
    [currentRole, pushToast]
  );

  // CRUD: Pengaduan Masyarakat
  const addPengaduan = useCallback(
    (
      payload: Omit<PengaduanMasyarakat, 'id' | 'status' | 'tanggapan'>,
      actorLabel?: string
    ) => {
      setState((prev) => {
        const item: PengaduanMasyarakat = {
          ...payload,
          id: `adu-${Date.now()}`,
          status: 'Diterima',
          tanggapan: '',
        };
        return {
          ...prev,
          pengaduan: [item, ...prev.pengaduan],
          auditLog: appendAudit(
            prev.auditLog,
            'Pengaduan',
            `Menerima pengaduan/aspirasi dari ${payload.namaPelapor} melalui ${payload.kanal}`,
            currentRole,
            actorLabel
          ),
        };
      });
      setLastUpdated(nowTimeStr());
      pushToast(
        'Pengaduan masyarakat dicatat',
        'Masuk ke daftar Pencatatan Pengaduan Masyarakat & siap ditindaklanjuti.'
      );
    },
    [currentRole, pushToast]
  );

  const updatePengaduan = useCallback(
    (id: string, status: PengaduanMasyarakat['status'], tanggapan: string) => {
      setState((prev) => ({
        ...prev,
        pengaduan: prev.pengaduan.map((a) =>
          a.id === id ? { ...a, status, tanggapan } : a
        ),
        auditLog: appendAudit(
          prev.auditLog,
          'Pengaduan',
          `Menanggapi pengaduan (${status})`,
          currentRole
        ),
      }));
      setLastUpdated(nowTimeStr());
      pushToast('Tanggapan pengaduan disimpan');
    },
    [currentRole, pushToast]
  );

  // CRUD: Survei Kepuasan
  const addSurvei = useCallback(
    (payload: Omit<SurveiKepuasan, 'id'>) => {
      setState((prev) => {
        const item: SurveiKepuasan = {
          ...payload,
          id: `srv-${Date.now()}`,
        };
        const nextSurvei = [item, ...prev.survei];
        const avgSkor =
          nextSurvei.reduce((acc, s) => acc + s.skor, 0) / Math.max(1, nextSurvei.length);
        const nextTren = prev.trenMingguan.map((pt) =>
          pt.tanggal === TODAY_ISO ? { ...pt, ikmSkor: Number(avgSkor.toFixed(2)) } : pt
        );
        return {
          ...prev,
          survei: nextSurvei,
          trenMingguan: nextTren,
          auditLog: appendAudit(
            prev.auditLog,
            'Survei Kepuasan',
            `Menambahkan hasil survei kepuasan (Skor ${payload.skor}/5)`,
            currentRole
          ),
        };
      });
      setLastUpdated(nowTimeStr());
      pushToast('Survei kepuasan tersimpan', 'Indeks kepuasan masyarakat diperbarui.');
    },
    [currentRole, pushToast]
  );

  // CRUD: Instansi
  const addInstansi = useCallback(
    (payload: Omit<InstansiItem, 'id'>) => {
      setState((prev) => ({
        ...prev,
        instansi: [...prev.instansi, { ...payload, id: `inst-${Date.now()}` }],
        auditLog: appendAudit(
          prev.auditLog,
          'Data Instansi',
          `Menambahkan instansi baru: ${payload.nama}`,
          currentRole
        ),
      }));
      setLastUpdated(nowTimeStr());
      pushToast('Instansi baru ditambahkan');
    },
    [currentRole, pushToast]
  );

  const toggleInstansiAktif = useCallback(
    (id: string) => {
      setState((prev) => {
        const target = prev.instansi.find((i) => i.id === id);
        return {
          ...prev,
          instansi: prev.instansi.map((i) =>
            i.id === id ? { ...i, aktif: !i.aktif } : i
          ),
          auditLog: appendAudit(
            prev.auditLog,
            'Data Instansi',
            `Mengubah status operasional ${target?.singkatan || ''}`,
            currentRole
          ),
        };
      });
      setLastUpdated(nowTimeStr());
    },
    [currentRole]
  );

  const resetToDemoData = useCallback(() => {
    const fresh: MppStorageState = {
      instansi: INITIAL_INSTANSI,
      pelayanan: INITIAL_PELAYANAN,
      permasalahan: INITIAL_PERMASALAHAN,
      pengaduan: INITIAL_PENGADUAN,
      survei: INITIAL_SURVEI,
      trenMingguan: INITIAL_TREN_MINGGUAN,
      auditLog: INITIAL_AUDIT_LOG,
      accountOverrides: {},
    };
    setState(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setLastUpdated(nowTimeStr());
    pushToast('Data dikembalikan ke set awal MPP Kendal', undefined, 'info');
  }, [pushToast]);

  return {
    ...state,
    authUser,
    loginUser,
    logoutUser,
    updateAccountEmail,
    resetPasswordViaEmail,
    changeOwnPassword,
    currentRole,
    realtimeEnabled,
    setRealtimeEnabled,
    lastUpdated,
    toasts,
    pushToast,
    dismissToast,
    addOrUpdatePelayanan,
    addPermasalahan,
    updatePermasalahanStatus,
    addPengaduan,
    updatePengaduan,
    addSurvei,
    addInstansi,
    toggleInstansiAktif,
    resetToDemoData,
  };
}
