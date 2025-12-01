// src/app/app/plans/[id]/PlanStepFlow.tsx
"use client";

import { useMemo, useState, useTransition } from "react";

export type FlowStep = {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  details?: string[];
};

type Props = {
  planId: string;
  steps: FlowStep[];
  initialCompletedIndices: number[];
};

export function PlanStepFlow({
  planId,
  steps,
  initialCompletedIndices,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const [completed, setCompleted] = useState<Set<number>>(
    () => new Set(initialCompletedIndices)
  );

  const completion = useMemo(() => {
    if (!steps.length) return 0;
    return Math.round((completed.size / steps.length) * 100);
  }, [completed, steps.length]);

  function toggleLocal(stepIndex: number) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(stepIndex)) next.delete(stepIndex);
      else next.add(stepIndex);
      return next;
    });
  }

  async function toggleStep(stepIndex: number) {
    const currentlyCompleted = completed.has(stepIndex);
    const nextCompleted = !currentlyCompleted;

    // Optimistic update
    toggleLocal(stepIndex);

    try {
      await fetch("/api/plan-step-progress", {
        // ⬆️ NOTE: updated to new API route that writes to PlanStepProgress
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          stepIndex,
          completed: nextCompleted,
        }),
      });
    } catch (err) {
      console.error("Failed to update step progress:", err);
      // Revert on error
      toggleLocal(stepIndex);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Progress bar */}
      {steps.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-orbit-muted">
            <span>Progress</span>
            <span>
              {completed.size}/{steps.length} steps done
            </span>
          </div>

          <div className="relative h-2 w-full rounded-full bg-orbit-border/40 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#ff6cab,#7366ff)] transition-all duration-300"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      {steps.map((step, index) => {
        const isDone = completed.has(index);

        return (
          <div key={step.id} className="flex flex-col items-center">
            {/* Block */}
            <div
              className={`
                w-full rounded-3xl border px-6 py-6
                bg-[radial-gradient(circle_at_top,#252133,#050308_55%)]
                shadow-[0_0_0_1px_rgba(255,255,255,0.02)]
                transition
                ${isDone ? "border-emerald-400/80" : "border-orbit-border/80"}
                ${
                  isDone
                    ? "shadow-[0_0_40px_rgba(52,211,153,0.35)]"
                    : "hover:border-orbit-pink/70 hover:shadow-[0_0_50px_rgba(255,108,171,0.35)]"
                }
              `}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-orbit-muted/70">
                    Step {index + 1}
                  </p>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  {step.subtitle && (
                    <p className="text-sm text-orbit-muted">{step.subtitle}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  {step.badge && (
                    <span className="text-xs border border-orbit-border/70 rounded-full px-3 py-1 bg-black/40 text-orbit-muted">
                      {step.badge}
                    </span>
                  )}

                  <label className="inline-flex items-center gap-2 text-xs text-orbit-muted select-none">
                    <input
                      type="checkbox"
                      checked={isDone}
                      disabled={isPending}
                      onChange={() =>
                        startTransition(() => {
                          toggleStep(index);
                        })
                      }
                      className="
                        h-4 w-4 rounded border border-orbit-border bg-black/60
                        checked:bg-emerald-400 checked:border-emerald-300
                        focus:outline-none focus:ring-1 focus:ring-emerald-400
                      "
                    />
                    <span>{isDone ? "Done" : "Mark done"}</span>
                  </label>
                </div>
              </div>

              {step.details && (
                <ul className="space-y-2 text-sm text-orbit-muted">
                  {step.details.map((d, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-orbit-pink/80" />
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Connector line (straight, animated) */}
            {index < steps.length - 1 && (
              <div className="flex justify-center mt-4 mb-2">
                <div
                  className="
                    h-10 w-px rounded-full
                    bg-gradient-to-b from-orbit-pink/80 via-orbit-border/60 to-transparent
                    animate-pulse
                  "
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
