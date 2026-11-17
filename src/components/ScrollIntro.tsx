"use client";
import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";

const UNROLL = 0.95;
const TOTAL_MS = 2300;

/**
 * Opening animation for the Roteiro tab: a treasure-map scroll unrolls from
 * the middle, the dashed trail draws itself and the red X lands.
 * Tap anywhere to skip.
 */
export function ScrollIntro({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(onDone, reduced ? 0 : TOTAL_MS);
    return () => clearTimeout(t);
  }, [onDone, reduced]);

  if (reduced) return null;

  const ease = [0.65, 0, 0.35, 1] as const;

  return (
    <motion.div
      className="fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#2bb3c0_0%,#0f6f8a_55%,#0a4a63_100%)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      onClick={onDone}
      role="presentation"
    >
      {/* sea sparkle */}
      <div className="pointer-events-none absolute inset-0 opacity-30 [background:repeating-radial-gradient(circle_at_30%_70%,transparent_0_18px,rgba(255,255,255,0.18)_19px_20px)]" />

      <motion.div
        className="relative h-[min(74dvh,640px)] w-[min(86vw,440px)]"
        initial={{ scale: 0.85, rotate: -4 }}
        animate={{ scale: 1, rotate: -1.5 }}
        exit={{ scale: 1.15, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* paper */}
        <motion.div
          className="parchment absolute inset-x-[5%] inset-y-[11px] overflow-hidden rounded-sm"
          initial={{ clipPath: "inset(50% 0% 50% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          transition={{ duration: UNROLL, ease, delay: 0.25 }}
        >
          <MapArt />
        </motion.div>

        {/* rods travel from the centre to the edges */}
        <motion.div
          className="scroll-rod absolute inset-x-0 -mt-[11px]"
          initial={{ top: "50%" }}
          animate={{ top: "0%" }}
          transition={{ duration: UNROLL, ease, delay: 0.25 }}
        />
        <motion.div
          className="scroll-rod absolute inset-x-0 -mt-[11px]"
          initial={{ top: "50%" }}
          animate={{ top: "100%" }}
          transition={{ duration: UNROLL, ease, delay: 0.25 }}
        />
      </motion.div>

      <motion.p
        className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] font-hand text-xl text-white/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        toque para pular
      </motion.p>
    </motion.div>
  );
}

function MapArt() {
  const draw = { delay: 1.05, duration: 0.9, ease: "easeInOut" } as const;
  return (
    <svg viewBox="0 0 300 420" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <text x="150" y="58" textAnchor="middle" className="font-pirate" fontSize="34" fill="#4a2c12">
        Mapa do Tesouro
      </text>

      {/* islands */}
      <path d="M40 120 q30 -28 70 -8 q30 14 18 40 q-14 30 -56 22 q-44 -10 -32 -54z" fill="#e3c48a" stroke="#8a5a2b" strokeWidth="2" />
      <path d="M190 210 q40 -30 78 0 q22 24 -6 50 q-36 26 -70 4 q-26 -22 -2 -54z" fill="#e3c48a" stroke="#8a5a2b" strokeWidth="2" />
      <path d="M50 300 q26 -20 60 -2 q24 18 4 40 q-28 22 -58 6 q-24 -18 -6 -44z" fill="#e3c48a" stroke="#8a5a2b" strokeWidth="2" />
      <text x="72" y="146" fontSize="22">🌴</text>
      <text x="222" y="244" fontSize="22">⛰️</text>
      <text x="70" y="330" fontSize="20">🏖️</text>

      {/* waves */}
      {[[230, 110], [160, 160], [200, 330], [120, 250]].map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y} q6 -6 12 0 t12 0`} stroke="#8a5a2b" strokeWidth="1.6" fill="none" opacity="0.6" />
      ))}

      {/* compass rose */}
      <g transform="translate(250 380)" opacity="0.85">
        <circle r="22" fill="none" stroke="#8a5a2b" strokeWidth="1.5" />
        <path d="M0 -26 L5 0 L0 26 L-5 0z" fill="#8a5a2b" />
        <path d="M-26 0 L0 5 L26 0 L0 -5z" fill="#b98b55" />
        <text y="-30" textAnchor="middle" fontSize="11" fill="#4a2c12" fontWeight="700">N</text>
      </g>

      {/* trail */}
      <motion.path
        d="M78 150 C 120 200, 170 170, 205 228 S 150 300, 110 312 S 140 380, 196 372"
        fill="none"
        stroke="#7a3b10"
        strokeWidth="3.5"
        strokeDasharray="9 8"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={draw}
      />
      <motion.g
        initial={{ scale: 0, rotate: -40, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ delay: 1.85, type: "spring", stiffness: 380, damping: 12 }}
        style={{ transformOrigin: "196px 372px", transformBox: "view-box" }}
      >
        <path d="M184 360 L208 384 M208 360 L184 384" stroke="#c0392b" strokeWidth="7" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}
