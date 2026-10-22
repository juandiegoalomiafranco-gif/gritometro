"use client";

interface SegmentedBarProps {
  /** Progreso 0..1. */
  progress: number;
  /** Numero de segmentos. */
  segments?: number;
  /** Color de los segmentos encendidos. */
  color?: string;
  /** Altura de la barra (clase Tailwind). */
  heightClass?: string;
  className?: string;
}

/**
 * Barra de progreso segmentada estilo instrumento de medicion.
 * Usada en el preloader, el temporizador de captura y el sustain del juego.
 */
export function SegmentedBar({
  progress,
  segments = 24,
  color = "var(--color-accent)",
  heightClass = "h-2",
  className = "",
}: SegmentedBarProps) {
  const p = Math.min(1, Math.max(0, progress));
  const lit = Math.round(p * segments);

  return (
    <div
      className={`flex w-full gap-[3px] ${heightClass} ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p * 100)}
    >
      {Array.from({ length: segments }, (_, i) => {
        const on = i < lit;
        return (
          <span
            key={i}
            className="flex-1 rounded-[1px] transition-colors duration-150"
            style={{
              backgroundColor: on ? color : "rgba(255,255,255,0.08)",
              boxShadow: on ? `0 0 8px ${color}66` : "none",
            }}
          />
        );
      })}
    </div>
  );
}
