"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/core/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");
  const tCommon = useTranslations("Common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-white rounded-2xl shadow-sm border border-border-default">
      <h2 className="text-2xl font-bold text-text-heading mb-4 font-[Montserrat]">
        {t("pageTitle")}
      </h2>
      <p className="text-text-muted mb-8 max-w-md font-[Montserrat]">
        {t("loginPageError")}
      </p>
      <Button
        label={tCommon("tryAgain")}
        onClick={() => reset()}
        variant="primary"
        size="md"
      />
    </div>
  );
}
