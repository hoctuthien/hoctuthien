'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/lib/queryClient';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
