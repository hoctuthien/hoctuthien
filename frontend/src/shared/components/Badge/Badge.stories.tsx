import React from 'react';
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./Badge";
import { LuBell, LuMail } from 'react-icons/lu';

const meta = {
  title: "Shared/Data Display/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof Badge>;

export const MetadataLabels: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Badge variant="growth">UX DESIGN</Badge>
      <Badge variant="primary">LEADERSHIP</Badge>
      <Badge variant="warning">TOP RATED</Badge>
    </div>
  ),
};

export const Icons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <Badge variant="neutral" count={12} icon={<LuBell size={24} />} />
      <Badge variant="neutral" count={5} icon={<LuMail size={24} />} />
      <Badge variant="growth">PRO</Badge>
    </div>
  ),
};
