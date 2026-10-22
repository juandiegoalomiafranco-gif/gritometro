"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLevelForScale, type Difficulty } from "@/lib/difficulties";

export interface SustainedLevelState {
  /** Nivel alcanzado de forma instantánea (puede subir y bajar). */
  reachedId: number;
  /** Nivel más alto validado (sostenido ≥ sustainMs). Monotónico por sesión. */
  validatedId: number;
  /** Progreso 0..1 hacia validar el nivel alcanzado actualmente. */
  sustainProgress: number;
}

const INITIAL: SustainedLevelState = {
  reachedId: 1,
  validatedId: 0,
  sustainProgress: 0,
};

/**
 * Detección de "sustained scream": un nivel solo se *valida* si el usuario se
 * mantiene sobre su umbral mínimo durante al menos `difficulty.sustainMs`. Si
 * baja antes, el nivel queda desbloqueado pero no validado y el cronómetro se
 * reinicia. El nivel validado nunca retrocede dentro de una misma sesión.
 */
export function useSustainedLevel(
  scaled: number,
  active: boolean,
  difficulty: Difficulty,
): SustainedLevelState & { reset: () => void } {
  const [state, setState] = useState<SustainedLevelState>(INITIAL);

  const scaledRef = useRef(scaled);
  scaledRef.current = scaled;

  const sustainMs = difficulty.sustainMs;

  const validatedIdRef = useRef(0);
  const holdLevelIdRef = useRef(0);
  const holdStartRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  const reset = useCallback(() => {
    validatedIdRef.current = 0;
    holdLevelIdRef.current = 0;
    holdStartRef.current = null;
    setState(INITIAL);
  }, []);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      return;
    }

    validatedIdRef.current = 0;
    holdLevelIdRef.current = 0;
    holdStartRef.current = null;

    const tick = (): void => {
      const reached = getLevelForScale(difficulty, scaledRef.current);
      const now = performance.now();
      let progress = 0;

      if (reached.id > validatedIdRef.current) {
        if (holdLevelIdRef.current !== reached.id) {
          holdLevelIdRef.current = reached.id;
          holdStartRef.current = now;
        }
        const elapsed = now - (holdStartRef.current ?? now);
        progress = Math.min(1, elapsed / sustainMs);

        if (progress >= 1) {
          validatedIdRef.current = reached.id;
          holdLevelIdRef.current = 0;
          holdStartRef.current = null;
          progress = 0;
        }
      } else {
        holdLevelIdRef.current = 0;
        holdStartRef.current = null;
      }

      setState({
        reachedId: reached.id,
        validatedId: validatedIdRef.current,
        sustainProgress: progress,
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [active, difficulty, sustainMs]);

  return { ...state, reset };
}
