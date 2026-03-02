import { AlertTriangle } from "lucide-react";
import { AppModal } from "./AppModal";
import { AppButton } from "./AppButton";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDestructive = true,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <AppModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        {isDestructive && (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        )}
        <p className="text-sm text-slate-500">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3 border-t pt-4">
        <AppButton variant="outline" onClick={onClose}>
          Cancel
        </AppButton>
        <AppButton
          variant={isDestructive ? "danger" : "primary"}
          loading={isLoading}
          onClick={async () => {
            await onConfirm();
            onClose();
          }}
        >
          Confirm
        </AppButton>
      </div>
    </AppModal>
  );
}
