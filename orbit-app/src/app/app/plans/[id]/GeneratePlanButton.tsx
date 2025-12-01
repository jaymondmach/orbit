// src/app/app/plans/[id]/GeneratePlanButton.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  planId: string;
  initialStatus: string;
  hasOutput: boolean;
};

export function GeneratePlanButton({
  planId,
  initialStatus,
  hasOutput,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isGenerating = status === "generating" || isPending;

  async function handleClick() {
    setError(null);
    setStatus("generating");

    try {
      const res = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setStatus("error");
        setError(data?.error ?? "Something went wrong generating the plan.");
        return;
      }

      const json = await res.json();
      setStatus(json.status ?? "ready");

      // Refresh the page to pull fresh data from the server
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError("Network error while generating plan.");
    }
  }

  const label =
    status === "ready"
      ? hasOutput
        ? "Regenerate with Orbit"
        : "Generate with Orbit"
      : isGenerating
      ? "Orbit is generating…"
      : status === "error"
      ? "Retry generation"
      : "Generate with Orbit";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isGenerating}
        className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff6cab,#7366ff)] px-4 py-2 text-xs sm:text-sm font-semibold text-black hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {label}
      </button>
      {error && (
        <p className="text-[11px] text-red-300 max-w-xs text-right">{error}</p>
      )}
    </div>
  );
}
