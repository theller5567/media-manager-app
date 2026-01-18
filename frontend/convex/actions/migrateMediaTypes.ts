"use node";

import { action } from "../_generated/server";
import { api, internal } from "../_generated/api";

interface MigrationResult {
  success: boolean;
  mediaTypesCreated: number;
  errors: string[];
}

/**
 * One-time migration script to migrate existing mock MediaTypes to Convex database
 * This script migrates the 2 existing MediaTypes from mockMediaTypes.ts
 * 
 * Run with: npx convex run actions/migrateMediaTypes:migrate
 */
export const migrate = action({
  args: {},
  handler: async (ctx): Promise<MigrationResult> => {
    const result: MigrationResult = {
      success: true,
      mediaTypesCreated: 0,
      errors: [],
    };

    // Mock MediaTypes data from mockMediaTypes.ts
    const mockMediaTypes = [
      {
        id: "1",
        name: "Product Image",
        description: "Images for product catalogs and e-commerce",
        color: "#3b82f6",
        allowedFormats: [".jpg", ".png", ".webp"],
        fields: [
          {
            id: "field_1",
            name: "sku",
            label: "SKU",
            type: "text" as const,
            required: true,
            validationRegex: "^[A-Z0-9]{8}$",
            placeholder: "Enter 8-character SKU",
          },
          {
            id: "field_2",
            name: "productCategory",
            label: "Product Category",
            type: "select" as const,
            required: true,
            options: ["Clothing", "Electronics", "Home"],
          },
          {
            id: "field_3",
            name: "photographer",
            label: "Photographer",
            type: "text" as const,
            required: false,
            placeholder: "Photographer name",
          },
          {
            id: "field_4",
            name: "shootDate",
            label: "Shoot Date",
            type: "date" as const,
            required: false,
          },
        ],
        defaultTags: ["product", "catalog"],
      },
      {
        id: "2",
        name: "Webinar Video",
        description: "Recorded webinar sessions and presentations",
        color: "#ef4444",
        allowedFormats: [".mp4", ".mov"],
        fields: [
          {
            id: "field_5",
            name: "speakerName",
            label: "Speaker Name",
            type: "text" as const,
            required: true,
            placeholder: "Enter speaker name",
          },
          {
            id: "field_6",
            name: "webinarDate",
            label: "Webinar Date",
            type: "date" as const,
            required: true,
          },
          {
            id: "field_7",
            name: "quality",
            label: "Quality",
            type: "select" as const,
            required: false,
            options: ["HD", "4K"],
          },
          {
            id: "field_8",
            name: "ctaLink",
            label: "CTA Link",
            type: "url" as const,
            required: false,
            placeholder: "https://example.com",
          },
        ],
        defaultTags: ["webinar", "video", "education"],
      },
    ];

    try {
      for (const mockMediaType of mockMediaTypes) {
        // Check if MediaType with this name already exists
        const existingMediaType = await ctx.runQuery(api.queries.mediaTypes.getByName, {
          name: mockMediaType.name,
        });
        
        const nameExists = existingMediaType !== null;

        if (nameExists) {
          result.errors.push(
            `MediaType "${mockMediaType.name}" already exists, skipping`
          );
          continue;
        }

        // Insert MediaType into Convex database using internal mutation
        const mediaTypeId = await ctx.runMutation(internal.mutations.mediaTypes.createInternal, {
          name: mockMediaType.name,
          description: mockMediaType.description,
          color: mockMediaType.color,
          allowedFormats: mockMediaType.allowedFormats,
          fields: mockMediaType.fields.map((field: any) => ({
            id: field.id,
            name: field.name,
            label: field.label,
            type: field.type,
            required: field.required,
            options: field.options,
            validationRegex: field.validationRegex,
            placeholder: field.placeholder,
          })),
          defaultTags: mockMediaType.defaultTags,
        });

        result.mediaTypesCreated++;
        console.log(
          `Migrated MediaType "${mockMediaType.name}" with ID ${mediaTypeId}`
        );
      }

      if (result.errors.length > 0) {
        result.success = false;
      }
    } catch (error) {
      result.success = false;
      result.errors.push(
        `Migration failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return result;
  },
});
