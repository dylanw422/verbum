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

export const updateStreak = mutation({
  args: {
    clientDate: v.string(), // YYYY-MM-DD
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
        lastEngagedDate: args.clientDate,
      });
      return { streak: 1, newRecord: true };
    }

    if (stats.lastEngagedDate === args.clientDate) {
      // Already engaged today
      return { streak: stats.currentStreak, newRecord: false };
    }

    // Calculate if it's consecutive
    const lastDate = new Date(stats.lastEngagedDate);
    const clientDate = new Date(args.clientDate);
    
    // Normalize to midnight UTC for comparison to avoid timezone mess if inputs are proper YYYY-MM-DD
    // But assuming YYYY-MM-DD strings are local days.
    // Calculate difference in days.
    const diffTime = Math.abs(clientDate.getTime() - lastDate.getTime());
    // Note: This date math is a bit fragile with simple Date objects due to UTC assumption.
    // Better to use strict string parsing or a library, but strictly:
    // If strings are "2023-10-27" and "2023-10-28", simple Date parsing might work if environment consistent.
    // Let's do simple string comparison for "Yesterday".
    
    // Check if yesterday.
    const yesterday = new Date(clientDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Wait, clientDate "2023-10-28" -> Date uses UTC? or Local?
    // new Date("2023-10-28") is UTC.
    // So setDate(-1) works in UTC.
    // toISOString().split('T')[0] gives YYYY-MM-DD.
    
    let newStreak = 1;
    if (stats.lastEngagedDate === yesterdayStr) {
      newStreak = stats.currentStreak + 1;
    } else {
        // Double check simply by day difference
        // If the difference is exactly 1 day.
        // Actually, using the string logic above is safer if we trust the input format.
    }
    
    // Let's rely on the client passing correct "today".
    // If lastEngagedDate was "2023-10-27" and today is "2023-10-28", streak continues.
    // If today is "2023-10-29", streak breaks.
    
    // Simple check: Is lastEngagedDate == yesterday?
    // Re-calculating yesterday from clientDate string:
    const d = new Date(args.clientDate);
    // d is now UTC midnight of that date.
    d.setUTCDate(d.getUTCDate() - 1);
    const yesterdayString = d.toISOString().split("T")[0];

    if (stats.lastEngagedDate === yesterdayString) {
        newStreak = stats.currentStreak + 1;
    }

    const newHighest = Math.max(stats.highestStreak, newStreak);
    const newRecord = newStreak > stats.highestStreak;

    await ctx.db.patch(stats._id, {
      currentStreak: newStreak,
      highestStreak: newHighest,
      lastEngagedDate: args.clientDate,
    });

    return { streak: newStreak, newRecord };
  },
});
