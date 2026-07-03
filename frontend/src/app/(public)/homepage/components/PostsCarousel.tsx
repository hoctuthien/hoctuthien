"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/core/ui/Badge";
import { Icon } from "@/core/ui/Icon";

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  createdAt: string;
  publishedAt: string | null;
  category?: {
    name: string;
    slug: string;
  } | null;
  coverImage?: {
    url: string;
  } | null;
  metadata?: {
    thumbnail?: string;
  };
}

interface PostsCarouselProps {
  initialPosts: Post[];
}

export function PostsCarousel({ initialPosts }: PostsCarouselProps) {
  const tExtracted = useTranslations('Extracted.appPublicHomepageComponentsPostsCarousel');
  const t = useTranslations("Homepage");
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  if (initialPosts.length === 0) {
    return null;
  }

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
  }, [initialPosts]);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { clientWidth } = carouselRef.current;
      const scrollAmount = clientWidth * 0.75;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="py-24 bg-slate-50/60 border-y border-slate-100 overflow-hidden relative">
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider mb-4">
              {t("latestPosts")}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {t("latestPosts")}
            </h2>
            <p className="text-slate-500 text-base md:text-lg mt-4 font-medium leading-relaxed">
              {t("latestPostsDesc")}
            </p>
          </div>

          <div className="flex gap-3 self-end md:self-auto">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-200 transition-all active:scale-95 ${
                canScrollLeft
                  ? "bg-white text-slate-800 hover:border-primary hover:text-primary hover:shadow-md"
                  : "bg-slate-50 text-slate-300 border-slate-150 cursor-not-allowed"
              }`}
              aria-label={tExtracted('scrollLeft')}
            >
              <Icon name="ChevronLeft" size={24} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-200 transition-all active:scale-95 ${
                canScrollRight
                  ? "bg-white text-slate-800 hover:border-primary hover:text-primary hover:shadow-md"
                  : "bg-slate-50 text-slate-300 border-slate-150 cursor-not-allowed"
              }`}
              aria-label={tExtracted('scrollRight')}
            >
              <Icon name="ChevronRight" size={24} />
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-6 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {initialPosts.map((post) => {
            const imageUrl = post.metadata?.thumbnail || post.coverImage?.url;
            const categoryName = post.category?.name || t("uncategorized");

            return (
              <div
                key={post.id}
                className="flex-shrink-0 w-[290px] sm:w-[340px] snap-start bg-white rounded-3xl border border-slate-100/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col group"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Icon name="Image" size={48} strokeWidth={1} />
                    </div>
                  )}

                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="primary"
                      className="!bg-white/95 !backdrop-blur-md !text-slate-800 !border-none !rounded-full !px-3 !py-1.5 shadow-sm text-[10px] font-black uppercase tracking-wider"
                    >
                      {categoryName}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-3">
                      <span>{tExtracted('admin')}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>

                    {post.summary && (
                      <p className="text-slate-500 text-xs font-medium mt-2.5 leading-relaxed line-clamp-2">
                        {post.summary}
                      </p>
                    )}
                  </div>

                  <Link href={`/posts/${post.slug}`} className="block mt-6">
                    <button className="flex items-center gap-1.5 font-extrabold text-primary text-xs hover:gap-2.5 transition-all duration-300">
                      <span>{t("readMore")}</span>
                      <Icon name="ArrowRight" size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
