import { getTranslations } from "next-intl/server";
import { BugReportsClient } from './bug-reports-client';

export async function generateMetadata() {
  const t = await getTranslations("PageMetadata.admin_bugreports");
  return { title: t("title"), description: t("description") };
}

export default function BugReportsPage() {
  return <BugReportsClient />;
}
