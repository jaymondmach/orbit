// src/app/app/plans/new/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function createPlan(formData: FormData) {
  "use server";

  const rawTitle = (formData.get("title") as string | null) ?? "";
  const rawGoal = (formData.get("goalInput") as string | null) ?? "";
  const rawTimeframe = (formData.get("timeframeWeeks") as string | null) ?? "";
  const rawIntensity = (formData.get("intensity") as string | null) ?? "";

  const goalInput = rawGoal.trim();
  if (!goalInput) {
    throw new Error("Goal description is required.");
  }

  const title =
    rawTitle.trim().length > 0
      ? rawTitle.trim()
      : goalInput.slice(0, 60) + (goalInput.length > 60 ? "…" : "");

  const timeframeWeeks = Number.parseInt(rawTimeframe || "12", 10);
  const safeTimeframe =
    Number.isNaN(timeframeWeeks) || timeframeWeeks <= 0 ? 12 : timeframeWeeks;

  const intensity =
    rawIntensity === "gentle" ||
    rawIntensity === "steady" ||
    rawIntensity === "intense"
      ? rawIntensity
      : "steady";

  const newPlan = await prisma.plan.create({
    data: {
      title,
      goalInput,
      timeframeWeeks: safeTimeframe,
      intensity,
      status: "draft",
    },
  });

  // Go straight to the plan detail page
  redirect(`/app/plans/${newPlan.id}`);
}

export default function NewPlanPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold">
            Start a new plan
          </h1>
          <p className="text-xs sm:text-sm text-orbit-muted max-w-xl">
            Tell Orbit what you want to work on. Keep it casual—write like you
            would text a friend. Orbit will turn this into a structured plan
            later.
          </p>
        </div>

        <Link
          href="/app/plans"
          className="text-xs sm:text-sm text-orbit-muted hover:text-white underline underline-offset-4"
        >
          ← Back to your plans
        </Link>
      </div>

      {/* Form card */}
      <form action={createPlan} className="orbit-card p-5 sm:p-6 space-y-5">
        {/* Title (optional) */}
        <div className="space-y-1.5">
          <label
            htmlFor="title"
            className="text-xs font-medium text-orbit-muted"
          >
            Plan title{" "}
            <span className="font-normal text-[11px] text-orbit-muted/80">
              (optional)
            </span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g. Get fitter in 12 weeks, Save $5k this year"
            className="w-full rounded-xl border border-orbit-border bg-black/60 px-3 py-2 text-sm outline-none focus:border-orbit-pink/70"
          />
          <p className="text-[11px] text-orbit-muted">
            If you leave this blank, Orbit will create a title from your goal
            description.
          </p>
        </div>

        {/* Goal description */}
        <div className="space-y-1.5">
          <label
            htmlFor="goalInput"
            className="text-xs font-medium text-orbit-muted"
          >
            What do you want to work on?
          </label>
          <textarea
            id="goalInput"
            name="goalInput"
            required
            rows={5}
            placeholder={`Write like you normally would. For example:

"I want to feel better in my body, lose a bit of weight, and not be tired all the time over the next 3–4 months."

"I want to save around $5,000 this year without feeling miserable or cutting out everything fun."`}
            className="w-full rounded-xl border border-orbit-border bg-black/60 px-3 py-2 text-sm outline-none focus:border-orbit-pink/70 resize-none"
          />
        </div>

        {/* Timeframe + intensity */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Timeframe */}
          <div className="space-y-1.5">
            <label
              htmlFor="timeframeWeeks"
              className="text-xs font-medium text-orbit-muted"
            >
              Rough timeframe
            </label>

            <div className="relative">
              <select
                id="timeframeWeeks"
                name="timeframeWeeks"
                defaultValue="12"
                className="
          w-full rounded-xl border border-orbit-border bg-black/60
          px-3 py-2 text-sm outline-none focus:border-orbit-pink/70
          appearance-none pr-10
        "
              >
                <option value="4">About 1 month</option>
                <option value="8">About 2 months</option>
                <option value="12">About 3 months</option>
                <option value="24">About 6 months</option>
                <option value="52">About 1 year</option>
              </select>

              {/* Custom arrow */}
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  className="h-4 w-4 text-orbit-muted"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <p className="text-[11px] text-orbit-muted">
              This doesn&apos;t have to be perfect—Orbit just uses it to size
              the plan.
            </p>
          </div>

          {/* Intensity */}
          <div className="space-y-1.5">
            <label
              htmlFor="intensity"
              className="text-xs font-medium text-orbit-muted"
            >
              How intense should this be?
            </label>

            <div className="relative">
              <select
                id="intensity"
                name="intensity"
                defaultValue="steady"
                className="
          w-full rounded-xl border border-orbit-border bg-black/60
          px-3 py-2 text-sm outline-none focus:border-orbit-pink/70
          appearance-none pr-10
        "
              >
                <option value="gentle">Gentle – low pressure</option>
                <option value="steady">Steady – realistic pace</option>
                <option value="intense">Intense – big push</option>
              </select>

              {/* Custom arrow */}
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  className="h-4 w-4 text-orbit-muted"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <p className="text-[11px] text-orbit-muted">
              You can change this later; it just tells Orbit how aggressive to
              be with actions.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-orbit-muted max-w-xs">
            This first version just saves your plan details. We&apos;ll hook it
            up to AI so Orbit can generate the full roadmap next.
          </p>

          <div className="flex gap-2">
            <Link
              href="/app/plans"
              className="inline-flex items-center justify-center rounded-full border border-orbit-border px-4 py-2 text-xs sm:text-sm text-orbit-muted hover:border-white/40 hover:text-white transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff6cab,#7366ff)] px-5 py-2 text-xs sm:text-sm font-semibold text-black hover:opacity-90 transition"
            >
              Save plan
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
