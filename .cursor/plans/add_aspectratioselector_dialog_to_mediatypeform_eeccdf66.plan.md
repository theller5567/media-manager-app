---
name: Add AspectRatioSelector Dialog to MediaTypeForm
overview: Implement an 'Advanced Controls' dialog in the MediaTypeForm to manage aspect ratio and size constraints without cluttering the main wizard steps.
todos: []
isProject: false
---

I will implement the 'Advanced Controls' dialog by modifying `AspectRatioSelector` to be a controlled component and integrating it into `MediaTypeForm`.

1.  **Refactor AspectRatioSelector**:

    - Update `AspectRatioSelector.tsx` to accept `initialAspectRatio`, `initialWidth`, `initialHeight`, `initialEnabled` props.
    - Add an `onSave` prop that returns the current configuration.
    - Add an 'Apply Changes' button at the bottom of the component.

2.  **Update MediaTypeForm State**:

    - Add state for `dimensionConstraints`: `{ enabled: boolean, ratio: string, width: number | '', height: number | '' }`.
    - Update the `handleSubmit` logic to include these new fields in the `MediaType` object (I will need to check the `MediaType` type definition first to ensure it supports these fields).

3.  **UI Integration**:

    - Add a section in Step 2 (Format Restrictions) of `MediaTypeForm.tsx` for 'Advanced Dimension Controls'.
    - Use the existing `Dialog` component to wrap `AspectRatioSelector`.
    - Show a summary of the constraints if enabled.

### Files to change:

- [`frontend/src/components/media/AspectRatioSelector.tsx`](frontend/src/components/media/AspectRatioSelector.tsx)
- [`frontend/src/components/media/MediaTypeForm.tsx`](frontend/src/components/media/MediaTypeForm.tsx)
- [`frontend/src/types/mediaType.ts`](frontend/src/types/mediaType.ts) (if needed)