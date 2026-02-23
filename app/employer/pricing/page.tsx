"use client";

import { PricingTable } from "@clerk/nextjs";
import { useOrganization, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function EmployerPricingPage() {
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();

  const isLoading = !userLoaded || !orgLoaded;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-700">
          Jobly
        </Link>
        <div className="flex items-center gap-4">
          {organization && (
            <Link
              href="/employer/dashboard"
              className="text-sm text-blue-700 hover:underline"
            >
              ← Back to Dashboard
            </Link>
          )}
          <Link href="/jobs" className="text-sm text-gray-500 hover:text-gray-700">
            Browse Jobs
          </Link>
        </div>
      </header>

      <div className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Steps indicator — shown during onboarding (no org yet before selection) */}
          {isSignedIn && !organization && (
            <div className="flex items-center gap-2 mb-8 text-sm justify-center">
              <div className="flex items-center gap-2 text-gray-400">
                <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                Create your company
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className="flex items-center gap-2 text-blue-700 font-medium">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Choose a plan
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className="flex items-center gap-2 text-gray-400">
                <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                Post your first job
              </div>
            </div>
          )}

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Choose your plan
            </h1>
            <p className="text-gray-500">
              Start free. Upgrade as your hiring needs grow.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          ) : !isSignedIn ? (
            // Not signed in
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center max-w-md mx-auto">
              <p className="text-gray-600 mb-4">
                Sign in to view and select a plan for your organization.
              </p>
              <Link
                href="/sign-in"
                className="inline-block bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
              >
                Sign in
              </Link>
            </div>
          ) : !organization ? (
            // Signed in but no active org
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center max-w-md mx-auto">
              <p className="text-gray-600 mb-2">
                You need to create or select an organization before choosing a plan.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Plans are billed per organization, not per user.
              </p>
              <Link
                href="/employer/onboarding"
                className="inline-block bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
              >
                Create your organization
              </Link>
            </div>
          ) : (
            // Has an active org — show Clerk PricingTable
            <div className="flex justify-center">
              <PricingTable for="organization" />
            </div>
          )}

          <p className="text-center text-gray-400 text-xs mt-8">
            Billing is handled securely by Clerk + Stripe. Cancel anytime.{" "}
            <Link href="/employer" className="hover:text-gray-600 underline">
              Learn more about plans
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
