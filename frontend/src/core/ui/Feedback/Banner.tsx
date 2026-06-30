import { useTranslations } from 'next-intl';
import React from 'react';
import { IoClose, IoInformationCircle, IoCheckmarkCircle, IoWarning, IoAlertCircle } from 'react-icons/io5';

export type BannerVariant = 'info' | 'success' | 'warning' | 'error';

interface BannerProps {
  variant?: BannerVariant;
  message: string;
  onClose?: () => void;
  className?: string;
}

const variantStyles: Record<BannerVariant, string> = {
  info: 'bg-[#005bbf] text-white',
  success: 'bg-[#006e2c] text-white',
  warning: 'bg-[#795900] text-white',
  error: 'bg-[#ba1a1a] text-white',
};

const icons: Record<BannerVariant, React.ReactNode> = {
  info: <IoInformationCircle size={20} />,
  success: <IoCheckmarkCircle size={20} />,
  warning: <IoWarning size={20} />,
  error: <IoAlertCircle size={20} />,
};

export const Banner = ({ variant = 'info', message, onClose, className = '' }: BannerProps) => {
  const tExtracted = useTranslations('Extracted.coreUiFeedbackBanner');
  return (
    <div className={`relative flex items-center gap-4 px-4 py-4 rounded-xl shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 ${variantStyles[variant]} ${className}`}>
      <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
        {icons[variant]}
      </div>
      <p className="text-white flex-grow text-sm font-medium leading-5">
        {message}
      </p>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
          aria-label={tExtracted('close')}
        >
          <IoClose size={14} />
        </button>
      )}
    </div>
  );
};
