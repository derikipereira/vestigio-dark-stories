import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TriviaQuestion, TriviaScore, GameSession } from '@/lib/types';
import { useGame } from '@/hooks/useGame';

interface TriviaViewProps {
  session: GameSession;
  onAnswer: (questionIndex: number, answerIndex: number) => void;
  onFinish: () => void;
  isLoading?: boolean;
}

export function TriviaView({ session, onAnswer, onFinish, isLoading }: TriviaViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const questions = session.content?.questions || [];
  const scores = session.content?.scores || [];
  const currentQuestion = questions[currentQuestionIndex];

  const totalQuestions = questions.length;
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleSelectAnswer = (index: number) => {
    if (!answered) {
      setSelectedAnswerIndex(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswerIndex !== null) {
      setAnswered(true);
      onAnswer(currentQuestionIndex, selectedAnswerIndex);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswerIndex(null);
      setAnswered(false);
    } else {
      // Quiz finished
      onFinish();
    }
  };

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Carregando pergunta...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toUpperCase()) {
      case 'EASY':
        return 'bg-green-500/20 text-green-700';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-700';
      case 'HARD':
        return 'bg-red-500/20 text-red-700';
      default:
        return 'bg-gray-500/20 text-gray-700';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🎯 Trivia</h1>
        <p className="text-lg text-muted-foreground">Teste seu conhecimento!</p>
      </div>

      {/* Scores */}
      {scores && scores.length > 0 && (
        <Card className="mb-6 bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Placar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-auto gap-4">
              {scores.map((score) => (
                <div key={score.playerId} className="text-center p-3 bg-dark/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{score.playerName}</p>
                  <p className="text-2xl font-bold text-mystery-gold">{score.totalPoints}</p>
                  <p className="text-xs text-muted-foreground">
                    {score.correctAnswers}/{score.totalQuestions}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Pergunta {currentQuestionIndex + 1} de {totalQuestions}
          </span>
          <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
            {currentQuestion.difficulty || 'NORMAL'}
          </Badge>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="bg-gradient-card border-border/50 mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            {currentQuestion.category && (
              <Badge variant="outline">{currentQuestion.category}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options && currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={answered}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswerIndex === index
                    ? 'border-mystery-red bg-mystery-red/10'
                    : 'border-border hover:border-mystery-red/50'
                } ${answered ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
              >
                <span className="text-sm">
                  <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {!answered ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswerIndex === null || isLoading}
                className="flex-1 bg-mystery-red hover:bg-mystery-red/80"
              >
                {isLoading ? 'Processando...' : 'Responder'}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="flex-1 bg-mystery-gold hover:bg-mystery-gold/80 text-black"
              >
                {currentQuestionIndex < totalQuestions - 1 ? 'Próxima Pergunta' : 'Finalizar'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <p className="text-center text-xs text-muted-foreground">
        Selecione uma opção e pressione para responder
      </p>
    </div>
  );
}
