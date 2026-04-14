import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Shared/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Default: StoryObj<typeof Select> = {
  render: () => {
    const [value, setValue] = useState('');
    const options = [
      { label: 'Computer Science', value: 'cs' },
      { label: 'Mathematics', value: 'math' },
      { label: 'Graphic Design', value: 'design' },
      { label: 'Business Administration', value: 'business' },
    ];
    
    return (
      <div className="w-[400px]">
        <Select 
          label="Specialization"
          options={options} 
          value={value} 
          onChange={setValue} 
          placeholder="Choose your field"
        />
      </div>
    );
  },
};

export const WithError: StoryObj<typeof Select> = {
  render: () => {
    return (
      <div className="w-[400px]">
        <Select 
          label="Specialization"
          options={[]} 
          onChange={() => {}} 
          error="Please select a specialization to continue"
        />
      </div>
    );
  },
};
