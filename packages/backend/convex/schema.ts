import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  userStats: defineTable({
    userId: v.string(),
    currentStreak: v.number(),
    highestStreak: v.number(),
    versesEngaged: v.optional(v.number()), // Cumulative total
    totalStudyTime: v.optional(v.number()), // Total time in seconds
    lastEngagedDate: v.string(), // YYYY-MM-DD
  }).index("by_userId", ["userId"]),

  journalEntries: defineTable({
    userId: v.string(), // Using string for better-auth compatibility
    title: v.string(),
    content: v.string(),
    linkedVerse: v.optional(v.string()), // e.g. "John 3:16"
    collections: v.optional(v.array(v.string())), // Array of Collection IDs (or names if simple)
    createdAt: v.string(), // ISO string
  }).index("by_userId", ["userId"]),

  collections: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  dailyVerses: defineTable({
    date: v.string(), // YYYY-MM-DD
    verseText: v.string(),
    reference: v.string(), // e.g. "John 1:5"
    book: v.string(),
    chapter: v.number(),
    verse: v.number(),
  }).index("by_date", ["date"]),
});
