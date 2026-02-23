"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/navbar";
import Link from "next/link";

const CATEGORIES = [
  { label: "Technology", icon: "💻", slug: "technology" },
  { label: "Healthcare", icon: "🏥", slug: "healthcare" },
  { label: "Finance", icon: "📊", slug: "finance" },
  { label: "Marketing", icon: "📣", slug: "marketing" },
  { label: "Design", icon: "🎨", slug: "design" },
  { label: "Education", icon: "📚", slug: "education" },
  { label: "Sales", icon: "🤝", slug: "sales" },
  { label: "Operations", icon: "⚙️", slug: "operations" },
];

const JOB_TYPE_COLORS: Record<string, string> = {
  "full-time": "bg-green-100 text-green-700",
  "part-time": "bg-yellow-100 text-yellow-700",
  contract: "bg-purple-100 text-purple-700",
  internship: "bg-blue-100 text-blue-700",
  remote: "bg-teal-100 text-teal-700",
};

export default function Home() {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const featuredJobs = useQuery(api.jobs.getFeaturedJobs);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keywords) params.set("q", keywords);
    if (location) params.set("l", location);
    router.push(`/jobs?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Find your next great job
          </h1>
          <p className="text-blue-200 text-lg mb-10">
            Thousands of opportunities from top companies — all in one place.
          </p>

          {/* Search form */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-lg shadow-xl p-2 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div className="w-px bg-gray-200 hidden sm:block" />
            <input
              type="text"
              placeholder="City, state, or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-md transition-colors text-sm whitespace-nowrap"
            >
              Search Jobs
            </button>
          </form>

          {/* Popular searches */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-blue-300 text-sm">Popular:</span>
            {["Remote", "Software Engineer", "Product Manager", "Designer", "Marketing"].map(
              (term) => (
                <button
                  key={term}
                  onClick={() => {
                    setKeywords(term);
                    router.push(`/jobs?q=${encodeURIComponent(term)}`);
                  }}
                  className="text-blue-200 hover:text-white text-sm underline underline-offset-2 transition-colors"
                >
                  {term}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-blue-800 py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
          {[
            { value: "10,000+", label: "Jobs listed" },
            { value: "500+", label: "Companies hiring" },
            { value: "1M+", label: "Job seekers" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-white font-bold text-xl">{value}</div>
              <div className="text-blue-300 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Jobs</h2>
            <Link href="/jobs" className="text-blue-700 hover:text-blue-800 text-sm font-medium">
              View all jobs →
            </Link>
          </div>

          {featuredJobs === undefined ? (
            // Loading skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">No featured jobs yet.</p>
              <p className="text-sm mt-1">
                Are you an employer?{" "}
                <Link href="/employer" className="text-blue-700 hover:underline">
                  Post a job
                </Link>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredJobs.map((job) => (
                <Link
                  key={job._id}
                  href={`/jobs/${job._id}`}
                  className="border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-sm">
                      {job.company[0]}
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${JOB_TYPE_COLORS[job.type] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {job.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">{job.company}</p>
                  <p className="text-sm text-gray-500">{job.location}</p>
                  {job.salary && (
                    <p className="text-sm font-medium text-gray-700 mt-2">
                      {job.salary.currency}
                      {job.salary.min.toLocaleString()} –{" "}
                      {job.salary.currency}
                      {job.salary.max.toLocaleString()}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map(({ label, icon, slug }) => (
              <Link
                key={slug}
                href={`/jobs?category=${slug}`}
                className="bg-white border border-gray-200 rounded-lg p-5 text-center hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-2">{icon}</div>
                <div className="text-sm font-medium text-gray-800">{label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Employer CTA */}
      <section className="py-16 px-4 bg-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Hire top talent faster
          </h2>
          <p className="text-blue-200 text-lg mb-8">
            Post jobs, manage your team, and find the right candidates — all in
            one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/employer/onboarding"
              className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-md hover:bg-blue-50 transition-colors"
            >
              Post a Job
            </Link>
            <Link
              href="/employer/pricing"
              className="border border-blue-300 text-white font-semibold px-8 py-3 rounded-md hover:bg-blue-800 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="text-xl font-bold text-white mb-2">Jobly</div>
              <p className="text-gray-400 text-sm max-w-xs">
                Connecting great people with great companies.
              </p>
            </div>
            <div className="flex gap-12 text-sm">
              <div className="flex flex-col gap-2">
                <p className="text-gray-400 font-semibold uppercase text-xs tracking-wider mb-1">
                  Job Seekers
                </p>
                <Link href="/jobs" className="text-gray-300 hover:text-white">Browse Jobs</Link>
                <Link href="/sign-up" className="text-gray-300 hover:text-white">Create Account</Link>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-gray-400 font-semibold uppercase text-xs tracking-wider mb-1">
                  Employers
                </p>
                <Link href="/employer" className="text-gray-300 hover:text-white">Post a Job</Link>
                <Link href="/employer/pricing" className="text-gray-300 hover:text-white">Pricing</Link>
                <Link href="/employer/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-xs">
            © {new Date().getFullYear()} Jobly. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
