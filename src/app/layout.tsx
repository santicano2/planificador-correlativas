import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";

import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Planificador de Correlativas",
  description:
    "Subí el PDF de tu plan de estudios, revisá las correlativas y planificá qué materias podés cursar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
