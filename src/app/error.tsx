"use client";

import { useEffect } from "react";
import { StatusTemplate } from "@/components/status/StatusTemplate";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error captured:", error);
  }, [error]);

  return (
    <StatusTemplate
      code="500"
      title="Something went wrong"
      description="An unexpected error occurred. You can return home or try again."
      actionLabel="Try Again"
      onAction={reset}
    />
  );
}

