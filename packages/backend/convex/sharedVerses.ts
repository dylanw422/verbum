import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./auth";

export const create = mutation({
  args: {
    reference: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.insert("sharedVerses", {
      userId,
      reference: args.reference,
      text: args.text,
      createdAt: Date.now(),
    });
  },
});

export const recent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit ?? 6;

    const shares = await ctx.db
      .query("sharedVerses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return shares;
  },
});
