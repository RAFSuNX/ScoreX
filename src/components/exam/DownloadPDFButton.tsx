"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Crown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface DownloadPDFButtonProps {
  examId: string;
}

export const DownloadPDFButton = ({ examId }: DownloadPDFButtonProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    // Check if user is PRO/PREMIUM
    if (session?.user?.plan === "FREE") {
      router.push("/billing/checkout?plan=PRO");
      return;
    }

    setIsLoading(true);

    try {
      // Open PDF export in new window
      window.open(`/api/exams/${examId}/export-pdf`, "_blank");
    } catch (error) {
      console.error("Failed to export PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFreeUser = session?.user?.plan === "FREE";

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleDownload}
      disabled={isLoading}
      className="relative group"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-5 h-5 mr-2" />
          Download PDF
          {isFreeUser && <Crown className="w-4 h-4 ml-2 text-primary" />}
        </>
      )}
    </Button>
  );
};
