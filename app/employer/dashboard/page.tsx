"use client";

import { useQuery } from "convex/react";
import { useOrganization, UserButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

const STAT_CARDS = [
  {
    key: "activeJobs",
    label: "Active Jobs",
    icon: "📋",
    color: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    key: "applicationCount",
    label: "Total Applications",
    icon: "📥",
    color: "bg-green-50 text-green-700 border-green-100",
  },
  {
    key: "draftJobs",
    label: "Draft Jobs",
    icon: "✏️",
    color: "bg-yellow-50 text-yellow-700 border-yellow-100",
  },
];

const QUICK_ACTIONS = [
  {
    label: "Post a Job",
    description: "Create a new job listing",
    href: "/employer/dashboard/jobs/new",
    icon: "✚",
    primary: true,
  },
  {
    label: "View Applications",
    description: "Review candidate applications",
    href: "/employer/dashboard/applications",
    icon: "📥",
    primary: false,
  },
  {
    label: "Invite Members",
    description: "Add your team to this org",
    href: "/employer/dashboard/members",
    icon: "👥",
    primary: false,
  },
  {
    label: "Manage Billing",
    description: "Upgrade or change your plan",
    href: "/employer/dashboard/billing",
    icon: "💳",
    primary: false,
  },
];

export default function DashboardOverviewPage() {
  const { organization } = useOrganization();
  const stats = useQuery(api.employer.getOrgStats);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {organization?.name ?? "Dashboard"}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Welcome back. Here&apos;s what&apos;s happening with your jobs.
          </p>
        </div>
        <UserButton />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {STAT_CARDS.map(({ key, label, icon, color }) => {
          const value =
            stats === undefined
              ? "—"
              : stats === null
                ? "—"
                : String(stats[key as keyof typeof stats] ?? 0);
          return (
            <div
              key={key}
              className={`border rounded-xl p-5 flex items-center gap-4 ${color}`}
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm font-medium opacity-80">{label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(({ label, description, href, icon, primary }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                primary
                  ? "bg-blue-700 border-blue-700 text-white hover:bg-blue-800"
                  : "bg-white border-gray-200 text-gray-800 hover:border-blue-300 hover:shadow-sm"
              }`}
            >
              <span className="text-xl">{icon}</span>
              <div>
                <div className="font-medium text-sm">{label}</div>
                <div
                  className={`text-xs ${primary ? "text-blue-200" : "text-gray-500"}`}
                >
                  {description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting started checklist */}
      {stats?.totalJobs === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Get started with Jobly
          </h2>
          <div className="flex flex-col gap-3">
            {[
              {
                done: !!organization,
                label: "Create your organization",
                href: null,
              },
              {
                done: false,
                label: "Post your first job listing",
                href: "/employer/dashboard/jobs/new",
              },
              {
                done: false,
                label: "Invite team members",
                href: "/employer/dashboard/members",
              },
              {
                done: false,
                label: "Set up your billing plan",
                href: "/employer/pricing",
              },
            ].map(({ done, label, href }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-xs ${
                    done
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {done && "✓"}
                </div>
                {href ? (
                  <Link
                    href={href}
                    className={`text-sm ${done ? "text-gray-400 line-through" : "text-blue-700 hover:underline"}`}
                  >
                    {label}
                  </Link>
                ) : (
                  <span
                    className={`text-sm ${done ? "text-gray-400 line-through" : "text-gray-700"}`}
                  >
                    {label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
