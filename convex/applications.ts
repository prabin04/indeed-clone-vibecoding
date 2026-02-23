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

    // Join with job details
    const withJobs = await Promise.all(
      applications.map(async (app) => {
        const job = await ctx.db.get(app.jobId);
        return { ...app, job };
      })
    );

    return withJobs;
  },
});

// Check if the current user has already applied to a specific job
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
