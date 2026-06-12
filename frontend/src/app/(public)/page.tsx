import React from 'react';
import { HeroSection } from './homepage/components/HeroSection';
import { FeaturesSection } from './homepage/components/FeaturesSection';
import { CourseCategories } from './homepage/components/CourseCategories';
import { InstructorTeam } from './homepage/components/InstructorTeam';
import { PostsCarousel } from './homepage/components/PostsCarousel';
import { Testimonials } from './homepage/components/Testimonials';
import { BecomeMentorSection } from './homepage/components/BecomeMentorSection';
import { Newsletter } from './homepage/components/Newsletter';
import { getPostsAction } from '@/app/admin/posts/actions/posts';
import { mentorGateway } from '@/core/gateway';

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let posts: any[] = [];
  let mentors: any[] = [];
  try {
    const [postsRes, mentorsRes] = await Promise.all([
      getPostsAction(),
      mentorGateway.getAllMentorProfiles({ limit: 12 })
    ]);
    posts = postsRes || [];
    mentors = mentorsRes?.data || [];
  } catch (error) {
    console.error("Error fetching data for homepage:", error);
  }

  // Filter only published posts
  const publishedPosts = posts.filter(post => post.status === 'published');

  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <CourseCategories />
      <InstructorTeam initialMentors={mentors} />
      <PostsCarousel initialPosts={publishedPosts} />
      <Testimonials />
      <BecomeMentorSection />
      <Newsletter />
    </div>
  );
}
