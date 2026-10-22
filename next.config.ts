import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // El totem corre en kiosk sin sufijos de ruta; trailingSlash facilita
  // servir el export estático desde cualquier carpeta.
  trailingSlash: true,
};

export default nextConfig;
