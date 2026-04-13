import React from "react";
import { Modal } from "./Modal";
import { Button } from "../Button/Button";

export interface TransactionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  isPrimaryLoading?: boolean;
}

export const TransactionalModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  primaryActionLabel,
  secondaryActionLabel = "Cancel",
  onPrimaryAction,
  onSecondaryAction,
  isPrimaryLoading = false,
}: TransactionalModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      containerClassName="max-w-[760px] p-0"
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="border-b border-[#E8EEF8] px-10 py-8 pr-16">
          <h3 className="text-3xl font-black text-[#0D1A33] tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-2 text-xs font-black uppercase tracking-widest text-[#1B4FBF]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="px-10 py-8 overflow-y-auto max-h-[70vh]">
          {children}
        </div>

        {/* Footer */}
        {(primaryActionLabel || secondaryActionLabel) && (
          <div className="flex items-center justify-end gap-6 border-t border-[#E8EEF8] px-10 py-6 bg-slate-50/50">
            {secondaryActionLabel && (
              <button
                onClick={onSecondaryAction || onClose}
                className="text-sm font-bold text-[#414754] hover:text-[#0D1A33] transition-colors"
              >
                {secondaryActionLabel}
              </button>
            )}
            {primaryActionLabel && (
              <Button
                variant="primary"
                label={primaryActionLabel}
                onClick={onPrimaryAction}
                loading={isPrimaryLoading}
                className="px-8 py-3"
              />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
