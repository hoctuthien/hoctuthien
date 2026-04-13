import React from 'react';
import { Avatar } from '../Avatar/Avatar';
import './mentor-card.css';

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
    <div className="htt-mentor-card">
      <div className="htt-mentor-card-header">
        <Avatar src={avatarSrc} size="md" />
        <div className="htt-mentor-card-info">
          <h4 className="htt-mentor-card-name">{name}</h4>
          <p className="htt-mentor-card-title">{title}</p>
        </div>
      </div>
      <p className="htt-mentor-card-description">{description}</p>
      <div className="htt-mentor-card-actions">
        <button className="btn btn-primary btn-sm" onClick={onConnect}>
          CONNECT
        </button>
        <button className="btn btn-outline btn-sm" onClick={onProfile}>
          PROFILE
        </button>
      </div>
    </div>
  );
};
