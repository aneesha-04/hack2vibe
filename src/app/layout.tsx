import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import { Sidebar } from "../components/Sidebar";
import { CommandBar } from "../components/CommandBar";

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
  title: "TickTock AI - Proactive AI Productivity OS",
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
      <body className="min-h-full flex flex-col antialiased bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 relative overflow-x-hidden">
        <AppProvider>
          {/* Animated Background Mesh Blur Shapes */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 dark:bg-primary/10 blur-[130px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-secondary/5 dark:bg-secondary/8 blur-[110px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '15s' }} />
          <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-accent/4 dark:bg-accent/6 blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '12s' }} />

          <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-mesh relative z-0">
            <Sidebar />
            <main className="flex-1 w-full lg:h-screen lg:overflow-y-auto pt-14 lg:pt-0 relative flex flex-col">
              <CommandBar />
              <div className="flex-1">
                {children}
              </div>
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
