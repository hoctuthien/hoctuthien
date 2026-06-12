import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CourseCreateClient from "./course-create-client";

export const metadata: Metadata = {
  title: "Tạo khóa học mới | Học Từ Thiện",
  description: "Trang thiết kế và khởi tạo khóa học mới dành cho các Cố vấn.",
};

export default async function CourseCreatePage() {
  const session = await auth();

  // Route protection: Only mentors can create courses
  if (!session || session.user?.role !== "mentor") {
    redirect("/courses");
  }

  return <CourseCreateClient />;
}
