// src/app/app/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { getOrCreateCurrentUser } from "@/lib/getOrCreateCurrentUser";
import { AppUserActions } from "@/components/AppUserActions";
import { AppNavAnimate } from "@/components/AppNavAnimate";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { authUser, dbUser } = await getOrCreateCurrentUser();
  const auth = authUser as any;

  const displayName =
    dbUser.name ?? auth.displayName ?? auth.primaryEmail ?? "Orbit user";

  const avatarUrl =
    dbUser.imageUrl ?? auth.profileImageUrl ?? "/defaultpfp.png";

  return (
    <div className="min-h-screen text-orbit-text">
      <AppNavAnimate />

      <header>
        <div
          className="orbit-container flex h-24 items-center justify-between"
          data-animate
        >
          {/* Left: logo (same as landing) */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <Image
                  src="/orbit-high-res-transparent.png"
                  alt="Orbit"
                  width={160}
                  height={160}
                  priority
                  className="w-auto h-8 sm:h-10"
                />
              </div>
            </Link>
          </div>

          {/* Center nav – use BUTTONS so global hover applies */}
          <nav className="hidden md:flex items-center gap-10 text-md text-orbit-muted">
            <Link href="/app">
              <button className="hover:text-white transition">Dashboard</button>
            </Link>
            <Link href="/app/plans">
              <button className="hover:text-white transition">Plans</button>
            </Link>
            <Link href="/app/profile">
              <button className="hover:text-white transition">Profile</button>
            </Link>
          </nav>

          {/* Right side: name + avatar + back + logout */}
          <AppUserActions avatarUrl={avatarUrl} displayName={displayName} />
        </div>
      </header>

      <main className="orbit-container py-10 sm:py-14 lg:py-16 space-y-12">
        {children}
      </main>
    </div>
  );
}
