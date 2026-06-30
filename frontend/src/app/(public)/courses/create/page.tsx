import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CourseCreateClient from "./course-create-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PageMetadata.public_courses_create");
  return { title: t("title"), description: t("description") };
}

export default async function CourseCreatePage() {
  const session = await auth();

  // Route protection: Only mentors can create courses
  if (!session || session.user?.role !== "mentor") {
    redirect("/courses");
  }

  return <CourseCreateClient />;
}
