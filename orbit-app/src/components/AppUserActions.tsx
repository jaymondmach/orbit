// src/components/AppUserActions.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useStackApp } from "@stackframe/stack";

type Props = {
  avatarUrl?: string | null;
  displayName: string;
};

export function AppUserActions({ avatarUrl, displayName }: Props) {
  const app = useStackApp();

  // Always have something to show
  const safeAvatar =
    avatarUrl && avatarUrl.length > 0 ? avatarUrl : "/defaultpfp.png";

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {/* Name (small, truncated) */}
      <span className="hidden sm:inline text-xs text-orbit-muted max-w-[120px] truncate">
        {displayName}
      </span>

      {/* Avatar → Profile */}
      <Link href="/app/profile" className="shrink-0">
        <div
          className="
            h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-orbit-border
            bg-black/70 flex items-center justify-center overflow-hidden
            cursor-pointer hover:border-white/60 transition
          "
        >
          <Image
            key={safeAvatar} // forces refresh when URL changes
            src={safeAvatar}
            alt="Profile picture"
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        </div>
      </Link>

      {/* Back to landing */}
      <Link href="/" className="hidden sm:inline-flex">
        <button
          type="button"
          className="
            inline-flex items-center justify-center rounded-full
            border border-orbit-border px-3.5 py-1.5
            text-[11px] text-orbit-muted
            hover:border-white/40 hover:text-white transition
          "
        >
          Back to landing
        </button>
      </Link>

      {/* Log out */}
      <button
        type="button"
        onClick={() => app.signOut()}
        className="
          inline-flex items-center justify-center rounded-full
          border border-orbit-border px-3.5 py-1.5
          text-[11px] text-orbit-muted
          hover:border-red-400/70 hover:text-red-300 transition
        "
      >
        Log out
      </button>
    </div>
  );
}
