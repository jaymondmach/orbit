// src/lib/getOrCreateCurrentUser.ts
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

export async function getOrCreateCurrentUser() {
  // Redirects to login if not signed in
  const authUser = await stackServerApp.getUser({ or: "redirect" });

  // 👇 Adjust these to match your Stack user shape if needed
  const stackUserId = (authUser as any).userId ?? (authUser as any).id;
  const email =
    (authUser as any).email ??
    (authUser as any).primaryEmail ??
    (authUser as any).emailAddresses?.[0]?.emailAddress ??
    "";
  const name =
    (authUser as any).name ??
    (authUser as any).fullName ??
    (authUser as any).username ??
    null;
  const imageUrl =
    (authUser as any).imageUrl ?? (authUser as any).profileImageUrl ?? null;

  if (!stackUserId || !email) {
    throw new Error("Authenticated user is missing stackUserId or email");
  }

  let dbUser = await prisma.user.findUnique({
    where: { stackUserId },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        stackUserId,
        email,
        name,
        imageUrl,
      },
    });
  }

  return { authUser, dbUser };
}
