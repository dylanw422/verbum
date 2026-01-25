"use server";

import { redis } from "@/lib/redis";

export async function updatePresence(book: string, chapter: string, sessionId: string) {
  const key = `reading:${book}:${chapter}`;
  const now = Date.now();
  // Users are considered "active" if they've pinged in the last 60 seconds
  const timeout = 60 * 1000; 

  try {
    const pipeline = redis.pipeline();

    // Update the score (timestamp) for this user
    pipeline.zadd(key, { score: now, member: sessionId });

    // Remove users who are older than the cutoff
    pipeline.zremrangebyscore(key, 0, now - timeout);

    // Get the new count
    pipeline.zcard(key);

    console.log(`[Presence] Updating key: ${key}, Session: ${sessionId}`);

    const results = await pipeline.exec();
    
    console.log(`[Presence] Redis results:`, results);

    // The result of the 3rd command (zcard) is the count
    const activeCount = results[2] as number;

    return { success: true, count: activeCount };
  } catch (error) {
    console.error("Error updating presence:", error);
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.error("[Presence] Missing Upstash Env Variables!");
    }
    return { success: false, count: 0 };
  }
}
