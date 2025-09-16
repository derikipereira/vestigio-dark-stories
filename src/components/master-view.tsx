import { useState } from "react";
import { MysteryCard } from "@/components/ui/mystery-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Eye, EyeOff } from "lucide-react";

interface Question {
  id: string;
  question: string;
  detective: string;
  timestamp: Date;
  answered?: boolean;
}

interface MasterViewProps {
  mystery: string;
  solution: string;
}

const sampleQuestions: Question[] = [
  {
    id: "1",
    question: "O evento aconteceu durante o dia?",
    detective: "Ana",
    timestamp: new Date(Date.now() - 60000),
    answered: true
  },
  {
    id: "2",
    question: "Havia outras pessoas presentes?", 
    detective: "Carlos",
    timestamp: new Date(Date.now() - 30000),
    answered: true
  },
  {
    id: "3",
    question: "O local era público?",
    detective: "Maria",
    timestamp: new Date(),
    answered: false
  }
];

export function MasterView({ mystery, solution }: MasterViewProps) {
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);
  const [solutionVisible, setSolutionVisible] = useState(true);

  const handleAnswerQuestion = (questionId: string, answer: "sim" | "não" | "irrelevante") => {
    setQuestions(prev => 
      prev.map(q => 
        q.id === questionId ? { ...q, answered: true } : q
      )
    );
  };

  const unansweredQuestions = questions.filter(q => !q.answered);
  const answeredQuestions = questions.filter(q => q.answered);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mystery and Solution */}
        <div className="lg:col-span-1 space-y-4">
          <MysteryCard 
            mystery={mystery}
            variant="mystery"
          />
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSolutionVisible(!solutionVisible)}
              className="absolute top-2 right-2 z-10"
            >
              {solutionVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <MysteryCard 
              mystery={mystery}
              solution={solution}
              isRevealed={solutionVisible}
              variant="solution"
              className={solutionVisible ? "" : "blur-sm"}
            />
          </div>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Detetives Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Ana</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Carlos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Maria</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions Management */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pending Questions */}
          {unansweredQuestions.length > 0 && (
            <Card className="bg-gradient-card border-mystery-red/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-mystery-red">
                  <MessageSquare className="h-5 w-5" />
                  Perguntas Pendentes
                  <Badge variant="destructive" className="ml-auto">
                    {unansweredQuestions.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unansweredQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-lg bg-background/50 border border-border/30"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <p className="text-sm text-foreground mb-1">
                            {q.question}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{q.detective}</span>
                            <span>•</span>
                            <span>{q.timestamp.toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAnswerQuestion(q.id, "sim")}
                          className="text-green-400 border-green-600/30 hover:bg-green-600/20"
                        >
                          SIM
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAnswerQuestion(q.id, "não")}
                          className="text-red-400 border-red-600/30 hover:bg-red-600/20"
                        >
                          NÃO
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAnswerQuestion(q.id, "irrelevante")}
                          className="text-yellow-400 border-yellow-600/30 hover:bg-yellow-600/20"
                        >
                          IRRELEVANTE
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Answered Questions */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Histórico de Perguntas
                <span className="text-sm font-normal text-muted-foreground">
                  ({answeredQuestions.length} respondidas)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 pr-4">
                <div className="space-y-3">
                  {answeredQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-lg bg-background/30 border border-border/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">
                            {q.question}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{q.detective}</span>
                            <span>•</span>
                            <span>{q.timestamp.toLocaleTimeString()}</span>
                            <Badge variant="outline" className="ml-auto">
                              Respondida
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}