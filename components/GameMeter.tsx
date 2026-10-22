"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { getLevelForScale, type Difficulty } from "@/lib/difficulties";
import { useSustainedLevel } from "@/hooks/useSustainedLevel";
import { sfxLevelUp } from "@/lib/sfx";
import { Speedometer } from "@/components/Speedometer";
import { SegmentedBar } from "@/components/SegmentedBar";
import { Waveform } from "@/components/Waveform";
import { CheckIcon, LevelIcon } from "@/components/icons";

interface GameMeterProps {
  /** Valor en la escala de juego 0..100 (curva de dificultad ya aplicada). */
  value: number;
  difficulty: Difficulty;
  active: boolean;
  /** AnalyserNode del micrófono para el espectro visual (solo lectura). */
  analyser?: AnalyserNode | null;
}

/** Ondas concentricas que emanan del centro, moduladas por el volumen. */
function SoundWaves({ color, intense }: { color: string; intense: boolean }) {
  const rings = intense ? [0, 0.35, 0.7] : [0, 0.6];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {rings.map((delay) => (
        <motion.span
          key={delay}
          className="absolute rounded-full border"
          style={{ borderColor: `${color}66` }}
          initial={{ width: 120, height: 120, opacity: 0.55 }}
          animate={{
            width: intense ? 1300 : 900,
            height: intense ? 1300 : 900,
            opacity: 0,
          }}
          transition={{
            duration: intense ? 1.1 : 1.7,
            delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Medidor del juego como instrumento clinico/corporativo, ahora con
 * retroalimentacion expresiva del grito: espectro de voz en vivo a pantalla
 * completa, tipografia que respira con el volumen, pulso de proximidad al
 * siguiente umbral y blip sonoro al validar nivel.
 * NO altera la logica de medicion: solo el feedback audiovisual.
 */
export function GameMeter({ value, difficulty, active, analyser = null }: GameMeterProps) {
  const reduce = useReducedMotion();
  const { reachedId, validatedId, sustainProgress } = useSustainedLevel(
    value,
    active,
    difficulty,
  );

  const levels = difficulty.levels;
  const level = getLevelForScale(difficulty, value);

  const validatedLevel = levels.find((l) => l.id === validatedId) ?? null;
  const nextLevel = levels.find((l) => l.min > value) ?? null;
  const remaining = nextLevel ? Math.ceil(nextLevel.min - value) : 0;

  const tier = level.id;
  const topTier = levels[levels.length - 1].id;
  const isTop = tier >= topTier;
  const shakeAmp = reduce ? 0 : isTop ? 6 : tier >= topTier - 1 ? 3 : 0;

  // Pulso de luz + blip sonoro al subir de nivel.
  const [pulseKey, setPulseKey] = useState(0);
  const prevReached = useRef(reachedId);
  useEffect(() => {
    if (reachedId > prevReached.current) {
      sfxLevelUp(reachedId);
      if (reachedId >= 2) setPulseKey((k) => k + 1);
    }
    prevReached.current = reachedId;
  }, [reachedId]);

  const shakeAnim =
    shakeAmp > 0
      ? {
          x: [0, -shakeAmp, shakeAmp, -shakeAmp * 0.7, shakeAmp * 0.5, 0],
          y: [0, shakeAmp * 0.5, -shakeAmp * 0.6, shakeAmp * 0.4, 0, 0],
        }
      : { x: 0, y: 0 };

  const glowTopPct = validatedLevel ? validatedLevel.max : 0;
  const levelIndex = `${String(level.id).padStart(2, "0")} / ${String(topTier).padStart(2, "0")}`;

  // El nombre del nivel "respira" con el volumen (hasta +9%).
  const voiceScale = reduce ? 1 : 1 + (value / 100) * 0.09;
  // Pulso de proximidad: late mas rapido cuanto mas cerca del umbral.
  const nearGoal = nextLevel !== null && remaining > 0 && remaining <= 8;

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {/* Espectro de voz en vivo (el grito, visible) */}
      <Waveform analyser={analyser} color={level.color} intensity={value} />

      {/* Tinte vertical sutil segun nivel */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={{
          background: `linear-gradient(180deg, transparent 0%, ${level.color}14 60%, ${level.color}33 100%)`,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* Ondas reactivas (niveles altos) */}
      {!reduce && tier >= topTier - 1 && (
        <SoundWaves color={level.color} intense={isTop} />
      )}

      {/* Pulso de luz al validar nivel */}
      <AnimatePresence>
        {!reduce && pulseKey > 0 && (
          <motion.div
            key={pulseKey}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-40"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(0,229,255,0.32) 0%, transparent 70%)",
            }}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Dial de instrumento */}
      <div className="absolute left-6 top-20 z-30 portrait:left-8 portrait:top-24">
        <Speedometer value={value} color={level.color} />
      </div>

      {/* Columna graduada (derecha): en vertical aprovecha todo el alto */}
      <div className="absolute right-8 top-1/2 z-20 h-[64dvh] w-10 -translate-y-1/2 md:w-14 portrait:h-[70dvh] portrait:w-16">
        <div className="relative h-full w-full overflow-hidden rounded-lg border border-white/12 bg-white/[0.04]">
          {/* Seccion validada (permanente) */}
          <motion.div
            className="absolute inset-x-0 bottom-0"
            style={{
              backgroundColor: validatedLevel
                ? `${validatedLevel.color}55`
                : "transparent",
            }}
            animate={{
              height: `${glowTopPct}%`,
              opacity: validatedLevel ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          />
          {/* Relleno en vivo */}
          <motion.div
            className="absolute inset-x-0 bottom-0"
            style={{
              backgroundColor: level.color,
              boxShadow: `0 0 28px ${level.color}88`,
            }}
            animate={{ height: `${value}%` }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
          />
          {/* Graduacion por nivel */}
          {levels.map((lvl) =>
            lvl.min > 0 ? (
              <div
                key={lvl.id}
                aria-hidden
                className="absolute inset-x-0 h-px bg-white/30"
                style={{ bottom: `${lvl.min}%` }}
              />
            ) : null,
          )}
          {/* Umbral del siguiente nivel: late mas rapido cerca de la meta */}
          {nextLevel && (
            <motion.div
              aria-hidden
              className="absolute inset-x-0 z-10 h-0.5 bg-[var(--color-glow)]"
              style={{
                bottom: `${nextLevel.min}%`,
                boxShadow: "0 0 10px var(--color-glow)",
              }}
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{
                duration: nearGoal ? 0.4 : 1.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </div>
        <span className="mt-2 block text-center text-[0.5rem] font-semibold uppercase tracking-[0.3em] text-white/35">
          Escala
        </span>
      </div>

      {/* Contenido central */}
      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center"
        animate={shakeAnim}
        transition={
          shakeAmp > 0
            ? { duration: isTop ? 0.28 : 0.45, repeat: Infinity, ease: "linear" }
            : { duration: 0.3 }
        }
      >
        {/* Icono instrumental del nivel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={level.id}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border md:h-24 md:w-24"
            style={{ borderColor: `${level.color}66`, color: level.color }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
          >
            <LevelIcon levelId={level.id} className="h-10 w-10 md:h-12 md:w-12" />
          </motion.div>
        </AnimatePresence>

        {/* Indice del nivel */}
        <span className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.5em] text-white/40">
          Nivel {levelIndex}
        </span>

        {/* Nombre del nivel: slam editorial que respira con la voz */}
        <motion.div
          className="overflow-hidden will-change-transform"
          animate={{ scale: voiceScale }}
          transition={{ type: "spring", stiffness: 320, damping: 26, mass: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.h2
              key={level.id}
              className="font-display"
              style={{
                color: level.color,
                textShadow: `0 0 36px ${level.color}55`,
                fontSize: "clamp(3.5rem, 16vmin, 12rem)",
              }}
              initial={
                reduce
                  ? { opacity: 0 }
                  : { y: "105%", clipPath: "inset(0 0 100% 0)" }
              }
              animate={
                reduce
                  ? { opacity: 1 }
                  : { y: "0%", clipPath: "inset(0 0 0% 0)" }
              }
              exit={
                reduce
                  ? { opacity: 0 }
                  : { y: "-60%", opacity: 0, transition: { duration: 0.18 } }
              }
              transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
            >
              {level.name}
            </motion.h2>
          </AnimatePresence>
        </motion.div>

        {/* Sostenido del grito (validacion) */}
        <div className="mt-9 w-full max-w-sm">
          <div className="mb-2 flex items-center justify-between text-[0.6rem] font-semibold uppercase tracking-[0.3em]">
            <span className="text-white/50">
              {validatedId >= reachedId ? "Nivel validado" : "Sostén el grito"}
            </span>
            <span
              className="flex items-center gap-1"
              style={{ color: level.color }}
            >
              {validatedId >= reachedId ? (
                <CheckIcon className="h-3.5 w-3.5" />
              ) : (
                `${Math.round(sustainProgress * 100)}%`
              )}
            </span>
          </div>
          <SegmentedBar
            progress={validatedId >= reachedId ? 1 : sustainProgress}
            segments={22}
            color={level.color}
            heightClass="h-1.5"
          />
        </div>

        {/* Objetivo siguiente */}
        {nextLevel && (
          <motion.p
            className="mt-5 text-sm font-medium text-white/55 md:text-base"
            animate={nearGoal && !reduce ? { opacity: [1, 0.55, 1] } : { opacity: 1 }}
            transition={
              nearGoal && !reduce
                ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.2 }
            }
          >
            {nearGoal ? "¡Casi! Siguiente: " : "Siguiente: "}
            <span className="font-semibold" style={{ color: nextLevel.color }}>
              {nextLevel.name}
            </span>{" "}
            · faltan{" "}
            <span className="font-score text-white">{remaining}</span> puntos
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
