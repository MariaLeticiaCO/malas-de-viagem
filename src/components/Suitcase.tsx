type Props = {
  color: string;
  name: string;
  general?: boolean;
  className?: string;
};

/** Illustrated suitcase; the owner's name sits on a luggage tag. */
export function Suitcase({ color, name, general, className }: Props) {
  const dark = `color-mix(in oklab, ${color} 72%, #1a1a2e)`;
  const light = `color-mix(in oklab, ${color} 70%, white)`;
  return (
    <div className={`relative aspect-[4/5] ${className ?? ""}`}>
      <svg viewBox="0 0 160 200" className="h-full w-full drop-shadow-[0_14px_18px_rgba(120,70,20,0.18)]" aria-hidden>
        {/* handle */}
        <rect x="56" y="10" width="48" height="34" rx="12" fill="none" stroke={dark} strokeWidth="9" />
        {/* body */}
        <rect x="14" y="36" width="132" height="142" rx="22" style={{ fill: color }} />
        <rect x="14" y="36" width="132" height="30" rx="22" style={{ fill: light }} opacity="0.55" />
        {/* ribs */}
        <rect x="42" y="36" width="10" height="142" style={{ fill: dark }} opacity="0.35" />
        <rect x="108" y="36" width="10" height="142" style={{ fill: dark }} opacity="0.35" />
        {/* corners */}
        <path d="M14 58 a22 22 0 0 1 22 -22 h6 v10 h-6 a12 12 0 0 0 -12 12 v6 h-10z" style={{ fill: dark }} />
        <path d="M146 58 a22 22 0 0 0 -22 -22 h-6 v10 h6 a12 12 0 0 1 12 12 v6 h10z" style={{ fill: dark }} />
        {/* wheels */}
        <circle cx="38" cy="186" r="10" fill="#3b3247" />
        <circle cx="122" cy="186" r="10" fill="#3b3247" />
        <circle cx="38" cy="186" r="4" fill="#d9d2e0" />
        <circle cx="122" cy="186" r="4" fill="#d9d2e0" />
        {general && (
          <g>
            {/* sun sticker */}
            <circle cx="122" cy="148" r="15" fill="#FFD23F" stroke="white" strokeWidth="3" />
            <circle cx="117" cy="146" r="1.8" fill="#7a4b00" />
            <circle cx="127" cy="146" r="1.8" fill="#7a4b00" />
            <path d="M116 152 q6 5 12 0" stroke="#7a4b00" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* palm sticker */}
            <circle cx="40" cy="150" r="14" fill="white" />
            <text x="40" y="156" fontSize="17" textAnchor="middle">🌴</text>
          </g>
        )}
      </svg>
      {/* luggage tag */}
      <div className="absolute inset-x-[16%] top-[40%] flex justify-center">
        <span className="max-w-full -rotate-3 truncate rounded-lg border-2 border-dashed border-black/10 bg-white/95 px-2.5 py-1 font-display text-[clamp(0.8rem,3.4vw,1.05rem)] font-semibold text-slate-800 shadow-sm">
          {name}
        </span>
      </div>
    </div>
  );
}
