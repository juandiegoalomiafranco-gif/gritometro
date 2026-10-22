"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/*
 * Familia de animaciones de texto del Gritómetro.
 * Cada pantalla usa un arquetipo distinto para que la experiencia
 * no se sienta repetitiva:
 *  - RevealText (components/RevealText): letra a letra con rebote → idle.
 *  - SlideMask: palabras que emergen tras una máscara → títulos editoriales.
 *  - BlurIn: bloque que enfoca desde desenfoque → claims y frases largas.
 *  - ScrambleText: caracteres que "resuelven" (instrumento) → cifras/etiquetas.
 *  - WaveText: letras que entran en onda → nombre, ranking.
 * Todos respetan prefers-reduced-motion y animan solo transform/opacity
 * (60fps en el tótem).
 */

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface FxProps {
  text: string;
  className?: string;
  delay?: number;
}

/** Palabras que emergen desde abajo tras una máscara (acabado editorial). */
export function SlideMask({ text, className = "", delay = 0 }: FxProps) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;

  const words = text.split(" ");
  return (
    <span className={`inline-block ${className}`} aria-label={text} role="text">
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden pb-[0.08em] align-bottom"
          aria-hidden
        >
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.6, delay: delay + i * 0.09, ease: EASE_OUT }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Bloque que "enfoca" desde un desenfoque (claims, frases largas). */
export function BlurIn({ text, className = "", delay = 0 }: FxProps) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;

  return (
    <motion.span
      className={`inline-block will-change-transform ${className}`}
      initial={{ opacity: 0, filter: "blur(14px)", scale: 1.04 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      transition={{ duration: 0.9, delay, ease: EASE_OUT }}
    >
      {text}
    </motion.span>
  );
}

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Caracteres que ciclan y "resuelven" de izquierda a derecha (instrumento). */
export function ScrambleText({
  text,
  className = "",
  delay = 0,
  durationMs = 700,
}: FxProps & { durationMs?: number }) {
  const reduce = useReducedMotion();
  const [output, setOutput] = useState(reduce ? text : "");
  const rafRef = useRef(0);

  useEffect(() => {
    if (reduce) {
      setOutput(text);
      return;
    }
    let startAt = 0;
    const tick = (now: number): void => {
      if (startAt === 0) startAt = now + delay * 1000;
      const t = (now - startAt) / durationMs;
      if (t < 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const solved = Math.floor(Math.min(1, t) * text.length);
      let next = text.slice(0, solved);
      for (let i = solved; i < text.length; i += 1) {
        next +=
          text[i] === " "
            ? " "
            : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      setOutput(next);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [text, delay, durationMs, reduce]);

  return (
    <span className={className} aria-label={text} role="text">
      <span aria-hidden>{output || "\u00A0"}</span>
    </span>
  );
}

/** Letras que entran en onda (desfase sinusoidal + leve rotación). */
export function WaveText({ text, className = "", delay = 0 }: FxProps) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;

  return (
    <span className={`inline-block ${className}`} aria-label={text} role="text">
      {Array.from(text).map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          aria-hidden
          className="inline-block will-change-transform"
          initial={{ opacity: 0, y: 34, rotate: i % 2 === 0 ? -6 : 6 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{
            type: "spring",
            bounce: 0.38,
            duration: 0.6,
            delay: delay + i * 0.04 + Math.sin(i * 0.9) * 0.02,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
