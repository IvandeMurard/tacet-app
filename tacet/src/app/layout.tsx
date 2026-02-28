import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D9488",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tacet.vercel.app"),
  title: {
    default: "Tacet — Bruit à Paris",
    template: "%s | Tacet",
  },
  description:
    "Carte interactive de la pollution sonore à Paris par zones IRIS. Données officielles Bruitparif 2024 — 992 zones couvertes.",
  keywords: [
    "carte bruit Paris",
    "pollution sonore Paris",
    "bruit quartier Paris",
    "Bruitparif",
    "carte sonore",
    "IRIS bruit",
  ],
  authors: [{ name: "Tacet" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://tacet.vercel.app",
    siteName: "Tacet",
    title: "Tacet — Bruit à Paris",
    description:
      "Visualisez la pollution sonore de votre quartier à Paris. Données Bruitparif 2024, 992 zones IRIS.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Tacet — Carte du bruit à Paris",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tacet — Bruit à Paris",
    description:
      "Visualisez la pollution sonore de votre quartier à Paris. Données Bruitparif 2024.",
    images: ["/og-image.svg"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
