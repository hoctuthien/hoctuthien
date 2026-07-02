import { getTranslations } from "next-intl/server";
import React from 'react';
import DashboardClient from './dashboard-client';

export async function generateMetadata() {
  const t = await getTranslations("PageMetadata.dashboard_dashboard");
  return { title: t("title"), description: t("description") };
}

export default function DashboardPage() {
  return <DashboardClient />;
}
