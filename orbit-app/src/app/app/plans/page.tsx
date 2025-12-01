import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Plan } from "@prisma/client";

export default async function PlansPage() {
  const plans: Plan[] = await prisma.plan.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const hasPlans = plans.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold">Your plans</h1>
          <p className="text-xs sm:text-sm text-orbit-muted max-w-md">
            This is where your Orbit plans live. Create a new one whenever you
            have a goal you want a clear path for.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="rounded-full border border-orbit-border px-4 py-2 text-xs sm:text-sm text-orbit-muted hover:border-white/40 hover:text-white transition">
            Import example
          </button>
          <Link
            href="/app/plans/new"
            className="rounded-full bg-[linear-gradient(135deg,#ff6cab,#7366ff)] px-4 py-2 text-xs sm:text-sm font-semibold text-black hover:opacity-90 transition inline-flex items-center justify-center"
          >
            New plan
          </Link>
        </div>
      </div>

      {/* If there are plans, show them, otherwise show empty state */}
      {hasPlans ? (
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.id} className="orbit-card p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-orbit-muted">
                    Plan
                  </p>
                  <h2 className="text-sm sm:text-base font-semibold">
                    {plan.title || "Untitled plan"}
                  </h2>
                </div>
                <span className="rounded-full border border-orbit-border px-2.5 py-1 text-[10px] text-orbit-muted">
                  {plan.timeframeWeeks} weeks · {plan.intensity}
                </span>
              </div>

              <p className="text-xs text-orbit-muted leading-relaxed line-clamp-3">
                {plan.goalInput}
              </p>

              <div className="flex items-center justify-between text-[11px] text-orbit-muted">
                <span>
                  Created:{" "}
                  {plan.createdAt.toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </span>
                <Link
                  href={`/app/plans/${plan.id}`}
                  className="hover:text-white underline underline-offset-2"
                >
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="orbit-card p-6 sm:p-8 space-y-4">
          <h2 className="text-sm sm:text-base font-semibold">
            You don&apos;t have any plans yet
          </h2>
          <p className="text-xs sm:text-sm text-orbit-muted max-w-md">
            When you create a plan, Orbit will turn your goal and timeframe into
            something structured you can follow. For now, everything here is
            just waiting for your first idea.
          </p>
          <div>
            <Link
              href="/app/plans/new"
              className="rounded-full bg-[linear-gradient(135deg,#ff6cab,#7366ff)] px-4 py-2 text-xs sm:text-sm font-semibold text-black hover:opacity-90 transition inline-flex items-center justify-center"
            >
              New plan
            </Link>
          </div>
        </div>
      )}

      <p className="text-[11px] text-orbit-muted">
        Orbit is an early prototype. Plans you create here are saved in your
        database so you can revisit and edit them.
      </p>
    </div>
  );
}
