import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

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
  confirmText = "Continue",
  cancelText = "Cancel",
  onConfirm,
  isLoading = false
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[85%] sm:max-w-sm mx-auto">
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-xl font-bold">{title}</AlertDialogTitle>
          <AlertDialogDescription 
            className="text-center"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col space-y-2 mt-4">
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={isLoading}
            className="w-full py-6 text-base"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="w-full py-6 text-base bg-gray-100 hover:bg-gray-200 text-black"
          >
            {cancelText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}