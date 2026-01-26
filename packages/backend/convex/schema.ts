import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  userStats: defineTable({
    userId: v.string(),
    currentStreak: v.number(),
    highestStreak: v.number(),
    lastEngagedDate: v.string(), // YYYY-MM-DD
  }).index("by_userId", ["userId"]),
});
