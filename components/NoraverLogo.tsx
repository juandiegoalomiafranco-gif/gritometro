import { BRAND } from "@/lib/brand";

interface NoraverLogoProps {
  /** sm: barra de marca · md: heros · lg: idle/result · xl: hero del idle */
  size?: "sm" | "md" | "lg" | "xl";
  /** Muestra el sello tQ junto al wordmark. */
  withSeal?: boolean;
  className?: string;
}

const SIZES = {
  sm: { word: "text-xl", reg: "text-[0.5rem]", sub: "text-[0.52rem]", subTrack: "0.46em", seal: "text-2xl" },
  md: { word: "text-4xl", reg: "text-[0.7rem]", sub: "text-[0.7rem]", subTrack: "0.5em", seal: "text-4xl" },
  lg: { word: "text-6xl", reg: "text-xs", sub: "text-[0.95rem]", subTrack: "0.52em", seal: "text-5xl" },
  xl: { word: "text-7xl", reg: "text-sm", sub: "text-[1.1rem]", subTrack: "0.55em", seal: "text-6xl" },
} as const;

/** Trazo manuscrito tQ de Tecnoquimicas (fiel al logo corporativo). */
export function TqMark({
  className = "",
  color = BRAND.colors.highlight,
}: {
  className?: string;
  color?: string;
}) {
  return (
    <span
      aria-label="Tecnoquímicas"
      className={`font-script leading-none ${className}`}
      style={{ color }}
    >
      tQ
    </span>
  );
}

/**
 * Identidad real Noraver Garganta, fiel al empaque:
 * "Noraver(R)" en redondeada extra-bold blanca + "GARGANTA" en el verde
 * del paquete, con tracking amplio. Sello tQ manuscrito opcional.
 */
export function NoraverLogo({
  size = "md",
  withSeal = false,
  className = "",
}: NoraverLogoProps) {
  const s = SIZES[size];
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {withSeal && <TqMark className={s.seal} />}
      <div className="flex flex-col items-start leading-none">
        <span className={`font-brand ${s.word} text-white`}>
          Noraver
          <span className={`${s.reg} align-super font-semibold`}>®</span>
        </span>
        <span
          className={`${s.sub} mt-1 font-bold uppercase`}
          style={{
            color: BRAND.colors.green,
            letterSpacing: s.subTrack,
          }}
        >
          Garganta
        </span>
      </div>
    </div>
  );
}
