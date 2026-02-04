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

export const getEntriesCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return 0;

    const entries = await ctx.db
      .query("journalEntries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    
    return entries.length;
  },
});

export const getLinkedEntries = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return [];

    const limit = args.limit ?? 6;

    const entries = await ctx.db
      .query("journalEntries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const linked = entries.filter((entry) => !!entry.linkedVerse);

    return linked.slice(0, limit);
  },
});

export const createEntry = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    linkedVerse: v.optional(v.string()),
    collections: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    await ctx.db.insert("journalEntries", {
      userId: user._id,
      title: args.title,
      content: args.content,
      linkedVerse: args.linkedVerse,
            collections: args.collections,
            createdAt: new Date().toISOString(),
          });
        },
      });
      
      export const deleteEntry = mutation({
        args: { id: v.id("journalEntries") },
        handler: async (ctx, args) => {
          const user = await authComponent.safeGetAuthUser(ctx);
          if (!user) throw new Error("Unauthorized");
      
          const entry = await ctx.db.get(args.id);
          if (!entry) throw new Error("Entry not found");
          if (entry.userId !== user._id) throw new Error("Unauthorized");
      
          await ctx.db.delete(args.id);
        },
      });
      
