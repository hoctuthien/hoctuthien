import { Metadata } from 'next';
import MentorBookingsClient from './mentor-bookings-client';

export const metadata: Metadata = {
  title: 'Quản lý lịch dạy (Bookings) | Học Từ Thiện',
  description: 'Quản lý các buổi học được đặt từ học viên, cập nhật phòng họp trực tuyến và xác nhận hoàn thành buổi học.',
};

export default function MentorBookingsPage() {
  return <MentorBookingsClient />;
}
