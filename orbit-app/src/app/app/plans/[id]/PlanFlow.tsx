// src/app/app/plans/[id]/PlanFlow.tsx
"use client";

import { useMemo } from "react";

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

type FlowStep = {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  details?: string[];
};

function planToSteps(plan: GeneratedPlan): FlowStep[] {
  // Prefer weeklyRhythm → then milestones → then startingSteps fallback
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

  // Fallback if AI ever returns something weird
  return [
    {
      id: "fallback",
      title: "Your plan is ready",
      subtitle: "Try regenerating if this looks empty.",
      details: [],
    },
  ];
}

export function PlanFlow({ plan }: { plan: GeneratedPlan }) {
  const steps = useMemo(() => planToSteps(plan), [plan]);

  return (
    <section className="orbit-card p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-semibold">
            Your Orbit blueprint
          </h2>
          <p className="mt-1 text-[11px] sm:text-xs text-orbit-muted max-w-xl">
            Follow these blocks from left to right. Each block is a concrete
            step in your plan – Orbit sized it to your timeframe and intensity.
          </p>
        </div>
      </div>

      {/* Summary */}
      {plan.summary && (
        <p className="text-xs sm:text-sm text-orbit-muted leading-relaxed border border-orbit-border/70 rounded-2xl bg-black/40 px-3 py-2">
          {plan.summary}
        </p>
      )}

      {/* Flow blocks */}
      <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-stretch md:overflow-x-auto md:pb-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-stretch md:min-w-[230px] md:max-w-[260px]"
          >
            {/* Block */}
            <div
              className="
                group relative flex-1 rounded-2xl border border-orbit-border/70
                bg-[radial-gradient(circle_at_top,#252133,#050308_55%)]
                px-3 py-3 sm:px-4 sm:py-4
                text-xs sm:text-[13px]
                shadow-[0_0_0_1px_rgba(255,255,255,0.02)]
                transition
                hover:-translate-y-1 hover:border-orbit-pink/70
                hover:shadow-[0_0_40px_rgba(255,108,171,0.35)]
              "
            >
              {/* Glow accent */}
              <div className="pointer-events-none absolute inset-x-6 -top-1 h-0.5 rounded-full bg-[radial-gradient(circle,#ff6cab,transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wide text-orbit-muted/70">
                    Step {index + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold">
                    {step.title}
                  </span>
                </div>
                {step.badge && (
                  <span className="inline-flex items-center rounded-full border border-orbit-border/80 bg-black/60 px-2 py-0.5 text-[10px] text-orbit-muted">
                    {step.badge}
                  </span>
                )}
              </div>

              {step.subtitle && (
                <p className="mb-2 text-[11px] text-orbit-muted">
                  {step.subtitle}
                </p>
              )}

              {step.details && step.details.length > 0 && (
                <ul className="space-y-1 text-[11px] text-orbit-muted">
                  {step.details.map((d, i) => (
                    <li className="flex gap-2" key={i}>
                      <span className="mt-[3px] h-1 w-1 flex-shrink-0 rounded-full bg-orbit-pink/70" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Arrow connector (desktop) */}
            {index < steps.length - 1 && (
              <div className="hidden md:flex items-center mx-2">
                <div className="relative h-px w-10 bg-gradient-to-r from-orbit-border/30 to-orbit-pink/80">
                  {/* little arrow head */}
                  <span
                    className="
                      absolute -right-1 top-1/2 h-2 w-2
                      -translate-y-1/2 rotate-45
                      border-r border-t border-orbit-pink/80
                    "
                  />
                  {/* subtle motion highlight */}
                  <span
                    className="
                      absolute left-0 top-1/2 h-1 w-3 -translate-y-1/2
                      rounded-full bg-orbit-pink/70 opacity-60
                      animate-pulse
                    "
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Obstacles & notes footer */}
      {(plan.obstaclesAndSafeties?.length ?? 0) > 0 || plan.notes ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {plan.obstaclesAndSafeties?.length > 0 && (
            <div className="rounded-2xl border border-orbit-border/70 bg-black/40 px-3 py-3">
              <h3 className="mb-1 text-[11px] font-semibold text-orbit-muted/90">
                Obstacles & safeties
              </h3>
              <ul className="space-y-1.5 text-[11px] text-orbit-muted">
                {plan.obstaclesAndSafeties.map((o, i) => (
                  <li key={i}>
                    <span className="font-semibold">{o.obstacle}: </span>
                    <span>{o.workaround}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {plan.notes && (
            <div className="rounded-2xl border border-orbit-border/70 bg-black/40 px-3 py-3">
              <h3 className="mb-1 text-[11px] font-semibold text-orbit-muted/90">
                Notes from Orbit
              </h3>
              <p className="text-[11px] text-orbit-muted leading-relaxed">
                {plan.notes}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
