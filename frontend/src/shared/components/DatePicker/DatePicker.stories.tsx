import type { Meta, StoryObj } from "@storybook/react";
import { DatePicker } from "./DatePicker";
import { DateRangePicker } from "./DateRangePicker";

const meta: Meta<typeof DatePicker> = {
  title: "Shared/Components/DatePicker",
  component: DatePicker,
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
    placeholder: "Select date",
    size: "default",
  },
};

export const Small: Story = {
  args: {
    placeholder: "Select date",
    size: "small",
  },
};

export const Large: Story = {
  args: {
    placeholder: "Select date",
    size: "large",
  },
};

export const Selected: Story = {
  args: {
    value: new Date(2024, 9, 24),
    size: "default",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Read only",
  },
};

export const Range: StoryObj<typeof DateRangePicker> = {
  render: (args) => <DateRangePicker {...args} />,
  args: {
    placeholder: "Select range",
    size: "default",
  },
};
