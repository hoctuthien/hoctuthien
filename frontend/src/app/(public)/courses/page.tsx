import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import PublicCoursesClient from "./public-courses-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PageMetadata.public_courses");
  return { title: t("title"), description: t("description") };
}

export default async function CoursesPage() {
  return <PublicCoursesClient />;
}


