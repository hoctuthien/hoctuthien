import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MentorCard } from "./MentorCard";

const meta = {
  title: "Shared/MentorCard",
  component: MentorCard,
  parameters: {
    layout: "fullscreen",
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
    avatarSrc: "https://xsgames.co/randomusers/assets/avatars/male/72.jpg",
  },
  render: (args) => (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#e0ecfc] p-10 font-sans">
      <div className="flex flex-col gap-8 w-full max-w-[500px]">
        <h2 className="text-[44px] font-bold text-[#3761c2] tracking-tight m-0">Info Popover</h2>
        <MentorCard {...args} />
      </div>
    </div>
  )
};

