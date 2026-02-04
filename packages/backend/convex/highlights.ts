import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./auth";

export const create = mutation({
  args: {
    book: v.string(),
    chapter: v.number(),
    verse: v.string(),
    indices: v.array(v.number()),
    text: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check for existing overlapping highlights in the same chapter
    const existingHighlights = await ctx.db
      .query("highlights")
      .withIndex("by_userId_book_chapter", (q) =>
        q
          .eq("userId", userId)
          .eq("book", args.book)
          .eq("chapter", args.chapter)
      )
      .collect();

    const newIndicesSet = new Set(args.indices);

    for (const h of existingHighlights) {
      // Check for overlap: does the existing highlight share any indices with the new one?
      // Or strict subset? Prompt says "replace previous with new".
      // We'll treat any overlap as a signal to replace the old one to avoid clutter.
      const hasOverlap = h.indices.some(i => newIndicesSet.has(i));
      
      if (hasOverlap) {
        await ctx.db.delete(h._id);
      }
    }
    
    await ctx.db.insert("highlights", {
      userId,
      book: args.book,
      chapter: args.chapter,
      verse: args.verse,
      indices: args.indices,
      text: args.text,
      color: args.color || "rose",
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
    args: {
        id: v.id("highlights"),
    },
    handler: async (ctx, args) => {
        const userId = await getUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const highlight = await ctx.db.get(args.id);
        if (!highlight) return;

        if (highlight.userId !== userId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    }
});

export const list = query({
  args: {
    book: v.string(),
    chapter: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return [];
    }

    const highlights = await ctx.db
      .query("highlights")
      .withIndex("by_userId_book_chapter", (q) =>
        q
          .eq("userId", userId)
          .eq("book", args.book)
          .eq("chapter", args.chapter)
      )
      .collect();

    return highlights;
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

    const highlights = await ctx.db
      .query("highlights")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return highlights;
  },
});
