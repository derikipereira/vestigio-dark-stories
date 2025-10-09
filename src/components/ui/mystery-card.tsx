import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MysteryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  mystery?: string;
  solution?: string;
  isRevealed?: boolean;
  variant?: "mystery" | "clue" | "solution";
}

const MysteryCard = React.forwardRef<HTMLDivElement, MysteryCardProps>(
  ({ className, mystery, solution, isRevealed = false, variant = "mystery", ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <Card
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        className={cn(
          "bg-gradient-card border-border/50 shadow-mystery transition-all duration-500",
          "hover:shadow-glow hover:border-mystery-red/30",
          variant === "mystery" && !isHovered && "animate-mystery-glow",
          variant === "clue" && "border-mystery-gold/30 bg-mystery-gold/5",
          variant === "solution" && isRevealed && "border-mystery-red bg-mystery-red/10",
          className
        )}
        {...props}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center gap-2">
            {variant === "mystery" && "🔍"}
            {variant === "clue" && "💡"}
            {variant === "solution" && "🗝️"}
            {variant === "mystery" && "Mistério"}
            {variant === "clue" && "Pista"}
            {variant === "solution" && "Solução"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-foreground/90 text-sm leading-relaxed">
            {variant === "solution" && !isRevealed
              ? "A solução será revelada quando o mistério for resolvido..."
              : variant === "solution"
              ? solution
              : mystery}
          </CardDescription>
        </CardContent>
      </Card>
    );
  }
);

MysteryCard.displayName = "MysteryCard";

export { MysteryCard };