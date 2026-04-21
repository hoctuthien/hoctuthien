export default function HomepagePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-6 text-center bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-blue-900">
        Học Từ Thiện
      </h1>
      <p className="text-xl text-gray-700 max-w-2xl mb-10 leading-relaxed">
        Nền tảng giáo dục và từ thiện — Kết nối tri thức, lan toả yêu thương. 
        Mọi kiến thức ở đây đều miễn phí cho những ai cần.
      </p>
      <div className="flex gap-4">
        <button className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition shadow-lg">
          Bắt đầu học ngay
        </button>
        <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition">
          Tìm hiểu thêm
        </button>
      </div>
    </div>
  );
}
