"use client";

import { StatusTemplate } from "@/components/status/StatusTemplate";

export default function NotFound() {
  return (
    <StatusTemplate
      code="404"
      title="Page Not Found"
      description="The page you are trying to reach doesn’t exist or may have been moved."
      secondaryAction={{ label: "Back to Home", href: "/" }}
    />
  );
}

