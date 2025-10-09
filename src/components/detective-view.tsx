import { MysteryCard } from "@/components/ui/mystery-card";
import { QuestionInput } from "@/components/ui/question-input";
import { AnswerBadge } from "@/components/ui/answer-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { Move } from "@/lib/types";

interface DetectiveViewProps {
  mystery: string;
  moves: Move[];
  onSubmitQuestion: (question: string) => void;
}

export function DetectiveView({ mystery, moves, onSubmitQuestion }: DetectiveViewProps) {

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MysteryCard 
            mystery={mystery}
            variant="mystery"
            className="sticky top-6"
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Perguntas e Respostas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 pr-4">
                <div className="space-y-3">
                  {moves.map((move) => (
                    <div key={move.id} className="p-3 rounded-lg bg-background/50 border border-border/30">
                      <p className="text-sm text-foreground mb-2">{move.question}</p>
                      <div className="flex items-center gap-2">
                        {move.answer ? (
                            <AnswerBadge answer={move.answer.toLowerCase() as "sim" | "não" | "irrelevante"} />
                        ) : (
                            <span className="text-xs text-yellow-400">Pendente...</span>
                        )}
                        <span className="text-xs text-muted-foreground">{new Date(move.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          <QuestionInput 
            onSubmit={onSubmitQuestion}
            placeholder="Faça uma pergunta que possa ser respondida com 'sim', 'não' ou 'irrelevante'..."
          />
        </div>
      </div>
    </div>
  );
}