import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
} from "./Dropdown";
import { User, Settings, Bell, HelpCircle, LogOut, ArrowUpCircle, Calendar } from "lucide-react";

const meta: Meta<typeof Dropdown> = {
  title: "Shared/Feedback/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
};

export default meta;

export const PrimaryButton: StoryObj = {
  render: () => (
    <div className="flex gap-4 p-20">
      <Dropdown>
        <DropdownTrigger variant="primary">Default</DropdownTrigger>
        <DropdownMenu>
          <DropdownItem>Action 1</DropdownItem>
          <DropdownItem>Action 2</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      
      <Dropdown>
        <DropdownTrigger variant="primary" disabled>Disabled</DropdownTrigger>
        <DropdownMenu>
          <DropdownItem>Should not see</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  ),
};

export const SecondarySizes: StoryObj = {
  render: () => (
    <div className="flex items-center gap-6 p-20">
      <Dropdown>
        <DropdownTrigger variant="secondary" size="lg">Large</DropdownTrigger>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Dropdown>
        <DropdownTrigger variant="secondary" size="md">Default</DropdownTrigger>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
          <DropdownItem>Item 2</DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Dropdown>
        <DropdownTrigger variant="secondary" size="sm">Small</DropdownTrigger>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  ),
};

export const TextTriggers: StoryObj = {
  render: () => (
    <div className="flex gap-10 p-20">
      <Dropdown>
        <DropdownTrigger variant="text" className="font-extrabold text-[1rem]">Select Mentor</DropdownTrigger>
        <DropdownMenu>
          <DropdownItem icon={<User size={18} />}>Mentor A</DropdownItem>
          <DropdownItem icon={<User size={18} />}>Mentor B</DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Dropdown>
        <DropdownTrigger variant="text">All Courses</DropdownTrigger>
        <DropdownMenu>
          <DropdownItem>Design 101</DropdownItem>
          <DropdownItem>Frontend Pro</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  ),
};

export const FullPanelTemplates: StoryObj = {
  render: () => (
    <div className="flex gap-20 p-20 items-start justify-center min-h-[400px]">
      {/* Basic Panel */}
      <div className="flex flex-col gap-2">
        <h4 className="text-caption font-bold text-text-muted uppercase">Basic Panel</h4>
        <Dropdown>
          <DropdownTrigger variant="secondary">Edit Profile</DropdownTrigger>
          <DropdownMenu>
            <DropdownItem isActive>Edit Profile</DropdownItem>
            <DropdownItem>Account Settings</DropdownItem>
            <DropdownItem>Notification Prefs</DropdownItem>
            <DropdownItem>Help Center</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Dividers & Icons */}
      <div className="flex flex-col gap-2">
        <h4 className="text-caption font-bold text-text-muted uppercase">Dividers & Icons</h4>
        <Dropdown>
          <DropdownTrigger variant="secondary">Options</DropdownTrigger>
          <DropdownMenu>
            <DropdownItem icon={<User size={18} />}>My Mentor</DropdownItem>
            <DropdownItem icon={<Calendar size={18} />}>Schedule</DropdownItem>
            <DropdownDivider />
            <DropdownItem icon={<ArrowUpCircle size={18} />} className="text-[#00A36C]">Upgrade Pro</DropdownItem>
            <DropdownDivider />
            <DropdownItem icon={<LogOut size={18} />} isDanger>Sign Out</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  ),
};
