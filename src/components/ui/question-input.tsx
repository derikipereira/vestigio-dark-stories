import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface QuestionInputProps {
  onSubmit?: (question: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const QuestionInput = React.forwardRef<HTMLDivElement, QuestionInputProps>(
  ({ className, onSubmit, disabled = false, placeholder = "Faça uma pergunta que possa ser respondida com 'sim', 'não' ou 'irrelevante'..." }, ref) => {
    const [question, setQuestion] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (question.trim() && onSubmit) {
        onSubmit(question.trim());
        setQuestion("");
      }
    };

    return (
      <div
        ref={ref}
        className={cn("flex gap-2 p-4 bg-gradient-card border border-border/50 rounded-lg", className)}
      >
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 bg-background/50 border-border/50 focus:border-mystery-red/50"
          />
          <Button
            type="submit"
            disabled={disabled || !question.trim()}
            className="bg-mystery-red hover:bg-mystery-red/80 shadow-blood"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    );
  }
);

QuestionInput.displayName = "QuestionInput";

export { QuestionInput };