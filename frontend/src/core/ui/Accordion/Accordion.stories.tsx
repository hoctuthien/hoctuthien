import React from 'react';
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Accordion } from "./Accordion";

const meta = {
  title: "Core/UI/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof Accordion>;

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '400px' }}>
      <div>
        <p style={{ fontSize: '10px', color: '#7A8BB0', marginBottom: '8px' }}>DEFAULT STATE</p>
        <Accordion title="Student Enrollment Data">
          Content goes here.
        </Accordion>
      </div>
      
      <div>
        <p style={{ fontSize: '10px', color: '#7A8BB0', marginBottom: '8px' }}>CLICKED STATE (OPEN)</p>
        <Accordion title="Active Status Reports" defaultOpen>
          Detailed analytics regarding current mentor-mentee interaction frequencies and milestone achievements across all active cohorts.
        </Accordion>
      </div>
    </div>
  )
};
