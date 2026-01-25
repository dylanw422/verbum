import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";
import path from "path";
import { z } from "zod";

// Try root .env first
config({ path: path.join(process.cwd(), ".env") });
// Try up one level (if in apps/web or packages/env)
config({ path: path.join(process.cwd(), "..", ".env") });
// Try up two levels (if in apps/web/src etc)
config({ path: path.join(process.cwd(), "..", "..", ".env") });

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    OPENAI_API_KEY: z.string().min(1).optional(),
    GROQ_API_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
