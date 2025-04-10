import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-sm mx-4 px-6 py-6 rounded-lg border-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Hide the close button completely */}
        <style 
          dangerouslySetInnerHTML={{ 
            __html: `
              [data-radix-popper-content-wrapper] [data-radix-dialog-close] {
                display: none !important;
              }
            ` 
          }}
        />
        
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center" dangerouslySetInnerHTML={{ __html: description }} />
        </DialogHeader>
        
        <DialogFooter className="flex flex-col gap-2 mt-2">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
