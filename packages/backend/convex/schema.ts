import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  userStats: defineTable({
    userId: v.string(),
    currentStreak: v.number(),
    highestStreak: v.number(),
    versesEngaged: v.optional(v.number()), // Cumulative total
    lastEngagedDate: v.string(), // YYYY-MM-DD
  }).index("by_userId", ["userId"]),

  journalEntries: defineTable({
    userId: v.string(), // Using string for better-auth compatibility
    title: v.string(),
    content: v.string(),
    linkedVerse: v.optional(v.string()), // e.g. "John 3:16"
    createdAt: v.string(), // ISO string
  }).index("by_userId", ["userId"]),
});
