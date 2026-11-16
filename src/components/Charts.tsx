import { useState } from 'react';
import { InstansiItem, PelayananHarian, PermasalahanHarian, TrenHarianPoint } from '../types/mpp';

interface AgencyBarChartProps {
  instansi: InstansiItem[];
  pelayanan: PelayananHarian[];
}

export function AgencyServiceBarChart({ instansi, pelayanan }: AgencyBarChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const rows = instansi
    .map((inst) => {
      const items = pelayanan.filter((p) => p.instansiId === inst.id);
      const pemohon = items.reduce((a, b) => a + b.jumlahPemohon, 0);
      const selesai = items.reduce((a, b) => a + b.pelayananSelesai, 0);
      const belum = items.reduce((a, b) => a + b.pelayananProses + b.pelayananTertunda, 0);
      return {
        id: inst.id,
        label: inst.singkatan,
        pemohon,
        selesai,
        belum,
      };
    })
    .sort((a, b) => b.pemohon - a.pemohon);

  const maxPemohon = Math.max(10, ...rows.map((r) => r.pemohon));

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const selesaiPct = (row.selesai / maxPemohon) * 100;
        const belumPct = (row.belum / maxPemohon) * 100;
        const isHovered = hoveredId === row.id;

        return (
          <div
            key={row.id}
            onMouseEnter={() => setHoveredId(row.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`rounded-lg px-2 py-1.5 transition-colors ${
              isHovered ? 'bg-slate-50' : ''
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-800 truncate pr-3">{row.label}</span>
              <span className="font-mono tabular-nums text-slate-600 shrink-0">
                <strong className="text-slate-900">{row.selesai}</strong> selesai / {row.pemohon} pemohon
                {row.belum > 0 ? ` (${row.belum} antre)` : ''}
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-blue-700 transition-all duration-300"
                style={{ width: `${selesaiPct}%` }}
                title={`Selesai: ${row.selesai}`}
              />
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${belumPct}%` }}
                title={`Proses / Tertunda: ${row.belum}`}
              />
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-5 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-700 inline-block" />
          <span>Pelayanan Selesai</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
          <span>Proses / Tertunda</span>
        </div>
      </div>
    </div>
  );
}

interface CategoryBreakdownProps {
  permasalahan: PermasalahanHarian[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Sistem & Jaringan': '#DC2626',
  'Antrean & Waktu Tunggu': '#D97706',
  'Persyaratan & Dokumen': '#2563EB',
  'SDM & Petugas': '#0D9488',
  'Sarana & Prasarana': '#7C3AED',
  'Koordinasi & Informasi': '#475569',
};

export function ProblemCategoryChart({ permasalahan }: CategoryBreakdownProps) {
  const counts = Object.keys(CATEGORY_COLORS).map((cat) => {
    const total = permasalahan.filter((m) => m.kategoriMasalah === cat).length;
    const belum = permasalahan.filter(
      (m) => m.kategoriMasalah === cat && m.status !== 'Selesai' && m.status !== 'Ditutup'
    ).length;
    return {
      kategori: cat,
      total,
      belum,
      color: CATEGORY_COLORS[cat],
    };
  });

  const grandTotal = Math.max(1, permasalahan.length);

  // Donut arc calculation
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="16"
          />
          {counts.map((item) => {
            if (item.total === 0) return null;
            const dashLength = (item.total / grandTotal) * circumference;
            const dashOffset = -cumulativeOffset;
            cumulativeOffset += dashLength;
            return (
              <circle
                key={item.kategori}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="16"
                strokeDasharray={`${dashLength} ${circumference}`}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {permasalahan.length}
          </span>
          <span className="text-[11px] text-slate-500">Total Kasus</span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-2">
        {counts.map((item) => {
          const pct = Math.round((item.total / grandTotal) * 100);
          return (
            <div key={item.kategori} className="flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-700 truncate">{item.kategori}</span>
              </div>
              <div className="font-mono tabular-nums text-slate-600 shrink-0">
                <strong className="text-slate-900">{item.total}</strong> kasus · {pct}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TrendChartProps {
  data: TrenHarianPoint[];
}

export function ServiceAndSatisfactionTrendChart({ data }: TrendChartProps) {
  const [activeIndex, setActiveIndex] = useState<number>(data.length - 1);

  const width = 560;
  const height = 190;
  const padX = 36;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const maxPemohon = Math.max(100, ...data.map((d) => d.totalPemohon));
  const minPemohon = Math.max(0, Math.min(...data.map((d) => d.totalPemohon)) - 60);
  const range = Math.max(50, maxPemohon - minPemohon);

  const points = data.map((d, i) => {
    const x = padX + (i / Math.max(1, data.length - 1)) * innerW;
    const y = padY + innerH - ((d.totalPemohon - minPemohon) / range) * innerH;
    const ySelesai = padY + innerH - ((d.pelayananSelesai - minPemohon) / range) * innerH;
    return { ...d, x, y, ySelesai };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const selesaiPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.ySelesai}`)
    .join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? padX} ${
    padY + innerH
  } L ${points[0]?.x ?? padX} ${padY + innerH} Z`;

  const selected = points[activeIndex] || points[points.length - 1];

  return (
    <div>
      {selected && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-slate-600">
          <div className="font-medium text-slate-800">
            Sorotan: <span className="font-semibold text-blue-700">{selected.label}</span> ({selected.tanggal})
          </div>
          <div className="flex items-center gap-4 font-mono tabular-nums">
            <span>Pemohon: <strong className="text-slate-900">{selected.totalPemohon}</strong></span>
            <span>Selesai: <strong className="text-emerald-700">{selected.pelayananSelesai}</strong></span>
            <span>IKM: <strong className="text-blue-700">{selected.ikmSkor.toFixed(2)}/5</strong></span>
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
        <defs>
          <linearGradient id="mppAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((t) => {
          const yLine = padY + innerH * t;
          const val = Math.round(maxPemohon - range * t);
          return (
            <g key={t}>
              <line
                x1={padX}
                y1={yLine}
                x2={width - padX}
                y2={yLine}
                stroke="#E2E8F0"
                strokeDasharray="3 3"
              />
              <text
                x={padX - 6}
                y={yLine + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px] font-mono"
              >
                {val}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#mppAreaGrad)" />
        <path d={linePath} fill="none" stroke="#1D4ED8" strokeWidth="2.5" strokeLinejoin="round" />
        <path
          d={selesaiPath}
          fill="none"
          stroke="#16A34A"
          strokeWidth="2"
          strokeDasharray="4 3"
          strokeLinejoin="round"
        />

        {points.map((p, idx) => {
          const isSel = idx === activeIndex;
          return (
            <g
              key={p.tanggal}
              className="cursor-pointer"
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => setActiveIndex(idx)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isSel ? 5 : 3.5}
                fill={isSel ? '#1D4ED8' : '#FFFFFF'}
                stroke="#1D4ED8"
                strokeWidth="2"
              />
              <circle cx={p.x} cy={p.ySelesai} r={3} fill="#16A34A" />
              <text
                x={p.x}
                y={height - 4}
                textAnchor="middle"
                className={`text-[10px] ${
                  isSel ? 'fill-slate-900 font-semibold' : 'fill-slate-500'
                }`}
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center gap-5 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-blue-700 inline-block" />
          <span>Total Pemohon Harian</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-emerald-600 inline-block border-b border-dashed border-emerald-600" />
          <span>Pelayanan Selesai</span>
        </div>
      </div>
    </div>
  );
}
