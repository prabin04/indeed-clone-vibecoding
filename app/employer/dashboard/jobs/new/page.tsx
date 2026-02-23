"use client";

import { useMutation, useQuery } from "convex/react";
import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import JobForm, { type JobFormValues } from "@/components/employer/job-form";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function NewJobPage() {
  const router = useRouter();
  const { organization } = useOrganization();
  const createJob = useMutation(api.jobs.createJob);
  const jobs = useQuery(api.jobs.getOrgJobsWithCounts);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeJobCount = jobs?.filter((j) => j.status === "active").length ?? 0;

  async function handleSubmit(values: JobFormValues) {
    if (!organization) return;
    setIsSubmitting(true);
    try {
      await createJob({
        company: organization.name,
        title: values.title,
        location: values.location,
        type: values.type,
        salary:
          values.salaryMin && values.salaryMax
            ? {
                min: Number(values.salaryMin),
                max: Number(values.salaryMax),
                currency: values.currency,
              }
            : undefined,
        description: values.description,
        requirements: values.requirements,
        featured: values.featured,
        status: values.status,
      });
      toast.success(
        values.status === "active" ? "Job posted successfully!" : "Job saved as draft."
      );
      router.push("/employer/dashboard/jobs");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg.startsWith("STARTER_LIMIT:")) {
        toast.error("Job limit reached — upgrade to Pro for unlimited postings.", {
          action: { label: "Upgrade", onClick: () => router.push("/employer/pricing") },
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/employer/dashboard/jobs"
          className="text-sm text-blue-700 hover:underline inline-flex items-center gap-1 mb-3"
        >
          ← Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill out the details below to create a job listing.
        </p>
      </div>

      <JobForm
        orgName={organization?.name ?? ""}
        activeJobCount={activeJobCount}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        cancelHref="/employer/dashboard/jobs"
      />
    </div>
  );
}
