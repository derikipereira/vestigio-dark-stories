import { useState } from "react";
import { MysteryCard } from "@/components/ui/mystery-card";
import { QuestionInput } from "@/components/ui/question-input";
import { AnswerBadge } from "@/components/ui/answer-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, Lightbulb } from "lucide-react";

interface Question {
  id: string;
  question: string;
  answer: "sim" | "não" | "irrelevante";
  timestamp: Date;
}

interface DetectiveViewProps {
  mystery: string;
  onSubmitQuestion: (question: string) => void;
}

export function DetectiveView({ mystery, onSubmitQuestion }: DetectiveViewProps) {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      question: "O evento aconteceu durante o dia?",
      answer: "não",
      timestamp: new Date(Date.now() - 60000)
    },
    {
      id: "2", 
      question: "Havia outras pessoas presentes?",
      answer: "sim",
      timestamp: new Date(Date.now() - 30000)
    }
  ]);

  const handleQuestionSubmit = (question: string) => {
    // Simulate answer - in real implementation this would come from the master
    const possibleAnswers: ("sim" | "não" | "irrelevante")[] = ["sim", "não", "irrelevante"];
    const randomAnswer = possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];
    
    const newQuestion: Question = {
      id: Date.now().toString(),
      question,
      answer: randomAnswer,
      timestamp: new Date()
    };

    setQuestions(prev => [...prev, newQuestion]);
    onSubmitQuestion(question);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mystery Card */}
        <div className="lg:col-span-1">
          <MysteryCard 
            mystery={mystery}
            variant="mystery"
            className="sticky top-6"
          />
          
          <Card className="mt-4 bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Lightbulb className="h-4 w-4" />
                Dicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs space-y-2">
                <p>• Faça perguntas específicas</p>
                <p>• Colabore com outros detetives</p>
                <p>• Pense fora da caixa</p>
                <p>• Conecte as pistas</p>
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Questions and Answers */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Perguntas e Respostas
                <span className="text-sm font-normal text-muted-foreground">
                  ({questions.length} perguntas)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 pr-4">
                <div className="space-y-3">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-lg bg-background/50 border border-border/30 animate-fade-in"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-foreground mb-2">
                            {q.question}
                          </p>
                          <div className="flex items-center gap-2">
                            <AnswerBadge answer={q.answer} />
                            <span className="text-xs text-muted-foreground">
                              {q.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Question Input */}
          <QuestionInput 
            onSubmit={handleQuestionSubmit}
            placeholder="Faça uma pergunta que possa ser respondida com 'sim', 'não' ou 'irrelevante'..."
          />

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm">
              Tenho a Solução
            </Button>
            <Button variant="outline" size="sm">
              Preciso de Ajuda
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}