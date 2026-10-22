export const BRAND = {
  name: "Noraver Garganta",
  maker: "Tecnoquímica",
  tagline: "Grita todo lo que quieras",
  claim: "Grita todo lo que quieras, Noraver protege tu garganta.",
  colors: {
    primary: "#003D7A", // Azul Noraver oscuro
    secondary: "#0066CC", // Azul medio
    accent: "#00B8D9", // Aguamarina (CTA)
    highlight: "#7FDBFF", // Aqua claro
    glow: "#00E5FF", // Cyan brillante para glow effects
    white: "#FFFFFF",
    bgLight: "#E6F4FA",
    bgDark: "#001F3F", // Casi negro azulado
    bgDeep: "#001226", // Fondo profundo
    success: "#00FFB2", // Verde aqua para nivel maximo
    green: "#8DC63F", // Verde "GARGANTA" del empaque
  },
  fonts: {
    display: "var(--font-display)", // Archivo condensada (corporativa)
    body: "var(--font-body)", // Montserrat
    brand: "var(--font-brand)", // Redondeada bold (wordmark Noraver)
    script: "var(--font-script)", // Manuscrita (sello tQ)
  },
} as const;

export type BrandColor = keyof typeof BRAND.colors;
