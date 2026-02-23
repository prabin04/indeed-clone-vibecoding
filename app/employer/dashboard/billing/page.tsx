"use client";

import { PricingTable } from "@clerk/nextjs";
import { useOrganization, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";

const PLAN_LABELS: Record<string, { label: string; color: string; description: string }> = {
  enterprise: {
    label: "Enterprise",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    description: "Unlimited jobs, analytics, dedicated support.",
  },
  pro: {
    label: "Pro",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Unlimited job posts, featured listings, up to 10 members.",
  },
  starter: {
    label: "Starter",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    description: "Up to 3 active job posts. Free forever.",
  },
};

export default function BillingPage() {
  const { membership, isLoaded: orgLoaded } = useOrganization();
  const { has, isLoaded: authLoaded } = useAuth();

  // Role guard — only org:admin should reach this page.
  // The sidebar already hides the link for non-admins; this is a belt-and-suspenders check.
  if (orgLoaded && membership && membership.role !== "org:admin") {
    redirect("/employer/dashboard");
  }

  const isEnterprise = has ? has({ plan: "enterprise" }) : false;
  const isPro = has ? has({ plan: "pro" }) : false;
  const currentPlanKey = isEnterprise ? "enterprise" : isPro ? "pro" : "starter";
  const plan = PLAN_LABELS[currentPlanKey];

  const isLoading = !orgLoaded || !authLoaded;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing &amp; Plans</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your organization&apos;s subscription and billing.
        </p>
      </div>

      {/* Current plan card */}
      {!isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Current Plan
            </p>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full border ${plan.color}`}
              >
                {plan.label}
              </span>
              <p className="text-sm text-gray-600">{plan.description}</p>
            </div>
          </div>
          {currentPlanKey === "starter" && (
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">
                Limited to 3 active jobs
              </p>
              <Link
                href="#plans"
                className="text-sm text-blue-700 font-medium hover:underline"
              >
                Upgrade for unlimited →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Plans */}
      <div id="plans">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          {currentPlanKey === "starter" ? "Upgrade your plan" : "Manage your plan"}
        </h2>

        {isLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : (
          <div className="flex justify-start">
            <PricingTable for="organization" />
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-8">
        Billing is managed securely by Clerk + Stripe. You can cancel or change
        your plan at any time.{" "}
        <a
          href="https://clerk.com/docs/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          Learn more
        </a>
      </p>
    </div>
  );
}
