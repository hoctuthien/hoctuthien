export interface MockCourse {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  price: number;
  studentsCount: number;
  rating: number;
  reviewsCount: number;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  createdAt: string;
  description?: string;
  durationMinutes?: number;
  prerequisites?: string[];
  metadata?: Record<string, any>;
  mentorId?: string;
}

export const mockMentorCourses: MockCourse[] = [
  {
    id: "course-1",
    title: "Lập trình Web Front-end nâng cao với React & Next.js",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=300&q=80",
    category: "Lập trình Web",
    price: 499000,
    studentsCount: 245,
    rating: 4.8,
    reviewsCount: 84,
    status: "published",
    createdAt: "2026-01-10",
  },
  {
    id: "course-2",
    title: "Thiết kế giao diện chuyên nghiệp với Figma cho người mới bắt đầu",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    category: "UI/UX Design",
    price: 0,
    studentsCount: 1540,
    rating: 4.9,
    reviewsCount: 312,
    status: "published",
    createdAt: "2026-02-15",
  },
  {
    id: "course-3",
    title: "Cấu trúc dữ liệu và giải thuật trong Javascript",
    thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=300&q=80",
    category: "Khoa học máy tính",
    price: 299000,
    studentsCount: 0,
    rating: 0,
    reviewsCount: 0,
    status: "pending",
    createdAt: "2026-05-18",
  },
  {
    id: "course-4",
    title: "TypeScript Cơ Bản Đến Nâng Cao cho Web Developers",
    thumbnail: "https://images.unsplash.com/photo-1516116211223-5c359a36298a?auto=format&fit=crop&w=300&q=80",
    category: "Lập trình Web",
    price: 199000,
    studentsCount: 45,
    rating: 4.5,
    reviewsCount: 12,
    status: "draft",
    createdAt: "2026-05-01",
  },
  {
    id: "course-5",
    title: "Xây dựng ứng dụng di động Hybrid với React Native",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80",
    category: "Lập trình di động",
    price: 599000,
    studentsCount: 0,
    rating: 0,
    reviewsCount: 0,
    status: "rejected",
    createdAt: "2026-04-20",
  }
];
