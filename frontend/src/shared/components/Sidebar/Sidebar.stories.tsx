import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Sidebar, SidebarItem, SidebarGroup } from ".";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Settings,
  Building2,
  CircleHelp,
} from "lucide-react";

const meta: Meta<typeof Sidebar> = {
  title: "Shared/Components/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const SingleLayer: Story = {
  render: () => (
    <div className="h-[600px] flex">
      <Sidebar>
        <SidebarGroup title="Menu">
          <SidebarItem label="Dashboard" icon={<LayoutDashboard size={20} />} isActive />
          <SidebarItem label="My Mentors" icon={<Users size={20} />} />
          <SidebarItem label="Sessions" icon={<Calendar size={20} />} />
          <SidebarItem label="Assignments" icon={<ClipboardList size={20} />} isDisabled />
        </SidebarGroup>
      </Sidebar>
    </div>
  ),
};

export const MultiLayer: Story = {
  render: () => (
    <div className="h-[600px] flex">
      <Sidebar>
        <SidebarItem label="Company Profile" icon={<Building2 size={20} />} />
        <SidebarGroup
          title="Settings"
          icon={<Settings size={20} />}
          isCollapsible
          defaultOpen
          isActive
        >
          <SidebarItem label="Account Security" isActive isSubItem />
          <SidebarItem label="Notifications" isSubItem />
          <SidebarItem label="Billing History" isSubItem />
        </SidebarGroup>
        <SidebarItem label="Help Center" icon={<CircleHelp size={20} />} />
      </Sidebar>
    </div>
  ),
};

export const FullNavigation: Story = {
  render: () => (
    <div className="h-[800px] flex">
      <Sidebar
        header={
          <div className="text-primary font-black text-h3 px-4 py-2">
            MentorConnect
          </div>
        }
      >
        <SidebarGroup title="Main Menu">
          <SidebarItem label="Dashboard" icon={<LayoutDashboard size={22} />} isActive />
          <SidebarItem label="My Mentors" icon={<Users size={22} />} />
        </SidebarGroup>

        <SidebarGroup title="Management">
          <SidebarGroup
            title="Settings"
            icon={<Settings size={22} />}
            isCollapsible
          >
            <SidebarItem label="Account Security" isSubItem />
            <SidebarItem label="Billing" isSubItem />
          </SidebarGroup>
          <SidebarItem label="Assignments" icon={<ClipboardList size={22} />} />
        </SidebarGroup>

        <div className="mt-auto">
          <SidebarItem label="Help Center" icon={<CircleHelp size={22} />} />
        </div>
      </Sidebar>
    </div>
  ),
};
