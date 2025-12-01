// src/app/app/plans/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrCreateCurrentUser } from "@/lib/getOrCreateCurrentUser";

// Match Next 15's generated PageProps, which expects `searchParams?: Promise<any>`
type PlansPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

async function createPlan(formData: FormData) {
  "use server";

  const { dbUser } = await getOrCreateCurrentUser();

  const rawGoal = (formData.get("goalInput") as string | null) ?? "";
  const goalInput =
    rawGoal.trim() || "I want to make progress on an important goal.";

  const rawTimeframe =
    (formData.get("timeframeWeeks") as string | null) ?? "12";
  const timeframeWeeks = Number.parseInt(rawTimeframe || "12", 10) || 12;

  const rawIntensity = (formData.get("intensity") as string | null) ?? "steady";
  const intensity =
    rawIntensity === "gentle" ||
    rawIntensity === "steady" ||
    rawIntensity === "intense"
      ? rawIntensity
      : "steady";

  const title =
    (formData.get("title") as string | null)?.trim() ||
    goalInput.slice(0, 60) + (goalInput.length > 60 ? "…" : "");

  const plan = await prisma.plan.create({
    data: {
      title,
      goalInput,
      timeframeWeeks,
      intensity,
      userId: dbUser.id,
      status: "draft",
    },
  });

  revalidatePath("/app/plans");
  redirect(`/app/plans/${plan.id}`);
}

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const { authUser, dbUser } = await getOrCreateCurrentUser();
  const user = authUser as {
    displayName?: string | null;
    primaryEmail?: string | null;
  };

  // `searchParams` is typed as a Promise, but `await` works whether it's actually a
  // promise or a plain object at runtime.
  const params = (await searchParams) ?? {};
  const q = (params.q ?? "").trim();

  const plans = await prisma.plan.findMany({
    where: {
      userId: dbUser.id,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { goalInput: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const defaultWeeks = dbUser.defaultWeeks ?? 12;
  const defaultIntensity = dbUser.defaultIntensity ?? "steady";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold">Your plans</h1>
          <p className="text-sm sm:text-base text-orbit-muted max-w-xl">
            Each plan is tied to your Orbit account. Start with a rough goal and
            let Orbit turn it into a step-by-step blueprint.
          </p>
        </div>

        <div className="text-xs sm:text-sm text-orbit-muted">
          Signed in as{" "}
          <span className="font-medium">
            {user.displayName ?? user.primaryEmail ?? "Orbit user"}
          </span>
        </div>
      </div>

      {/* New plan form */}
      <form
        action={createPlan}
        className="orbit-card p-5 sm:p-6 space-y-4 rounded-3xl border border-orbit-border/70"
      >
        <h2 className="text-sm sm:text-base font-semibold">Start a new plan</h2>

        <div className="space-y-2">
          <label
            htmlFor="goalInput"
            className="text-xs sm:text-sm font-medium text-orbit-muted"
          >
            What do you want Orbit to help with?
          </label>
          <textarea
            id="goalInput"
            name="goalInput"
            rows={3}
            placeholder='e.g. "I want to get fitter over the next 3 months while working full-time."'
            className="w-full rounded-xl border border-orbit-border bg-black/60 px-4 py-3 text-sm sm:text-base outline-none focus:border-orbit-pink/70 resize-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="timeframeWeeks"
              className="text-xs sm:text-sm font-medium text-orbit-muted"
            >
              Rough timeframe
            </label>
            <select
              id="timeframeWeeks"
              name="timeframeWeeks"
              defaultValue={String(defaultWeeks)}
              className="w-full rounded-xl border border-orbit-border bg-black/60 px-4 py-3 text-sm sm:text-base outline-none focus:border-orbit-pink/70"
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
              className="text-xs sm:text-sm font-medium text-orbit-muted"
            >
              How intense should this be?
            </label>
            <select
              id="intensity"
              name="intensity"
              defaultValue={defaultIntensity}
              className="w-full rounded-xl border border-orbit-border bg-black/60 px-4 py-3 text-sm sm:text-base outline-none focus:border-orbit-pink/70"
            >
              <option value="gentle">Gentle – low pressure</option>
              <option value="steady">Steady – balanced</option>
              <option value="intense">Intense – fast results</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff6cab,#7366ff)] px-6 py-2.5 text-sm sm:text-base font-semibold text-black hover:opacity-90 transition"
          >
            Create plan
          </button>
        </div>
      </form>

      {/* Existing plans */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm sm:text-base font-semibold">Existing plans</h2>
          <p className="text-xs sm:text-sm text-orbit-muted">
            {plans.length === 0
              ? "No plans yet. Start one above to see it here."
              : `${plans.length} plan${plans.length === 1 ? "" : "s"}.`}
          </p>
        </div>

        {plans.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
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
        )}
      </section>
    </div>
  );
}
