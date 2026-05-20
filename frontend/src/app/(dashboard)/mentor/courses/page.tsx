import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MentorCoursesClient from "./mentor-courses-client";

export const metadata: Metadata = {
  title: "Quản lý khóa học - Mentor | Học Từ Thiện",
  description: "Trang quản lý danh sách các khóa học của mentor tại Học Từ Thiện.",
};

export default async function MentorCoursesPage() {
  const session = await auth();

  // Kiểm tra quyền truy cập: Chỉ cho phép người dùng có role === 'mentor'
  if (!session || session.user?.role !== "mentor") {
    redirect("/");
  }

  return <MentorCoursesClient />;
}
