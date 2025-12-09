import { MysteryCard } from "@/components/ui/mystery-card";
import { QuestionInput } from "@/components/ui/question-input";
import { AnswerBadge } from "@/components/ui/answer-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { GameSession, Move } from "@/lib/types";

interface DetectiveViewProps {
  session: GameSession;
  onAskQuestion: (question: string) => void;
  onFinish?: () => void;
  isLoading?: boolean;
  isConnected?: boolean;
}

export function DetectiveView({ session, onAskQuestion, onFinish, isLoading, isConnected }: DetectiveViewProps) {
  const mystery = session?.story?.enigmaticSituation || session?.content?.story?.enigmaticSituation || "Carregando mistério...";
  const moves = (session?.moves as Move[]) || [];

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
                  {moves.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma pergunta ainda. Seja o primeiro a perguntar!
                    </p>
                  ) : (
                    moves.map((move) => (
                      <div key={move.id} className="p-3 rounded-lg bg-background/50 border border-border/30">
                        <p className="text-sm text-foreground mb-2">{move.question || move.questionText || move.text}</p>
                        <div className="flex items-center gap-2">
                          {move.answer ? (
                              <AnswerBadge answer={move.answer.toLowerCase() as "sim" | "não" | "irrelevante"} />
                          ) : (
                              <span className="text-xs text-yellow-400">Pendente...</span>
                          )}
                          {move.createdAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(move.createdAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          <QuestionInput 
            onSubmit={onAskQuestion}
            disabled={isLoading}
            placeholder="Faça uma pergunta que possa ser respondida com 'sim', 'não' ou 'irrelevante'..."
          />
        </div>
      </div>
    </div>
  );
}