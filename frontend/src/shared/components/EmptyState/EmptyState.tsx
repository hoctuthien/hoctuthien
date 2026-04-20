import React from 'react';
import { LuCalendar } from 'react-icons/lu';
import { cn } from '@/shared/lib/utils';
import { Button } from "@ui";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <LuCalendar size={48} />,
  title,
  description,
  actionText,
  onAction,
  className
}) => {
  return (
    <div className={cn('flex flex-col items-center text-center py-12 px-6 max-w-[400px] mx-auto', className)}>
      <div className="mb-6 relative">
        <div className="w-[140px] h-[140px] bg-primary-fixed rounded-full flex items-center justify-center text-primary opacity-80">
          {icon}
        </div>
      </div>
      <h3 className="text-h3 font-black text-text-heading mb-2">{title}</h3>
      <p className="text-body text-text-muted mb-8 leading-relaxed">{description}</p>
      {actionText && (
        <Button variant="primary" label={actionText} onClick={onAction} />
      )}
    </div>
  );
};
