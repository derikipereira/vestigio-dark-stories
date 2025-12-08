import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HangmanGameState, GameSession } from '@/lib/types';

interface HangmanViewProps {
  session: GameSession;
  onGuessLetter: (letter: string) => void;
  onRevealHint: () => void;
  onFinish: () => void;
  isLoading?: boolean;
}

const HANGMAN_STAGES = [
  `
    ------
    |    |
    
    
    
    
  `,
  `
    ------
    |    |
    O
    
    
    
  `,
  `
    ------
    |    |
    O
    |
    
    
  `,
  `
    ------
    |    |
    O
   /|
    
    
  `,
  `
    ------
    |    |
    O
   /|\\
    
    
  `,
  `
    ------
    |    |
    O
   /|\\
    /
    
  `,
  `
    ------
    |    |
    O
   /|\\
    / \\
    
  `,
];

export function HangmanView({ session, onGuessLetter, onRevealHint, onFinish, isLoading }: HangmanViewProps) {
  const [letterInput, setLetterInput] = useState('');
  const [revealedLetters, setRevealedLetters] = useState<Set<string>>(new Set());

  const hangmanState = session.content?.hangmanState;
  
  if (!hangmanState) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Carregando jogo...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const wrongGuesses = hangmanState.wrongGuessCount || 0;
  const maxWrongs = hangmanState.maxWrongGuesses || 6;
  const hangmanStage = HANGMAN_STAGES[Math.min(wrongGuesses, HANGMAN_STAGES.length - 1)];
  const isGameOver = hangmanState.isGameOver;
  const isGameWon = hangmanState.isGameWon;
  const revealedWord = hangmanState.revealedLetters?.join('') || '';

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const guessedLetters = hangmanState.guessedLetters || [];

  const handleGuess = (letter: string) => {
    if (!guessedLetters.includes(letter) && !isGameOver) {
      onGuessLetter(letter);
      setLetterInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const letter = letterInput.toUpperCase();
      if (letter && /^[A-Z]$/.test(letter)) {
        handleGuess(letter);
      }
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toUpperCase()) {
      case 'EASY':
      case 'FACIL':
        return 'text-green-500';
      case 'MEDIUM':
      case 'MEDIO':
        return 'text-yellow-500';
      case 'HARD':
      case 'DIFICIL':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🔤 Hangman</h1>
        <p className="text-lg text-muted-foreground">Adivinhe a palavra!</p>
      </div>

      {/* Game Status */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Erros Restantes</p>
            <p className={`text-3xl font-bold ${wrongGuesses >= maxWrongs ? 'text-red-500' : 'text-mystery-gold'}`}>
              {maxWrongs - wrongGuesses}/{maxWrongs}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Dificuldade</p>
            <p className={`text-2xl font-bold ${getDifficultyColor(hangmanState.difficulty)}`}>
              {hangmanState.difficulty || 'NORMAL'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hangman Drawing */}
      <Card className="bg-gradient-card border-border/50 mb-6">
        <CardContent className="pt-6">
          <pre className="font-mono text-sm text-center text-white overflow-x-auto">
            {hangmanStage}
          </pre>
        </CardContent>
      </Card>

      {/* Word Display */}
      <Card className="bg-gradient-card border-border/50 mb-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl tracking-widest font-mono">
            {revealedWord || hangmanState.word?.split('').map(() => '_').join('') || '_ _ _'}
          </CardTitle>
        </CardHeader>
        {hangmanState.hint && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-mystery-gold">Dica:</span> {hangmanState.hint}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Guessed Letters */}
      <Card className="bg-gradient-card border-border/50 mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Letras Adivinhas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {guessedLetters.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma letra adivinhada ainda</p>
            ) : (
              guessedLetters.map((letter) => {
                const isCorrect = hangmanState.word && hangmanState.word.includes(letter);
                return (
                  <Badge key={letter} variant={isCorrect ? 'default' : 'destructive'}>
                    {letter}
                  </Badge>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Input & Actions */}
      {!isGameOver ? (
        <Card className="bg-gradient-card border-border/50 mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Digite uma letra"
                  maxLength={1}
                  value={letterInput}
                  onChange={(e) => setLetterInput(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="uppercase"
                />
                <Button
                  onClick={() => {
                    if (letterInput && /^[A-Z]$/.test(letterInput)) {
                      handleGuess(letterInput);
                    }
                  }}
                  disabled={isLoading || !letterInput || !/^[A-Z]$/.test(letterInput)}
                  className="bg-mystery-red hover:bg-mystery-red/80"
                >
                  {isLoading ? 'Processando...' : 'Adivinhar'}
                </Button>
              </div>

              {/* Letter Grid */}
              <div className="grid grid-cols-6 gap-2">
                {alphabet.map((letter) => (
                  <Button
                    key={letter}
                    onClick={() => handleGuess(letter)}
                    disabled={guessedLetters.includes(letter) || isGameOver || isLoading}
                    variant="outline"
                    size="sm"
                    className={`${
                      guessedLetters.includes(letter) ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    {letter}
                  </Button>
                ))}
              </div>

              <Button
                onClick={onRevealHint}
                variant="secondary"
                className="w-full"
                disabled={!hangmanState.hint || isLoading}
              >
                💡 Revelador de Dica
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={`${isGameWon ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} mb-6`}>
          <CardContent className="pt-6">
            <p className={`text-center text-2xl font-bold mb-4 ${isGameWon ? 'text-green-500' : 'text-red-500'}`}>
              {isGameWon ? '🎉 Você venceu!' : '💀 Game Over!'}
            </p>
            <p className="text-center text-white mb-4">
              A palavra era: <span className="font-bold text-mystery-gold">{hangmanState.word}</span>
            </p>
            <Button
              onClick={onFinish}
              className="w-full bg-mystery-gold hover:bg-mystery-gold/80 text-black"
            >
              Voltar ao Lobby
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <p className="text-center text-xs text-muted-foreground">
        Adivinhe as letras para descobrir a palavra antes do jogo acabar
      </p>
    </div>
  );
}
