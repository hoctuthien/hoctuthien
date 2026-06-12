import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
  containerClassName?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  showCloseButton = true,
  className = "",
  containerClassName = "max-w-lg",
}: ModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">

      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative w-full overflow-hidden rounded-[32px] bg-white shadow-2xl transition-all animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 ${containerClassName}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
      >
        {showCloseButton && (
          <div className="absolute top-8 right-8 z-30">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
              aria-label="Close modal"
            >
              <IoClose size={24} />
            </button>
          </div>
        )}

        <div className={className}>
          {(title || description) && (
            <div className="p-8 pb-4">
              {title && (
                <h3
                  id="modal-title"
                  className="text-3xl font-black text-[#0D1A33] leading-tight tracking-tight"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-2 text-base text-[#414754] leading-relaxed"
                >
                  {description}
                </p>
              )}
            </div>
          )}
          <>
            {children}
          </>
        </div>
      </div>
    </div>,
    document.body,
  );
};
