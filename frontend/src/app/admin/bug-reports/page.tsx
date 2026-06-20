import { BugReportsClient } from './bug-reports-client';

export const metadata = {
  title: 'Báo cáo lỗi | Admin - Học Từ Thiện',
  description: 'Quản lý và xử lý các báo cáo lỗi từ học viên và mentor.',
};

export default function BugReportsPage() {
  return <BugReportsClient />;
}
