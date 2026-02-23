"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const STATUS_STYLES = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
  reviewed: { bg: "bg-blue-100", text: "text-blue-700", label: "Under Review" },
  interview: { bg: "bg-green-100", text: "text-green-700", label: "Interview" },
  rejected: { bg: "bg-red-100", text: "text-red-600", label: "Rejected" },
};

const NEXT_ACTIONS: Record<
  string,
  { label: string; status: "reviewed" | "interview" | "rejected" | "pending"; style: string }[]
> = {
  pending: [
    { label: "Mark Reviewed", status: "reviewed", style: "text-blue-700 hover:bg-blue-50 border-blue-200" },
    { label: "Reject", status: "rejected", style: "text-red-600 hover:bg-red-50 border-red-200" },
  ],
  reviewed: [
    { label: "Invite to Interview", status: "interview", style: "text-green-700 hover:bg-green-50 border-green-200" },
    { label: "Reject", status: "rejected", style: "text-red-600 hover:bg-red-50 border-red-200" },
  ],
  interview: [
    { label: "Move Back to Review", status: "reviewed", style: "text-blue-700 hover:bg-blue-50 border-blue-200" },
    { label: "Reject", status: "rejected", style: "text-red-600 hover:bg-red-50 border-red-200" },
  ],
  rejected: [
    { label: "Reconsider", status: "pending", style: "text-gray-700 hover:bg-gray-50 border-gray-200" },
  ],
};

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const filterJobId = searchParams.get("job");

  const applications = useQuery(api.applications.getOrgApplications);
  const updateStatus = useMutation(api.applications.updateApplicationStatus);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Build unique job list for filter dropdown
  const jobOptions = applications
    ? Array.from(
        new Map(
          applications
            .filter((a) => a.job)
            .map((a) => [a.jobId.toString(), a.job!])
        ).values()
      )
    : [];

  const filtered = applications
    ? filterJobId
      ? applications.filter((a) => a.jobId.toString() === filterJobId)
      : applications
    : undefined;

  async function handleStatusChange(
    applicationId: Id<"applications">,
    status: "reviewed" | "interview" | "rejected" | "pending"
  ) {
    setUpdatingId(applicationId);
    try {
      await updateStatus({ applicationId, status });
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered === undefined
              ? "Loading..."
              : `${filtered.length} application${filtered.length !== 1 ? "s" : ""}${filterJobId ? " for this job" : ""}`}
          </p>
        </div>

        {/* Filter by job */}
        {jobOptions.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Filter by job:</label>
            <select
              value={filterJobId ?? ""}
              onChange={(e) => {
                const params = new URLSearchParams();
                if (e.target.value) params.set("job", e.target.value);
                window.history.replaceState(
                  null,
                  "",
                  `/employer/dashboard/applications${params.toString() ? `?${params}` : ""}`
                );
                window.location.reload();
              }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All jobs</option>
              {jobOptions.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {filtered === undefined && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filtered !== undefined && filtered.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-lg">No applications yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Applications will appear here once candidates apply to your jobs.
          </p>
          <Link
            href="/employer/dashboard/jobs"
            className="mt-4 inline-block text-blue-700 hover:underline text-sm"
          >
            View your job listings →
          </Link>
        </div>
      )}

      {/* Applications list */}
      {filtered !== undefined && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((app) => {
            const statusStyle =
              STATUS_STYLES[app.status] ?? STATUS_STYLES.pending;
            const actions = NEXT_ACTIONS[app.status] ?? [];
            const isUpdating = updatingId === app._id;

            return (
              <div
                key={app._id}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Left: applicant + job info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                      {app.applicantId.slice(-2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        Applicant #{app.applicantId.slice(-8)}
                      </p>
                      {app.job ? (
                        <Link
                          href={`/employer/dashboard/jobs/${app.jobId}/edit`}
                          className="text-xs text-blue-700 hover:underline"
                        >
                          {app.job.title}
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Job removed
                        </span>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        Applied{" "}
                        {new Date(app.appliedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Right: status + actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {statusStyle.label}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {actions.map((action) => (
                        <button
                          key={action.status}
                          onClick={() =>
                            handleStatusChange(
                              app._id,
                              action.status
                            )
                          }
                          disabled={isUpdating}
                          className={`text-xs border px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50 ${action.style}`}
                        >
                          {isUpdating ? "..." : action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cover letter */}
                {app.coverLetter && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Cover Letter
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {app.coverLetter}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function EmployerApplicationsPage() {
  return (
    <Suspense>
      <ApplicationsContent />
    </Suspense>
  );
}
