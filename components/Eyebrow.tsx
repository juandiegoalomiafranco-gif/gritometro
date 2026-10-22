"use client";

import { motion } from "motion/react";
import { BRAND } from "@/lib/brand";

interface EyebrowProps {
  /** Etiqueta de la sección (p. ej. "Protocolo de medición"). */
  label?: string;
  className?: string;
  delay?: number;
}

/**
 * Eyebrow corporativo y mínimo: regla fina — NORAVER GARGANTA — regla fina.
 * Sustituye los índices editoriales numerados ("01 — ...") por una línea
 * de marca sobria, idéntica en todas las pantallas.
 */
export function Eyebrow({ label, className = "", delay = 0 }: EyebrowProps) {
  return (
    <motion.div
      className={`flex items-center justify-center gap-4 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay }}
    >
      <span aria-hidden className="h-px w-10 bg-white/20" />
      <span className="whitespace-nowrap text-[0.6rem] font-semibold uppercase tracking-[0.45em] text-white/45">
        Noraver{" "}
        <span style={{ color: BRAND.colors.green }}>Garganta</span>
        {label ? <span className="text-white/35"> · {label}</span> : null}
      </span>
      <span aria-hidden className="h-px w-10 bg-white/20" />
    </motion.div>
  );
}
