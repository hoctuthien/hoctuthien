import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LeaderboardClient from "./leaderboard-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PageMetadata.public_leaderboard");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/leaderboard" },
  };
}

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
