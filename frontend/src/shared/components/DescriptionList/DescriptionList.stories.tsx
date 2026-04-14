import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DescriptionList } from "./DescriptionList";
import { LuUser, LuMail, LuBriefcase, LuGraduationCap } from "react-icons/lu";

const meta = {
  title: "Shared/DescriptionList",
  component: DescriptionList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DescriptionList>;

export default meta;
type Story = StoryObj<typeof DescriptionList>;

const mockItems = [
  {
    id: "1",
    label: "Full Name",
    value: "Alexander Curator",
    icon: <LuUser size={14} />,
  },
  {
    id: "2",
    label: "Professional Expertise",
    value: "Senior UX Design Architect",
    icon: <LuBriefcase size={14} />,
  },
  {
    id: "3",
    label: "Email Address",
    value: "alexander.c@curatedexchange.com",
    icon: <LuMail size={14} />,
  },
  {
    id: "4",
    label: "Mentorship Program",
    value: "Global Leadership Excellence",
    icon: <LuGraduationCap size={14} />,
  },
];

export const Basic: Story = {
  args: {
    items: mockItems,
    variant: "basic",
  },
};

export const Bordered: Story = {
  args: {
    items: mockItems,
    variant: "bordered",
  },
};

export const Vertical: Story = {
  args: {
    items: mockItems,
    variant: "vertical",
  },
};

export const BorderedVertical: Story = {
  args: {
    items: mockItems,
    variant: "bordered-vertical",
  },
};
