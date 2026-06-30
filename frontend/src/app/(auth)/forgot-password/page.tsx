import { getTranslations } from "next-intl/server";
import { ForgotPasswordForm } from './forgot-password-form';

export async function generateMetadata() {
  const t = await getTranslations("PageMetadata.auth_forgotpassword");
  return { title: t("title"), description: t("description") };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
