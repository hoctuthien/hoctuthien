import type { Metadata } from 'next';
import { PenaltyTicketsClient } from './penalty-tickets-client';

export const metadata: Metadata = {
  title: 'Báo cáo vi phạm | Admin',
  description: 'Quản lý các báo cáo vi phạm và vắng mặt của học viên và mentor.',
};

export default function AdminPenaltyTicketsPage() {
  return <PenaltyTicketsClient />;
}
