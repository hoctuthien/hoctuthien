"use client";

import { useEffect } from "react";
import { Button } from "@/core/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-white rounded-2xl shadow-sm border border-border-default">
      <h2 className="text-2xl font-bold text-text-heading mb-4 font-[Montserrat]">
        Something went wrong!
      </h2>
      <p className="text-text-muted mb-8 max-w-md font-[Montserrat]">
        We encountered an error while loading the login page. Please try again.
      </p>
      <Button
        label="Try again"
        onClick={() => reset()}
        variant="primary"
        size="md"
      />
    </div>
  );
}
