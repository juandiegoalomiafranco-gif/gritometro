"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { requestFreshIntro } from "@/lib/storage";

/** Tiempo de inactividad antes de volver al atractor (idle). */
const IDLE_MS = 30_000;

/**
 * Auto-reset de kiosk: si no hay interacción durante IDLE_MS, navega al idle.
 * Inactivo en la propia pantalla idle ("/").
 */
export function useIdleReset(): void {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") return;

    let timer: ReturnType<typeof setTimeout>;
    const schedule = (): void => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Reset por inactividad: el siguiente visitante recibe la intro completa.
        requestFreshIntro();
        router.push("/");
      }, IDLE_MS);
    };

    const events: (keyof WindowEventMap)[] = [
      "pointerdown",
      "touchstart",
      "keydown",
      "mousemove",
    ];
    events.forEach((e) => window.addEventListener(e, schedule, { passive: true }));
    schedule();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, schedule));
    };
  }, [pathname, router]);
}
