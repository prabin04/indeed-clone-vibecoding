import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

// Shared job type validator
const jobTypeValidator = v.union(
  v.literal("full-time"),
  v.literal("part-time"),
  v.literal("contract"),
  v.literal("internship"),
  v.literal("remote")
);

const salaryValidator = v.object({
  min: v.number(),
  max: v.number(),
  currency: v.string(),
});

// Helper to get org_id from Clerk JWT
// Requires "org_id": "{{org.id}}" added to the Clerk "convex" JWT template
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getOrgId = (identity: NonNullable<Awaited<ReturnType<typeof Object>>>) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (identity as any).org_id as string | undefined;

// ─── Public queries ────────────────────────────────────────────────────────

export const getFeaturedJobs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_featured_status", (q) =>
        q.eq("featured", true).eq("status", "active")
      )
      .order("desc")
      .take(6);
  },
});

export const searchJobs = query({
  args: {
    query: v.optional(v.string()),
    location: v.optional(v.string()),
    type: v.optional(jobTypeValidator),
  },
  handler: async (ctx, args) => {
    if (args.query && args.query.trim().length > 0) {
      const results = await ctx.db
        .query("jobs")
        .withSearchIndex("search_jobs", (q) => {
          let search = q.search("title", args.query!).eq("status", "active");
          if (args.type) search = search.eq("type", args.type);
          if (args.location) search = search.eq("location", args.location);
          return search;
        })
        .take(50);
      return results;
    }

    if (args.type) {
      return await ctx.db
        .query("jobs")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .filter((q) => q.eq(q.field("type"), args.type!))
        .order("desc")
        .take(50);
    }

    return await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .take(50);
  },
});

export const getById = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listJobsPaginated = query({
  args: {
    type: v.optional(jobTypeValidator),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("jobs")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .filter((q) => q.eq(q.field("type"), args.type!))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// ─── Employer queries ──────────────────────────────────────────────────────

export const getOrgJobsWithCounts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgId = (identity as any).org_id as string | undefined;
    if (!orgId) return [];

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .order("desc")
      .collect();

    return await Promise.all(
      jobs.map(async (job) => {
        const apps = await ctx.db
          .query("applications")
          .withIndex("by_jobId", (q) => q.eq("jobId", job._id))
          .collect();
        return { ...job, applicationCount: apps.length };
      })
    );
  },
});

// ─── Employer mutations ────────────────────────────────────────────────────
//
// Role model:
//   org:admin  — can create, edit, close jobs; admin-only in the UI
//   org:member — can create and edit jobs; cannot close
//
// Requires these claims in your Clerk "convex" JWT template:
//   "org_id":   "{{org.id}}"
//   "org_role": "{{org.role}}"

export const createJob = mutation({
  args: {
    company: v.string(), // org display name, passed from client via useOrganization()
    title: v.string(),
    location: v.string(),
    type: jobTypeValidator,
    salary: v.optional(salaryValidator),
    description: v.string(),
    requirements: v.array(v.string()),
    featured: v.boolean(),
    status: v.union(v.literal("active"), v.literal("draft")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgId = (identity as any).org_id as string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgRole = (identity as any).org_role as string | undefined;
    if (!orgId) throw new Error("No active organization");
    if (orgRole !== "org:admin" && orgRole !== "org:member") {
      throw new Error("Must be an org member to post jobs");
    }

    // Starter plan limit: max 3 active jobs.
    // Pro users bypass this via client-side has({ plan: 'pro' }) check before submitting.
    // TODO: Once Clerk Billing plan claims are in the JWT, enforce this server-side.
    if (args.status === "active") {
      const activeJobs = await ctx.db
        .query("jobs")
        .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      if (activeJobs.length >= 3) {
        throw new Error(
          "STARTER_LIMIT: You have reached the 3 active job limit. Upgrade to Pro for unlimited postings."
        );
      }
    }

    return await ctx.db.insert("jobs", {
      orgId,
      title: args.title,
      company: args.company,
      location: args.location,
      type: args.type,
      salary: args.salary,
      description: args.description,
      requirements: args.requirements,
      featured: args.featured,
      status: args.status,
      postedBy: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const updateJob = mutation({
  args: {
    id: v.id("jobs"),
    title: v.string(),
    location: v.string(),
    type: jobTypeValidator,
    salary: v.optional(salaryValidator),
    description: v.string(),
    requirements: v.array(v.string()),
    featured: v.boolean(),
    status: v.union(
      v.literal("active"),
      v.literal("closed"),
      v.literal("draft")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgId = (identity as any).org_id as string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgRole = (identity as any).org_role as string | undefined;
    if (!orgId) throw new Error("No active organization");
    if (orgRole !== "org:admin" && orgRole !== "org:member") {
      throw new Error("Must be an org member to edit jobs");
    }

    const job = await ctx.db.get(args.id);
    if (!job || job.orgId !== orgId) throw new Error("Not authorized");

    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const closeJob = mutation({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgId = (identity as any).org_id as string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgRole = (identity as any).org_role as string | undefined;
    if (!orgId) throw new Error("No active organization");
    if (orgRole !== "org:admin") {
      throw new Error("Only org admins can close job listings");
    }

    const job = await ctx.db.get(args.id);
    if (!job || job.orgId !== orgId) throw new Error("Not authorized");

    await ctx.db.patch(args.id, { status: "closed" });
  },
});
