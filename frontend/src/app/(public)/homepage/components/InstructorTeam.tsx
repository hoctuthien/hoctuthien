"use client";

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Card } from '@/core/ui/Card';
import { Icon } from '@/core/ui/Icon';
import { Button } from '@/core/ui/Button';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';

interface InstructorTeamProps {
  initialMentors?: any[];
}

export const InstructorTeam = ({ initialMentors }: InstructorTeamProps) => {
  const tExtracted = useTranslations('Extracted.appPublicHomepageComponentsInstructorTeam');
  const t = useTranslations('Homepage');
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse Drag-to-Scroll State
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  if (!initialMentors || initialMentors.length === 0) {
    return null;
  }

  const instructors = initialMentors.map((ins) => {
    const name = ins.user?.name || ins.name || "Mentor";
    const role = ins.jobTitle || t('mentor');
    const image = ins.user?.avatarUrl || ins.avatarUrl || '/images/avatar_logo.png';
    const targetUserId = ins.userId || ins.user?.id || ins.id;
    return { name, role, image, targetUserId };
  });

  const updateScrollState = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollState);
      updateScrollState();
      window.addEventListener("resize", updateScrollState);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", updateScrollState);
      }
      window.removeEventListener("resize", updateScrollState);
    };
  }, [instructors]);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { clientWidth } = carouselRef.current;
      const scrollAmount = clientWidth * 0.75; // Scroll 75% of container width
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeftState(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDown || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed sensitivity multiplier
    carouselRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <p className="font-bold text-primary uppercase tracking-widest text-sm mb-4">
              {t('instructorTitle')}
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-heading leading-tight">
              {t('instructorHeading')}
            </h2>
          </div>
          {/* Navigation Chevrons */}
          <div className="flex gap-4">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
                canScrollLeft
                  ? "border-outline-variant text-text-muted hover:border-primary hover:text-primary bg-white cursor-pointer"
                  : "border-outline-variant/50 text-text-muted/40 cursor-not-allowed bg-slate-50/50"
              }`}
              aria-label={tExtracted('scrollLeft')}
            >
              <Icon name="ChevronLeft" size={24} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
                canScrollRight
                  ? "border-outline-variant text-text-muted hover:border-primary hover:text-primary bg-white cursor-pointer"
                  : "border-outline-variant/50 text-text-muted/40 cursor-not-allowed bg-slate-50/50"
              }`}
              aria-label={tExtracted('scrollRight')}
            >
              <Icon name="ChevronRight" size={24} />
            </button>
          </div>
        </div>

        {/* Carousel Container - Mouse click-and-drag and native scrolling */}
        <div
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onDragStart={(e) => e.preventDefault()}
          style={{ scrollBehavior: isDown ? "auto" : "smooth" }}
          className={`flex gap-8 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 select-none ${
            isDown ? "snap-none cursor-grabbing" : "snap-x snap-mandatory cursor-grab"
          }`}
        >
          {instructors.map((instructor, idx) => (
            <div key={idx} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start">
              <Card padding="none" variant="elevated" className="group h-full flex flex-col justify-between">
                <div>
                  {/* Card Cover Background Banner */}
                  <div className="relative h-32 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {/* Blurred background image */}
                    <div className="absolute inset-0 scale-110 blur-md opacity-40 select-none pointer-events-none">
                      <Image
                        src={instructor.image}
                        alt=""
                        fill
                        className="object-cover"
                        draggable={false}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />

                    {/* Hover Social Overlay */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20">
                      {[
                        { icon: FaFacebook, key: "facebook" },
                        { icon: FaTwitter, key: "twitter" },
                        { icon: FaLinkedin, key: "linkedin" }
                      ].map((social) => (
                        <button key={social.key} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-primary hover:scale-110 transition-all flex items-center justify-center">
                          <social.icon size={14} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Avatar Container floating and overlapping */}
                  <div className="relative flex justify-center -mt-12 mb-4 z-30">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
                      <Image
                        src={instructor.image}
                        alt={instructor.name}
                        fill
                        className="object-cover"
                        draggable={false}
                      />
                    </div>
                  </div>

                  {/* Content details */}
                  <div className="p-6 pt-0 text-center">
                    <h4 className="font-bold text-text-heading text-lg mb-1">{instructor.name}</h4>
                    <p className="text-text-muted text-sm">{instructor.role}</p>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <Link href={`/courses?mentorId=${instructor.targetUserId}`} className="no-underline block w-full">
                    <Button
                      label={t('joinWithMe')}
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full border-primary/20 hover:border-primary text-primary"
                    />
                  </Link>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link href="/mentorship" className="no-underline">
            <Button
              label={t('viewAllInstructors')}
              variant="primary"
              className="rounded-full px-10"
              iconRight={<Icon name="ArrowRight" size={18} />}
            />
          </Link>
        </div>
      </div>
    </section>
  );
};
