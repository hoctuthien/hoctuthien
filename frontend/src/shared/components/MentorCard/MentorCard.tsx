import React from 'react';
import { Avatar } from '../Avatar/Avatar';

interface MentorCardProps {
  name: string;
  title: string;
  description: string;
  avatarSrc: string;
  onConnect?: () => void;
  onProfile?: () => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({
  name,
  title,
  description,
  avatarSrc,
  onConnect,
  onProfile
}) => {
  return (
    <div className="bg-surface rounded-2xl p-6 shadow-lg max-w-[320px] border border-surface-variant transition-all hover:shadow-xl">
      <div className="flex items-center gap-4 mb-4">
        <Avatar src={avatarSrc} size="md" />
        <div className="flex flex-col">
          <h4 className="text-body font-black text-text-heading m-0">{name}</h4>
          <p className="text-caption text-text-muted m-0">{title}</p>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed text-text-muted mb-6">{description}</p>
      <div className="flex gap-3">
        <button 
          className="flex-1 bg-primary text-text-inverse text-[10px] font-bold py-2 px-4 rounded-sm hover:bg-primary-dark transition-colors uppercase tracking-wider" 
          onClick={onConnect}
        >
          CONNECT
        </button>
        <button 
          className="flex-1 bg-transparent text-primary border border-primary text-[10px] font-bold py-2 px-4 rounded-sm hover:bg-primary-fixed transition-colors uppercase tracking-wider" 
          onClick={onProfile}
        >
          PROFILE
        </button>
      </div>
    </div>
  );
};
