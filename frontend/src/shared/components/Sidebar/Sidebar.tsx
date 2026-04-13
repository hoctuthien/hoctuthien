import React from 'react';
import './sidebar.css';

interface SidebarProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children, header, footer }) => {
  return (
    <aside className="htt-sidebar">
      {header && <div className="htt-sidebar-header">{header}</div>}
      <nav className="htt-sidebar-nav">
        {children}
      </nav>
      {footer && <div className="htt-sidebar-footer">{footer}</div>}
    </aside>
  );
};
