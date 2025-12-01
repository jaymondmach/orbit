// src/app/app/plans/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GeneratePlanButton } from "./GeneratePlanButton";
import { PlanStepFlow, type FlowStep } from "./PlanStepFlow";
import { getOrCreateCurrentUser } from "@/lib/getOrCreateCurrentUser";

type PlanRouteParams = {
  id: string;
};

// Mirror the shape from your API route
type GeneratedPlan = {
  summary: string;
  milestones: {
    label: string;
    description: string;
    targetWeek: number;
  }[];
  weeklyRhythm: {
    week: number;
    focus: string;
    actions: string[];
  }[];
  startingSteps: string[];
  obstaclesAndSafeties: {
    obstacle: string;
    workaround: string;
  }[];
  notes: string;
};

function planToSteps(plan: GeneratedPlan): FlowStep[] {
  if (plan.weeklyRhythm && plan.weeklyRhythm.length > 0) {
    return plan.weeklyRhythm.map((w) => ({
      id: `week-${w.week}`,
      title: `Week ${w.week}`,
      subtitle: w.focus,
      badge: "Weekly focus",
      details: w.actions,
    }));
  }

  if (plan.milestones && plan.milestones.length > 0) {
    return plan.milestones.map((m, i) => ({
      id: `milestone-${i}`,
      title: m.label,
      subtitle: `Target: week ${m.targetWeek}`,
      badge: "Milestone",
      details: [m.description],
    }));
  }

  if (plan.startingSteps && plan.startingSteps.length > 0) {
    return plan.startingSteps.map((s, i) => ({
      id: `start-${i}`,
      title: `Step ${i + 1}`,
      badge: "Starting step",
      details: [s],
    }));
  }

  return [
    {
      id: "fallback",
      title: "Your plan is ready",
      subtitle: "Try regenerating if this looks empty.",
      details: [],
    },
  ];
}

// Identity badge: emoji + gradient based on goal text
function getPlanIdentity(goalInput: string) {
  const g = goalInput.toLowerCase();

  if (g.match(/gym|workout|weight|muscle|fitness|health|run|running|cardio/)) {
    return {
      emoji: "🏋️",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#34d399,#059669_60%,#022c22)]",
    };
  }

  if (g.match(/money|save|savings|debt|budget|invest|investment|tfsa|rrsp/)) {
    return {
      emoji: "💰",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#facc15,#eab308_60%,#451a03)]",
    };
  }

  if (g.match(/job|career|promotion|interview|resume|network/)) {
    return {
      emoji: "💼",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#38bdf8,#0ea5e9_60%,#022c44)]",
    };
  }

  if (
    g.match(
      /code|coding|programming|next\.js|react|saas|app|project|developer|dev/
    )
  ) {
    return {
      emoji: "💻",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#a855f7,#6366f1_60%,#020617)]",
    };
  }

  if (g.match(/school|study|exam|finals|assignment|grade|university|college/)) {
    return {
      emoji: "📚",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#f97316,#fb923c_60%,#3b0a0a)]",
    };
  }

  if (g.match(/sleep|routine|habit|habits|productivity|focus|burnout/)) {
    return {
      emoji: "🌙",
      badgeClass:
        "bg-[radial-gradient(circle_at_top,#4f46e5,#22d3ee_60%,#020617)]",
    };
  }

  return {
    emoji: "🎯",
    badgeClass:
      "bg-[radial-gradient(circle_at_top,#ff6cab,#7366ff_60%,#050308)]",
  };
}

async function updatePlan(formData: FormData) {
  "use server";

  const { dbUser } = await getOrCreateCurrentUser();

  const id = (formData.get("planId") as string | null) ?? null;
  if (!id) throw new Error("Missing plan id");

  const rawTitle = (formData.get("title") as string | null) ?? "";
  const rawGoal = (formData.get("goalInput") as string | null) ?? "";
  const rawTimeframe = (formData.get("timeframeWeeks") as string | null) ?? "";
  const rawIntensity = (formData.get("intensity") as string | null) ?? "";

  const goalInput = rawGoal.trim();
  if (!goalInput) throw new Error("Goal description is required.");

  const title =
    rawTitle.trim().length > 0
      ? rawTitle.trim()
      : goalInput.slice(0, 60) + (goalInput.length > 60 ? "…" : "");

  const timeframeWeeks = Number.parseInt(rawTimeframe || "12", 10) || 12;

  const intensity =
    rawIntensity === "gentle" ||
    rawIntensity === "steady" ||
    rawIntensity === "intense"
      ? rawIntensity
      : "steady";

  // Ensure the plan belongs to this DB user
  const existing = await prisma.plan.findFirst({
    where: { id, userId: dbUser.id },
  });

  if (!existing) {
    throw new Error("Plan not found for this user.");
  }

  await prisma.plan.update({
    where: { id },
    data: {
      title,
      goalInput,
      timeframeWeeks,
      intensity,
    },
  });

  revalidatePath(`/app/plans/${id}`);
  revalidatePath("/app/plans");
}

