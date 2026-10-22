"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface AudioMetrics {
  /** Volumen RMS crudo en el rango 0..1. */
  rms: number;
  /** Volumen normalizado a una escala 0..100 (dB relativo). */
  db: number;
  /** Pico máximo de db registrado en la sesión (0..100). */
  peak: number;
}

const INITIAL_METRICS: AudioMetrics = { rms: 0, db: 0, peak: 0 };

/** Suelo de ruido en dBFS: por debajo se considera silencio (0 en la escala). */
const DB_FLOOR = -60;
/** Techo en dBFS: 0 dBFS = señal a tope = 100 en la escala. */
const DB_CEIL = 0;

/**
 * Convierte un valor RMS (0..1) a la escala relativa 0..100.
 * Usa dBFS = 20·log10(rms) y lo mapea linealmente entre DB_FLOOR y DB_CEIL.
 */
function rmsToScale(rms: number): number {
  if (rms <= 0) return 0;
  const dbfs = 20 * Math.log10(rms);
  const scaled = ((dbfs - DB_FLOOR) / (DB_CEIL - DB_FLOOR)) * 100;
  return Math.min(100, Math.max(0, scaled));
}

/**
 * Lee el AnalyserNode en cada frame (requestAnimationFrame, ~60fps) y calcula
 * RMS, dB relativo (0..100) y el pico máximo de la sesión.
 *
 * @param analyser AnalyserNode activo, o null si el micrófono no está listo.
 * @param active   Si false, detiene el bucle y resetea las métricas.
 */
export function useAudioAnalyser(
  analyser: AnalyserNode | null,
  active: boolean,
): AudioMetrics & { reset: () => void } {
  const [metrics, setMetrics] = useState<AudioMetrics>(INITIAL_METRICS);

  const frameRef = useRef<number>(0);
  const peakRef = useRef<number>(0);
  // Buffer reutilizable para evitar asignaciones por frame (GC = jank).
  const bufferRef = useRef<Float32Array<ArrayBuffer> | null>(null);

  const reset = useCallback(() => {
    peakRef.current = 0;
    setMetrics(INITIAL_METRICS);
  }, []);

  useEffect(() => {
    if (!analyser || !active) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      return;
    }

    const length = analyser.fftSize;
    if (!bufferRef.current || bufferRef.current.length !== length) {
      bufferRef.current = new Float32Array(length);
    }

    const tick = (): void => {
      const buffer = bufferRef.current;
      if (!buffer) return;

      analyser.getFloatTimeDomainData(buffer);

      let sumSquares = 0;
      for (let i = 0; i < buffer.length; i += 1) {
        const sample = buffer[i];
        sumSquares += sample * sample;
      }
      const rms = Math.sqrt(sumSquares / buffer.length);
      const db = rmsToScale(rms);

      if (db > peakRef.current) peakRef.current = db;

      setMetrics({ rms, db, peak: peakRef.current });

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [analyser, active]);

  return { ...metrics, reset };
}
