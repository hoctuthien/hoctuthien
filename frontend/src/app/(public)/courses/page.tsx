export default function CoursesPage() {
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
