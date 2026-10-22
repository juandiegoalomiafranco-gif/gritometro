"use client";

import { sfxKey } from "@/lib/sfx";
import { BackspaceIcon } from "@/components/icons";

const ROWS: string[][] = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

interface OnScreenKeyboardProps {
  onKey: (char: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  disabled?: boolean;
}

/**
 * Teclado tactil en pantalla para totem, acabado fino/corporativo:
 * teclas hairline translucidas, feedback de pulsacion sobrio en aqua.
 */
export function OnScreenKeyboard({
  onKey,
  onBackspace,
  onSpace,
  disabled = false,
}: OnScreenKeyboardProps) {
  const keyClass =
    "flex h-12 min-w-[2.6rem] flex-1 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-lg font-medium text-white/90 transition-all duration-150 hover:border-white/25 hover:bg-white/10 active:scale-95 active:border-[var(--color-accent)] active:bg-[var(--color-accent)]/20 disabled:opacity-40 md:h-14 md:text-xl";

  return (
    <div className="flex w-full max-w-2xl select-none flex-col gap-1.5">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5">
          {row.map((char) => (
            <button
              key={char}
              type="button"
              disabled={disabled}
              onClick={() => {
                sfxKey();
                onKey(char);
              }}
              className={keyClass}
            >
              {char}
            </button>
          ))}
        </div>
      ))}
      <div className="flex justify-center gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            sfxKey();
            onSpace();
          }}
          className="flex h-12 flex-[4] cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition-all duration-150 hover:border-white/25 hover:bg-white/10 active:scale-[0.98] disabled:opacity-40 md:h-14"
        >
          Espacio
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            sfxKey();
            onBackspace();
          }}
          aria-label="Borrar último carácter"
          className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white/90 transition-all duration-150 hover:border-white/25 hover:bg-white/10 active:scale-95 active:border-[var(--color-accent)] active:bg-[var(--color-accent)]/20 disabled:opacity-40 md:h-14"
        >
          <BackspaceIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
