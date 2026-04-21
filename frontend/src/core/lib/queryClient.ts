import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5min
      gcTime: 1000 * 60 * 60 * 24, // 24h
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
