import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { apiService } from "@/core/api/base";
import { SITE_URL } from "@/core/utils/site";
import MentorProfileClient from "./mentor-profile-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchMentorProfileForMetadata(id: string): Promise<any | null> {
  try {
    const res = await apiService.get<any>(`/mentor-profiles/${id}`);
    const profile = res.data?.data?.[0] || res.data?.data || res.data;
    return profile?.id ? profile : null;
  } catch (error) {
    console.error(`[mentors/${id}] Failed to fetch mentor profile for metadata:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("PageMetadata.public_mentor_detail");

  const profile = await fetchMentorProfileForMetadata(id);

  if (!profile) {
    return {
      title: t("notFoundTitle"),
      description: t("notFoundDescription"),
      robots: { index: false, follow: true },
    };
  }

  const mentorName = profile.user?.name || t("fallbackName");
  const title = t("title", { mentorName });
  const description = [profile.jobTitle, profile.company].filter(Boolean).join(" tại ") || t("defaultDescription");

  const imageUrl: string = profile.user?.avatarUrl || `${SITE_URL}/images/avatar_main.png`;
  const isVisible = profile.isApproved && profile.status === "ACTIVE";

  return {
    title,
    description,
    alternates: { canonical: `/mentors/${id}` },
    openGraph: {
      title,
      description,
      url: `/mentors/${id}`,
      siteName: t("siteName"),
      images: [{ url: imageUrl, width: 1200, height: 630, alt: mentorName }],
      locale: "vi_VN",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: isVisible,
      follow: true,
    },
  };
}

export default function MentorProfilePage() {
  return <MentorProfileClient />;
}
