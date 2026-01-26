import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;

    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    return stats;
  },
});

export const logSession = mutation({
  args: {
    clientDate: v.string(), // YYYY-MM-DD
    versesRead: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!stats) {
      // First time engagement
      await ctx.db.insert("userStats", {
        userId: user._id,
        currentStreak: 1,
        highestStreak: 1,
        versesEngaged: args.versesRead,
        lastEngagedDate: args.clientDate,
      });
      return { streak: 1, newRecord: true };
    }

    // Always increment verses engaged
    const currentVerses = stats.versesEngaged ?? 0;
    const newVerses = currentVerses + args.versesRead;

    // Streak Logic
    let newStreak = stats.currentStreak;
    
    // Normalize logic
    const lastDate = new Date(stats.lastEngagedDate);
    const clientDate = new Date(args.clientDate);
    
    // Check if yesterday.
    const yesterday = new Date(clientDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // If different day, calculate streak
    if (stats.lastEngagedDate !== args.clientDate) {
        if (stats.lastEngagedDate === yesterdayStr) {
            newStreak = stats.currentStreak + 1;
        } else {
            // Missed a day (or more)
            newStreak = 1;
        }
    }

    const newHighest = Math.max(stats.highestStreak, newStreak);
    const newRecord = newStreak > stats.highestStreak;

    await ctx.db.patch(stats._id, {
      currentStreak: newStreak,
      highestStreak: newHighest,
      versesEngaged: newVerses,
      lastEngagedDate: args.clientDate,
    });

    return { streak: newStreak, newRecord };
  },
});
