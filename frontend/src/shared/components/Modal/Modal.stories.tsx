import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Modal } from './Modal';
import { ConfirmModal } from './ConfirmModal';
import { TransactionalModal } from './TransactionalModal';
import { Button } from '@ui';
import { HiAcademicCap } from 'react-icons/hi2';
import { Select } from '@ui';

const meta: Meta<typeof Modal> = {
  title: 'Shared/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;


const MentorForm = () => {
  const [field, setField] = useState('');
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col gap-2.5">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Full Name</label>
          <input 
            type="text" 
            placeholder="e.g. Julian Anderson" 
            className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/30 focus:bg-white focus:border-[#1B4FBF] outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700" 
          />
        </div>
        <Select 
          label="Specialization"
          options={[
            { label: 'Computer Science', value: 'cs' },
            { label: 'Mathematics', value: 'math' },
            { label: 'Design', value: 'design' },
          ]}
          value={field}
          onChange={setField}
        />
      </div>
      
      <div className="flex flex-col gap-2.5">
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Teaching Experience</label>
        <textarea 
          placeholder="Briefly describe your background in education..." 
          className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50/30 focus:bg-white focus:border-[#1B4FBF] outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700 min-h-[140px] resize-none"
        />
      </div>

      <div className="flex items-center gap-6 rounded-3xl bg-[#E8EFFE] p-6 border-2 border-[#C7D8F8]/30">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1B4FBF] text-white shadow-lg shadow-[#1B4FBF]/30">
          <HiAcademicCap size={28} />
        </div>
        <div>
          <p className="text-lg font-black text-[#0D1A33] leading-tight">Academic Verification</p>
          <p className="mt-1 text-sm font-medium text-[#1B4FBF]/80">Proof of credentials is required for final approval.</p>
        </div>
      </div>
    </div>
  );
};

export const Base: StoryObj<typeof Modal> = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button label="Open Base Modal" onClick={() => setIsOpen(true)} />
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Welcome Back"
          description="Please enter your credentials to access your account and continue your learning journey."
        >
          <div className="p-8 pt-0">
             <Button label="Got it" onClick={() => setIsOpen(false)} fullWidth />
          </div>
        </Modal>
      </>
    );
  },
};

export const Confirm: StoryObj<typeof ConfirmModal> = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button label="Open Confirm Modal" onClick={() => setIsOpen(true)} />
        <ConfirmModal
          isOpen={isOpen}
          type="warning"
          title="Delete Account?"
          description="Are you sure you want to delete your account? This action cannot be undone and all your progress will be lost."
          primaryActionLabel="Delete Anyway"
          secondaryActionLabel="Keep Account"
          onClose={() => setIsOpen(false)}
          onPrimaryAction={() => setIsOpen(false)}
        />
      </>
    );
  },
};

export const Transactional: StoryObj<typeof TransactionalModal> = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button label="Open Mentor Form" onClick={() => setIsOpen(true)} />
        <TransactionalModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Become a Mentor"
          subtitle="Application Form"
          primaryActionLabel="Submit Application"
          onPrimaryAction={() => setIsOpen(false)}
        >
          <MentorForm />
        </TransactionalModal>
      </>
    );
  },
};

