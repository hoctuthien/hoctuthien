import { getTranslations } from "next-intl/server";
import { RegisterForm } from "@/app/(auth)/register/components";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("registerTitle"),
    description: t("registerDescription"),
  };
}

export default function RegisterPage() {
  return <RegisterForm />;
}
