import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Steps, StatusPill, StatusCard } from "./Steps";
import { LuCheck } from "react-icons/lu";

const meta = {
  title: "Shared/Navigation/Steps",
  component: Steps,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Steps>;

export default meta;
type Story = StoryObj<typeof meta>;

const horizontalItems = [
  { id: 1, label: "Verification", status: "completed" as const },
  { id: 2, label: "Information", status: "completed" as const },
  { id: 3, label: "Finalize", status: "upcoming" as const },
];

const verticalItems = [
  {
    id: 1,
    label: "Identity Verification",
    description: "Successfully confirmed on Oct 24, 2023",
    status: "completed" as const,
  },
  {
    id: 2,
    label: "Academic Records Review",
    description: "Current stage: Calculating GPA and credits",
    status: "active" as const,
    info: "Please ensure all transcripts are high-resolution scans for the curator's review.",
  },
  {
    id: 3,
    label: "Mentor Selection",
    description: "Locks until stage 2 is finalized",
    status: "disabled" as const,
  },
];

export const HorizontalCompleted: Story = {
  args: {
    orientation: "horizontal",
    items: horizontalItems,
  },
};

export const HorizontalInProgress: Story = {
  args: {
    orientation: "horizontal",
    items: [
      { id: 1, label: "Step 1", status: "completed" as const },
      { id: 2, label: "Ongoing", status: "active" as const },
      { id: 3, label: "Upcoming", status: "upcoming" as const },
    ],
  },
};

export const HorizontalError: Story = {
  args: {
    orientation: "horizontal",
    items: [
      { id: 1, label: "Completed", status: "completed" as const },
      { id: 2, label: "Validation Error", status: "error" as const },
      { id: 3, label: "Pending", status: "upcoming" as const },
    ],
  },
};

export const VerticalNarrative: Story = {
  args: {
    orientation: "vertical",
    items: verticalItems,
  },
};

export const StatusPillNavigation = {
  render: () => (
    <div className="status-pill-container">
      <StatusPill
        label="Welcome"
        variant="filled"
        isActive
        icon={<LuCheck size={14} />}
      />
      <StatusPill label="Profile" variant="outline" isActive />
      <StatusPill label="Portfolio" variant="ghost" />
      <StatusPill label="Finish" variant="ghost" />
    </div>
  ),
};

export const EditorialStatusCards = {
  render: () => (
    <div style={{ display: "flex", gap: "20px" }}>
      <StatusCard
        title="Stage Complete"
        description="Documentation Verified"
        status="completed"
      />
      <StatusCard
        title="In Processing"
        description="Awaiting Admin Response"
        status="processing"
      />
    </div>
  ),
};
