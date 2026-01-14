# Media Manager App - Complete Project Documentation

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Tech Stack:** React 19 + Convex + Cloudinary + TypeScript

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack Summary](#tech-stack-summary)
3. [Complete Dependencies](#complete-dependencies)
4. [Architecture](#architecture)
5. [Core Features](#core-features)
6. [Project Structure](#project-structure)
7. [Setup Instructions](#setup-instructions)
8. [Environment Variables](#environment-variables)
9. [Database Schema](#database-schema)
10. [Coding Conventions](#coding-conventions)

---

## 🎯 Project Overview

**Media Manager App** is an AI-enhanced media management platform for organizations to organize, store, and manage digital assets with customizable metadata, hierarchical tagging, and enterprise integrations.

### Key Capabilities
- Unified media library (images, videos, documents, audio)
- AI-powered auto-tagging and semantic search
- Real-time collaboration across team
- Advanced video management with frame-accurate thumbnails
- Flexible metadata system with custom schemas
- Enterprise integrations (SendGrid)
- Role-based access control (User, Admin, Super Admin)

---

## 🛠 Tech Stack Summary

### Frontend
- **React 19** - UI framework with concurrent features
- **TypeScript 5.7+** - Type safety
- **Vite 6** - Build tool with instant HMR
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Headless UI components
- **React Router v6** - Client-side routing
- **Convex React** - Server state management
- **Zustand** - Client UI state
- **React Hook Form + Zod** - Form handling
- **Framer Motion** - Animations

### Backend
- **Convex** - Backend-as-a-Service (database + functions + real-time)
- **Cloudinary** - Media storage, transformations, CDN
- **OpenAI API** - GPT-4o-mini vision + embeddings
- **Pinecone** - Vector database for semantic search
- **SendGrid** - Transactional emails + webhooks

### Tools
- **pnpm** - Package manager
- **Prettier + ESLint** - Code quality
- **Git** - Version control

---

## 📦 Complete Dependencies

### Core Dependencies & Their Purpose

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.28.0",
    "convex": "^1.17.2",
    "zustand": "^5.0.2",
    "tailwindcss": "^4.1.5",
    "@tailwindcss/vite": "^4.1.5",
    "@radix-ui/react-slot": "^1.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "lucide-react": "^0.462.0",
    "framer-motion": "^11.13.5",
    "react-hook-form": "^7.54.2",
    "@hookform/resolvers": "^3.9.1",
    "zod": "^3.24.1",
    "cloudinary-react": "^1.8.1",
    "cloudinary-core": "^2.13.1",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@types/node": "^22.10.2",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.2",
    "vite": "^6.0.3",
    "eslint": "^9.17.0",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20",
    "prettier": "^3.4.2",
    "prettier-plugin-tailwindcss": "^0.6.9"
  }
}
```

### What Each Package Does

| Package | Purpose |
|---------|---------|
| **react** | Core React library with concurrent rendering |
| **react-dom** | DOM renderer for React |
| **react-router-dom** | Client-side routing with data loaders |
| **convex** | Backend SDK - database, real-time, functions |
| **zustand** | Lightweight state management for UI state only |
| **tailwindcss** | Utility-first CSS framework (v4) |
| **@tailwindcss/vite** | Vite plugin for Tailwind v4 (replaces PostCSS setup) |
| **@radix-ui/react-slot** | Polymorphic component primitive |
| **class-variance-authority** | Component variant management |
| **clsx** | Conditional className construction |
| **tailwind-merge** | Intelligently merge Tailwind classes |
| **lucide-react** | Icon library (1000+ icons) |
| **framer-motion** | Animation library |
| **react-hook-form** | Performant form library |
| **@hookform/resolvers** | Validation resolvers for RHF |
| **zod** | TypeScript-first schema validation |
| **cloudinary-react** | React components for Cloudinary |
| **cloudinary-core** | Cloudinary SDK for URL generation |
| **date-fns** | Date utility library |
| **@vitejs/plugin-react** | Vite plugin for React Fast Refresh |
| **prettier** | Code formatter |
| **prettier-plugin-tailwindcss** | Auto-sort Tailwind classes |

---

## 🏗 Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────┐
│   Frontend (Vite + React + TS)      │
│                                     │
│  Convex React Client                │
│  (useQuery/useMutation)             │
└──────────────┬──────────────────────┘
               │ WebSocket + HTTPS
               │
┌──────────────▼──────────────────────┐
│        Convex Backend               │
│                                     │
│  Queries │ Mutations │ Actions      │
│  (read)  │ (write)   │ (external)   │
│          │           │              │
│        Database                     │
└──────────────┬──────────────────────┘
               │
      ┌────────┼────────┐
      │        │        │
┌─────▼──┐ ┌──▼───┐ ┌─▼──────┐
│Cloudinary│OpenAI││Pinecone│
│Media+CDN ││AI+Emb││Vector  │
└──────────┘└──────┘└────────┘
```

### Media Upload Flow
```
1. User selects file → Frontend validates
2. Direct upload to Cloudinary (browser → Cloudinary, no backend)
3. Cloudinary returns public_id + metadata
4. Frontend calls Convex mutation with metadata
5. Convex saves to database
6. Real-time broadcast to all clients → Auto UI update
```

### AI Auto-Tagging Flow
```
1. User clicks "Auto-tag" → Frontend calls Convex action
2. Action generates Cloudinary URL
3. Action calls OpenAI Vision API
4. Action generates embeddings → Stores in Pinecone
5. Action saves results via mutation
6. Real-time update to frontend
```

---

## ✨ Core Features

### 1. Authentication & RBAC

**Roles:**
- **User** - View/upload media, edit own uploads
- **Admin** - + manage users, tags, categories
- **Super Admin** - + system config, analytics

**Features:**
- Email/password authentication
- Session management (secure cookies)
- Password reset via email
- Invitation-only signup
- Activity logging for audits

**Implementation:** Convex Auth or Better Auth

---

### 2. Unified Media Library

**Supported Formats:**
- Images: JPG, PNG, GIF, WebP, AVIF, SVG
- Videos: MP4, MOV, AVI, WebM, MKV
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- Audio: MP3, WAV, OGG, FLAC

**View Modes:**
- Grid View - Card layout with thumbnails
- Table View - Sortable spreadsheet
- List View - Compact rows

**Features:**
- Infinite scroll with virtualization (performance for 1000+ items)
- Multi-select for bulk operations
- Drag-and-drop upload
- Preview modal with metadata
- Download original or transformed versions
- Share links with expiration

---

### 3. Extensible Metadata System & Media Type Builder

**Overview:**
Beyond standard file properties, the system allows for granular categorization and custom data structures via a "Media Type Builder". This ensures that specific types of assets (e.g., "Legal Contracts", "Marketing Banner") have the exact metadata required for business workflows.

**Built-in Fields (Always Included):**
- **Core:** Title, description, alt text
- **Technical:** File size, format, dimensions, duration
- **Organization:** Folder, tags, categories
- **AI:** Auto-description, auto-tags, sentiment
- **Tracking:** Upload date, uploader, last modified, views

**Media Type Builder (Admin Feature):**
Admins can create custom Media Types that define:
1.  **Accepted File Formats:** Specify allowed extensions (e.g., `.pdf`, `.ai`, `.psd`).
2.  **UI Color Coding:** Assign a hex color for visual identification in the library.
3.  **Custom Field Schema:** Define an array of required or optional fields:
    -   **Field Types:** Text, Number, Date, Dropdown (Select), Boolean (Checkbox), URL.
    -   **Validation:** Mark fields as required, set character limits, or define regex patterns.

**Example Media Types:**

1.  **"Product Image" (Color: #3b82f6)**
    -   **Allowed Formats:** `.jpg`, `.png`, `.webp`
    -   **Required Fields:**
        -   SKU (Text, Required, Pattern: [A-Z0-9]{8})
        -   Product Category (Dropdown: Clothing, Electronics, Home)
    -   **Optional Fields:**
        -   Photographer (Text)
        -   Shoot Date (Date)

2.  **"Webinar Video" (Color: #ef4444)**
    -   **Allowed Formats:** `.mp4`, `.mov`
    -   **Required Fields:**
        -   Speaker Name (Text, Required)
        -   Webinar Date (Date, Required)
    -   **Optional Fields:**
        -   Quality (Dropdown: HD, 4K)
        -   CTA Link (URL)

**Dynamic Form Generation:**
When a user selects a Media Type during upload or edit:
-   The library validates that the file extension matches the Media Type's `allowedFormats`.
-   The system dynamically renders form components (inputs, selects, date pickers) based on the `fields` array.
-   Submission is blocked until all `required` custom fields are populated.

**Storage:** Custom metadata values are stored as a JSON object in the `customMetadata` field of the `media` table, mapped to the schema defined in the `mediaTypes` table.

---

### 4. Hierarchical Tagging

**Structure:**
```
Tag Categories (e.g., "Content Type", "Department")
  └── Tags (e.g., "Blog Post", "Marketing")
      └── Applied to Media (many-to-many)
```

**Features:**
- Multi-category support
- Tag autocomplete
- Bulk tagging
- Usage analytics
- Color-coded categories

**Admin:**
- CRUD tag categories and tags
- Merge duplicates
- View hierarchy tree

---

### 5. Advanced Video Management

**Video Player:**
- HTML5 with Cloudinary
- Adaptive bitrate (HLS/DASH)
- Speed control (0.5x-2x)
- Keyboard shortcuts
- Quality selector (360p-4K)

**Thumbnail Selector:**
Problem: Auto-generated thumbnails often show bad frames

Solution: Frame-by-frame selector
- Scrub video to find perfect frame
- Display thumbnail strip (1 frame/second)
- Click frame to set as thumbnail
- Save only timestamp (not file) - URLs generated on-demand

**Implementation:**
```typescript
// Thumbnail URL with specific timestamp
const url = cloudinary.url(videoId, {
  resource_type: 'video',
  start_offset: '15.5', // 15.5 seconds into video
  format: 'jpg',
  width: 400,
  height: 300,
  crop: 'fill'
})

// Store only timestamp
await ctx.db.patch(mediaId, {
  thumbnailTime: 15.5
})
```

**Video Processing:**
- Auto-extract metadata (duration, resolution, codec, fps)
- Subtitle upload support
- Trim/clip via Cloudinary transformations

---

### 6. AI-Powered Automation

**Auto-Tagging (Hybrid):**

1. **Quick Tags (Cloudinary AI)** - FREE
   ```typescript
   const result = await cloudinary.uploader.upload(file, {
     categorization: 'google_tagging',
     auto_tagging: 0.7
   })
   // Returns: ['person', 'outdoor', 'bicycle']
   ```

2. **Contextual Description (OpenAI Vision)** - $0.01/image
   ```typescript
   const response = await openai.chat.completions.create({
     model: 'gpt-4o-mini',
     messages: [{
       role: 'user',
       content: [
         { type: 'text', text: 'Describe for SEO' },
         { type: 'image_url', image_url: { url: imageUrl } }
       ]
     }]
   })
   ```

**Strategy:** Run Cloudinary on all uploads (free), OpenAI only when user clicks "Generate AI Description"

**Semantic Search:**
```
1. Generate embeddings on upload (OpenAI)
2. Store in Pinecone vector DB
3. User searches "sunset beach" → generate query embedding
4. Query Pinecone for similar vectors → get media IDs
5. Fetch full metadata from Convex
6. Display results
```

---

### 7. Admin Dashboard

**Metrics:**
- Total media count
- Storage used (GB)
- Active users
- Uploads this month

**Charts:**
- Media distribution (pie: images/videos/docs)
- Upload trends (line: uploads over time)
- Top uploaders (bar chart)
- Storage breakdown (by folder/user/type)
- Tag usage (most/least popular)

**User Management:**
- List all users (role, last login, upload count)
- Edit roles
- Deactivate/activate
- View activity history
- Send invitations

**Invitation System:**
```typescript
// Admin invites user
await sendInvitation({
  email: 'new@company.com',
  role: 'user',
  message: 'Welcome!'
})
// Generates token, sends email via SendGrid
// User clicks link → registration form
// Validates token → creates account
```

**Activity Logs:**
Every action logged with:
- User ID/name
- Action (upload/delete/edit/download/share)
- Resource type/ID
- Timestamp
- IP address (optional)
- User agent (optional)

---

### 8. Enterprise Integrations

**SendGrid:**
Use case: Email notifications + track events

Features:
- Send invitations/notifications
- Track delivery (sent/delivered/opened/bounced)
- Store webhook events for audit

```typescript
// Webhook handler (Convex HTTP action)
export const sendgridWebhook = httpAction(async (ctx, request) => {
  const events = await request.json()
  for (const event of events) {
    await ctx.runMutation(api.emailEvents.create, {
      eventType: event.event,
      email: event.email,
      timestamp: event.timestamp
    })
  }
  return new Response('OK', { status: 200 })
})
```

---

### 9. Custom Media Type Management (Admin Only)

**Features:**
-   **Visual Builder:** Interface to create and manage Media Types.
-   **Color Assignment:** Hex color picker for each type.
-   **Format Restriction:** Select which file extensions are valid for this type.
-   **Field Configuration:**
    -   Add/Remove/Reorder custom metadata fields.
    -   Toggle "Required" status for each field.
    -   Define options for dropdown/select fields.
-   **Usage Tracking:** See how many media items are using each custom type.
-   **Preview:** Live preview of the generated metadata form.

---

### 10. Notification System

**Types:**
- Media: New upload, processing complete/error
- Collaboration: Mentioned in comment, media shared
- Admin: New user, role changed
- System: Storage limit warning, backup complete

**Channels:**
- In-app: Bell icon with unread count, dropdown
- Email: Per-type toggle in user preferences

**Real-time:**
```typescript
// Create notification
await ctx.db.insert('notifications', {
  userId,
  type: 'media_uploaded',
  title: 'New Media',
  message: `${uploader} uploaded ${title}`,
  read: false,
  actionUrl: `/media/${mediaId}`,
  createdAt: Date.now()
})

// Frontend auto-updates via Convex subscription
const notifications = useQuery(api.notifications.listForUser)
```

---

## 📁 Project Structure

```
media-manager-app/
├── package.json
├── pnpm-workspace.yaml
└── frontend/
    ├── package.json
    ├── pnpm-lock.yaml
    ├── .env.local
    ├── vite.config.ts
    ├── tsconfig.json
    ├── postcss.config.js
    ├── index.html
    │
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── index.css
    │   │
    │   ├── components/
    │   │   ├── ui/              # shadcn/ui components
    │   │   │   ├── button.tsx
    │   │   │   ├── input.tsx
    │   │   │   ├── dialog.tsx
    │   │   │   └── ...
    │   │   ├── media/           # Media-specific
    │   │   │   ├── MediaGrid.tsx
    │   │   │   ├── MediaTable.tsx
    │   │   │   ├── MediaCard.tsx
    │   │   │   ├── MediaUpload.tsx
    │   │   │   ├── VideoPlayer.tsx
    │   │   │   └── ThumbnailSelector.tsx
    │   │   ├── auth/            # Auth components
    │   │   │   ├── LoginForm.tsx
    │   │   │   ├── SignupForm.tsx
    │   │   │   └── ProtectedRoute.tsx
    │   │   └── layout/          # Layout
    │   │       ├── Navbar.tsx
    │   │       ├── Sidebar.tsx
    │   │       └── DashboardLayout.tsx
    │   │
    │   ├── lib/
    │   │   ├── utils.ts
    │   │   └── cloudinary.ts
    │   │
    │   ├── hooks/
    │   │   ├── useMediaUpload.ts
    │   │   ├── useAuth.ts
    │   │   └── useDebounce.ts
    │   │
    │   ├── store/
    │   │   └── ui.ts            # Zustand stores
    │   │
    │   ├── types/
    │   │   ├── media.ts
    │   │   └── user.ts
    │   │
    │   └── pages/
    │       ├── MediaLibrary.tsx
    │       ├── AdminDashboard.tsx
    │       └── Settings.tsx
    │
    └── convex/
        ├── schema.ts            # Database schema
        ├── _generated/          # Auto-generated
        │
        ├── queries/             # Read operations
        │   ├── media.ts
        │   ├── users.ts
        │   └── tags.ts
        │
        ├── mutations/           # Write operations
        │   ├── media.ts
        │   ├── users.ts
        │   └── tags.ts
        │
        ├── actions/             # External APIs
        │   ├── ai.ts
        │   ├── cloudinary.ts
        │   └── sendgrid.ts
        │
        ├── http/                # HTTP endpoints
        │   └── sendgrid.ts
        │
        └── lib/
            ├── validation.ts
            ├── permissions.ts
            └── constants.ts
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ (`node -v`)
- pnpm (`npm install -g pnpm`)
- Git

### Step 1: Initialize Project
```bash
mkdir media-manager-app && cd media-manager-app
pnpm init -y

cat > pnpm-workspace.yaml << EOF
packages:
  - 'frontend'
EOF
```

### Step 2: Create Frontend
```bash
pnpm create vite frontend --template react-ts
cd frontend
pnpm install
```

### Step 3: Install Dependencies
```bash
# Core
pnpm add convex react-router-dom zustand

# UI (Tailwind v4 way)
pnpm add tailwindcss@next @tailwindcss/vite@next
pnpm add @radix-ui/react-slot class-variance-authority clsx tailwind-merge
pnpm add lucide-react framer-motion

# Forms
pnpm add react-hook-form @hookform/resolvers zod

# Cloudinary
pnpm add cloudinary-react cloudinary-core

# Utils
pnpm add date-fns

# Dev
pnpm add -D @types/node prettier prettier-plugin-tailwindcss
```

### Step 4: Configure Vite for Tailwind v4
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // Tailwind v4 Vite plugin
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### Step 5: Setup Tailwind CSS
```css
/* src/index.css */
@import "tailwindcss";

/* Optional: CSS variables for themes */
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
}
```

### Step 6: Initialize Convex
```bash
pnpm dlx convex dev

# Follow prompts:
# 1. Choose: Start without account OR Login with GitHub
# 2. This creates convex/ folder and .env.local
```

### Step 7: Create Folders
```bash
mkdir -p src/{components/{ui,media,auth,layout},lib,hooks,store,types,pages}
mkdir -p convex/{queries,mutations,actions,http,lib}
```

### Step 8: Create Config Files

**PostCSS Config:**
```javascript
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```

**TypeScript Config:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### Step 9: Run Development Servers
```bash
# Terminal 1: Convex backend
pnpm dlx convex dev

# Terminal 2: Frontend
pnpm dev
```

---

## 🔐 Environment Variables

### Frontend (`.env.local`)
```bash
# Auto-generated by Convex
CONVEX_DEPLOYMENT=dev:media-manager-123
VITE_CONVEX_URL=http://127.0.0.1:3210
# OR for cloud deployment:
# VITE_CONVEX_URL=https://happy-animal-123.convex.cloud

# Cloudinary (frontend)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_UPLOAD_PRESET=unsigned_preset_name
```

### Convex Backend (`convex/.env.local` OR Dashboard)
```bash
# Cloudinary (backend operations)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI
OPENAI_API_KEY=sk-...

# SendGrid
SENDGRID_API_KEY=SG....

# Pinecone
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=media-embeddings
```

**Note:** For production, set these in Convex Dashboard → Settings → Environment Variables

---

## 🗄 Database Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("user"), v.literal("admin"), v.literal("super_admin")),
    avatarUrl: v.optional(v.string()),
    invitedBy: v.optional(v.id("users")),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number())
  }).index("by_email", ["email"]),

  media: defineTable({
    cloudinaryId: v.string(),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("document"), v.literal("audio")),
    mediaTypeId: v.optional(v.id("mediaTypes")), // Link to custom media type
    title: v.string(),
    description: v.optional(v.string()),
    altText: v.optional(v.string()),
    fileSize: v.number(),
    format: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()),
    thumbnailTime: v.optional(v.number()),
    uploadedBy: v.id("users"),
    folderId: v.optional(v.id("folders")),
    tags: v.array(v.id("tags")),
    customMetadata: v.optional(v.any()), // Stores values for custom fields
    aiGenerated: v.optional(v.boolean()),
    aiDescription: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_uploader", ["uploadedBy"])
    .index("by_type", ["type"])
    .index("by_media_type", ["mediaTypeId"])
    .searchIndex("search_title", { searchField: "title" }),

  folders: defineTable({
    name: v.string(),
    parentId: v.optional(v.id("folders")),
    createdBy: v.id("users"),
    createdAt: v.number()
  }).index("by_parent", ["parentId"]),

  tagCategories: defineTable({
    name: v.string(),
    color: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number()
  }),

  tags: defineTable({
    name: v.string(),
    categoryId: v.optional(v.id("tagCategories")),
    createdBy: v.id("users"),
    createdAt: v.number()
  })
    .index("by_category", ["categoryId"])
    .searchIndex("search_name", { searchField: "name" }),

  mediaTypes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(), // Hex code for UI identification
    allowedFormats: v.array(v.string()), // e.g., [".pdf", ".docx"]
    fields: v.array(v.object({
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
      options: v.optional(v.array(v.string())), // For "select" type
      validationRegex: v.optional(v.string()),
    })),
    createdBy: v.id("users"),
    createdAt: v.number()
  }),

  activityLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number()
  })
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    actionUrl: v.optional(v.string()),
    createdAt: v.number()
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"])
})
```

---

## 💻 Coding Conventions

### TypeScript
- Use strict mode
- Explicit return types for functions
- No `any` (use `unknown` if needed)
- Prefer `interface` over `type` for object shapes

### React
- Functional components only
- Custom hooks start with `use`
- Props interfaces named `{Component}Props`
- Use `FC` type sparingly (prefer explicit typing)

### Styling
- Tailwind utility classes (no custom CSS unless necessary)
- Use `cn()` helper for conditional classes
- Component variants with `class-variance-authority`

### File Naming
- Components: PascalCase (`MediaCard.tsx`)
- Utilities: camelCase (`utils.ts`)
- Hooks: camelCase with `use` prefix (`useMediaUpload.ts`)
- Constants: UPPER_SNAKE_CASE

### Convex Functions
- Queries: Read-only, no side effects
- Mutations: Write to database only
- Actions: Call external APIs, can call mutations
- HTTP Actions: Webhook endpoints

### Git Commits
- Format: `type(scope): message`
- Types: feat, fix, docs, style, refactor, test, chore
- Example: `feat(media): add video thumbnail selector`

---

## 🔄 Development Workflow

### Daily Development
```bash
# Terminal 1: Start Convex (watches for changes)
cd frontend
pnpm dlx convex dev

# Terminal 2: Start Vite
pnpm dev

# Terminal 3: Run type checking (optional)
pnpm tsc --noEmit --watch
```

### Adding a New Feature
1. Create branch: `git checkout -b feat/feature-name`
2. Implement feature (frontend + backend)
3. Test locally
4. Format: `pnpm prettier --write .`
5. Lint: `pnpm eslint .`
6. Commit: `git commit -m "feat(scope): description"`
7. Push and create PR

### Deploying to Production
```bash
# Deploy Convex backend
pnpm dlx convex deploy --prod

# Build frontend
pnpm build

# Deploy frontend to Netlify/Vercel
# (or use git push with auto-deploy)
```

### Environment Variables in Production
1. Go to Convex Dashboard
2. Settings → Environment Variables
3. Add production values for:
   - CLOUDINARY_API_SECRET
   - OPENAI_API_KEY
   - SENDGRID_API_KEY
   - PINECONE_API_KEY

---

## 📚 Key Resources

- **Convex Docs:** https://docs.convex.dev
- **Tailwind v4 Docs:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **OpenAI API:** https://platform.openai.com/docs
- **React Hook Form:** https://react-hook-form.com
- **Zod:** https://zod.dev

---

## 🎯 Success Metrics

The app is successful when:
- Users can upload and organize 1000+ media files without performance issues
- Search returns results in < 500ms (keyword and semantic)
- Real-time updates propagate to all users in < 1 second
- AI auto-tagging completes in < 10 seconds per image
- Video thumbnail selection works frame-accurately
- Admins can create a new Media Type with custom required fields in < 30 seconds
- Dynamic forms correctly enforce custom validation rules
- Zero data loss or corruption
- 99.9% uptime for Convex + Cloudinary services

---

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Upload all supported file types (image, video, document, audio)
- [ ] Test drag-and-drop upload
- [ ] Verify real-time updates (open 2 browser windows)
- [ ] Test video thumbnail selector with various video formats
- [ ] Verify AI auto-tagging accuracy
- [ ] Test semantic search with various queries
- [ ] Verify RBAC (User vs Admin vs Super Admin)
- [ ] Test invitation flow end-to-end
- [ ] Verify email notifications arrive
- [ ] Verify responsive design on mobile/tablet/desktop
- [ ] Test bulk operations (multi-select delete, tag)
- [ ] Verify activity logs capture all actions
- [ ] Test folder hierarchy (nested folders)
- [ ] Verify custom metadata fields save correctly
- [ ] **Custom Media Types:**
    - [ ] Create a custom Media Type with required fields
    - [ ] Upload a file using the custom type → verify format validation
    - [ ] Verify required fields are enforced in the dynamic form
    - [ ] Edit a media item's custom metadata and verify persistence

### Performance Testing
- Upload 100 files simultaneously → should queue properly
- Load media library with 1000+ items → should use virtualization
- Search with complex filters → should return in < 1 second
- Generate AI descriptions for 10 images → should process in background

### Security Testing
- Verify users can only edit their own media (unless admin)
- Test JWT expiration and refresh
- Verify API endpoints require authentication
- Test XSS prevention in user-generated content
- Verify file upload size limits enforced

---

## 🐛 Debugging Tips

### Convex Not Connecting
```bash
# Check .env.local has correct URL
cat .env.local | grep CONVEX

# Restart Convex dev server
pnpm dlx convex dev

# Check Convex dashboard for errors
# https://dashboard.convex.dev
```

### Tailwind Classes Not Working
```bash
# Ensure @tailwindcss/vite plugin in vite.config.ts
# Ensure @import "tailwindcss" in src/index.css
# Restart Vite dev server
pnpm dev
```

### Type Errors with Convex
```bash
# Regenerate Convex types
pnpm dlx convex dev --once

# Check _generated/ folder exists
ls convex/_generated/
```

### Cloudinary Upload Failing
- Verify VITE_CLOUDINARY_UPLOAD_PRESET is set
- Check upload preset in Cloudinary dashboard is "unsigned"
- Verify CORS allowed origins include localhost:3000

### OpenAI API Errors
- Check API key is valid (starts with sk-)
- Verify billing is set up in OpenAI dashboard
- Check rate limits not exceeded

---

## 🔒 Security Best Practices

### Authentication
- Use httpOnly cookies for JWT (never localStorage)
- Implement refresh token rotation
- Set short expiration times (15min access, 7d refresh)
- Hash passwords with bcrypt (if using Better Auth)
- Rate limit login attempts

### Authorization
- Check user role in every mutation/action
- Never trust client-side role checks
- Implement row-level security (users can only edit own media)
- Admin actions require admin role verification

### File Upload
- Validate file types server-side (not just client)
- Enforce file size limits (Cloudinary: 100MB default)
- Scan uploads for malware (optional: Cloudinary AI Moderation)
- Generate presigned URLs with expiration for downloads

### API Security
- All Convex environment variables stored in dashboard (not code)
- Never expose API keys in frontend code
- Use CORS properly (restrict origins)
- Rate limit expensive operations (AI calls)

### Data Privacy
- Implement soft deletes (mark as deleted, don't remove immediately)
- Log all deletions for audit trail
- GDPR compliance: allow users to export/delete their data
- Encrypt sensitive metadata if needed

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables set in Convex Dashboard (production)
- [ ] Cloudinary account upgraded if needed (check storage limits)
- [ ] OpenAI billing configured
- [ ] SendGrid sender identity verified
- [ ] Domain configured for frontend
- [ ] SSL certificate active

### Convex Deployment
```bash
# Deploy to production
pnpm dlx convex deploy --prod

# Verify deployment
# Check dashboard shows "Production" environment
# Test a simple query from frontend
```

### Frontend Deployment

**Option 1: Netlify**
```bash
# Build
pnpm build

# Deploy
netlify deploy --prod

# Or connect Git repo for auto-deploy
```

**Option 2: Vercel**
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod
```

**Option 3: Cloudflare Pages**
```bash
# Build
pnpm build

# Deploy via Cloudflare dashboard
# Or use Wrangler CLI
```

### Post-Deployment
- [ ] Test production URL loads correctly
- [ ] Verify Convex production URL in frontend .env
- [ ] Test user signup/login flow
- [ ] Upload test media file
- [ ] Verify AI auto-tagging works
- [ ] Test email notifications send
- [ ] Check Convex dashboard for errors
- [ ] Monitor performance for 24 hours
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)

---

## 📈 Scaling Considerations

### Current Architecture Limits
- **Convex Free Tier:** 1M function calls/month, 1GB storage
- **Cloudinary Free Tier:** 25GB storage, 25GB bandwidth
- **OpenAI:** Rate limits vary by tier
- **Pinecone Free Tier:** 1 index, 100K vectors

### When to Upgrade

**Convex → Pro ($25/mo):**
- Exceeding 1M function calls/month
- Need more than 1GB database storage
- Want priority support

**Cloudinary → Plus ($99/mo):**
- Storing 25GB+ media
- 65GB+ bandwidth/month
- Need more transformation credits

**OpenAI → Tier 2+ ($50+ spend):**
- Processing 100+ images/day with AI
- Need higher rate limits

**Pinecone → Starter ($70/mo):**
- More than 100K embeddings
- Need multiple indexes
- Want higher query throughput

### Performance Optimizations

**Frontend:**
- Implement infinite scroll with react-virtual
- Lazy load images with Intersection Observer
- Use Cloudinary's auto-format (WebP for modern browsers)
- Cache static assets with long TTL
- Use React.memo for expensive components
- Debounce search inputs (300ms)

**Backend:**
- Index frequently queried fields in Convex
- Batch Convex queries when possible
- Cache Cloudinary URLs (they don't change)
- Rate limit expensive AI operations
- Use Convex scheduled functions for batch processing
- Implement pagination for large result sets

**Database:**
- Archive old media (move to S3 Glacier after 1 year)
- Compress custom metadata JSON
- Delete orphaned records regularly
- Monitor query performance in Convex dashboard

---

## 🆘 Common Issues & Solutions

### Issue: "convex is not defined" error
**Solution:** 
```typescript
// Ensure ConvexProvider wraps app
import { ConvexProvider, ConvexReactClient } from "convex/react"

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!)

root.render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>
)
```

### Issue: Tailwind classes not applying
**Solution:**
```javascript
// vite.config.ts - ensure Tailwind plugin
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()]
})

// src/index.css - ensure import
@import "tailwindcss";
```

### Issue: Cloudinary upload fails with CORS error
**Solution:**
- Go to Cloudinary Dashboard → Settings → Security
- Add to "Allowed fetch domains": `http://localhost:3000`, your production domain
- Ensure upload preset is "unsigned"

### Issue: Real-time updates not working
**Solution:**
```typescript
// Ensure using useQuery (not useLazyQuery)
const media = useQuery(api.media.list) // ✅ Subscribes to updates
const media = useLazyQuery(api.media.list) // ❌ One-time fetch

// Check Convex dev server is running
// Check WebSocket connection in browser DevTools → Network → WS
```

### Issue: Type errors with Convex API
**Solution:**
```bash
# Regenerate types
pnpm dlx convex dev --once

# Ensure importing from _generated
import { api } from "../convex/_generated/api"
```

### Issue: Video thumbnails showing black frames
**Solution:**
- Use Cloudinary's `start_offset: "auto"` to skip black frames
- Or implement manual thumbnail selector (feature #5)

### Issue: AI auto-tagging costs too high
**Solution:**
- Use Cloudinary auto-tagging (free) for all uploads
- Reserve OpenAI Vision for user-triggered "Generate Description"
- Cache AI results to avoid re-processing
- Set confidence threshold higher (only tag when confident)

---

## 🎓 Learning Resources for Team

### Must-Read Documentation
1. **Convex Docs** - https://docs.convex.dev
   - Start with "Getting Started"
   - Read "Database" and "Functions" sections thoroughly
   - Understand queries vs mutations vs actions

2. **React 19 Features** - https://react.dev
   - Concurrent features (Suspense, useTransition)
   - Server Components (if migrating to Next.js later)

3. **TypeScript Best Practices** - https://typescript.dev
   - Strict mode benefits
   - Utility types (Pick, Omit, Partial)
   - Type guards

4. **Tailwind v4 Changes** - https://tailwindcss.com/docs
   - New Vite plugin approach
   - CSS theme() function
   - @theme directive

### Video Tutorials (Recommended)
- Convex YouTube channel - Real-time app tutorials
- Jack Herrington - TypeScript + React patterns
- Web Dev Simplified - React Hook Form + Zod

### Code Examples to Study
- Convex examples repo: https://github.com/get-convex/convex-demos
- shadcn/ui source code (learn component patterns)
- Cloudinary React examples

---

## 🤝 Contributing Guidelines

### Branch Naming
- `feat/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code improvements
- `docs/description` - Documentation updates

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Run `pnpm prettier --write .` and `pnpm eslint .`
4. Update documentation if needed
5. Create PR with clear description
6. Request review from team member
7. Address feedback
8. Merge when approved

### Code Review Checklist
- [ ] Code follows TypeScript strict mode
- [ ] No console.logs in production code
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Responsive design works on mobile
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Performance considerations (memoization, virtualization)
- [ ] Security checks (auth, validation)

---

## 📞 Support & Troubleshooting

### Getting Help
1. Check this documentation first
2. Search Convex Discord - https://convex.dev/community
3. Check Cloudinary docs - https://cloudinary.com/documentation
4. Ask team in Slack/Discord
5. Open issue in repository

### Monitoring & Alerts
- **Convex Dashboard** - Monitor function performance, database size
- **Cloudinary Dashboard** - Track storage and bandwidth usage
- **Sentry** (if implemented) - Track frontend errors
- **UptimeRobot** - Monitor uptime
- **Google Analytics** - Track user behavior

### Maintenance Tasks
**Weekly:**
- Review Convex function performance
- Check Cloudinary storage usage
- Review error logs

**Monthly:**
- Audit user activity logs
- Review and archive old media
- Check dependency updates (`pnpm outdated`)
- Review and optimize slow queries

**Quarterly:**
- Security audit
- Performance review
- Cost analysis (Convex, Cloudinary, OpenAI usage)
- Feature usage analytics

---

## 🎉 Next Steps After Initial Setup

1. **Implement Authentication**
   - Set up Convex Auth or Better Auth
   - Create login/signup forms
   - Implement protected routes

2. **Build Core Media Library**
   - Media upload component
   - Grid/table views
   - Basic CRUD operations

3. **Add Cloudinary Integration**
   - Direct upload to Cloudinary
   - Display media with transformations
   - Implement video player

4. **Implement Tagging System**
   - Create tag categories
   - Tag management UI
   - Apply tags to media

5. **Add AI Features**
   - Cloudinary auto-tagging
   - OpenAI description generation
   - Semantic search with Pinecone

6. **Implement Custom Media Type Management**
   - Build Media Type Builder UI
   - Implement dynamic form generator for custom fields
   - Add field validation logic

7. **Build Admin Dashboard**
   - Analytics charts
   - User management
   - Activity logs

7. **Add Enterprise Integrations**
   - SendGrid email notifications
   - Webhook handlers

8. **Polish & Deploy**
   - Responsive design
   - Error handling
   - Loading states
   - Production deployment

---

## 📝 Version History

**v1.0.0** - January 2026
- Initial project setup
- Core architecture defined
- Complete documentation created
- Tech stack finalized: React 19, Convex, Cloudinary, Tailwind v4

---

## 📄 License

[Your License Here - MIT, Apache 2.0, Proprietary, etc.]

---

## 👥 Team

- **Project Lead:** [Name]
- **Frontend Developer:** [Name]
- **Backend Developer:** [Name]
- **UI/UX Designer:** [Name]

---

**End of Documentation**

*This document should be updated as the project evolves. Keep it as the single source of truth for all team members and AI assistants working on the codebase.*