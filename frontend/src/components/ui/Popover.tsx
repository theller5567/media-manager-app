import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverPortal = PopoverPrimitive.Portal;

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, side = "bottom", sideOffset = 8, align = "start", ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      side={side}
      sideOffset={sideOffset}
      align={align}
      className={cn(
        "z-50 w-72 rounded-md border border-slate-700 bg-slate-900 p-4 text-slate-100 shadow-md outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName ?? "PopoverContent";

export interface SimplePopoverProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> {
  trigger: React.ReactNode;
  children: React.ReactNode;
  /** Position of the content relative to the trigger. Default: "bottom" */
  side?: "top" | "right" | "bottom" | "left";
  /** Gap between trigger and content in pixels. Default: 8 */
  sideOffset?: number;
  /** Content alignment. Default: "start" */
  align?: "start" | "center" | "end";
  contentClassName?: string;
}

/**
 * Simple popover: pass a trigger and children (content). Content is shown below the trigger by default.
 * For full control, use <Popover>, <PopoverTrigger>, and <PopoverContent> instead.
 */
export function SimplePopover({
  trigger,
  children,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  contentClassName,
  ...props
}: SimplePopoverProps) {
  return (
    <Popover {...props}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        className={contentClassName}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

SimplePopover.displayName = "SimplePopover";

export { Popover, PopoverTrigger, PopoverContent, PopoverPortal };
