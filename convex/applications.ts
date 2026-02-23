import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    jobId: v.id("jobs"),
    coverLetter: v.optional(v.string()),
    resumeUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const applicantId = identity.subject;

    // Prevent duplicate applications
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_jobId_applicantId", (q) =>
        q.eq("jobId", args.jobId).eq("applicantId", applicantId)
      )
      .unique();

    if (existing) throw new Error("Already applied to this job");

    // Verify the job is still active
    const job = await ctx.db.get(args.jobId);
    if (!job || job.status !== "active") {
      throw new Error("Job is no longer accepting applications");
    }

    return await ctx.db.insert("applications", {
      jobId: args.jobId,
      applicantId,
      status: "pending",
      coverLetter: args.coverLetter,
      resumeUrl: args.resumeUrl,
      appliedAt: Date.now(),
    });
  },
});

export const getMyApplications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_applicantId", (q) =>
        q.eq("applicantId", identity.subject)
      )
      .order("desc")
      .collect();

    const withJobs = await Promise.all(
      applications.map(async (app) => {
        const job = await ctx.db.get(app.jobId);
        return { ...app, job };
      })
    );

    return withJobs;
  },
});

export const hasApplied = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const existing = await ctx.db
      .query("applications")
      .withIndex("by_jobId_applicantId", (q) =>
        q.eq("jobId", args.jobId).eq("applicantId", identity.subject)
      )
      .unique();

    return existing !== null;
  },
});

// ─── Employer queries/mutations ────────────────────────────────────────────

export const getOrgApplications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgId = (identity as any).org_id as string | undefined;
    if (!orgId) return [];

    // Fetch all jobs belonging to this org
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .collect();

    const jobMap = new Map(jobs.map((j) => [j._id.toString(), j]));

    // Fetch applications for all org jobs in parallel
    const batches = await Promise.all(
      jobs.map((job) =>
        ctx.db
          .query("applications")
          .withIndex("by_jobId", (q) => q.eq("jobId", job._id))
          .collect()
      )
    );

    return batches
      .flat()
      .map((app) => ({ ...app, job: jobMap.get(app.jobId.toString()) }))
      .sort((a, b) => b.appliedAt - a.appliedAt);
  },
});

export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("interview"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgId = (identity as any).org_id as string | undefined;
    if (!orgId) throw new Error("No active organization");

    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");

    // Verify the application's job belongs to this org
    const job = await ctx.db.get(application.jobId);
    if (!job || job.orgId !== orgId) throw new Error("Not authorized");

    await ctx.db.patch(args.applicationId, { status: args.status });
  },
});
