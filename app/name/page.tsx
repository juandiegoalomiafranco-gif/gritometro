"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDifficulty,
  getReadableColor,
  type DiffLevel,
} from "@/lib/difficulties";
import {
  addScore,
  loadRun,
  setLastId,
  type RunResult,
} from "@/lib/storage";
import { sfxSave } from "@/lib/sfx";
import { OnScreenKeyboard } from "@/components/OnScreenKeyboard";
import { SlideMask } from "@/components/TextFx";
import { DifficultyIcon } from "@/components/icons";

const MAX_LEN = 12;

export default function NamePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [run, setRun] = useState<RunResult | null>(null);

  useEffect(() => {
    const data = loadRun();
    if (!data) {
      router.replace("/");
      return;
    }
    setRun(data);
  }, [router]);

  if (!run) return <main className="h-dvh w-full" />;

  const difficulty = getDifficulty(run.difficulty);
  const level: DiffLevel =
    difficulty.levels.find((l) => l.id === run.level) ?? difficulty.levels[0];
  const canSave = name.trim().length > 0;

  const handleSave = (): void => {
    if (!canSave) return;
    sfxSave();
    const entry = addScore(name, run.score, run.level, run.difficulty);
    setLastId(entry.id);
    router.push("/leaderboard");
  };

  return (
    <main className="relative flex h-dvh w-full flex-col items-center justify-center gap-7 overflow-hidden px-6">
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/45">
          <DifficultyIcon
            difficultyId={difficulty.id}
            className="h-4 w-4"
            style={{ color: getReadableColor(difficulty.color) }}
          />
          Nivel <span style={{ color: level.color }}>{level.name}</span> ·{" "}
          <span className="font-score text-sm text-white">{run.score}</span>
        </span>
        <h1 className="font-display text-[clamp(2.2rem,5.5vw,4rem)] portrait:text-[clamp(2.6rem,7vmin,5.5rem)]">
          <SlideMask text="REGISTRA TU MARCA" delay={0.15} />
        </h1>
      </motion.div>

      {/* Display del nombre (sobrio) */}
      <div className="flex min-h-[4.2rem] w-full max-w-xl items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] px-6">
        <span className="font-display text-3xl tracking-[0.08em] text-white md:text-4xl">
          {name || <span className="normal-case text-white/25">Tu nombre</span>}
        </span>
        {name.length > 0 && (
          <motion.span
            aria-hidden
            className="ml-1.5 inline-block h-8 w-0.5 bg-[var(--color-accent)]"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
      <span className="-mt-4 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-white/35">
        {name.length}/{MAX_LEN}
      </span>

      <OnScreenKeyboard
        onKey={(c) => setName((prev) => (prev.length < MAX_LEN ? prev + c : prev))}
        onSpace={() =>
          setName((prev) =>
            prev.length < MAX_LEN && prev.length > 0 ? prev + " " : prev,
          )
        }
        onBackspace={() => setName((prev) => prev.slice(0, -1))}
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className="cursor-pointer rounded-full bg-[var(--color-accent)] px-12 py-4 font-display text-xl tracking-[0.06em] text-[var(--color-bg)] shadow-[0_0_36px_-8px_var(--color-glow)] transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none md:text-2xl"
      >
        Guardar
      </button>
    </main>
  );
}
