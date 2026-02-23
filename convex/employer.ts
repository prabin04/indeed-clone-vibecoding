import { query } from "./_generated/server";

// NOTE: org_id is a custom claim from the Clerk JWT template.
// In the Clerk Dashboard → JWT Templates → "convex" template, add:
//   "org_id": "{{org.id}}"
//   "org_role": "{{org.role}}"
// Without this, orgId will be undefined in all employer queries.

export const getOrgStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgId = (identity as any).org_id as string | undefined;
    if (!orgId) return null;

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .collect();

    const activeJobs = jobs.filter((j) => j.status === "active").length;
    const draftJobs = jobs.filter((j) => j.status === "draft").length;

    // Parallel-fetch application counts for all org jobs
    const applicationBatches = await Promise.all(
      jobs.map((job) =>
        ctx.db
          .query("applications")
          .withIndex("by_jobId", (q) => q.eq("jobId", job._id))
          .collect()
      )
    );
    const applicationCount = applicationBatches.reduce(
      (sum, apps) => sum + apps.length,
      0
    );

    return {
      totalJobs: jobs.length,
      activeJobs,
      draftJobs,
      applicationCount,
    };
  },
});

export const getOrgJobs = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgId = (identity as any).org_id as string | undefined;
    if (!orgId) return [];

    return await ctx.db
      .query("jobs")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .order("desc")
      .collect();
  },
});
