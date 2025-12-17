import "./globals.css";
import { ReactNode } from "react";
import Link from "next/link";
import { Nav } from "./nav";
import { ThemeProvider } from "./theme-provider";

export const metadata = {
  title: "AI Plays Chess",
  description: "Run AI-vs-AI chess matches with OpenRouter models.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="theme-light">
      <body className="bg-[var(--bg)] text-[var(--text)]">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/70">
              <div className="container flex items-center justify-between py-4">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-[var(--text)]">
                  <span>AI Plays Chess</span>
                </Link>
                <Nav />
              </div>
            </header>

            <main className="flex-1">
              <div className="container py-12">{children}</div>
            </main>

            <footer className="border-t border-[var(--border)] bg-[var(--bg-muted)]">
              <div className="container flex flex-col gap-2 py-6 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
                <span>AI Plays Chess · OpenRouter-powered chess experiments.</span>
                <span>Built with Next.js & Tailwind. Vercel-ready.</span>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
