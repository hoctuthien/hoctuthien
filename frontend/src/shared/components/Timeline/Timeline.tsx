import React from 'react';
import { LuCheck, LuCalendar, LuAward, LuMenu } from 'react-icons/lu';
import './timeline.css';

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <div className="htt-timeline">
      {items.map((item, index) => (
        <div key={item.id} className={`htt-timeline-item htt-timeline-item--${item.status}`}>
          <div className="htt-timeline-indicator">
            <div className="htt-timeline-line" />
            <div className="htt-timeline-icon-box">
              {item.icon || (item.status === 'completed' ? <LuCheck size={18} /> : null)}
            </div>
          </div>
          <div className="htt-timeline-content">
            <h4 className="htt-timeline-title">{item.title}</h4>
            <p className="htt-timeline-description">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
