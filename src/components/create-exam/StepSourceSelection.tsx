import { useState, useRef } from "react";
import { FileUp, Edit3, X, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepSourceSelectionProps {
  onNext: (data: { sourceType: "pdf" | "topic"; file?: File; topic?: string }) => void;
}

export const StepSourceSelection = ({ onNext }: StepSourceSelectionProps) => {
  const [sourceType, setSourceType] = useState<"pdf" | "topic" | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [topic, setTopic] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }
    setFile(selectedFile);
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) clearInterval(interval);
    }, 100);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      handleFileSelect(droppedFile);
    }
  };

  const canProceed =
    (sourceType === "pdf" && file && uploadProgress === 100) ||
    (sourceType === "topic" && topic.trim().length >= 10);

  const handleNext = () => {
    if (sourceType === "pdf" && file) {
      onNext({ sourceType: "pdf", file });
    } else if (sourceType === "topic" && topic) {
      onNext({ sourceType: "topic", topic });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Choose Your Study Material
        </h2>
        <p className="text-muted-foreground">
          Upload a PDF or describe the topic you want to study
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option A: Upload PDF */}
        <div
          onClick={() => setSourceType("pdf")}
          className={`morphic-card p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden ${
            sourceType === "pdf"
              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
              : ""
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
            <FileUp className="w-full h-full text-primary" strokeWidth={0.5} />
          </div>
          <div className="mb-4 relative">
            <h3 className="font-bold text-foreground">Upload PDF</h3>
            <p className="text-sm text-muted-foreground">Max 10MB</p>
          </div>

          {sourceType === "pdf" && (
            <div className="space-y-4 animate-fade-in">
              {!file ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drop your PDF here or{" "}
                    <span className="text-primary font-medium">click to browse</span>
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />
                </div>
              ) : (
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary flex-shrink-0" strokeWidth={2} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setUploadProgress(0);
                      }}
                      className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {uploadProgress < 100 && (
                    <div className="mt-3">
                      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Option B: Describe Topic */}
        <div
          onClick={() => setSourceType("topic")}
          className={`morphic-card p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden ${
            sourceType === "topic"
              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
              : ""
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
            <Edit3 className="w-full h-full text-primary" strokeWidth={0.5} />
          </div>
          <div className="mb-4 relative">
            <h3 className="font-bold text-foreground">Describe Topic</h3>
            <p className="text-sm text-muted-foreground">Write what to study</p>
          </div>

          {sourceType === "topic" && (
            <div className="space-y-2 animate-fade-in">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value.slice(0, 1000))}
                onClick={(e) => e.stopPropagation()}
                placeholder="Describe the topic you want to study... (e.g., 'Pythagorean theorem in geometry' or 'World War II timeline')"
                className="w-full h-32 p-4 bg-muted/30 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground text-right">
                {topic.length}/1000
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="hero"
          size="lg"
          disabled={!canProceed}
          onClick={handleNext}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};
