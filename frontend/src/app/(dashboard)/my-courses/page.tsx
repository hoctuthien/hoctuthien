import { Metadata } from 'next';
import MyCoursesClient from './my-courses-client';

export const metadata: Metadata = {
  title: 'Khóa học của tôi | Học Từ Thiện',
  description: 'Quản lý lịch trình, xem thông tin buổi học và tương tác với các Cố vấn (Mentor) của bạn.',
};

export default function MyCoursesPage() {
  return <MyCoursesClient />;
}
