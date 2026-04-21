import dynamic from 'next/dynamic';

export const Calendar = dynamic(() => import('./Calendar').then(mod => mod.Calendar), {
  ssr: false,
  loading: () => null,
});
