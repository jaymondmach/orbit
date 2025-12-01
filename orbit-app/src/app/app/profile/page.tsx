// src/app/app/profile/page.tsx
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrCreateCurrentUser } from "@/lib/getOrCreateCurrentUser";

async function updateProfile(formData: FormData) {
  "use server";

  const { dbUser } = await getOrCreateCurrentUser();

  const name = (formData.get("name") as string | null)?.trim() || null;

  const usernameRaw = (formData.get("username") as string | null)?.trim();
  const username = usernameRaw ? usernameRaw.toLowerCase() : null;

  const headline = (formData.get("headline") as string | null)?.trim() || null;
  const bio = (formData.get("bio") as string | null)?.trim() || null;
  const timezone = (formData.get("timezone") as string | null)?.trim() || null;

  const imageUrl = (formData.get("imageUrl") as string | null)?.trim() || null;

  const defaultIntensity =
    (formData.get("defaultIntensity") as string | null) || null;

  const defaultWeeksRaw = (formData.get("defaultWeeks") as string | null) ?? "";
  const defaultWeeks =
    defaultWeeksRaw.trim().length > 0
      ? Number.parseInt(defaultWeeksRaw, 10) || null
      : null;

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      name,
      username,
      headline,
      bio,
      timezone,
      imageUrl,
      defaultIntensity,
      defaultWeeks,
    },
  });

  // So the page sees the latest values
  revalidatePath("/app/profile");
  revalidatePath("/app/plans");
  revalidatePath("/app");
}

type AuthUserShape = {
  displayName?: string | null;
  primaryEmail?: string | null;
  username?: string | null;
  imageUrl?: string | null;
  profileImageUrl?: string | null;
  email?: string | null;
  emailAddress?: string | null;
};

