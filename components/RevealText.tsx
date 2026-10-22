"use client";

import { motion, useReducedMotion } from "motion/react";

interface RevealTextProps {
  text: string;
  className?: string;
  /** Retardo inicial (s) antes del primer caracter. */
  delay?: number;
  /** Stagger (s) entre caracteres. */
  stagger?: number;
}

/**
 * Revelado letra por letra de acabado editorial:
 * opacity 0.001 -> 1, translateY 25px, spring(bounce 0.2, 0.4s), stagger
 * por caracter. Respeta prefers-reduced-motion (texto plano).
 */
export function RevealText({
  text,
  className = "",
  delay = 0,
  stagger = 0.028,
}: RevealTextProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`inline-block ${className}`} aria-label={text} role="text">
      {Array.from(text).map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          aria-hidden
          className="inline-block will-change-transform"
          initial={{ opacity: 0.001, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            bounce: 0.2,
            duration: 0.4,
            delay: delay + i * stagger,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
