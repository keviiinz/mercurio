import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mercurio",
  description: "Plataforma de puntos de venta",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, background: "#0f1117", color: "#e8eaf0", fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
