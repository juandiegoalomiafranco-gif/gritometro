"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

interface FloatingParticlesProps {
  count?: number;
  color?: string;
}

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

/** Partículas que ascienden lentamente como ambiente del atractor idle. */
export function FloatingParticles({
  count = 26,
  color = "#7FDBFF",
}: FloatingParticlesProps) {
  const reduce = useReducedMotion();
  // Generadas solo en cliente tras montar para evitar mismatch de hidratación.
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 3 + Math.random() * 9,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 8,
        drift: (Math.random() - 0.5) * 60,
        opacity: 0.2 + Math.random() * 0.4,
      })),
    );
  }, [count]);

  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: color,
            boxShadow: `0 0 ${p.size * 2}px ${color}`,
          }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-10vh", x: p.drift, opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
