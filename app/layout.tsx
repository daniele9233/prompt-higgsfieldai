import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Cinematic Ad Director",
  description:
    "A prompt engineer for AI video generation — single-take, timestamp-driven prompts for landing-page hero videos."
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} dark`}>
      <body className="grain min-h-screen bg-ink-900 font-sans text-neutral-100 antialiased">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
