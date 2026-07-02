import React from 'react';
import Image from 'next/image';
import { cn } from '@/core/utils/cn';


export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  name?: string;
  borderColor?: string;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 border-2',
  md: 'w-12 h-12 border-[3px]',
  lg: 'w-16 h-16 border-4',
  xl: 'w-[100px] h-[100px] border-[5px] border-[#DDEAFC]',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  name,
  borderColor,
  className
}) => {
  const getInitials = (n: string) => {
    return n.split(' ').map(i => i[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div 
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-white text-blue-600 border-blue-100 shadow-sm flex-shrink-0',
        sizeClasses[size],
        className
      )}
      style={borderColor ? { borderColor } : {}}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 48px, 100px" className="object-cover" />
      ) : (
        <div className="font-sans font-black text-blue-600 text-[0.8em]">
          {name ? getInitials(name) : '?'}
        </div>
      )}
    </div>
  );
};

interface AvatarStackProps {
  children: React.ReactNode;
  max?: number;
  className?: string;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({ children, max = 4, className }) => {
  const avatars = React.Children.toArray(children);
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn('inline-flex items-center -space-x-3', className)}>
      {visibleAvatars}
      {remaining > 0 && (
        <div className="relative inline-flex items-center justify-center rounded-full overflow-hidden bg-primary text-text-inverse text-[12px] font-bold w-8 h-8 border-2 border-background z-[1]">
          +{remaining}
        </div>
      )}
    </div>
  );
};
