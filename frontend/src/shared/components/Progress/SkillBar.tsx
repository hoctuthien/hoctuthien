import React from 'react';
import './skill-bar.css';

interface SkillBarProps {
  label: string;
  level: string;
  icon: React.ReactNode;
  color?: string;
}

export const SkillBar: React.FC<SkillBarProps> = ({
  label,
  level,
  icon,
  color = 'var(--clr-primary)'
}) => {
  return (
    <div className="htt-skill-bar">
      <div className="htt-skill-bar-icon" style={{ color }}>
        {icon}
      </div>
      <div className="htt-skill-bar-content">
        <span className="htt-skill-bar-label">{label}</span>
      </div>
      <div className="htt-skill-bar-tag" style={{ backgroundColor: color }}>
        {level}
      </div>
    </div>
  );
};
