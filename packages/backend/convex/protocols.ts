import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, getIsAdmin, authComponent } from "./auth";

// --- Seed Data (Temporary/Init) ---
const SEED_PROTOCOLS = [
  {
    title: "The Gospels",
    description: "Journey through the life and ministry of Jesus Christ across all four accounts.",
    steps: [
      { book: "Matthew", chapter: 1 }, { book: "Matthew", chapter: 2 }, { book: "Matthew", chapter: 3 },
      { book: "Mark", chapter: 1 }, { book: "Mark", chapter: 2 },
      { book: "Luke", chapter: 1 }, { book: "Luke", chapter: 2 },
      { book: "John", chapter: 1 }, { book: "John", chapter: 2 },
    ], // Simplified for example
    isPublic: true,
  },
  {
    title: "Wisdom Literature",
    description: "Ancient wisdom from Psalms, Proverbs, and Ecclesiastes.",
    steps: [
      { book: "Psalms", chapter: 1 }, { book: "Psalms", chapter: 23 }, { book: "Psalms", chapter: 119 },
      { book: "Proverbs", chapter: 1 }, { book: "Proverbs", chapter: 3 },
      { book: "Ecclesiastes", chapter: 1 }, { book: "Ecclesiastes", chapter: 3 },
    ],
    isPublic: true,
  },
  {
    title: "Pauline Epistles",
    description: "The letters of Paul to the early church.",
    steps: [
      { book: "Romans", chapter: 1 }, { book: "Romans", chapter: 8 },
      { book: "1 Corinthians", chapter: 13 },
      { book: "Galatians", chapter: 5 },
      { book: "Ephesians", chapter: 2 },
      { book: "Philippians", chapter: 4 },
    ],
    isPublic: true,
  },
];

export const seedProtocols = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if protocols exist
    const existing = await ctx.db.query("protocols").take(1);
    if (existing.length > 0) return;

    for (const p of SEED_PROTOCOLS) {
      await ctx.db.insert("protocols", p);
    }
    return "Seeded protocols";
  },
});

// --- Public Queries ---

export const listSystemProtocols = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("protocols").filter(q => q.eq(q.field("isPublic"), true)).collect();
  },
});

export const getUserProtocols = query({
  args: { status: v.optional(v.string()) }, // "active" or "completed" or undefined for all
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return [];
    
    const userId = user._id;
    if (!userId) return [];

    let q = ctx.db.query("userProtocols").withIndex("by_userId_status", (q) => q.eq("userId", userId));
    
    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }

    const userProtos = await q.collect();

    // Enrich with protocol details
    const enriched = await Promise.all(userProtos.map(async (up) => {
      const protocol = await ctx.db.get(up.protocolId);
      return {
        ...up,
        protocolTitle: protocol?.title || "Unknown Protocol",
        protocolDescription: protocol?.description || "",
        totalSteps: protocol?.steps.length || 0,
        steps: protocol?.steps || [],
      };
    }));

    return enriched;
  },
});

export const getUserProtocol = query({
  args: { userProtocolId: v.id("userProtocols") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;
    const userId = user._id;

    const userProto = await ctx.db.get(args.userProtocolId);
    if (!userProto || userProto.userId !== userId) return null;

    const protocol = await ctx.db.get(userProto.protocolId);
    if (!protocol) return null;

    return {
      ...userProto,
      protocolTitle: protocol.title,
      protocolDescription: protocol.description,
      totalSteps: protocol.steps.length,
      steps: protocol.steps,
    };
  },
});

export const getProtocolDetails = query({
  args: { protocolId: v.id("protocols") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.protocolId);
  },
});


// --- Mutations ---

