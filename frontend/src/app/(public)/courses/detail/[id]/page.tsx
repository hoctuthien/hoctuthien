import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { apiService } from "@/core/api/base";
import { SITE_URL } from "@/core/utils/site";
import CourseDetailClient from "./course-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchCourseForMetadata(id: string): Promise<any | null> {
  try {
    const res = await apiService.get<any>(`/courses/${id}`);
    const course = res.data?.data?.[0] || res.data?.data || res.data;
    return course?.id ? course : null;
  } catch (error) {
    console.error(`[courses/detail/${id}] Failed to fetch course for metadata:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("PageMetadata.public_course_detail");

  const course = await fetchCourseForMetadata(id);

  if (!course) {
    return {
      title: t("notFoundTitle"),
      description: t("notFoundDescription"),
      robots: { index: false, follow: true },
    };
  }

  const title = t("title", { courseTitle: course.title });
  let description: string = course.description || t("defaultDescription");
  if (description.length > 160) {
    description = description.substring(0, 157) + "...";
  }

  const imageUrl: string = course.thumbnailUrl
    ? (course.thumbnailUrl.startsWith("/") ? `${SITE_URL}${course.thumbnailUrl}` : course.thumbnailUrl)
    : `${SITE_URL}/images/avatar_main.png`;

  const isPublished = course.status === "ACTIVE";

  return {
    title,
    description,
    alternates: { canonical: `/courses/detail/${id}` },
    openGraph: {
      title,
      description,
      url: `/courses/detail/${id}`,
      siteName: t("siteName"),
      images: [{ url: imageUrl, width: 1200, height: 630, alt: course.title }],
      locale: "vi_VN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: isPublished,
      follow: true,
      googleBot: {
        index: isPublished,
        follow: true,
        "max-image-preview": "large",
      },
    },
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const course = await fetchCourseForMetadata(id);

  const jsonLd = course
    ? {
        "@context": "https://schema.org",
        "@type": "Course",
        name: course.title,
        description: course.description || undefined,
        provider: {
          "@type": "Organization",
          name: "Học Từ Thiện",
          sameAs: SITE_URL,
        },
        offers: {
          "@type": "Offer",
          price: Number(course.price) || 0,
          priceCurrency: "VND",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/courses/detail/${id}`,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CourseDetailClient />
    </>
  );
}
