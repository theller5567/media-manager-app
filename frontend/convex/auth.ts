import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

// Support both local development and production URLs
// SITE_URL should be set in Convex Dashboard environment variables
// 
// For local dev: Set SITE_URL=http://localhost:5173 in Convex Dashboard
// For production: Set SITE_URL=https://your-vercel-app.vercel.app in Convex Dashboard
//
// The trustedOrigins array below allows requests from:
// - The configured SITE_URL (from Convex environment variables)
// - Common localhost ports (for local development)
// - Any additional origins specified in ADDITIONAL_ORIGINS (comma-separated)
const defaultSiteUrl = process.env.SITE_URL || "http://localhost:5173";

// Support multiple origins for CORS (local dev + production)
// This allows requests from both localhost and your Vercel deployment
// without needing to switch configurations
const trustedOrigins = [
  defaultSiteUrl, // Primary origin from SITE_URL environment variable
  "http://localhost:5173", // Default Vite dev server
  "http://localhost:3000", // Alternative dev port
  "http://localhost:5174", // Alternative Vite port
  // Support additional origins via environment variable (comma-separated)
  ...(process.env.ADDITIONAL_ORIGINS ? process.env.ADDITIONAL_ORIGINS.split(",").map(url => url.trim()) : []),
].filter(Boolean); // Remove any empty strings

export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * Create BetterAuth instance.
 * Uses SITE_URL from Convex env for redirects. Do NOT override to localhost here, or
 * production logins will redirect to localhost.
 * - Convex dev: set SITE_URL=http://localhost:5173 in Convex Dashboard
 * - Convex prod: set SITE_URL=https://your-app.vercel.app in Convex Dashboard
 */
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    trustedOrigins: trustedOrigins,
    database: authComponent.adapter(ctx),
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      // The cross domain plugin is required for client side frameworks
      crossDomain({ siteUrl: defaultSiteUrl }),
      // The Convex plugin is required for Convex compatibility
      convex({ authConfig }),
    ],
  });
};
