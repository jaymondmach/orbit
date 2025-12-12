"use client";

import { useState } from "react";

export function UpgradeToProButton() {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        // If the user isn't signed in, send them to Stack sign-in
        window.location.href = "/handler/sign-in";
        return;
      }

      if (!res.ok) {
        console.error("Checkout failed:", data);
        alert(data?.error ?? "Checkout failed");
        return;
      }

      if (!data?.url) {
        alert("No checkout URL returned.");
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff6cab,#7366ff)] px-5 py-2 text-xs sm:text-sm font-semibold text-black hover:opacity-90 transition disabled:opacity-60"
    >
      {loading ? "Redirecting..." : "Upgrade to Pro"}
    </button>
  );
}
