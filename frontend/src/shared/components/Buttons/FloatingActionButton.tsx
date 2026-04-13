"use client";

import React, { ButtonHTMLAttributes } from "react";
import { PlusIcon, CheckIcon, LightBulbIcon } from "@primer/octicons-react";
import { VscFeedback, VscQuestion } from "react-icons/vsc";

export type FABType = "basic" | "controlled";
export type FABBasicVariant = "default" | "success" | "insight";
export type FABControlledVariant = "feedback" | "support";

export interface FloatingActionButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> {
  type?: FABType;
  variant?: FABBasicVariant | FABControlledVariant;
  isShrunk?: boolean;
  label?: string;
  icon?: React.ReactNode;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  type = "basic",
  variant = "default",
  isShrunk = false,
  label,
  icon,
  className = "",
  ...props
}) => {
  const getIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case "default":
        return <PlusIcon size={24} />;
      case "success":
        return <CheckIcon size={24} />;
      case "insight":
        return <LightBulbIcon size={24} />;
      case "feedback":
        return <VscFeedback size={20} />;
      case "support":
        return <VscQuestion size={20} />;
      default:
        return <PlusIcon size={24} />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "default":
        return "bg-primary text-white";
      case "success":
        return "bg-success-deep text-white";
      case "insight":
        return "bg-[#8A6000] text-white";
      case "feedback":
        return "bg-primary text-white";
      case "support":
        return "bg-[#B8C4D8] text-text-body";
      default:
        return "bg-primary text-white";
    }
  };

  const baseStyles =
    "fixed bottom-6 right-6 z-sticky flex items-center justify-center transition-all duration-300 ease-in-out shadow-fab hover:shadow-fab-hover hover:-translate-y-1 active:scale-95 focus-visible:ring-4 focus-visible:ring-primary-surface outline-none";

  if (type === "basic") {
    return (
      <button
        type="button"
        className={`${baseStyles} w-14 h-14 rounded-full ${getVariantStyles()} ${className}`}
        {...props}
      >
        {getIcon()}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`
        ${baseStyles} 
        ${isShrunk ? "w-14 h-14 rounded-full" : "h-14 px-6 rounded-2xl gap-3"} 
        ${getVariantStyles()} 
        ${className}
      `}
      {...props}
    >
      <span className="flex-shrink-0">{getIcon()}</span>
      {!isShrunk && label && (
        <span className="font-bold text-sm tracking-wide whitespace-nowrap">
          {label}
        </span>
      )}
    </button>
  );
};
