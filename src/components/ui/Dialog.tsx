// Living Map dialogs — curved coloured header over a sheet; ConfirmDialog is the alert-red destructive variant.

import * as RadixDialog from "@radix-ui/react-dialog";
import { ReactNode } from "react";

interface LmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  // Section class (e.g. "sec-events") that sets the header colour.
  sec?: string;
  danger?: boolean;
  width?: number;
  children: ReactNode;
}

export const LmDialog = ({ open, onOpenChange, title, subtitle, sec = "", danger, width = 440, children }: LmDialogProps) => (
  <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-[#141713]/50" />
      <RadixDialog.Content
        className={`${sec} lm-dialog lm-swell fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto text-ink ${danger ? "lm-dialog-danger" : ""}`}
        style={{ maxWidth: width }}
      >
        <div className="lm-dialog-head">
          <RadixDialog.Title asChild><h2>{title}</h2></RadixDialog.Title>
          {subtitle ? (
            <RadixDialog.Description className="mt-1.5 text-[15px]">{subtitle}</RadixDialog.Description>
          ) : (
            <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
          )}
        </div>
        <div className="grid gap-3.5 px-7 pb-7 pt-5">{children}</div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  </RadixDialog.Root>
);

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel = "Delete",
  cancelLabel = "Keep",
  onConfirm,
}: ConfirmDialogProps) => (
  <LmDialog open={open} onOpenChange={onOpenChange} title={title} danger width={380}>
    <p>{body}</p>
    <div className="flex justify-end gap-2">
      <button type="button" className="lm-btn lm-btn-soft" onClick={() => onOpenChange(false)}>
        {cancelLabel}
      </button>
      <button
        type="button"
        className="lm-btn lm-btn-danger"
        onClick={() => {
          onOpenChange(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </button>
    </div>
  </LmDialog>
);
