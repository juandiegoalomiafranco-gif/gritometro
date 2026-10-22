"use client";

import { motion, useReducedMotion } from "motion/react";

interface SpeedometerProps {
  /** Valor 0..100 en la escala de juego. */
  value: number;
  color: string;
}

interface Tick {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  major: boolean;
}

/** Genera las marcas del dial (semicirculo, 0 izquierda -> 100 derecha). */
function buildTicks(): Tick[] {
  const ticks: Tick[] = [];
  for (let i = 0; i <= 20; i += 1) {
    const major = i % 5 === 0;
    const angle = Math.PI - (i / 20) * Math.PI; // 180° -> 0°
    const rOuter = 46;
    const rInner = major ? 39 : 42.5;
    ticks.push({
      x1: 50 + Math.cos(angle) * rInner,
      y1: 50 - Math.sin(angle) * rInner,
      x2: 50 + Math.cos(angle) * rOuter,
      y2: 50 - Math.sin(angle) * rOuter,
      major,
    });
  }
  return ticks;
}

const TICKS = buildTicks();
const PATH_LEN = Math.PI * 34; // arco de valor r=34

/**
 * Dial de medicion estilo instrumento clinico: marcas graduadas,
 * arco de valor y aguja con fisica de spring.
 */
export function Speedometer({ value, color }: SpeedometerProps) {
  const reduce = useReducedMotion();
  const v = Math.min(100, Math.max(0, value));
  const valueLen = (v / 100) * PATH_LEN;
  const needleAngle = v * 1.8; // 0 -> izquierda, 100 -> derecha

  return (
    <div className="relative flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 pb-3 pt-4 backdrop-blur-sm">
      <svg viewBox="0 0 100 60" className="w-32 md:w-40">
        {/* Marcas graduadas */}
        {TICKS.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.major ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.18)"}
            strokeWidth={t.major ? 1.4 : 0.8}
            strokeLinecap="round"
          />
        ))}
        {/* Track del arco de valor */}
        <path
          d="M16,50 A34,34 0 0 1 84,50"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={5}
          strokeLinecap="round"
        />
        {/* Valor */}
        <path
          d="M16,50 A34,34 0 0 1 84,50"
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${valueLen} ${PATH_LEN}`}
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        />
        {/* Aguja con fisica de spring */}
        <motion.g
          animate={{ rotate: needleAngle }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 130, damping: 13, mass: 0.6 }
          }
          style={{ transformOrigin: "50px 50px" }}
        >
          <line
            x1={50}
            y1={50}
            x2={18}
            y2={50}
            stroke="#FFFFFF"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </motion.g>
        <circle cx={50} cy={50} r={3.4} fill="none" stroke="#FFFFFF" strokeWidth={1.2} />
        <circle cx={50} cy={50} r={1.2} fill={color} />
      </svg>

      <div className="-mt-1 flex items-baseline gap-1">
        <span className="font-score text-3xl leading-none md:text-4xl" style={{ color }}>
          {Math.round(v)}
        </span>
        <span className="text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-white/40">
          /100
        </span>
      </div>
      <span className="mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.35em] text-white/35">
        Índice de grito
      </span>
    </div>
  );
}
