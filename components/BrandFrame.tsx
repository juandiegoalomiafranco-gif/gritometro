import { BRAND } from "@/lib/brand";
import { NoraverLogo, TqMark } from "@/components/NoraverLogo";
import { ThroatMark } from "@/components/ThroatMark";

/**
 * Marco de marca global no invasivo (pointer-events-none):
 * - Barra superior con el wordmark real Noraver(R) Garganta.
 * - Marca de agua gigante del grafico de garganta del empaque (presencia
 *   de compañía sobre el fondo, sin competir con el contenido).
 * - Pie con claim de campaña y sello tQ Tecnoquimicas manuscrito.
 */
export function BrandFrame() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 select-none"
    >
      {/* Marca de agua corporativa (garganta del empaque) */}
      <ThroatMark
        strokeWidth={2}
        className="absolute -right-[8%] top-1/2 h-[72dvh] -translate-y-1/2 text-white opacity-[0.035] portrait:h-[46dvh] portrait:-right-[14%]"
      />

      {/* Barra de marca superior */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-4 portrait:px-8 portrait:py-6">
        <NoraverLogo size="sm" />
        <span className="text-[0.58rem] font-semibold uppercase tracking-[0.4em] text-white/50">
          Gritómetro
        </span>
      </div>

      {/* Claim de campaña */}
      <div className="absolute bottom-4 left-6 max-w-[62%] portrait:bottom-6 portrait:left-8">
        <span className="text-[0.58rem] font-medium uppercase tracking-[0.22em] text-white/35">
          {BRAND.claim}
        </span>
      </div>

      {/* Sello corporativo tQ */}
      <div className="absolute bottom-4 right-6 flex items-center gap-2.5 opacity-60 portrait:bottom-6 portrait:right-8">
        <TqMark className="text-2xl" />
        <span className="text-[0.55rem] uppercase tracking-[0.3em] text-white/45">
          {BRAND.maker}
        </span>
      </div>
    </div>
  );
}
