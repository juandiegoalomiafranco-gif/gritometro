"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Estado del ciclo de vida del micrófono. */
export type MicStatus = "idle" | "requesting" | "active" | "error";

export interface UseMicrophoneResult {
  /** Estado actual del micrófono. */
  status: MicStatus;
  /** AnalyserNode listo para leer datos de audio, o null si no está activo. */
  analyser: AnalyserNode | null;
  /** Mensaje de error legible, o null. */
  error: string | null;
  /** Pide permiso, abre el stream y arranca el AudioContext. */
  start: () => Promise<void>;
  /** Cierra el stream y libera el AudioContext. */
  stop: () => void;
}

/**
 * Resuelve el constructor de AudioContext con fallback a webkit (Safari viejo)
 * sin recurrir a `any`.
 */
function getAudioContextCtor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as Window &
    typeof globalThis & { webkitAudioContext?: typeof AudioContext };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

function describeError(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case "NotAllowedError":
      case "SecurityError":
        return "Permiso de micrófono denegado.";
      case "NotFoundError":
      case "OverconstrainedError":
        return "No se encontró ningún micrófono.";
      case "NotReadableError":
        return "El micrófono está en uso por otra aplicación.";
      default:
        return err.message || "Error de audio desconocido.";
    }
  }
  if (err instanceof Error) return err.message;
  return "No se pudo acceder al micrófono.";
}

/**
 * Gestiona el acceso al micrófono: getUserMedia + AudioContext + AnalyserNode.
 * Garantiza la limpieza de todos los recursos al desmontar o al llamar stop().
 */
export function useMicrophone(): UseMicrophoneResult {
  const [status, setStatus] = useState<MicStatus>("idle");
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const stop = useCallback(() => {
    sourceRef.current?.disconnect();
    sourceRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    const ctx = contextRef.current;
    if (ctx && ctx.state !== "closed") {
      void ctx.close();
    }
    contextRef.current = null;

    setAnalyser(null);
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    // Evita arranques duplicados.
    if (status === "requesting" || status === "active") return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Este navegador no soporta acceso al micrófono.");
      setStatus("error");
      return;
    }

    const AudioCtor = getAudioContextCtor();
    if (!AudioCtor) {
      setError("Este navegador no soporta Web Audio API.");
      setStatus("error");
      return;
    }

    setError(null);
    setStatus("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      });
      streamRef.current = stream;

      const ctx = new AudioCtor();
      contextRef.current = ctx;
      // Algunos navegadores arrancan el contexto suspendido hasta un gesto.
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const node = ctx.createAnalyser();
      node.fftSize = 2048;
      node.smoothingTimeConstant = 0.4;
      source.connect(node);

      setAnalyser(node);
      setStatus("active");
    } catch (err) {
      setError(describeError(err));
      setStatus("error");
      stop();
    }
  }, [status, stop]);

  // Limpieza al desmontar.
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { status, analyser, error, start, stop };
}
