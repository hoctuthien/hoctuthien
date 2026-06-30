import { useTranslations } from 'next-intl';
export default function Loading() {
  const tExtracted = useTranslations('Extracted.appPublicCoursesLoading');
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 animate-pulse font-medium">{tExtracted('dangTai')}</p>
    </div>
  );
}
