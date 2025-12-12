"use client";

import { useState } from "react";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        window.location.href = "/handler/sign-in";
        return;
      }

      if (!res.ok) {
        console.error("Portal failed:", data);
        alert(data?.error ?? "Portal failed");
        return;
      }

      if (!data?.url) {
        alert("No billing portal URL returned.");
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Failed to open billing portal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-full border border-orbit-border px-5 py-2 text-xs sm:text-sm text-orbit-muted hover:border-white/40 hover:text-white transition disabled:opacity-60"
    >
      {loading ? "Opening..." : "Manage billing"}
    </button>
  );
}
