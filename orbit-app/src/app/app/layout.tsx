// src/app/app/layout.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser, useStackApp } from "@stackframe/stack";
import { useEffect, useState } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const user = useUser();
  const app = useStackApp();
  const [hasTriggeredRedirect, setHasTriggeredRedirect] = useState(false);

  // If there is no user, kick them to sign in
  useEffect(() => {
    if (user === null && !hasTriggeredRedirect) {
      setHasTriggeredRedirect(true);
      app.redirectToSignIn();
    }
  }, [user, hasTriggeredRedirect, app]);

  // While auth is loading
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-orbit-muted">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-orbit-border border-t-orbit-pink animate-spin" />
          <p className="text-sm">Checking your Orbit account…</p>
        </div>
      </div>
    );
  }

  // Unauthed, redirect in progress
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-orbit-muted">
        <p className="text-sm">Redirecting you to sign in…</p>
      </div>
    );
  }

  // Authed
  const displayName = user.displayName ?? user.primaryEmail ?? "Orbit user";

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
              {displayName}
            </span>

            <Link
              href="/"
              className="rounded-full border border-orbit-border px-3 py-1 hover:border-white/40 hover:text-white transition text-[11px]"
            >
              Back to landing
            </Link>

            <button
              type="button"
              onClick={() => app.signOut()}
              className="rounded-full border border-orbit-border px-3 py-1 text-[11px] text-orbit-muted hover:border-red-400/70 hover:text-red-300 transition"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="orbit-container py-8 sm:py-10 lg:py-12 space-y-6">
        {children}
      </main>
    </div>
  );
}
