import { getTranslations } from "next-intl/server";
import type { Metadata } from 'next';
import { PenaltyTicketsClient } from './penalty-tickets-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PageMetadata.admin_penaltytickets");
  return { title: t("title"), description: t("description") };
}

export default function AdminPenaltyTicketsPage() {
  return <PenaltyTicketsClient />;
}
