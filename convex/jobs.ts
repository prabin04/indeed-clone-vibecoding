import { query } from "./_generated/server";

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
