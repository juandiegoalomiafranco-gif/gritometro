import type { SVGProps } from "react";

/**
 * Grafico de marca del empaque Noraver Garganta: perfil humano en trazo
 * lineal con la garganta destacada por burbujas ascendentes (efecto
 * refrescante). Dibujado en linea fina para el acabado clinico/corporativo.
 * Hereda color via currentColor (usable como marca de agua o ilustracion).
 */
export function ThroatMark({
  strokeWidth = 3,
  ...props
}: SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 200 280"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {/* Perfil: frente, nariz, labios, menton y cuello */}
      <path d="M78 18C118 10 150 34 152 66C153 78 150 86 152 92C155 98 162 104 163 112C164 117 158 119 150 122C156 126 158 132 152 138C158 142 156 150 148 154C150 162 144 170 136 174C124 186 112 192 106 206C102 218 102 234 104 252" />
      {/* Craneo y nuca */}
      <path d="M78 18C48 26 32 56 34 88C36 116 48 134 52 156C56 176 56 196 54 252" />
      {/* Burbujas refrescantes subiendo por la garganta */}
      <circle cx="98" cy="238" r="7" />
      <circle cx="92" cy="214" r="5" />
      <circle cx="101" cy="192" r="4" />
      <circle cx="94" cy="170" r="3" />
      <circle cx="100" cy="150" r="2.2" />
      {/* Ondas de frescura saliendo de la boca */}
      <path d="M170 132c8 2 14 6 18 12" opacity="0.7" />
      <path d="M172 144c6 1.5 10 4.5 13 9" opacity="0.45" />
    </svg>
  );
}
