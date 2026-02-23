"use client";

import { CreateOrganization, useOrganization } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnboardingPage() {
  const router = useRouter();
  const { organization } = useOrganization();

  // If the user already has an active org, redirect to dashboard
  useEffect(() => {
    if (organization) {
      router.replace("/employer/dashboard");
    }
  }, [organization, router]);

  if (organization) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-700">
          Jobly
        </Link>
        <Link
          href="/jobs"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Browse Jobs
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <div className="flex items-center gap-2 text-blue-700 font-medium">
            <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            Create your company
          </div>
          <div className="w-8 h-px bg-gray-300" />
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
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

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create your company profile
          </h1>
          <p className="text-gray-500 text-sm">
            Set up your organization to start posting jobs and managing your team.
          </p>
        </div>

        {/* Clerk CreateOrganization component */}
        <CreateOrganization
          afterCreateOrganizationUrl="/employer/pricing"
          skipInvitationScreen={false}
          appearance={{
            elements: {
              card: "shadow-md rounded-xl border border-gray-200",
            },
          }}
        />
      </div>
    </div>
  );
}
