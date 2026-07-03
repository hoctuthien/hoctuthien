import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import TransparencyClient from "./transparency-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PageMetadata.public_transparency");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/transparency" },
  };
}

export default function TransparencyPage() {
  return <TransparencyClient />;
}
