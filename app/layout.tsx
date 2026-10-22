import type { Metadata, Viewport } from "next";
import { Archivo, Baloo_2, Caveat, Montserrat } from "next/font/google";
import "./globals.css";
import { BrandFrame } from "@/components/BrandFrame";

/*
 * Display: Archivo variable (eje wdth) — grotesca corporativa condensable,
 * con pesos reales y numerales tabulares. Mas institucional que Bebas Neue
 * (que se siente "poster") y mas alta/seria que Anton.
 */
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  axes: ["wdth"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-body",
});

/* Wordmark Noraver: redondeada extra-bold, fiel al empaque. */
const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-brand",
});

/* Sello tQ: trazo manuscrito del logo de Tecnoquimicas. */
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  variable: "--font-script",
});

export const metadata: Metadata = {
  title: "Gritómetro · Noraver Garganta",
  description: "Grita todo lo que quieras. Noraver protege tu garganta.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#001F3F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${archivo.variable} ${montserrat.variable} ${baloo.variable} ${caveat.variable}`}
    >
      <body>
        <BrandFrame />
        {children}
      </body>
    </html>
  );
}
