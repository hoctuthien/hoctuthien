import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Banner, Notification, InlineMessage, Toast } from './index';
import { IoCloudOffline, IoSend, IoCopy, IoFlash } from 'react-icons/io5';

const meta: Meta = {
  title: 'Shared/Feedback',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Showcase: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-[#F7F9FF] p-6 md:p-10 lg:p-20 font-sans">
      <div className="max-w-[1152px] mx-auto space-y-12 md:space-y-20">
        
        {/* Alerts Section */}
        <section className="space-y-6">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#005BBF]/60">Alerts & Banners</h2>
          <div className="space-y-4">
            <Banner 
              variant="info" 
              message="System Update: New professional development modules have been added to your dashboard." 
              onClose={() => {}}
            />
            <Banner 
              variant="success" 
              message="Success: Your mentorship session for tomorrow has been confirmed." 
              onClose={() => {}}
            />
            <Banner 
              variant="warning" 
              message="Warning: Your subscription expires in 3 days. Please renew to keep access." 
              onClose={() => {}}
            />
            <Banner 
              variant="error" 
              message="Alert: Unauthorized login attempt detected from a new device." 
              onClose={() => {}}
            />
          </div>
        </section>

        {/* Bento Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20">
          {/* Notifications */}
          <section className="space-y-6">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#005BBF]/60">Notifications</h2>
            <div className="space-y-4">
              <Notification 
                variant="success"
                title="Payment Received"
                description="Your transaction for the 'Educational Leadership Series' has been processed."
                timestamp="2m ago"
              />
              <Notification 
                variant="info"
                title="New Insight Available"
                description="A new specialist has joined the network matching your curriculum interests."
                timestamp="1h ago"
              />
              <Notification 
                variant="warning"
                title="Session Starting Soon"
                description="Your seminar with Dr. Sarah Jenkins starts in 15 minutes. Prepare your notes."
                timestamp="15m ago"
              />
              <Notification 
                variant="error"
                title="Sync Failed"
                description="Unable to sync your academic calendar. Please re-authenticate your account."
                timestamp="5h ago"
              />
            </div>
          </section>

          {/* Inline Messages */}
          <section className="space-y-6">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#005BBF]/60">Inline Messages</h2>
            <div className="space-y-4">
              <InlineMessage 
                variant="success"
                title="Changes saved successfully"
                description="Your instructor profile is now live and visible to students."
              />
              <InlineMessage 
                variant="info"
                title="Information"
                description="Course materials will be available 24 hours after enrollment."
              />
              <InlineMessage 
                variant="warning"
                title="Action Required"
                description="Please complete your certification details before scheduling sessions."
              />
              <InlineMessage 
                variant="error"
                title="Critical System Message"
                description="Our learning platform is experiencing high load. Please try again later."
              />
            </div>
          </section>
        </div>

        {/* Toasts Section */}
        <section className="space-y-10 flex flex-col items-center">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#005BBF]/60 w-full text-center">Toasts & Snackbars</h2>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Toast 
              message="Link copied to clipboard" 
              actionLabel="UNDO" 
              icon={<IoCopy className="text-[#3B82F6]" size={18} />}
            />
            <Toast 
              message="Message sent to Instructor" 
              onClose={() => {}}
              icon={<IoSend className="text-[#22C55E]" size={18} />}
            />
            <Toast 
              message="Offline mode active" 
              actionLabel="RETRY"
              icon={<IoCloudOffline className="text-[#EF4444]" size={18} />}
            />
            <Toast 
              message="Connection lost" 
              onClose={() => {}}
              icon={<IoFlash className="text-[#FFB443] animate-pulse" size={18} />}
            />
          </div>
        </section>

      </div>
    </div>
  ),
};

export const Banners: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6 w-full max-w-[800px] p-6 md:p-10">
      <Banner 
        variant="info" 
        message="System Update: New professional development modules have been added to your dashboard." 
        onClose={() => {}}
      />
      <Banner 
        variant="success" 
        message="Success: Your mentorship session for tomorrow has been confirmed." 
        onClose={() => {}}
      />
      <Banner 
        variant="warning" 
        message="Warning: Your subscription expires in 3 days. Please renew to keep access." 
        onClose={() => {}}
      />
      <Banner 
        variant="error" 
        message="Alert: Unauthorized login attempt detected from a new device." 
        onClose={() => {}}
      />
    </div>
  ),
};

export const Notifications: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6 w-full max-w-[552px] p-6 md:p-10 bg-slate-50">
      <Notification 
        variant="success"
        title="Payment Received"
        description="Your transaction for the 'Educational Leadership Series' has been processed."
        timestamp="2m ago"
      />
      <Notification 
        variant="info"
        title="New Insight Available"
        description="A new specialist has joined the network matching your curriculum interests."
        timestamp="1h ago"
      />
      <Notification 
        variant="warning"
        title="Session Starting Soon"
        description="Your seminar with Dr. Sarah Jenkins starts in 15 minutes. Prepare your notes."
        timestamp="15m ago"
      />
      <Notification 
        variant="error"
        title="Sync Failed"
        description="Unable to sync your academic calendar. Please re-authenticate your account."
        timestamp="5h ago"
      />
    </div>
  ),
};

export const InlineMessages: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6 w-full max-w-[552px] p-6 md:p-10">
      <InlineMessage 
        variant="success"
        title="Changes saved successfully"
        description="Your instructor profile is now live and visible to students."
      />
      <InlineMessage 
        variant="info"
        title="Information"
        description="Course materials will be available 24 hours after enrollment."
      />
      <InlineMessage 
        variant="warning"
        title="Action Required"
        description="Please complete your certification details before scheduling sessions."
      />
      <InlineMessage 
        variant="error"
        title="Critical System Message"
        description="Our learning platform is experiencing high load. Please try again later."
      />
    </div>
  ),
};

export const Toasts: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6 items-center p-6 md:p-10 bg-slate-50 min-h-[400px]">
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Toast 
          message="Link copied to clipboard" 
          actionLabel="UNDO" 
          icon={<IoCopy className="text-[#3B82F6]" size={18} />}
        />
        <Toast 
          message="Message sent to Instructor" 
          onClose={() => {}}
          icon={<IoSend className="text-[#22C55E]" size={18} />}
        />
        <Toast 
          message="Offline mode active" 
          actionLabel="RETRY"
          icon={<IoCloudOffline className="text-[#EF4444]" size={18} />}
        />
        <Toast 
          message="Connection lost" 
          onClose={() => {}}
          icon={<IoFlash className="text-[#FFB443] animate-pulse" size={18} />}
        />
      </div>
    </div>
  ),
};

