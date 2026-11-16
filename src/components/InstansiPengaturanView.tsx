import { Building2, Check, Mail, Pencil, Plus, RotateCcw, ShieldCheck, Users, X } from 'lucide-react';
import { useState } from 'react';
import {
  AccountCredentialOverride,
  AuditLogEntry,
  InstansiItem,
  UserRole,
} from '../types/mpp';
import { buildSystemAccounts } from '../utils/authAccounts';

interface InstansiPengaturanViewProps {
  instansi: InstansiItem[];
  accountOverrides: Record<string, AccountCredentialOverride>;
  auditLog: AuditLogEntry[];
  currentRole: UserRole;
  onAddInstansi: (payload: Omit<InstansiItem, 'id'>) => void;
  onToggleAktif: (id: string) => void;
  onUpdateAccountEmail: (accountId: string, newEmail: string) => void;
  onResetDemo: () => void;
}

export function InstansiPengaturanView({
  instansi,
  accountOverrides,
  auditLog,
  currentRole,
  onAddInstansi,
  onToggleAktif,
  onUpdateAccountEmail,
  onResetDemo,
}: InstansiPengaturanViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingEmailValue, setEditingEmailValue] = useState('');
  const [emailEditError, setEmailEditError] = useState('');

  const systemAccounts = buildSystemAccounts(instansi, accountOverrides);

  const [nama, setNama] = useState('');
  const [singkatan, setSingkatan] = useState('');
  const [kelompokLayanan, setKelompokLayanan] = useState('Perizinan');
  const [loketStr, setLoketStr] = useState('Loket 13 (Layanan Baru)');
  const [contohLayanan, setContohLayanan] = useState('');
  const [picNama, setPicNama] = useState('');
  const [picKontak, setPicKontak] = useState('');
  const [standarWaktuMenit, setStandarWaktuMenit] = useState(20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddInstansi({
      nama,
      singkatan,
      kelompokLayanan,
      loket: loketStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      contohLayanan,
      picNama,
      picKontak,
      aktif: true,
      standarWaktuMenit: Number(standarWaktuMenit),
    });
    setNama('');
    setSingkatan('');
    setContohLayanan('');
    setPicNama('');
    setPicKontak('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Data Instansi, Loket & Pengawasan Sistem
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola daftar instansi penyelenggara layanan di MPP Kendal, penanggung jawab (PIC), dan rekam jejak aktivitas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Awal</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-rose-800 font-medium">Kembalikan data awal?</span>
              <button
                type="button"
                onClick={() => {
                  onResetDemo();
                  setConfirmReset(false);
                }}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded cursor-pointer"
              >
                Ya, Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded cursor-pointer"
              >
                Batal
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Instansi</span>
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white border border-blue-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Tambah Instansi & Loket Baru
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nama Lengkap Instansi
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Kantor Imigrasi"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Singkatan
              </label>
              <input
                type="text"
                required
                value={singkatan}
                onChange={(e) => setSingkatan(e.target.value)}
                placeholder="Contoh: Imigrasi"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kelompok Pelayanan
              </label>
              <input
                type="text"
                required
                value={kelompokLayanan}
                onChange={(e) => setKelompokLayanan(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Loket (pisahkan koma jika lebih dari 1)
              </label>
              <input
                type="text"
                required
                value={loketStr}
                onChange={(e) => setLoketStr(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nama PIC Instansi
              </label>
              <input
                type="text"
                required
                value={picNama}
                onChange={(e) => setPicNama(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kontak PIC & Standar Waktu (Menit)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={picKontak}
                  onChange={(e) => setPicKontak(e.target.value)}
                  placeholder="08xx..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                />
                <input
                  type="number"
                  min={5}
                  value={standarWaktuMenit}
                  onChange={(e) => setStandarWaktuMenit(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Contoh Jenis Layanan
              </label>
              <input
                type="text"
                required
                value={contohLayanan}
                onChange={(e) => setContohLayanan(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div className="flex items-end justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 text-xs text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg cursor-pointer"
              >
                Simpan Instansi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Daftar Instansi */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-700" />
          <h3 className="text-sm font-semibold text-slate-900">
            Daftar Instansi & Loket Pelayanan ({instansi.length} Instansi)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4">Instansi</th>
                <th className="py-3 px-4">Kelompok & Layanan</th>
                <th className="py-3 px-4">Loket</th>
                <th className="py-3 px-4">PIC Penanggung Jawab</th>
                <th className="py-3 px-4 text-right">Standar Waktu</th>
                <th className="py-3 px-4 text-right">Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {instansi.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{item.singkatan}</div>
                    <div className="text-[11px] text-slate-500">{item.nama}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{item.kelompokLayanan}</div>
                    <div className="text-[11px] text-slate-500 max-w-xs truncate">
                      {item.contohLayanan}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{item.loket.join(', ')}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{item.picNama}</div>
                    <div className="text-[11px] font-mono text-slate-500">{item.picKontak}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                    {item.standarWaktuMenit} menit
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onToggleAktif(item.id)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md border cursor-pointer transition-colors ${
                        item.aktif
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {item.aktif ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daftar Akun Pengguna, Email Terhubung & Petugas Tenan MPP (tanpa kata sandi) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-700" />
            <h3 className="text-sm font-semibold text-slate-900">
              Daftar Akun Pengguna, Email Terhubung & Petugas Tenan MPP ({systemAccounts.length} Akun)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Terhubung untuk Lupa Password & Ubah Sandi · kata sandi tidak ditampilkan
          </span>
        </div>
        {emailEditError && (
          <div className="mx-5 mt-3 p-2.5 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-lg">
            {emailEditError}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Nama Petugas / Pengguna</th>
                <th className="py-3 px-4">Peran Hak Akses</th>
                <th className="py-3 px-4">Tenan / Jabatan</th>
                <th className="py-3 px-4">Email Terhubung</th>
                <th className="py-3 px-4 text-right">Pengaturan Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {systemAccounts.map((acc) => {
                const isEditing = editingAccountId === acc.id;
                return (
                  <tr key={acc.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                      {acc.username}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {acc.namaLengkap}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">{acc.peran}</td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {acc.tenanLabel || acc.jabatan}
                    </td>
                    <td className="py-2.5 px-4">
                      {isEditing ? (
                        <input
                          type="email"
                          value={editingEmailValue}
                          onChange={(e) => setEditingEmailValue(e.target.value)}
                          placeholder="nama@kendalkab.go.id"
                          className="w-full min-w-[210px] px-2.5 py-1 text-xs font-mono border border-blue-400 rounded-md focus:outline-none focus:border-blue-700"
                        />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-mono text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{acc.email}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {isEditing ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const trimmed = editingEmailValue.trim().toLowerCase();
                              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                                setEmailEditError(
                                  `Format email tidak valid untuk akun ${acc.username}.`
                                );
                                return;
                              }
                              setEmailEditError('');
                              onUpdateAccountEmail(acc.id, trimmed);
                              setEditingAccountId(null);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Simpan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAccountId(null);
                              setEmailEditError('');
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-md cursor-pointer"
                            aria-label="Batal ubah email"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAccountId(acc.id);
                            setEditingEmailValue(acc.email);
                            setEmailEditError('');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Ubah Email</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Pengawasan (FR-025) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <h3 className="text-sm font-semibold text-slate-900">
              Riwayat Aktivitas & Audit Pengawasan (FR-025)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Peran aktif: {currentRole}</span>
        </div>
        <div className="divide-y divide-slate-100">
          {auditLog.slice(0, 12).map((log) => (
            <div
              key={log.id}
              className="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs"
            >
              <div className="text-slate-800">
                <span className="font-semibold text-slate-900">{log.pengguna}</span>{' '}
                <span className="text-slate-500">({log.peran})</span> — {log.aktivitas}
              </div>
              <div className="text-[11px] font-mono text-slate-500 shrink-0">
                {log.modul} · {log.waktu} WIB
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
