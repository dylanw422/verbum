import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getIsAdmin } from "./auth";

export const addAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const isAdmin = await getIsAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized: Only admins can add other admins");
    }

    const existing = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("Email is already an admin");
    }

    await ctx.db.insert("admins", {
      email: args.email,
    });
  },
});
