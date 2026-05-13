import type { Meta, StoryObj } from "@storybook/react";
import { TimePicker } from "./TimePicker";

const meta: Meta<typeof TimePicker> = {
  title: "Shared/Components/TimePicker",
  component: TimePicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["small", "default", "large"],
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Select time",
    size: "default",
  },
};

export const Selected: Story = {
  args: {
    value: "09:00 AM",
    size: "default",
  },
};

export const Small: Story = {
  args: {
    size: "small",
  },
};

export const Large: Story = {
  args: {
    size: "large",
  },
};
