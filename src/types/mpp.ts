export type UserRole = 'Admin MPP' | 'Petugas MPP' | 'PIC Instansi' | 'Pimpinan';

export interface AuthUser {
  id: string;
  username: string;
  namaLengkap: string;
  peran: UserRole;
  jabatan: string;
  email: string;
  instansiId?: string;
}

export interface AccountCredentialOverride {
  email?: string;
  passwordHash?: string;
  updatedAt?: string;
}

export type NavTab =
  | 'dashboard'
  | 'peta-masalah'
  | 'pelayanan'
  | 'permasalahan'
  | 'tindak-lanjut'
  | 'pengaduan-survei'
  | 'laporan'
  | 'instansi-pengaturan';

export type PriorityLevel = 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';

export type ProblemStatus = 'Baru' | 'Proses' | 'Ditangani' | 'Eskalasi' | 'Selesai' | 'Ditutup';

export type ProblemCategory =
  | 'Sistem & Jaringan'
  | 'Antrean & Waktu Tunggu'
  | 'Persyaratan & Dokumen'
  | 'SDM & Petugas'
  | 'Sarana & Prasarana'
  | 'Koordinasi & Informasi';

export interface InstansiItem {
  id: string;
  nama: string;
  singkatan: string;
  kelompokLayanan: string;
  loket: string[];
  contohLayanan: string;
  picNama: string;
  picKontak: string;
  aktif: boolean;
  standarWaktuMenit: number;
}

export interface PelayananHarian {
  id: string;
  tanggal: string; // YYYY-MM-DD
  instansiId: string;
  loket: string;
  jenisLayanan: string;
  jumlahPemohon: number;
  pelayananSelesai: number;
  pelayananProses: number;
  pelayananTertunda: number;
  nomorAntreanTerakhir: string;
  rataRataWaktuTungguMenit: number;
  diperbaruiPada: string;
}

export interface PermasalahanHarian {
  id: string;
  kodeLaporan: string;
  tanggalLaporan: string; // YYYY-MM-DD
  waktuKejadian: string; // HH:mm
  instansiId: string;
  namaLoket: string;
  kategoriMasalah: ProblemCategory;
  uraianMasalah: string;
  dampak: string;
  tingkatPrioritas: PriorityLevel;
  dokumentasiNama?: string;
  dokumentasiUrl?: string;
  picPenanganan: string;
  tindakanPenanganan: string;
  status: ProblemStatus;
  waktuPenyelesaian?: string; // YYYY-MM-DD HH:mm
  durasiMenit?: number;
  catatanEvaluasi: string;
  berulang: boolean;
  terverifikasi: boolean;
}

export interface PengaduanMasyarakat {
  id: string;
  tanggal: string;
  waktu: string;
  namaPelapor: string;
  kontakPelapor: string;
  instansiId: string;
  kanal: 'Loket Pengaduan' | 'Portal Resmi' | 'WhatsApp MPP' | 'Kotak Saran';
  isiPengaduan: string;
  status: 'Diterima' | 'Ditindaklanjuti' | 'Selesai';
  tanggapan: string;
}

export interface SurveiKepuasan {
  id: string;
  tanggal: string;
  instansiId: string;
  jenisLayanan: string;
  skor: number; // 1 - 5
  aspekTerbaik: string;
  masukan: string;
}

export interface TrenHarianPoint {
  tanggal: string;
  label: string;
  totalPemohon: number;
  pelayananSelesai: number;
  masalahTercatat: number;
  ikmSkor: number; // skala 1-5
}

export interface AuditLogEntry {
  id: string;
  waktu: string;
  pengguna: string;
  peran: UserRole;
  modul: string;
  aktivitas: string;
}

export interface ProblemTemplate {
  no: number;
  permasalahan: string;
  dampak: string;
  penanganan: string;
  kategori: ProblemCategory;
  defaultPrioritas: PriorityLevel;
}

export interface ReportFilter {
  periode: 'Harian' | 'Mingguan' | 'Bulanan';
  tanggalMulai: string;
  tanggalSelesai: string;
  instansiId: string; // 'semua' atau id
  kategori: string; // 'semua' atau kategori
}
