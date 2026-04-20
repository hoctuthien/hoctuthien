import React from "react";
import { Modal } from "./Modal";
import { Button } from "@ui";
import {
  HiCheckCircle,
  HiExclamationTriangle,
  HiExclamationCircle,
} from "react-icons/hi2";

export type ConfirmType = "success" | "warning" | "danger";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ConfirmType;
  title: string;
  description: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
}

const config = {
  success: {
    icon: <HiCheckCircle className="text-[#006e2c]" size={36} />,
    iconBg: "bg-[#86f898]",
    primaryVariant: "primary" as const,
  },
  warning: {
    icon: <HiExclamationTriangle className="text-[#795900]" size={36} />,
    iconBg: "bg-[#ffdea0]",
    primaryVariant: "primary" as const,
  },
  danger: {
    icon: <HiExclamationCircle className="text-[#ba1a1a]" size={36} />,
    iconBg: "bg-[#ffdad6]",
    primaryVariant: "danger" as const,
  },
};

export const ConfirmModal = ({
  isOpen,
  onClose,
  type,
  title,
  description,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
}: ConfirmModalProps) => {
  const currentConfig = config[type];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      containerClassName="max-w-[420px]"
    >
      <div className="flex flex-col items-center text-center p-10">

        <div
          className={`mb-8 flex h-20 w-20 items-center justify-center rounded-full ${currentConfig.iconBg} shadow-inner`}
        >
          {currentConfig.icon}
        </div>


        <h3 className="mb-3 text-3xl font-black text-[#0D1A33] tracking-tight">
          {title}
        </h3>
        <p className="mb-10 text-base text-[#414754] leading-relaxed">
          {description}
        </p>


        <div className="flex w-full gap-4">
          <Button
            variant="outline"
            label={secondaryActionLabel}
            fullWidth
            onClick={onSecondaryAction || onClose}
            className="py-3 border-slate-200"
          />
          <Button
            variant={currentConfig.primaryVariant}
            label={primaryActionLabel}
            fullWidth
            onClick={onPrimaryAction}
            className="py-3 shadow-lg hover:shadow-xl transition-all"
          />
        </div>
      </div>
    </Modal>
  );
};
