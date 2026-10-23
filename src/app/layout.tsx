import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planificador de Correlativas",
  description:
    "Cargá tu plan de estudios y descubrí qué materias podés cursar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
