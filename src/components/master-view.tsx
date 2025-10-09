import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare } from "lucide-react";
import { Move, Player, AnswerType } from "@/lib/types"; // Importe os tipos reais

// A interface de props agora reflete os dados e ações reais
interface MasterViewProps {
  mystery: string;
  solution: string;
  moves: Move[];
  players: Player[];
  onAnswer: (moveId: number, answer: AnswerType) => void;
}

export function MasterView({ mystery, solution, moves, players, onAnswer }: MasterViewProps) {
  // REMOVEMOS o 'useState' com 'sampleQuestions'. A lógica agora vem das props.
  const unansweredQuestions = moves.filter(move => !move.answer);
  const answeredQuestions = moves.filter(move => !!move.answer);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coluna da Esquerda (Mistério, Solução, Jogadores) */}
        <div className="lg:col-span-1 space-y-4">
            {/* ... componentes MysteryCard para 'mystery' e 'solution' ... */}
            <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" /> Detetives Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {players.map(player => (
                            <div key={player.id} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm">{player.username}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Coluna da Direita (Perguntas) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Perguntas Pendentes */}
          {unansweredQuestions.length > 0 && (
            <Card className="bg-gradient-card border-mystery-red/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-mystery-red">
                  <MessageSquare className="h-5 w-5" /> Perguntas Pendentes
                  <Badge variant="destructive" className="ml-auto">{unansweredQuestions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unansweredQuestions.map((move) => (
                    <div key={move.id} className="p-3 rounded-lg bg-background/50 border border-border/30">
                      <p className="text-sm text-foreground mb-1">{move.question}</p>
                      <div className="text-xs text-muted-foreground mb-3">por {move.author.username}</div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => onAnswer(move.id, 'SIM')}>SIM</Button>
                        <Button size="sm" variant="outline" onClick={() => onAnswer(move.id, 'NAO')}>NÃO</Button>
                        <Button size="sm" variant="outline" onClick={() => onAnswer(move.id, 'IRRELEVANTE')}>IRRELEVANTE</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Histórico de Perguntas */}
          <Card className="bg-gradient-card border-border/50">
              {/* ... renderize as 'answeredQuestions' aqui ... */}
          </Card>
        </div>
      </div>
    </div>
  );
}