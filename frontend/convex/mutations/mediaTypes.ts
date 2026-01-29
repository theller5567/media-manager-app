import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Create a new MediaType
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    allowedFormats: v.array(v.string()),
    fields: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        label: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("number"),
          v.literal("date"),
          v.literal("select"),
          v.literal("boolean"),
          v.literal("url")
        ),
        required: v.boolean(),
        options: v.optional(v.array(v.string())),
        validationRegex: v.optional(v.string()),
        placeholder: v.optional(v.string()),
      })
    ),
    defaultTags: v.array(v.string()),
    dimensionConstraints: v.optional(
      v.object({
        enabled: v.boolean(),
        aspectRatio: v.object({
          label: v.string(),
          value: v.union(v.number(), v.null()),
        }),
        minWidth: v.optional(v.number()),
        minHeight: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Validate name uniqueness (case-insensitive)
    const normalizedName = args.name.toLowerCase().trim();
    const existingMediaTypes = await ctx.db
      .query("mediaTypes")
      .collect();
    
    const nameExists = existingMediaTypes.some(
      (mt) => mt.name.toLowerCase() === normalizedName
    );
    
    if (nameExists) {
      throw new Error(`MediaType with name "${args.name}" already exists`);
    }
    
    // Validate color format (hex)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(args.color)) {
      throw new Error("Invalid hex color format (e.g., #3b82f6)");
    }
    
    // Validate at least one allowed format
    if (args.allowedFormats.length === 0) {
      throw new Error("At least one file format must be selected");
    }
    
    // Validate fields
    const fieldNames: string[] = [];
    for (const field of args.fields) {
      // Check field name uniqueness within MediaType
      if (fieldNames.includes(field.name)) {
        throw new Error(`Duplicate field name: "${field.name}"`);
      }
      fieldNames.push(field.name);
      
      // Validate select fields have options
      if (field.type === "select" && (!field.options || field.options.length === 0)) {
        throw new Error(`Select field "${field.label}" must have at least one option`);
      }
      
      // Validate regex if provided
      if (field.validationRegex) {
        try {
          new RegExp(field.validationRegex);
        } catch (e) {
          throw new Error(`Invalid regex pattern for field "${field.label}"`);
        }
      }
    }
    
    const mediaTypeId = await ctx.db.insert("mediaTypes", {
      name: args.name.trim(),
      description: args.description,
      color: args.color,
      allowedFormats: args.allowedFormats,
      fields: args.fields,
      defaultTags: args.defaultTags,
      dimensionConstraints: args.dimensionConstraints,
    });
    
    // Return the document as-is (matching media mutations pattern)
    // Frontend queries will handle converting _creationTime to createdAt/updatedAt Date objects
    return await ctx.db.get(mediaTypeId);
  },
});

/**
 * Update an existing MediaType
 */
