import { createAuthClient } from "better-auth/react";
import {
  convexClient,
  crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";

const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL;
if (!convexSiteUrl) {
  throw new Error("Missing VITE_CONVEX_SITE_URL environment variable");
}

// Ensure we have a full absolute URL (remove any trailing slashes and spaces)
const baseURL = convexSiteUrl.trim().replace(/\/+$/, "");

export const authClient = createAuthClient({
  baseURL: baseURL,
  plugins: [convexClient(), crossDomainClient()],
});
