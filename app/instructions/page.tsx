"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { SlideMask } from "@/components/TextFx";
import { Eyebrow } from "@/components/Eyebrow";
import { sfxTap } from "@/lib/sfx";
import { MicIcon, ShieldIcon, WaveIcon } from "@/components/icons";
import type { SVGProps } from "react";

interface Step {
  index: string;
  title: string;
  text: string;
  Icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
}

const STEPS: Step[] = [
  {
    index: "01",
    title: "Acércate",
    text: "Ubícate frente al micrófono de medición.",
    Icon: MicIcon,
  },
  {
    index: "02",
    title: "Grita",
    text: "Con toda tu potencia, sostenido por unos segundos.",
    Icon: WaveIcon,
  },
  {
    index: "03",
    title: "Supéralo",
    text: "Noraver protege tu garganta. ¿Llegarás a legendario?",
    Icon: ShieldIcon,
  },
];

export default function InstructionsPage() {
  const router = useRouter();

  return (
    <main className="relative flex h-dvh w-full flex-col items-center justify-center gap-12 overflow-hidden px-8">
      <div className="flex flex-col items-center gap-3">
        <Eyebrow label="Protocolo de medición" />
        <h1 className="font-display text-center text-[clamp(2.2rem,6vw,4.5rem)] portrait:text-[clamp(2.6rem,8vmin,6rem)]">
          <span className="text-white">
            <SlideMask text="CÓMO" delay={0.1} />
          </span>{" "}
          <span className="text-[var(--color-accent)]">
            <SlideMask text="FUNCIONA" delay={0.22} />
          </span>
        </h1>
      </div>

      {/* Indice editorial numerado: en vertical, filas apiladas a lo ancho */}
      <div className="grid w-full max-w-5xl gap-5 md:grid-cols-3 portrait:max-w-3xl portrait:grid-cols-1">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.index}
            className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-8 text-left portrait:flex-row portrait:items-center portrait:gap-8 portrait:py-7"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.3 + i * 0.13,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="flex items-start justify-between portrait:shrink-0 portrait:flex-col portrait:items-center portrait:gap-3">
              <span className="font-score text-5xl leading-none text-white/15 md:text-6xl">
                {step.index}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-accent)]/50 text-[var(--color-accent)]">
                <step.Icon className="h-5 w-5" />
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-2xl text-white">{step.title}</h2>
              <p className="text-sm font-medium leading-relaxed text-white/55">
                {step.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        type="button"
        onClick={() => {
          sfxTap();
          router.push("/difficulty");
        }}
        className="cursor-pointer rounded-full bg-[var(--color-accent)] px-12 py-5 font-display text-xl tracking-[0.06em] text-[var(--color-bg)] shadow-[0_0_36px_-8px_var(--color-glow)] transition-transform duration-200 hover:scale-[1.03] active:scale-95 md:text-2xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.75 }}
      >
        Comenzar
      </motion.button>
    </main>
  );
}
