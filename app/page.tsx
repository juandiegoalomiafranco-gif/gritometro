"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { markIntroSeen, shouldShowIntro } from "@/lib/storage";
import { sfxTap, unlockSfx } from "@/lib/sfx";
import { FloatingParticles } from "@/components/FloatingParticles";
import { NoraverLogo } from "@/components/NoraverLogo";
import { Preloader } from "@/components/Preloader";
import { RevealText } from "@/components/RevealText";
import { Eyebrow } from "@/components/Eyebrow";
import { ShieldIcon } from "@/components/icons";

export default function IdlePage() {
  const router = useRouter();
  // null = decidiendo (pre-mount), true = mostrar preloader, false = hero.
  const [showPreloader, setShowPreloader] = useState<boolean | null>(null);

  useEffect(() => {
    setShowPreloader(shouldShowIntro());
  }, []);

  const finishPreload = (): void => {
    markIntroSeen();
    setShowPreloader(false);
  };

  const begin = (): void => {
    unlockSfx();
    sfxTap();
    router.push("/instructions");
  };

  if (showPreloader === null) {
    return <main className="h-dvh w-full" />;
  }

  return (
    <main
      onClick={begin}
      className="relative flex h-dvh w-full cursor-pointer flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <AnimatePresence>
        {showPreloader && (
          <Preloader key="preloader" onComplete={finishPreload} />
        )}
      </AnimatePresence>

      <FloatingParticles count={18} />

      {/* Glow ambiental aqua (sutil, corporativo) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(0,184,217,0.14) 0%, transparent 60%)",
        }}
      />

      {!showPreloader && (
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-7 portrait:justify-between portrait:py-[10dvh]">
          {/* Bloque superior: identidad */}
          <div className="flex flex-col items-center gap-6 portrait:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <NoraverLogo size="lg" withSeal className="portrait:scale-110" />
            </motion.div>

            <Eyebrow label="Gritómetro" delay={0.25} />
          </div>

          {/* Bloque central: titulo gigante (en vertical crece con el alto) */}
          <h1 className="font-display text-[clamp(3rem,9vw,8rem)] portrait:text-[clamp(3.5rem,15vmin,12rem)]">
            <span className="block text-white">
              <RevealText text="GRITA" delay={0.35} />
            </span>
            <span className="block text-[var(--color-accent)]">
              <RevealText text="SI PUEDES" delay={0.55} />
            </span>
          </h1>

          {/* Bloque inferior: copy + CTA a altura de mano */}
          <div className="flex flex-col items-center gap-6">
            <motion.p
              className="max-w-md text-base font-medium text-white/55 md:text-lg portrait:text-xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              Mide la potencia de tu voz con precisión.
              <br />
              ¿Llegarás al nivel{" "}
              <span className="font-semibold text-[var(--color-success)]">
                legendario
              </span>
              ?
            </motion.p>

            <motion.button
              type="button"
              className="mt-2 cursor-pointer rounded-full bg-[var(--color-accent)] px-12 py-5 font-display text-xl tracking-[0.06em] text-[var(--color-bg)] md:text-2xl portrait:px-16 portrait:py-6 portrait:text-3xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{
                opacity: 1,
                y: 0,
                boxShadow: [
                  "0 0 24px -6px rgba(0,229,255,0.45)",
                  "0 0 44px -2px rgba(0,229,255,0.7)",
                  "0 0 24px -6px rgba(0,229,255,0.45)",
                ],
              }}
              transition={{
                opacity: { delay: 1.05, duration: 0.5 },
                y: { delay: 1.05, duration: 0.5 },
                boxShadow: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Tocar para comenzar
            </motion.button>

            {/* Claim de marca */}
            <motion.div
              className="flex items-center gap-2 text-white/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.6 }}
            >
              <ShieldIcon className="h-4 w-4 text-[var(--color-highlight)]" />
              <span className="text-xs font-medium tracking-[0.14em]">
                {BRAND.claim}
              </span>
            </motion.div>
          </div>
        </div>
      )}
    </main>
  );
}
