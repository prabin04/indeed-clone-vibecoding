"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useState } from "react";

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  closed: "bg-gray-100 text-gray-500",
};

const STARTER_LIMIT = 3;

export default function EmployerJobsPage() {
  const { has } = useAuth();
  const isPro = has ? has({ plan: "pro" }) : false;

  const jobs = useQuery(api.jobs.getOrgJobsWithCounts);
  const closeJobMutation = useMutation(api.jobs.closeJob);
  const [closingId, setClosingId] = useState<string | null>(null);

  const activeCount = jobs?.filter((j) => j.status === "active").length ?? 0;
  const atLimit = !isPro && activeCount >= STARTER_LIMIT;

  async function handleClose(id: Id<"jobs">) {
    setClosingId(id);
    try {
      await closeJobMutation({ id });
    } finally {
      setClosingId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {jobs === undefined
              ? "Loading..."
              : `${jobs.length} job${jobs.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <Link
          href={atLimit ? "/employer/pricing" : "/employer/dashboard/jobs/new"}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            atLimit
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
              : "bg-blue-700 text-white hover:bg-blue-800"
          }`}
        >
          {atLimit ? "⬆ Upgrade to Post More" : "+ Post a Job"}
        </Link>
      </div>

      {/* Starter plan usage bar */}
      {!isPro && jobs !== undefined && (
        <div className="mb-5 bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">
                Starter plan: active jobs
              </span>
              <span
                className={`text-xs font-bold ${atLimit ? "text-amber-600" : "text-gray-700"}`}
              >
                {activeCount} / {STARTER_LIMIT}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${atLimit ? "bg-amber-400" : "bg-blue-500"}`}
                style={{ width: `${Math.min((activeCount / STARTER_LIMIT) * 100, 100)}%` }}
              />
            </div>
          </div>
          <Link
            href="/employer/pricing"
            className="text-xs text-blue-700 hover:underline whitespace-nowrap font-medium"
          >
            Upgrade →
          </Link>
        </div>
      )}

      {/* Loading skeleton */}
      {jobs === undefined && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {jobs !== undefined && jobs.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-lg mb-1">No jobs posted yet.</p>
          <p className="text-gray-400 text-sm mb-4">
            Create your first job listing to start receiving applications.
          </p>
          <Link
            href="/employer/dashboard/jobs/new"
            className="inline-block bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            Post your first job
          </Link>
        </div>
      )}

      {/* Jobs table */}
      {jobs !== undefined && jobs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">
                  Applications
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">
                  Posted
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.map((job) => (
                <tr
                  key={job._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-gray-900">{job.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 sm:hidden">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[job.status]}`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {job.location} · {job.type}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[job.status]}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <Link
                      href={`/employer/dashboard/applications?job=${job._id}`}
                      className="font-medium text-gray-700 hover:text-blue-700"
                    >
                      {job.applicationCount}
                      <span className="text-gray-400 font-normal ml-1">
                        {job.applicationCount === 1 ? "applicant" : "applicants"}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs hidden lg:table-cell">
                    {new Date(job.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/employer/dashboard/jobs/${job._id}/edit`}
                        className="text-xs text-blue-700 hover:underline font-medium"
                      >
                        Edit
                      </Link>
                      {job.status === "active" && (
                        <button
                          onClick={() => handleClose(job._id)}
                          disabled={closingId === job._id}
                          className="text-xs text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {closingId === job._id ? "Closing..." : "Close"}
                        </button>
                      )}
                      {job.status === "draft" && (
                        <Link
                          href={`/employer/dashboard/jobs/${job._id}/edit`}
                          className={`text-xs font-medium ${atLimit ? "text-gray-400 cursor-not-allowed" : "text-green-600 hover:underline"}`}
                        >
                          Publish
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
