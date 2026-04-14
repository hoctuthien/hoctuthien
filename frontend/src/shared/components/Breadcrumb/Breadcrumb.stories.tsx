import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Breadcrumb } from "./Breadcrumb";
import {
  LuChrome,
  LuGraduationCap,
  LuLightbulb,
  LuShield,
} from "react-icons/lu";

const meta = {
  title: "Shared/Navigation/Breadcrumb",
  component: Breadcrumb,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultStyle: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Resources", href: "/resources" },
      { label: "Design Systems" },
    ],
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      { label: "Home", href: "/", icon: <LuChrome size={16} /> },
      {
        label: "Mentorship",
        href: "/mentorship",
        icon: <LuGraduationCap size={16} />,
      },
      { label: "Advanced UI", icon: <LuLightbulb size={16} /> },
    ],
  },
};

export const WithPill: Story = {
  args: {
    items: [
      { label: "Settings", href: "/settings", icon: <LuChrome size={16} /> },
      {
        label: "Security",
        isPill: true,
        icon: <LuShield size={14} strokeWidth={2.5} />,
      },
    ],
    separator: (
      <span style={{ margin: "0 4px", color: "#B8C4D8" }}>&rsaquo;</span>
    ),
  },
};

export const Collapsed: Story = {
  args: {
    items: [
      { label: "MentorConnect", href: "/" },
      { label: "...", isEllipsis: true },
      { label: "Product Design", href: "/design" },
      { label: "Typography Basics" },
    ],
  },
};
