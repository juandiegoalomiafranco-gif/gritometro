"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { NoraverLogo } from "@/components/NoraverLogo";
import { SegmentedBar } from "@/components/SegmentedBar";

interface PreloaderProps {
  /** Llamado cuando el contador llega a 100 (antes del exit). */
  onComplete: () => void;
  /** Duracion total del conteo (ms). */
  durationMs?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Preloader corporativo: contador 0 -> 100% con barra segmentada.
 * El padre lo monta dentro de <AnimatePresence/> para el exit cinematografico
 * (desplazamiento vertical). Respeta prefers-reduced-motion.
 */
export function Preloader({ onComplete, durationMs = 1700 }: PreloaderProps) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (reduce) {
      setCount(100);
      const t = setTimeout(onComplete, 150);
      return () => clearTimeout(t);
    }
    let raf = 0;
    const startAt = performance.now();
    const tick = (now: number): void => {
      const t = Math.min(1, (now - startAt) / durationMs);
      setCount(Math.round(easeOutCubic(t) * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        setTimeout(onComplete, 350);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs, onComplete, reduce]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[var(--color-bg)] px-10"
      exit={{ y: "-100%" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-10">
        <NoraverLogo size="md" withSeal />

        <div className="flex w-full items-end justify-between">
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-white/40">
            Calibrando experiencia
          </span>
          <span className="font-score text-6xl leading-none text-[var(--color-accent)]">
            {count}
            <span className="text-2xl text-white/40">%</span>
          </span>
        </div>

        <SegmentedBar
          progress={count / 100}
          segments={28}
          color="var(--color-accent)"
        />
      </div>
    </motion.div>
  );
}
