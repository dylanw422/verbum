import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "Generate Daily Bread",
  { hourUTC: 0, minuteUTC: 0 },
  internal.dailyBread.fetchAndStoreDailyVerse
);

export default crons;
