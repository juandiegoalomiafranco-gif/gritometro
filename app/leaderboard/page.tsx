"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDifficulty,
  getReadableColor,
  type DifficultyId,
} from "@/lib/difficulties";
import {
  clearRun,
  getLastId,
  requestFreshIntro,
  topToday,
  type ScoreEntry,
} from "@/lib/storage";
import { sfxTap } from "@/lib/sfx";
import { SlideMask } from "@/components/TextFx";
import { Eyebrow } from "@/components/Eyebrow";
import { DifficultyIcon } from "@/components/icons";

type Tab = "all" | DifficultyId;

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "easy", label: "Fácil" },
  { id: "medium", label: "Intermedio" },
  { id: "hard", label: "Difícil" },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [lastId, setLastId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    setEntries(topToday(undefined, 200));
    setLastId(getLastId());
  }, []);

  const visible = useMemo(() => {
    const filtered =
      tab === "all" ? entries : entries.filter((e) => e.difficulty === tab);
    return [...filtered].sort((a, b) => b.score - a.score).slice(0, 10);
  }, [entries, tab]);

  const handleReplay = (): void => {
    sfxTap();
    clearRun();
    // El siguiente ciclo arranca con la intro de marca completa.
    requestFreshIntro();
    router.push("/");
  };

  return (
    <main className="relative flex h-dvh w-full flex-col items-center overflow-hidden px-6 py-14">
      <Eyebrow label="Ranking" className="mb-2" />
      <h1 className="font-display text-center text-[clamp(2.2rem,6vw,4.5rem)] portrait:text-[clamp(2.6rem,8vmin,6rem)]">
        <span className="text-white">
          <SlideMask text="TOP" delay={0.1} />
        </span>{" "}
        <span className="text-[var(--color-accent)]">
          <SlideMask text="DEL DÍA" delay={0.22} />
        </span>
      </h1>

      {/* Tabs por dificultad (pills finos) */}
      <motion.div
        className="mt-5 flex flex-wrap items-center justify-center gap-1.5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {TABS.map((t) => {
          const isActive = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                sfxTap();
                setTab(t.id);
              }}
              aria-pressed={isActive}
              className="cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors duration-200"
              style={{
                borderColor: isActive
                  ? "var(--color-accent)"
                  : "rgba(255,255,255,0.12)",
                backgroundColor: isActive
                  ? "color-mix(in srgb, var(--color-accent) 16%, transparent)"
                  : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </motion.div>

      {/* Filas editoriales */}
      <div className="mt-7 flex w-full max-w-2xl flex-1 flex-col overflow-hidden">
        {visible.length === 0 && (
          <p className="mt-16 text-center text-sm text-white/40">
            Aún no hay registros aquí. Sé la primera marca del día.
          </p>
        )}

        {visible.map((entry, i) => {
          const diff = getDifficulty(entry.difficulty);
          const level =
            diff.levels.find((l) => l.id === entry.level) ?? diff.levels[0];
          const isNew = entry.id === lastId;
          return (
            <motion.div
              key={entry.id}
              className="flex items-center gap-4 border-b px-3 py-3"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                backgroundColor: isNew ? "rgba(0,184,217,0.1)" : "transparent",
                boxShadow: isNew
                  ? "inset 2px 0 0 var(--color-accent)"
                  : "none",
              }}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
            >
              <span className="font-score w-10 shrink-0 text-2xl text-white/35">
                {String(i + 1).padStart(2, "0")}
              </span>
              <DifficultyIcon
                difficultyId={entry.difficulty}
                className="h-4 w-4 shrink-0"
                style={{ color: getReadableColor(diff.color) }}
                aria-label={diff.name}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-display text-xl text-white md:text-2xl">
                  {entry.name}
                  {isNew && (
                    <span className="ml-2 align-middle text-[0.6rem] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]">
                      Tu marca
                    </span>
                  )}
                </span>
                <span
                  className="text-[0.6rem] font-semibold uppercase tracking-[0.25em]"
                  style={{ color: level.color }}
                >
                  {level.name}
                </span>
              </div>
              <span className="font-score text-3xl text-white">
                {entry.score}
              </span>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        type="button"
        onClick={handleReplay}
        className="mt-6 cursor-pointer rounded-full bg-[var(--color-accent)] px-12 py-4 font-display text-xl tracking-[0.06em] text-[var(--color-bg)] shadow-[0_0_36px_-8px_var(--color-glow)] transition-transform duration-200 hover:scale-[1.03] active:scale-95 md:text-2xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
      >
        Jugar de nuevo
      </motion.button>
    </main>
  );
}