export const update = mutation({
  args: {
    id: v.id("mediaTypes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    allowedFormats: v.optional(v.array(v.string())),
    fields: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          label: v.string(),
          type: v.union(
            v.literal("text"),
            v.literal("number"),
            v.literal("date"),
            v.literal("select"),
            v.literal("boolean"),
            v.literal("url")
          ),
          required: v.boolean(),
          options: v.optional(v.array(v.string())),
          validationRegex: v.optional(v.string()),
          placeholder: v.optional(v.string()),
        })
      )
    ),
    defaultTags: v.optional(v.array(v.string())),
    dimensionConstraints: v.optional(
      v.object({
        enabled: v.boolean(),
        aspectRatio: v.object({
          label: v.string(),
          value: v.union(v.number(), v.null()),
        }),
        minWidth: v.optional(v.number()),
        minHeight: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existingMediaType = await ctx.db.get(args.id);
    if (!existingMediaType) {
      throw new Error(`MediaType with id ${args.id} not found`);
    }
    
    // Validate name uniqueness if name is being updated
    if (args.name !== undefined) {
      const normalizedName = args.name.toLowerCase().trim();
      const existingMediaTypes = await ctx.db
        .query("mediaTypes")
        .collect();
      
      const nameExists = existingMediaTypes.some(
        (mt) => mt.name.toLowerCase() === normalizedName && mt._id !== args.id
      );
      
      if (nameExists) {
        throw new Error(`MediaType with name "${args.name}" already exists`);
      }
    }
    
    // Validate color format if color is being updated
    if (args.color !== undefined) {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexColorRegex.test(args.color)) {
        throw new Error("Invalid hex color format (e.g., #3b82f6)");
      }
    }
    
    // Validate allowed formats if being updated
    if (args.allowedFormats !== undefined && args.allowedFormats.length === 0) {
      throw new Error("At least one file format must be selected");
    }
    
    // Validate fields if being updated
    if (args.fields !== undefined) {
      const fieldNames: string[] = [];
      for (const field of args.fields) {
        // Check field name uniqueness within MediaType
        if (fieldNames.includes(field.name)) {
          throw new Error(`Duplicate field name: "${field.name}"`);
        }
        fieldNames.push(field.name);
        
        // Validate select fields have options
        if (field.type === "select" && (!field.options || field.options.length === 0)) {
          throw new Error(`Select field "${field.label}" must have at least one option`);
        }
        
        // Validate regex if provided
        if (field.validationRegex) {
          try {
            new RegExp(field.validationRegex);
          } catch (e) {
            throw new Error(`Invalid regex pattern for field "${field.label}"`);
          }
        }
      }
    }
    
    // Build update object
    const updateData: any = {};
    
    if (args.name !== undefined) {
      updateData.name = args.name.trim();
    }
    if (args.description !== undefined) {
      updateData.description = args.description;
    }
    if (args.color !== undefined) {
      updateData.color = args.color;
    }
    if (args.allowedFormats !== undefined) {
      updateData.allowedFormats = args.allowedFormats;
    }
    if (args.fields !== undefined) {
      updateData.fields = args.fields;
    }
    if (args.defaultTags !== undefined) {
      updateData.defaultTags = args.defaultTags;
    }
    if (args.dimensionConstraints !== undefined) {
      updateData.dimensionConstraints = args.dimensionConstraints;
    }
    
    await ctx.db.patch(args.id, updateData);
    
    // Return the document as-is (matching media mutations pattern)
    // Frontend queries will handle converting _creationTime to createdAt/updatedAt Date objects
    return await ctx.db.get(args.id);
  },
});

/**
 * Delete a MediaType
 */
export const deleteMediaType = mutation({
  args: { id: v.id("mediaTypes") },
  handler: async (ctx, args) => {
    const mediaType = await ctx.db.get(args.id);
    if (!mediaType) {
      throw new Error(`MediaType with id ${args.id} not found`);
    }
    
    // Check usage count (customMediaTypeId is stored as string, Convex IDs are strings)
    const mediaItems = await ctx.db
      .query("media")
      .withIndex("by_customMediaTypeId", (q) =>
        q.eq("customMediaTypeId", args.id)
      )
      .collect();
    
    if (mediaItems.length > 0) {
      throw new Error(
        `Cannot delete MediaType "${mediaType.name}" because it is in use by ${mediaItems.length} media item(s)`
      );
    }
    
    await ctx.db.delete(args.id);
    return true;
  },
});

/**
 * Internal mutation for creating MediaType (used by actions like migration)
 */
export const createInternal = internalMutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    allowedFormats: v.array(v.string()),
    fields: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        label: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("number"),
          v.literal("date"),
          v.literal("select"),
          v.literal("boolean"),
          v.literal("url")
        ),
        required: v.boolean(),
        options: v.optional(v.array(v.string())),
        validationRegex: v.optional(v.string()),
        placeholder: v.optional(v.string()),
      })
    ),
    defaultTags: v.array(v.string()),
    dimensionConstraints: v.optional(
      v.object({
        enabled: v.boolean(),
        aspectRatio: v.object({
          label: v.string(),
          value: v.union(v.number(), v.null()),
        }),
        minWidth: v.optional(v.number()),
        minHeight: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const mediaTypeId = await ctx.db.insert("mediaTypes", {
      name: args.name,
      description: args.description,
      color: args.color,
      allowedFormats: args.allowedFormats,
      fields: args.fields,
      defaultTags: args.defaultTags,
      dimensionConstraints: args.dimensionConstraints,
    });
    
    return mediaTypeId;
  },
});
