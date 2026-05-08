import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card } from "./Card";

const meta = {
  title: "Core/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "bordered", "elevated", "glass"],
    },
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div className="w-64 h-32 flex items-center justify-center">Card Content</div>,
    variant: "default",
    padding: "md",
  },
};

export const Bordered: Story = {
  args: {
    children: <div className="w-64 h-32 flex items-center justify-center">Bordered Card</div>,
    variant: "bordered",
    padding: "md",
  },
};

export const Elevated: Story = {
  args: {
    children: <div className="w-64 h-32 flex items-center justify-center">Elevated Card</div>,
    variant: "elevated",
    padding: "md",
  },
};

export const Glass: Story = {
  args: {
    children: <div className="w-64 h-32 flex items-center justify-center">Glass Card</div>,
    variant: "glass",
    padding: "md",
  },
};
