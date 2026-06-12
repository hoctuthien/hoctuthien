import { Metadata } from "next";
import PublicCoursesClient from "./public-courses-client";

export const metadata: Metadata = {
  title: "Khóa học & Cố vấn | Học Từ Thiện",
  description: "Khám phá các chương trình học chất lượng cao được thiết kế và cố vấn bởi các chuyên gia hàng đầu.",
};

export default async function CoursesPage() {
  return <PublicCoursesClient />;
}


