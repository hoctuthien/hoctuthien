import React, { ElementType } from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

export type IconName = keyof typeof LucideIcons;

interface IconProps extends LucideProps {
  name: IconName;
}

export const Icon = ({ name, ...props }: IconProps) => {
  const SelectedIcon = LucideIcons[name];

  if (!SelectedIcon) {
    return null;
  }

  const Component = SelectedIcon as ElementType;

  return <Component {...props} />;
};
