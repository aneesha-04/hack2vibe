import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import { Sidebar } from "../components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LastMinute AI - The Last-Minute Life Saver",
  description: "Dynamic AI productivity companion that predicts missing-deadline risks, automatically schedules your time blocks, and coaches you to completion.",
  keywords: ["productivity", "AI assistant", "deadline prediction", "task management", "focus coach", "time blocks"],
  authors: [{ name: "DeepMind Advanced Agentic Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <AppProvider>
          <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-mesh">
            <Sidebar />
            <main className="flex-1 w-full lg:h-screen lg:overflow-y-auto pt-14 lg:pt-0">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
