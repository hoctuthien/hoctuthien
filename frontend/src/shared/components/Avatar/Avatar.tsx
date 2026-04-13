import React from 'react';
import './avatar.css';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  name?: string;
  borderColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  name,
  borderColor
}) => {
  const getInitials = (n: string) => {
    return n.split(' ').map(i => i[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div 
      className={`htt-avatar htt-avatar--${size}`}
      style={borderColor ? { borderColor } : {}}
    >
      {src ? (
        <img src={src} alt={alt} className="htt-avatar-img" />
      ) : (
        <div className="htt-avatar-fallback">
          {name ? getInitials(name) : '?'}
        </div>
      )}
    </div>
  );
};

interface AvatarStackProps {
  children: React.ReactNode;
  max?: number;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({ children, max = 4 }) => {
  const avatars = React.Children.toArray(children);
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="htt-avatar-stack">
      {visibleAvatars}
      {remaining > 0 && (
        <div className="htt-avatar htt-avatar--stack-more">
          +{remaining}
        </div>
      )}
    </div>
  );
};
