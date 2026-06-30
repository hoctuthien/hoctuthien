import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import MentorRegisterClient from "./mentor-register-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PageMetadata.dashboard_mentor_register");
  return { title: t("title"), description: t("description") };
}

export default function MentorRegisterPage() {
  return <MentorRegisterClient />;
}
