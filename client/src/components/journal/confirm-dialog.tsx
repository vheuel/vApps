import React from "react";
import { Button } from "@/components/ui/button";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      {/* Close button intentionally removed */}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-sm mx-4 px-6 py-6 rounded-lg border-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="text-center space-y-2">
          <DialogPrimitive.Title className="text-xl font-bold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description 
            className="text-center text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
        
        <div className="flex flex-col gap-2 mt-4">
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            className="w-full py-6 text-base"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="w-full py-6 text-base bg-gray-100 hover:bg-gray-200 text-black"
          >
            {cancelText}
          </Button>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  );
}
