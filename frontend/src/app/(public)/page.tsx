import React from 'react';
import { HeroSection } from './homepage/components/HeroSection';
import { FeaturesSection } from './homepage/components/FeaturesSection';
import { CourseCategories } from './homepage/components/CourseCategories';
import { InstructorTeam } from './homepage/components/InstructorTeam';
import { Testimonials } from './homepage/components/Testimonials';
import { Newsletter } from './homepage/components/Newsletter';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <CourseCategories />
      <InstructorTeam />
      <Testimonials />
      <Newsletter />
    </div>
  );
}