export default async function PlanPage(props: unknown) {
  // Narrow props locally so we still have types in the file
  const { params } = props as { params: PlanRouteParams };

  const { dbUser } = await getOrCreateCurrentUser();

  const plan = await prisma.plan.findFirst({
    where: {
      id: params.id,
      userId: dbUser.id,
    },
    include: {
      stepProgresses: true,
    },
  });

  if (!plan) notFound();

  const hasOutput = Boolean(plan.outputJson);
  const generatedPlan = (plan.outputJson ?? null) as GeneratedPlan | null;
  const steps = generatedPlan ? planToSteps(generatedPlan) : [];
  const identity = getPlanIdentity(plan.goalInput);

  const initialCompletedIndices =
    plan.stepProgresses
      ?.filter((p) => p.completedAt !== null)
      .map((p) => p.stepIndex) ?? [];

  const totalWeeksFromAI =
    generatedPlan?.weeklyRhythm?.[generatedPlan.weeklyRhythm.length - 1]
      ?.week ?? null;
  const totalWeeks =
    plan.timeframeWeeks || totalWeeksFromAI || Math.max(steps.length, 4);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold">
            Edit plan details
          </h1>

          <p className="text-sm sm:text-base text-orbit-muted max-w-xl">
            Update the goal, timeline, and intensity. Orbit uses this
            information to generate your personalized step-by-step blueprint.
          </p>

          <div className="flex flex-wrap items-center gap-2 text-sm text-orbit-muted">
            <span className="inline-flex items-center rounded-full border border-orbit-border px-3 py-1">
              Created:{" "}
              {plan.createdAt.toLocaleDateString("en-CA", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}
            </span>
            <span className="inline-flex items-center rounded-full border border-orbit-border px-3 py-1">
              Status: {plan.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <GeneratePlanButton
            planId={plan.id}
            initialStatus={plan.status}
            hasOutput={hasOutput}
          />

          <Link
            href="/app/plans"
            className="text-sm text-orbit-muted hover:text-white underline underline-offset-4"
          >
            ← Back to all plans
          </Link>
        </div>
      </div>

      {/* Edit Form */}
      <form action={updatePlan} className="orbit-card p-6 sm:p-8 space-y-6">
        <input type="hidden" name="planId" value={plan.id} />

        {/* Title */}
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm font-medium text-orbit-muted"
          >
            Plan title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={plan.title}
            placeholder="e.g. Get fitter in 12 weeks"
            className="w-full rounded-xl border border-orbit-border bg-black/60 px-4 py-3 text-base outline-none focus:border-orbit-pink/70"
          />
        </div>

        {/* Goal */}
        <div className="space-y-2">
          <label
            htmlFor="goalInput"
            className="text-sm font-medium text-orbit-muted"
          >
            What do you want to accomplish?
          </label>
          <textarea
            id="goalInput"
            name="goalInput"
            required
            rows={5}
            defaultValue={plan.goalInput}
            className="w-full rounded-xl border border-orbit-border bg-black/60 px-4 py-3 text-base outline-none focus:border-orbit-pink/70 resize-none"
          />
        </div>

        {/* Timeframe + Intensity */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="timeframeWeeks"
              className="text-sm font-medium text-orbit-muted"
            >
              Rough timeframe
            </label>

            <select
              id="timeframeWeeks"
              name="timeframeWeeks"
              defaultValue={String(plan.timeframeWeeks)}
              className="
                w-full rounded-xl border border-orbit-border bg-black/60
                px-4 py-3 text-base outline-none focus:border-orbit-pink/70
                appearance-none pr-10
              "
            >
              <option value="4">About 1 month</option>
              <option value="8">About 2 months</option>
              <option value="12">About 3 months</option>
              <option value="24">About 6 months</option>
              <option value="52">About 1 year</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="intensity"
              className="text-sm font-medium text-orbit-muted"
            >
              How intense should this be?
            </label>

            <select
              id="intensity"
              name="intensity"
              defaultValue={plan.intensity}
              className="
                w-full rounded-xl border border-orbit-border bg-black/60
                px-4 py-3 text-base outline-none focus:border-orbit-pink/70
                appearance-none pr-10
              "
            >
              <option value="gentle">Gentle – low pressure</option>
              <option value="steady">Steady – balanced</option>
              <option value="intense">Intense – fast results</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-sm text-orbit-muted max-w-xs">
            Changes save automatically so you can refine your goals over time.
          </p>

          <div className="flex gap-3">
            <Link
              href="/app/plans"
              className="inline-flex items-center justify-center rounded-full border border-orbit-border px-5 py-2 text-base text-orbit-muted hover:border-white/40 hover:text-white transition"
            >
              Back
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff6cab,#7366ff)] px-6 py-3 text-base font-semibold text-black hover:opacity-90 transition"
            >
              Save
            </button>
          </div>
        </div>
      </form>

      {/* Generated Plan */}
      {generatedPlan && (
        <section className="orbit-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`h-14 w-14 sm:h-16 sm:w-16 rounded-3xl ${identity.badgeClass} flex items-center justify-center text-2xl sm:text-3xl shadow-[0_0_30px_rgba(255,108,171,0.5)]`}
              >
                <span>{identity.emoji}</span>
              </div>
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Your Orbit blueprint
                </h2>
                <p className="text-sm sm:text-base text-orbit-muted max-w-xl">
                  Built from your goal, timeframe, and intensity. Follow the
                  blocks from top to bottom.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 text-sm text-orbit-muted">
              <span>Timeframe: ~{totalWeeks} weeks</span>
              <span>Intensity: {plan.intensity}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative h-2 w-full rounded-full bg-orbit-border/40 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,108,171,0.4),transparent)] animate-[pulse_2s_ease-in-out_infinite]" />
              {generatedPlan.milestones?.map((m, idx) => {
                const clampedWeek = Math.max(
                  1,
                  Math.min(totalWeeks, m.targetWeek || 1)
                );
                const left =
                  ((clampedWeek - 1) / Math.max(totalWeeks - 1, 1)) * 100;

                return (
                  <div
                    key={idx}
                    className="absolute -top-1 h-4 w-[2px] bg-orbit-pink"
                    style={{ left: `${left}%` }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-orbit-muted">
              <span>Week 1</span>
              <span>Week {totalWeeks}</span>
            </div>
          </div>

          {generatedPlan.summary && (
            <p className="text-base text-orbit-muted leading-relaxed border border-orbit-border/70 rounded-2xl bg-black/40 px-5 py-4">
              {generatedPlan.summary}
            </p>
          )}

          <PlanStepFlow
            planId={plan.id}
            steps={steps}
            initialCompletedIndices={initialCompletedIndices}
          />

          {(generatedPlan.obstaclesAndSafeties?.length ?? 0) > 0 ||
          generatedPlan.notes ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {generatedPlan.obstaclesAndSafeties?.length > 0 && (
                <div className="rounded-2xl border border-orbit-border/70 bg-black/40 px-5 py-4">
                  <h3 className="text-base font-semibold mb-2">
                    Obstacles & Safeties
                  </h3>
                  <ul className="space-y-2 text-sm sm:text-base text-orbit-muted">
                    {generatedPlan.obstaclesAndSafeties.map((o, i) => (
                      <li key={i}>
                        <strong>{o.obstacle}: </strong>
                        {o.workaround}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {generatedPlan.notes && (
                <div className="rounded-2xl border border-orbit-border/70 bg-black/40 px-5 py-4">
                  <h3 className="text-base font-semibold mb-2">
                    Notes from Orbit
                  </h3>
                  <p className="text-sm sm:text-base text-orbit-muted leading-relaxed">
                    {generatedPlan.notes}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
