/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_analyzeMedia from "../actions/analyzeMedia.js";
import type * as actions_migrateMediaTypes from "../actions/migrateMediaTypes.js";
import type * as actions_migrateMockData from "../actions/migrateMockData.js";
import type * as mutations_media from "../mutations/media.js";
import type * as mutations_mediaTags from "../mutations/mediaTags.js";
import type * as mutations_mediaTypes from "../mutations/mediaTypes.js";
import type * as queries_media from "../queries/media.js";
import type * as queries_mediaTags from "../queries/mediaTags.js";
import type * as queries_mediaTypes from "../queries/mediaTypes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/analyzeMedia": typeof actions_analyzeMedia;
  "actions/migrateMediaTypes": typeof actions_migrateMediaTypes;
  "actions/migrateMockData": typeof actions_migrateMockData;
  "mutations/media": typeof mutations_media;
  "mutations/mediaTags": typeof mutations_mediaTags;
  "mutations/mediaTypes": typeof mutations_mediaTypes;
  "queries/media": typeof queries_media;
  "queries/mediaTags": typeof queries_mediaTags;
  "queries/mediaTypes": typeof queries_mediaTypes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
