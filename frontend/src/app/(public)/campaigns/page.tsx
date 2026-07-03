import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CampaignsClient from "./campaigns-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PageMetadata.public_campaigns");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/campaigns" },
  };
}

export default function CampaignsPage() {
  return <CampaignsClient />;
}
