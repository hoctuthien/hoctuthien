"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
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

const navLinks = [
  { label: 'home', href: '/' },
  { label: 'courses', href: '/courses' },
  { label: 'mentorship', href: '/mentorship' },
  { label: 'aboutUs', href: '/about-us' },
];

export const Header = () => {
  const t = useTranslations('Common');
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-outline-variant">
      <div className="container-custom h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/images/logo.png"
            alt="Học Từ Thiện"
            width={160}
            height={45}
            className="h-16 w-auto object-contain transition-transform"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-text-heading hover:text-primary transition-colors capitalize no-underline"
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

          <Link href="/cart" className="p-2 text-text-muted hover:text-primary transition-colors relative no-underline">
            <Icon name="ShoppingCart" size={20} />
            <span className="absolute top-0.5 right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-500 text-[9px] font-black text-white ring-2 ring-white animate-pulse">
              2
            </span>
          </Link>

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
                    Bảng điều khiển
                  </DropdownItem>
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
                        Quản lý lịch dạy
                      </DropdownItem>
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
            <Link href="/register" className="hidden md:block">
              <Button
                label={t('getStarted')}
                variant="primary"
                size="sm"
                className="rounded-full px-6"
              />
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-text-heading">
            <Icon name="Menu" size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};
