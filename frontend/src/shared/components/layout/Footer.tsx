import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Icon } from '@/core/ui/Icon';

import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
 
const socialLinks = [
  { icon: FaFacebook, href: '#' },
  { icon: FaTwitter, href: '#' },
  { icon: FaInstagram, href: '#' },
  { icon: FaLinkedin, href: '#' },
];

export const Footer = () => {
  const t = useTranslations('Common');
  const tHome = useTranslations('Homepage');

  const footerLinks = [
    {
      title: t('company'),
      links: [
        { label: t('aboutUs'), href: '/about-us' },
        { label: t('courses'), href: '/courses' },
        { label: t('mentorship'), href: '/mentorship' },
      ],
    },
    {
      title: t('support'),
      links: [
        { label: t('helpCenter'), href: '/help' },
        { label: t('faq'), href: '/faq' },
        { label: t('contactUs'), href: '/contact' },
      ],
    },
    {
      title: t('legal'),
      links: [
        { label: t('privacyPolicy'), href: '/privacy' },
        { label: t('termsOfService'), href: '/terms' },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-outline-variant pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-6">
              <Image
                src="/images/logo.png"
                alt="Học Từ Thiện"
                width={180}
                height={50}
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-text-muted max-w-sm mb-8 leading-relaxed">
              {tHome('brandDescription')}
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                >
                  <social.icon size={20} />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((col, idx) => (
            <div key={idx}>
              <h4 className="font-bold text-text-heading mb-6">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      className="text-text-muted hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            {t('copyright')}
          </p>
          <div className="flex items-center gap-8">
            <Link href="/terms" className="text-sm text-text-muted hover:text-primary">
              {t('termsOfService')}
            </Link>
            <Link href="/privacy" className="text-sm text-text-muted hover:text-primary">
              {t('privacyPolicy')}
            </Link>
            <Link href="/cookies" className="text-sm text-text-muted hover:text-primary">
              {t('cookies')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
