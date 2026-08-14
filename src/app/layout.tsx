import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ProgressProvider } from "@/store/progress";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";
import "katex/dist/katex.min.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neural Sync Infinity · Live Textbook",
  description:
    "An AI-powered interactive live textbook where every page explains itself, answers questions, builds quizzes, simulations and notes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ProgressProvider>
          <SiteNav />
          {children}
        </ProgressProvider>
      </body>
    </html>
  );
}
