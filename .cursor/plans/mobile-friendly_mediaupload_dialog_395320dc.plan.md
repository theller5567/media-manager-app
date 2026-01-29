---
name: Mobile-Friendly MediaUpload Dialog
overview: Make the MediaUpload dialog mobile-friendly by moving the step indicator to the top on mobile with icons-only display, making the dialog full-screen on mobile, and optimizing the layout for small screens.
todos:
  - id: "1"
    content: Update DialogContent in MediaUpload.tsx to be full-screen on mobile (max-w-full h-full) while keeping max-w-6xl on desktop
    status: completed
  - id: "2"
    content: Add variant prop to StepIndicator component (desktop | mobile) with mobile variant showing horizontal icons-only layout
    status: completed
  - id: "3"
    content: "Restructure MediaUpload layout: hide sidebar on mobile, show mobile step indicator at top, make content full-width"
    status: completed
  - id: "4"
    content: Update navigation footer to stack buttons vertically on mobile with full-width and larger tap targets
    status: completed
  - id: "5"
    content: Test mobile layout on various screen sizes and ensure all step content components are mobile-friendly
    status: completed
isProject: false
---

# Mobile-Friendly MediaUpload Dialog

## Current Issues

- Dialog uses `max-w-6xl` which is too wide for mobile screens
- Sidebar (`w-64`) takes up valuable horizontal space on mobile
- Step indicator shows full titles and descriptions, consuming vertical space
- Layout is horizontal (flex-row) which doesn't work well on small screens
- Navigation buttons are side-by-side, making them harder to tap

## Solution Overview

### 1. Responsive Dialog Layout

**File**: `frontend/src/components/media/MediaUpload.tsx`

- **Mobile**: Full-screen dialog (`w-full h-full max-w-none`)
- **Desktop**: Keep existing `max-w-6xl` layout
- Use Tailwind responsive classes (`md:`) to differentiate layouts

### 2. Mobile Step Indicator Component

**File**: `frontend/src/components/ui/StepIndicator.tsx`

Create a mobile variant that:

- Displays horizontally at the top
- Shows only icons (no titles/descriptions)
- Includes progress bar above icons
- Icons are visual indicators only (not clickable on mobile)
- Compact spacing for mobile screens

**Implementation approach**:

- Add a `variant` prop: `'desktop' | 'mobile'`
- Or create a separate `MobileStepIndicator` component
- Mobile variant shows: Progress bar → Horizontal icon row

### 3. Layout Restructuring

**File**: `frontend/src/components/media/MediaUpload.tsx`

**Mobile layout**:

```
┌─────────────────────────┐
│ Dialog Header           │
├─────────────────────────┤
│ Progress Bar            │ ← Mobile step indicator (top)
│ [●] [●] [○] [○] [○]     │ ← Icons only, horizontal
├─────────────────────────┤
│                         │
│ Step Content            │ ← Full width, scrollable
│                         │
├─────────────────────────┤
│ [Previous] [Next]       │ ← Full-width buttons, stacked
└─────────────────────────┘
```

**Desktop layout** (unchanged):

```
┌──────────┬──────────────────┐
│ Sidebar  │ Content           │
│ Steps    │                   │
│          │                   │
│          │ [Prev] [Next]     │
└──────────┴──────────────────┘
```

### 4. Step Indicator Changes

**Mobile variant**:

- Progress bar: `Step X of Y` and percentage at top
- Horizontal icon row below progress bar
- Icons: 32px circles with status colors
- No text labels or descriptions
- No connector lines (horizontal layout)
- Icons are not clickable (visual only)

**Desktop variant** (existing):

- Keep current vertical sidebar layout
- Full titles and descriptions
- Clickable navigation

### 5. Navigation Buttons

**File**: `frontend/src/components/media/MediaUpload.tsx`

**Mobile**:

- Stack buttons vertically (`flex-col`)
- Full-width buttons (`w-full`)
- Larger tap targets (min-height: 44px)
- Previous button on top, Next/Submit below

**Desktop**:

- Keep horizontal layout (`flex-row`)
- Existing button sizes

### 6. Content Area Optimization

**File**: `frontend/src/components/media/MediaUpload.tsx`

- Remove sidebar on mobile (`hidden md:block`)
- Content area full-width on mobile (`w-full`)
- Ensure step components are responsive (they should already be)

## Implementation Details

### MediaUpload.tsx Changes

1. **DialogContent className**:
   ```tsx
   className="max-w-full h-full md:max-w-6xl md:max-h-[90vh] flex flex-col p-0"
   ```

2. **Conditional Layout**:
   ```tsx
   {/* Mobile: Step indicator at top */}
   <div className="md:hidden border-b border-slate-700 p-4">
     <StepIndicator 
       variant="mobile"
       steps={STEPS}
       currentStep={uploadState.step}
       completedSteps={completedSteps}
     />
   </div>
   
   {/* Desktop: Sidebar with step indicator */}
   <div className="hidden md:flex flex-1 min-h-0">
     <div className="w-64 shrink-0 border-r border-slate-700 p-6">
       <StepIndicator variant="desktop" ... />
     </div>
     {/* Content area */}
   </div>
   ```

3. **Mobile Content Area**:
   ```tsx
   {/* Mobile: Full-width content */}
   <div className="md:hidden flex-1 flex flex-col min-h-0">
     <div className="flex-1 overflow-y-auto p-4">
       {renderStepContent()}
     </div>
     {/* Mobile navigation */}
   </div>
   ```

4. **Navigation Footer**:
   ```tsx
   <div className="border-t border-slate-700 p-4 md:p-6 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:justify-between">
     <button className="w-full md:w-auto ...">Previous</button>
     <button className="w-full md:w-auto ...">Next</button>
   </div>
   ```


### StepIndicator.tsx Changes

Add `variant` prop and conditional rendering:

```tsx
interface StepIndicatorProps {
  // ... existing props
  variant?: 'desktop' | 'mobile';
}

export function StepIndicator({
  variant = 'desktop',
  // ... other props
}: StepIndicatorProps) {
  if (variant === 'mobile') {
    return (
      <div className="space-y-3">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm text-slate-400">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <div className="h-2 w-full bg-slate-700 rounded-full">
            <div className="h-full bg-linear-to-r from-cyan-500 to-cyan-600" 
                 style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
        
        {/* Horizontal icon row */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.has(index);
            const isCurrent = currentStep === index;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-1">
                <div className={/* status-based styling */}>
                  {isCompleted ? <Check /> : <Icon />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  // Existing desktop implementation
  return (/* current desktop layout */);
}
```

## Testing Considerations

1. Test on various mobile screen sizes (320px, 375px, 414px widths)
2. Verify step content is scrollable and doesn't overflow
3. Ensure buttons are easily tappable (44px minimum height)
4. Test that progress updates correctly as user moves through steps
5. Verify desktop layout remains unchanged

## Additional Mobile Optimizations (Optional)

- Consider swipe gestures for step navigation (future enhancement)
- Add haptic feedback on button taps (if supported)
- Optimize step content components for mobile (ensure inputs are large enough)
- Consider collapsible sections for complex steps on mobile