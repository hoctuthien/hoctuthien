import { apiService } from '@/core/api/base';

export const testFetch = async () => {
  // Should trigger ESLint error: missing cache config
  const data = await apiService.get('/test');
  return data;
};

export const testFetchEmpty = async () => {
  // Should trigger ESLint error: empty object
  const data = await apiService.get('/test', {});
  return data;
};

export const testFetchCorrect = async () => {
  // Should NOT trigger ESLint error
  const data = await apiService.get('/test', { next: { revalidate: 60 } });
  return data;
};
