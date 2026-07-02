import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { generateQrAction } from "@/app/(dashboard)/activation/actions";
import ActivationClient from "@/app/(dashboard)/activation/ActivationClient";

export async function generateMetadata() {
  const t = await getTranslations("PageMetadata.dashboard_activation");
  return { title: t("title"), description: t("description") };
}

export default async function ActivationPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Nếu người dùng không phải là mentee (ví dụ admin hoặc mentor), không cần trang kích hoạt này
  if (session.user.role !== 'mentee') {
    redirect("/dashboard");
  }

  // Pre-fetch QR data on the server side!
  let initialQrData = null;
  try {
    initialQrData = await generateQrAction();
  } catch (error) {
    console.error("Error generating QR on server:", error);
  }

  return <ActivationClient initialQrData={initialQrData} />;
}
