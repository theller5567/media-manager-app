---
name: Marketing Website for Media Manager App
overview: Create a Next.js marketing website to showcase the Media Manager App, highlight key features, demonstrate value, and convert visitors into customers with tiered pricing.
todos:
  - id: setup_nextjs
    content: Initialize Next.js 15 project with TypeScript, Tailwind CSS, and shadcn/ui components
    status: completed
  - id: create_layout
    content: Set up root layout with metadata, fonts, and SEO configuration
    status: completed
  - id: build_hero
    content: Create Hero section component with headline, CTAs, and visual elements
    status: completed
  - id: build_features
    content: Build Features section component highlighting top 6 features with icons and descriptions
    status: completed
  - id: build_how_it_works
    content: Create How It Works section with 3-step process visualization
    status: completed
  - id: build_pricing
    content: Build Pricing page with 3-tier structure (Starter/Professional/Enterprise) and comparison table
    status: completed
  - id: build_features_page
    content: Create detailed Features page with all feature categories and visuals
    status: completed
  - id: build_demo_page
    content: Create Demo page with video embed or demo request form
    status: completed
  - id: build_faq
    content: Create FAQ section component with collapsible questions
    status: completed
  - id: build_cta_sections
    content: Create reusable CTA section components for conversion points
    status: completed
  - id: add_contact_form
    content: Implement contact form with SendGrid integration and API route
    status: completed
  - id: add_demo_request
    content: Create demo request form with API route and email notifications
    status: completed
  - id: optimize_seo
    content: Add dynamic meta tags, Open Graph images, and structured data (JSON-LD)
    status: completed
  - id: add_analytics
    content: Integrate Google Analytics 4 and conversion tracking
    status: completed
  - id: optimize_performance
    content: Optimize images, implement lazy loading, and code splitting
    status: completed
  - id: deploy_vercel
    content: Deploy to Vercel with environment variables and domain configuration
    status: completed
isProject: false
---

# Marketing Website Plan for Media Manager App

## Overview

Build a modern, SEO-optimized marketing website using Next.js 15 (App Router) to showcase the Media Manager App. The site will target mixed audiences (SMBs, enterprises, agencies, content creators) with tiered pricing and focus on converting visitors through compelling copy, interactive demos, and clear value propositions.

## Technology Stack Decision

**Recommended: Next.js 15 (App Router)**

- Superior SEO with Server Components and automatic meta tag optimization
- Built-in image optimization and performance
- API routes for contact forms and integrations
- Better for marketing sites than TanStack Start (which is better for full-stack apps)

**Alternative Consideration:** If you prefer TanStack Start for consistency with your React stack, it's viable but requires more manual SEO setup.

## Site Structure

```
marketing-site/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Homepage
│   ├── pricing/
│   │   └── page.tsx            # Pricing tiers page
│   ├── features/
│   │   └── page.tsx            # Detailed features page
│   ├── demo/
│   │   └── page.tsx            # Interactive demo/request access
│   ├── blog/                   # SEO content (optional)
│   │   └── [slug]/
│   │       └── page.tsx
│   └── api/
│       ├── contact/
│       │   └── route.ts        # Contact form handler
│       └── demo-request/
│           └── route.ts        # Demo request handler
├── components/
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Pricing.tsx
│   │   ├── Testimonials.tsx
│   │   ├── FAQ.tsx
│   │   └── CTA.tsx
│   ├── ui/                     # Reuse shadcn/ui components
│   └── Demo/
│       ├── VideoPlayer.tsx      # Interactive video demo
│       └── ScreenshotCarousel.tsx
└── public/
    ├── screenshots/            # App screenshots
    ├── videos/                 # Demo videos
    └── og-image.png            # Open Graph image
```

## Page Sections & Content Strategy

### 1. Homepage (`app/page.tsx`)

#### Hero Section

- **Headline**: "AI-Powered Media Management That Fits Your Workflow"
- **Subheadline**: "Organize, search, and collaborate on digital assets with custom metadata, AI assistance, and real-time updates. No folders, no chaos—just smart organization."
- **Primary CTA**: "Start Free Trial" / "Request Demo"
- **Secondary CTA**: "Watch Demo Video"
- **Visual**: Animated screenshot carousel or hero video

#### Key Features Grid (Above the fold)

Highlight top 6 features:

1. **AI Auto-Tagging** - "Never manually tag again"
2. **Custom Media Types** - "Build metadata that matches your workflow"
3. **Semantic Search** - "Find media by meaning, not just keywords"
4. **Real-Time Collaboration** - "See updates instantly across your team"
5. **Video Thumbnail Control** - "Frame-accurate thumbnail selection"
6. **Role-Based Access** - "Enterprise-grade security and permissions"

#### Problem/Solution Section

- **Problem**: "Media chaos: files scattered, untagged, impossible to find"
- **Solution**: "Workflow-centric organization with AI assistance"

#### How It Works (3-Step Process)

1. **Upload** - Drag & drop files with automatic AI analysis
2. **Organize** - Custom metadata fields match your business needs
3. **Discover** - Semantic search finds what you need instantly

