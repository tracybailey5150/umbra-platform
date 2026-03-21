import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Umbra — AI Agent Platform",
    template: "%s | Umbra",
  },
  description: "Intelligent quote, intake, and buyer agents that work until the job is done.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://umbra.ai"),
  openGraph: {
    type: "website",
    siteName: "Umbra",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerifDisplay.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased" style={{ background: '#070C18', color: '#F1F5F9' }}>
        {children}
      </body>
    </html>
  );
}
