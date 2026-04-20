import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Shared/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "e.g. Dr. Helena Thorne",
    label: "Full Name",
  },
  render: (args) => (
    <div className="w-[400px]">
      <Input {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    label: "Email Address",
    defaultValue: "helena.thorne@mentorconnect.com",
  },
  render: (args) => (
    <div className="w-[400px]">
      <Input {...args} />
    </div>
  ),
};

export const WithError: Story = {
  args: {
    label: "Full Name",
    placeholder: "e.g. Dr. Helena Thorne",
    error: "Full name is required to continue",
  },
  render: (args) => (
    <div className="w-[400px]">
      <Input {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: "Registration ID",
    value: "MC-2024-0891",
    disabled: true,
  },
  render: (args) => (
    <div className="w-[400px]">
      <Input {...args} />
    </div>
  ),
};

export const Verifying: Story = {
  args: {
    label: "Verifying Identity",
    defaultValue: "mentee_alpha_77",
    status: "verifying",
    helperText: "Synchronizing with global database...",
  },
  render: (args) => (
    <div className="w-[500px]">
      <Input {...args} />
    </div>
  ),
};

export const Success: Story = {
  args: {
    label: "Professional Expertise",
    defaultValue: "Senior UX Designer",
    status: "success",
    helperText: "Expertise verified via LinkedIn certification.",
  },
  render: (args) => (
    <div className="w-[500px]">
      <Input {...args} />
    </div>
  ),
};

export const Warning: Story = {
  args: {
    label: "Mentorship Program Code",
    defaultValue: "SUMMER_24_EXPIRED",
    status: "warning",
    helperText: "This program starts in 48 hours. Limited spots remaining.",
  },
  render: (args) => (
    <div className="w-[500px]">
      <Input {...args} />
    </div>
  ),
};

export const ErrorState: Story = {
  args: {
    label: "Bio Word Count",
    defaultValue: "Portfolio link",
    status: "error",
    error: "Minimum requirement is 50 words for professional profiles.",
  },
  render: (args) => (
    <div className="w-[500px]">
      <Input {...args} />
    </div>
  ),
};

export const Password: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
  },
  render: (args) => (
    <div className="w-[400px]">
      <Input {...args} />
    </div>
  ),
};
