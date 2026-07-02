'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const tExtracted = useTranslations('Extracted.appPublicCoursesError');
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">{tExtracted('somethingWentWrong')}</h2>
      <p className="text-gray-600 mb-6">
        {tExtracted('weEncounteredAnUnexpectedErrorPleaseTryAgain')}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        {tExtracted('tryAgain')}</button>
    </div>
  );
}
// hehe hehe
