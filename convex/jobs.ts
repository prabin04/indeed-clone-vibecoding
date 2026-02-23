import { query } from "./_generated/server";
import { v } from "convex/values";

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
    type: v.optional(
      v.union(
        v.literal("full-time"),
        v.literal("part-time"),
        v.literal("contract"),
        v.literal("internship"),
        v.literal("remote")
      )
    ),
  },
  handler: async (ctx, args) => {
    // Full-text search when a query string is provided
    if (args.query && args.query.trim().length > 0) {
      const results = await ctx.db
        .query("jobs")
        .withSearchIndex("search_jobs", (q) => {
          let search = q
            .search("title", args.query!)
            .eq("status", "active");
          if (args.type) search = search.eq("type", args.type);
          if (args.location) search = search.eq("location", args.location);
          return search;
        })
        .take(50);
      return results;
    }

    // No search query — return active jobs filtered by type if provided
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
