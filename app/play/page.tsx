"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useAudioAnalyser } from "@/hooks/useAudioAnalyser";
import {
  applyCurve,
  getDifficulty,
  getLevelForScale,
  getReadableColor,
  type Difficulty,
} from "@/lib/difficulties";
import { loadDifficulty, saveRun } from "@/lib/storage";
import { BRAND } from "@/lib/brand";
import { sfxCaptureEnd, sfxCountBeep, sfxGo, sfxTap } from "@/lib/sfx";
import { GameMeter } from "@/components/GameMeter";
import { SegmentedBar } from "@/components/SegmentedBar";
import { NoraverLogo } from "@/components/NoraverLogo";
import { ThroatMark } from "@/components/ThroatMark";
import { BlurIn } from "@/components/TextFx";
import { DifficultyIcon, PulseIcon, ShieldIcon } from "@/components/icons";

const COUNTS = ["3", "2", "1", "¡GRITA!"];
const STEP_MS = 850;
const CAPTURE_MS = 5000;
const NOISE_CAP = 40; // tope del suelo de ruido para no impedir el scoring
/** Red de seguridad: si nadie toca el claim, avanza solo (kiosk sin atascos). */
const CLAIM_SAFETY_MS = 75_000;

type Phase = "loading" | "calibrating" | "countdown" | "capture" | "claim";

