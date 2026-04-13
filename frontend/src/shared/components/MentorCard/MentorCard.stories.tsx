import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MentorCard } from "./MentorCard";

const meta = {
  title: "Components/Data Display/MentorCard",
  component: MentorCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MentorCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Marcus Sterling",
    title: "Principal Architect",
    description: "Helping senior designers bridge the gap between UI excellence and business strategy through structured growth frameworks.",
    avatarSrc: "https://i.pravatar.cc/150?u=9",
  },
};
