"use client";

import React from "react";
import { MentorCard as SharedMentorCard } from "@/shared/components/MentorCard";
import { useRouter } from "next/navigation";

interface MentorProfile {
  id: string;
  userId: string;
  jobTitle?: string;
  company?: string;
  bio?: string;
  yearsOfExperience?: number;
  skills: string[];
  averageRating: number;
  totalStudents: number;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

interface MentorCardProps {
  mentor: MentorProfile;
}

export const MentorCard = ({ mentor }: MentorCardProps) => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/courses?mentorId=${mentor.userId}`);
  };

  return (
    <div className="flex justify-center">
      <SharedMentorCard
        name={mentor.user?.name || "Mentor"}
        title={mentor.jobTitle + (mentor.company ? ` at ${mentor.company}` : "")}
        description={mentor.bio || "No description provided."}
        avatarSrc={mentor.user?.avatarUrl || "/images/avatar_logo.png"}
        onConnect={handleNavigate}
        onProfile={handleNavigate}
      />
    </div>
  );
};
