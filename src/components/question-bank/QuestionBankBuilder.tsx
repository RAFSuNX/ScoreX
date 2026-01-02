"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileQuestion, CheckSquare, Square, ArrowRight } from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  points: number;
}

interface QuestionBank {
  id: string;
  subject: string;
  title: string;
  questions: Question[];
  _count: {
    questions: number;
  };
}

interface QuestionBankBuilderProps {
  onSelectQuestions: (questionIds: string[]) => void;
  onCancel: () => void;
}

const QuestionBankBuilder = ({
  onSelectQuestions,
  onCancel,
}: QuestionBankBuilderProps) => {
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<QuestionBank[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [expandedBanks, setExpandedBanks] = useState<Set<string>>(new Set());

  // Fetch question banks on mount
  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  // Filter banks when search or subject filter changes
  useEffect(() => {
    filterBanks();
  }, [searchTerm, subjectFilter, questionBanks]);

  const fetchQuestionBanks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/question-bank");
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

    // Filter by subject
    if (subjectFilter !== "all") {
      filtered = filtered.filter(bank => bank.subject === subjectFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(bank =>
        bank.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBanks(filtered);
  };

  const toggleQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const toggleBank = (bankId: string) => {
    const bank = questionBanks.find(b => b.id === bankId);
    if (!bank) return;

    const bankQuestionIds = bank.questions.map(q => q.id);
    const allSelected = bankQuestionIds.every(id => selectedQuestions.has(id));

    const newSelected = new Set(selectedQuestions);
    if (allSelected) {
      // Deselect all from this bank
      bankQuestionIds.forEach(id => newSelected.delete(id));
    } else {
      // Select all from this bank
      bankQuestionIds.forEach(id => newSelected.add(id));
    }
    setSelectedQuestions(newSelected);
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

  const handleContinue = () => {
    onSelectQuestions(Array.from(selectedQuestions));
  };

  // Get unique subjects
  const subjects = Array.from(new Set(questionBanks.map(b => b.subject)));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Build Exam from Question Bank</h2>
        <p className="text-muted-foreground">
          Select questions from your saved question banks to create a new exam
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search question banks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-48">
          <Label htmlFor="subject" className="sr-only">Subject</Label>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger id="subject">
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
      </div>

      {/* Selected Count */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          <span className="font-medium">
            {selectedQuestions.size} question{selectedQuestions.size !== 1 ? "s" : ""} selected
          </span>
        </div>
        {selectedQuestions.size > 0 && (
          <Button
            onClick={() => setSelectedQuestions(new Set())}
            variant="ghost"
            size="sm"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Question Banks List */}
      <ScrollArea className="h-[400px] rounded-xl border border-border/50 bg-card/50 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-muted-foreground">Loading question banks...</div>
          </div>
        ) : filteredBanks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <FileQuestion className="w-12 h-12 text-muted-foreground mb-2" />
            <div className="text-muted-foreground">No question banks found</div>
            <p className="text-sm text-muted-foreground mt-1">
              Create a question bank first or adjust your filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBanks.map(bank => {
              const isExpanded = expandedBanks.has(bank.id);
              const bankQuestionIds = bank.questions.map(q => q.id);
              const selectedCount = bankQuestionIds.filter(id => selectedQuestions.has(id)).length;
              const allSelected = selectedCount === bank.questions.length;

              return (
                <Card key={bank.id} className="p-4 space-y-3">
                  {/* Bank Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleBank(bank.id)}
                          className="flex-shrink-0"
                        >
                          {allSelected ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : selectedCount > 0 ? (
                            <Square className="w-5 h-5 text-primary fill-primary/20" />
                          ) : (
                            <Square className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                        <div>
                          <h3 className="font-semibold text-foreground">{bank.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{bank.subject}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {bank._count.questions} question{bank._count.questions !== 1 ? "s" : ""}
                            </span>
                            {selectedCount > 0 && (
                              <span className="text-sm text-primary font-medium">
                                ({selectedCount} selected)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => toggleExpanded(bank.id)}
                      variant="ghost"
                      size="sm"
                    >
                      {isExpanded ? "Collapse" : "Expand"}
                    </Button>
                  </div>

                  {/* Questions List */}
                  {isExpanded && (
                    <div className="pl-8 space-y-2 border-l-2 border-border/50">
                      {bank.questions.map(question => (
                        <div
                          key={question.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => toggleQuestion(question.id)}
                        >
                          <Checkbox
                            checked={selectedQuestions.has(question.id)}
                            onCheckedChange={() => toggleQuestion(question.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-foreground line-clamp-2">
                              {question.questionText}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {question.questionType.replace(/_/g, " ")}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {question.points} point{question.points !== 1 ? "s" : ""}
                              </span>
                            </div>
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
      </ScrollArea>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleContinue}
          disabled={selectedQuestions.size === 0}
          className="flex-1"
        >
          Continue with {selectedQuestions.size} Question{selectedQuestions.size !== 1 ? "s" : ""}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default QuestionBankBuilder;
