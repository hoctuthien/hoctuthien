import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/app/(auth)/login/components";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("loginTitle"),
    description: t("loginDescription"),
  };
}

export default function LoginPage() {
  return <LoginForm />;
}
