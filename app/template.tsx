"use client";

import { motion } from "motion/react";
import { useIdleReset } from "@/hooks/useIdleReset";

/**
 * `template.tsx` se re-monta en cada navegacion: transicion de ruta
 * sobria (fundido + desplazamiento vertical sutil). Tambien arma el
 * auto-reset de kiosk.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  useIdleReset();

  return (
    <motion.div
      className="h-dvh w-full"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
