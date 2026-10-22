/*
 * Efectos de sonido del Gritómetro — sintetizados con Web Audio.
 * Sin assets externos: tonos cortos, limpios y corporativos.
 *
 * Reglas de diseño sonoro del kiosk:
 *  - El AudioContext se crea perezosamente en el primer gesto (autoplay policy).
 *  - Volúmenes bajos y envolventes cortas: nunca compiten con el grito.
 *  - Durante la captura solo se permite `levelUp`, un blip de ~90 ms a muy
 *    baja ganancia para no contaminar la medición del micrófono.
 */

type ToneType = OscillatorType;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

const MASTER_GAIN = 0.22;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = MASTER_GAIN;
      master.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOpts {
  freq: number;
  /** Duración (s). */
  dur?: number;
  type?: ToneType;
  gain?: number;
  /** Offset de inicio (s) relativo a ahora. */
  at?: number;
  /** Frecuencia final (glide). */
  to?: number;
}

function tone({
  freq,
  dur = 0.12,
  type = "sine",
  gain = 0.5,
  at = 0,
  to,
}: ToneOpts): void {
  const ac = getCtx();
  if (!ac || !master) return;
  const t0 = ac.currentTime + at;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to !== undefined) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  env.gain.setValueAtTime(0, t0);
  env.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  env.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(env);
  env.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Desbloquea el audio en el primer gesto del usuario (llamar en taps). */
export function unlockSfx(): void {
  void getCtx();
}

/** Tap corporativo sutil para botones y CTAs. */
export function sfxTap(): void {
  tone({ freq: 660, dur: 0.07, type: "sine", gain: 0.32 });
  tone({ freq: 1320, dur: 0.05, type: "sine", gain: 0.12 });
}

/** Tecla del teclado en pantalla (más seco que el tap). */
export function sfxKey(): void {
  tone({ freq: 520, dur: 0.045, type: "triangle", gain: 0.22 });
}

/** Beep de cuenta regresiva (3, 2, 1). */
export function sfxCountBeep(): void {
  tone({ freq: 880, dur: 0.14, type: "sine", gain: 0.4 });
}

/** "¡GRITA!": tono de salida ascendente. */
export function sfxGo(): void {
  tone({ freq: 660, to: 1320, dur: 0.32, type: "sawtooth", gain: 0.22 });
  tone({ freq: 1760, dur: 0.18, type: "sine", gain: 0.25, at: 0.05 });
}

/**
 * Subida de nivel DURANTE la captura: blip mínimo (≈90 ms, ganancia muy
 * baja) para no contaminar la lectura del micrófono.
 */
export function sfxLevelUp(tier: number): void {
  const base = 740 + tier * 120;
  tone({ freq: base, to: base * 1.5, dur: 0.09, type: "sine", gain: 0.1 });
}

/** Cierre de captura: acorde breve de confirmación. */
export function sfxCaptureEnd(): void {
  tone({ freq: 523.25, dur: 0.3, type: "sine", gain: 0.3 });
  tone({ freq: 659.25, dur: 0.3, type: "sine", gain: 0.24, at: 0.04 });
  tone({ freq: 783.99, dur: 0.38, type: "sine", gain: 0.2, at: 0.08 });
}

/** Revelado del resultado. `top` dispara la fanfarria de legendario. */
export function sfxResult(top: boolean): void {
  if (top) {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) =>
      tone({ freq: f, dur: 0.34, type: "triangle", gain: 0.3, at: i * 0.11 }),
    );
    tone({ freq: 1568, dur: 0.5, type: "sine", gain: 0.18, at: 0.46 });
  } else {
    tone({ freq: 587.33, dur: 0.26, type: "triangle", gain: 0.28 });
    tone({ freq: 880, dur: 0.32, type: "sine", gain: 0.2, at: 0.1 });
  }
}

/** Confirmación al guardar la marca en el ranking. */
export function sfxSave(): void {
  tone({ freq: 783.99, dur: 0.14, type: "sine", gain: 0.32 });
  tone({ freq: 1174.66, dur: 0.22, type: "sine", gain: 0.24, at: 0.09 });
}
