// src/app/app/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/getOrCreateCurrentUser";
import Image from "next/image";

type AuthUserShape = {
  displayName?: string | null;
  primaryEmail?: string | null;
  email?: string | null;
  emailAddress?: string | null;
  imageUrl?: string | null;
  profileImageUrl?: string | null;
  username?: string | null;
};

export default async function AppHomePage() {
  const { authUser, dbUser } = await getOrCreateCurrentUser();
  const auth = authUser as AuthUserShape;

  const avatarUrl =
    dbUser.imageUrl ??
    auth.imageUrl ??
    auth.profileImageUrl ??
    "/defaultpfp.png";

  const displayName =
    dbUser.name ?? auth.displayName ?? auth.username ?? "Orbit user";

  // Load this user's plans + *only* the step fields we need (completedAt)
  const plans = await prisma.plan.findMany({
    where: { userId: dbUser.id },
    select: {
      id: true,
      title: true,
      goalInput: true,
      status: true,
      createdAt: true,
      stepProgresses: {
        select: {
          completedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalPlans = plans.length;
  const generatedPlans = plans.filter((p) => p.status === "ready").length;
  const draftingPlans = plans.filter((p) => p.status !== "ready").length;

  const totalCompletedSteps = plans.reduce((sum, plan) => {
    return (
      sum + plan.stepProgresses.filter((sp) => sp.completedAt !== null).length
    );
  }, 0);

  const lastPlan = plans[0] ?? null;

  return (
    <div className="space-y-8">
      {/* Top greeting & profile chip */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-orbit-muted">Welcome back,</p>
          <h1 className="text-2xl sm:text-3xl font-semibold">{displayName}</h1>
          <p className="text-sm sm:text-base text-orbit-muted max-w-xl">
            Orbit keeps your goals, plans, and weekly actions in one place.
            Start a new plan or pick up where you left off.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Image
            src={avatarUrl}
            alt="Profile"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover border border-orbit-border"
          />
          <div className="flex flex-col items-end">
            <span className="text-xs sm:text-sm text-orbit-muted">
              Signed in as
            </span>
            <span className="text-xs sm:text-sm font-medium">
              {auth.primaryEmail ??
                auth.email ??
                auth.emailAddress ??
                dbUser.email}
            </span>
            <Link
              href="/app/profile"
              className="mt-1 text-[11px] text-orbit-muted hover:text-white underline underline-offset-2"
            >
              Manage profile →
            </Link>
          </div>
        </div>
      </header>

      {/* Stats + quick actions */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="orbit-card rounded-3xl border border-orbit-border/70 p-4 sm:p-5 space-y-2">
          <p className="text-xs text-orbit-muted uppercase tracking-[0.16em]">
            Plans
          </p>
          <p className="text-2xl font-semibold">{totalPlans}</p>
          <p className="text-xs text-orbit-muted">
            {generatedPlans} generated, {draftingPlans} in progress.
          </p>
        </div>

        <div className="orbit-card rounded-3xl border border-orbit-border/70 p-4 sm:p-5 space-y-2">
          <p className="text-xs text-orbit-muted uppercase tracking-[0.16em]">
            Steps completed
          </p>
          <p className="text-2xl font-semibold">{totalCompletedSteps}</p>
          <p className="text-xs text-orbit-muted">
            Each completed step is a tiny orbit around your bigger goal.
          </p>
        </div>

        <div className="orbit-card rounded-3xl border border-orbit-border/70 p-4 sm:p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <p className="text-xs text-orbit-muted uppercase tracking-[0.16em]">
              Quick actions
            </p>
            <p className="text-xs text-orbit-muted">
              Jump into planning or adjust your defaults.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/app/plans"
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff6cab,#7366ff)] px-4 py-2 text-xs sm:text-sm font-semibold text-black hover:opacity-90 transition"
            >
              View all plans
            </Link>
            <Link
              href="/app/plans?q="
              className="inline-flex items-center justify-center rounded-full border border-orbit-border px-4 py-2 text-xs sm:text-sm text-orbit-muted hover:border-orbit-pink/70 hover:text-white transition"
            >
              Start a new plan
            </Link>
          </div>
        </div>
      </section>

      {/* Continue where you left off */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm sm:text-base font-semibold">
            Continue where you left off
          </h2>
          {lastPlan && (
            <Link
              href="/app/plans"
              className="text-[11px] sm:text-xs text-orbit-muted hover:text-white underline underline-offset-2"
            >
              See all plans
            </Link>
          )}
        </div>

        {lastPlan ? (
          <Link
            href={`/app/plans/${lastPlan.id}`}
            className="orbit-card block rounded-3xl border border-orbit-border/70 p-4 sm:p-5 hover:border-orbit-pink/70 transition"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-orbit-muted mb-1">
              {lastPlan.status === "ready"
                ? "Generated plan"
                : lastPlan.status === "generating"
                ? "Generating…"
                : "Draft"}
            </p>
            <h3 className="text-sm sm:text-base font-semibold mb-1">
              {lastPlan.title || "Untitled plan"}
            </h3>
            <p className="text-xs sm:text-sm text-orbit-muted line-clamp-3">
              {lastPlan.goalInput}
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-orbit-muted">
              <span>
                Created{" "}
                {lastPlan.createdAt.toLocaleDateString("en-CA", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}
              </span>
              <span>Open →</span>
            </div>
          </Link>
        ) : (
          <p className="text-xs sm:text-sm text-orbit-muted">
            You don&apos;t have any plans yet.{" "}
            <Link
              href="/app/plans"
              className="underline underline-offset-2 hover:text-white"
            >
              Start your first one →
            </Link>
          </p>
        )}
      </section>

      {/* Recent plans list (top 3) */}
      {plans.length > 1 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm sm:text-base font-semibold">Recent plans</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.slice(0, 3).map((plan) => (
              <Link
                key={plan.id}
                href={`/app/plans/${plan.id}`}
                className="orbit-card group p-4 sm:p-5 rounded-2xl border border-orbit-border/70 hover:border-orbit-pink/70 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-orbit-muted">
                    {plan.status === "ready"
                      ? "Generated plan"
                      : plan.status === "generating"
                      ? "Generating…"
                      : "Draft"}
                  </p>
                  <h3 className="text-sm sm:text-base font-semibold line-clamp-2">
                    {plan.title || "Untitled plan"}
                  </h3>
                  <p className="text-xs sm:text-sm text-orbit-muted line-clamp-3">
                    {plan.goalInput}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-orbit-muted">
                  <span>
                    Created{" "}
                    {plan.createdAt.toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </span>
                  <span>Open →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