#### Interactive Demo Section

- Embedded video player with key features highlighted
- Screenshot carousel with annotations
- "Try Interactive Demo" button (links to `/demo`)

#### Social Proof Section

- Customer logos (if available)
- Testimonials with photos
- Usage stats: "Trusted by X teams", "Y media files managed"

#### Pricing Preview

- Quick overview of 3 tiers with "View Full Pricing" CTA

#### FAQ Section (Collapsible)

- Top 5-7 questions about features, pricing, security, integrations

#### Final CTA Section

- "Ready to transform your media management?"
- Primary CTA button

### 2. Features Page (`app/features/page.tsx`)

Detailed breakdown of all features:

#### Feature Categories:

1. **AI-Powered Organization**

   - Auto-tagging with Cloudinary + OpenAI
   - Semantic search with vector embeddings
   - AI-generated descriptions and alt text

2. **Custom Metadata System**

   - Media Type Builder (visual builder demo)
   - Dynamic form generation
   - Workflow-specific fields

3. **Advanced Media Management**

   - Video thumbnail selector
   - Multi-format support (images, videos, docs, audio)
   - Cloudinary CDN integration

4. **Collaboration & Security**

   - Real-time updates
   - Role-based access control
   - Activity logs and audit trails

5. **Enterprise Features**

   - SendGrid email integration
   - User invitations
   - Admin dashboard with analytics

Each feature includes:

- Visual (screenshot/GIF/video)
- Description with benefits
- Use case examples

### 3. Pricing Page (`app/pricing/page.tsx`)

#### Three-Tier Structure:

**Starter** (SMBs/Individuals)

- Price: $X/month or $Y/year
- Features:
  - Up to 1,000 media items
  - 10GB storage
  - Basic AI tagging
  - 3 team members
  - Standard support

**Professional** (Growing Teams)

- Price: $X/month or $Y/year
- Features:
  - Up to 10,000 media items
  - 100GB storage
  - Advanced AI features
  - Unlimited team members
  - Custom Media Types
  - Priority support

**Enterprise** (Large Organizations)

- Price: Custom
- Features:
  - Unlimited media items
  - Custom storage limits
  - Full AI suite
  - SSO integration
  - Dedicated support
  - Custom integrations
  - SLA guarantee

**Comparison Table**: Side-by-side feature comparison

**FAQ Section**: Pricing-specific questions

### 4. Demo Page (`app/demo/page.tsx`)

- **Option A**: Embedded video walkthrough
- **Option B**: Request access to live demo
- **Option C**: Interactive product tour (using libraries like React Joyride)

Include:

- Demo request form
- Schedule a call CTA
- "Start Free Trial" alternative

### 5. Blog Section (Optional, for SEO)

- Content marketing articles:
  - "How to Organize Your Media Library"
  - "AI-Powered Asset Management: A Complete Guide"
  - "Why Folders Are Killing Your Productivity"
- Each post optimized for SEO with meta tags

## Technical Implementation

### Next.js Configuration

**`next.config.js`**:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'], // For Cloudinary images
    formats: ['image/avif', 'image/webp'],
  },
  // Enable static export if needed
  // output: 'export',
}
```

### SEO Optimization

**Metadata Strategy**:

- Dynamic meta tags per page using Next.js Metadata API
- Open Graph images for social sharing
- Structured data (JSON-LD) for:
  - Organization
  - SoftwareApplication
  - Product
  - FAQPage

**Example metadata** (`app/layout.tsx`):

```typescript
export const metadata: Metadata = {
  title: 'Media Manager App - AI-Powered Media Management',
  description: 'Organize, search, and collaborate on digital assets with custom metadata, AI assistance, and real-time updates.',
  keywords: ['media management', 'digital asset management', 'DAM', 'AI tagging', 'media library'],
  openGraph: {
    title: 'Media Manager App',
    description: 'AI-Powered Media Management Platform',
    images: ['/og-image.png'],
  },
}
```

### Performance Optimization

- Use Next.js Image component for all images
- Implement lazy loading for below-the-fold content
- Code splitting with dynamic imports
- Optimize fonts (next/font)
- Static generation where possible (`generateStaticParams`)

### Styling

- **Reuse Tailwind CSS** from main app
- **Reuse shadcn/ui components** for consistency
- Custom marketing-specific components as needed
- Dark mode support (match app theme)

### Forms & Integrations

**Contact Form** (`app/api/contact/route.ts`):

- SendGrid integration for email delivery
- Rate limiting
- Spam protection (honeypot or reCAPTCHA)

**Demo Request Form** (`app/api/demo-request/route.ts`):

- Store requests in database (Convex or separate DB)
- Send notification emails
- Optional: Calendar integration (Cal.com)

### Analytics & Tracking

- Google Analytics 4
- Conversion tracking for CTAs
- Heat mapping (optional: Hotjar, Clarity)
- A/B testing setup (optional: Vercel Edge Config)

## Content Requirements

### Copywriting Focus Areas

1. **Value Propositions**:

   - "No more folder chaos"
   - "AI does the heavy lifting"
   - "Workflow-centric, not file-centric"
   - "Find anything instantly with semantic search"

2. **Pain Points to Address**:

   - Lost files in nested folders
   - Manual tagging is time-consuming
   - Can't find assets when needed
   - Inconsistent metadata across team

3. **Benefits Over Features**:

   - "Save 10+ hours/week" (not "AI tagging")
   - "Find assets in seconds" (not "semantic search")
   - "Customize to your workflow" (not "custom metadata")

### Visual Assets Needed

1. **Screenshots**:

   - Media library grid view
   - Media Type Builder interface
   - AI tagging in action
   - Search results
   - Admin dashboard

2. **Videos**:

   - 2-3 minute product overview
   - Feature-specific demos (30-60 seconds each)
   - Customer testimonial videos (if available)

3. **Graphics**:

   - Hero illustration or animation
   - Feature icons
   - Comparison charts
   - Process flow diagrams

## Deployment Strategy

### Hosting Options

1. **Vercel** (Recommended for Next.js)

   - Zero-config deployment
   - Automatic HTTPS
   - Edge functions for API routes
   - Analytics included

2. **Netlify**

   - Similar to Vercel
   - Good for static exports

3. **Cloudflare Pages**

   - Global CDN
   - Good performance

### Domain & DNS

- Use subdomain: `www.mediamanager.app` or `getmediamanager.com`
- SSL certificate (automatic with Vercel/Netlify)
- Email setup (SendGrid for transactional)

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_APP_URL=https://your-app-url.com
SENDGRID_API_KEY=...
GOOGLE_ANALYTICS_ID=...
# Contact form webhook (optional)
CONTACT_FORM_WEBHOOK_URL=...
```

