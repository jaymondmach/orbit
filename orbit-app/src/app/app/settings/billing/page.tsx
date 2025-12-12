// src/app/app/settings/billing/page.tsx
import { getOrCreateCurrentUser } from "@/lib/getOrCreateCurrentUser";
import { getEntitlements } from "@/lib/entitlements";
import { UpgradeToProButton } from "@/components/UpgradeToProButton";
import { ManageBillingButton } from "@/components/ManageBillingButton";

export default async function BillingPage() {
  const { dbUser } = await getOrCreateCurrentUser(); // page can use redirect mode
  const ent = getEntitlements(dbUser.plan);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-semibold">Billing</h1>
        <p className="text-xs sm:text-sm text-orbit-muted">
          Upgrade to Pro to unlock higher limits and execution features.
        </p>
      </div>

      <div className="orbit-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-orbit-muted">Current plan</p>
            <p className="text-lg font-semibold">
              {ent.plan === "pro" ? "Orbit Pro" : "Free"}
            </p>

            {dbUser.subscriptionStatus ? (
              <p className="text-[11px] text-orbit-muted">
                Status: {dbUser.subscriptionStatus}
              </p>
            ) : null}
          </div>

          {/* ✅ Client-side buttons (reliable redirects) */}
          {ent.plan !== "pro" ? (
            <UpgradeToProButton />
          ) : (
            <ManageBillingButton />
          )}
        </div>

        <div className="pt-2 border-t border-orbit-border">
          <p className="text-xs font-medium mb-2">Your features</p>
          <ul className="text-[12px] text-orbit-muted space-y-1">
            <li>• Max plans: {ent.maxPlans}</li>
            <li>• AI generations / month: {ent.aiGenerationsPerMonth}</li>
            <li>
              • Weekly Action Packs: {ent.weeklyActionPacks ? "Yes" : "No"}
            </li>
            <li>• Calendar export: {ent.calendarExport ? "Yes" : "No"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
