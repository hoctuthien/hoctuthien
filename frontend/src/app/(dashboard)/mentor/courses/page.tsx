import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MentorCoursesDashboardClient from "./mentor-courses-dashboard-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PageMetadata.dashboard_mentor_courses");
  return { title: t("title"), description: t("description") };
}

export default async function MentorCoursesPage() {
  const session = await auth();

  // Kiểm tra quyền truy cập: Chỉ cho phép người dùng có role === 'mentor'
  if (!session || session.user?.role !== "mentor") {
    redirect("/");
  }

  return <MentorCoursesDashboardClient />;
}

