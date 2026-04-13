import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Sidebar, SidebarItem, SidebarGroup } from './';
import { 
  LuLayoutDashboard, 
  LuUsers, 
  LuCalendar, 
  LuClipboardList, 
  LuSettings, 
  LuShieldCheck, 
  LuBuilding2, 
  LuCircleHelp 
} from 'react-icons/lu';

const meta = {
  title: 'Shared/Navigation/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleLayer: Story = {
  render: () => (
    <div style={{ height: '600px' }}>
      <Sidebar>
        <SidebarItem 
          label="Dashboard" 
          icon={<LuLayoutDashboard />} 
          isActive 
        />
        <SidebarItem 
          label="My Mentors" 
          icon={<LuUsers />} 
        />
        <SidebarItem 
          label="Sessions" 
          icon={<LuCalendar />} 
        />
        <SidebarItem 
          label="Assignments" 
          icon={<LuClipboardList />} 
          isDisabled
        />
      </Sidebar>
    </div>
  ),
};

export const MultiLayer: Story = {
  render: () => (
    <div style={{ height: '600px' }}>
      <Sidebar>
        <SidebarItem 
          label="Company Profile" 
          icon={<LuBuilding2 />} 
        />
        <SidebarGroup 
          label="Settings" 
          icon={<LuSettings />} 
          isActive
          items={[
            { id: '1', label: 'Account Security', isActive: true },
            { id: '2', label: 'Notifications' },
            { id: '3', label: 'Billing History' },
          ]}
        />
        <SidebarItem 
          label="Help Center" 
          icon={<LuCircleHelp />} 
        />
      </Sidebar>
    </div>
  ),
};

export const FullNavigation: Story = {
  render: () => (
    <div style={{ height: '800px' }}>
      <Sidebar 
        header={
          <div style={{ padding: '0 16px 24px', fontSize: '1.5rem', fontWeight: 900, color: '#005BBF' }}>
            MentorConnect
          </div>
        }
      >
        <div className="htt-sidebar-section-title">Main Menu</div>
        <SidebarItem label="Dashboard" icon={<LuLayoutDashboard />} isActive />
        <SidebarItem label="My Mentors" icon={<LuUsers />} />
        
        <div className="htt-sidebar-section-title">Management</div>
        <SidebarGroup 
          label="Settings" 
          icon={<LuSettings />} 
          items={[
            { id: '1', label: 'Account Security' },
            { id: '2', label: 'Billing' },
          ]}
        />
        <SidebarItem label="Assignments" icon={<LuClipboardList />} />
        
        <div style={{ marginTop: 'auto' }}>
          <SidebarItem label="Help Center" icon={<LuCircleHelp />} />
        </div>
      </Sidebar>
    </div>
  ),
};
