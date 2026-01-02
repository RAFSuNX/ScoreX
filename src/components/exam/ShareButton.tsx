"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  examId: string;
  examTitle: string;
}

export const ShareButton = ({ examId, examTitle }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/dashboard/exam/${examId}/overview`;

    try {
      // Try to use the Web Share API if available (mobile devices)
      if (navigator.share) {
        await navigator.share({
          title: `${examTitle} - ScoreX`,
          text: `Check out this exam on ScoreX`,
          url: shareUrl,
        });
      } else {
        // Fall back to copying to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleShare}
      disabled={copied}
    >
      {copied ? (
        <>
          <Check className="w-5 h-5 mr-2" />
          Link Copied!
        </>
      ) : (
        <>
          <Share2 className="w-5 h-5 mr-2" />
          Share Link
        </>
      )}
    </Button>
  );
};
