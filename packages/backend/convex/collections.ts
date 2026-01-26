import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const getCollections = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("collections")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const createCollection = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Check if exists
    const existing = await ctx.db
      .query("collections")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("name"), args.name))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("collections", {
      userId: user._id,
      name: args.name,
      color: args.color,
    });
  },
});
