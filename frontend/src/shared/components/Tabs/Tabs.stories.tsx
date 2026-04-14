import React, { useState } from 'react';
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tabs } from "./Tabs";
import { LuUser, LuSettings, LuBell, LuFileText, LuImage, LuStickyNote } from 'react-icons/lu';

const meta = {
  title: "Shared/Navigation/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Basic: Story = {
  render: () => {
    const [active, setActive] = useState('1');
    return (
      <Tabs 
        variant="basic"
        activeTabId={active}
        onChange={setActive}
        items={[
          { id: '1', label: 'Selected Tab' },
          { id: '2', label: 'Default State' },
          { id: '3', label: 'Disabled Tab', disabled: true },
        ]}
      />
    );
  }
};

export const Icons: Story = {
  render: () => {
    const [active, setActive] = useState('1');
    return (
      <Tabs 
        variant="basic"
        activeTabId={active}
        onChange={setActive}
        items={[
          { id: '1', label: 'Profile', icon: <LuUser size={18} /> },
          { id: '2', label: 'Settings', icon: <LuSettings size={18} /> },
          { id: '3', label: 'Alerts', icon: <LuBell size={18} /> },
        ]}
      />
    );
  }
};

export const CardStyle: Story = {
  render: () => {
    const [active, setActive] = useState('1');
    return (
      <Tabs 
        variant="card"
        activeTabId={active}
        onChange={setActive}
        items={[
          { id: '1', label: 'Dashboard View' },
          { id: '2', label: 'Analytics' },
          { id: '3', label: 'Reporting' },
        ]}
      />
    );
  }
};

export const Closeable: Story = {
  render: () => {
    const [active, setActive] = useState('1');
    return (
      <Tabs 
        variant="closeable"
        activeTabId={active}
        onChange={setActive}
        onClose={(id) => console.log('Close', id)}
        items={[
          { id: '1', label: 'main_document.pdf', icon: <LuFileText size={16} /> },
          { id: '2', label: 'assets_v2.png', icon: <LuImage size={16} /> },
          { id: '3', label: 'notes.txt', icon: <LuStickyNote size={16} /> },
        ]}
      />
    );
  }
};

export const Pill: Story = {
  render: () => {
    const [active, setActive] = useState('1');
    return (
      <Tabs 
        variant="pill"
        activeTabId={active}
        onChange={setActive}
        items={[
          { id: '1', label: 'All Categories' },
          { id: '2', label: 'Design' },
          { id: '3', label: 'Engineering' },
          { id: '4', label: 'Marketing' },
        ]}
      />
    );
  }
};

export const Capsule: Story = {
  render: () => {
    const [active, setActive] = useState('1');
    return (
      <Tabs 
        variant="capsule"
        activeTabId={active}
        onChange={setActive}
        items={[
          { id: '1', label: 'TOP RATED' },
          { id: '2', label: 'MOST RECENT' },
          { id: '3', label: 'RECOMMENDED' },
        ]}
      />
    );
  }
};
