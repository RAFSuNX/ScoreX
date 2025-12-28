"use client";

import { StatusTemplate } from "@/components/status/StatusTemplate";
import { useEffect, useMemo, useState } from "react";

const STATUS_MESSAGES: Record<
  string,
  { title: string; description: string }
> = {
  "400": {
    title: "Bad Request",
    description: "The request could not be understood. Please verify and try again.",
  },
  "401": {
    title: "Unauthorized",
    description: "You need to be signed in to view this page.",
  },
  "403": {
    title: "Forbidden",
    description: "You do not have permission to access this resource.",
  },
  "404": {
    title: "Page Not Found",
    description: "The page you are looking for doesn’t exist or was moved.",
  },
  "408": {
    title: "Request Timeout",
    description: "The request took too long. Please refresh and try again.",
  },
  "409": {
    title: "Conflict",
    description: "The request conflicts with existing data.",
  },
  "429": {
    title: "Too Many Requests",
    description: "You have made too many requests. Please slow down and try later.",
  },
  "500": {
    title: "Server Error",
    description: "Something went wrong on our end. Please try again later.",
  },
  "503": {
    title: "Service Unavailable",
    description: "The service is temporarily unavailable. Please try again soon.",
  },
};

interface StatusPageProps {
  params: { code: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function StatusPage({ params, searchParams }: StatusPageProps) {
  const { code } = params;

  const messageOverride =
    typeof searchParams?.message === "string"
      ? decodeURIComponent(searchParams.message)
      : undefined;

  const rawRetry =
    typeof searchParams?.retryAfter === "string"
      ? searchParams.retryAfter
      : typeof searchParams?.retry === "string"
      ? searchParams.retry
      : undefined;

  const retryAfterSeconds = rawRetry ? Math.max(0, parseInt(rawRetry, 10)) : null;
  const [initialRetryWindow, setInitialRetryWindow] = useState<number | null>(retryAfterSeconds);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(retryAfterSeconds);

  useEffect(() => {
    setInitialRetryWindow(retryAfterSeconds);
    setSecondsLeft(retryAfterSeconds);
  }, [retryAfterSeconds]);

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return prev;
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formattedCountdown = useMemo(() => {
    if (secondsLeft === null) return null;
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [secondsLeft]);

  const copy = useMemo(() => {
    return (
      STATUS_MESSAGES[code] ?? {
        title: "Unexpected Status",
        description:
          "We encountered an unexpected response. Please return home or try again.",
      }
    );
  }, [code]);

  const showTimer = code === "429" && secondsLeft !== null;
  const progressPct =
    showTimer && initialRetryWindow && initialRetryWindow > 0
      ? Math.min(100, Math.max(0, ((initialRetryWindow - secondsLeft!) / initialRetryWindow) * 100))
      : secondsLeft === 0
      ? 100
      : 0;

  return (
    <StatusTemplate
      code={code.toUpperCase()}
      title={copy.title}
      description={messageOverride ?? copy.description}
    >
      {showTimer && (
        <div className="space-y-1">
          <p>
            {secondsLeft > 0
              ? `You can retry in ${formattedCountdown}.`
              : "You can retry now."}
          </p>
          <div className="mx-auto h-1 w-48 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    </StatusTemplate>
  );
}
