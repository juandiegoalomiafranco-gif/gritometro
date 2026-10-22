"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface WaveformProps {
  /** AnalyserNode activo del micrófono (solo lectura, no altera la medición). */
  analyser: AnalyserNode | null;
  /** Color del nivel actual (hex). */
  color: string;
  /** Intensidad 0..100 ya escalada por la dificultad (modula la altura). */
  intensity: number;
}

/**
 * Espectro en vivo a pantalla completa: barras simétricas desde el eje
 * central que reaccionan al grito en tiempo real. Lee el AnalyserNode con
 * getByteFrequencyData en un canvas propio (no interfiere con el RMS de la
 * medición). 60fps: un solo canvas, buffer reutilizado, DPR limitado.
 */
export function Waveform({ analyser, color, intensity }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduce = useReducedMotion();
  const colorRef = useRef(color);
  const intensityRef = useRef(intensity);
  colorRef.current = color;
  intensityRef.current = intensity;

  useEffect(() => {
    if (reduce || !analyser) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = (): void => {
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const bins = new Uint8Array(analyser.frequencyBinCount);
    const BARS = 56;
    let raf = 0;

    const draw = (): void => {
      analyser.getByteFrequencyData(bins);
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const midY = height / 2;
      const gap = width / BARS;
      const barW = Math.max(2 * dpr, gap * 0.42);
      // Usa el tercio bajo-medio del espectro (donde vive la voz).
      const usable = Math.floor(bins.length * 0.5);
      const boost = 0.35 + (intensityRef.current / 100) * 0.85;

      ctx.fillStyle = colorRef.current;
      for (let i = 0; i < BARS; i += 1) {
        const bin = bins[Math.floor((i / BARS) * usable)];
        const v = (bin / 255) * boost;
        const h = Math.max(2 * dpr, v * height * 0.42);
        const x = i * gap + (gap - barW) / 2;
        // Atenúa hacia los bordes para una composición centrada.
        const edge = 1 - Math.abs(i / (BARS - 1) - 0.5) * 1.1;
        ctx.globalAlpha = Math.max(0.05, 0.32 * edge);
        ctx.fillRect(x, midY - h, barW, h * 2);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [analyser, reduce]);

  if (reduce) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
