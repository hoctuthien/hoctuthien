import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations("Auth");

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-text-muted animate-pulse font-[Montserrat]">
        {t("registerLoadingText")}
      </p>
    </div>
  );
}
