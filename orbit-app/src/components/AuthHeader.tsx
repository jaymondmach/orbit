"use client";

import Link from "next/link";
import { useUser, useStackApp, UserButton } from "@stackframe/stack";

export function AuthHeader() {
  const user = useUser();
  const app = useStackApp();

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-orbit-border bg-black/60">
      {/* Left: logo / app name */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <span className="text-sm font-semibold tracking-wide cursor-pointer">
            Orbit
          </span>
        </Link>
        {user && (
          <span className="text-xs text-orbit-muted">
            · Signed in as {user.displayName ?? user.primaryEmail}
          </span>
        )}
      </div>

      {/* Right: auth controls */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <UserButton />
            <button
              onClick={() => user.signOut()}
              className="text-xs text-orbit-muted hover:text-white transition"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => app.redirectToSignIn()}
              className="text-xs text-orbit-muted hover:text-white transition"
            >
              Sign in
            </button>
            <button
              onClick={() => app.redirectToSignUp()}
              className="rounded-full border border-orbit-border px-3 py-1 text-xs hover:border-white/50 hover:text-white transition"
            >
              Get started
            </button>
          </>
        )}
      </div>
    </header>
  );
}
