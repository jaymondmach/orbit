// src/lib/getOrCreateCurrentUser.ts
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

type StackUserShape = {
  id: string;
  primaryEmail?: string | null;
  email?: string | null;
  emailAddress?: string | null;
  displayName?: string | null;
  username?: string | null;
  imageUrl?: string | null;
  profileImageUrl?: string | null;
};

type Mode = "redirect" | "throw";

/**
 * Get the current Stack user and ensure they exist in our DB.
 *
 * - mode="redirect": for server components/pages (can redirect to sign-in)
 * - mode="throw": for API routes (must NOT redirect; should return 401)
 */
export async function getOrCreateCurrentUser(mode: Mode = "redirect") {
  const authUser = await stackServerApp.getUser({
    or: mode === "redirect" ? "redirect" : "throw",
  });

  const stackUser = authUser as StackUserShape;

  const primaryEmail =
    stackUser.primaryEmail ??
    stackUser.email ??
    stackUser.emailAddress ??
    undefined;

  const existing = await prisma.user.findUnique({
    where: { stackUserId: stackUser.id },
  });

  if (existing) {
    return { authUser, dbUser: existing };
  }

  const dbUser = await prisma.user.create({
    data: {
      stackUserId: stackUser.id,
      email: primaryEmail ?? "unknown@example.com",
      name: stackUser.displayName ?? stackUser.username ?? null,
      imageUrl: stackUser.imageUrl ?? stackUser.profileImageUrl ?? null,
      // optional but nice to be explicit
      plan: "free",
    },
  });

  return { authUser, dbUser };
}
