import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Settings, Zap, BookOpen } from "lucide-react";
import { GameType } from "@/lib/types";

interface GameLobbyProps {
  roomCode: string;
  isCreating: boolean;
  selectedGameType: GameType | null;
  onGameTypeSelect: (type: GameType) => void;
  onRoomCodeChange: (code: string) => void;
  onJoinGame: () => void;
  onOpenCreateModal: () => void;
}

export function GameLobby({
  roomCode,
  isCreating,
  selectedGameType,
  onGameTypeSelect,
  onRoomCodeChange,
  onJoinGame,
  onOpenCreateModal,
}: GameLobbyProps) {
  const gameTypes: Array<{ type: GameType; label: string; icon: React.ReactNode; description: string }> = [
    {
      type: 'VESTIGIO',
      label: 'Vestigio',
      icon: '🔍',
      description: 'Desvende mistérios com perguntas estratégicas'
    },
    {
      type: 'TRIVIA',
      label: 'Trivia',
      icon: '🎯',
      description: 'Teste seu conhecimento com perguntas múltipla escolha'
    },
    {
      type: 'HANGMAN',
      label: 'Hangman',
      icon: '🔤',
      description: 'Adivinhe a palavra antes de perder'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-mystery-red mb-2 animate-mystery-glow">
          🎮 Vestigio Dark Stories
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Escolha um jogo e convide seus amigos para uma aventura misteriosamente divertida
        </p>
      </div>

      {/* Game Type Selection */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-mystery-gold">Escolha um Jogo</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {gameTypes.map((game) => (
            <Card
              key={game.type}
              onClick={() => onGameTypeSelect(game.type)}
              className={`cursor-pointer transition-all ${
                selectedGameType === game.type
                  ? 'border-mystery-red border-2 bg-mystery-red/10 shadow-glow'
                  : 'border-border/50 bg-gradient-card hover:border-mystery-red/50'
              }`}
            >
              <CardHeader>
                <CardTitle className="text-2xl text-center mb-2">{game.icon}</CardTitle>
                <CardTitle className="text-center text-mystery-red">{game.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">{game.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedGameType && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card for Creating a Game (Master) */}
          <Card className="bg-gradient-card border-border/50 shadow-mystery hover:shadow-glow transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-mystery-red">
                <Settings className="h-5 w-5" />
                Criar Jogo (Ser Mestre)
              </CardTitle>
              <CardDescription>
                Crie uma sala e convide seus amigos para jogar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Você será o mestre do jogo. Prepare-se para desafiar seus amigos!
              </p>
              <Button
                onClick={onOpenCreateModal}
                disabled={isCreating}
                className="w-full bg-mystery-red hover:bg-mystery-red/80 shadow-blood"
              >
                {isCreating ? "Criando sala..." : "Criar Sala"}
              </Button>
            </CardContent>
          </Card>

          {/* Card for Joining a Game (Detective/Player) */}
          <Card className="bg-gradient-card border-border/50 shadow-mystery hover:shadow-glow transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-mystery-gold">
                <Eye className="h-5 w-5" />
                Entrar em um Jogo
              </CardTitle>
              <CardDescription>
                Use o código da sala para se juntar a um jogo existente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="room-code-input" className="text-sm font-medium mb-2 block">Código da Sala</Label>
              <div className="flex w-full items-center space-x-2">
                <Input
                  id="room-code-input"
                  type="text"
                  placeholder="Ex: XYZ123"
                  value={roomCode}
                  onChange={(e) => onRoomCodeChange(e.target.value)}
                  className="uppercase"
                />
                <Button onClick={onJoinGame} variant="secondary">
                  Entrar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Peça o código da sala para quem a criou
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedGameType && (
        <div className="text-center mt-10 p-6 bg-dark/50 rounded-lg border border-border/30">
          <p className="text-muted-foreground">
            👆 Selecione um jogo acima para começar
          </p>
        </div>
      )}
    </div>
  );
}