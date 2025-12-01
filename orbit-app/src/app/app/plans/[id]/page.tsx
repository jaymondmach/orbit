// src/app/app/plans/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type PageProps = {
  params: { id: string };
};

async function updatePlan(formData: FormData) {
  "use server";

  const id = (formData.get("planId") as string | null) ?? null;
  if (!id) {
    throw new Error("Missing plan id");
  }

  const rawTitle = (formData.get("title") as string | null) ?? "";
  const rawGoal = (formData.get("goalInput") as string | null) ?? "";
  const rawTimeframe = (formData.get("timeframeWeeks") as string | null) ?? "";
  const rawIntensity = (formData.get("intensity") as string | null) ?? "";

  const goalInput = rawGoal.trim();
  if (!goalInput) {
    // In a real app you’d surface this as a form error; for now, just bail.
    throw new Error("Goal description is required.");
  }

  const title =
    rawTitle.trim().length > 0
      ? rawTitle.trim()
      : goalInput.slice(0, 60) + (goalInput.length > 60 ? "…" : "");

  const timeframeWeeksParsed = Number.parseInt(rawTimeframe || "12", 10);
  const timeframeWeeks =
    Number.isNaN(timeframeWeeksParsed) || timeframeWeeksParsed <= 0
      ? 12
      : timeframeWeeksParsed;

  const intensity =
    rawIntensity === "gentle" ||
    rawIntensity === "steady" ||
    rawIntensity === "intense"
      ? rawIntensity
      : "steady";

  await prisma.plan.update({
    where: { id },
    data: {
      title,
      goalInput,
      timeframeWeeks,
      intensity,
    },
  });

  // Refresh both the detail page and the list page
  revalidatePath(`/app/plans/${id}`);
  revalidatePath("/app/plans");
}

export default async function PlanPage({ params }: PageProps) {
  const plan = await prisma.plan.findUnique({
    where: { id: params.id },
  });

  if (!plan) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold">
            Edit plan details
          </h1>
          <p className="text-xs sm:text-sm text-orbit-muted max-w-xl">
            Update the title, description, timeframe, or intensity. Orbit will
            use these details when generating or refining your plan.
          </p>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-orbit-muted">
            <span className="inline-flex items-center rounded-full border border-orbit-border px-2.5 py-0.5">
              Created:{" "}
              {plan.createdAt.toLocaleDateString("en-CA", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}
            </span>
            <span className="inline-flex items-center rounded-full border border-orbit-border px-2.5 py-0.5">
              Status: {plan.status}
            </span>
          </div>
        </div>

        <Link
          href="/app/plans"
          className="text-[11px] sm:text-xs text-orbit-muted hover:text-white underline underline-offset-4"
        >
          ← Back to all plans
        </Link>
      </div>

      {/* Edit form */}
      <form action={updatePlan} className="orbit-card p-5 sm:p-6 space-y-5">
        {/* hidden id */}
        <input type="hidden" name="planId" value={plan.id} />

        {/* Title */}
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
            defaultValue={plan.title}
            placeholder="e.g. Get fitter in 12 weeks, Save $5k this year"
            className="w-full rounded-xl border border-orbit-border bg-black/60 px-3 py-2 text-sm outline-none focus:border-orbit-pink/70"
          />
          <p className="text-[11px] text-orbit-muted">
            If you leave this blank, Orbit will use your goal description to
            create a short title.
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
            defaultValue={plan.goalInput}
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
                defaultValue={String(plan.timeframeWeeks)}
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
              Orbit just uses this to size the overall plan. It doesn&apos;t
              have to be exact.
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
                defaultValue={plan.intensity}
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
              You can switch this later if you want Orbit to go easier or
              harder.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-orbit-muted max-w-xs">
            Changes are saved to your database, so you can come back to this
            plan any time and keep refining it.
          </p>

          <div className="flex gap-2">
            <Link
              href="/app/plans"
              className="inline-flex items-center justify-center rounded-full border border-orbit-border px-4 py-2 text-xs sm:text-sm text-orbit-muted hover:border-white/40 hover:text-white transition"
            >
              Back to all plans
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff6cab,#7366ff)] px-5 py-2 text-xs sm:text-sm font-semibold text-black hover:opacity-90 transition"
            >
              Save changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
