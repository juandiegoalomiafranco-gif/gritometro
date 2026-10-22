"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  DIFFICULTIES,
  DIFFICULTY_ORDER,
  getReadableColor,
  type Difficulty,
} from "@/lib/difficulties";
import { saveDifficulty } from "@/lib/storage";
import { sfxTap } from "@/lib/sfx";
import { SlideMask } from "@/components/TextFx";
import { Eyebrow } from "@/components/Eyebrow";
import { ArrowLeftIcon, DifficultyIcon, LaurelIcon } from "@/components/icons";

export default function DifficultyPage() {
  const router = useRouter();

  const choose = (d: Difficulty): void => {
    sfxTap();
    saveDifficulty(d.id);
    router.push("/play");
  };

  return (
    <main className="relative flex h-dvh w-full flex-col items-center justify-center gap-8 overflow-hidden px-6 py-12">
      <div className="flex flex-col items-center gap-3">
        <Eyebrow label="Nivel de exigencia" />
        <h1 className="font-display relative text-center text-[clamp(2.2rem,6vw,4.5rem)] portrait:text-[clamp(2.6rem,8vmin,6rem)]">
          <span className="text-white">
            <SlideMask text="ELIGE TU" delay={0.1} />
          </span>{" "}
          <span className="text-[var(--color-accent)]">
            <SlideMask text="DESAFÍO" delay={0.24} />
          </span>
        </h1>
      </div>

      <div className="relative grid w-full max-w-5xl flex-1 gap-4 md:grid-cols-3 portrait:max-w-3xl portrait:flex-none portrait:grid-cols-1">
        {DIFFICULTY_ORDER.map((id, i) => {
          const d = DIFFICULTIES[id];
          const isHard = id === "hard";
          const color = getReadableColor(d.color);
          return (
            <motion.button
              key={d.id}
              type="button"
              onClick={() => choose(d)}
              className="group relative flex flex-1 cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border px-6 py-9 text-center"
              style={{
                borderColor: `${color}55`,
                backgroundColor: `${color}0d`,
              }}
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.12 }}
              whileHover={{
                scale: 1.02,
                boxShadow: `0 0 36px ${color}44`,
                borderColor: color,
              }}
              whileTap={{ scale: 0.98 }}
            >
              {isHard && (
                <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/60 px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-highlight)]">
                  <LaurelIcon className="h-3 w-3" />
                  Para leyendas
                </span>
              )}

              <span
                className="flex h-14 w-14 items-center justify-center rounded-full border"
                style={{ borderColor: `${color}66`, color }}
              >
                <DifficultyIcon difficultyId={d.id} className="h-7 w-7" />
              </span>

              <span className="font-display text-3xl md:text-4xl" style={{ color }}>
                {d.name}
              </span>
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/65">
                {d.subtitle}
              </span>
              <span className="max-w-[14rem] text-sm leading-relaxed text-white/50">
                {d.description}
              </span>
              <span className="mt-1 rounded-full border border-white/12 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/70">
                Multiplicador ×{d.scoreMultiplier}
              </span>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        type="button"
        onClick={() => {
          sfxTap();
          router.push("/instructions");
        }}
        className="relative flex cursor-pointer items-center gap-2 rounded-full border border-white/15 px-7 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/60 transition-colors duration-200 hover:border-white/45 hover:text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Volver
      </motion.button>
    </main>
  );
}
