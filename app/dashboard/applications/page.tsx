"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { redirect } from "next/navigation";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending Review" },
  reviewed: { bg: "bg-blue-100", text: "text-blue-700", label: "Under Review" },
  interview: { bg: "bg-green-100", text: "text-green-700", label: "Interview" },
  rejected: { bg: "bg-red-100", text: "text-red-600", label: "Not Selected" },
};

export default function MyApplicationsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const applications = useQuery(api.applications.getMyApplications);

  if (isLoaded && !isSignedIn) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track the status of your job applications.
          </p>
        </div>

        {/* Loading skeleton */}
        {applications === undefined && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {applications !== undefined && applications.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No applications yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Start browsing jobs and apply to positions that interest you.
            </p>
            <Link
              href="/jobs"
              className="mt-4 inline-block bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        )}

        {/* Applications list */}
        {applications !== undefined && applications.length > 0 && (
          <div className="flex flex-col gap-3">
            {applications.map((app) => {
              const statusStyle = STATUS_STYLES[app.status] ?? STATUS_STYLES.pending;
              return (
                <div
                  key={app._id}
                  className="bg-white border border-gray-200 rounded-lg p-5"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3">
                      {/* Company logo */}
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                        {app.job?.company?.[0] ?? "?"}
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {app.job ? (
                            <Link
                              href={`/jobs/${app.jobId}`}
                              className="hover:text-blue-700 transition-colors"
                            >
                              {app.job.title}
                            </Link>
                          ) : (
                            "Job no longer available"
                          )}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {app.job?.company ?? "—"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {app.job?.location ?? "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {statusStyle.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        Applied{" "}
                        {new Date(app.appliedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Cover letter preview */}
                  {app.coverLetter && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                        Cover Letter
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
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
    </div>
  );
}
