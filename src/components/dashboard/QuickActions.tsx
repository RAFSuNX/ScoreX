"use client";

import { PlusCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

export const QuickActions = () => {
  const [inProgressExamId, setInProgressExamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInProgressExam = async () => {
      try {
        const response = await axios.get('/api/exams/in-progress');
        setInProgressExamId(response.data.examId);
      } catch {
        // console.error("No in-progress exam found or failed to fetch:", error);
        setInProgressExamId(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInProgressExam();
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-30 hidden lg:flex flex-col gap-3">
      <Link href="/dashboard/create">
        <Button variant="hero" size="lg" className="shadow-lg group">
          <PlusCircle className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Create New Exam
        </Button>
      </Link>
      <Link href={inProgressExamId ? `/dashboard/exam/${inProgressExamId}` : '#'} passHref>
        <Button
          variant="glass"
          size="lg"
          className="shadow-lg"
          disabled={!inProgressExamId || isLoading}
        >
          {isLoading ? (
            <Skeleton className="h-5 w-40" />
          ) : (
            <>
              <PlayCircle className="h-5 w-5 mr-2" />
              Continue Last Exam
            </>
          )}
        </Button>
      </Link>
    </div>
  );
};
