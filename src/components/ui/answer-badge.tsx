import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AnswerBadgeProps {
  answer: "sim" | "não" | "irrelevante";
  variant?: "default" | "glow";
  className?: string;
}

const AnswerBadge = React.forwardRef<HTMLDivElement, AnswerBadgeProps>(
  ({ className, answer, variant = "default" }, ref) => {
    const getAnswerStyles = () => {
      switch (answer) {
        case "sim":
          return "bg-green-600/20 text-green-400 border-green-600/30";
        case "não":
          return "bg-red-600/20 text-red-400 border-red-600/30";
        case "irrelevante":
          return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
        default:
          return "bg-muted text-muted-foreground";
      }
    };

    return (
      <Badge
        className={cn(
          "px-3 py-1 text-xs font-medium border",
          getAnswerStyles(),
          variant === "glow" && "shadow-glow",
          className
        )}
      >
        {answer.toUpperCase()}
      </Badge>
    );
  }
);

AnswerBadge.displayName = "AnswerBadge";

export { AnswerBadge };