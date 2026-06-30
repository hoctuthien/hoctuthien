import { useTranslations } from 'next-intl';
import React from 'react';
import Link from 'next/link';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';

export default function NotFound() {
  const tExtracted = useTranslations('Extracted.appNotFound');
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-10 bg-surface pt-20">
        <div className="text-center">
          <h1 className="text-9xl font-black text-primary/20 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-text-heading mb-4">
            {tExtracted('oopsTrangNayKhongTonTai')}</h2>
          <p className="text-text-muted mb-8 max-w-md mx-auto">
            {tExtracted('coVeNhuDuongDanBanDangTruy')}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
          >
            {tExtracted('quayLaiTrangChu')}</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
