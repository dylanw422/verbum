import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const getEntries = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return [];

    const entries = await ctx.db
      .query("journalEntries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);

    return entries;
  },
});

export const createEntry = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    linkedVerse: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    await ctx.db.insert("journalEntries", {
      userId: user._id,
      title: args.title,
      content: args.content,
      linkedVerse: args.linkedVerse,
      createdAt: new Date().toISOString(),
    });
  },
});
