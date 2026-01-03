"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QuestionEditor from "@/components/question-bank/QuestionEditor";
import { QuestionType } from "@prisma/client";
import {
  Library,
  Search,
  Plus,
  FileQuestion,
  Edit,
  Trash2,
  Crown,
  ArrowLeft
} from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  options?: any;
  correctAnswer: string;
  explanation?: string;
  points: number;
  order: number;
}

interface QuestionBank {
  id: string;
  subject: string;
  title: string;
  questions: Question[];
  _count: {
    questions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function QuestionBankPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<QuestionBank[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [expandedBanks, setExpandedBanks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchQuestionBanks();
    }
  }, [status, router]);

  useEffect(() => {
    filterBanks();
  }, [searchTerm, subjectFilter, questionBanks]);

  const fetchQuestionBanks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/question-bank");

      if (response.status === 403) {
        // User doesn't have access to Question Bank
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch question banks");

      const data = await response.json();
      setQuestionBanks(data);
      setFilteredBanks(data);
    } catch (error) {
      console.error("Error fetching question banks:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBanks = () => {
    let filtered = questionBanks;

    if (subjectFilter !== "all") {
      filtered = filtered.filter(bank => bank.subject === subjectFilter);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(bank =>
        bank.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBanks(filtered);
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setIsEditorOpen(true);
  };

  const handleSaveQuestion = async (questionId: string, updates: Partial<Question>) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update question");

      // Refresh question banks
      await fetchQuestionBanks();
    } catch (error) {
      console.error("Error updating question:", error);
      throw error;
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete question");

      // Refresh question banks
      await fetchQuestionBanks();
    } catch (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  };

  const toggleExpanded = (bankId: string) => {
    const newExpanded = new Set(expandedBanks);
    if (newExpanded.has(bankId)) {
      newExpanded.delete(bankId);
    } else {
      newExpanded.add(bankId);
    }
    setExpandedBanks(newExpanded);
  };

  // Get unique subjects
  const subjects = Array.from(new Set(questionBanks.map(b => b.subject)));

  // Check if user is on FREE plan
  const isFreeUser = session?.user?.plan === "FREE";
  const totalQuestions = questionBanks.reduce((sum, bank) => sum + bank._count.questions, 0);
  const questionLimit = session?.user?.plan === "PRO" ? 500 : session?.user?.plan === "PREMIUM" ? "Unlimited" : 0;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show upgrade prompt for FREE users
  if (isFreeUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="p-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Question Bank</h1>
              <p className="text-lg text-muted-foreground">
                A Pro Feature
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-4 text-left">
              <p className="text-muted-foreground">
                The Question Bank feature allows you to:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Save and organize up to 500 questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Reuse questions across multiple exams</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Edit and customize your question library</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Build exams quickly from saved questions</span>
                </li>
              </ul>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button size="lg" onClick={() => router.push("/billing/checkout?plan=PRO")}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <Library className="w-8 h-8 text-primary" />
              Question Bank
            </h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Manage your saved questions and build exams faster
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {totalQuestions} / {questionLimit === "Unlimited" ? "∞" : questionLimit} Questions
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search question banks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Question Banks List */}
      {filteredBanks.length === 0 ? (
        <Card className="p-12 text-center">
          <FileQuestion className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {questionBanks.length === 0 ? "No Question Banks Yet" : "No Results Found"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {questionBanks.length === 0
              ? "Create your first question bank by generating an exam and saving questions to your bank"
              : "Try adjusting your search or filters"}
          </p>
          {questionBanks.length === 0 && (
            <Button onClick={() => router.push("/dashboard/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Exam
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBanks.map(bank => {
            const isExpanded = expandedBanks.has(bank.id);

            return (
              <Card key={bank.id} className="p-6 space-y-4">
                {/* Bank Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">{bank.title}</h3>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{bank.subject}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {bank._count.questions} question{bank._count.questions !== 1 ? "s" : ""}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Updated {new Date(bank.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleExpanded(bank.id)}
                    variant="outline"
                  >
                    {isExpanded ? "Collapse" : "View Questions"}
                  </Button>
                </div>

                {/* Questions List */}
                {isExpanded && (
                  <div className="pt-4 border-t border-border/50 space-y-3">
                    {bank.questions.map(question => (
                      <div
                        key={question.id}
                        className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-foreground mb-2">{question.questionText}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {question.questionType.replace(/_/g, " ")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {question.points} point{question.points !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("Delete this question?")) {
                                handleDeleteQuestion(question.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Question Editor Modal */}
      <QuestionEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedQuestion(null);
        }}
        question={selectedQuestion}
        onSave={handleSaveQuestion}
        onDelete={handleDeleteQuestion}
      />
    </div>
  );
}
