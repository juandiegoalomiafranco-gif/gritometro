"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/* Celebracion recolorizada a paleta Noraver (sin colores arcade). */
const COLORS = ["#00B8D9", "#00E5FF", "#7FDBFF", "#00FFB2", "#0066CC", "#FFFFFF"];

interface Piece {
  id: number;
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
  round: boolean;
}

/** Lluvia de confetti que cae una vez (celebración del nivel LEGENDARIO). */
export function Confetti({ pieces = 90 }: { pieces?: number }) {
  const reduce = useReducedMotion();
  // Generado solo en cliente tras montar para evitar mismatch de hidratación.
  const [confetti, setConfetti] = useState<Piece[]>([]);

  useEffect(() => {
    setConfetti(
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 1.2,
        duration: 2.4 + Math.random() * 2,
        drift: (Math.random() - 0.5) * 200,
        rotate: Math.random() * 720 - 360,
        round: Math.random() > 0.5,
      })),
    );
  }, [pieces]);

  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {confetti.map((c) => (
        <motion.span
          key={c.id}
          className="absolute top-0"
          style={{
            left: `${c.left}%`,
            width: c.size,
            height: c.round ? c.size : c.size * 0.4,
            backgroundColor: c.color,
            borderRadius: c.round ? "9999px" : "1px",
          }}
          initial={{ y: "-12vh", x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: "112vh", x: c.drift, opacity: [1, 1, 0.9, 0], rotate: c.rotate }}
          transition={{ duration: c.duration, delay: c.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
