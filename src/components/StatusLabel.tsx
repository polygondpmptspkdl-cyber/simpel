import {
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Info,
  Wrench,
} from 'lucide-react';
import { PriorityLevel, ProblemStatus } from '../types/mpp';

export function PriorityLabel({ level }: { level: PriorityLevel }) {
  switch (level) {
    case 'Kritis':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 whitespace-nowrap">
          <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
          <span>Kritis</span>
        </span>
      );
    case 'Tinggi':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Tinggi</span>
        </span>
      );
    case 'Sedang':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 whitespace-nowrap">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Sedang</span>
        </span>
      );
    case 'Rendah':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>Rendah</span>
        </span>
      );
  }
}

export function StatusLabel({ status }: { status: ProblemStatus }) {
  switch (status) {
    case 'Selesai':
    case 'Ditutup':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{status}</span>
        </span>
      );
    case 'Eskalasi':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 whitespace-nowrap">
          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          <span>Eskalasi</span>
        </span>
      );
    case 'Ditangani':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 whitespace-nowrap">
          <Wrench className="w-3.5 h-3.5 shrink-0" />
          <span>Ditangani</span>
        </span>
      );
    case 'Proses':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>Proses</span>
        </span>
      );
    case 'Baru':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Baru</span>
        </span>
      );
  }
}
