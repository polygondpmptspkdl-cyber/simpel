import { AlertTriangle, Clock, Repeat, ShieldCheck } from 'lucide-react';
import { KATALOG_PERMASALAHAN, SLA_RULES } from '../data/initialData';
import { InstansiItem, PermasalahanHarian, ProblemCategory } from '../types/mpp';
import { PriorityLabel, StatusLabel } from './StatusLabel';

interface PetaPermasalahanViewProps {
  instansi: InstansiItem[];
  permasalahan: PermasalahanHarian[];
}

const ALL_CATEGORIES: ProblemCategory[] = [
  'Sistem & Jaringan',
  'Antrean & Waktu Tunggu',
  'Persyaratan & Dokumen',
  'SDM & Petugas',
  'Sarana & Prasarana',
  'Koordinasi & Informasi',
];

export function PetaPermasalahanView({
  instansi,
  permasalahan,
}: PetaPermasalahanViewProps) {
  // Hitung metrik per instansi
  const agencyMetrics = instansi
    .map((inst) => {
      const list = permasalahan.filter((m) => m.instansiId === inst.id);
      const selesai = list.filter((m) => m.status === 'Selesai' || m.status === 'Ditutup');
      const berulangCount = list.filter((m) => m.berulang).length;
      const kritisTinggi = list.filter(
        (m) => m.tingkatPrioritas === 'Kritis' || m.tingkatPrioritas === 'Tinggi'
      ).length;
      const durations = selesai
        .map((s) => s.durasiMenit)
        .filter((d): d is number => typeof d === 'number');
      const avgDurasi =
        durations.length > 0
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
          : null;

      // Kategori terbanyak
      const catCounts = ALL_CATEGORIES.map((c) => ({
        cat: c,
        count: list.filter((m) => m.kategoriMasalah === c).length,
      })).sort((a, b) => b.count - a.count);

      return {
        inst,
        total: list.length,
        belumSelesai: list.length - selesai.length,
        selesaiCount: selesai.length,
        berulangCount,
        kritisTinggi,
        avgDurasi,
        topCategory: catCounts[0]?.count > 0 ? catCounts[0].cat : '-',
        byCategory: catCounts,
      };
    })
    .sort((a, b) => b.total - a.total);

  const maxTotal = Math.max(1, ...agencyMetrics.map((m) => m.total));

  // Hitung kategori terbanyak global
  const globalCategories = ALL_CATEGORIES.map((cat) => {
    const items = permasalahan.filter((m) => m.kategoriMasalah === cat);
    const berulang = items.filter((m) => m.berulang).length;
    const durations = items
      .map((i) => i.durasiMenit)
      .filter((d): d is number => typeof d === 'number');
    const avgMin =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;
    return { cat, total: items.length, berulang, avgMin };
  }).sort((a, b) => b.total - a.total);

  const recurringProblems = permasalahan.filter((m) => m.berulang);

  return (
    <div className="space-y-6">
      {/* Header Explanation */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Peta Permasalahan & Analisis Masalah Berulang MPP Kendal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pemetaan instansi dengan kendala terbanyak, jenis masalah dominan, kecepatan penyelesaian dibanding SLA, dan identifikasi kendala berulang.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums text-slate-600 shrink-0">
          <span>
            Total Kasus: <strong className="text-slate-900">{permasalahan.length}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Masalah Berulang:{' '}
            <strong className="text-rose-700">{recurringProblems.length}</strong>
          </span>
        </div>
      </div>

      {/* Top Insight Cards (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Instansi Kendala Terbanyak</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900">
            {agencyMetrics[0]?.total > 0 ? agencyMetrics[0].inst.singkatan : '-'}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
            {agencyMetrics[0]?.total || 0} kasus · {agencyMetrics[0]?.belumSelesai || 0} belum selesai
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Jenis Masalah Paling Sering</span>
            <Repeat className="w-4 h-4 text-blue-700" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900 truncate">
            {globalCategories[0]?.total > 0 ? globalCategories[0].cat : '-'}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
            {globalCategories[0]?.total || 0} kejadian · {globalCategories[0]?.berulang || 0} berulang
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Rata-Rata Waktu Penyelesaian</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-lg font-bold font-mono tabular-nums text-slate-900">
            {(() => {
              const allDur = permasalahan
                .map((p) => p.durasiMenit)
                .filter((d): d is number => typeof d === 'number');
              if (allDur.length === 0) return '-';
              return `${Math.round(allDur.reduce((a, b) => a + b, 0) / allDur.length)} menit`;
            })()}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dari laporan masuk hingga verifikasi selesai
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Tingkat Ketuntasan</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-lg font-bold font-mono tabular-nums text-slate-900">
            {permasalahan.length > 0
              ? `${Math.round(
                  (permasalahan.filter(
                    (m) => m.status === 'Selesai' || m.status === 'Ditutup'
                  ).length /
                    permasalahan.length) *
                    100
                )}%`
              : '100%'}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Target produk: 100% kasus tertangani & memiliki PIC
          </p>
        </div>
      </div>

      {/* Heatmap Matrix: Instansi x Kategori Permasalahan */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">
            Matriks Peta Permasalahan per Instansi & Kategori
          </h3>
          <p className="text-xs text-slate-500">
            Menampilkan konsentrasi kendala di setiap instansi serta rata-rata durasi penanganannya
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4">Instansi</th>
                {ALL_CATEGORIES.map((cat) => (
                  <th key={cat} className="py-3 px-2.5 text-center">
                    {cat.split(' & ')[0]}
                  </th>
                ))}
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3 text-right">Berulang</th>
                <th className="py-3 px-4 text-right">Rata-rata Selesai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {agencyMetrics.map((row) => {
                const intensity = row.total / maxTotal;
                return (
                  <tr key={row.inst.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{row.inst.singkatan}</div>
                      <div className="text-[11px] text-slate-500">{row.inst.kelompokLayanan}</div>
                    </td>
                    {ALL_CATEGORIES.map((cat) => {
                      const count =
                        row.byCategory.find((c) => c.cat === cat)?.count || 0;
                      const cellStyle =
                        count === 0
                          ? 'text-slate-300 bg-transparent'
                          : count >= 2
                          ? 'bg-rose-100 text-rose-800 font-semibold'
                          : 'bg-amber-50 text-amber-800 font-medium';
                      return (
                        <td key={cat} className="py-3 px-2.5 text-center font-mono tabular-nums">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-md ${cellStyle}`}
                          >
                            {count}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      <span
                        className={`font-semibold ${
                          intensity >= 0.7 ? 'text-rose-700' : 'text-slate-900'
                        }`}
                      >
                        {row.total}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      <span
                        className={
                          row.berulangCount > 0
                            ? 'font-semibold text-amber-700'
                            : 'text-slate-400'
                        }
                      >
                        {row.berulangCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {row.avgDurasi !== null ? `${row.avgDurasi} mnt` : 'Proses'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analisis Masalah Berulang & Acuan SLA */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">
              Daftar Permasalahan Berulang & Rekomendasi Pencegahan
            </h3>
            <p className="text-xs text-slate-500">
              Kendala yang teridentifikasi terjadi lebih dari satu kali untuk ditindaklanjuti permanen
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {recurringProblems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Belum ada kendala berulang yang tercatat.
              </div>
            ) : (
              recurringProblems.map((m) => {
                const instName =
                  instansi.find((i) => i.id === m.instansiId)?.singkatan || m.instansiId;
                const matchedTpl = KATALOG_PERMASALAHAN.find(
                  (k) => k.kategori === m.kategoriMasalah
                );
                return (
                  <div key={m.id} className="p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-semibold text-slate-900">
                          {m.kodeLaporan}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-slate-800">{instName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{m.kategoriMasalah}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <PriorityLabel level={m.tingkatPrioritas} />
                        <StatusLabel status={m.status} />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-900">{m.uraianMasalah}</p>
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Rekomendasi Pencegahan:</span>{' '}
                      {m.catatanEvaluasi || matchedTpl?.penanganan}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Standar Klasifikasi & Usulan SLA Internal (Bab 3.4) */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">
              Standar Klasifikasi & Target SLA Internal
            </h3>
            <p className="text-xs text-slate-500">
              Acuan prioritas penanganan kendala harian MPP Kabupaten Kendal
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {(['Kritis', 'Tinggi', 'Sedang', 'Rendah'] as const).map((lvl) => (
              <div key={lvl} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <PriorityLabel level={lvl} />
                  <p className="text-xs text-slate-600">{SLA_RULES[lvl].kriteria}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold text-slate-900">
                    {SLA_RULES[lvl].target}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    ≤ {SLA_RULES[lvl].maxMenit} menit
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
