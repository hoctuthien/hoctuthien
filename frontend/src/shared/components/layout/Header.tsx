"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { SearchOverlay } from './SearchOverlay';
import { Button } from '@/core/ui/Button';
import { Icon } from '@/core/ui/Icon';
import { Avatar } from '@/core/ui/Avatar';
import { Skeleton } from '@/core/ui/Skeleton';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownDivider
} from '@/core/ui/Dropdown';
import { cn } from '@/core/utils/cn';
import { LocaleSwitcher } from '../LocaleSwitcher';

const navLinks = [
  { label: 'home', href: '/' },
  { label: 'courses', href: '/courses' },
  { label: 'mentorship', href: '/mentorship' },
  { label: 'campaigns', href: '/campaigns' },
  { label: 'leaderboard', href: '/leaderboard' },
  { label: 'transparency', href: '/transparency' },
];

export const Header = () => {
  const tExtracted = useTranslations('Extracted.sharedComponentsLayoutHeader');
  const t = useTranslations('Common');
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-outline-variant">
      <div className="container-custom h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/images/logo.png"
            alt={tExtracted('hocTuThien')}
            width={160}
            height={45}
            className="h-16 w-auto object-contain transition-transform"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-stretch gap-8 h-20">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors capitalize no-underline relative flex items-center h-full",
                  isActive
                    ? "text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-primary after:rounded-full after:z-10"
                    : "text-text-heading hover:text-primary"
                )}
              >
                {t(link.label)}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-text-muted hover:text-primary transition-colors border-0 bg-transparent cursor-pointer"
          >
            <Icon name="Search" size={20} />
          </button>

          {isLoading ? (
            <div className="flex items-center gap-3 pl-2 pr-1 py-1 h-10">
              <Skeleton className="hidden lg:block h-4 w-24 rounded-full" />
              <Skeleton variant="circular" className="h-8 w-8" />
            </div>
          ) : isAuthenticated ? (
            <Dropdown>
              <DropdownTrigger variant="text" hideIcon className="!p-0 hover:bg-transparent focus:no-underline">
                <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-surface-variant transition-colors group">
                  <span className="hidden lg:block text-sm font-bold text-text-heading group-hover:text-primary ">
                    {session.user?.name}
                  </span>
                  <Avatar
                    src={session.user?.image || undefined}
                    name={session.user?.name || ''}
                    size="sm"
                  />
                </div>
              </DropdownTrigger>
              <DropdownMenu className="min-w-[200px] -right-2 left-auto">
                <div className="px-4 py-3 lg:hidden">
                  <p className="text-sm font-bold text-text-heading">{session.user?.name}</p>
                  <p className="text-xs text-text-muted truncate">{session.user?.email}</p>
                </div>
                <div className="lg:hidden h-px bg-outline-variant my-1 mx-2" />
                <Link href="/dashboard" className="no-underline">
                  <DropdownItem icon={<Icon name="Layers" size={18} />}>
                    {tExtracted('bangDieuKhien')}</DropdownItem>
                </Link>
                <Link href="/profile" className="no-underline">
                  <DropdownItem icon={<Icon name="User" size={18} />}>
                    {t('profile')}
                  </DropdownItem>
                </Link>
                <Link href="/my-courses" className="no-underline">
                  <DropdownItem icon={<Icon name="BookOpen" size={18} />}>
                    {t('myCourses')}
                  </DropdownItem>
                </Link>
                {session?.user?.role === 'mentor' && (
                  <>
                    <Link href="/mentor/courses" className="no-underline">
                      <DropdownItem icon={<Icon name="Layers" size={18} />}>
                        {t('createdCourses')}
                      </DropdownItem>
                    </Link>
                    <Link href="/mentor/bookings" className="no-underline">
                      <DropdownItem icon={<Icon name="Calendar" size={18} />}>
                        {tExtracted('quanLyLichDay')}</DropdownItem>
                    </Link>
                  </>
                )}
                <DropdownDivider />
                <DropdownItem
                  icon={<Icon name="LogOut" size={18} />}
                  isDanger
                  onClick={() => signOut()}
                >
                  {t('signOut')}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Link 
              href="/register" 
              className="hidden md:inline-flex items-center justify-center gap-2 font-[Montserrat] rounded-full transition-all duration-300 outline-none select-none hover:cursor-pointer bg-primary text-white font-bold shadow-[0_4px_6px_-4px_#005BBF,0_10px_15px_-3px_#005BBF] hover:bg-[#004493] hover:shadow-lg active:scale-95 text-sm px-6 py-2 h-10 hover:no-underline"
            >
              <span className="leading-tight">{t('getStarted')}</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-text-heading border-0 bg-transparent cursor-pointer"
          >
            <Icon name="Menu" size={24} />
          </button>
        </div>
      </div>
    </header>
    
    {/* Mobile Navigation Drawer */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 z-50 flex md:hidden">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Drawer Content */}
        <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white p-6 shadow-xl animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between mb-8">
            <span className="font-extrabold text-lg text-primary">{t('brandName')}</span>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -mr-2 text-text-heading border-0 bg-transparent cursor-pointer"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
          
          {/* Language Switcher in Mobile Drawer */}
          <div className="mb-6 pb-6 border-b border-outline-variant flex items-center justify-between">
            <span className="text-sm font-bold text-text-muted">{tExtracted('ngonNguLanguage') || 'Ngôn ngữ / Language'}</span>
            <LocaleSwitcher />
          </div>

          <nav className="flex flex-col gap-5 mb-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-base font-bold transition-colors capitalize no-underline py-2",
                    isActive ? "text-primary" : "text-text-heading hover:text-primary"
                  )}
                >
                  {t(link.label)}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-outline-variant pt-6 flex flex-col gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar
                    src={session.user?.image || undefined}
                    name={session.user?.name || ''}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-bold text-text-heading">{session.user?.name}</p>
                    <p className="text-xs text-text-muted truncate">{session.user?.email}</p>
                  </div>
                </div>
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="no-underline text-sm font-bold text-text-heading hover:text-primary flex items-center gap-2 py-2"
                >
                  <Icon name="Layers" size={18} /> {tExtracted('bangDieuKhien')}
                </Link>
                <Link 
                  href="/profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="no-underline text-sm font-bold text-text-heading hover:text-primary flex items-center gap-2 py-2"
                >
                  <Icon name="User" size={18} /> {t('profile')}
                </Link>
                <Link 
                  href="/my-courses" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="no-underline text-sm font-bold text-text-heading hover:text-primary flex items-center gap-2 py-2"
                >
                  <Icon name="BookOpen" size={18} /> {t('myCourses')}
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full text-left rounded-xl border border-rose-200 bg-rose-50 text-rose-600 px-4 py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-100 cursor-pointer"
                >
                  <Icon name="LogOut" size={18} /> {t('signOut')}
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="w-full inline-flex items-center justify-center gap-2 font-[Montserrat] rounded-full transition-all duration-300 outline-none select-none hover:cursor-pointer bg-transparent text-primary border-primary border-2 hover:bg-primary/5 active:scale-95 text-base px-8 py-3 h-12 hover:no-underline font-bold"
                >
                  <span className="leading-tight">{t('signIn')}</span>
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="w-full inline-flex items-center justify-center gap-2 font-[Montserrat] rounded-full transition-all duration-300 outline-none select-none hover:cursor-pointer bg-primary text-white font-bold shadow-[0_4px_6px_-4px_#005BBF,0_10px_15px_-3px_#005BBF] hover:bg-[#004493] hover:shadow-lg active:scale-95 text-base px-8 py-3 h-12 hover:no-underline"
                >
                  <span className="leading-tight">{t('getStarted')}</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    )}
    
    <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
  </>
  );
};
