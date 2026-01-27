import { v } from "convex/values";
import { internalAction, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

const BIBLE_JSON_URL = "https://grnkacu5pyiersbw.public.blob.vercel-storage.com/BSB.json";

type BibleData = Record<string, Record<string, Record<string, string>>>;

export const get = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0]!;
    const dailyVerse = await ctx.db
      .query("dailyVerses")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    return dailyVerse;
  },
});

export const saveDailyVerse = internalMutation({
  args: {
    date: v.string(),
    verseText: v.string(),
    reference: v.string(),
    book: v.string(),
    chapter: v.number(),
    verse: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if entry already exists for this date to avoid duplicates
    const existing = await ctx.db
      .query("dailyVerses")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("dailyVerses", args);
  },
});

export const fetchAndStoreDailyVerse = internalAction({
  args: {},
  handler: async (ctx) => {
    const response = await fetch(BIBLE_JSON_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch Bible JSON: ${response.statusText}`);
    }

    const bibleData = (await response.json()) as BibleData;
    const books = Object.keys(bibleData);
    
    // Simple random selection
    const randomBook = books[Math.floor(Math.random() * books.length)]!;
    const chapters = Object.keys(bibleData[randomBook]!);
    const randomChapter = chapters[Math.floor(Math.random() * chapters.length)]!;
    const verses = Object.keys(bibleData[randomBook]![randomChapter]!);
    const randomVerseNum = verses[Math.floor(Math.random() * verses.length)]!;
    
    const verseText = bibleData[randomBook]![randomChapter]![randomVerseNum];
    const reference = `${randomBook} ${randomChapter}:${randomVerseNum}`;
    
    const today = new Date().toISOString().split("T")[0]!;

    await ctx.runMutation(internal.dailyBread.saveDailyVerse, {
      date: today,
      verseText: verseText!,
      reference,
      book: randomBook,
      chapter: parseInt(randomChapter),
      verse: parseInt(randomVerseNum),
    });
  },
});

