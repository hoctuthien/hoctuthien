import { getTranslations } from "next-intl/server";
import { Metadata } from 'next';
import CalendarClient from './calendar-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PageMetadata.dashboard_calendar");
  return { title: t("title"), description: t("description") };
}

export default function CalendarPage() {
  return <CalendarClient />;
}
