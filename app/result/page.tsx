"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDifficulty,
  getReadableColor,
  type DiffLevel,
  type Difficulty,
} from "@/lib/difficulties";
import { loadRun } from "@/lib/storage";
import { BRAND } from "@/lib/brand";
import { sfxResult, sfxTap } from "@/lib/sfx";
import { Confetti } from "@/components/Confetti";
import { NoraverLogo } from "@/components/NoraverLogo";
import { ScrambleText, WaveText } from "@/components/TextFx";
import { DifficultyIcon, LevelIcon, ShieldIcon } from "@/components/icons";

export default function ResultPage() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [level, setLevel] = useState<DiffLevel | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const run = loadRun();
    if (!run) {
      router.replace("/");
      return;
    }
    const diff = getDifficulty(run.difficulty);
    setDifficulty(diff);
    const lvl = diff.levels.find((l) => l.id === run.level) ?? diff.levels[0];
    setLevel(lvl);
    setScore(run.score);
    // Sting de revelado (fanfarria si es el nivel maximo).
    sfxResult(lvl.id === diff.levels[diff.levels.length - 1].id);
  }, [router]);

  if (!difficulty || !level) return <main className="h-dvh w-full" />;

  const topLevel = difficulty.levels[difficulty.levels.length - 1];
  const isTop = level.id === topLevel.id;
  const diffColor = getReadableColor(difficulty.color);

  return (
    <main className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden px-8 text-center">
      {/* Halo del nivel (sutil, corporativo) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 42%, ${level.color}22 0%, transparent 62%)`,
        }}
      />

      {isTop && <Confetti />}

      <div className="relative z-10 flex flex-col items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <NoraverLogo size="md" />
        </motion.div>

        {/* Badge de dificultad */}
        <motion.div
          className="mt-2 flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-1.5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
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
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/45">
            ×{difficulty.scoreMultiplier}
          </span>
        </motion.div>

        <motion.span
          className="text-[0.65rem] font-semibold uppercase tracking-[0.5em] text-white/45"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
        >
          {isTop
            ? "Nivel máximo alcanzado"
            : `Resultado · Nivel 0${level.id}`}
        </motion.span>

        {/* Icono instrumental del nivel */}
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-full border"
          style={{ borderColor: `${level.color}66`, color: level.color }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.25 }}
        >
          <LevelIcon levelId={level.id} className="h-8 w-8" />
        </motion.div>

        {/* Nombre del nivel (revelado letra por letra) */}
        <h1
          className="font-display text-[clamp(3rem,11vw,8rem)] portrait:text-[clamp(3.5rem,14vmin,11rem)]"
          style={{ color: level.color, textShadow: `0 0 40px ${level.color}55` }}
        >
          <WaveText text={level.name} delay={0.35} />
        </h1>

        <motion.div
          className="mt-2 flex items-baseline gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">
            Puntaje
          </span>
          <span className="font-score text-5xl text-white md:text-6xl portrait:text-7xl">
            <ScrambleText text={String(score)} delay={0.75} />
          </span>
        </motion.div>

        {/* Claim de marca */}
        <motion.div
          className="mt-3 flex items-center gap-2 text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.85 }}
        >
          <ShieldIcon className="h-4 w-4 text-[var(--color-highlight)]" />
          <span className="text-xs font-medium tracking-[0.14em]">
            {BRAND.claim}
          </span>
        </motion.div>

        <motion.button
          type="button"
          onClick={() => {
            sfxTap();
            router.push("/name");
          }}
          className="mt-8 cursor-pointer rounded-full bg-[var(--color-accent)] px-12 py-5 font-display text-xl tracking-[0.06em] text-[var(--color-bg)] shadow-[0_0_36px_-8px_var(--color-glow)] transition-transform duration-200 hover:scale-[1.03] active:scale-95 md:text-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          Ingresa tu nombre
        </motion.button>
      </div>
    </main>
  );
}
