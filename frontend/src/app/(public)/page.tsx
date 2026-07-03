import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HeroSection } from './homepage/components/HeroSection';
import { FeaturesSection } from './homepage/components/FeaturesSection';
import { CourseCategories } from './homepage/components/CourseCategories';
import { InstructorTeam } from './homepage/components/InstructorTeam';
import { PostsCarousel } from './homepage/components/PostsCarousel';
import { BecomeMentorSection } from './homepage/components/BecomeMentorSection';
import { Newsletter } from './homepage/components/Newsletter';
import { getPostsAction } from '@/app/admin/posts/actions/posts';
import { categoryGateway, mentorGateway } from '@/core/gateway';
import { SITE_URL } from '@/core/utils/site';

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PageMetadata.public_home");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  let posts: any[] = [];
  let mentors: any[] = [];
  let categories: any[] = [];
  try {
    const [postsRes, mentorsRes, categoriesRes] = await Promise.all([
      getPostsAction(),
      mentorGateway.getAllMentorProfiles({ limit: 12 }),
      categoryGateway.getCategories(),
    ]);
    posts = postsRes || [];
    mentors = mentorsRes?.data || [];
    categories = categoriesRes || [];
  } catch (error) {
    console.error("Error fetching data for homepage:", error);
  }

  // Filter only published posts
  const publishedPosts = posts.filter(post => post.status === 'published');

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Học Từ Thiện",
    url: SITE_URL,
    logo: `${SITE_URL}/images/avatar_browser.png`,
    sameAs: [],
  };

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <FeaturesSection />
      <CourseCategories categories={categories} />
      <InstructorTeam initialMentors={mentors} />
      <PostsCarousel initialPosts={publishedPosts} />
      <BecomeMentorSection />
      <Newsletter />
    </div>
  );
}
