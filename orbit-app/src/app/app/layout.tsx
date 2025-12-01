// src/app/app/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-orbit-text">
      <header className="border-b border-orbit-border/60">
        <div className="orbit-container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <Image
                  src="/orbit-high-res-transparent.png"
                  alt="Orbit"
                  width={160}
                  height={160}
                  className="w-auto h-7 sm:h-8"
                />
              </div>
            </Link>
            <span className="hidden sm:inline-block text-xs text-orbit-muted">
              Plans
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline text-orbit-muted">
              Prototype workspace
            </span>
            <Link
              href="/"
              className="rounded-full border border-orbit-border px-3 py-1 hover:border-white/40 hover:text-white transition text-[11px]"
            >
              Back to landing
            </Link>
          </div>
        </div>
      </header>

      <main className="orbit-container py-8 sm:py-10 lg:py-12 space-y-6">
        {children}
      </main>
    </div>
  );
}
