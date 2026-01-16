import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: "", // Invalid configuration
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});
