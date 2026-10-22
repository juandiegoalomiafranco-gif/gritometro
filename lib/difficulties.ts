export type DifficultyId = "easy" | "medium" | "hard";

export interface DiffLevel {
  id: number;
  name: string;
  /** Umbral mínimo en la escala 0..100 (curva ya aplicada). */
  min: number;
  /** Umbral máximo en la escala 0..100. */
  max: number;
  color: string;
}

export interface Difficulty {
  id: DifficultyId;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
  /** Multiplicador aplicado al score final. */
  scoreMultiplier: number;
  /** Tiempo (ms) que se debe sostener un nivel para validarlo. */
  sustainMs: number;
  /** Duración (ms) de la calibración de ruido ambiente. */
  calibrationMs: number;
  /** Penaliza inconsistencia (caídas momentáneas del grito). */
  penalizeDips: boolean;
  levels: DiffLevel[];
}

export const DIFFICULTIES: Record<DifficultyId, Difficulty> = {
  easy: {
    id: "easy",
    name: "FÁCIL",
    subtitle: "Para calentar",
    icon: "intensity-1",
    color: "#00B8D9",
    description: "Ideal para niños y principiantes",
    scoreMultiplier: 1,
    sustainMs: 1000,
    calibrationMs: 1000,
    penalizeDips: false,
    levels: [
      { id: 1, name: "Susurro", min: 0, max: 30, color: "#7FDBFF" },
      { id: 2, name: "Voz", min: 30, max: 60, color: "#00B8D9" },
      { id: 3, name: "¡GRITO!", min: 60, max: 100, color: "#00FFB2" },
    ],
  },
  medium: {
    id: "medium",
    name: "INTERMEDIO",
    subtitle: "El desafío real",
    icon: "intensity-2",
    color: "#0066CC",
    description: "Para los que se animan",
    scoreMultiplier: 1.5,
    sustainMs: 2000,
    calibrationMs: 1500,
    penalizeDips: false,
    levels: [
      { id: 1, name: "Susurro", min: 0, max: 40, color: "#7FDBFF" },
      { id: 2, name: "Voz Normal", min: 40, max: 65, color: "#00B8D9" },
      { id: 3, name: "Grito", min: 65, max: 85, color: "#00E5FF" },
      { id: 4, name: "¡GRITO BRUTAL!", min: 85, max: 100, color: "#00FFB2" },
    ],
  },
  hard: {
    id: "hard",
    name: "DIFÍCIL",
    subtitle: "Solo para leyendas",
    icon: "intensity-3",
    color: "#001F3F",
    description: "Casi imposible. ¿Te atreves?",
    scoreMultiplier: 2,
    sustainMs: 3000,
    calibrationMs: 2000,
    penalizeDips: true,
    levels: [
      { id: 1, name: "Susurro", min: 0, max: 50, color: "#7FDBFF" },
      { id: 2, name: "Voz", min: 50, max: 75, color: "#00B8D9" },
      { id: 3, name: "Grito Fuerte", min: 75, max: 92, color: "#00E5FF" },
      { id: 4, name: "¡BRUTAL!", min: 92, max: 98, color: "#FFFFFF" },
      { id: 5, name: "¡LEGENDARIO!", min: 98, max: 100, color: "#00FFB2" },
    ],
  },
};

export const DIFFICULTY_ORDER: DifficultyId[] = ["easy", "medium", "hard"];

/**
 * Claves de icono por nivel (render via <LevelIcon/> en components/icons.tsx).
 * Sin emojis: iconografia SVG instrumental propia.
 */
export const LEVEL_ICONS: Record<number, string> = {
  1: "drop", // gota suave
  2: "air", // flujo de aire
  3: "wave", // onda sonora
  4: "bolt", // descarga
  5: "flame", // legendario
};

/**
 * Curvas de dificultad: mapean volumen real (0..100) a la escala de juego.
 * Exponentes mayores => subida más lenta => más difícil llegar arriba.
 */
export const difficultyCurves: Record<DifficultyId, (db: number) => number> = {
  easy: (db) => Math.pow(db / 100, 0.7) * 100, // subida media
  medium: (db) => Math.pow(db / 100, 1.2) * 100, // subida lenta
  hard: (db) => Math.pow(db / 100, 1.8) * 100, // subida muy lenta
};

export function getDifficulty(id: DifficultyId): Difficulty {
  return DIFFICULTIES[id];
}

/** Aplica la curva de la dificultad y devuelve un valor 0..100. */
export function applyCurve(id: DifficultyId, db: number): number {
  const clamped = Math.min(100, Math.max(0, db));
  return Math.min(100, Math.max(0, difficultyCurves[id](clamped)));
}

/** Devuelve el nivel correspondiente a un valor de escala dentro de una dificultad. */
export function getLevelForScale(diff: Difficulty, scaled: number): DiffLevel {
  const value = Math.min(100, Math.max(0, scaled));
  for (let i = diff.levels.length - 1; i >= 0; i -= 1) {
    if (value >= diff.levels[i].min) return diff.levels[i];
  }
  return diff.levels[0];
}

/**
 * Color legible sobre el fondo oscuro de marca: mapea los azules profundos
 * (usados como identidad de dificultad) a sus equivalentes aqua para texto.
 */
export function getReadableColor(hex: string): string {
  if (hex === "#001F3F") return "#7FDBFF";
  if (hex === "#003D7A") return "#00B8D9";
  return hex;
}
