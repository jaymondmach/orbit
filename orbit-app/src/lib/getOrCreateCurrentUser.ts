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

export async function getOrCreateCurrentUser() {
  const authUser = await stackServerApp.getUser({ or: "redirect" });
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
    },
  });

  return { authUser, dbUser };
}