## Success Metrics

### Key Performance Indicators (KPIs)

1. **Traffic Metrics**:

   - Monthly visitors
   - Organic search traffic
   - Referral traffic

2. **Conversion Metrics**:

   - Demo request conversion rate
   - Trial signup rate
   - Contact form submissions

3. **Engagement Metrics**:

   - Time on page
   - Scroll depth
   - Video completion rate

4. **SEO Metrics**:

   - Keyword rankings
   - Backlinks
   - Domain authority

## Additional Ideas & Enhancements

### Interactive Elements

1. **ROI Calculator**:

   - Input: Team size, media files, hours spent organizing
   - Output: Time/money saved with Media Manager

2. **Feature Comparison Tool**:

   - Compare Media Manager vs competitors
   - Side-by-side feature matrix

3. **Live Chat**:

   - Intercom, Crisp, or Tawk.to integration
   - Pre-sales support

### Content Marketing

1. **Case Studies**:

   - Customer success stories
   - Before/after scenarios

2. **Resource Library**:

   - Templates (media organization checklist)
   - Guides (DAM best practices)
   - Webinars (recorded)

3. **Integration Showcase**:

   - "Works with" section
   - Integration logos
   - Setup guides

### Trust Signals

1. **Security Badges**:

   - SOC 2 compliance (if applicable)
   - GDPR compliance
   - Data encryption

2. **Social Proof**:

   - Customer logos
   - Testimonials with photos
   - Usage statistics

3. **Awards/Recognition**:

   - Industry awards
   - Press mentions
   - Product Hunt launch

## Implementation Phases

### Phase 1: MVP (Weeks 1-2)

- Homepage with hero, features, pricing preview
- Basic contact form
- Deploy to Vercel

### Phase 2: Content (Weeks 3-4)

- Full features page
- Pricing page with comparison
- FAQ section
- SEO optimization

### Phase 3: Enhancement (Weeks 5-6)

- Demo page/video
- Blog setup (if doing content marketing)
- Analytics integration
- A/B testing setup

### Phase 4: Optimization (Ongoing)

- Performance optimization
- SEO improvements
- Conversion rate optimization
- Content updates

## File Structure Details

### Key Files to Create

1. **`app/layout.tsx`**: Root layout with metadata, fonts, providers
2. **`app/page.tsx`**: Homepage with all sections
3. **`app/pricing/page.tsx`**: Pricing tiers and comparison
4. **`app/features/page.tsx`**: Detailed feature breakdown
5. **`app/demo/page.tsx`**: Demo request or interactive tour
6. **`components/sections/Hero.tsx`**: Hero section component
7. **`components/sections/Features.tsx`**: Features grid component
8. **`components/sections/Pricing.tsx`**: Pricing cards component
9. **`components/ui/Button.tsx`**: Reusable CTA buttons
10. **`lib/utils.ts`**: Utility functions (reuse from main app)

## Next Steps After Plan Approval

1. Set up Next.js project structure
2. Create component library (reuse from main app)
3. Build homepage sections
4. Implement pricing page
5. Add forms and API routes
6. Optimize for SEO
7. Deploy and test
8. Set up analytics and tracking

---

This plan provides a comprehensive foundation for a conversion-focused marketing website that showcases the Media Manager App's unique value propositions while maintaining technical excellence and SEO best practices.