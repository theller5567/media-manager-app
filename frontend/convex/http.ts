import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Register BetterAuth API routes
// This handles all authentication endpoints like /api/auth/signin, /api/auth/signup, etc.
authComponent.registerRoutes(http, createAuth, { cors: true });

export default http;
