import dynamic from 'next/dynamic';

export const DataTable = dynamic(() => import('./DataTable').then(mod => mod.DataTable), {
  ssr: false,
  loading: () => null, // Or a skeleton
});
