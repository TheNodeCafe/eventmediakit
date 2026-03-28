import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EventMediaKit — Kits média personnalisables pour vos événements",
    template: "%s — EventMediaKit",
  },
  description:
    "Créez des kits média personnalisables pour vos événements. Vos speakers et exposants génèrent leurs propres visuels en respectant votre charte graphique.",
  keywords: [
    "media kit",
    "événement",
    "template",
    "visuel personnalisable",
    "salon professionnel",
    "conférence",
    "speaker",
    "exposant",
    "charte graphique",
    "SaaS",
  ],
  authors: [{ name: "EventMediaKit" }],
  creator: "EventMediaKit",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://media-kit.pulse-n-flow.com"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "EventMediaKit",
    title: "EventMediaKit — Kits média personnalisables pour vos événements",
    description:
      "Vos speakers et exposants génèrent leurs propres visuels en respectant votre charte graphique. Fini les allers-retours avec votre graphiste.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventMediaKit — Kits média personnalisables",
    description:
      "Vos participants génèrent leurs propres visuels en respectant votre charte graphique.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
