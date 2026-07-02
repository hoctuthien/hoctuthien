import { getTranslations } from "next-intl/server";
import { Metadata } from 'next';
import MyCoursesClient from './my-courses-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PageMetadata.dashboard_mycourses");
  return { title: t("title"), description: t("description") };
}

export default function MyCoursesPage() {
  return <MyCoursesClient />;
}
