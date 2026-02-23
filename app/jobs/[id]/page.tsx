"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Navbar from "@/components/navbar";
import Link from "next/link";

const JOB_TYPE_COLORS: Record<string, string> = {
  "full-time": "bg-green-100 text-green-700",
  "part-time": "bg-yellow-100 text-yellow-700",
  contract: "bg-purple-100 text-purple-700",
  internship: "bg-blue-100 text-blue-700",
  remote: "bg-teal-100 text-teal-700",
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isSignedIn } = useUser();

  const job = useQuery(api.jobs.getById, { id: id as Id<"jobs"> });
  const alreadyApplied = useQuery(api.applications.hasApplied, {
    jobId: id as Id<"jobs">,
  });
  const submitApplication = useMutation(api.applications.submit);

  const [showForm, setShowForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await submitApplication({
        jobId: id as Id<"jobs">,
        coverLetter: coverLetter.trim() || undefined,
      });
      setSuccess(true);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // Loading state
  if (job === undefined) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  // Not found
  if (job === null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-500 text-lg">Job not found.</p>
          <Link href="/jobs" className="text-blue-700 hover:underline mt-2 inline-block text-sm">
            ← Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/jobs"
          className="text-sm text-blue-700 hover:underline inline-flex items-center gap-1 mb-6"
        >
          ← Back to jobs
        </Link>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
              {/* Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-xl shrink-0">
                  {job.company[0]}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-gray-700 mt-0.5">{job.company}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-sm text-gray-500">{job.location}</span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${JOB_TYPE_COLORS[job.type] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {job.type}
                    </span>
                    {job.featured && (
                      <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Salary */}
              {job.salary && (
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="font-semibold text-gray-900">
                    {job.salary.currency}
                    {job.salary.min.toLocaleString()} –{" "}
                    {job.salary.currency}
                    {job.salary.max.toLocaleString()} / year
                  </p>
                </div>
              )}

              {/* Description */}
              <div className="border-t border-gray-100 pt-4 mb-4">
                <h2 className="font-semibold text-gray-900 mb-2">Job Description</h2>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* Requirements */}
              {job.requirements.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <h2 className="font-semibold text-gray-900 mb-2">Requirements</h2>
                  <ul className="list-disc list-inside space-y-1">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="text-sm text-gray-700">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Application form */}
            {showForm && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Apply for this job</h2>
                <form onSubmit={handleApply} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cover Letter{" "}
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={6}
                      placeholder="Tell the employer why you're a great fit..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                      {error}
                    </p>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors"
                    >
                      {submitting ? "Submitting..." : "Submit Application"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar — Apply CTA */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-20">
              <p className="text-xs text-gray-400 mb-3">
                Posted{" "}
                {new Date(job.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              {job.status !== "active" ? (
                <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-center">
                  This position is no longer accepting applications.
                </p>
              ) : success || alreadyApplied ? (
                <div className="text-center">
                  <div className="text-green-600 text-2xl mb-2">✓</div>
                  <p className="text-sm font-medium text-gray-900">Application submitted</p>
                  <p className="text-xs text-gray-500 mt-1">
                    The employer will review your application soon.
                  </p>
                  <Link
                    href="/dashboard/applications"
                    className="mt-3 block text-sm text-blue-700 hover:underline"
                  >
                    View my applications →
                  </Link>
                </div>
              ) : !isSignedIn ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Sign in to apply for this job.
                  </p>
                  <SignInButton mode="modal">
                    <button className="w-full bg-blue-700 text-white py-2.5 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors">
                      Sign in to Apply
                    </button>
                  </SignInButton>
                </div>
              ) : showForm ? null : (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-blue-700 text-white py-2.5 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  Apply Now
                </button>
              )}

              <div className="border-t border-gray-100 mt-4 pt-4">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                  Job Details
                </p>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Type</dt>
                    <dd className="text-gray-800 font-medium capitalize">{job.type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Location</dt>
                    <dd className="text-gray-800 font-medium">{job.location}</dd>
                  </div>
                  {job.salary && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Salary</dt>
                      <dd className="text-gray-800 font-medium">
                        {job.salary.currency}
                        {job.salary.min.toLocaleString()}+
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
