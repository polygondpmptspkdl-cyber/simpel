import { AccountCredentialOverride, InstansiItem, UserRole } from '../types/mpp';

export interface SystemAccount {
  id: string;
  peran: UserRole;
  username: string;
  namaLengkap: string;
  jabatan: string;
  email: string;
  instansiId?: string;
  tenanLabel?: string;
  defaultPasswordHash: string;
}

const TENANT_OFFICER_CONFIG: Record<
  string,
  { slug: string; nama: string; password: string; email: string }
> = {
  'inst-dpmptsp': {
    slug: 'dpmptsp',
    nama: 'Dewi Lestari',
    password: 'dpmptsp01',
    email: 'petugas.dpmptsp@kendalkab.go.id',
  },
  'inst-dukcapil': {
    slug: 'dukcapil',
    nama: 'Ahmad Hidayat',
    password: 'Dukcapil06',
    email: 'petugas.dukcapil@kendalkab.go.id',
  },
  'inst-pajak': {
    slug: 'perpajakan',
    nama: 'Fajar Nugraha',
    password: 'perpajakan02',
    email: 'petugas.perpajakan@kendalkab.go.id',
  },
  'inst-bpn': {
    slug: 'bpn',
    nama: 'Tri Wahyuni',
    password: 'BPN07',
    email: 'petugas.bpn@kendalkab.go.id',
  },
  'inst-kesehatan': {
    slug: 'bpjs',
    nama: 'Nadia Putri',
    password: 'bpjskes03',
    email: 'petugas.bpjs@kendalkab.go.id',
  },
  'inst-disnaker': {
    slug: 'disnaker',
    nama: 'Rizki Ramadhan',
    password: 'Disnaker08',
    email: 'petugas.disnaker@kendalkab.go.id',
  },
  'inst-sosial': {
    slug: 'dinsos',
    nama: 'Sari Melati',
    password: 'Dinsos04',
    email: 'petugas.dinsos@kendalkab.go.id',
  },
  'inst-hukum': {
    slug: 'hukum',
    nama: 'Bagus Setiawan',
    password: 'Layananhukum09',
    email: 'petugas.hukum@kendalkab.go.id',
  },
  'inst-perbankan': {
    slug: 'bankjateng',
    nama: 'Indah Permata',
    password: 'Bankjateng05',
    email: 'petugas.bankjateng@kendalkab.go.id',
  },
  'inst-mpp': {
    slug: 'mpp',
    nama: 'Rina Wulandari',
    password: 'Pengelolampp10',
    email: 'petugas.mpp@kendalkab.go.id',
  },
};

// Pure-TS synchronous SHA-256 hash so passwords are never stored in plaintext
export function hashPassword(input: string): string {
  const bytes = new TextEncoder().encode(`simpel_mpp_kendal::${input}`);
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  const rotr = (n: number, x: number) => (x >>> n) | (x << (32 - n));
  const w = new Uint32Array(64);

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
      const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  return H.map((val) => val.toString(16).padStart(8, '0')).join('');
}

export function getTenantSlug(inst: InstansiItem): string {
  const known = TENANT_OFFICER_CONFIG[inst.id];
  if (known) return known.slug;
  return (
    inst.singkatan
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 14) || 'tenan'
  );
}

export function buildSystemAccounts(
  instansiList: InstansiItem[],
  accountOverrides: Record<string, AccountCredentialOverride> = {}
): SystemAccount[] {
  const resolveEmail = (id: string, fallbackEmail: string) =>
    accountOverrides[id]?.email?.trim() || fallbackEmail;

  const adminAccount: SystemAccount = {
    id: 'acc-admin',
    peran: 'Admin MPP',
    username: 'admin',
    namaLengkap: 'Restu Setiardi, SE',
    jabatan: 'Administrator & Pengelola MPP',
    email: resolveEmail('acc-admin', 'admin.mpp@kendalkab.go.id'),
    defaultPasswordHash: hashPassword('admin123'),
  };

  const petugasAccounts: SystemAccount[] = instansiList.map((inst, index) => {
    const known = TENANT_OFFICER_CONFIG[inst.id];
    const slug = getTenantSlug(inst);
    const numSuffix = String(index + 1).padStart(2, '0');
    const id = `acc-petugas-${inst.id}`;
    const defaultPwd = known ? known.password : `${slug}${numSuffix}`;
    const defaultEmail = known ? known.email : `petugas.${slug}@kendalkab.go.id`;

    return {
      id,
      peran: 'Petugas MPP',
      username: `petugas.${slug}`,
      namaLengkap: known ? known.nama : `Petugas ${inst.singkatan}`,
      jabatan: `Petugas Tenan ${inst.singkatan}`,
      email: resolveEmail(id, defaultEmail),
      instansiId: inst.id,
      tenanLabel: `${inst.singkatan} (${inst.kelompokLayanan})`,
      defaultPasswordHash: hashPassword(defaultPwd),
    };
  });

  const picAccount: SystemAccount = {
    id: 'acc-pic',
    peran: 'PIC Instansi',
    username: 'pic',
    namaLengkap: 'Koordinator PIC Instansi',
    jabatan: 'PIC Gerai Instansi',
    email: resolveEmail('acc-pic', 'pic.instansi@kendalkab.go.id'),
    defaultPasswordHash: hashPassword('pic123'),
  };

  const pimpinanAccount: SystemAccount = {
    id: 'acc-pimpinan',
    peran: 'Pimpinan',
    username: 'pimpinan',
    namaLengkap: 'Kepala DPMPTSP Kendal',
    jabatan: 'Pimpinan & Pengawas Eksekutif',
    email: resolveEmail('acc-pimpinan', 'pimpinan.dpmptsp@kendalkab.go.id'),
    defaultPasswordHash: hashPassword('pimpinan123'),
  };

  return [adminAccount, ...petugasAccounts, picAccount, pimpinanAccount];
}

export function verifyAccountPassword(
  account: SystemAccount,
  rawPassword: string,
  accountOverrides: Record<string, AccountCredentialOverride> = {}
): boolean {
  const expectedHash =
    accountOverrides[account.id]?.passwordHash || account.defaultPasswordHash;
  return hashPassword(rawPassword) === expectedHash;
}
