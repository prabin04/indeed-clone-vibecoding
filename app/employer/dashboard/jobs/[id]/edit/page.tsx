"use client";

import { useQuery, useMutation } from "convex/react";
import { useOrganization } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import JobForm, { type JobFormValues } from "@/components/employer/job-form";
import Link from "next/link";
import { useState } from "react";

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { organization } = useOrganization();
  const job = useQuery(api.jobs.getById, { id: id as Id<"jobs"> });
  const jobs = useQuery(api.jobs.getOrgJobsWithCounts);
  const updateJob = useMutation(api.jobs.updateJob);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeJobCount = jobs?.filter((j) => j.status === "active").length ?? 0;

  async function handleSubmit(values: JobFormValues) {
    setIsSubmitting(true);
    try {
      await updateJob({
        id: id as Id<"jobs">,
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
        status: values.status as "active" | "closed" | "draft",
      });
      router.push("/employer/dashboard/jobs");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (job === undefined) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  if (job === null) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8 text-center">
        <p className="text-gray-500">Job not found.</p>
        <Link
          href="/employer/dashboard/jobs"
          className="text-blue-700 hover:underline text-sm mt-2 inline-block"
        >
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href="/employer/dashboard/jobs"
          className="text-sm text-blue-700 hover:underline inline-flex items-center gap-1 mb-3"
        >
          ← Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
        <p className="text-gray-500 text-sm mt-1">{job.title}</p>
      </div>

      <JobForm
        orgName={organization?.name ?? job.company}
        activeJobCount={activeJobCount}
        initialValues={{
          title: job.title,
          location: job.location,
          type: job.type,
          salaryMin: job.salary?.min.toString() ?? "",
          salaryMax: job.salary?.max.toString() ?? "",
          currency: job.salary?.currency ?? "$",
          description: job.description,
          requirements: job.requirements,
          featured: job.featured,
          // cast: closed is valid in updateJob but not in createJob
          status: job.status === "closed" ? "draft" : job.status,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        cancelHref="/employer/dashboard/jobs"
      />
    </div>
  );
}
