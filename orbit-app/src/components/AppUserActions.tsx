// src/components/AppUserActions.tsx
"use client";

import Link from "next/link";
import { useStackApp } from "@stackframe/stack";

type Props = {
  avatarUrl: string;
  displayName: string;
};

export function AppUserActions({ avatarUrl, displayName }: Props) {
  const app = useStackApp();

  return (
    <div className="flex items-center gap-3">
      {/* Name */}
      <span className="hidden sm:inline text-xs text-orbit-muted max-w-[140px] truncate text-right">
        {displayName}
      </span>

      {/* Avatar -> profile */}
      <Link href="/app/profile" className="flex items-center">
        <img
          src={avatarUrl}
          alt="Profile"
          className="h-8 w-8 rounded-full object-cover border border-orbit-border hover:border-orbit-pink/70 transition"
        />
      </Link>

      {/* Back to landing – now a real BUTTON so it zooms */}
      <Link href="/" className="hidden sm:inline-flex">
        <button className="inline-flex items-center justify-center rounded-full border border-orbit-border px-4 py-2 text-sm text-orbit-muted hover:border-white/40 hover:text-white transition">
          Back to landing
        </button>
      </Link>

      {/* Log out (already a button, so it zooms) */}
      <button
        type="button"
        onClick={() => app.signOut()}
        className="inline-flex items-center justify-center rounded-full border border-orbit-border px-4 py-2 text-sm text-orbit-muted hover:border-red-400/70 hover:text-red-300 transition"
      >
        Log out
      </button>
    </div>
  );
}
