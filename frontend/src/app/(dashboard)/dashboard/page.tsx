import React from 'react';
import DashboardClient from './dashboard-client';

export const metadata = {
  title: 'Bảng điều khiển | Học Từ Thiện',
  description: 'Trung tâm học tập và giảng dạy trực quan của bạn trên Học Từ Thiện.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