export default async function ProfilePage() {
  const { authUser, dbUser } = await getOrCreateCurrentUser();
  const auth = authUser as AuthUserShape;

  const displayEmail =
    auth.primaryEmail || auth.email || auth.emailAddress || dbUser.email || "";

  const displayName = dbUser.name ?? auth.displayName ?? "Orbit user";

  // ✅ Avatar priority: DB → auth → defaultpfp.png
  const avatarUrl =
    dbUser.imageUrl ?? auth.profileImageUrl ?? "/defaultpfp.png";

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Profile</h1>
          <p className="text-sm sm:text-base text-orbit-muted max-w-xl">
            Manage how Orbit knows you and set your default planning
            preferences.
          </p>
        </div>
      </header>

      <form action={updateProfile} className="space-y-6">
        {/* Account card */}
        <section className="orbit-card rounded-3xl border border-orbit-border/70 p-5 sm:p-6 space-y-4">
          <h2 className="text-sm sm:text-base font-semibold">Account</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 text-sm">
              <p className="text-orbit-muted">Email</p>
              <p className="font-medium">{displayEmail}</p>
            </div>

            <div className="space-y-1 text-sm">
              <p className="text-orbit-muted">Orbit user since</p>
              <p className="font-medium">
                {dbUser.createdAt.toLocaleDateString("en-CA", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}
              </p>
            </div>
          </div>

          <p className="text-xs text-orbit-muted">
            Your login is managed by Stack. To change your email or password,
            use the account settings in the auth popup.
          </p>
        </section>

        {/* Profile & identity */}
        <section className="orbit-card rounded-3xl border border-orbit-border/70 p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm sm:text-base font-semibold">
              Profile &amp; identity
            </h2>
          </div>

          {/* Avatar row */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden border border-orbit-border">
                <Image
                  src={avatarUrl}
                  alt="Profile picture"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{displayName}</p>
                <p className="text-orbit-muted">
                  This picture is used across your plans and dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Display name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-xs sm:text-sm font-medium text-orbit-muted"
              >
                Display name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={dbUser.name ?? auth.displayName ?? ""}
                placeholder="How Orbit should address you"
                className="w-full rounded-xl border border-orbit-border bg-black/60 px-4 py-2.5 text-sm sm:text-base outline-none focus:border-orbit-pink/70"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-xs sm:text-sm font-medium text-orbit-muted"
              >
                Username (optional)
              </label>
              <input
                id="username"
                name="username"
                type="text"
                defaultValue={dbUser.username ?? ""}
                placeholder="username"
                className="w-full rounded-xl border border-orbit-border bg-black/60 px-4 py-2.5 text-sm sm:text-base outline-none focus:border-orbit-pink/70"
              />
              <p className="text-[11px] text-orbit-muted">
                Usernames are lowercase and must be unique.
              </p>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <label
              htmlFor="headline"
              className="text-xs sm:text-sm font-medium text-orbit-muted"
            >
              Headline
            </label>
            <input
              id="headline"
              name="headline"
              type="text"
              defaultValue={dbUser.headline ?? ""}
              placeholder="e.g. 'Student & early-stage founder' or 'Full-stack dev focusing on SaaS.'"
              className="w-full rounded-xl border border-orbit-border bg-black/60 px-4 py-2.5 text-sm sm:text-base outline-none focus:border-orbit-pink/70"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label
              htmlFor="bio"
              className="text-xs sm:text-sm font-medium text-orbit-muted"
            >
              Short bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={dbUser.bio ?? ""}
              placeholder="Tell Orbit a bit about your background, goals, or what you're working on."
              className="w-full rounded-xl border border-orbit-border bg-black/60 px-4 py-3 text-sm sm:text-base outline-none focus:border-orbit-pink/70 resize-none"
            />
          </div>

          {/* Custom avatar URL */}
          <div className="space-y-2">
            <label
              htmlFor="imageUrl"
              className="text-xs sm:text-sm font-medium text-orbit-muted"
            >
              Custom avatar URL (optional)
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              defaultValue={dbUser.imageUrl ?? ""}
              placeholder="https://example.com/your-avatar.png"
              className="w-full rounded-xl border border-orbit-border bg-black/60 px-4 py-2.5 text-sm sm:text-base outline-none focus:border-orbit-pink/70"
            />
            <p className="text-[11px] text-orbit-muted">
              If provided, Orbit will use this instead of your auth
              provider&apos;s picture or the default avatar.
            </p>
          </div>
        </section>

        {/* Preferences */}
        <section className="orbit-card rounded-3xl border border-orbit-border/70 p-5 sm:p-6 space-y-5">
          <h2 className="text-sm sm:text-base font-semibold">
            Planning preferences
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Default intensity */}
            <div className="space-y-2">
              <label
                htmlFor="defaultIntensity"
                className="text-xs sm:text-sm font-medium text-orbit-muted"
              >
                Default intensity
              </label>
              <select
                id="defaultIntensity"
                name="defaultIntensity"
                defaultValue={dbUser.defaultIntensity ?? "steady"}
                className="w-full rounded-xl border border-orbit-border bg-black/60 px-4 py-2.5 text-sm sm:text-base outline-none focus:border-orbit-pink/70"
              >
                <option value="">No default</option>
                <option value="gentle">Gentle – low pressure</option>
                <option value="steady">Steady – balanced</option>
                <option value="intense">Intense – fast results</option>
              </select>
            </div>

            {/* Default weeks */}
            <div className="space-y-2">
              <label
                htmlFor="defaultWeeks"
                className="text-xs sm:text-sm font-medium text-orbit-muted"
              >
                Default timeframe (weeks)
              </label>
              <input
                id="defaultWeeks"
                name="defaultWeeks"
                type="number"
                min={1}
                max={104}
                defaultValue={dbUser.defaultWeeks ?? 12}
                className="w-full rounded-xl border border-orbit-border bg-black/60 px-4 py-2.5 text-sm sm:text-base outline-none focus:border-orbit-pink/70"
              />
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <label
                htmlFor="timezone"
                className="text-xs sm:text-sm font-medium text-orbit-muted"
              >
                Timezone (optional)
              </label>
              <input
                id="timezone"
                name="timezone"
                type="text"
                defaultValue={dbUser.timezone ?? ""}
                placeholder="e.g. America/Vancouver"
                className="w-full rounded-xl border border-orbit-border bg-black/60 px-4 py-2.5 text-sm sm:text-base outline-none focus:border-orbit-pink/70"
              />
              <p className="text-[11px] text-orbit-muted">
                This will be used later for weekly reminders and calendar
                export.
              </p>
            </div>
          </div>
        </section>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff6cab,#7366ff)] px-6 py-2.5 text-sm sm:text-base font-semibold text-black hover:opacity-90 transition"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
