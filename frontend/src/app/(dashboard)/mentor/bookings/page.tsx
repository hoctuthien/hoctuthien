import { getTranslations } from "next-intl/server";
import { Metadata } from 'next';
import MentorBookingsClient from './mentor-bookings-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PageMetadata.dashboard_mentor_bookings");
  return { title: t("title"), description: t("description") };
}

export default function MentorBookingsPage() {
  return <MentorBookingsClient />;
}
