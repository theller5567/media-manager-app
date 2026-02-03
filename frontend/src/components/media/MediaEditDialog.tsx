import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { MediaItem } from "@/lib/mediaUtils";
import { getMediaTypeIcon } from "@/lib/mediaUtils";
import { getAvailableTags } from "@/lib/filteringUtils";
import type { CustomField } from "@/types/mediaType";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Badge } from "../ui/Badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import { cn } from "@/lib/utils";
import { X, Loader2, Sparkles } from "lucide-react";
import React from "react";

/** Base fields that AI can fill (edit dialog). */
const AI_FILLABLE_FIELDS = ["title", "description", "altText", "tags"] as const;
type AiFillableField = (typeof AI_FILLABLE_FIELDS)[number];

interface ExtendedMediaItem extends MediaItem {
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
  cloudinarySecureUrl?: string;
  mimeType?: string;
}

interface MediaEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: ExtendedMediaItem;
}

const MediaEditDialog = ({ open, onOpenChange, media }: MediaEditDialogProps) => {
  // Form state
  const [title, setTitle] = useState(media.title);
  const [description, setDescription] = useState(media.description || "");
  const [altText, setAltText] = useState(media.altText || "");
  const [tags, setTags] = useState<string[]>(media.tags);
  const [customMetadata, setCustomMetadata] = useState<Record<string, any>>(
    media.customMetadata || {}
  );
  const [aiSelectedFields, setAiSelectedFields] = useState<AiFillableField[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // UI state
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Convex hooks
  const updateMedia = useMutation(api.mutations.media.update);
  const analyzeMediaFromUrl = useAction(api.actions.analyzeMedia.analyzeMediaFromUrl);
  const allMediaItems = useQuery(api.queries.media.list);

  // Fetch MediaType from Convex if customMediaTypeId exists
  const mediaTypeDoc = useQuery(
    api.queries.mediaTypes.getById,
    media.customMediaTypeId ? { id: media.customMediaTypeId as Id<"mediaTypes"> } : "skip"
  );
  
  // Get MediaType definition if customMediaTypeId exists
  const mediaType = useMemo(() => {
    if (!mediaTypeDoc) return undefined;
    // Convert timestamps to Date objects
    return {
      ...mediaTypeDoc,
      id: mediaTypeDoc._id,
      createdAt: new Date(mediaTypeDoc.createdAt), // Convert number to Date object
      updatedAt: new Date(mediaTypeDoc.updatedAt), // Convert number to Date object
    };
  }, [mediaTypeDoc]);

  // Get available tags from all media items
  const availableTags = useMemo(() => {
    if (!allMediaItems) return [];
    // Convert Convex documents to MediaItem format for getAvailableTags
    const mediaItems: MediaItem[] = allMediaItems.map((doc: any) => ({
      id: doc._id,
      filename: doc.filename,
      mimeType: doc.mimeType,
      thumbnail: doc.thumbnail,
      mediaType: doc.mediaType,
      customMediaTypeId: doc.customMediaTypeId,
      title: doc.title,
      description: doc.description,
      altText: doc.altText,
      fileSize: doc.fileSize,
      tags: doc.tags,
      relatedFiles: doc.relatedFiles,
      customMetadata: doc.customMetadata,
      aiGenerated: doc.aiGenerated,
      dateModified: new Date(doc.dateModified),
      cloudinarySecureUrl: doc.cloudinarySecureUrl,
    }));
    return getAvailableTags(mediaItems);
  }, [allMediaItems]);

  // Filter tag suggestions
  const filteredTagSuggestions = useMemo(() => {
    return availableTags.filter(
      (tag) =>
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !tags.includes(tag)
    );
  }, [availableTags, tagInput, tags]);

  // Reset form when dialog opens/closes or media changes
  useEffect(() => {
    if (open) {
      setTitle(media.title);
      setDescription(media.description || "");
      setAltText(media.altText || "");
      setTags(media.tags);
      setCustomMetadata(media.customMetadata || {});
      setTagInput("");
      setShowTagSuggestions(false);
      setErrors({});
      setSaveError(null);
      setAiSelectedFields([]);
      setAiError(null);
    }
  }, [open, media]);

  // Tag handlers
  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
      setShowTagSuggestions(false);
      // Clear tag errors
      if (errors.tags) {
        const newErrors = { ...errors };
        delete newErrors.tags;
        setErrors(newErrors);
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Custom field handler
  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomMetadata({
      ...customMetadata,
      [fieldName]: value,
    });
    // Clear field errors
    if (errors[fieldName]) {
      const newErrors = { ...errors };
      delete newErrors[fieldName];
      setErrors(newErrors);
    }
  };

  const isAiFieldSelected = (field: AiFillableField) => aiSelectedFields.includes(field);
  const toggleAiField = (field: AiFillableField) => {
    setAiError(null);
    setAiSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };
  const selectAllAiFields = () => {
    setAiError(null);
    setAiSelectedFields([...AI_FILLABLE_FIELDS]);
  };
  const clearAiFields = () => {
    setAiError(null);
    setAiSelectedFields([]);
  };

  const handleGenerateAi = async () => {
    if (aiSelectedFields.length === 0) return;
    const mediaUrl =
      (media as ExtendedMediaItem).cloudinarySecureUrl || media.thumbnail || "";
    if (!mediaUrl.startsWith("http")) {
      setAiError("Media URL is not available for AI analysis.");
      return;
    }
    const formatToMime: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      mp4: "video/mp4",
      mov: "video/quicktime",
      webm: "video/webm",
    };
    const ext = (
      (media as ExtendedMediaItem).format ||
      media.filename?.split(".").pop() ||
      ""
    ).toLowerCase();
    const mimeType =
      (media as ExtendedMediaItem).mimeType ||
      formatToMime[ext] ||
      (media.mediaType === "image"
        ? "image/jpeg"
        : media.mediaType === "video"
          ? "video/mp4"
          : "application/octet-stream");

    setAiGenerating(true);
    setAiError(null);
    try {
      const suggestions = await analyzeMediaFromUrl({
        mediaUrl,
        mimeType,
        filename: media.filename,
        mediaType: mediaType
          ? {
              name: mediaType.name,
              description: mediaType.description,
              defaultTags: mediaType.defaultTags,
            }
          : undefined,
      });
      if (aiSelectedFields.includes("title") && suggestions.title != null) {
        setTitle(suggestions.title);
      }
      if (aiSelectedFields.includes("description") && suggestions.description != null) {
        setDescription(suggestions.description);
      }
      if (aiSelectedFields.includes("altText") && suggestions.altText != null) {
        setAltText(suggestions.altText);
      }
      if (aiSelectedFields.includes("tags") && suggestions.tags != null && suggestions.tags.length > 0) {
        setTags(suggestions.tags);
      }
      setAiSelectedFields([]);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI analysis failed.");
    } finally {
      setAiGenerating(false);
    }
  };

  



  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    // Validate description
    if (!description || description.trim() === "") {
      newErrors.description = ["Description is required"];
    }

    // Validate altText
    if (!altText || altText.trim() === "") {
      newErrors.altText = ["Alt text is required"];
    }

    // Validate tags
    if (tags.length === 0) {
      newErrors.tags = ["At least one tag is required"];
    }

    // Validate custom fields
    if (mediaType) {
      mediaType.fields.forEach((field) => {
        const value = customMetadata[field.name];
        const fieldErrors: string[] = [];

        // Check required fields
        if (field.required) {
          if (
            value === undefined ||
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0)
          ) {
            fieldErrors.push(`${field.label} is required`);
          }
        }

        // Validate regex if provided
        if (value && field.validationRegex) {
          const regex = new RegExp(field.validationRegex);
          if (!regex.test(String(value))) {
            fieldErrors.push(
              field.placeholder || `Invalid format for ${field.label}`
            );
          }
        }

        // Type-specific validation
        if (value !== undefined && value !== null && value !== "") {
          if (field.type === "number" && isNaN(Number(value))) {
            fieldErrors.push(`${field.label} must be a number`);
          }
          if (field.type === "url") {
            try {
              new URL(String(value));
            } catch {
              fieldErrors.push(`${field.label} must be a valid URL`);
            }
          }
        }

        if (fieldErrors.length > 0) {
          newErrors[field.name] = fieldErrors;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handler
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await updateMedia({
        id: media.id as Id<"media">,
        updates: {
          title,
          description: description || undefined,
          altText: altText || undefined,
          tags,
          customMetadata: Object.keys(customMetadata).length > 0 ? customMetadata : undefined,
          dateModified: Date.now(),
        },
      });

      // Close dialog on success
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update media:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to save changes"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Render custom field
  const renderCustomField = (field: CustomField) => {
    const value = customMetadata[field.name] || "";
    const fieldErrors = errors[field.name] || [];
    const hasError = fieldErrors.length > 0;

    switch (field.type) {
      case "text":
      case "url":
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-sm font-medium text-white">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type={field.type === "url" ? "url" : "text"}
              value={value}
              onChange={(e) =>
                handleCustomFieldChange(field.name, e.target.value)
              }
              placeholder={field.placeholder}
              className={cn(
                "w-full px-3 py-2 bg-slate-800 border rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2",
                hasError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-700 focus:ring-cyan-500"
              )}
              required={field.required}
            />
            {hasError && (
              <div className="space-y-1">
                {fieldErrors.map((error, idx) => (
                  <p
                    key={idx}
                    className="text-xs text-red-400 flex items-start gap-1"
                  >
                    <span className="text-red-500">•</span>
                    <span>{error}</span>
                  </p>
                ))}
              </div>
            )}
            {field.validationRegex && !hasError && value && (
              <p className="text-xs text-slate-500">
                {field.placeholder || "Format validated"}
              </p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-sm font-medium text-white">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) =>
                handleCustomFieldChange(
                  field.name,
                  parseFloat(e.target.value) || ""
                )
              }
              placeholder={field.placeholder}
              className={cn(
                "w-full px-3 py-2 bg-slate-800 border rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2",
                hasError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-700 focus:ring-cyan-500"
              )}
              required={field.required}
            />
            {hasError && (
              <div className="space-y-1">
                {fieldErrors.map((error, idx) => (
                  <p
                    key={idx}
                    className="text-xs text-red-400 flex items-start gap-1"
                  >
                    <span className="text-red-500">•</span>
                    <span>{error}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-sm font-medium text-white">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) =>
                handleCustomFieldChange(field.name, e.target.value)
              }
              className={cn(
                "w-full px-3 py-2 bg-slate-800 border rounded-md text-white focus:outline-none focus:ring-2",
                hasError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-700 focus:ring-cyan-500"
              )}
              required={field.required}
            />
            {hasError && (
              <div className="space-y-1">
                {fieldErrors.map((error, idx) => (
                  <p
                    key={idx}
                    className="text-xs text-red-400 flex items-start gap-1"
                  >
                    <span className="text-red-500">•</span>
                    <span>{error}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-sm font-medium text-white">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) =>
                handleCustomFieldChange(field.name, e.target.value)
              }
              className={cn(
                "w-full px-3 py-2 bg-slate-800 border rounded-md text-white focus:outline-none focus:ring-2",
                hasError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-700 focus:ring-cyan-500"
              )}
              required={field.required}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {hasError && (
              <div className="space-y-1">
                {fieldErrors.map((error, idx) => (
                  <p
                    key={idx}
                    className="text-xs text-red-400 flex items-start gap-1"
                  >
                    <span className="text-red-500">•</span>
                    <span>{error}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        );

      case "boolean":
        return (
          <div key={field.id} className="space-y-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) =>
                  handleCustomFieldChange(field.name, e.target.checked)
                }
                className={cn(
                  "w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-2",
                  hasError
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-cyan-500"
                )}
              />
              <span className="text-sm font-medium text-white">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </span>
            </label>
            {hasError && (
              <div className="space-y-1 ml-6">
                {fieldErrors.map((error, idx) => (
                  <p
                    key={idx}
                    className="text-xs text-red-400 flex items-start gap-1"
                  >
                    <span className="text-red-500">•</span>
                    <span>{error}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Get media type icon
  const MediaTypeIcon = getMediaTypeIcon(media.mediaType);
  const canUseAi = media.mediaType === "image" || media.mediaType === "video";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 border-b border-slate-700 pb-4">Edit Media <div className="flex items-center gap-2">
            {React.createElement(MediaTypeIcon, {
                    className: "h-4 w-4 text-slate-400",
                  })}
            </div></DialogTitle>
          <DialogDescription className="sr-only">Edit the media item details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Message */}
          {saveError && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-md">
              <p className="text-sm text-red-400">{saveError}</p>
            </div>
          )}

          {/* Editable Base Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Basic Information
            </h3>
            {canUseAi && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm text-cyan-500 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
                    >
                      <Sparkles className="h-4 w-4" />
                      Fill with AI
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" sideOffset={8} className="flex flex-col gap-3 min-w-[240px]">
                    <p className="text-sm text-slate-400">
                      Select the fields you want AI to fill, then click Generate.
                    </p>
                    {AI_FILLABLE_FIELDS.map((field) => (
                      <label
                        key={field}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isAiFieldSelected(field)}
                          onChange={() => toggleAiField(field)}
                          disabled={aiGenerating}
                          className="rounded border border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                        />
                        <span className="text-sm text-white capitalize">
                          {field === "altText" ? "Alt Text" : field}
                        </span>
                      </label>
                    ))}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllAiFields}
                        disabled={aiGenerating}
                        className="text-xs text-slate-400 hover:text-white disabled:opacity-50"
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={clearAiFields}
                        disabled={aiGenerating}
                        className="text-xs text-slate-400 hover:text-white disabled:opacity-50"
                      >
                        Clear
                      </button>
                    </div>
                    {aiError && (
                      <p className="text-xs text-red-400">{aiError}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleGenerateAi}
                      disabled={aiGenerating || aiSelectedFields.length === 0}
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aiGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      {aiGenerating ? "Analyzing…" : "Generate"}
                    </button>
                  </PopoverContent>
                </Popover>
              </div>
            )}
            </div>

            {/* Title Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) {
                    const newErrors = { ...errors };
                    delete newErrors.description;
                    setErrors(newErrors);
                  }
                }}
                placeholder="Enter description"
                rows={4}
                className={cn(
                  "w-full px-3 py-2 bg-slate-800 border rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 resize-none",
                  errors.description
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-700 focus:ring-cyan-500"
                )}
                required
              />
              {errors.description && (
                <p className="text-xs text-red-400">
                  {errors.description[0]}
                </p>
              )}
            </div>

            {/* Alt Text Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Alt Text <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => {
                  setAltText(e.target.value);
                  if (errors.altText) {
                    const newErrors = { ...errors };
                    delete newErrors.altText;
                    setErrors(newErrors);
                  }
                }}
                placeholder="Enter alt text for accessibility"
                className={cn(
                  "w-full px-3 py-2 bg-slate-800 border rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2",
                  errors.altText
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-700 focus:ring-cyan-500"
                )}
                required
              />
              {errors.altText && (
                <p className="text-xs text-red-400">{errors.altText[0]}</p>
              )}
            </div>

            {/* Tags Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Tags <span className="text-red-400">*</span> (at least 1
                required)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    setShowTagSuggestions(true);
                  }}
                  onFocus={() => setShowTagSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowTagSuggestions(false), 200);
                  }}
                  placeholder="Type to search or add tags"
                  className={cn(
                    "w-full px-3 py-2 bg-slate-800 border rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500",
                    errors.tags ? "border-red-500" : "border-slate-700"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tagInput.trim()) {
                      e.preventDefault();
                      handleAddTag(tagInput.trim());
                    }
                  }}
                />

                {/* Tag Suggestions Dropdown */}
                {showTagSuggestions && filteredTagSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredTagSuggestions.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag)}
                        className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-slate-700 text-white border-slate-600"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {errors.tags && (
                <p className="text-xs text-red-400">{errors.tags[0]}</p>
              )}
            </div>
          </div>

          {/* Custom Fields Section */}
          {mediaType && mediaType.fields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                {mediaType.name} Fields
              </h3>
              <div className="space-y-4">
                {mediaType.fields.map((field) => renderCustomField(field))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-cyan-500 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaEditDialog;
