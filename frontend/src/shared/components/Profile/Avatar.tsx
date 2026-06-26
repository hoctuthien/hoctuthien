import React from 'react';
import Image from 'next/image';
import { cn } from '@/core/utils/cn';


export type AvatarSize = 'small' | 'medium' | 'large';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  badge?: React.ReactNode;
  className?: string;
}

const sizeConfig = {
  small: { w: '48px', h: '48px', r: '24px' },
  medium: { w: '80px', h: '80px', r: '32px' },
  large: { w: '128px', h: '128px', r: '48px' },
};

export const Avatar = ({ 
  src, 
  alt = 'Avatar', 
  size = 'medium', 
  badge, 
  className = '' 
}: AvatarProps) => {
  const config = sizeConfig[size];
  const isSmall = size === 'small';
  
  return (
    <div className={cn('relative inline-block shrink-0', className)}>
      <div 
        style={{ 
          width: config.w, 
          height: config.h, 
          borderRadius: config.r 
        }}
        className={cn(
          'overflow-hidden bg-white border border-blue-100 flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.08)]',
          !isSmall && 'shadow-[0_4px_12px_-4px_rgba(0,0,0,0.12),0_12px_24px_-4px_rgba(0,0,0,0.1)]'
        )}
      >
        {src ? (
          <Image 
            src={src} 
            alt={alt} 
            fill
            sizes={size === 'large' ? '128px' : size === 'medium' ? '80px' : '48px'}
            className="object-cover"
          />
        ) : (
          <div className="text-blue-600 font-black uppercase select-none text-xl">
            {alt.charAt(0)}
          </div>
        )}
      </div>
      {badge && (
        <div className="absolute -bottom-1 -right-1 z-10 scale-100 origin-bottom-right drop-shadow-lg">
          {badge}
        </div>
      )}
    </div>
  );
};
