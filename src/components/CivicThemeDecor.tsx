import { Headphones } from 'lucide-react';

export function SidebarCallCenterAndMotto() {
  return (
    <div className="px-3 pb-3 pt-1 space-y-3 shrink-0">
      <div className="bg-white/90 border border-blue-100 rounded-xl p-3 shadow-xs">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-slate-500">Call Center MPP</div>
            <div className="text-xs font-bold font-mono tabular-nums text-slate-900">
              0294-382309 / 384022
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Senin – Jumat · 08.00 – 15.00 WIB
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Kendal Civic Line Silhouette + Motto */}
      <div className="relative rounded-xl overflow-hidden pt-4 pb-2 px-2 text-center">
        <svg
          viewBox="0 0 240 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12 mx-auto opacity-35"
          aria-hidden="true"
        >
          <path
            d="M10 56 L10 34 L48 22 L86 34 L86 56 M24 56 L24 38 M38 56 L38 38 M58 56 L58 38 M72 56 L72 38"
            stroke="#2563eb"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M112 56 L112 24 L118 10 L124 24 L124 56 M104 56 L132 56"
            stroke="#1d4ed8"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M150 56 L150 32 L182 32 L182 56 M182 56 L182 38 L226 38 L226 56"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 56 Q120 50 236 56"
            stroke="#60a5fa"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-[11px] font-semibold italic text-blue-700 leading-snug mt-1">
          Melayani dengan Hati
          <br />
          untuk Kendal Lebih Baik
        </p>
      </div>
    </div>
  );
}

export function KendalBannerArtwork() {
  return (
    <svg
      viewBox="0 0 560 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMaxYMid slice"
      className="w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="kendalSkyOverlay" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0d53c7" stopOpacity="1" />
          <stop offset="32%" stopColor="#0d53c7" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#1e88e5" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="kendalHill1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e40af" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Distant mountain ridge */}
      <path
        d="M80 155 Q170 110 250 135 Q335 95 430 130 Q500 105 560 125 L560 220 L80 220 Z"
        fill="url(#kendalHill1)"
      />

      {/* Translucent geometric blue sweeps */}
      <path d="M360 0 L560 0 L560 220 L250 220 Z" fill="#38bdf8" fillOpacity="0.14" />
      <path d="M440 0 L560 0 L560 220 L345 220 Z" fill="#ffffff" fillOpacity="0.08" />

      {/* City buildings & MPP facade silhouettes */}
      <g fill="#e0f2fe" fillOpacity="0.22">
        <rect x="200" y="138" width="44" height="58" rx="3" />
        <rect x="252" y="128" width="38" height="68" rx="3" />
        <rect x="405" y="135" width="52" height="61" rx="3" />
        <rect x="464" y="124" width="42" height="72" rx="3" />
      </g>

      {/* Tugu Kendal Monument (Central Focal Landmark) */}
      <g transform="translate(310, 32)">
        <rect x="18" y="128" width="48" height="32" rx="3" fill="#e0f2fe" fillOpacity="0.32" />
        <rect x="26" y="34" width="10" height="96" rx="2" fill="#f8fafc" fillOpacity="0.48" />
        <rect x="38" y="20" width="8" height="110" rx="2" fill="#ffffff" fillOpacity="0.58" />
        <rect x="48" y="34" width="10" height="96" rx="2" fill="#f8fafc" fillOpacity="0.48" />
        <polygon points="42,4 37,20 47,20" fill="#fde047" fillOpacity="0.85" />
      </g>

      {/* Green park trees & plaza */}
      <g fill="#34d399" fillOpacity="0.34">
        <circle cx="192" cy="186" r="18" />
        <circle cx="222" cy="182" r="22" />
        <circle cx="272" cy="188" r="17" />
        <circle cx="400" cy="186" r="20" />
        <circle cx="432" cy="182" r="24" />
        <circle cx="512" cy="184" r="20" />
      </g>

      {/* Plaza lawn curve */}
      <path
        d="M140 202 Q340 176 560 198 L560 220 L140 220 Z"
        fill="#10b981"
        fillOpacity="0.28"
      />

      {/* Crisp white landmark lettering */}
      <text
        x="432"
        y="194"
        fill="#ffffff"
        fillOpacity="0.92"
        fontSize="24"
        fontWeight="800"
        letterSpacing="2"
        fontFamily="Plus Jakarta Sans, sans-serif"
      >
        KENDAL
      </text>

      {/* Smooth left blend scrim so hero text on left always has >7:1 contrast */}
      <rect x="0" y="0" width="560" height="220" fill="url(#kendalSkyOverlay)" />
    </svg>
  );
}
