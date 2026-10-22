import type { SVGProps } from "react";

/**
 * Iconografia SVG propia de la campana Noraver Garganta.
 * Estilo: linea fina (1.5), instrumental/medico, sin relleno.
 * Sustituye cualquier emoji de la UI.
 */

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps): IconProps {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

/** Microfono de medicion. */
export function MicIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      <path d="M9 21h6" />
    </svg>
  );
}

/** Pulso clinico (calibracion / medicion de ambiente). */
export function PulseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2 12h4l2.5-6 4 12 2.5-6h7" />
    </svg>
  );
}

/** Escudo de proteccion (claim Noraver). */
export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />
      <path d="M9.2 12l2 2 3.6-4" />
    </svg>
  );
}

/** Nivel 1 — gota (susurro). */
export function DropIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5c3.2 4 6 7.2 6 10.5a6 6 0 0 1-12 0c0-3.3 2.8-6.5 6-10.5z" />
    </svg>
  );
}

/** Nivel 2 — flujo de aire (voz). */
export function AirIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 8h9.5a2.5 2.5 0 1 0-2.5-2.5" />
      <path d="M3 12h14.5a2.5 2.5 0 1 1-2.5 2.5" />
      <path d="M3 16h7.5a2.5 2.5 0 1 1-2.5 2.5" />
    </svg>
  );
}

/** Nivel 3 — onda sonora (grito). */
export function WaveIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12v.01" />
      <path d="M8 9v6" />
      <path d="M12 6v12" />
      <path d="M16 9v6" />
      <path d="M20 12v.01" />
    </svg>
  );
}

/** Nivel 4 — descarga (brutal). */
export function BoltIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13 3L5 13.5h5L11 21l8-10.5h-5L13 3z" />
    </svg>
  );
}

/** Nivel 5 — llama (legendario). */
export function FlameIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3c1 3-0.5 4.5-2 6-1.6 1.6-3 3.4-3 6a5 5 0 0 0 10 0c0-1.2-.4-2.3-1-3.2-.5 1-1.2 1.6-2 2-0.2-2.6-.8-5.4-2-10.8z" />
    </svg>
  );
}

/** Intensidad de dificultad: arcos concentricos (1=facil, 3=dificil). */
export function IntensityIcon({
  level,
  ...props
}: IconProps & { level: 1 | 2 | 3 }) {
  return (
    <svg {...base(props)}>
      <circle cx="6" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="M10 8.5a5 5 0 0 1 0 7" opacity={level >= 1 ? 1 : 0.25} />
      <path d="M13.5 6a9 9 0 0 1 0 12" opacity={level >= 2 ? 1 : 0.25} />
      <path d="M17 3.5a13 13 0 0 1 0 17" opacity={level >= 3 ? 1 : 0.25} />
    </svg>
  );
}

/** Distincion sobria (badge "para leyendas" / ranking). */
export function LaurelIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4v9" />
      <path d="M12 13c0-2.5 1.8-4.5 4.5-4.5C16.5 11 14.7 13 12 13z" />
      <path d="M12 13c0-2.5-1.8-4.5-4.5-4.5C7.5 11 9.3 13 12 13z" />
      <path d="M6 15c1.5 3 3.5 4.5 6 4.5s4.5-1.5 6-4.5" />
    </svg>
  );
}

/** Confirmacion. */
export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Navegacion: volver. */
export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
  );
}

/** Borrar caracter (teclado en pantalla). */
export function BackspaceIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8.5 5h11A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-11L3 12l5.5-7z" />
      <path d="M12 9.5l5 5" />
      <path d="M17 9.5l-5 5" />
    </svg>
  );
}

/** Icono por id de nivel del juego (1..5). */
export function LevelIcon({
  levelId,
  ...props
}: IconProps & { levelId: number }) {
  switch (levelId) {
    case 2:
      return <AirIcon {...props} />;
    case 3:
      return <WaveIcon {...props} />;
    case 4:
      return <BoltIcon {...props} />;
    case 5:
      return <FlameIcon {...props} />;
    case 1:
    default:
      return <DropIcon {...props} />;
  }
}

/** Icono por dificultad (intensidad 1..3). */
export function DifficultyIcon({
  difficultyId,
  ...props
}: IconProps & { difficultyId: "easy" | "medium" | "hard" }) {
  const level: 1 | 2 | 3 =
    difficultyId === "easy" ? 1 : difficultyId === "medium" ? 2 : 3;
  return <IntensityIcon level={level} {...props} />;
}
