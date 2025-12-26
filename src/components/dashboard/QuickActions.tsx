import { PlusCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const QuickActions = () => {
  return (
    <div className="fixed bottom-6 right-6 z-30 hidden lg:flex flex-col gap-3">
      <Button variant="hero" size="lg" className="shadow-lg group">
        <PlusCircle className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
        Create New Exam
      </Button>
      <Button variant="glass" size="lg" className="shadow-lg">
        <PlayCircle className="h-5 w-5 mr-2" />
        Continue Last Exam
      </Button>
    </div>
  );
};