/** Temporizador de captura como barra segmentada (instrumento). */
function CaptureTimer() {
  const [progress, setProgress] = useState(1);
  useEffect(() => {
    const startAt = performance.now();
    const id = setInterval(() => {
      const t = Math.min(1, (performance.now() - startAt) / CAPTURE_MS);
      setProgress(1 - t);
      if (t >= 1) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-x-6 top-6 z-30">
      <SegmentedBar
        progress={progress}
        segments={32}
        color="var(--color-accent)"
        heightClass="h-1.5"
      />
    </div>
  );
}

export default function PlayPage() {
  const router = useRouter();
  const { status, analyser, error, start, stop } = useMicrophone();
  const isActive = status === "active";
  const { db, reset } = useAudioAnalyser(analyser, isActive);

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [countIndex, setCountIndex] = useState(0);

  const noiseFloorRef = useRef(0);
  const peakRef = useRef(0);
  const dipsRef = useRef(0);
  const belowSinceRef = useRef<number | null>(null);
  const dipCountedRef = useRef(false);

  // Volumen real → efectivo (resta ruido ambiente) → escala de dificultad.
  const curveScaled = (raw: number): number => {
    if (!difficulty) return 0;
    const nf = noiseFloorRef.current;
    const eff = nf >= 100 ? 0 : Math.max(0, ((raw - nf) / (100 - nf)) * 100);
    return applyCurve(difficulty.id, eff);
  };

  // Carga la dificultad y arranca el micrófono.
  useEffect(() => {
    const id = loadDifficulty();
    if (!id) {
      router.replace("/difficulty");
      return;
    }
    setDifficulty(getDifficulty(id));
    void start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando el micrófono está listo, empieza la calibración.
  useEffect(() => {
    if (status === "active" && phase === "loading") setPhase("calibrating");
  }, [status, phase]);

  // Calibración: mide el ruido ambiente (máximo, con tope).
  useEffect(() => {
    if (phase !== "calibrating") return;
    noiseFloorRef.current = Math.min(
      NOISE_CAP,
      Math.max(noiseFloorRef.current, db),
    );
  }, [db, phase]);

  // Temporizador de calibración → countdown.
  useEffect(() => {
    if (phase !== "calibrating" || !difficulty) return;
    const t = setTimeout(() => setPhase("countdown"), difficulty.calibrationMs);
    return () => clearTimeout(t);
  }, [phase, difficulty]);

  // Countdown → captura.
  useEffect(() => {
    if (phase !== "countdown") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    COUNTS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setCountIndex(i);
          if (i < COUNTS.length - 1) sfxCountBeep();
          else sfxGo();
        }, i * STEP_MS),
      );
    });
    timers.push(
      setTimeout(() => {
        reset();
        peakRef.current = 0;
        dipsRef.current = 0;
        belowSinceRef.current = null;
        dipCountedRef.current = false;
        setPhase("capture");
      }, COUNTS.length * STEP_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [phase, reset]);

  // Captura: actualiza pico y detecta caídas (penalización en difícil).
  useEffect(() => {
    if (phase !== "capture" || !difficulty) return;
    const s = curveScaled(db);
    if (s > peakRef.current) peakRef.current = s;

    if (difficulty.penalizeDips) {
      const margin = 18;
      if (s >= peakRef.current - margin) {
        belowSinceRef.current = null;
        dipCountedRef.current = false;
      } else {
        const now = performance.now();
        if (belowSinceRef.current === null) {
          belowSinceRef.current = now;
        } else if (now - belowSinceRef.current >= 100 && !dipCountedRef.current) {
          dipsRef.current += 1;
          dipCountedRef.current = true;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, phase, difficulty]);

  // Fin de captura: calcula score final, refuerza el claim y navega.
  useEffect(() => {
    if (phase !== "capture" || !difficulty) return;
    const t = setTimeout(() => {
      const rawPeak = peakRef.current;
      const penalty = difficulty.penalizeDips
        ? Math.min(dipsRef.current * 4, rawPeak * 0.5)
        : 0;
      const finalRaw = Math.max(0, rawPeak - penalty);
      const level = getLevelForScale(difficulty, finalRaw);
      const score = Math.round(finalRaw * difficulty.scoreMultiplier);
      saveRun({
        rawScore: Math.round(finalRaw),
        score,
        level: level.id,
        difficulty: difficulty.id,
      });
      stop();
      sfxCaptureEnd();
      setPhase("claim");
    }, CAPTURE_MS);
    return () => clearTimeout(t);
  }, [phase, difficulty, stop]);

  // El claim queda en pantalla hasta que alguien lo toca; el timeout es
  // solo una red de seguridad para que el tótem nunca quede atascado.
  useEffect(() => {
    if (phase !== "claim") return;
    const t = setTimeout(() => router.push("/result"), CLAIM_SAFETY_MS);
    return () => clearTimeout(t);
  }, [phase, router]);

  const goToResult = (): void => {
    sfxTap();
    router.push("/result");
  };

  if (status === "error") {
    return (
      <main className="flex h-dvh w-full flex-col items-center justify-center gap-6 px-8 text-center">
        <h1 className="font-display text-4xl text-[var(--color-accent)]">
          Sin micrófono
        </h1>
        <p className="max-w-sm text-white/60">{error}</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="cursor-pointer rounded-full border border-white/20 px-8 py-3 text-sm font-semibold uppercase tracking-widest text-white/80 transition-colors duration-200 hover:border-white/50"
        >
          Volver
        </button>
      </main>
    );
  }

  if (!difficulty) return <main className="h-dvh w-full" />;

  const scaled = curveScaled(db);
  const diffColor = getReadableColor(difficulty.color);

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      {/* Badge de dificultad (pill sobrio) */}
      <div className="absolute left-1/2 top-14 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-1.5">
        <DifficultyIcon
          difficultyId={difficulty.id}
          className="h-4 w-4"
          style={{ color: diffColor }}
        />
        <span
          className="text-xs font-semibold uppercase tracking-[0.25em]"
          style={{ color: diffColor }}
        >
          {difficulty.name}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {phase === "calibrating" || phase === "loading" ? (
          <motion.section
            key="calibrating"
            className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Pulso clinico de calibracion */}
            <div className="relative flex h-28 w-28 items-center justify-center">
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full border border-[var(--color-accent)]/40"
                animate={{ scale: [1, 1.45], opacity: [0.6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full border border-[var(--color-accent)]/40"
                animate={{ scale: [1, 1.45], opacity: [0.6, 0] }}
                transition={{
                  duration: 1.6,
                  delay: 0.8,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--color-accent)]/60 text-[var(--color-accent)]">
                <PulseIcon className="h-9 w-9" />
              </span>
            </div>

            <h2 className="font-display text-3xl text-white md:text-4xl">
              Noraver está midiendo el ambiente
            </h2>
            <p className="max-w-sm text-sm text-white/55 md:text-base">
              Mantén silencio un momento: estamos calibrando el ruido del lugar
              para una medición precisa.
            </p>
          </motion.section>
        ) : phase === "countdown" ? (
          <motion.section
            key="countdown"
            className="absolute inset-0 flex items-center justify-center"
            exit={{ opacity: 0, scale: 1.12 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={countIndex}
                className="font-display text-white mix-blend-difference"
                style={{
                  fontSize: "clamp(7rem, 26vw, 20rem)",
                  lineHeight: 1,
                }}
                initial={{ opacity: 0, scale: 1.7, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              >
                {COUNTS[countIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.section>
        ) : phase === "capture" ? (
          <motion.section
            key="capture"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <CaptureTimer />
            <GameMeter
              value={scaled}
              difficulty={difficulty}
              active
              analyser={analyser}
            />
          </motion.section>
        ) : (
          <motion.section
            key="claim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0"
          >
            <button
              type="button"
              onClick={goToResult}
              aria-label="Tocar para ver tu resultado"
              className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-9 px-10 text-center"
            >
              {/* Ilustracion de garganta del empaque */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <ThroatMark
                  strokeWidth={2.5}
                  className="h-36 text-[var(--color-highlight)] portrait:h-48"
                />
              </motion.div>

              <NoraverLogo size="lg" />

              <div className="flex max-w-3xl items-center gap-4">
                <ShieldIcon className="h-7 w-7 shrink-0 text-[var(--color-accent)]" />
                <h2 className="font-display text-left text-[clamp(2rem,6vmin,4.2rem)] text-white">
                  <BlurIn text={BRAND.claim} delay={0.3} />
                </h2>
              </div>

              {/* Indicador de continuar (pulso sobrio) */}
              <motion.span
                className="mt-4 rounded-full border border-white/20 px-7 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.45, 1, 0.45] }}
                transition={{
                  delay: 1.1,
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Toca para ver tu resultado
              </motion.span>
            </button>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
