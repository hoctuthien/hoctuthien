import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
  },
  args: { onChange: fn() },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Lựa chọn mặc định',
    checked: false,
  },
};

export const Selected: Story = {
  args: {
    label: 'Đã chọn',
    checked: true,
  },
};

export const Partial: Story = {
  args: {
    label: 'Chọn một phần',
    indeterminate: true,
    checked: false,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Bị vô hiệu hóa',
    disabled: true,
    checked: true,
  },
};
