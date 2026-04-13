import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Dropdown } from "./Dropdown";
import { LuUser, LuCalendar, LuTrendingUp, LuLogOut } from "react-icons/lu";

const meta = {
  title: "Shared/Action/Dropdown",
  component: Dropdown,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "text"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems = [
  { id: "1", label: "Edit Profile", isActive: true, onClick: fn() },
  { id: "2", label: "Account Settings", onClick: fn() },
  { id: "3", label: "Notification Prefs", onClick: fn() },
  { id: "4", label: "Help Center", onClick: fn() },
];

const iconItems = [
  { id: "1", label: "My Mentor", icon: <LuUser />, onClick: fn() },
  { id: "2", label: "Schedule", icon: <LuCalendar />, onClick: fn() },
  { id: "3", isDivider: true },
  { id: "4", label: "Upgrade Pro", icon: <LuTrendingUp />, onClick: fn() },
  { id: "5", isDivider: true },
  {
    id: "6",
    label: "Sign Out",
    icon: <LuLogOut />,
    isDanger: true,
    onClick: fn(),
  },
];

export const Primary: Story = {
  args: {
    label: "Default",
    variant: "primary",
    items: basicItems,
  },
};

export const Secondary: Story = {
  args: {
    label: "Default",
    variant: "secondary",
    items: basicItems,
  },
};

export const Large: Story = {
  args: {
    label: "Large",
    variant: "secondary",
    size: "lg",
    items: basicItems,
  },
};

export const Small: Story = {
  args: {
    label: "Small",
    variant: "secondary",
    size: "sm",
    items: basicItems,
  },
};

export const TextTrigger: Story = {
  args: {
    label: "Select Mentor",
    variant: "text",
    items: basicItems,
  },
};

export const WithIcons: Story = {
  args: {
    label: "User Menu",
    variant: "primary",
    items: iconItems,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled",
    disabled: true,
    items: basicItems,
  },
};
