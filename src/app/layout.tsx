import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Family Vacation 2027",
  description: "Family lodging vote for June 2027 — 14 people, book by end of Sep 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-amber-800/60">
          June 2027 · 14 people · kids 11/8/4/2 · book by Sep 30, 2026 · lodging feasibility under 10 =
          disqualified
        </footer>
      </body>
    </html>
  );
}
