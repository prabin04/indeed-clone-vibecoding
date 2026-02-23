"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Protect } from "@clerk/nextjs";
import Link from "next/link";

export type JobFormValues = {
  title: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship" | "remote";
  salaryMin: string;
  salaryMax: string;
  currency: string;
  description: string;
  requirements: string[];
  featured: boolean;
  status: "active" | "draft";
};

interface JobFormProps {
  initialValues?: Partial<JobFormValues>;
  orgName: string;
  activeJobCount: number; // current number of active jobs in the org
  onSubmit: (values: JobFormValues) => Promise<void>;
  isSubmitting: boolean;
  cancelHref: string;
}

const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
] as const;

const CURRENCIES = ["$", "£", "€", "₹"];

const STARTER_LIMIT = 3;

export default function JobForm({
  initialValues,
  orgName,
  activeJobCount,
  onSubmit,
  isSubmitting,
  cancelHref,
}: JobFormProps) {
  const { has } = useAuth();
  const isPro = has ? has({ plan: "pro" }) : false;

  const atStarterLimit = !isPro && activeJobCount >= STARTER_LIMIT;

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [type, setType] = useState<JobFormValues["type"]>(
    initialValues?.type ?? "full-time"
  );
  const [salaryMin, setSalaryMin] = useState(initialValues?.salaryMin ?? "");
  const [salaryMax, setSalaryMax] = useState(initialValues?.salaryMax ?? "");
  const [currency, setCurrency] = useState(initialValues?.currency ?? "$");
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [requirements, setRequirements] = useState<string[]>(
    initialValues?.requirements ?? []
  );
  const [newReq, setNewReq] = useState("");
  const [featured, setFeatured] = useState(initialValues?.featured ?? false);
  const [status, setStatus] = useState<"active" | "draft">(
    initialValues?.status ?? "active"
  );
  const [error, setError] = useState("");

  function addRequirement() {
    if (newReq.trim()) {
      setRequirements((prev) => [...prev, newReq.trim()]);
      setNewReq("");
    }
  }

  function removeRequirement(index: number) {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent, submitStatus: "active" | "draft") {
    e.preventDefault();
    if (submitStatus === "active" && atStarterLimit) return;
    setError("");
    try {
      await onSubmit({
        title,
        location,
        type,
        salaryMin,
        salaryMax,
        currency,
        description,
        requirements,
        featured: isPro ? featured : false,
        status: submitStatus,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg.replace("STARTER_LIMIT: ", ""));
    }
  }

  return (
    <form className="flex flex-col gap-6">
      {/* Starter plan limit warning */}
      {atStarterLimit && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
          <span className="text-amber-500 text-lg mt-0.5">⚠</span>
          <div>
            <p className="text-sm font-medium text-amber-800">
              You&apos;ve reached the Starter plan limit ({STARTER_LIMIT} active jobs).
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Upgrade to Pro for unlimited postings.{" "}
              <Link href="/employer/pricing" className="underline font-medium">
                View plans →
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Basic info */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-gray-900">Basic Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              value={orgName}
              readOnly
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. New York, NY or Remote"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as JobFormValues["type"])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {JOB_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Salary */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-gray-900">
          Compensation{" "}
          <span className="text-gray-400 font-normal text-sm">(optional)</span>
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-20"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="Min (e.g. 80000)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="number"
            min={0}
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder="Max (e.g. 120000)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-sm whitespace-nowrap">/ year</span>
        </div>
      </section>

      {/* Description & requirements */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-gray-900">Job Details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requirements
          </label>
          <div className="flex flex-col gap-2">
            {requirements.map((req, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
              >
                <span className="text-gray-400 text-xs">•</span>
                <span className="flex-1 text-sm text-gray-700">{req}</span>
                <button
                  type="button"
                  onClick={() => removeRequirement(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newReq}
                onChange={(e) => setNewReq(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRequirement();
                  }
                }}
                placeholder="Add a requirement and press Enter"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addRequirement}
                className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Settings */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-gray-900">Settings</h2>

        {/* Featured listing — Pro plan only */}
        <Protect
          plan="pro"
          fallback={
            <div className="border border-dashed border-amber-300 rounded-lg p-4 bg-amber-50">
              <div className="flex items-start gap-3">
                <span className="text-xl">⭐</span>
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Featured listing
                    <span className="ml-2 text-xs bg-amber-200 text-amber-700 px-1.5 py-0.5 rounded-full">
                      Pro
                    </span>
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Boost your job to the top of search results and reach more
                    qualified candidates.
                  </p>
                  <Link
                    href="/employer/pricing"
                    className="text-xs text-blue-700 font-medium hover:underline mt-1.5 inline-block"
                  >
                    Upgrade to Pro →
                  </Link>
                </div>
              </div>
            </div>
          }
        >
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">
                  Featured listing
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                  Pro
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Appears prominently at the top of search results and on the
                homepage.
              </p>
            </div>
          </label>
        </Protect>
      </section>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
          {error.toLowerCase().includes("limit") && (
            <>
              {" "}
              <Link href="/employer/pricing" className="underline font-medium">
                Upgrade to Pro →
              </Link>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, "active")}
          disabled={isSubmitting || atStarterLimit}
          className="bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Saving..." : "Publish Job"}
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, "draft")}
          disabled={isSubmitting}
          className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Save as Draft
        </button>
        <Link
          href={cancelHref}
          className="text-sm text-gray-500 hover:text-gray-700 px-2"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
