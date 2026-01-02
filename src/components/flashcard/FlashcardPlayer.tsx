"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Shuffle,
  Check,
  X,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options?: any;
  correctAnswer: string;
  explanation?: string;
  points: number;
}

interface FlashcardPlayerProps {
  questions: FlashcardQuestion[];
  examTitle: string;
  onExit: () => void;
}

export const FlashcardPlayer = ({
  questions,
  examTitle,
  onExit,
}: FlashcardPlayerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<FlashcardQuestion[]>([]);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<string>>(new Set());
  const [isShuffled, setIsShuffled] = useState(false);

  useEffect(() => {
    setShuffledQuestions(questions);
  }, [questions]);

  const currentCard = shuffledQuestions[currentIndex];
  const progress = ((currentIndex + 1) / shuffledQuestions.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(true);
  };

  const handleKnow = () => {
    if (currentCard) {
      const newKnown = new Set(knownCards);
      newKnown.add(currentCard.id);
      setKnownCards(newKnown);

      const newUnknown = new Set(unknownCards);
      newUnknown.delete(currentCard.id);
      setUnknownCards(newUnknown);

      if (currentIndex < shuffledQuestions.length - 1) {
        handleNext();
      }
    }
  };

  const handleDontKnow = () => {
    if (currentCard) {
      const newUnknown = new Set(unknownCards);
      newUnknown.add(currentCard.id);
      setUnknownCards(newUnknown);

      const newKnown = new Set(knownCards);
      newKnown.delete(currentCard.id);
      setKnownCards(newKnown);

      if (currentIndex < shuffledQuestions.length - 1) {
        handleNext();
      }
    }
  };

  const formatAnswer = (card: FlashcardQuestion) => {
    if (card.questionType === "MULTIPLE_CHOICE" && card.options) {
      const options = Array.isArray(card.options) ? card.options : [];
      return (
        <div className="space-y-2">
          <p className="text-lg font-semibold text-primary mb-3">
            Correct Answer: {card.correctAnswer}
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">All Options:</p>
            <ul className="list-disc list-inside space-y-1">
              {options.map((opt: string, idx: number) => (
                <li
                  key={idx}
                  className={cn(
                    opt === card.correctAnswer && "text-primary font-medium"
                  )}
                >
                  {opt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    return (
      <p className="text-lg font-semibold text-primary">
        Answer: {card.correctAnswer}
      </p>
    );
  };

  if (!currentCard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No questions available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {examTitle}
            </h1>
            <p className="text-sm text-muted-foreground">Flashcard Study Mode</p>
          </div>
          <Button variant="outline" onClick={onExit}>
            Exit Study Mode
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Card {currentIndex + 1} of {shuffledQuestions.length}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-green-500 flex items-center gap-1">
                <Check className="w-4 h-4" /> {knownCards.size}
              </span>
              <span className="text-red-500 flex items-center gap-1">
                <X className="w-4 h-4" /> {unknownCards.size}
              </span>
            </div>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="max-w-4xl mx-auto perspective-1000">
        <div
          className={cn(
            "relative w-full h-[500px] transition-transform duration-700 transform-style-3d cursor-pointer",
            isFlipped && "rotate-y-180"
          )}
          onClick={handleFlip}
        >
          {/* Front of Card */}
          <Card
            className={cn(
              "absolute inset-0 backface-hidden",
              "p-12 flex flex-col items-center justify-center text-center",
              "backdrop-blur-xl bg-card/60 border-border/50"
            )}
          >
            <Badge variant="secondary" className="mb-6">
              {currentCard.questionType.replace(/_/g, " ")}
            </Badge>
            <Brain className="w-16 h-16 text-primary mb-6 opacity-20" />
            <p className="text-2xl font-medium text-foreground leading-relaxed max-w-2xl">
              {currentCard.questionText}
            </p>
            <p className="text-sm text-muted-foreground mt-8">
              Click to reveal answer
            </p>
          </Card>

          {/* Back of Card */}
          <Card
            className={cn(
              "absolute inset-0 backface-hidden rotate-y-180",
              "p-12 flex flex-col justify-center",
              "backdrop-blur-xl bg-card/60 border-border/50"
            )}
          >
            <div className="space-y-6">
              {formatAnswer(currentCard)}

              {currentCard.explanation && (
                <div className="pt-6 border-t border-border/50">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Explanation:
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentCard.explanation}
                  </p>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-8 text-center">
              Click to flip back
            </p>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-4xl mx-auto mt-8">
        {/* Know/Don't Know Buttons (only show when flipped) */}
        {isFlipped && (
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="outline"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                handleDontKnow();
              }}
              className="border-red-500/50 text-red-500 hover:bg-red-500/10"
            >
              <X className="w-5 h-5 mr-2" />
              Don't Know
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                handleKnow();
              }}
              className="border-green-500/50 text-green-500 hover:bg-green-500/10"
            >
              <Check className="w-5 h-5 mr-2" />
              Know It
            </Button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(0);
              }}
              title="Restart"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShuffle}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex === shuffledQuestions.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
