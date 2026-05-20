import { auth } from "@/auth";
import MentorCoursesClient from "@/app/(dashboard)/mentor/courses/mentor-courses-client";

export default async function CoursesPage() {
  const session = await auth();

  // Nếu người dùng đã đăng nhập và là Mentor, hiển thị Dashboard Quản lý khóa học của Mentor
  if (session?.user?.role === "mentor") {
    return <MentorCoursesClient />;
  }

  // Giao diện mặc định cho học viên / khách vãng lai
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Khóa học</h1>
      <p className="text-gray-600 mb-8">Khám phá các khóa học miễn phí dành cho bạn.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg shadow-sm border-gray-200">
          <h3 className="text-xl font-semibold mb-2">Khóa học đang cập nhật</h3>
          <p className="text-sm text-gray-400">Nội dung đang được soạn thảo...</p>
        </div>
      </div>
    </div>
  );
}

