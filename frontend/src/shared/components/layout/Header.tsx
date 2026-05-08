"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/core/ui/Button';
import { Icon } from '@/core/ui/Icon';
import { cn } from '@/core/utils/cn';

const navLinks = [
  { label: 'home', href: '/' },
  { label: 'courses', href: '/courses' },
  { label: 'mentorship', href: '/mentorship' },
  { label: 'aboutUs', href: '/about-us' },
];

export const Header = () => {
  const t = useTranslations('Common');
  
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-outline-variant">
      <div className="container-custom h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/images/avatar_browser.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full shadow-sm group-hover:scale-110 transition-transform"
          />
          <span className="font-bold text-xl text-primary tracking-tight">
            {t('brandName')}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-text-heading hover:text-primary transition-colors capitalize"
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-text-muted hover:text-primary transition-colors">
            <Icon name="Search" size={20} />
          </button>
          
          <Link href="/register" className="hidden sm:block">
            <Button
              label={t('getStarted')}
              variant="primary"
              size="sm"
              className="rounded-full px-6"
            />
          </Link>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-text-heading">
            <Icon name="Menu" size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};
