"use client";

import { useQuery, usePaginatedQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/navbar";
import Link from "next/link";

const JOB_TYPES = [
  { value: "", label: "All Types" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
] as const;

const JOB_TYPE_COLORS: Record<string, string> = {
  "full-time": "bg-green-100 text-green-700",
  "part-time": "bg-yellow-100 text-yellow-700",
  contract: "bg-purple-100 text-purple-700",
  internship: "bg-blue-100 text-blue-700",
  remote: "bg-teal-100 text-teal-700",
};

type JobType = "full-time" | "part-time" | "contract" | "internship" | "remote" | undefined;

const PAGE_SIZE = 12;

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keywords, setKeywords] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(searchParams.get("l") ?? "");
  const [type, setType] = useState<JobType>(
    (searchParams.get("type") as JobType) ?? undefined
  );

  const textQuery = searchParams.get("q") ?? undefined;
  const locationParam = searchParams.get("l") ?? undefined;
  const typeParam = (searchParams.get("type") as JobType) ?? undefined;

  // Text search path (no pagination)
  const searchResults = useQuery(
    api.jobs.searchJobs,
    textQuery
      ? { query: textQuery, location: locationParam, type: typeParam }
      : "skip"
  );

  // Browse / filter path (paginated)
  const {
    results: browseResults,
    status: browseStatus,
    loadMore,
  } = usePaginatedQuery(
    api.jobs.listJobsPaginated,
    textQuery ? "skip" : { type: typeParam },
    { initialNumItems: PAGE_SIZE }
  );

  // Sync filter state when URL params change
  useEffect(() => {
    setKeywords(searchParams.get("q") ?? "");
    setLocation(searchParams.get("l") ?? "");
    setType((searchParams.get("type") as JobType) ?? undefined);
  }, [searchParams]);

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (keywords) params.set("q", keywords);
    if (location) params.set("l", location);
    if (type) params.set("type", type);
    router.push(`/jobs?${params.toString()}`);
  }

  function clearFilters() {
    setKeywords("");
    setLocation("");
    setType(undefined);
    router.push("/jobs");
  }

  const hasActiveFilters = textQuery || locationParam || typeParam;

  // Resolve active jobs + loading state based on which path is active
  const jobs = textQuery ? (searchResults ?? []) : browseResults;
  const isLoading = textQuery
    ? searchResults === undefined
    : browseStatus === "LoadingFirstPage";
  const canLoadMore = !textQuery && browseStatus === "CanLoadMore";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Search bar */}
      <div className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <form
            onSubmit={applyFilters}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="City, state, or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 sm:max-w-xs border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="w-full md:w-56 shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-700 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Job Type
              </p>
              <div className="flex flex-col gap-1">
                {JOB_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      const newType = value === "" ? undefined : (value as JobType);
                      setType(newType);
                      const params = new URLSearchParams(searchParams.toString());
                      if (newType) {
                        params.set("type", newType);
                      } else {
                        params.delete("type");
                      }
                      router.push(`/jobs?${params.toString()}`);
                    }}
                    className={`text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                      (type ?? "") === value
                        ? "bg-blue-700 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Job list */}
        <main className="flex-1">
          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  <span className="font-semibold text-gray-900">
                    {jobs.length}
                  </span>{" "}
                  {jobs.length === 1 ? "job" : "jobs"}{" "}
                  {textQuery ? "found for your search" : "available"}
                  {canLoadMore && " · scroll for more"}
                </>
              )}
            </p>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && jobs.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg">No jobs found.</p>
              <p className="text-gray-400 text-sm mt-1">
                Try different keywords or{" "}
                <button
                  onClick={clearFilters}
                  className="text-blue-700 hover:underline"
                >
                  clear filters
                </button>
              </p>
            </div>
          )}

          {/* Job cards */}
          {!isLoading && jobs.length > 0 && (
            <>
              <div className="flex flex-col gap-3">
                {jobs.map((job) => (
                  <Link
                    key={job._id}
                    href={`/jobs/${job._id}`}
                    className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Company logo placeholder */}
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
                        {job.company[0]}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <h2 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {job.title}
                          </h2>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${JOB_TYPE_COLORS[job.type] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {job.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-0.5">{job.company}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{job.location}</p>

                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          {job.salary && (
                            <span className="text-sm font-medium text-gray-700">
                              {job.salary.currency}
                              {job.salary.min.toLocaleString()} –{" "}
                              {job.salary.currency}
                              {job.salary.max.toLocaleString()}
                            </span>
                          )}
                          {job.featured && (
                            <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">
                              Featured
                            </span>
                          )}
                          <span className="text-xs text-gray-400 ml-auto">
                            {new Date(job.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load more */}
              {canLoadMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => loadMore(PAGE_SIZE)}
                    className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Load more jobs
                  </button>
                </div>
              )}

              {browseStatus === "LoadingMore" && (
                <div className="mt-6 text-center text-sm text-gray-400">
                  Loading...
                </div>
              )}

              {!textQuery && browseStatus === "Exhausted" && jobs.length > PAGE_SIZE && (
                <p className="mt-6 text-center text-xs text-gray-400">
                  All {jobs.length} jobs loaded.
                </p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense>
      <JobsContent />
    </Suspense>
  );
}
