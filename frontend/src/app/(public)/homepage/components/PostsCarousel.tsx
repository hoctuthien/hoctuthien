"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/core/ui/Icon";
import { Badge } from "@/core/ui/Badge";

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
  const tCommon = useTranslations("Common");
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fallback beautiful mockup data in case there are no posts in the DB
  const mockPosts: Post[] = [
    {
      id: "mock-1",
      title: tExtracted('hanhTrinhMangLopHocYeuThuongLen'),
      slug: "hanh-trinh-mang-lop-hoc-yeu-thuong-len-ban-cao",
      summary: "Chia sẻ những kỷ niệm và câu chuyện cảm động về dự án xây dựng trường học kiên cố cho hơn 120 học sinh nghèo tại vùng núi cao.",
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      category: { name: "Hoạt động từ thiện", slug: "tu-thien" },
      metadata: { thumbnail: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop" }
    },
    {
      id: "mock-2",
      title: tExtracted('phuongPhapDayTiengAnhSangTaoCho'),
      slug: "phuong-phap-day-tieng-anh-sang-tao",
      summary: "Khám phá các công cụ hỗ trợ và giáo án trực quan giúp các em dễ dàng tiếp thu ngôn ngữ mới một cách đầy hứng khởi.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      category: { name: "Chia sẻ tri thức", slug: "giao-duc" },
      metadata: { thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop" }
    },
    {
      id: "mock-3",
      title: tExtracted('quyenGopTuSachLopHocMoRa'),
      slug: "quyen-gop-tu-sach-lop-hoc",
      summary: "Chiến dịch quyên góp sách cũ và tài liệu học tập thiết thực đã tiếp cận hơn 50 trường học nghèo miền Trung trong năm qua.",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      category: { name: "Chiến dịch cộng đồng", slug: "cong-dong" },
      metadata: { thumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop" }
    },
    {
      id: "mock-4",
      title: tExtracted('lanToaCongNgheSoPhoCapLap'),
      slug: "lan-toa-cong-nghe-so-pho-cap-lap-trinh",
      summary: "Dự án mang máy tính cũ lắp đặt phòng máy và giảng dạy tư duy thuật toán cơ bản cho thanh thiếu niên có hoàn cảnh đặc biệt.",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      category: { name: "Công nghệ & Giáo dục", slug: "cong-nghe" },
      metadata: { thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop" }
    }
  ];

  // If there are real database posts, use them, otherwise use the beautiful fallback mocks
  const activePosts = initialPosts.length > 0 ? initialPosts : mockPosts;

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
      // Recalculate on window resize
      window.addEventListener("resize", updateScrollState);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", updateScrollState);
      }
      window.removeEventListener("resize", updateScrollState);
    };
  }, [activePosts]);

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
      {/* Visual background details */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Header Block */}
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

          {/* Navigation Chevrons */}
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

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-6 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {activePosts.map((post) => {
            const imageUrl = post.metadata?.thumbnail || post.coverImage?.url;
            const categoryName = post.category?.name || t("uncategorized");

            return (
              <div
                key={post.id}
                className="flex-shrink-0 w-[290px] sm:w-[340px] snap-start bg-white rounded-3xl border border-slate-100/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col group"
              >
                {/* Square Cover Image Container */}
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

                  {/* Absolute Category Tag */}
                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="primary"
                      className="!bg-white/95 !backdrop-blur-md !text-slate-800 !border-none !rounded-full !px-3 !py-1.5 shadow-sm text-[10px] font-black uppercase tracking-wider"
                    >
                      {categoryName}
                    </Badge>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Date Details */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-3">
                      <span>{tExtracted('admin')}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>

                    {/* Post Title */}
                    <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt/Summary */}
                    {post.summary && (
                      <p className="text-slate-500 text-xs font-medium mt-2.5 leading-relaxed line-clamp-2">
                        {post.summary}
                      </p>
                    )}
                  </div>

                  {/* Read More Action */}
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
