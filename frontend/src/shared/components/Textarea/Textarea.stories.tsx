import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Shared/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Briefly describe your professional journey...",
    label: "Bio",
  },
  render: (args) => (
    <div className="w-[500px]">
      <Textarea {...args} />
    </div>
  ),
};

export const WithError: Story = {
  args: {
    label: "Professional Journey",
    placeholder: "Tell us about your experience",
    error: "Bio must be at least 100 characters long",
  },
  render: (args) => (
    <div className="w-[500px]">
      <Textarea {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: "Internal Note",
    value: "This application is under review by the design team.",
    disabled: true,
  },
  render: (args) => (
    <div className="w-[500px]">
      <Textarea {...args} />
    </div>
  ),
};
