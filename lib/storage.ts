import type { DifficultyId } from "@/lib/difficulties";

export interface ScoreEntry {
  id: string;
  name: string;
  /** Score final = pico * multiplicador de dificultad. */
  score: number;
  /** Id del nivel alcanzado dentro de la dificultad. */
  level: number;
  /** Dificultad jugada. */
  difficulty: DifficultyId;
  /** Epoch ms en que se registró. */
  timestamp: number;
}

/** Resultado de una partida en curso (entre /play y /name). */
export interface RunResult {
  /** Pico crudo en la escala 0..100 (curva aplicada, sin multiplicador). */
  rawScore: number;
  /** Score final con multiplicador. */
  score: number;
  level: number;
  difficulty: DifficultyId;
}

const LB_KEY = "gritometro:leaderboard";
const PRELOAD_KEY = "gritometro:preloaded";
const RUN_KEY = "gritometro:run";
const DIFF_KEY = "gritometro:difficulty";
const LAST_ID_KEY = "gritometro:lastId";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function makeId(): string {
  if (isBrowser() && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Lee el leaderboard completo, ordenado por score desc. */
export function loadLeaderboard(): ScoreEntry[] {
  if (!isBrowser()) return [];
  const list = safeParse<ScoreEntry[]>(localStorage.getItem(LB_KEY), []);
  return [...list].sort((a, b) => b.score - a.score);
}

/** Agrega un score y devuelve la entrada creada. */
export function addScore(
  name: string,
  score: number,
  level: number,
  difficulty: DifficultyId,
): ScoreEntry {
  const entry: ScoreEntry = {
    id: makeId(),
    name: name.trim().slice(0, 12) || "ANÓNIMO",
    score,
    level,
    difficulty,
    timestamp: Date.now(),
  };
  if (isBrowser()) {
    const list = safeParse<ScoreEntry[]>(localStorage.getItem(LB_KEY), []);
    list.push(entry);
    localStorage.setItem(LB_KEY, JSON.stringify(list));
  }
  return entry;
}

/**
 * Top N del día. Si se pasa `difficulty`, filtra por esa dificultad;
 * de lo contrario devuelve el global del día.
 */
export function topToday(
  difficulty?: DifficultyId,
  limit = 10,
): ScoreEntry[] {
  const today = new Date().toDateString();
  return loadLeaderboard()
    .filter((e) => new Date(e.timestamp).toDateString() === today)
    .filter((e) => (difficulty ? e.difficulty === difficulty : true))
    .slice(0, limit);
}

/** Guarda el resultado de la partida en curso (sessionStorage). */
export function saveRun(run: RunResult): void {
  if (isBrowser()) sessionStorage.setItem(RUN_KEY, JSON.stringify(run));
}

export function loadRun(): RunResult | null {
  if (!isBrowser()) return null;
  return safeParse<RunResult | null>(sessionStorage.getItem(RUN_KEY), null);
}

export function clearRun(): void {
  if (isBrowser()) {
    sessionStorage.removeItem(RUN_KEY);
    sessionStorage.removeItem(LAST_ID_KEY);
  }
}

/** Dificultad elegida para la partida en curso. */
export function saveDifficulty(id: DifficultyId): void {
  if (isBrowser()) sessionStorage.setItem(DIFF_KEY, id);
}

export function loadDifficulty(): DifficultyId | null {
  if (!isBrowser()) return null;
  const raw = sessionStorage.getItem(DIFF_KEY);
  if (raw === "easy" || raw === "medium" || raw === "hard") return raw;
  return null;
}

/** Marca cuál fue la última entrada agregada (para resaltarla en el ranking). */
export function setLastId(id: string): void {
  if (isBrowser()) sessionStorage.setItem(LAST_ID_KEY, id);
}

export function getLastId(): string | null {
  if (!isBrowser()) return null;
  return sessionStorage.getItem(LAST_ID_KEY);
}

/* --- Ciclo del kiosk: intro/preloader por visitante ----------------- */

/** ¿Debe mostrarse la intro (preloader) al llegar al idle? */
export function shouldShowIntro(): boolean {
  if (!isBrowser()) return false;
  return sessionStorage.getItem(PRELOAD_KEY) !== "1";
}

/** Marca la intro como vista (no se repite al navegar dentro del flujo). */
export function markIntroSeen(): void {
  if (isBrowser()) sessionStorage.setItem(PRELOAD_KEY, "1");
}

/**
 * Pide una intro fresca para el próximo ciclo: se llama al terminar una
 * partida ("Jugar de nuevo") o cuando el kiosk se resetea por inactividad,
 * para que cada visitante reciba la entrada de marca completa.
 */
export function requestFreshIntro(): void {
  if (isBrowser()) sessionStorage.removeItem(PRELOAD_KEY);
}