export const subscribeToProtocol = mutation({
  args: { protocolId: v.id("protocols") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Unauthorized: No active session found");
    
    const userId = user._id;
    if (!userId) {
        throw new Error(`User found but ID missing. Keys: ${Object.keys(user).join(", ")}`);
    }

    // Check if already subscribed and active
    const existing = await ctx.db
      .query("userProtocols")
      .withIndex("by_userId_protocolId", (q) => q.eq("userId", userId).eq("protocolId", args.protocolId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (existing) {
      return { success: false, message: "Already subscribed to this protocol." };
    }

    const id = await ctx.db.insert("userProtocols", {
      userId,
      protocolId: args.protocolId,
      startDate: new Date().toISOString(),
      completedSteps: [],
      status: "active",
    });

    return { success: true, id };
  },
});

export const toggleStepCompletion = mutation({
  args: { 
    userProtocolId: v.id("userProtocols"),
    stepIndex: v.number(),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
     const user = await authComponent.safeGetAuthUser(ctx);
     if (!user) throw new Error("Unauthorized: No active session found");
     
     const userId = user._id;
     if (!userId) throw new Error("User found but ID missing");

     const userProto = await ctx.db.get(args.userProtocolId);
     if (!userProto || userProto.userId !== userId) throw new Error("Not found or unauthorized");

     let newCompleted = [...userProto.completedSteps];
     
     if (args.completed) {
       if (!newCompleted.includes(args.stepIndex)) {
         newCompleted.push(args.stepIndex);
       }
     } else {
       newCompleted = newCompleted.filter(i => i !== args.stepIndex);
     }

     // Sort for neatness
     newCompleted.sort((a, b) => a - b);

     // Check if all steps completed (requires fetching protocol def)
     const protocol = await ctx.db.get(userProto.protocolId);
     let status = userProto.status;
     
     if (protocol) {
        if (newCompleted.length >= protocol.steps.length) {
          status = "completed";
        } else {
          status = "active"; // Revert to active if unchecking last step
        }
     }

     await ctx.db.patch(args.userProtocolId, {
       completedSteps: newCompleted,
       status,
     });

     return { success: true };
  }
});

// Auto-track progress from player
export const checkAndMarkProgress = mutation({
  args: { book: v.string(), chapter: v.number() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return; // Silent fail if no user
    const userId = user._id;

    // Get all active protocols for user
    const activeProtos = await ctx.db
      .query("userProtocols")
      .withIndex("by_userId_status", (q) => q.eq("userId", userId).eq("status", "active"))
      .collect();

    if (activeProtos.length === 0) return;

    // Check each protocol
    for (const userProto of activeProtos) {
      const protocol = await ctx.db.get(userProto.protocolId);
      if (!protocol) continue;

      // Sequential Constraint: Find the FIRST incomplete step
      // We only want to auto-complete the *next* logical step in the plan.
      let nextStepIndex = -1;
      for (let i = 0; i < protocol.steps.length; i++) {
        if (!userProto.completedSteps.includes(i)) {
          nextStepIndex = i;
          break;
        }
      }

      // If all steps are complete or no next step found, skip
      if (nextStepIndex === -1) continue;

      const step = protocol.steps[nextStepIndex];

      // Only mark if the read chapter matches THIS specific step
      if (step.book === args.book && step.chapter === args.chapter) {
        const newCompleted = [...userProto.completedSteps, nextStepIndex];
        newCompleted.sort((a, b) => a - b);

        let status = userProto.status;
        if (newCompleted.length >= protocol.steps.length) {
          status = "completed";
        }

        await ctx.db.patch(userProto._id, {
          completedSteps: newCompleted,
          status,
        });
      }
    }
  },
});

export const createProtocol = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    steps: v.array(v.object({ book: v.string(), chapter: v.number() })),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getIsAdmin(ctx);
    if (!isAdmin) throw new Error("Unauthorized");

    await ctx.db.insert("protocols", {
      title: args.title,
      description: args.description,
      steps: args.steps,
      isPublic: args.isPublic,
    });
  },
});

export const updateProtocol = mutation({
  args: {
    id: v.id("protocols"),
    title: v.string(),
    description: v.string(),
    steps: v.array(v.object({ book: v.string(), chapter: v.number() })),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const isAdmin = await getIsAdmin(ctx);
    if (!isAdmin) throw new Error("Unauthorized");

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      steps: args.steps,
      isPublic: args.isPublic,
    });
  },
});

export const deleteProtocol = mutation({
  args: { protocolId: v.id("protocols") },
  handler: async (ctx, args) => {
    const isAdmin = await getIsAdmin(ctx);
    if (!isAdmin) throw new Error("Unauthorized");

    // Delete all associated user protocols first
    const userProtos = await ctx.db
      .query("userProtocols")
      .withIndex("by_protocolId", (q) => q.eq("protocolId", args.protocolId))
      .collect();

    for (const up of userProtos) {
      await ctx.db.delete(up._id);
    }

    // Finally delete the protocol itself
    await ctx.db.delete(args.protocolId);
  },
});

export const deactivateProtocol = mutation({
  args: { userProtocolId: v.id("userProtocols") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const userProto = await ctx.db.get(args.userProtocolId);
    if (!userProto || userProto.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.userProtocolId, {
      status: "inactive",
    });
  },
});
