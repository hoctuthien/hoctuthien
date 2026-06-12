import { Metadata } from 'next';
import CalendarClient from './calendar-client';

export const metadata: Metadata = {
  title: 'Lịch học & Lịch dạy | Học Từ Thiện',
  description: 'Xem tổng quan lịch dạy và lịch học của bạn dưới dạng Google Calendar, cập nhật và quản lý thời gian biểu dễ dàng.',
};

export default function CalendarPage() {
  return <CalendarClient />;
}
