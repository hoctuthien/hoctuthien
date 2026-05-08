import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Avatar, IdentityBadge } from './index';
import { IoShieldCheckmark } from 'react-icons/io5';

const meta: Meta = {
  title: 'Shared/Components/Profile',
  tags: ['autodocs'],
  parameters: { 
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Components for displaying user profiles, including Avatars and Identity Badges.',
      },
    },
  },
};

export default meta;

export const Avatars: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-12 p-20 bg-[#F7F9FF] min-h-screen">
      <div className="grid grid-cols-3 gap-20 items-start max-w-2xl">
        <div className="flex flex-col items-center gap-6">
          <Avatar 
            size="large" 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
            badge={<IoShieldCheckmark className="text-white bg-[#005BBF] rounded-full p-1 border-2 border-white" size={24} />}
          />
          <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#005BBF]/60">Large (128px)</span>
        </div>
        <div className="flex flex-col items-center gap-6">
          <Avatar 
            size="medium" 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
          />
          <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#005BBF]/60">Medium (80px)</span>
        </div>
        <div className="flex flex-col items-center gap-6">
          <Avatar 
            size="small" 
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
          />
          <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#005BBF]/60">Small (48px)</span>
        </div>
      </div>
    </div>
  ),
};

export const IdentityBadges: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm p-10 bg-[#F7F9FF] min-h-screen">
      <IdentityBadge 
        type="verified"
        title="Verified Mentor"
        subtitle="Identity Authentication"
      />
      <IdentityBadge 
        type="top-rated"
        title="Top Rated"
        subtitle="Community Performance"
      />
      <IdentityBadge 
        type="expert"
        title="Expert"
        subtitle="Domain Proficiency"
      />
    </div>
  ),
};
