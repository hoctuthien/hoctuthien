import React from 'react';
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar, AvatarStack } from "./Avatar";

const meta = {
  title: "Core/UI/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const XL: Story = {
  args: {
    size: "xl",
    src: "https://i.pravatar.cc/150?u=1",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    src: "https://i.pravatar.cc/150?u=2",
  },
};

export const Stack: Story = {
  render: () => (
    <AvatarStack>
      <Avatar size="sm" src="https://i.pravatar.cc/150?u=3" />
      <Avatar size="sm" src="https://i.pravatar.cc/150?u=4" />
      <Avatar size="sm" src="https://i.pravatar.cc/150?u=5" />
      <Avatar size="sm" src="https://i.pravatar.cc/150?u=6" />
      <Avatar size="sm" src="https://i.pravatar.cc/150?u=7" />
    </AvatarStack>
  ),
};
