import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  jobs: defineTable({
    orgId: v.string(), // Clerk organization ID — which company posted it
    title: v.string(),
    company: v.string(),
    location: v.string(),
    type: v.union(
      v.literal("full-time"),
      v.literal("part-time"),
      v.literal("contract"),
      v.literal("internship"),
      v.literal("remote")
    ),
    salary: v.optional(
      v.object({ min: v.number(), max: v.number(), currency: v.string() })
    ),
    description: v.string(),
    requirements: v.array(v.string()),
    featured: v.boolean(), // gated behind Pro plan
    status: v.union(
      v.literal("active"),
      v.literal("closed"),
      v.literal("draft")
    ),
    postedBy: v.string(), // Clerk userId
    createdAt: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_status", ["status"])
    .index("by_featured_status", ["featured", "status"])
    .searchIndex("search_jobs", {
      searchField: "title",
      filterFields: ["location", "type", "status"],
    }),

  applications: defineTable({
    jobId: v.id("jobs"),
    applicantId: v.string(), // Clerk userId
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("rejected"),
      v.literal("interview")
    ),
    resumeUrl: v.optional(v.string()),
    coverLetter: v.optional(v.string()),
    appliedAt: v.number(),
  })
    .index("by_jobId", ["jobId"])
    .index("by_applicantId", ["applicantId"])
    .index("by_jobId_applicantId", ["jobId", "applicantId"]),
});
